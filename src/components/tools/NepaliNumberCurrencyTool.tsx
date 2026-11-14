'use client';

import React, { useState, useMemo } from 'react';
import {
  convertCurrencyBundle,
  englishToNepaliDigits,
  nepaliToEnglishDigits,
  formatLakhCrore,
} from '@/lib/nepali-number-words';
import { Copy, Check, Calculator, Sparkles } from 'lucide-react';

export const NepaliNumberCurrencyTool: React.FC = () => {
  const [numInput, setNumInput] = useState<string>('78183.33');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const bundle = useMemo(() => {
    if (!numInput.trim()) return null;
    return convertCurrencyBundle(numInput);
  }, [numInput]);

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            🔢
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800">
              अङ्क र अक्षर (चेक, भौचर र बिलको लागि)
            </h2>
            <p className="text-xs text-slate-500">
              बैंक, सहकारी, लेखा र रसिदको लागि रकमलाई नेपाली तथा अंग्रेजी अक्षरमा तत्काल रूपान्तरण गर्नुहोस्
            </p>
          </div>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>रकम वा संख्या प्रविष्ट गर्नुहोस् (Enter Amount / Number):</span>
          <div className="flex gap-2">
            {['1500', '78183.33', '250000', '12345678.50'].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setNumInput(val)}
                className="text-[11px] bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-mono px-2 py-0.5 rounded-lg border border-slate-200 transition-colors"
              >
                {val}
              </button>
            ))}
          </div>
        </label>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
            रु.
          </span>
          <input
            type="text"
            value={numInput}
            onChange={(e) => setNumInput(e.target.value)}
            placeholder="जस्तै: 78183.33 वा ७८१८३.३३"
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xl font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
          />
        </div>
      </div>

      {/* Results Grid */}
      {bundle && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Lakh/Crore Formatted Digits */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
                नेपाली अङ्क ढाँचा (Lakh/Crore Grouping)
              </span>
              <div className="text-xl font-black text-slate-800 font-devanagari">
                रु. {bundle.formattedNepali}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                Rs. {bundle.formattedEnglish}
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyText('nepali_digits', `रु. ${bundle.formattedNepali}`)}
              className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors self-start"
            >
              {copiedKey === 'nepali_digits' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'nepali_digits' ? 'कपी भयो' : 'कपी गर्नुहोस्'}</span>
            </button>
          </div>

          {/* Card 2: Nepali Banking Words (Unicode) */}
          <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3 bg-emerald-50/20">
            <div>
              <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider block mb-1">
                नेपाली अक्षरमा (बैंक चेक / भौचर ढाँचा)
              </span>
              <div className="text-base font-black text-emerald-950 font-devanagari leading-relaxed">
                {bundle.nepaliWords}
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyText('nepali_words', bundle.nepaliWords)}
              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors self-start"
            >
              {copiedKey === 'nepali_words' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'nepali_words' ? 'कपी भयो' : 'चेकको लागि कपी'}</span>
            </button>
          </div>

          {/* Card 3: Preeti Banking Words */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block mb-1">
                प्रिती फन्टमा (Preeti Font Display)
              </span>
              <div className="text-xl md:text-2xl font-preeti text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 break-all select-all">
                {bundle.preetiWords}
              </div>
              <div className="text-xs font-mono text-slate-400 mt-2 break-all bg-slate-100/60 p-2 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-500">ASCII Keystrokes:</span> {bundle.preetiWords}
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyText('preeti_words', bundle.preetiWords)}
              className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors self-start"
            >
              {copiedKey === 'preeti_words' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'preeti_words' ? 'कपी भयो' : 'Preeti कपी'}</span>
            </button>
          </div>

          {/* Card 4: English Currency Words (Lakh/Crore System) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
                English In Words (Lakh / Crore System)
              </span>
              <div className="text-sm font-bold text-slate-800 leading-relaxed">
                {bundle.englishWords}
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyText('english_words', bundle.englishWords)}
              className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors self-start"
            >
              {copiedKey === 'english_words' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'english_words' ? 'कपी भयो' : 'English Words कपी'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

