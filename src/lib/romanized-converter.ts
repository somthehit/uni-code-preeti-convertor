/**
 * Romanized Nepali Phonetic Transliteration Engine with Multi-Candidate Suggestions
 */

// Phonetic table for syllables and consonants
const ROMAN_VOWELS: Record<string, string> = {
  'a': 'अ',
  'aa': 'आ',
  'A': 'आ',
  'i': 'इ',
  'ee': 'ई',
  'I': 'ई',
  'u': 'उ',
  'oo': 'ऊ',
  'U': 'ऊ',
  'ri': 'ऋ',
  'e': 'ए',
  'ai': 'ऐ',
  'o': 'ओ',
  'au': 'औ',
  'am': 'अं',
  'an': 'अं',
};

const ROMAN_MATRAS: Record<string, string> = {
  'a': '',
  'aa': 'ा',
  'A': 'ा',
  'i': 'ि',
  'ee': 'ी',
  'I': 'ी',
  'u': 'ु',
  'oo': 'ू',
  'U': 'ू',
  'ri': 'ृ',
  'e': 'े',
  'ai': 'ै',
  'o': 'ो',
  'au': 'ौ',
};

const ROMAN_CONSONANTS: Record<string, string> = {
  'k': 'क',
  'kh': 'ख',
  'g': 'ग',
  'gh': 'घ',
  'ng': 'ङ',
  'ch': 'च',
  'chh': 'छ',
  'j': 'ज',
  'jh': 'झ',
  'T': 'ट',
  'Th': 'ठ',
  'D': 'ड',
  'Dh': 'ढ',
  'N': 'ण',
  't': 'त',
  'th': 'थ',
  'd': 'द',
  'dh': 'ध',
  'n': 'न',
  'p': 'प',
  'ph': 'फ',
  'f': 'फ',
  'b': 'ब',
  'bh': 'भ',
  'm': 'म',
  'y': 'य',
  'r': 'र',
  'l': 'ल',
  'w': 'व',
  'v': 'व',
  'sh': 'श',
  'Sh': 'ष',
  's': 'स',
  'h': 'ह',
  'ksh': 'क्ष',
  'tra': 'त्र',
  'gya': 'ज्ञ',
};

// Common word dictionary mappings for instant candidate suggestions
const COMMON_ROMAN_DICTIONARY: Record<string, string[]> = {
  'mero': ['मेरो', 'मेर', 'मेर्'],
  'desh': ['देश', 'देश्', 'देस'],
  'nepal': ['नेपाल', 'नेपालि', 'नेपाल्'],
  'nepali': ['नेपाली', 'नेपालि', 'नेपाल'],
  'namaste': ['नमस्ते', 'नमस्ते्', 'नमस्तेे'],
  'dhanyabad': ['धन्यवाद', 'धन्यवाद्'],
  'tapai': ['तपाईं', 'तपाइँ', 'तपाई'],
  'tapailai': ['तपाईंलाई', 'तपाइँलाई'],
  'timi': ['तिमी', 'तिमि'],
  'timilai': ['तिमीलाई', 'तिमििलाई'],
  'ma': ['म', 'मा'],
  'hami': ['हामी', 'हामि'],
  'hamro': ['हाम्रो', 'हाम्रो्'],
  'ghar': ['घर', 'घर्'],
  'pani': ['पानी', 'पनि'],
  'aaja': ['आज', 'आजा'],
  'bholi': ['भोलि', 'भोली'],
  'kitab': ['किताब', 'किताब्'],
  'ramro': ['राम्रो', 'राम्र'],
  'kasto': ['कस्तो', 'कस्त'],
  'chha': ['छ', 'छा'],
  'ho': ['हो', 'ह'],
  'haina': ['हैन', 'होइन'],
  'kina': ['किन', 'किना'],
  'kahile': ['कहिल्यै', 'कहिले'],
  'kahan': ['कहाँ', 'कहा'],
  'kati': ['कति', 'कती'],
  'ke': ['के', 'क'],
  'ko': ['को', 'क'],
  'lai': ['लाई', 'लाइ'],
  'le': ['ले', 'ल'],
  'bata': ['बाट', 'बत'],
  'sanga': ['सँग', 'सङ्ग'],
  'bhitra': ['भित्र', 'भित्र्'],
  'bahira': ['बाहिर', 'बाहिरा'],
  'sabai': ['सबै', 'सवै'],
  'dherai': ['धेरै', 'धेरे'],
  'kam': ['काम', 'कम'],
  'manis': ['मानिस', 'मानिस्'],
  'buddha': ['बुद्ध', 'बुद्द'],
  'sagarmatha': ['सगरमाथा', 'सगरमाथ'],
};

/**
 * Phonetic token transliteration
 */
export function transliterateRomanToken(word: string): string {
  if (!word) return '';

  // Check known dictionary first
  const lower = word.toLowerCase();
  if (COMMON_ROMAN_DICTIONARY[lower]) {
    return COMMON_ROMAN_DICTIONARY[lower][0];
  }

  let result = '';
  let i = 0;
  const len = word.length;

  while (i < len) {
    // Try 3-char consonants (e.g. ksh, chh, gya, tra)
    const c3 = word.slice(i, i + 3);
    const c2 = word.slice(i, i + 2);
    const c1 = word[i];

    let consonant = '';
    let consLen = 0;

    if (ROMAN_CONSONANTS[c3]) {
      consonant = ROMAN_CONSONANTS[c3];
      consLen = 3;
    } else if (ROMAN_CONSONANTS[c2]) {
      consonant = ROMAN_CONSONANTS[c2];
      consLen = 2;
    } else if (ROMAN_CONSONANTS[c1]) {
      consonant = ROMAN_CONSONANTS[c1];
      consLen = 1;
    }

    if (consonant) {
      i += consLen;

      // Check following vowel/matra
      const v2 = word.slice(i, i + 2);
      const v1 = word[i] || '';

      if (v2 && ROMAN_MATRAS[v2] !== undefined) {
        result += consonant + ROMAN_MATRAS[v2];
        i += 2;
      } else if (v1 && ROMAN_MATRAS[v1] !== undefined) {
        result += consonant + ROMAN_MATRAS[v1];
        i += 1;
      } else {
        // Consonant with no vowel = halanta if not end of word, or full letter if user typed just consonant
        if (i < len) {
          result += consonant + '्';
        } else {
          result += consonant;
        }
      }
      continue;
    }

    // Standalone vowel
    const sv2 = word.slice(i, i + 2);
    const sv1 = word[i];

    if (ROMAN_VOWELS[sv2]) {
      result += ROMAN_VOWELS[sv2];
      i += 2;
      continue;
    } else if (ROMAN_VOWELS[sv1]) {
      result += ROMAN_VOWELS[sv1];
      i += 1;
      continue;
    }

    // Any other character
    result += word[i];
    i++;
  }

  return result;
}

/**
 * Returns top 5 phonetic candidates for current active word
 */
export function getRomanCandidates(word: string): string[] {
  if (!word.trim()) return [];

  const lower = word.toLowerCase().trim();
  const directMatch = COMMON_ROMAN_DICTIONARY[lower];
  const phonetic = transliterateRomanToken(word);

  const candidates: string[] = [];
  if (directMatch) {
    candidates.push(...directMatch);
  }
  if (!candidates.includes(phonetic)) {
    candidates.push(phonetic);
  }

  // Variant without halanta or alternative matra if ending with 'i'
  if (lower.endsWith('i')) {
    const दीर्घVariant = phonetic.replace(/ि$/, 'ी');
    if (!candidates.includes(दीर्घVariant)) candidates.push(दीर्घVariant);
  } else if (lower.endsWith('u')) {
    const दीर्घUVariant = phonetic.replace(/ु$/, 'ू');
    if (!candidates.includes(दीर्घUVariant)) candidates.push(दीर्घUVariant);
  }

  // Ensure up to 5 unique candidates
  return Array.from(new Set(candidates)).slice(0, 5);
}

/**
 * Full text transliteration with {english} protection
 */
export function transliterateRomanizedText(text: string): string {
  if (!text) return '';

  // Protect {english} blocks
  const parts = text.split(/(\{.*?\}|\s+|[।,.\n\r\t])/);
  return parts
    .map((part) => {
      if (!part) return '';
      if (part.startsWith('{') && part.endsWith('}')) {
        return part.slice(1, -1);
      }
      if (/^[\s।,.\n\r\t]+$/.test(part)) {
        return part;
      }
      return transliterateRomanToken(part);
    })
    .join('');
}

export const ROMAN_KEY_TO_DEVANAGARI: Record<string, string> = {
  'k': 'क', 'K': 'ख', 'g': 'ग', 'G': 'घ', 'W': 'ङ',
  'c': 'च', 'C': 'छ', 'j': 'ज', 'J': 'झ', 'Y': 'ञ',
  'T': 'ट', 'V': 'ठ', 'D': 'ड', '+': 'ढ', 'N': 'ण',
  't': 'त', 'th': 'थ', 'd': 'द', 'dh': 'ध', 'n': 'न',
  'p': 'प', 'P': 'फ', 'b': 'ब', 'B': 'भ', 'm': 'म',
  'y': 'य', 'r': 'र', 'l': 'ल', 'w': 'व', 'v': 'व',
  's': 'स', 'S': 'श', 'z': 'ष', 'h': 'ह',
  'a': 'ा', 'A': 'आ', 'i': 'ि', 'I': 'ी',
  'u': 'ु', 'U': 'ू', 'e': 'े', 'E': 'ै',
  'o': 'ो', 'O': 'ौ', 'q': 'त्त', 'f': 'ँ', 'F': 'ं',
  'M': 'ं', 'H': 'ः', '\\': '्', '.': '।',
};

const ROMAN_CONSONANT_MAP: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 'T', 'ठ': 'Th', 'ड': 'D', 'ढ': 'Dh', 'ण': 'N',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'w',
  'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क्ष': 'ksh', 'त्र': 'tra', 'ज्ञ': 'gya', 'श्र': 'shra'
};

const ROMAN_VOWEL_MAP: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'am', 'अँ': 'an'
};

const ROMAN_MATRA_MAP: Record<string, string> = {
  'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', '्': ''
};

/**
 * Converts Unicode Devanagari text into natural QWERTY Romanized keystrokes
 * for the Typing Master and Arcade Games
 */
export function unicodeToRomanizedKeystrokes(text: string): string {
  if (!text) return '';
  const tokens = text.split(/(\s+|[।,.\n\r\t\-—!?\(\)])/);

  return tokens
    .map((token) => {
      if (!token) return '';
      if (/^\s+$/.test(token) || /^[।,.\n\r\t\-—!?\(\)]$/.test(token)) {
        return token === '।' ? '.' : token;
      }

      let out = '';
      let i = 0;
      const len = token.length;

      while (i < len) {
        // Check 2-char conjuncts
        const c2 = token.slice(i, i + 2);
        if (ROMAN_CONSONANT_MAP[c2]) {
          out += ROMAN_CONSONANT_MAP[c2];
          i += 2;
          continue;
        }

        const char = token[i];

        // Standalone vowel
        if (ROMAN_VOWEL_MAP[char]) {
          out += ROMAN_VOWEL_MAP[char];
          i++;
          continue;
        }

        // Consonant
        if (ROMAN_CONSONANT_MAP[char]) {
          out += ROMAN_CONSONANT_MAP[char];
          const nextChar = token[i + 1];

          if (nextChar && ROMAN_MATRA_MAP[nextChar] !== undefined) {
            out += ROMAN_MATRA_MAP[nextChar];
            i += 2;
            continue;
          } else if (nextChar && /[क-ह]/.test(nextChar)) {
            // If followed directly by another consonant without matra or halanta, insert short 'a'
            out += 'a';
            i++;
            continue;
          } else {
            i++;
            continue;
          }
        }

        // Matra alone
        if (ROMAN_MATRA_MAP[char] !== undefined) {
          out += ROMAN_MATRA_MAP[char];
          i++;
          continue;
        }

        // Digits or other characters
        const digitMap: Record<string, string> = {
          '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
          '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
        };
        out += digitMap[char] || char;
        i++;
      }

      return out;
    })
    .join('');
}

