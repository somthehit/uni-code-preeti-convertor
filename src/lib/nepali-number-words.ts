/**
 * Nepali Digits & Currency-to-Words Converter for Banking, Cheques, Vouchers and Cooperatives
 * Supports:
 * - Full irregular 0-99 dictionary
 * - Scales: सय, हजार, लाख, करोड, अर्ब, खर्ब, नील, पद्म, शंख
 * - Lakh/Crore grouping (1,23,45,678.50)
 * - Cheque/Voucher Unicode text + Preeti conversion
 * - English Currency in Lakh/Crore numbering system
 */

import { unicodeToPreeti } from './preeti-converter';

export const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
export const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export const NEPALI_0_TO_99: string[] = [
  'शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ', 'दस',
  'एघार', 'बाह्र', 'तेह्र', 'चौध', 'पन्ध्र', 'सोह्र', 'सत्र', 'अठार', 'उन्नाइस', 'बीस',
  'एक्काइस', 'बाइस', 'तेइस', 'चौबिस', 'पच्चिस', 'छब्बीस', 'सत्ताइस', 'अठ्ठाइस', 'उनन्तिस', 'तीस',
  'एकत्तिस', 'बत्तिस', 'तेत्तिस', 'चौँतिस', 'पैँतिस', 'छत्तीस', 'सैँतिस', 'अठतीस', 'उनन्चालीस', 'चालीस',
  'एकचालीस', 'बयालीस', 'त्रिचालीस', 'चवालीस', 'पैँतालीस', 'छयालीस', 'सतचालीस', 'अठचालीस', 'उनन्पचास', 'पचास',
  'एकाउन्न', 'बाउन्न', 'त्रिपन्न', 'चउन्न', 'पचपन्न', 'छपन्न', 'सन्ताउन्न', 'अन्ठाउन्न', 'उनन्साठी', 'साठी',
  'एकसट्ठी', 'बासट्ठी', 'त्रिसट्ठी', 'चौँसट्ठी', 'पैँसट्ठी', 'छयसट्ठी', 'सतसट्ठी', 'अठसट्ठी', 'उनन्सत्तरी', 'सत्तरी',
  'एकहत्तर', 'बहत्तर', 'त्रिहत्तर', 'चौहत्तर', 'पचहत्तर', 'छयहत्तर', 'सतहत्तर', 'अठहत्तर', 'उनासी', 'असी',
  'एकासी', 'बयासी', 'त्रियासी', 'चौरासी', 'पचासी', 'छयासी', 'सतासी', 'अठासी', 'उनान्नब्बे', 'नब्बे',
  'एकान्नब्बे', 'बयानब्बे', 'त्रियान्नब्बे', 'चौरान्नब्बे', 'पञ्चान्नब्बे', 'छयान्नब्बे', 'सन्तानब्बे', 'अन्ठान्नब्बे', 'उनान्सय'
];

export const ENGLISH_0_TO_19 = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
];

export const ENGLISH_TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

export function toEnglishUnderHundred(n: number): string {
  if (n < 20) return ENGLISH_0_TO_19[n];
  const ten = Math.floor(n / 10);
  const rem = n % 10;
  return rem === 0 ? ENGLISH_TENS[ten] : `${ENGLISH_TENS[ten]}-${ENGLISH_0_TO_19[rem]}`;
}

export function toEnglishUnderThousand(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rem = n % 100;
  let str = '';
  if (hundreds > 0) {
    str += `${ENGLISH_0_TO_19[hundreds]} Hundred`;
    if (rem > 0) str += ' ';
  }
  if (rem > 0) {
    str += toEnglishUnderHundred(rem);
  }
  return str;
}

/**
 * Converts English digits in a string to Nepali digits
 */
export function englishToNepaliDigits(str: string): string {
  return str.replace(/[0-9]/g, (d) => NEPALI_DIGITS[parseInt(d, 10)]);
}

/**
 * Converts Nepali digits in a string to English digits
 */
export function nepaliToEnglishDigits(str: string): string {
  return str.replace(/[०-९]/g, (d) => {
    const idx = NEPALI_DIGITS.indexOf(d);
    return idx >= 0 ? ENGLISH_DIGITS[idx] : d;
  });
}

/**
 * Formats a number with South Asian (Lakh/Crore) commas (e.g. 1,23,45,678.50)
 */
export function formatLakhCrore(value: string | number, nepaliDigits: boolean = false): string {
  const clean = String(value).trim().replace(/,/g, '');
  const engVal = nepaliToEnglishDigits(clean);
  const parts = engVal.split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? parts[1] : null;

  if (!/^-?\d+$/.test(integerPart)) return String(value);

  const isNeg = integerPart.startsWith('-');
  const absInt = isNeg ? integerPart.slice(1) : integerPart;

  let formatted = '';
  if (absInt.length <= 3) {
    formatted = absInt;
  } else {
    const last3 = absInt.slice(-3);
    const rest = absInt.slice(0, -3);
    const groups: string[] = [];
    let cur = rest;
    while (cur.length > 2) {
      groups.unshift(cur.slice(-2));
      cur = cur.slice(0, -2);
    }
    if (cur.length > 0) {
      groups.unshift(cur);
    }
    formatted = groups.join(',') + ',' + last3;
  }

  if (isNeg) formatted = '-' + formatted;
  if (decimalPart !== null) formatted += '.' + decimalPart;

  return nepaliDigits ? englishToNepaliDigits(formatted) : formatted;
}

/**
 * Converts any number string (up to Shankha) to Nepali words
 */
export function numberToNepaliWords(numStr: string): string {
  const clean = nepaliToEnglishDigits(numStr.trim().replace(/,/g, ''));
  const parts = clean.split('.');
  let intStr = parts[0].replace(/^0+/, '');
  if (!intStr) intStr = '0';
  const decStr = parts.length > 1 ? parts[1].slice(0, 2) : '';

  if (intStr === '0' && (!decStr || parseInt(decStr, 10) === 0)) {
    return 'शून्य रुपैयाँ मात्र /-';
  }

  // Scales breakdown (from right to left)
  // units (3 digits: hundreds & tens)
  // thousands (2 digits)
  // lakhs (2 digits)
  // crores (2 digits)
  // arabs (2 digits)
  // kharabs (2 digits)
  // neels (2 digits)
  // padmas (2 digits)
  // shankhas (2 digits)

  const scales = [
    { label: '', size: 3 },
    { label: 'हजार', size: 2 },
    { label: 'लाख', size: 2 },
    { label: 'करोड', size: 2 },
    { label: 'अर्ब', size: 2 },
    { label: 'खर्ब', size: 2 },
    { label: 'नील', size: 2 },
    { label: 'पद्म', size: 2 },
    { label: 'शंख', size: 2 },
  ];

  const tokens: string[] = [];
  let remaining = intStr;

  for (let i = 0; i < scales.length && remaining.length > 0; i++) {
    const scale = scales[i];
    const take = Math.min(remaining.length, scale.size);
    const chunkStr = remaining.slice(-take);
    remaining = remaining.slice(0, -take);
    const chunkNum = parseInt(chunkStr, 10);

    if (chunkNum > 0) {
      let chunkWord = '';
      if (i === 0) {
        // under 1000
        const hundreds = Math.floor(chunkNum / 100);
        const rem = chunkNum % 100;
        if (hundreds > 0) {
          chunkWord += `${NEPALI_0_TO_99[hundreds]} सय`;
          if (rem > 0) chunkWord += ' ';
        }
        if (rem > 0) {
          chunkWord += NEPALI_0_TO_99[rem];
        }
      } else {
        chunkWord = `${NEPALI_0_TO_99[chunkNum]} ${scale.label}`;
      }
      tokens.unshift(chunkWord.trim());
    }
  }

  const integerWords = tokens.join(' ').trim();
  let result = integerWords ? `${integerWords} रुपैयाँ` : '';

  if (decStr && parseInt(decStr, 10) > 0) {
    const paisaNum = parseInt(decStr.padEnd(2, '0'), 10);
    const paisaWord = NEPALI_0_TO_99[paisaNum];
    if (result) {
      result += ` र ${paisaWord} पैसा मात्र /-`;
    } else {
      result = `${paisaWord} पैसा मात्र /-`;
    }
  } else {
    result += ' मात्र /-';
  }

  return result;
}

/**
 * Converts number to English Currency Words (Lakh / Crore System)
 */
export function numberToEnglishWords(numStr: string): string {
  const clean = nepaliToEnglishDigits(numStr.trim().replace(/,/g, ''));
  const parts = clean.split('.');
  let intStr = parts[0].replace(/^0+/, '');
  if (!intStr) intStr = '0';
  const decStr = parts.length > 1 ? parts[1].slice(0, 2) : '';

  if (intStr === '0' && (!decStr || parseInt(decStr, 10) === 0)) {
    return 'Rupees Zero Only';
  }

  const scales = [
    { label: '', size: 3 },
    { label: 'Thousand', size: 2 },
    { label: 'Lakh', size: 2 },
    { label: 'Crore', size: 2 },
    { label: 'Arab', size: 2 },
    { label: 'Kharab', size: 2 },
  ];

  const tokens: string[] = [];
  let remaining = intStr;

  for (let i = 0; i < scales.length && remaining.length > 0; i++) {
    const scale = scales[i];
    const take = Math.min(remaining.length, scale.size);
    const chunkStr = remaining.slice(-take);
    remaining = remaining.slice(0, -take);
    const chunkNum = parseInt(chunkStr, 10);

    if (chunkNum > 0) {
      const chunkWord = i === 0 ? toEnglishUnderThousand(chunkNum) : `${toEnglishUnderHundred(chunkNum)} ${scale.label}`;
      tokens.unshift(chunkWord.trim());
    }
  }

  let result = 'Rupees ' + tokens.join(' ').trim();

  if (decStr && parseInt(decStr, 10) > 0) {
    const paisaNum = parseInt(decStr.padEnd(2, '0'), 10);
    const paisaWord = toEnglishUnderHundred(paisaNum);
    result += ` and ${paisaWord} Paisa Only`;
  } else {
    result += ' Only';
  }

  return result;
}

/**
 * Full details bundle for banking/vouchers
 */
export function convertCurrencyBundle(numInput: string) {
  const nepaliWords = numberToNepaliWords(numInput);
  const preetiWords = unicodeToPreeti(nepaliWords);
  const englishWords = numberToEnglishWords(numInput);
  const formattedNepali = formatLakhCrore(numInput, true);
  const formattedEnglish = formatLakhCrore(numInput, false);

  return {
    nepaliWords,
    preetiWords,
    englishWords,
    formattedNepali,
    formattedEnglish,
  };
}

