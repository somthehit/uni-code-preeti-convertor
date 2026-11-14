'use client';

import React, { useState, useMemo } from 'react';
import { convertMultiFont } from '@/lib/preeti-converter';
import { Copy, Check, Trash2, ArrowLeftRight } from 'lucide-react';

export const MultiFontConverterTool: React.FC = () => {
  const [selectedFont, setSelectedFont] = useState<'preeti' | 'kantipur' | 'himali' | 'pcs' | 'sagarmatha' | 'auto'>('kantipur');
  const [direction, setDirection] = useState<'toUnicode' | 'fromUnicode'>('toUnicode');
  const [inputText, setInputText] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const outputText = useMemo(() => {
    if (!inputText) return '';
    return convertMultiFont(inputText, selectedFont, direction === 'toUnicode');
  }, [inputText, selectedFont, direction]);

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            🗂️
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800">
              बहु-फन्ट रूपान्तरण (Multi-Legacy Font Converter)
            </h2>
            <p className="text-xs text-slate-500">
              Kantipur, Fontasy Himali, PCS Nepali, Sagarmatha र Preeti ↔ नेपाली युनिकोड रूपान्तरण
            </p>
          </div>
        </div>

        {/* Font Selector */}
        <select
          value={selectedFont}
          onChange={(e) => setSelectedFont(e.target.value as any)}
          className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="kantipur">Kantipur (कान्तिपुर)</option>
          <option value="preeti">Preeti (प्रिती)</option>
          <option value="himali">Fontasy Himali (हिमाली)</option>
          <option value="pcs">PCS Nepali</option>
          <option value="sagarmatha">Sagarmatha (सगरमाथा)</option>
          <option value="auto">Auto-Detect (स्वचालित पहिचान)</option>
        </select>
      </div>

      {/* Direction Toggle */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setDirection('toUnicode')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              direction === 'toUnicode' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            लेगेसी फन्ट → युनिकोड
          </button>
          <button
            type="button"
            onClick={() => setDirection('fromUnicode')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              direction === 'fromUnicode' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'
            }`}
          >
            युनिकोड → लेगेसी फन्ट
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setDirection((d) => (d === 'toUnicode' ? 'fromUnicode' : 'toUnicode'));
            setInputText(outputText);
          }}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>दिशा बदल्नुहोस्</span>
        </button>
      </div>

      {/* Dual Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-extrabold text-slate-700">इनपुट टेक्स्ट</span>
            <button
              type="button"
              onClick={() => setInputText('')}
              className="text-xs text-slate-400 hover:text-rose-600 font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>खाली</span>
            </button>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="यहाँ टेक्स्ट टाइप वा पेस्ट गर्नुहोस्..."
            className="w-full min-h-[220px] p-3 text-base rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-y font-mono"
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-extrabold text-slate-700">रूपान्तरित नतिजा</span>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'कपी भयो' : 'कपी'}</span>
            </button>
          </div>

          <div className="w-full min-h-[220px] p-3 text-lg font-devanagari rounded-xl border border-slate-200 bg-slate-50/60 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
            {outputText || (
              <span className="text-slate-400 text-sm font-sans">
                नतिजा यहाँ देखिनेछ...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

