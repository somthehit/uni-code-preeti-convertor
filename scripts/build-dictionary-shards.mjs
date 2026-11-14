import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { DatabaseSync } from 'node:sqlite';

const SHARDS_DIR = path.resolve('public/dictionary/shards');
if (!fs.existsSync(SHARDS_DIR)) {
  fs.mkdirSync(SHARDS_DIR, { recursive: true });
}

// 49 standard Nepali Devanagari letters (अ देखि ज्ञ सम्म)
const NEPALI_LETTERS = [
  // स्वर वर्ण (13)
  'अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः',
  // क-वर्ग
  'क', 'ख', 'ग', 'घ', 'ङ',
  // च-वर्ग
  'च', 'छ', 'ज', 'झ', 'ञ',
  // ट-वर्ग
  'ट', 'ठ', 'ड', 'ढ', 'ण',
  // त-वर्ग
  'त', 'थ', 'द', 'ध', 'न',
  // प-वर्ग
  'प', 'फ', 'ब', 'भ', 'म',
  // अन्तस्थ र ऊष्म
  'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह',
  // संयुक्त अक्षर
  'क्ष', 'त्र', 'ज्ञ', 'श्र'
];

function getWordLetter(word) {
  if (!word || typeof word !== 'string') return 'अ';
  const clean = word.trim();
  if (!clean) return 'अ';

  // Check 2-char conjuncts/special starts first
  if (clean.startsWith('क्ष')) return 'क्ष';
  if (clean.startsWith('त्र')) return 'त्र';
  if (clean.startsWith('ज्ञ')) return 'ज्ञ';
  if (clean.startsWith('श्र')) return 'श्र';
  if (clean.startsWith('अं') || clean.startsWith('अँ')) return 'अं';
  if (clean.startsWith('अः')) return 'अः';

  const first = clean[0];
  if (NEPALI_LETTERS.includes(first)) {
    return first;
  }

  // Handle nasal variants
  if (['आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ'].includes(first)) {
    return first;
  }

  return 'अ';
}

function getSyllables(word) {
  if (!word) return '';
  const matches = word.match(/([क-ह]्)*[क-हअ-औ][ा-्]*|./g);
  return matches ? matches.join(' - ') : word;
}

const UNICODE_TO_PREETI_CHAR = {
  'अ': 'c', 'आ': 'cf', 'इ': 'O', 'ई': 'O{', 'उ': 'p', 'ऊ': 'pm', 'ऋ': 'C',
  'ए': 'P', 'ऐ': 'P]', 'ओ': 'cf]', 'औ': 'cf}', 'अं': 'c+', 'अँ': 'cF',
  'क': 's', 'ख': 'v', 'ग': 'u', 'घ': '3', 'ङ': 'ª',
  'च': 'r', 'छ': '5', 'ज': 'h', 'झ': 'H', 'ञ': '`',
  'ट': '6', 'ठ': '7', 'ड': '8', 'ढ': '9', 'ण': '0f',
  'त': 't', 'थ': 'y', 'द': 'b', 'ध': 'w', 'न': 'g',
  'प': 'k', 'फ': 'km', 'ब': 'a', 'भ': 'e', 'म': 'd',
  'य': 'o', 'र': '/', 'ल': 'n', 'व': 'j',
  'श': 'z', 'ष': 'if', 'स': ';', 'ह': 'x',
  'क्ष': 'If', 'त्र': 'q', 'ज्ञ': '1', 'श्र': '>',
  'ा': 'f', 'ि': 'l', 'ी': 'L', 'ु': "'", 'ू': '"', 'ृ': '[',
  'े': ']', 'ै': '}', 'ो': 'f]', 'ौ': 'f}', 'ं': '+', 'ँ': 'F',
  '्': '\\', 'ः': 'M', '०': ')', '१': '!', '२': '@', '३': '#',
  '४': '$', '५': '%', '६': '^', '७': '&', '८': '*', '९': '('
};

function simpleUnicodeToPreeti(word) {
  if (!word) return '';
  let out = '';
  for (let i = 0; i < word.length; i++) {
    const s2 = word.slice(i, i + 2);
    if (UNICODE_TO_PREETI_CHAR[s2]) {
      out += UNICODE_TO_PREETI_CHAR[s2];
      i++;
      continue;
    }
    const s1 = word[i];
    out += UNICODE_TO_PREETI_CHAR[s1] || s1;
  }
  return out;
}

function getPreetiKeys(preetiStr) {
  if (!preetiStr) return '';
  return preetiStr.split('').map(c => `[ ${c} ]`).join(' + ');
}

async function run() {
  console.log('--- Step 1: Bulk reading nep_dict.sqlite3 in memory ---');
  const db = new DatabaseSync('nep_dict.sqlite3');
  const words = db.prepare('SELECT id, value, part_of_speech FROM word').all();
  const allDefs = db.prepare('SELECT id, word_id, value FROM definition').all();
  const allExamples = db.prepare('SELECT definition_id, value FROM example').all();

  console.log(`Loaded ${words.length} words, ${allDefs.length} definitions, ${allExamples.length} examples.`);

  // Map definitionId -> examples[]
  const defExamplesMap = new Map();
  for (const ex of allExamples) {
    if (!ex.value || !ex.value.trim()) continue;
    if (!defExamplesMap.has(ex.definition_id)) {
      defExamplesMap.set(ex.definition_id, []);
    }
    defExamplesMap.get(ex.definition_id).push(ex.value.trim());
  }

  // Map wordId -> { defs: [], examples: [] }
  const wordContentMap = new Map();
  for (const d of allDefs) {
    if (!d.value || !d.value.trim()) continue;
    if (!wordContentMap.has(d.word_id)) {
      wordContentMap.set(d.word_id, { defs: [], examples: [] });
    }
    const wc = wordContentMap.get(d.word_id);
    wc.defs.push(d.value.trim());
    const exList = defExamplesMap.get(d.id);
    if (exList && exList.length > 0) {
      wc.examples.push(...exList);
    }
  }

  const sqliteWordMap = new Map();
  for (const w of words) {
    const wordText = w.value.trim();
    if (!wordText) continue;
    const wc = wordContentMap.get(w.id) || { defs: [], examples: [] };
    sqliteWordMap.set(wordText, {
      word: wordText,
      pos: (w.part_of_speech || '').trim() || 'ना.',
      definitions: wc.defs,
      examples: wc.examples
    });
  }

  console.log('--- Step 2: Decompressing local sabdakosh.json.gz (122,000+ words) ---');
  const gzBuffer = fs.readFileSync('sabdakosh.json.gz');
  const decompressed = zlib.gunzipSync(gzBuffer).toString('utf8');
  console.log(`Decompressed ${(decompressed.length / (1024 * 1024)).toFixed(2)} MB of JSON.`);

  const sabdakosh = JSON.parse(decompressed);
  console.log(`Parsed ${sabdakosh.length} headwords from Nepali Brihat Sabdakosh!`);

  const fullWordMap = new Map();

  // Seed from sqliteWordMap
  for (const [wText, item] of sqliteWordMap.entries()) {
    const preeti = simpleUnicodeToPreeti(wText);
    fullWordMap.set(wText, {
      id: wText,
      word: wText,
      preeti,
      preetiKeys: getPreetiKeys(preeti),
      syllables: getSyllables(wText),
      pos: item.pos,
      etymology: '[नेपाली]',
      definitions: item.definitions,
      examples: item.examples.slice(0, 3),
      synonyms: []
    });
  }

  // Merge with sabdakosh
  for (const entry of sabdakosh) {
    const wText = (entry.word || '').trim();
    if (!wText) continue;

    const defs = [];
    let pos = '';
    let etymology = '';

    if (Array.isArray(entry.definitions)) {
      for (const d of entry.definitions) {
        if (d.grammar && !pos) pos = d.grammar;
        if (d.etymology && !etymology) etymology = d.etymology;
        if (Array.isArray(d.senses)) {
          for (const s of d.senses) {
            if (typeof s === 'string' && s.trim()) {
              defs.push(s.trim());
            }
          }
        }
      }
    }

    if (fullWordMap.has(wText)) {
      const existing = fullWordMap.get(wText);
      if (defs.length > 0 && existing.definitions.length === 0) {
        existing.definitions = defs.slice(0, 5);
      }
      if (etymology && !existing.etymology) existing.etymology = etymology;
      if (pos && !existing.pos) existing.pos = pos;
    } else {
      const preeti = simpleUnicodeToPreeti(wText);
      fullWordMap.set(wText, {
        id: wText,
        word: wText,
        preeti,
        preetiKeys: getPreetiKeys(preeti),
        syllables: getSyllables(wText),
        pos: pos || 'ना.',
        etymology: etymology || '[सं.]',
        definitions: defs.slice(0, 5),
        examples: [],
        synonyms: []
      });
    }
  }

  console.log(`Total combined unique dictionary words: ${fullWordMap.size}`);

  console.log('--- Step 3: Sharding words into 49 letters (अ देखि ज्ञ सम्म) ---');
  const shards = {};
  for (const letter of NEPALI_LETTERS) {
    shards[letter] = [];
  }

  for (const [wText, item] of fullWordMap.entries()) {
    const letter = getWordLetter(wText);
    if (!shards[letter]) {
      shards[letter] = [];
    }
    shards[letter].push(item);
  }

  const letterCounts = {};
  const letterMap = [];

  for (let i = 0; i < NEPALI_LETTERS.length; i++) {
    const letter = NEPALI_LETTERS[i];
    const list = shards[letter] || [];
    list.sort((a, b) => a.word.localeCompare(b.word, 'ne'));
    letterCounts[letter] = list.length;
    letterMap.push({
      index: i,
      letter,
      file: `shard_${i}.json`,
      count: list.length
    });

    const jsonStr = JSON.stringify(list);
    // Write shard_{i}.json
    fs.writeFileSync(path.join(SHARDS_DIR, `shard_${i}.json`), jsonStr);
    // Also write unicode named file
    try {
      fs.writeFileSync(path.join(SHARDS_DIR, `${letter}.json`), jsonStr);
    } catch {}
  }

  // Write index metadata
  const metadata = {
    totalWords: fullWordMap.size,
    letters: NEPALI_LETTERS,
    letterMap,
    letterCounts,
    generatedAt: new Date().toISOString()
  };
  fs.writeFileSync(path.resolve('public/dictionary/index.json'), JSON.stringify(metadata, null, 2));
  console.log('Wrote public/dictionary/index.json with letter counts:');
  console.log(letterCounts);

  console.log('--- Step 4: Generating src/lib/nepali-dictionary-seed.ts (Top 1,600 core offline words) ---');
  const seedWords = [];
  for (const letter of NEPALI_LETTERS) {
    const list = shards[letter] || [];
    const sorted = [...list].sort((a, b) => {
      const scoreA = (a.definitions.length * 2) + (a.examples.length * 3);
      const scoreB = (b.definitions.length * 2) + (b.examples.length * 3);
      return scoreB - scoreA;
    });
    seedWords.push(...sorted.slice(0, 35));
  }

  const seedContent = `/**
 * Complete Curated Core Seed Dictionary (1,600+ Words from Nepali Brihat Shabdakosh)
 * Covers all 49 letters from अ to ज्ञ with full definitions, Preeti keys, and examples.
 * 100% offline-ready immediately.
 */

export interface DictionaryEntry {
  id: string;
  word: string;
  preeti: string;
  preetiKeys: string;
  syllables: string;
  pos: string;
  etymology: string;
  definitions: string[];
  examples: string[];
  synonyms: string[];
  english?: string;
}

export const NEPALI_LETTERS = ${JSON.stringify(NEPALI_LETTERS, null, 2)} as const;
export type NepaliLetter = typeof NEPALI_LETTERS[number];

export const CORE_SEED_DICTIONARY: DictionaryEntry[] = ${JSON.stringify(seedWords, null, 2)};
`;

  fs.writeFileSync(path.resolve('src/lib/nepali-dictionary-seed.ts'), seedContent);
  console.log(`Generated src/lib/nepali-dictionary-seed.ts with ${seedWords.length} core offline words!`);
  console.log('Done building dictionary shards!');
}

run().catch(console.error);
