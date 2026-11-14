'use client';

import React, { useState, useRef } from 'react';
import {
  transliterateRomanizedText,
  getRomanCandidates,
} from '@/lib/romanized-converter';
import { unicodeToPreeti } from '@/lib/preeti-converter';
import { Copy, Check, ArrowRight, Trash2, Sparkles } from 'lucide-react';

interface RomanizedTypingToolProps {
  onSendToPreeti?: (text: string) => void;
}

export const RomanizedTypingTool: React.FC<RomanizedTypingToolProps> = ({
  onSendToPreeti,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [unicodeOutput, setUnicodeOutput] = useState<string>('');
  const [candidates, setCandidates] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);

    // Real-time transliteration
    const transliterated = transliterateRomanizedText(text);
    setUnicodeOutput(transliterated);

    // Extract current active roman word before cursor
    const lastWord = text.split(/[\s।,.\n]+/).pop() || '';
    if (lastWord.length >= 2) {
      setCandidates(getRomanCandidates(lastWord));
    } else {
      setCandidates([]);
    }
  };

  const handlePickCandidate = (cand: string) => {
    const parts = inputText.trimEnd().split(/\s+/);
    parts.pop(); // remove typed roman word
    const updated = parts.length > 0 ? parts.join(' ') + ' ' + cand + ' ' : cand + ' ';
    setUnicodeOutput(transliterateRomanizedText(updated));
    setCandidates([]);
    textareaRef.current?.focus();
  };

  const handleCopy = () => {
    if (!unicodeOutput) return;
    navigator.clipboard.writeText(unicodeOutput);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            🔤
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800">
              रोमनाइज्ड नेपाली फोनेटिक टाइपिङ (Romanized Typing)
            </h2>
            <p className="text-xs text-slate-500">
              अंग्रेजी अक्षरमा टाइप गर्नुहोस् (जस्तै: mero desh nepal) र तत्काल शुद्ध नेपाली युनिकोड पाउनुहोस्
            </p>
          </div>
        </div>

        {onSendToPreeti && (
          <button
            type="button"
            onClick={() => onSendToPreeti(unicodeToPreeti(unicodeOutput))}
            disabled={!unicodeOutput}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span>प्रितीमा पठाउनुहोस्</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Floating 5-candidate suggestions bar */}
      {candidates.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl flex items-center gap-2 overflow-x-auto shadow-sm animate-in fade-in duration-150">
          <span className="text-xs font-bold text-blue-900 shrink-0">सुझावहरू:</span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {candidates.map((cand, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePickCandidate(cand)}
                className="px-3 py-1 bg-white hover:bg-blue-100 text-blue-900 border border-blue-300 rounded-xl text-sm font-bold shadow-xs transition-colors"
              >
                {cand}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input / Output Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Roman Input */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-extrabold text-slate-700">
              रोमन इनपुट (Type in English)
            </span>
            <button
              type="button"
              onClick={() => {
                setInputText('');
                setUnicodeOutput('');
                setCandidates([]);
              }}
              className="text-xs text-slate-400 hover:text-rose-600 font-bold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>खाली</span>
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={handleInputChange}
            placeholder="जस्तै: mero desh nepal, ma nepali ho..."
            className="w-full min-h-[220px] p-3 text-base rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none resize-y font-mono"
          />

          <div className="text-[11px] text-slate-400">
            टिप: अंग्रेजी शब्द जोगाउन <code className="bg-slate-100 px-1 py-0.5 rounded font-bold">&#123;english&#125;</code> प्रयोग गर्नुहोस्।
          </div>
        </div>

        {/* Nepali Unicode Output */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-extrabold text-slate-700">
              नेपाली युनिकोड नतिजा
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'कपी भयो' : 'कपी'}</span>
            </button>
          </div>

          <div className="w-full min-h-[220px] p-3 text-lg font-devanagari rounded-xl border border-slate-200 bg-slate-50/60 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
            {unicodeOutput || (
              <span className="text-slate-400 text-sm">
                रोमन टाइप गर्दा नेपाली शब्द यहाँ तुरुन्त देखा पर्नेछ...
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400">
            वर्ण: {unicodeOutput.length} | शब्द: {unicodeOutput.trim() ? unicodeOutput.trim().split(/\s+/).length : 0}
          </div>
        </div>
      </div>
    </div>
  );
};

