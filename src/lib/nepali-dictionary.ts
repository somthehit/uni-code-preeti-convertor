/**
 * Complete Client-Side Nepali Dictionary Engine (नेपाली बृहत् शब्दकोश)
 * Sharded JSON + IndexedDB caching + 4-Way Multi-Script Search Engine
 */

import { CORE_SEED_DICTIONARY, DictionaryEntry, NEPALI_LETTERS, NepaliLetter } from './nepali-dictionary-seed';
import { preetiToUnicode, unicodeToPreeti } from './preeti-converter';
import { transliterateRomanizedText } from './romanized-converter';

export type { DictionaryEntry, NepaliLetter };
export { NEPALI_LETTERS };

// Letter to shard index mapping
export const LETTER_INDEX_MAP: Record<string, number> = {};
NEPALI_LETTERS.forEach((l, idx) => {
  LETTER_INDEX_MAP[l] = idx;
});

// Barakhari Matra Suffixes
export const BARAKHARI_MATRAS = [
  { id: 'all', label: 'सबै', suffix: '' },
  { id: 'a', label: 'अ (मूल)', suffix: '' },
  { id: 'aa', label: 'ा (आ-कार)', suffix: 'ा' },
  { id: 'i_short', label: 'ि (ह्रस्व इ)', suffix: 'ि' },
  { id: 'i_long', label: 'ी (दीर्घ ई)', suffix: 'ी' },
  { id: 'u_short', label: 'ु (ह्रस्व उ)', suffix: 'ु' },
  { id: 'u_long', label: 'ू (दीर्घ ऊ)', suffix: 'ू' },
  { id: 'ri', label: 'ृ (ऋ-कार)', suffix: 'ृ' },
  { id: 'e', label: 'े (ए-कार)', suffix: 'े' },
  { id: 'ai', label: 'ै (ऐ-कार)', suffix: 'ै' },
  { id: 'o', label: 'ो (ओ-कार)', suffix: 'ो' },
  { id: 'au', label: 'ौ (औ-कार)', suffix: 'ौ' },
  { id: 'am', label: 'ं/ँ (शिरबिन्दु)', suffix: 'ं' },
  { id: 'halanta', label: '् (आधा अक्षर)', suffix: '्' },
];

// In-Memory cache for loaded shards
const shardMemoryCache = new Map<number, DictionaryEntry[]>();

// IndexedDB Helper
const DB_NAME = 'NepaliDictionaryDB';
const STORE_NAME = 'shards_store';

function openIndexedDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function getFromIDB(key: string): Promise<DictionaryEntry[] | null> {
  const db = await openIndexedDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function setToIDB(key: string, value: DictionaryEntry[]): Promise<void> {
  const db = await openIndexedDB();
  if (!db) return;
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(value, key);
  } catch { }
}

/**
 * Fetch a specific letter shard with IndexedDB caching
 */
export async function loadLetterShard(letter: NepaliLetter): Promise<DictionaryEntry[]> {
  const shardIdx = LETTER_INDEX_MAP[letter];
  if (shardIdx === undefined) return [];

  // Check in-memory cache
  if (shardMemoryCache.has(shardIdx)) {
    return shardMemoryCache.get(shardIdx)!;
  }

  // Check IndexedDB
  const idbKey = `shard_${shardIdx}`;
  const cachedInIDB = await getFromIDB(idbKey);
  if (cachedInIDB && Array.isArray(cachedInIDB) && cachedInIDB.length > 0) {
    shardMemoryCache.set(shardIdx, cachedInIDB);
    return cachedInIDB;
  }

  // Fetch from static JSON file
  try {
    const res = await fetch(`/dictionary/shards/shard_${shardIdx}.json`);
    if (res.ok) {
      const data: DictionaryEntry[] = await res.json();
      shardMemoryCache.set(shardIdx, data);
      setToIDB(idbKey, data);
      return data;
    }
  } catch (err) {
    console.warn(`Could not load shard for letter ${letter}:`, err);
  }

  // Fallback to core seed words for this letter
  const seedForLetter = CORE_SEED_DICTIONARY.filter((w) => w.word.startsWith(letter));
  shardMemoryCache.set(shardIdx, seedForLetter);
  return seedForLetter;
}

/**
 * Normalize Devanagari text for fuzzy spelling tolerance
 * (ह्रस्व-दीर्घ र श/ष/स/ब/व सहिष्णुता)
 */
export function normalizeFuzzyDevanagari(text: string): string {
  if (!text) return '';
  return text
    .replace(/[ी]/g, 'ि')
    .replace(/[ू]/g, 'ु')
    .replace(/[षश]/g, 'स')
    .replace(/[ब]/g, 'व')
    .replace(/[ण]/g, 'न')
    .replace(/[ँ]/g, 'ं')
    .replace(/[्]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Consonant skeleton without vowel matras or conjunct modifiers
 * Used for deep morphological & typo suggestion matching (e.g. समराज्य -> साम्राज्य)
 */
export function stripDevanagariMatras(text: string): string {
  if (!text) return '';
  return text
    .replace(/[ािीुूृेैोौौंँ्]/g, '')
    .replace(/[षश]/g, 'स')
    .replace(/[ब]/g, 'व')
    .replace(/[ण]/g, 'न')
    .replace(/ज्ञ/g, 'ग')
    .replace(/क्ष/g, 'छ')
    .trim()
    .toLowerCase();
}

/**
 * Fast Levenshtein distance for Devanagari strings
 */
export function levenshteinDevanagari(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Int16Array(n + 1));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

/**
 * 4-Way Multi-Script Smart Query Parser & Search
 */
export interface SearchResult {
  entries: DictionaryEntry[];
  detectedScript: 'unicode' | 'preeti' | 'romanized' | 'english';
  transliteratedQuery: string;
}

export async function searchDictionary(
  query: string,
  activeLetter?: NepaliLetter,
  barakhariSuffix?: string
): Promise<SearchResult> {
  const raw = (query || '').trim();
  if (!raw && !activeLetter) {
    return {
      entries: CORE_SEED_DICTIONARY.slice(0, 40),
      detectedScript: 'unicode',
      transliteratedQuery: '',
    };
  }

  let detectedScript: 'unicode' | 'preeti' | 'romanized' | 'english' = 'unicode';
  let cleanQuery = raw;

  // Auto-detect query script if query provided
  if (raw) {
    const isUnicode = /[\u0900-\u097F]/.test(raw);
    if (isUnicode) {
      detectedScript = 'unicode';
      cleanQuery = raw;
    } else {
      // Check if it matches Preeti patterns (contains special preeti keys like l, f, ;, s, v, k, etc.)
      const convertedFromPreeti = preetiToUnicode(raw);
      const isPureAlpha = /^[a-zA-Z\s]+$/.test(raw);

      // If it looks like typical Preeti (e.g. lstfa, g]kfn, k|ljlw, sd{)
      if (/[;{}[\]\\÷+`F]/.test(raw) || (isPureAlpha && /^[a-z]+$/.test(raw) && convertedFromPreeti.length > 0 && /[\u0900-\u097F]/.test(convertedFromPreeti))) {
        detectedScript = 'preeti';
        cleanQuery = convertedFromPreeti;
      } else if (isPureAlpha) {
        // Test Romanized
        detectedScript = 'romanized';
        cleanQuery = transliterateRomanizedText(raw);
      } else {
        detectedScript = 'english';
        cleanQuery = raw.toLowerCase();
      }
    }
  }

  // Load pool of words: active letter shard, or search across seed + active letter
  let wordPool: DictionaryEntry[] = [];
  if (activeLetter) {
    wordPool = await loadLetterShard(activeLetter);
  } else {
    // If no letter selected but user typed a query, find candidate starting letter
    if (cleanQuery && /[\u0900-\u097F]/.test(cleanQuery)) {
      const firstChar = cleanQuery[0];
      const matchedLetter = NEPALI_LETTERS.find((l) => l === firstChar || cleanQuery.startsWith(l)) || 'अ';
      wordPool = await loadLetterShard(matchedLetter as NepaliLetter);
    } else {
      wordPool = CORE_SEED_DICTIONARY;
    }
  }

  // Also include user custom added words from localStorage
  try {
    const customWordsJson = localStorage.getItem('uni_custom_words');
    if (customWordsJson) {
      const customWords: DictionaryEntry[] = JSON.parse(customWordsJson);
      wordPool = [...customWords, ...wordPool];
    }
  } catch { }

  // Apply Barakhari Sub-Filter if specified
  if (activeLetter && barakhariSuffix && barakhariSuffix !== 'all') {
    if (barakhariSuffix === 'halanta') {
      wordPool = wordPool.filter((e) => e.word.startsWith(activeLetter + '्'));
    } else if (barakhariSuffix === 'a') {
      // Raw consonant without matra
      wordPool = wordPool.filter((e) => {
        if (!e.word.startsWith(activeLetter)) return false;
        const secondChar = e.word[activeLetter.length];
        return !secondChar || !/[ािीुूृेैोौंँ्]/.test(secondChar);
      });
    } else {
      wordPool = wordPool.filter((e) => e.word.startsWith(activeLetter + barakhariSuffix));
    }
  }

  // If no search query, return the pool
  if (!cleanQuery) {
    return {
      entries: wordPool.slice(0, 100),
      detectedScript,
      transliteratedQuery: cleanQuery,
    };
  }

  const fuzzyQuery = normalizeFuzzyDevanagari(cleanQuery);

  // Score & Filter
  const scored = wordPool
    .map((entry) => {
      let score = 0;
      const w = entry.word;
      const fuzzyWord = normalizeFuzzyDevanagari(w);

      if (w === cleanQuery) score += 100;
      else if (w.startsWith(cleanQuery)) score += 50;
      else if (w.includes(cleanQuery)) score += 20;

      if (fuzzyWord === fuzzyQuery) score += 40;
      else if (fuzzyWord.startsWith(fuzzyQuery)) score += 25;

      // Check definitions
      const inDef = entry.definitions.some((d) => d.includes(cleanQuery) || (detectedScript === 'english' && d.toLowerCase().includes(cleanQuery)));
      if (inDef) score += 15;

      return { entry, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.entry);

  return {
    entries: scored.slice(0, 60),
    detectedScript,
    transliteratedQuery: cleanQuery,
  };
}

/**
 * Word of the Day Generator
 * Returns a rich, authentic Nepali word with full definitions.
 * Guarantees a fresh, different word every time by excluding current word.
 */
export function getWordOfTheDay(excludeWord?: string): DictionaryEntry {
  const pool = CORE_SEED_DICTIONARY.filter(
    (w) => w.definitions && w.definitions.length > 0 && w.word && w.word.trim().length > 1
  );
  if (pool.length === 0) return CORE_SEED_DICTIONARY[0];

  const filtered = excludeWord ? pool.filter((w) => w.word !== excludeWord && w.id !== excludeWord) : pool;
  const targetPool = filtered.length > 0 ? filtered : pool;
  const randomIndex = Math.floor(Math.random() * targetPool.length);
  return targetPool[randomIndex];
}

/**
 * Authentic Nepali Proverbs & Idioms (उखान-टुक्का र वाग्धारा)
 */
export interface NepaliProverb {
  id: string;
  proverb: string;
  preeti: string;
  meaning: string;
  example: string;
  category: 'नैतिकता' | 'अनुभव' | 'व्यंग्य' | 'जीवन';
}

export const NEPALI_PROVERBS: NepaliProverb[] = [
  {
    id: 'p1',
    proverb: 'अकबरी सुनलाई कसी लगाउनु पर्दैन',
    preeti: unicodeToPreeti('अकबरी सुनलाई कसी लगाउनु पर्दैन'),
    meaning: 'असल र प्रमाणित व्यक्ति वा कुराको सत्यता प्रमाणित गर्न जाँचबुझ गरिरहनु पर्दैन।',
    example: 'उनी जत्तिको इमानदार हाकिमलाई शंका गर्नु बेकार छ, अकबरी सुनलाई कसी लगाउनु पर्दैन।',
    category: 'अनुभव',
  },
  {
    id: 'p2',
    proverb: 'आफ्नो थैलीको मुख बलियो गर्नु, अरुलाई चोर नलगाउनु',
    preeti: unicodeToPreeti('आफ्नो थैलीको मुख बलियो गर्नु, अरुलाई चोर नलगाउनु'),
    meaning: 'आफ्नो सामानको रक्षा आफैँले सतर्क भएर गर्नुपर्छ, अरूलाई बिनाकारण दोष दिनु हुँदैन।',
    example: 'घरमा ताल्चा नलगाई हिँड्ने अनि सामान हरायो भन्नु भएन, आफ्नो थैलीको मुख बलियो गर्नु नि!',
    category: 'नैतिकता',
  },
  {
    id: 'p3',
    proverb: 'घाँटी हेरी हाड निल्नु',
    preeti: unicodeToPreeti('घाँटी हेरी हाड निल्नु'),
    meaning: 'आफ्नो हैसियत, क्षमता र आम्दानी अनुसार मात्र खर्च वा काम गर्नुपर्छ।',
    example: 'ऋण काढेर ठूलो भोजभतेर गर्नु राम्रो होइन, सधैँ घाँटी हेरी हाड निल्नुपर्छ।',
    category: 'जीवन',
  },
  {
    id: 'p4',
    proverb: 'काम पाउनेले काम गर्छ, नपाउनेले कुरा काट्छ',
    preeti: unicodeToPreeti('काम पाउनेले काम गर्छ, नपाउनेले कुरा काट्छ'),
    meaning: 'मेहनती मानिस काममा व्यस्त हुन्छ भने अल्छी मानिस अरूको आलोचना गरेर समय फाल्छ।',
    example: 'अरूको कुरा सुनेर आफ्नो काम नछोड, काम पाउनेले काम गर्छ, नपाउनेले कुरा काट्छ।',
    category: 'व्यंग्य',
  },
  {
    id: 'p5',
    proverb: 'हुने बिरुवाको चिल्लो पात',
    preeti: unicodeToPreeti('हुने बिरुवाको चिल्लो पात'),
    meaning: 'भविष्यमा सफल र होनहार हुने व्यक्तिका लक्षण बाल्यकालमै प्रस्ट देखिन्छन्।',
    example: 'सानी नानीले अहिले नै यति राम्रो चित्र कोर्छिन्, हुने बिरुवाको चिल्लो पात भनेको यही हो।',
    category: 'अनुभव',
  },
  {
    id: 'p6',
    proverb: 'जो होचो उसैको मुखमा घोचो',
    preeti: unicodeToPreeti('जो होचो उसैको मुखमा घोचो'),
    meaning: 'कमजोर, सोझो वा गरिब व्यक्तिलाई नै सबैले दबाउने र दुःख दिने गर्छन्।',
    example: 'कार्यालयमा सधैँ सोझा कर्मचारीलाई मात्रै धेरै काम थोपरिने रहेछ, जो होचो उसैको मुखमा घोचो!',
    category: 'व्यंग्य',
  },
  {
    id: 'p7',
    proverb: 'नबोल्नेको चामल पनि बिक्छ, बोल्नेको पीठो पनि बिक्दैन',
    preeti: unicodeToPreeti('नबोल्नेको चामल पनि बिक्छ, बोल्नेको पीठो पनि बिक्दैन'),
    meaning: 'व्यापार वा व्यवहारमा मिठो बोली र प्रस्तुतिका आधारमा गुणस्तर कम भए पनि सामान बिक्री हुन सक्छ।',
    example: 'व्यापार गर्न नम्र बोली चाहिन्छ, नबोल्नेको चामल पनि बिक्छ भन्छन् नि।',
    category: 'जीवन',
  },
  {
    id: 'p8',
    proverb: 'बाँदरको हातमा नरिवल',
    preeti: unicodeToPreeti('बाँदरको हातमा नरिवल'),
    meaning: 'महत्त्वपूर्ण र बहुमूल्य वस्तुको उपयोग गर्न नजान्ने व्यक्तिको हातमा पर्नु।',
    example: 'यति महँगो क्यामेरा उसलाई दिनु भनेको बाँदरको हातमा नरिवल जस्तै हो।',
    category: 'व्यंग्य',
  },
  {
    id: 'p9',
    proverb: 'हात नलागेको माछा ठूलो',
    preeti: unicodeToPreeti('हात नलागेको माछा ठूलो'),
    meaning: 'प्राप्त हुन नसकेको वा गुमेको अवसरलाई अति बढाइचढाइ सम्झने मानवीय स्वभाव।',
    example: 'छोडेको जागिरमा तलब धेरै हुन्थ्यो भन्दै पछुताउनु व्यर्थ छ, हात नलागेको माछा ठूलो हुन्छ।',
    category: 'अनुभव',
  },
  {
    id: 'p10',
    proverb: 'दुधको दुध पानीको पानी',
    preeti: unicodeToPreeti('दुधको दुध पानीको पानी'),
    meaning: 'सत्य र असत्यको निष्पक्ष रूपमा दूध र पानी जस्तै छर्लङ्ग छानबिन हुनु।',
    example: 'अदालतको निष्पक्ष फैसलापछि अन्ततः दूधको दूध पानीको पानी भएको छ।',
    category: 'नैतिकता',
  },
];

/**
 * Text-to-Speech Pronunciation for Nepali Words
 */
export function speakNepaliWord(word: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'ne-NP';
  utterance.rate = 0.85;

  // Fallback to Hindi voice if Nepali voice not installed on client OS
  const voices = window.speechSynthesis.getVoices();
  const nepaliVoice = voices.find((v) => v.lang.startsWith('ne') || v.lang.startsWith('hi'));
  if (nepaliVoice) {
    utterance.voice = nepaliVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export const COMMON_VIBHAKTI = [
  'हरूलाई', 'हरुलाई', 'हरूले', 'हरुले', 'हरूको', 'हरुको', 'हरूका', 'हरुका', 'हरूकी', 'हरुकी', 'हरूमा', 'हरुमा',
  'हरूबाट', 'हरुबाट', 'हरूसँग', 'हरुसँग', 'हरू', 'हरु',
  'लाई', 'बाट', 'देखि', 'सँग', 'सित', 'द्वारा', 'भन्दा', 'सम्म', 'तिर', 'माथि', 'तल',
  'को', 'का', 'की', 'मा', 'ले', 'नै', 'पनि', 'मात्र'
];

export const COMMON_NEPALI_WORDS = new Set([
  'म', 'हामी', 'हाम्रो', 'हाम्रा', 'हाम्री', 'मलाई', 'हामीलाई',
  'तँ', 'तिमी', 'तिम्रो', 'तिम्रा', 'तिम्री', 'तपाईं', 'तपाईंको', 'तपाईंका', 'तपाईंकी',
  'उ', 'ऊ', 'उनी', 'उनको', 'उनका', 'उनकी', 'उनीहरू', 'उहाँ', 'उहाँको',
  'यो', 'यस', 'यसको', 'यसका', 'यसकी', 'यसमा', 'यसले', 'यी', 'यीनीहरू',
  'त्यो', 'त्यस', 'त्यसको', 'त्यसका', 'त्यसकी', 'त्यसमा', 'त्यसले', 'ती', 'तीनीहरू',
  'जो', 'जस', 'जसको', 'जसले', 'जसमा', 'जे', 'जुन',
  'को', 'के', 'किन', 'कसरी', 'कहाँ', 'कहिले', 'कस्तो', 'कस्ता', 'कस्ती', 'कति',
  'छ', 'छन्', 'छिन्', 'छौ', 'छौँ', 'छु', 'हो', 'हुन्', 'होस्', 'हुनुहुन्छ',
  'थियो', 'थिए', 'थिइन्', 'थियौ', 'थिएँ',
  'भयो', 'भए', 'भइन्', 'भएको', 'भएका', 'भएकी', 'हुने', 'हुनेछ',
  'गर्यो', 'गरे', 'गरिन्', 'गरेको', 'गरेका', 'गरेकी', 'गर्न', 'गर्छ', 'गर्छन्', 'गर्ने', 'गर्नु',
  'धेरै', 'थोरै', 'अति', 'एकदम', 'धेरैजसो', 'सबै', 'प्रत्येक',
  'र', 'अनि', 'वा', 'अथवा', 'तर', 'किनभने', 'त्यसैले', 'तसर्थ', 'यद्यपि',
  'आज', 'भोलि', 'हिजो', 'अहिले', 'पछि', 'पहिले', 'सधैं', 'कहिलेकाहीँ',
  'नेपाल', 'नेपाली', 'सुन्दर', 'राम्रो', 'राम्रा', 'राम्री', 'असल'
]);

export function getWordFirstLetter(word: string): NepaliLetter {
  if (!word || typeof word !== 'string') return 'अ';
  const clean = word.trim();
  if (!clean) return 'अ';
  if (clean.startsWith('क्ष')) return 'क्ष';
  if (clean.startsWith('त्र')) return 'त्र';
  if (clean.startsWith('ज्ञ')) return 'ज्ञ';
  if (clean.startsWith('श्र')) return 'श्र';
  if (clean.startsWith('अं') || clean.startsWith('अँ')) return 'अं';
  if (clean.startsWith('अः')) return 'अः';

  const first = clean[0];
  if (NEPALI_LETTERS.includes(first as NepaliLetter)) {
    return first as NepaliLetter;
  }
  for (const v of ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ']) {
    if (clean.startsWith(v)) return v as NepaliLetter;
  }
  return 'अ';
}

export interface SpellCheckResult {
  original: string;
  isCorrect: boolean;
  suggestions: string[];
}

/**
 * Complete Spell Checker & Closest Dictionary Match Finder
 * Cross-references full 1,23,000+ words across letter shards & common inflections
 */
export async function checkSpelling(inputSentence: string): Promise<SpellCheckResult[]> {
  if (!inputSentence) return [];
  const words = inputSentence
    .split(/[\s]+/)
    .map((w) => w.trim().replace(/^[,\.।!?\-—\(\)]+|[,\.।!?\-—\(\)]+$/g, ''))
    .filter((w) => w.length > 0);

  const results: SpellCheckResult[] = [];

  for (const clean of words) {
    // Digits or pure English characters are preserved as valid
    if (/^[\d०-९]+$/.test(clean) || /^[a-zA-Z]+$/.test(clean)) {
      results.push({ original: clean, isCorrect: true, suggestions: [] });
      continue;
    }

    // 1. Direct check in COMMON_NEPALI_WORDS or CORE_SEED_DICTIONARY
    if (COMMON_NEPALI_WORDS.has(clean) || CORE_SEED_DICTIONARY.some((e) => e.word === clean)) {
      results.push({ original: clean, isCorrect: true, suggestions: [] });
      continue;
    }

    // 2. Fetch primary letter shard from public/dictionary/shards
    const primaryLetter = getWordFirstLetter(clean);
    const primaryShard = await loadLetterShard(primaryLetter);

    // Exact check in shard
    if (primaryShard.some((e) => e.word === clean)) {
      results.push({ original: clean, isCorrect: true, suggestions: [] });
      continue;
    }

    // 3. Strip vibhakti / suffix
    let matchedStem = false;
    for (const v of COMMON_VIBHAKTI) {
      if (clean.endsWith(v) && clean.length > v.length + 1) {
        const stem = clean.slice(0, clean.length - v.length);
        if (COMMON_NEPALI_WORDS.has(stem) || CORE_SEED_DICTIONARY.some((e) => e.word === stem)) {
          matchedStem = true;
          break;
        }
        const stemLetter = getWordFirstLetter(stem);
        const stemShard = stemLetter === primaryLetter ? primaryShard : await loadLetterShard(stemLetter);
        if (stemShard.some((e) => e.word === stem)) {
          matchedStem = true;
          break;
        }
      }
    }

    if (matchedStem) {
      results.push({ original: clean, isCorrect: true, suggestions: [] });
      continue;
    }

    // 4. Word is not found / misspelled -> Generate suggestions from 123,000+ words
    const candidateLetters: NepaliLetter[] = [primaryLetter];
    if (['श', 'ष', 'स'].includes(primaryLetter)) {
      candidateLetters.push('स', 'श', 'ष');
    } else if (['ब', 'व'].includes(primaryLetter)) {
      candidateLetters.push('व', 'ब');
    } else if (['ऋ', 'र'].includes(primaryLetter)) {
      candidateLetters.push('र', 'ऋ');
    } else if (['ण', 'न'].includes(primaryLetter)) {
      candidateLetters.push('न', 'ण');
    } else if (['अ', 'आ'].includes(primaryLetter)) {
      candidateLetters.push('अ', 'आ');
    } else if (['इ', 'ई', 'ए', 'ऐ'].includes(primaryLetter)) {
      candidateLetters.push('इ', 'ई', 'ए', 'ऐ');
    } else if (['उ', 'ऊ', 'ओ', 'औ'].includes(primaryLetter)) {
      candidateLetters.push('उ', 'ऊ', 'ओ', 'औ');
    } else if (primaryLetter === 'ज्ञ') {
      candidateLetters.push('ग');
    } else if (primaryLetter === 'ग') {
      candidateLetters.push('ज्ञ');
    } else if (primaryLetter === 'क्ष') {
      candidateLetters.push('छ', 'ख');
    } else if (primaryLetter === 'छ') {
      candidateLetters.push('क्ष');
    }

    if (clean.startsWith('अा')) {
      candidateLetters.push('आ');
    }

    const cleanNormalized = clean.replace(/अा/g, 'आ');
    const fuzzyTarget = normalizeFuzzyDevanagari(cleanNormalized);
    const skeletonTarget = stripDevanagariMatras(cleanNormalized);
    const scoredCandidates: { word: string; score: number }[] = [];

    // Helper to evaluate a word against target
    const evaluateWordCandidate = (w: string) => {
      if (w === clean) return;
      const lenDiff = Math.abs(w.length - cleanNormalized.length);
      const wSkel = stripDevanagariMatras(w);
      const isSkelMatch = wSkel === skeletonTarget && skeletonTarget.length >= 2;

      if (lenDiff > 3 && !isSkelMatch) return;

      const fuzzyW = normalizeFuzzyDevanagari(w);
      const dist = levenshteinDevanagari(cleanNormalized, w);

      let score = 0;
      if (w === cleanNormalized) {
        score = 1500;
      } else if (fuzzyW === fuzzyTarget) {
        score = 1200 - dist * 15;
      } else if (isSkelMatch) {
        score = 800 - dist * 20;
      } else if (dist <= 1) {
        score = 600 - dist * 30;
      } else if (dist === 2) {
        score = 400;
      } else if (dist === 3 && cleanNormalized.length >= 5) {
        score = 200;
      }

      if (score > 0) {
        if (w[0] === cleanNormalized[0]) score += 50;
        if (cleanNormalized.length >= 2 && w.startsWith(cleanNormalized.slice(0, 2))) score += 40;
        if (cleanNormalized.length >= 2 && w.endsWith(cleanNormalized.slice(-2))) score += 20;
        scoredCandidates.push({ word: w, score });
      }
    };

    // Check seed dictionary
    for (const item of CORE_SEED_DICTIONARY) {
      evaluateWordCandidate(item.word);
    }

    // Search candidate shards
    const uniqueCandLetters = Array.from(new Set(candidateLetters));
    for (const cLetter of uniqueCandLetters) {
      const shard = cLetter === primaryLetter ? primaryShard : await loadLetterShard(cLetter);
      for (const item of shard) {
        evaluateWordCandidate(item.word);
      }
    }

    // Sort by score descending and deduplicate
    scoredCandidates.sort((a, b) => b.score - a.score);
    const uniqueSuggestions: string[] = [];
    const seenWords = new Set<string>();
    for (const c of scoredCandidates) {
      if (!seenWords.has(c.word)) {
        seenWords.add(c.word);
        uniqueSuggestions.push(c.word);
        if (uniqueSuggestions.length >= 3) break;
      }
    }

    // Suffix fallback: if no direct match, check root stem and reconstruct with suffix
    if (uniqueSuggestions.length === 0) {
      for (const v of COMMON_VIBHAKTI) {
        if (clean.endsWith(v) && clean.length > v.length + 1) {
          const stem = clean.slice(0, clean.length - v.length);
          const stemNorm = stem.replace(/अा/g, 'आ');
          const stemSkel = stripDevanagariMatras(stemNorm);
          const stemLetter = getWordFirstLetter(stemNorm);
          const stemShard = await loadLetterShard(stemLetter);
          for (const item of stemShard) {
            if (stripDevanagariMatras(item.word) === stemSkel || levenshteinDevanagari(stemNorm, item.word) <= 1) {
              uniqueSuggestions.push(item.word + v);
              if (uniqueSuggestions.length >= 3) break;
            }
          }
          if (uniqueSuggestions.length > 0) break;
        }
      }
    }

    results.push({
      original: clean,
      isCorrect: false,
      suggestions: uniqueSuggestions,
    });
  }

  return results;
}
