/**
 * Bikram Sambat (BS) <-> Gregorian (AD) Date Converter (2000 BS to 2090 BS)
 * Official Government & Organization Letter Date Formatter
 */

import { unicodeToPreeti } from './preeti-converter';
import { englishToNepaliDigits } from './nepali-number-words';

export const NEPALI_MONTHS_UNICODE = [
  'बैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
  'कात्तिक', 'मंसिर', 'पुस', 'माघ', 'फागुन', 'चैत'
];

export const NEPALI_DAYS_UNICODE = [
  'आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'
];

// Number of days in each month of BS years from 2000 to 2090
export const BS_MONTH_DAYS: Record<number, number[]> = {
  2000: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2001: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2002: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2003: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2004: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2005: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2006: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2007: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2008: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2009: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2010: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2011: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2012: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2013: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2014: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2015: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2016: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2017: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2018: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2019: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2020: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2021: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2022: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2023: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2024: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2025: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2026: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2027: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2028: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2029: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
  2030: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2031: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2032: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2033: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2034: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2035: [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2036: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2037: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2038: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2039: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2040: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2041: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2042: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2043: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2044: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2045: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2046: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2047: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2048: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2049: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2050: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2051: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2052: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2053: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2054: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2055: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2056: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
  2057: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2058: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2059: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2060: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2061: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2062: [30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
  2063: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2064: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2065: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2066: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2067: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2068: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2069: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2070: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2071: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2072: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2074: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2082: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2084: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2085: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2086: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2087: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  2088: [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2089: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2090: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
};


const TOTAL_DAYS = 0;
const COMPLETED_DAYS = 1;
const EPOCH_YEAR = 2000;
const beginEnglish = { year: 1943, month: 3, date: 13, day: 3 };

const yearMonthDaysMapping: number[][] = Object.values(BS_MONTH_DAYS);
const monthDaysMappings: [number, number][][] = yearMonthDaysMapping.map((yearMappings) => {
  let daySum = 0;
  return yearMappings.map((monthDays) => {
    const m: [number, number] = [monthDays, daySum];
    daySum += monthDays;
    return m;
  });
});

let dPassed = 0;
const yearDaysMapping: [number, number][] = yearMonthDaysMapping.map((yearMappings) => {
  const daysInYear = yearMappings.reduce((a, b) => a + b, 0);
  const y: [number, number] = [daysInYear, dPassed];
  dPassed += daysInYear;
  return y;
});

function findPassedDays(year: number, monthIndex: number, date: number): number | null {
  const yearIndex = year - EPOCH_YEAR;
  if (yearIndex < 0 || yearIndex >= yearDaysMapping.length) return null;
  const pastYearDays = yearDaysMapping[yearIndex][COMPLETED_DAYS];
  const pastMonthDays = monthDaysMappings[yearIndex][monthIndex][COMPLETED_DAYS];
  return pastYearDays + pastMonthDays + date;
}

function mapDaysToDate(daysPassed: number): { year: number; month: number; day: number } | null {
  const yearIndex = yearDaysMapping.findIndex(
    (y) => daysPassed > y[COMPLETED_DAYS] && daysPassed <= y[COMPLETED_DAYS] + y[TOTAL_DAYS]
  );
  if (yearIndex === -1) return null;
  const monthRemainder = daysPassed - yearDaysMapping[yearIndex][COMPLETED_DAYS];
  const monthIndex = monthDaysMappings[yearIndex].findIndex(
    (m) => monthRemainder > m[COMPLETED_DAYS] && monthRemainder <= m[COMPLETED_DAYS] + m[TOTAL_DAYS]
  );
  if (monthIndex === -1) return null;
  const date = monthRemainder - monthDaysMappings[yearIndex][monthIndex][COMPLETED_DAYS];
  return { year: yearIndex + EPOCH_YEAR, month: monthIndex + 1, day: date };
}

function findPassedDaysAD(year: number, monthIndex: number, date: number): number {
  const timeDiff =
    Date.UTC(year, monthIndex, date) -
    Date.UTC(beginEnglish.year, beginEnglish.month, beginEnglish.date);
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

function mapDaysToDateAD(daysPassed: number): { year: number; month: number; day: number; dayOfWeek: number } {
  const mappedDate = new Date(Date.UTC(1943, 3, 13 + daysPassed));
  return {
    year: mappedDate.getUTCFullYear(),
    month: mappedDate.getUTCMonth() + 1,
    day: mappedDate.getUTCDate(),
    dayOfWeek: mappedDate.getUTCDay(),
  };
}

/**
 * Converts BS Date to AD Date
 */
export function bsToAd(year: number, month: number, day: number): { year: number; month: number; day: number; dayOfWeek: number } | null {
  if (year < 2000 || year > 2090 || month < 1 || month > 12) return null;
  const daysInMonth = BS_MONTH_DAYS[year]?.[month - 1];
  if (!daysInMonth || day < 1 || day > daysInMonth) return null;

  const passed = findPassedDays(year, month - 1, day);
  if (passed === null) return null;
  return mapDaysToDateAD(passed);
}

/**
 * Converts AD Date to BS Date
 */
export function adToBs(year: number, month: number, day: number): { year: number; month: number; day: number; dayOfWeek: number } | null {
  const passed = findPassedDaysAD(year, month - 1, day);
  const bs = mapDaysToDate(passed);
  if (!bs) return null;

  const targetDate = new Date(Date.UTC(year, month - 1, day));
  return {
    ...bs,
    dayOfWeek: targetDate.getUTCDay(),
  };
}

/**
 * Generates official Nepali Government/Cooperative letter date formats
 */
export function formatOfficialLetterDate(bsYear: number, bsMonth: number, bsDay: number, dayOfWeek: number) {
  const monthName = NEPALI_MONTHS_UNICODE[bsMonth - 1] || '';
  const dayName = NEPALI_DAYS_UNICODE[dayOfWeek] || '';

  const padMonth = String(bsMonth).padStart(2, '0');
  const padDay = String(bsDay).padStart(2, '0');

  // e.g. मिति: २०४९/०४/०६ (२०४९ साउन ६ गते मंगलबार)
  const nepYear = englishToNepaliDigits(String(bsYear));
  const nepMonth = englishToNepaliDigits(padMonth);
  const nepDay = englishToNepaliDigits(padDay);
  const nepDayPlain = englishToNepaliDigits(String(bsDay));

  const standardUnicode = `मिति: ${nepYear}/${nepMonth}/${nepDay}`;
  const fullUnicode = `मिति: ${nepYear}/${nepMonth}/${nepDay} (${nepYear} ${monthName} ${nepDayPlain} गते ${dayName})`;

  // Preeti formatting
  const standardPreeti = `ldltM ${unicodeToPreeti(nepYear)}÷${unicodeToPreeti(nepMonth)}÷${unicodeToPreeti(nepDay)}`;
  const fullPreeti = unicodeToPreeti(fullUnicode);

  return {
    standardUnicode,
    fullUnicode,
    standardPreeti,
    fullPreeti,
    monthName,
    dayName,
  };
}
