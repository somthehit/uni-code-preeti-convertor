'use client';

import React, { useState } from 'react';
import { cleanNepaliText, FindReplaceRule } from '@/lib/text-cleaner';
import { Copy, Check, Sparkles, Trash2, Plus, X } from 'lucide-react';

export const NepaliTextCleanerTool: React.FC = () => {
  const [rawText, setRawText] = useState<string>('');
  const [cleanedText, setCleanedText] = useState<string>('');
  const [fixPdfMatras, setFixPdfMatras] = useState<boolean>(true);
  const [removeZwj, setRemoveZwj] = useState<boolean>(true);
  const [normalizeDanda, setNormalizeDanda] = useState<boolean>(true);
  const [trimSpaces, setTrimSpaces] = useState<boolean>(true);
  const [customRules, setCustomRules] = useState<FindReplaceRule[]>([]);
  const [newFind, setNewFind] = useState<string>('');
  const [newReplace, setNewReplace] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleClean = () => {
    const result = cleanNepaliText(rawText, {
      fixPdfMatras,
      removeZwj,
      normalizeDanda,
      trimSpaces,
      customRules,
    });
    setCleanedText(result);
  };

  const handleAddRule = () => {
    if (!newFind) return;
    setCustomRules((prev) => [
      ...prev,
      { id: Date.now().toString(), find: newFind, replace: newReplace },
    ]);
    setNewFind('');
    setNewReplace('');
  };

  const handleRemoveRule = (id: string) => {
    setCustomRules((prev) => prev.filter((r) => r.id !== id));
  };

  const handleCopy = () => {
    if (!cleanedText) return;
    navigator.clipboard.writeText(cleanedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            ✨
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800">
              नेपाली टेक्स्ट क्लिनर र स्यानिटाइजर (Text Cleaner)
            </h2>
            <p className="text-xs text-slate-500">
              PDF बाट कपी गर्दा टुक्रिएका मात्रा (ि, र्, ो), अनावश्यक ZWJ क्यारेक्टरहरू र चिन्हहरू तुरुन्त मर्मत गर्नुहोस्
            </p>
          </div>
        </div>
      </div>

      {/* Toggles & Options */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-700">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fixPdfMatras}
            onChange={(e) => setFixPdfMatras(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded"
          />
          <span>PDF टुक्रिएका मात्रा मर्मत (Fix Matras)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={removeZwj}
            onChange={(e) => setRemoveZwj(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded"
          />
          <span>अदृश्य ZWJ / ZWNJ हटाउनुहोस्</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={normalizeDanda}
            onChange={(e) => setNormalizeDanda(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded"
          />
          <span>पूर्णविराम (।) नियमित गर्नुहोस्</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={trimSpaces}
            onChange={(e) => setTrimSpaces(e.target.checked)}
            className="w-4 h-4 text-teal-600 rounded"
          />
          <span>अनावश्यक खाली ठाउँ (Spaces) मिलाउनुहोस्</span>
        </label>
      </div>

      {/* Custom Find & Replace Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <span className="text-xs font-bold text-slate-700">
          कस्टम बल्क खोज्नुहोस् र बदल्नुहोस् (Bulk Find & Replace):
        </span>
        <div className="flex gap-2">
          <input
            type="text"
            value={newFind}
            onChange={(e) => setNewFind(e.target.value)}
            placeholder="खोज्ने शब्द (Find)..."
            className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
          />
          <input
            type="text"
            value={newReplace}
            onChange={(e) => setNewReplace(e.target.value)}
            placeholder="बदल्ने शब्द (Replace)..."
            className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none"
          />
          <button
            type="button"
            onClick={handleAddRule}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>थप्नुहोस्</span>
          </button>
        </div>

        {customRules.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {customRules.map((rule) => (
              <span
                key={rule.id}
                className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs flex items-center gap-1.5"
              >
                <span>&quot;{rule.find}&quot; → &quot;{rule.replace}&quot;</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRule(rule.id)}
                  className="text-slate-400 hover:text-rose-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dual Textareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-extrabold text-slate-700">मूल टेक्स्ट (Original Text)</span>
            <button
              type="button"
              onClick={() => {
                setRawText('');
                setCleanedText('');
              }}
              className="text-xs text-slate-400 hover:text-rose-600 font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>खाली</span>
            </button>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="यहाँ PDF वा वेबसाइटबाट कपी गरिएको टेक्स्ट पेस्ट गर्नुहोस्..."
            className="w-full min-h-[220px] p-3 text-base rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 outline-none resize-y font-devanagari"
          />

          <button
            type="button"
            onClick={handleClean}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>टेक्स्ट सफा र मर्मत गर्नुहोस्</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-extrabold text-slate-700">सफा गरिएको नतिजा (Cleaned)</span>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'कपी भयो' : 'कपी'}</span>
            </button>
          </div>

          <div className="w-full min-h-[260px] p-3 text-base font-devanagari rounded-xl border border-slate-200 bg-slate-50/60 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
            {cleanedText || (
              <span className="text-slate-400 text-sm">
                मर्मत गरिएको शुद्ध टेक्स्ट यहाँ देखिनेछ...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

