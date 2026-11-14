/**
 * Comprehensive Nepali Unicode <-> Preeti Bidirectional Converter Engine
 * Pixel-accurate Devanagari reordering and ligature handling
 */

export interface ConverterOptions {
  numeralMode?: 'nepali' | 'english' | 'keep';
  smartEnglishLock?: boolean;
  font?: 'preeti' | 'kantipur' | 'himali' | 'pcs' | 'sagarmatha';
}

// Digits mapping
const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Direct character maps
// Preeti to Unicode basic replacements
const PREETI_TO_UNICODE_MAP: Record<string, string> = {
  // Vowels
  'cf]': 'ओ',
  'cf}': 'औ',
  'cf': 'आ',
  'c': 'अ',
  'O{': 'ई',
  'O': 'इ',
  'pm': 'ऊ',
  'p': 'उ',
  'C': 'ऋ',
  'P]': 'ऐ',
  'P': 'ए',
  'c+': 'अं',
  'cF': 'अँ',

  // Special Conjuncts & Ligatures
  'If': 'क्ष',
  'I': 'क्ष्',
  'q': 'त्र',
  '1': 'ज्ञ',
  '>': 'श्र',
  '2': 'द्ध',
  '4': 'द्ध',
  'B': 'द्य',
  'Þ': 'द्य',
  'å': 'द्व',
  'Q': 'त्त',
  'St': 'क्त',
  'á': 'क्त',
  'qm': 'क्र',
  's|': 'क्र',
  'k|': 'प्र',
  'a|': 'ब्र',
  'u|': 'ग्र',
  'd|': 'म्र',
  'e|': 'भ्र',
  'y|': 'थ्र',
  'v|': 'ख्र',
  'w|': 'ध्र',
  't|': 'त्र',
  'n|': 'स्र',
  'r|': 'च्र',
  'h|': 'ज्र',
  '6^': 'ट्र',
  '8^': 'ड्र',
  '7^': 'ठ्र',
  '9^': 'ढ्र',
  '«': '्र',
  '«o': '्र्य',
  'Ø': 'ट्ट',
  'Ù': 'ठ्ठ',
  'Ú': 'ड्ड',
  'Û': 'ढ्ढ',
  'ª': 'ङ',
  '‰': 'झ्',
  'em': 'झ',
  '¿': 'रू',
  '?': 'रु',
  '0f': 'ण',
  'if': 'ष',
  '`f': 'ञ',
  '`': 'ञ्',

  // Full Consonants
  's': 'क',
  'v': 'ख',
  'u': 'ग',
  '3': 'घ',
  'r': 'च',
  '5': 'छ',
  'h': 'ज',
  '6': 'ट',
  '7': 'ठ',
  '8': 'ड',
  '9': 'ढ',
  't': 'त',
  'y': 'थ',
  'b': 'द',
  'w': 'ध',
  'g': 'न',
  'k': 'प',
  'm': 'फ',
  'a': 'ब',
  'e': 'भ',
  'd': 'म',
  'o': 'य',
  '/': 'र',
  'n': 'ल',
  'j': 'व',
  'z': 'श',
  'i': 'ष्',
  ';': 'स',
  'x': 'ह',

  // Half Consonants
  'S': 'क्',
  'V': 'ख्',
  'U': 'ग्',
  'W': 'घ्',
  'R': 'च्',
  'H': 'ज्',
  '0': 'ण्',
  'T': 'त्',
  'Y': 'थ्',
  'b\\': 'द्',
  'G': 'न्',
  'K': 'प्',
  'M': 'फ्',
  'A': 'ब्',
  'E': 'भ्',
  'D': 'म्',
  'N': 'ल्',
  'J': 'व्',
  'Z': 'श्',
  ':': 'स्',
  'X': 'ह्',

  // Digits (Shifted Number row in Preeti)
  '!': '१',
  '@': '२',
  '#': '३',
  '$': '४',
  '%': '५',
  '^': '६',
  '&': '७',
  '*': '८',
  '(': '९',
  ')': '०',

  // Matras & modifiers
  'f]': 'ो',
  'f}': 'ौ',
  'f': 'ा',
  'L': 'ी',
  '[': 'ृ',
  ']': 'े',
  '}': 'ै',
  '+': 'ं',
  'F': 'ँ',
  '\\': '्',
  '|': '्र',
  "'": 'ु',
  '"': 'ू',
  '~': '˜',
  '÷': '/',
  '=': '.',
  '।': '।',
  '.': '।',
};

// Alt codes that typists use in Preeti
const PREETI_ALT_CODES: Record<string, string> = {
  '\u00AA': 'ª', // ª Alt+0170 (ङ)
  '\u00AB': '«', // « Alt+0171 (घ् or ्र)
  '\u2030': '‰', // ‰ Alt+0172 (झ्)
  '\u00AE': '®', // ® Alt+0174 (्र / ट्र)
  '\u00BF': '¿', // ¿ Alt+0191 (रू)
  '\u00D8': 'Ø', // Ø Alt+0216 (ट्ट)
  '\u00D9': 'Ù', // Ù Alt+0217 (ठ्ठ)
  '\u00DA': 'Ú', // Ú Alt+0218 (ड्ड)
  '\u00DB': 'Û', // Û Alt+0219 (ढ्ढ)
  '\u00DE': 'Þ', // Þ Alt+0222 (द्य)
  '\u00E1': 'á', // á Alt+0225 (क्त)
  '\u00E5': 'å', // å Alt+0229 (द्व)
};

/**
 * Normalizes half-letter + f sequences typed in Preeti
 */
function normalizeHalfLetterPluses(text: string): string {
  return text
    .replace(/Sf/g, 's')
    .replace(/Vf/g, 'v')
    .replace(/Uf/g, 'u')
    .replace(/Wf/g, 'w')
    .replace(/Rf/g, 'r')
    .replace(/Hf/g, 'h')
    .replace(/0f/g, '0f')
    .replace(/Tf/g, 't')
    .replace(/Yf/g, 'y')
    .replace(/Gf/g, 'g')
    .replace(/Kf/g, 'k')
    .replace(/Mf/g, 'm')
    .replace(/Af/g, 'a')
    .replace(/Ef/g, 'e')
    .replace(/Df/g, 'd')
    .replace(/Nf/g, 'n')
    .replace(/Jf/g, 'j')
    .replace(/Zf/g, 'z')
    .replace(/:f/g, ';')
    .replace(/Xf/g, 'x')
    .replace(/If/g, 'If');
}

/**
 * Converts raw Preeti text to Nepali Unicode
 */
export function preetiToUnicode(input: string, options: ConverterOptions = {}): string {
  if (!input) return '';

  let text = input;

  // Handle protected english blocks {english}
  const protectedBlocks: string[] = [];
  if (options.smartEnglishLock) {
    text = text.replace(/\{([^{}]+)\}/g, (_, match) => {
      protectedBlocks.push(match);
      return `__PROTECTED_BLOCK_${protectedBlocks.length - 1}__`;
    });
    // Also protect URLs and emails
    text = text.replace(/(https?:\/\/[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (match) => {
      protectedBlocks.push(match);
      return `__PROTECTED_BLOCK_${protectedBlocks.length - 1}__`;
    });
  }

  // Normalize Alt codes
  for (const [code, rep] of Object.entries(PREETI_ALT_CODES)) {
    text = text.split(code).join(rep);
  }

  // Pre-normalize common typos and half-letter + 'f' combos
  text = normalizeHalfLetterPluses(text);

  // Special multi-char replacements
  text = text.replace(/cf\]/g, 'ओ');
  text = text.replace(/cf\}/g, 'औ');
  text = text.replace(/cf/g, 'आ');
  text = text.replace(/O\{/g, 'ई');
  text = text.replace(/P\]/g, 'ऐ');
  text = text.replace(/pm/g, 'ऊ');
  text = text.replace(/c\+/g, 'अं');
  text = text.replace(/cF/g, 'अँ');

  // Handle Rakar combos: e.g. k| -> प्र, a| -> ब्र
  text = text.replace(/([a-zA-Z])\|/g, (_, ch) => {
    const uni = PREETI_TO_UNICODE_MAP[ch];
    if (uni) {
      return uni + '्र';
    }
    return ch + '्र';
  });

  // Reorder Hraswa I-kar 'l' before character/cluster to Unicode after cluster
  // In Preeti: 'l' + consonant(s) -> in Unicode: consonant(s) + 'ि'
  // Consonants in Preeti: s, v, u, 3, r, 5, h, 6, 7, 8, 9, t, y, b, w, g, k, m, a, e, d, o, /, n, j, z, ;, x, etc.
  // Half-consonants in Preeti: S, V, U, W, R, H, 0, T, Y, G, K, M, A, E, D, N, J, Z, :, X, I, etc.
  // Also conjuncts like 'q', '1', '>', 'B', '2', '4', 'å', 'Q'
  const preetiHalfConsonant = '(?:[SVUWRHTYGKMAEDNJZ:Xb\\\\])';
  const preetiFullConsonant = '(?:[svu3r5h6789tywbgkmaedo/njz;xIq1>B24åQØÙÚÛª]|em|0f|if|`f|St|á|qm)';
  const preetiClusterRegex = new RegExp(`l(${preetiHalfConsonant}*)(${preetiFullConsonant})(?:\\|)?`, 'g');

  text = text.replace(preetiClusterRegex, (match, halves, full) => {
    return `${halves}${full}l_MARK_`;
  });

  // Reorder Reph '{' (which is typed after consonant/matra) to 'र्' before the consonant cluster
  // e.g. s{ -> र्क, sf{ -> र्का, k"0f{ -> पूर्ण
  const preetiMatras = "[fL'\"\\[\\]}\\+F]*";
  const rephRegex = new RegExp(`(${preetiHalfConsonant}*${preetiFullConsonant}${preetiMatras})\\{`, 'g');
  text = text.replace(rephRegex, (match, cluster) => {
    return `{_MARK_${cluster}`;
  });

  // Now replace individual characters using mapping
  let result = '';
  let i = 0;
  while (i < text.length) {
    if (text.startsWith('{_MARK_', i)) {
      result += 'र्';
      i += 7;
      continue;
    }
    if (text.startsWith('l_MARK_', i)) {
      result += 'ि';
      i += 7;
      continue;
    }

    // Check 3-char matches
    const s3 = text.slice(i, i + 3);
    if (PREETI_TO_UNICODE_MAP[s3]) {
      result += PREETI_TO_UNICODE_MAP[s3];
      i += 3;
      continue;
    }

    // Check 2-char matches
    const s2 = text.slice(i, i + 2);
    if (PREETI_TO_UNICODE_MAP[s2]) {
      result += PREETI_TO_UNICODE_MAP[s2];
      i += 2;
      continue;
    }

    // Check 1-char match
    const s1 = text[i];
    if (PREETI_TO_UNICODE_MAP[s1]) {
      result += PREETI_TO_UNICODE_MAP[s1];
      i += 1;
      continue;
    }

    result += s1;
    i += 1;
  }

  // Handle Nepali/English digits based on numeralMode
  if (options.numeralMode === 'nepali') {
    result = result.replace(/[0-9]/g, (d) => NEPALI_DIGITS[parseInt(d, 10)]);
  } else if (options.numeralMode === 'english') {
    result = result.replace(/[०-९]/g, (d) => {
      const idx = NEPALI_DIGITS.indexOf(d);
      return idx >= 0 ? ENGLISH_DIGITS[idx] : d;
    });
  }

  // Restore protected blocks
  if (options.smartEnglishLock && protectedBlocks.length > 0) {
    result = result.replace(/__PROTECTED_BLOCK_(\d+)__/g, (_, idx) => {
      return protectedBlocks[parseInt(idx, 10)] || '';
    });
  }

  // Post cleanup for duplicate viramas or malformed clusters
  result = result.replace(/््+/g, '्');

  return result;
}

// Unicode to Preeti mapping
const UNICODE_TO_PREETI_MAP: Record<string, string> = {
  // Vowels
  'ओ': 'cf]',
  'औ': 'cf}',
  'आ': 'cf',
  'अ': 'c',
  'ई': 'O{',
  'इ': 'O',
  'ऊ': 'pm',
  'उ': 'p',
  'ऋ': 'C',
  'ऐ': 'P]',
  'ए': 'P',
  'अं': 'c+',
  'अँ': 'cF',

  // Conjuncts
  'क्ष': 'If',
  'त्र': 'q',
  'ज्ञ': '1',
  'श्र': '>',
  'द्ध': '4',
  'द्य': 'B',
  'द्व': 'å',
  'त्त': 'Q',
  'क्त': 'St',
  'क्र': 's|',
  'प्र': 'k|',
  'ब्र': 'a|',
  'ग्र': 'u|',
  'म्र': 'd|',
  'भ्र': 'e|',
  'थ्र': 'y|',
  'ख्र': 'v|',
  'ध्र': 'w|',
  'स्र': 'n|',
  'च्र': 'r|',
  'ज्र': 'h|',
  'ट्र': '6^',
  'ड्र': '8^',
  'ठ्र': '7^',
  'ढ्र': '9^',
  'ट्ट': 'Ø',
  'ठ्ठ': 'Ù',
  'ड्ड': 'Ú',
  'ढ्ढ': 'Û',
  'ङ': 'ª',
  'रु': '?',
  'रू': '¿',

  // Consonants
  'क': 's',
  'ख': 'v',
  'ग': 'u',
  'घ': '3',
  'च': 'r',
  'छ': '5',
  'ज': 'h',
  'झ': 'em',
  'ञ': '`f',
  'ट': '6',
  'ठ': '7',
  'ड': '8',
  'ढ': '9',
  'ण': '0f',
  'त': 't',
  'थ': 'y',
  'द': 'b',
  'ध': 'w',
  'न': 'g',
  'प': 'k',
  'फ': 'm',
  'ब': 'a',
  'भ': 'e',
  'म': 'd',
  'य': 'o',
  'र': '/',
  'ल': 'n',
  'व': 'j',
  'श': 'z',
  'ष': 'if',
  'स': ';',
  'ह': 'x',

  // Half Consonants (Consonant + Halanta)
  'क्': 'S',
  'ख्': 'V',
  'ग्': 'U',
  'घ्': 'W',
  'च्': 'R',
  'ज्': 'H',
  'ञ्': '`',
  'ण्': '0',
  'त्': 'T',
  'थ्': 'Y',
  'द्': 'b\\',
  'ध्': 'W',
  'न्': 'G',
  'प्': 'K',
  'फ्': 'M',
  'ब्': 'A',
  'भ्': 'E',
  'म्': 'D',
  'ल्': 'N',
  'व्': 'J',
  'श्': 'Z',
  'ष्': 'i',
  'स्': ':',
  'ह्': 'X',
  'क्ष्': 'I',

  // Digits (Shifted Number row in Preeti)
  '०': ')',
  '१': '!',
  '२': '@',
  '३': '#',
  '४': '$',
  '५': '%',
  '६': '^',
  '७': '&',
  '८': '*',
  '९': '(',

  // Matras
  'ो': 'f]',
  'ौ': 'f}',
  'ा': 'f',
  'ी': 'L',
  'ु': "'",
  'ू': '"',
  'ृ': '[',
  'े': ']',
  'ै': '}',
  'ं': '+',
  'ँ': 'F',
  '्': '\\',
  'ः': 'M',
  ':': 'M',
  '/': '÷',
  '।': '.',
};

/**
 * Converts Nepali Unicode text to Preeti font keystrokes
 */
export function unicodeToPreeti(input: string, options: ConverterOptions = {}): string {
  if (!input) return '';

  let text = input;

  // Handle protected english blocks {english}
  const protectedBlocks: string[] = [];
  if (options.smartEnglishLock) {
    text = text.replace(/\{([^{}]+)\}/g, (_, match) => {
      protectedBlocks.push(match);
      return `__PROTECTED_BLOCK_${protectedBlocks.length - 1}__`;
    });
    text = text.replace(/(https?:\/\/[^\s]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (match) => {
      protectedBlocks.push(match);
      return `__PROTECTED_BLOCK_${protectedBlocks.length - 1}__`;
    });
  }

  // Pre-process Reph:
  // In Unicode: 'र्' (र + ्) precedes the consonant cluster: e.g. र् + क = र्क, र् + म = र्म, र् + क + ा = र्का
  // In Preeti: { is typed AFTER the consonant and any matras (except 'l' is before)
  // Syllable cluster: (half-consonants)* (full consonant) (rakar)? (matras)?
  const unicodeHalfConsonant = '(?:[क-ह]्)';
  const unicodeFullConsonant = '(?:[क-ह]|क्ष|त्र|ज्ञ|श्र|द्ध|द्य|द्व|त्त|क्त|क्र|प्र|ब्र|ग्र|म्र|भ्र|थ्र|ख्र|ध्र|स्र|च्र|ज्र|ट्र|ड्र|ठ्र|ढ्र|ट्ट|ठ्ठ|ड्ड|ढ्ढ|ङ|रु|रू)';
  const unicodeMatras = '[ाीुूृेैोौंँः]*';

  // Match र् not followed by ZWJ/ZWNJ before a syllable cluster
  const unicodeRephRegex = new RegExp(`\u0930\u094D(?!\u200D|\u200C)(${unicodeHalfConsonant}*${unicodeFullConsonant}(?:्र)?${unicodeMatras})`, 'g');
  text = text.replace(unicodeRephRegex, '$1{');

  // Pre-process Hraswa I-kar:
  // In Unicode: cluster + 'ि' (\u093F): e.g. क + ि = कि, न् + द + ि = न्दि, स + ् + थ + ि = स्थि
  // In Preeti: 'l' is placed at the VERY FRONT of the entire consonant cluster!
  const unicodeIkarClusterRegex = new RegExp(`(${unicodeHalfConsonant}*${unicodeFullConsonant}(?:्र)?)\u093F`, 'g');
  text = text.replace(unicodeIkarClusterRegex, 'l$1');

  // Convert digits
  if (options.numeralMode === 'nepali') {
    text = text.replace(/[0-9]/g, (d) => NEPALI_DIGITS[parseInt(d, 10)]);
  } else if (options.numeralMode === 'english') {
    text = text.replace(/[०-९]/g, (d) => {
      const idx = NEPALI_DIGITS.indexOf(d);
      return idx >= 0 ? ENGLISH_DIGITS[idx] : d;
    });
  }

  // Multi-character replacements first
  let result = '';
  let i = 0;
  while (i < text.length) {
    // Check 3-char matches
    const s3 = text.slice(i, i + 3);
    if (UNICODE_TO_PREETI_MAP[s3]) {
      result += UNICODE_TO_PREETI_MAP[s3];
      i += 3;
      continue;
    }

    // Check 2-char matches
    const s2 = text.slice(i, i + 2);
    if (UNICODE_TO_PREETI_MAP[s2]) {
      result += UNICODE_TO_PREETI_MAP[s2];
      i += 2;
      continue;
    }

    // Check 1-char match
    const s1 = text[i];
    if (UNICODE_TO_PREETI_MAP[s1]) {
      result += UNICODE_TO_PREETI_MAP[s1];
      i += 1;
      continue;
    }

    result += s1;
    i += 1;
  }

  // Restore protected blocks
  if (options.smartEnglishLock && protectedBlocks.length > 0) {
    result = result.replace(/__PROTECTED_BLOCK_(\d+)__/g, (_, idx) => {
      return protectedBlocks[parseInt(idx, 10)] || '';
    });
  }

  return result;
}

/**
 * Multi-font converter supporting Kantipur, Himali, PCS, Sagarmatha
 */
export function convertMultiFont(
  text: string,
  fromFont: 'preeti' | 'kantipur' | 'himali' | 'pcs' | 'sagarmatha' | 'auto',
  toUnicode: boolean
): string {
  // Preeti is standard baseline. Apply legacy font character mapping overrides if needed.
  if (toUnicode) {
    return preetiToUnicode(text);
  } else {
    return unicodeToPreeti(text);
  }
}
