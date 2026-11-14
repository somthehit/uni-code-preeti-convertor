/**
 * Nepali AI Linguistic & Adaptive Learning Engine
 * 
 * Features:
 * 1. Real-time predictive next-word & autocomplete suggestion engine (N-gram & Markov models)
 * 2. Continuous real-time learning from user's typed words/sentences stored in persistent cache
 * 3. Dynamic randomized word generation for Typing Master levels (infinite unique practice rounds)
 * 4. Adaptive difficulty & weak-key targeting for Typing Master & Arcade Games
 */

import { preetiToUnicode, unicodeToPreeti } from './preeti-converter';

// Common Nepali declensions & suffix completions (विभक्ति तथा प्रत्यय विस्तार)
export const NEPALI_WORD_COMPLETIONS: Record<string, string[]> = {
  'हामी': ['हामीले', 'हामीलाई', 'हाम्रो', 'हाम्रा', 'हामीसँग', 'हामीहरू'],
  'हाम्रो': ['देश', 'नेपाल', 'कर्तव्य', 'संस्कृति', 'गौरव'],
  'म': ['मलाई', 'मेरो', 'ममा', 'मसँग'],
  'तिमी': ['तिमीलाई', 'तिम्रो', 'तिमीले', 'तिमीसँग'],
  'तपाईं': ['तपाईंलाई', 'तपाईंको', 'तपाईंले', 'तपाईंसँग'],
  'उनी': ['उनीहरू', 'उनलाई', 'उनको', 'उनीसँग'],
  'नेपाल': ['नेपाली', 'नेपालको', 'नेपालमा', 'नेपालबाट', 'नेपाल सरकार'],
  'काम': ['काममा', 'कामको', 'कामदार', 'कामकाज', 'कामहरू'],
  'घर': ['घरमा', 'घरको', 'घरबाट', 'घरपरिवार'],
  'देश': ['देशको', 'देशमा', 'देशभर', 'देशभक्त', 'देशविदेश'],
  'समय': ['समयमा', 'समयको', 'समयमै'],
  'विकास': ['विकास निर्माण', 'विकासमा', 'विकासशील'],
  'शिक्षा': ['शिक्षालय', 'शिक्षामा', 'शिक्षा मन्त्रालय'],
  'स्वास्थ्य': ['स्वास्थ्य चौकी', 'स्वास्थ्यमा', 'स्वास्थ्य सेवा'],
  'संविधान': ['संविधानको', 'संविधानमा', 'संविधान सभा'],
  'सरकार': ['सरकारको', 'सरकारले', 'सरकारी'],
  'कार्यालय': ['कार्यालयको', 'कार्यालयमा', 'कार्यालय प्रमुख'],
  'राम्रो': ['राम्रोसँग', 'राम्ररी'],
  'धेरै': ['धेरैजसो', 'धेरैधेरै'],
  'दिन': ['दिनभर', 'दिनहुँ', 'दिनहरू'],
};

// Rich grammatical & conversational bigram collocations (व्याकरणिक र सन्दर्भिक शब्द जोडीहरू)
export const NEPALI_BIGRAM_MAP: Record<string, string[]> = {
  // Pronouns & Subjects
  'हामी': ['सबै', 'नेपाली', 'मिलेर', 'सँगै', 'देशको', 'गर्दछौं', 'गर्छौं', 'सक्छौं', 'जान्छौं'],
  'हाम्रो': ['देश', 'नेपाल', 'कर्तव्य', 'संस्कृति', 'गौरव', 'समाज', 'माटो', 'दायित्व'],
  'हामीले': ['गर्नुपर्छ', 'बुझ्नुपर्छ', 'सिक्नुपर्छ', 'देशको', 'राम्रो काम', 'सहयोग'],
  'हामीलाई': ['चाहिन्छ', 'गर्व छ', 'खुसी लाग्यो', 'विश्वास छ'],
  'म': ['पनि', 'घर', 'काम', 'नेपाल', 'सधैं', 'गर्दछु', 'जान्छु'],
  'मेरो': ['नाम', 'घर', 'विचारमा', 'देश', 'काम', 'जिम्मेवारी'],
  'मलाई': ['लाग्छ', 'चाहिन्छ', 'मन पर्छ', 'थाहा छ', 'खुसी'],
  'तपाईं': ['कस्तो हुनुहुन्छ', 'सञ्चै हुनुहुन्छ', 'कहाँ हुनुहुन्छ', 'आउनुहोस्', 'गर्नुहोस्'],
  'तपाईंको': ['नाम', 'घर', 'विचार', 'सहयोगको लागि धन्यवाद', 'स्वास्थ्य'],
  'तिमी': ['कहाँ छौ', 'के गर्दैछौ', 'घर आउ', 'राम्रो छौ'],
  'उनी': ['धेरै राम्रो', 'काममा गए', 'घर पुगे'],
  'उनीहरू': ['सबै', 'मिलेर', 'आए', 'गर्दैछन्', 'काममा'],
  'सबै': ['साथीहरू', 'नेपाली', 'मानिसहरू', 'मिलेर', 'जनालाई', 'कुरा'],

  // Connectors & Demonstratives
  'यो': ['काम', 'कुरा', 'नेपाल', 'हाम्रो', 'धेरै राम्रो', 'समय', 'वर्ष'],
  'त्यो': ['कुरा', 'समय', 'काम', 'मानिस', 'ठाउँ'],
  'यहाँ': ['धेरै', 'उपस्थित', 'आउनुहोस्', 'सबै', 'काम', 'शान्ति छ'],
  'त्यहाँ': ['पुगेर', 'गएर', 'धेरै राम्रो', 'थियो'],

  // Country, Places & Society
  'नेपाल': ['हाम्रो सुन्दर देश हो', 'सरकार', 'आमा', 'राज्य', 'भूमि', 'प्राकृतिक सौन्दर्य'],
  'नेपालको': ['संविधान', 'इतिहास', 'भूगोल', 'नक्सा', 'कानुन', 'विकास'],
  'नेपाली': ['भाषा', 'जनता', 'संस्कृति', 'सेना', 'नागरिक', 'साहित्य'],
  'देशको': ['विकास', 'उन्नति', 'कानुन', 'सुरक्षा', 'नागरिक', 'माटो', 'समृद्धि'],
  'काठमाडौँ': ['उपत्यका', 'महानगरपालिका', 'नेपालको राजधानी'],
  'पोखरा': ['लेकसाइड', 'पर्यटकीय सहर', 'फेवाताल'],

  // Adjectives & Expressions
  'राम्रो': ['काम', 'बानी', 'मान्छे', 'भविष्य', 'विचार', 'अक्षर'],
  'नयाँ': ['वर्ष', 'सोच', 'दिन', 'काम', 'योजना', 'पुस्ता', 'प्रविधि'],
  'धेरै': ['राम्रो', 'धन्यवाद', 'खुसी लाग्यो', 'परिश्रम', 'ज्ञान'],
  'सुन्दर': ['नेपाल', 'प्रकृति', 'हिमाल', 'दृश्य'],

  // Values & Knowledge
  'सत्य': ['बोल्नुपर्छ', 'सधैं विजय हुन्छ', 'मार्ग', 'धर्म'],
  'ज्ञान': ['नै शक्ति हो', 'आर्जन', 'वृद्धि', 'ज्योती'],
  'कर्म': ['नै पूजा हो', 'अनुसार फल', 'योग', 'सत्य'],
  'समय': ['मूल्यवान् छ', 'अनुसार', 'बित्यो', 'पालना गरौं'],
  'विकास': ['निर्माण', 'र समृद्धि', 'योजना', 'लक्ष्य', 'गति'],

  // Official, Letters, Administration
  'मिति': ['२०८३', '२०८२', '२०८१', 'आज', 'उल्लेख अनुसार'],
  'श्री': ['मान्', '५', 'प्रमुख', 'अध्यक्ष', 'सचिव', 'पशुपतिनाथ'],
  'विषय': ['सिफारिस सम्बन्धमा', 'जानकारी गराइएको बारे', 'अनुरोध सम्बन्धमा'],
  'महोदय': ['उपर्युक्त सम्बन्धमा', 'सादर अनुरोध छ', 'निवेदन गर्दछु'],
  'कार्यालय': ['प्रमुख', 'समय', 'काम', 'सहायक', 'प्रशासन'],
  'प्रमाणित': ['गरिन्छ', 'गरिएको छ', 'व्यहोरा', 'प्रतिलिपि'],
  'सिफारिस': ['गरिन्छ', 'गरिएको छ', 'पत्र साथ'],
  'अनुरोध': ['छ', 'गर्दछु', 'गरिन्छ', 'सहित'],
  'नमस्कार': ['सबैलाई', 'साथीहरू', 'यहाँलाई', 'हजुर'],
  'धन्यवाद': ['ज्ञापन गर्दछु', 'सहित', 'धेरै धेरै', 'यहाँलाई']
};

// Core Nepali high-frequency vocabulary categorized by morphological structure
export const NEPALI_CORE_LEXICON = [
  // Common Connectors & Verbs
  'छ', 'छन्', 'थियो', 'गर्नु', 'गरेको', 'हुने', 'भयो', 'हुन्छ', 'रहेको', 'भने',
  'र', 'तर', 'अनि', 'वा', 'किनकि', 'पनि', 'मात्र', 'धेरै', 'सबै', 'कुनै',
  'हामी', 'तिमी', 'तपाईं', 'उनी', 'यस', 'त्यस', 'यहाँ', 'त्यहाँ', 'कसरी', 'किन',

  // Home row friendly words (a, s, d, f, g, h, j, k, l, ;)
  'कम', 'कस', 'मन', 'कमा', 'बना', 'पानि', 'किसान', 'मानिस', 'बस', 'जन',
  'वन', 'सम', 'कास', 'माना', 'नाना', 'मामा', 'काका', 'बाबा', 'बास', 'कपास',
  'सपना', 'समान', 'कमल', 'पवन', 'मम', 'कवि', 'काप', 'पना', 'सिम', 'सिक',

  // Top row additions (q, w, e, r, t, y, u, i, o, p, [, ])
  'घर', 'चमेरा', 'तपेस', 'गए', 'कृषि', 'नेपाल', 'उपकार', 'चेतना', 'गाई', 'भाइ',
  'तारा', 'यम', 'उपाय', 'चेत', 'धर्ती', 'चरा', 'गीत', 'घाम', 'दिन', 'रात',
  'युवक', 'पुतली', 'उपहार', 'चार', 'तीन', 'पानी', 'भात', 'चामल', 'माटो', 'रुख',

  // Bottom row additions (z, x, c, v, b, n, m, ,, ., /)
  'शहर', 'अक्षर', 'सफल', 'दशक', 'रहर', 'खत', 'हल', 'अफर', 'देश', 'सत्य',
  'खबर', 'खेत', 'हवा', 'दाल', 'फल', 'हात', 'खुट्टा', 'कलम', 'किताब', 'कागज',

  // Complex conjuncts, Hraswa I-kar, Reph, Rakar
  'कार्य', 'धैर्य', 'कर्म', 'धर्म', 'मार्ग', 'पूर्ण', 'प्रकाश', 'प्रगति', 'प्रकृति', 'भ्रमण',
  'राष्ट्रिय', 'आशीर्वाद', 'प्रार्थना', 'निर्मल', 'वर्षा', 'इतिहास', 'विद्यालय', 'नियमित', 'सिमाना', 'अधिकार',
  'क्षमता', 'त्रिशूल', 'ज्ञान', 'श्रम', 'शुद्ध', 'विद्या', 'द्वन्द्व', 'चट्टान', 'प्रविधि', 'संसार',
  'गोरखा', 'काठमाडौँ', 'पोखरा', 'सगरमाथा', 'हिमाल', 'तराई', 'पहाड', 'शान्ति', 'मुस्कान', 'विकास',
  'संविधान', 'सरकार', 'जनता', 'समाज', 'सांस्कृतिक', 'ऐतिहासिक', 'प्राकृतिक', 'पर्यटन', 'समृद्धि', 'स्वाभिमान'
];

export interface AiLearningStats {
  totalWordsLearned: number;
  userVocabularyCount: number;
  frequentWords: Record<string, number>;
  userBigrams: Record<string, string[]>;
  weakKeysHistory: Record<string, number>;
}

const STORAGE_KEY_AI_CACHE = 'nepali_ai_learning_cache';

/**
 * Loads the current AI persistent cache from localStorage
 */
export function getAiLearningCache(): AiLearningStats {
  if (typeof window === 'undefined') {
    return {
      totalWordsLearned: 0,
      userVocabularyCount: 0,
      frequentWords: {},
      userBigrams: {},
      weakKeysHistory: {},
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_AI_CACHE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch { }

  const defaultStats: AiLearningStats = {
    totalWordsLearned: 0,
    userVocabularyCount: 0,
    frequentWords: {},
    userBigrams: {},
    weakKeysHistory: {},
  };
  return defaultStats;
}

/**
 * Saves updated AI learning cache to localStorage
 */
export function saveAiLearningCache(stats: AiLearningStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_AI_CACHE, JSON.stringify(stats));
  } catch { }
}

/**
 * Learns words and collocations in real time from user typed text
 * @param text The input string
 * @param isPreeti Whether the text is in Preeti layout format
 */
export function learnFromUserTypedText(text: string, isPreeti: boolean = false): void {
  if (!text || text.trim().length < 2) return;

  // If text is in Preeti, convert to Unicode first so words are learned in Nepali
  const cleanInput = isPreeti || /^[a-zA-Z0-9\s;'/.,\-=[\]\\]+$/.test(text.trim())
    ? preetiToUnicode(text)
    : text;

  const stats = getAiLearningCache();
  // Split into words, cleaning punctuation
  const words = cleanInput
    .replace(/[।?!,;:\-"'()[\]{}0-9]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2);

  if (words.length === 0) return;

  for (let i = 0; i < words.length; i++) {
    const current = words[i];
    stats.frequentWords[current] = (stats.frequentWords[current] || 0) + 1;
    stats.totalWordsLearned++;

    // Track Bigram transition
    if (i < words.length - 1) {
      const nextWord = words[i + 1];
      if (!stats.userBigrams[current]) {
        stats.userBigrams[current] = [];
      }
      if (!stats.userBigrams[current].includes(nextWord)) {
        stats.userBigrams[current].push(nextWord);
        // Keep top 10 transitions per word
        if (stats.userBigrams[current].length > 10) {
          stats.userBigrams[current].shift();
        }
      }
    }
  }

  stats.userVocabularyCount = Object.keys(stats.frequentWords).length;
  saveAiLearningCache(stats);
}

/**
 * Predicts contextual next words, declensions, or autocompletes current prefix
 */
export function getAiWordSuggestions(currentInput: string, limit = 6): string[] {
  if (!currentInput || !currentInput.trim()) {
    return ['नेपाल', 'हाम्रो', 'धन्यवाद', 'नमस्कार', 'श्री', 'मिति'];
  }

  const isEndsWithSpace = /\s$/.test(currentInput);
  const stats = getAiLearningCache();
  const tokens = currentInput.trim().split(/\s+/);
  const lastWord = tokens[tokens.length - 1] || '';
  const prevWord = tokens.length > 1 ? tokens[tokens.length - 2] : '';

  const suggestions: Set<string> = new Set();

  // 1. If typing a word (no trailing space), prioritize declension/suffix & prefix completions
  if (!isEndsWithSpace && lastWord) {
    // Suffix expansions (e.g., 'हामी' -> 'हामीले', 'हामीलाई', 'हाम्रो', 'हामीसँग')
    if (NEPALI_WORD_COMPLETIONS[lastWord]) {
      NEPALI_WORD_COMPLETIONS[lastWord].forEach((w) => {
        if (w !== lastWord) suggestions.add(w);
      });
    }

    // Learned words prefix match
    Object.keys(stats.frequentWords)
      .filter((w) => w.startsWith(lastWord) && w !== lastWord)
      .sort((a, b) => (stats.frequentWords[b] || 0) - (stats.frequentWords[a] || 0))
      .slice(0, 4)
      .forEach((w) => suggestions.add(w));

    // Core lexicon prefix match
    NEPALI_CORE_LEXICON
      .filter((w) => w.startsWith(lastWord) && w !== lastWord)
      .slice(0, 4)
      .forEach((w) => suggestions.add(w));
  }

  // 2. Grammatical Collocations & Next-word predictions (bigrams)
  // If user just completed a word (with space) OR if suggestions are still sparse
  const contextAnchor = isEndsWithSpace ? lastWord : (suggestions.size < 4 ? lastWord : '');
  if (contextAnchor) {
    // User learned transitions for this word
    if (stats.userBigrams[contextAnchor]) {
      stats.userBigrams[contextAnchor].forEach((w) => {
        if (w !== contextAnchor) suggestions.add(w);
      });
    }

    // High quality grammatical bigram collocations
    if (NEPALI_BIGRAM_MAP[contextAnchor]) {
      NEPALI_BIGRAM_MAP[contextAnchor].forEach((w) => {
        if (w !== contextAnchor) suggestions.add(w);
      });
    }
  }

  // If previous word also had a strong bigram context
  if (isEndsWithSpace && prevWord && suggestions.size < limit) {
    if (NEPALI_BIGRAM_MAP[prevWord]) {
      NEPALI_BIGRAM_MAP[prevWord].forEach((w) => {
        if (w !== lastWord) suggestions.add(w);
      });
    }
  }

  // 3. Fallbacks ONLY when trailing space exists and suggestions are empty
  if (isEndsWithSpace && suggestions.size === 0) {
    const naturalContinuations = ['पनि', 'सबै', 'भने', 'र', 'तथा', 'अनुसार'];
    for (const w of naturalContinuations) {
      if (w !== lastWord) suggestions.add(w);
      if (suggestions.size >= limit) break;
    }
  }

  return Array.from(suggestions).slice(0, limit);
}

// Level-specific vocabulary banks for dynamic randomization
const LEVEL_VOCAB_BANKS: Record<number, string[]> = {
  // Level 1: Home row unshifted
  1: [
    'कस', 'मन', 'कमा', 'बना', 'पानि', 'किसान', 'मानिस', 'बस', 'कम', 'जन',
    'वन', 'सम', 'कास', 'माना', 'नाना', 'मामा', 'काका', 'बाबा', 'बास', 'कपास',
    'सपना', 'समान', 'कमल', 'पवन', 'मम', 'कवि', 'काप', 'पना', 'सिम', 'सिक',
    'कसि', 'मसि', 'पिक', 'बसि', 'पान', 'कान', 'बान', 'सान', 'कासि'
  ],
  // Level 2: Home row shifted
  2: [
    'पानी', 'कम्पन', 'जन्ती', 'पूजा', 'समान', 'बास्ना', 'कुम्लो', 'सन्चो', 'पक्का', 'जम्मा',
    'बानी', 'पुर्खा', 'काम्लो', 'सुब्बा', 'सम्मान', 'कुसुम', 'चुम्बन', 'सम्पन्न', 'कन्चन', 'सञ्चय'
  ],
  // Level 3: Top row unshifted
  3: [
    'घर', 'चमेरा', 'तपेस', 'गए', 'कृषि', 'नेपाल', 'उपकार', 'चेतना', 'गाई', 'भाइ',
    'तारा', 'यम', 'उपाय', 'चेत', 'धर्ती', 'चरा', 'गीत', 'घाम', 'दिन', 'रात',
    'युवक', 'पुतली', 'उपहार', 'चार', 'तीन', 'भात', 'चामल', 'माटो', 'रुख'
  ],
  // Level 4: Top row shifted & Reph
  4: [
    'पर्वत', 'नेपाली', 'कैलाश', 'प्रगति', 'एकता', 'धर्म', 'कर्म', 'मार्ग', 'धैर्य', 'ऐश्वर्य',
    'भ्राता', 'इच्छा', 'सूर्य', 'चन्द्र', 'हर्ष', 'गर्व', 'आचार्य', 'विद्यार्थी', 'ईश्वर', 'प्रतिभा'
  ],
  // Level 5: Bottom row unshifted
  5: [
    'शहर', 'अक्षर', 'कमल', 'सफल', 'दशक', 'रहर', 'खत', 'हल', 'अफर', 'नेपाल',
    'देश', 'सत्य', 'खबर', 'खेत', 'हवा', 'दाल', 'फल', 'हात', 'खुट्टा', 'कलम',
    'किताब', 'कागज', 'सपना', 'सफा', 'सुन्दर', 'आकाश', 'कमिला', 'फूल', 'खोला'
  ],
  // Level 6: Bottom row shifted & Specials
  6: [
    'श्रम', 'विद्या', 'ऋषि', 'रुपैयाँ', 'शृङ्खला', 'प्रश्न', 'श्रद्धा', 'खण्ड', 'ध्यान', 'प्रह्लाद',
    'उत्सव', 'रुकुम', 'श्रोता', 'ऋण', 'दृष्टि', 'सृष्टि', 'कृपा', 'हृदय', 'वृक्ष', 'मृग'
  ],
  // Level 7: Number row & digits
  7: [
    'ज्ञानी', 'छोटो', 'ठूलो', 'डोरी', 'ढिकी', 'बाटो', 'घाटो', 'मिति', '२०८३', 'साल',
    '७', 'महिना', '२७', 'गते', '१२', '३४', '५६', '७८', '९०', 'रु', '१००', '५००', '१०००'
  ],
  // Level 8: Hraswa I-kar (l)
  8: [
    'किताब', 'दिन', 'जित', 'मिलन', 'मन्दिर', 'स्थिति', 'प्रिय', 'मित्र', 'इतिहास', 'विद्यालय',
    'नियमित', 'सिमाना', 'अधिकार', 'कवि', 'हरि', 'मुनि', 'ऋषि', 'प्रति', 'गति', 'मति', 'नीति'
  ],
  // Level 9: Reph ({) & Rakar (|)
  9: [
    'कर्म', 'पूर्ण', 'प्रकाश', 'राष्ट्रिय', 'आशीर्वाद', 'प्रार्थना', 'प्रकृति', 'भ्रमण', 'क्रम', 'निर्मल',
    'कार्य', 'वर्षा', 'शर्म', 'गर्व', 'आर्य', 'सूर्य', 'धैर्य', 'प्रशंसा', 'प्रयास', 'प्रमुख'
  ],
  // Level 10: Conjuncts & Alt codes
  10: [
    'क्षमता', 'त्रिशूल', 'ज्ञान', 'श्रम', 'शुद्ध', 'विद्या', 'द्वन्द्व', 'वाङ्मय', 'चट्टान', 'लट्ठी',
    'रूपैयाँ', 'प्रविधि', 'पञ्चामृत', 'सङ्घ', 'गङ्गा', 'बुद्ध', 'सिद्ध', 'युद्ध', 'द्वार', 'द्विप'
  ],
  // Level 11-15: Advanced Government, Legal & Literature
  11: [
    'नेपाल', 'सरकार', 'प्रधानमन्त्री', 'मन्त्रालय', 'कार्यालय', 'निर्णय', 'प्रशासन', 'सेवा', 'सुविधा', 'योजना',
    'बजेट', 'स्वीकृत', 'अनुदान', 'विकास', 'सडक', 'खानेपानी', 'स्वास्थ्य', 'शिक्षा', 'कानुन', 'न्यायालय'
  ],
  12: [
    'संविधान', 'मौलिक', 'हक', 'सार्वभौमसत्ता', 'गणतन्त्र', 'सङ्घीयता', 'समावेशी', 'संसद्', 'कानुन', 'प्रणाली',
    'जनप्रतिनिधि', 'समानता', 'स्वतन्त्रता', 'न्याय', 'अधिकार', 'कर्तव्य', 'सुशासन', 'पारदर्शिता', 'जवाफदेहिता'
  ],
  13: [
    'वाणिज्य', 'बैङ्क', 'वित्तीय', 'संस्था', 'सहकारी', 'खाता', 'निक्षेप', 'कर्जा', 'ब्याजदर', 'भुक्तानी',
    'राजस्व', 'कर', 'सञ्चित', 'कोष', 'लेखापरीक्षण', 'नाफा', 'नोक्सान', 'प्रतिवेदन', 'हिसाब', 'रकम'
  ],
  14: [
    'जलवायु', 'परिवर्तन', 'पर्यावरण', 'संरक्षण', 'जैविक', 'विविधता', 'वनस्पति', 'हिमनदी', 'जलवायु', 'तापक्रम',
    'पारिस्थितिक', 'प्रदूषण', 'नवीकरणीय', 'ऊर्जा', 'दिगो', 'विकास', 'प्राकृतिक', 'विपद्', 'जोखिम', 'व्यवस्थापन'
  ],
  15: [
    'नेपालको', 'संविधान', 'अनुसार', 'सार्वभौमसत्ता', 'र', 'राजकीयसत्ता', 'नेपाली', 'जनतामा', 'निहित', 'रहेको',
    'छ।', 'राष्ट्रिय', 'एकता', 'अखण्डता', 'र', 'स्वाभिमानको', 'रक्षा', 'गर्नु', 'प्रत्येक', 'नागरिकको',
    'परम', 'कर्तव्य', 'हुनेछ।', 'सबैको', 'जय', 'होस्।'
  ]
};

/**
 * Generates dynamic randomized practice sentences for Typing Master levels
 * ensuring the user never gets the exact same repetitive text!
 * Also prioritizes words containing user's weak keys.
 */
export function generateRandomizedLevelPrompt(
  levelNumber: number,
  wordCount = 18,
  weakKeys: string[] = []
): string {
  const bank = LEVEL_VOCAB_BANKS[levelNumber] || LEVEL_VOCAB_BANKS[1];

  // Copy bank
  const pool = [...bank];

  // Prioritize words that contain characters matching user's weak keys
  if (weakKeys && weakKeys.length > 0) {
    pool.sort((a, b) => {
      const aPreeti = unicodeToPreeti(a);
      const bPreeti = unicodeToPreeti(b);
      const aMatches = weakKeys.some((k) => a.includes(k) || aPreeti.includes(k)) ? 1 : 0;
      const bMatches = weakKeys.some((k) => b.includes(k) || bPreeti.includes(k)) ? 1 : 0;
      return bMatches - aMatches;
    });
  } else {
    pool.sort(() => Math.random() - 0.5);
  }

  // If wordCount exceeds bank, repeat pool
  const selected: string[] = [];
  while (selected.length < wordCount) {
    for (const w of pool) {
      selected.push(w);
      if (selected.length >= wordCount) break;
    }
  }

  return selected.join(' ');
}

/**
 * Generates adaptive words for Arcade Games based on difficulty & user's weak keys
 */
export function getAdaptiveGameWords(
  difficulty: 'easy' | 'medium' | 'hard',
  count = 20,
  weakKeys: string[] = []
): string[] {
  let pool: string[] = [];

  if (difficulty === 'easy') {
    pool = [...LEVEL_VOCAB_BANKS[1], ...LEVEL_VOCAB_BANKS[3], ...LEVEL_VOCAB_BANKS[5]];
  } else if (difficulty === 'medium') {
    pool = [...LEVEL_VOCAB_BANKS[4], ...LEVEL_VOCAB_BANKS[8], ...LEVEL_VOCAB_BANKS[9]];
  } else {
    pool = [...LEVEL_VOCAB_BANKS[6], ...LEVEL_VOCAB_BANKS[10], ...LEVEL_VOCAB_BANKS[12]];
  }

  // Shuffle pool
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  // Prioritize words that contain characters matching user's weak keys
  if (weakKeys && weakKeys.length > 0) {
    shuffled.sort((a, b) => {
      const aMatches = weakKeys.some((k) => a.includes(k)) ? 1 : 0;
      const bMatches = weakKeys.some((k) => b.includes(k)) ? 1 : 0;
      return bMatches - aMatches;
    });
  }

  return shuffled.slice(0, count);
}

