'use client';

import React, { useState, useMemo } from 'react';
import {
  PREETI_CHEATSHEET_ITEMS,
  CHEATSHEET_CATEGORIES,
  CheatsheetItem,
} from '@/lib/preeti-cheatsheet-data';
import { Search, X, Copy, Check, Plus, Info } from 'lucide-react';

interface CheatsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertChar?: (char: string) => void;
}

export const CheatsheetModal: React.FC<CheatsheetModalProps> = ({
  isOpen,
  onClose,
  onInsertChar,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return PREETI_CHEATSHEET_ITEMS.filter((item) => {
      const matchesCat =
        selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchesCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.glyph.includes(q) ||
        item.keys.toLowerCase().includes(q) ||
        item.preetiCode.toLowerCase().includes(q) ||
        item.nameNepali.toLowerCase().includes(q) ||
        (item.altCode && item.altCode.includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  const handleCopy = (item: CheatsheetItem) => {
    navigator.clipboard.writeText(item.preetiCode);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span>📖 Preeti Font Layout Cheatsheet</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                प्रिती किम्याप गाइड
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              कुनै पनि नेपाली अक्षर, मात्रा, संयुक्त वर्ण वा चिन्ह टाइप गर्ने तरिका तुरुन्त खोज्नुहोस्
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Blue Pro-Tip Banner */}
        <div className="bg-blue-50 border-b border-blue-200 px-5 py-3 flex items-start gap-3 text-blue-900 text-xs">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">विशेष टिप्स (Pro Tips): </span>
            <span>
              १. <strong>ह्रस्व इ-कार (ि):</strong> सधैं व्यञ्जनभन्दा पहिले <code className="bg-blue-100 px-1 py-0.5 rounded font-bold font-mono">l</code> टाइप गर्नुहोस् (जस्तै: <code className="font-mono">ls</code> = कि)।
              २. <strong>रेफ (र्):</strong> व्यञ्जनपछि <code className="bg-blue-100 px-1 py-0.5 rounded font-bold font-mono">&#123;</code> थिच्नुहोस् (जस्तै: <code className="font-mono">sd&#123;</code> = कर्म)।
            </span>
          </div>
        </div>

        {/* Search & Category Filter Tabs */}
        <div className="p-4 border-b border-slate-200 flex flex-col gap-3 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 खोजी गर्नुहोस्... (अक्षर, कुञ्जी, वा नाम, जस्तै: क, s, Shift, Alt)"
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
            />
          </div>

          {/* 7 Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {CHEATSHEET_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50/50">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-2.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold text-xl flex items-center justify-center font-devanagari">
                    {item.glyph}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">
                      {item.nameNepali}
                    </h5>
                    <span className="text-[11px] font-mono text-emerald-700 font-bold block">
                      Preeti: {item.preetiCode}
                    </span>
                  </div>
                </div>

                {item.altCode && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">
                    Alt+{item.altCode}
                  </span>
                )}
              </div>

              <div className="bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/80 text-[11px]">
                <span className="text-slate-500 font-bold">टाइप: </span>
                <code className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {item.keys}
                </code>
              </div>

              {item.notes && (
                <p className="text-[10px] text-slate-500 italic">
                  💡 {item.notes}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleCopy(item)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">कपी भयो</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>कपी</span>
                    </>
                  )}
                </button>

                {onInsertChar && (
                  <button
                    type="button"
                    onClick={() => {
                      onInsertChar(item.preetiCode);
                      onClose();
                    }}
                    className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>थप्नुहोस्</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 text-sm">
              कुनै नतिजा फेला परेन। कृपया अर्को शब्द वा अक्षर खोज्नुहोस्।
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

