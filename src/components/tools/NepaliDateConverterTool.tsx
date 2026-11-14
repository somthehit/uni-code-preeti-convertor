'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  bsToAd,
  adToBs,
  formatOfficialLetterDate,
  NEPALI_MONTHS_UNICODE,
  NEPALI_DAYS_UNICODE,
  BS_MONTH_DAYS,
} from '@/lib/nepali-date-converter';
import { Copy, Check, Calendar, ArrowLeftRight, Clock } from 'lucide-react';

const ENGLISH_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const ENGLISH_DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export const NepaliDateConverterTool: React.FC = () => {
  const [mode, setMode] = useState<'bs2ad' | 'ad2bs'>('bs2ad');

  // Default to today
  const [bsYear, setBsYear] = useState<number>(2083);
  const [bsMonth, setBsMonth] = useState<number>(7);
  const [bsDay, setBsDay] = useState<number>(28);

  const [adYear, setAdYear] = useState<number>(2026);
  const [adMonth, setAdMonth] = useState<number>(11);
  const [adDay, setAdDay] = useState<number>(14);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Initialize with today's date
  useEffect(() => {
    const today = new Date();
    const curAdY = today.getFullYear();
    const curAdM = today.getMonth() + 1;
    const curAdD = today.getDate();

    setAdYear(curAdY);
    setAdMonth(curAdM);
    setAdDay(curAdD);

    const bs = adToBs(curAdY, curAdM, curAdD);
    if (bs) {
      setBsYear(bs.year);
      setBsMonth(bs.month);
      setBsDay(bs.day);
    }
  }, []);

  // Conversion calculations
  const conversionResult = useMemo(() => {
    if (mode === 'bs2ad') {
      const ad = bsToAd(bsYear, bsMonth, bsDay);
      if (!ad) return null;
      const letter = formatOfficialLetterDate(bsYear, bsMonth, bsDay, ad.dayOfWeek);

      const padM = String(ad.month).padStart(2, '0');
      const padD = String(ad.day).padStart(2, '0');
      const iso = `${ad.year}-${padM}-${padD}`;
      const slash = `${ad.year}/${padM}/${padD}`;
      const longFormat = `${ENGLISH_DAYS[ad.dayOfWeek]}, ${ad.day} ${ENGLISH_MONTHS[ad.month - 1]} ${ad.year}`;
      const usFormat = `${ENGLISH_MONTHS[ad.month - 1]} ${ad.day}, ${ad.year}`;

      return {
        mode: 'bs2ad' as const,
        adIso: iso,
        adSlash: slash,
        adLong: longFormat,
        adUs: usFormat,
        dayOfWeek: ad.dayOfWeek,
        dayNameEn: ENGLISH_DAYS[ad.dayOfWeek],
        dayNameNp: NEPALI_DAYS_UNICODE[ad.dayOfWeek],
        letter,
      };
    } else {
      const bs = adToBs(adYear, adMonth, adDay);
      if (!bs) return null;
      const letter = formatOfficialLetterDate(bs.year, bs.month, bs.day, bs.dayOfWeek);

      const padM = String(adMonth).padStart(2, '0');
      const padD = String(adDay).padStart(2, '0');
      const sourceAdIso = `${adYear}-${padM}-${padD}`;
      const sourceAdLong = `${ENGLISH_DAYS[bs.dayOfWeek]}, ${adDay} ${ENGLISH_MONTHS[adMonth - 1]} ${adYear}`;

      return {
        mode: 'ad2bs' as const,
        bsYear: bs.year,
        bsMonth: bs.month,
        bsDay: bs.day,
        sourceAdIso,
        sourceAdLong,
        dayOfWeek: bs.dayOfWeek,
        dayNameEn: ENGLISH_DAYS[bs.dayOfWeek],
        dayNameNp: NEPALI_DAYS_UNICODE[bs.dayOfWeek],
        letter,
      };
    }
  }, [mode, bsYear, bsMonth, bsDay, adYear, adMonth, adDay]);

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const daysInCurrentBsMonth = BS_MONTH_DAYS[bsYear] ? BS_MONTH_DAYS[bsYear][bsMonth - 1] : 30;

  return (
    <div className="w-full flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            📅
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800">
              नेपाली मिति रूपान्तरण (Bikram Sambat ↔ AD)
            </h2>
            <p className="text-xs text-slate-500">
              वि.सं. २००० देखि २०९० सम्मको आधिकारिक मिति रूपान्तरण र सरकारी पत्र ढाँचा
            </p>
          </div>
        </div>

        {/* Direction Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
          <button
            type="button"
            onClick={() => setMode('bs2ad')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              mode === 'bs2ad' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            BS → AD (वि.सं. बाट ई.सं.)
          </button>
          <button
            type="button"
            onClick={() => setMode('ad2bs')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              mode === 'ad2bs' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AD → BS (ई.सं. बाट वि.सं.)
          </button>
        </div>
      </div>

      {/* Date Input Pickers */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            {mode === 'bs2ad' ? 'नेपाली मिति छान्नुहोस् (Bikram Sambat BS):' : 'Gregorian मिति छान्नुहोस् (AD Date):'}
          </span>
          <span className="text-[11px] font-semibold text-slate-400">
            {mode === 'bs2ad' ? 'वि.सं. २००० देखि २०९०' : '1943 to 2034 AD'}
          </span>
        </div>

        {mode === 'bs2ad' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Year */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">वर्ष (Year):</label>
              <select
                value={bsYear}
                onChange={(e) => setBsYear(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
              >
                {Array.from({ length: 91 }, (_, i) => 2000 + i).map((y) => (
                  <option key={y} value={y}>
                    {y} वि.सं.
                  </option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">महिना (Month):</label>
              <select
                value={bsMonth}
                onChange={(e) => setBsMonth(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
              >
                {NEPALI_MONTHS_UNICODE.map((m, idx) => (
                  <option key={idx} value={idx + 1}>
                    {idx + 1} - {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Day */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">गते (Day):</label>
              <select
                value={bsDay}
                onChange={(e) => setBsDay(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
              >
                {Array.from({ length: daysInCurrentBsMonth }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d} गते
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Year (AD):</label>
              <input
                type="number"
                min={1943}
                max={2034}
                value={adYear}
                onChange={(e) => setAdYear(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Month (1 - 12):</label>
              <select
                value={adMonth}
                onChange={(e) => setAdMonth(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
              >
                {ENGLISH_MONTHS.map((m, idx) => (
                  <option key={idx} value={idx + 1}>
                    {idx + 1} - {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Day (1 - 31):</label>
              <input
                type="number"
                min={1}
                max={31}
                value={adDay}
                onChange={(e) => setAdDay(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Prominent Converted Result Hero Card */}
      {conversionResult && (
        <div className="flex flex-col gap-4">
          {conversionResult.mode === 'bs2ad' ? (
            /* BS to AD Result: Prominently show AD Date */
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 border-2 border-amber-500/40 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                    AD
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-amber-900 uppercase tracking-wide">
                      रूपान्तरित अंग्रेजी मिति (Converted Gregorian / AD Date)
                    </h3>
                    <p className="text-xs text-amber-700 font-medium">
                      वि.सं. {conversionResult.letter.fullUnicode.replace('मिति: ', '')} बाट प्राप्त मिति
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold self-start sm:self-auto border border-amber-300">
                  {conversionResult.dayNameNp} ({conversionResult.dayNameEn})
                </span>
              </div>

              {/* Converted AD Date Primary Display */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-mono">
                    {conversionResult.adIso}
                  </div>
                  <div className="text-base md:text-lg font-bold text-slate-700 mt-1">
                    {conversionResult.adLong}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Format: {conversionResult.adSlash} (YYYY/MM/DD) • {conversionResult.adUs}
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => copyText('ad_iso', conversionResult.adIso)}
                    className="py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                  >
                    {copiedKey === 'ad_iso' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'ad_iso' ? 'कपी भयो!' : 'AD मिति कपी (YYYY-MM-DD)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyText('ad_long', conversionResult.adLong)}
                    className="py-2 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    {copiedKey === 'ad_long' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'ad_long' ? 'कपी भयो!' : 'Full English कपी'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* AD to BS Result: Prominently show BS Date */
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 border-2 border-emerald-500/40 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    BS
                  </span>
                  <div>
                    <h3 className="text-sm font-black text-emerald-900 uppercase tracking-wide">
                      रूपान्तरित नेपाली मिति (Converted Bikram Sambat / BS Date)
                    </h3>
                    <p className="text-xs text-emerald-700 font-medium">
                      ई.सं. {conversionResult.sourceAdIso} ({conversionResult.sourceAdLong}) बाट प्राप्त मिति
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold self-start sm:self-auto border border-emerald-300">
                  {conversionResult.dayNameNp} ({conversionResult.dayNameEn})
                </span>
              </div>

              {/* Converted BS Date Primary Display */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-devanagari">
                    {conversionResult.letter.standardUnicode.replace('मिति: ', '')}
                  </div>
                  <div className="text-base md:text-lg font-bold text-slate-700 mt-1 font-devanagari">
                    {conversionResult.letter.fullUnicode.replace('मिति: ', '')}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 font-mono">
                    Preeti: {conversionResult.letter.standardPreeti.replace('ldltM ', '')}
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => copyText('bs_std', conversionResult.letter.standardUnicode.replace('मिति: ', ''))}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
                  >
                    {copiedKey === 'bs_std' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'bs_std' ? 'कपी भयो!' : 'वि.सं. मिति कपी (YYYY/MM/DD)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyText('bs_full', conversionResult.letter.fullUnicode.replace('मिति: ', ''))}
                    className="py-2 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                  >
                    {copiedKey === 'bs_full' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'bs_full' ? 'कपी भयो!' : 'पूरा मिति कपी'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Official Formatted Headers (सरकारी तथा संघसंस्थाको आधिकारिक पत्र मिति) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Official Unicode Letter Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3">
              <div>
                <span className="text-xs text-amber-700 font-bold uppercase tracking-wider block mb-1">
                  आधिकारिक पत्र मिति (Unicode Letter Header)
                </span>
                <div className="text-base font-black text-slate-800 font-devanagari leading-relaxed">
                  {conversionResult.letter.fullUnicode}
                </div>
                <div className="text-xs text-slate-500 font-devanagari mt-1">
                  संक्षिप्त: {conversionResult.letter.standardUnicode}
                </div>
                {conversionResult.mode === 'bs2ad' && (
                  <div className="text-xs font-semibold text-slate-500 mt-2 pt-2 border-t border-slate-100">
                    AD Date: <span className="font-mono text-slate-700">{conversionResult.adIso}</span> ({conversionResult.adLong})
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => copyText('uni_letter', conversionResult.letter.fullUnicode)}
                className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors self-start"
              >
                {copiedKey === 'uni_letter' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'uni_letter' ? 'कपी भयो' : 'पत्रको लागि कपी गर्नुहोस्'}</span>
              </button>
            </div>

            {/* Card 2: Preeti Letter Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                  प्रिती फन्टमा (Preeti Font Display)
                </span>
                <div className="text-xl md:text-2xl font-preeti text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 break-all select-all">
                  {conversionResult.letter.fullPreeti}
                </div>
                <div className="text-xs font-mono text-slate-400 mt-2 break-all bg-slate-100/60 p-2 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-500">ASCII Keystrokes:</span> {conversionResult.letter.fullPreeti}
                </div>
              </div>

              <button
                type="button"
                onClick={() => copyText('preeti_letter', conversionResult.letter.fullPreeti)}
                className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors self-start"
              >
                {copiedKey === 'preeti_letter' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'preeti_letter' ? 'कपी भयो' : 'Preeti कपी'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


