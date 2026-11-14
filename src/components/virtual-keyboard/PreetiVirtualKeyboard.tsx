'use client';

import React, { useState } from 'react';
import { X, CornerDownLeft, Delete, Space } from 'lucide-react';
import { KEYBOARD_LAYOUT } from '../typing-master/ColorCodedKeyboard';

interface PreetiVirtualKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertChar: (char: string) => void;
}

const ALT_CODE_SHORTCUTS = [
  { glyph: 'ङ', code: 'ª', label: 'Alt+0170' },
  { glyph: 'द्य', code: 'B', label: 'Alt+0222' },
  { glyph: 'द्व', code: 'å', label: 'Alt+0229' },
  { glyph: 'ट्ट', code: 'Ø', label: 'Alt+0216' },
  { glyph: 'ठ्ठ', code: 'Ù', label: 'Alt+0217' },
  { glyph: 'रू', code: '¿', label: 'Alt+0191' },
  { glyph: 'झ्', code: '‰', label: 'Alt+0172' },
  { glyph: 'क्त', code: 'St', label: 'Alt+0225' },
];

export const PreetiVirtualKeyboard: React.FC<PreetiVirtualKeyboardProps> = ({
  isOpen,
  onClose,
  onInsertChar,
}) => {
  const [isShiftActive, setIsShiftActive] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-300 shadow-2xl z-40 p-3 md:p-4 animate-in slide-in-from-bottom duration-200">
      <div className="max-w-5xl mx-auto flex flex-col gap-2.5">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-800">
              ⌨️ नेपाली प्रिती भर्चुअल किबोर्ड
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              (कुञ्जी थिचेर सिधै इनपुट बक्समा टाइप गर्नुहोस्)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Shift Toggle */}
            <button
              type="button"
              onClick={() => setIsShiftActive(!isShiftActive)}
              className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm ${
                isShiftActive
                  ? 'bg-rose-500 text-white ring-2 ring-rose-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>⇧ Shift:</span>
              <span>{isShiftActive ? 'चालु (ON)' : 'बन्द (OFF)'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Alt Codes Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
            द्रुत Alt कोडहरू:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {ALT_CODE_SHORTCUTS.map((alt) => (
              <button
                key={alt.label}
                type="button"
                onClick={() => onInsertChar(alt.code)}
                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors whitespace-nowrap"
              >
                <span className="text-sm font-black">{alt.glyph}</span>
                <span className="text-[10px] text-emerald-600 font-mono opacity-80">
                  {alt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Keyboard 5 Rows */}
        <div className="flex flex-col gap-1.5">
          {KEYBOARD_LAYOUT.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1">
              {row.map((item) => {
                const displayChar = isShiftActive ? item.shiftNep : item.nep;
                const displayKey = isShiftActive ? item.shiftKey : item.key;
                const insertChar = isShiftActive ? item.shiftKey : item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onInsertChar(insertChar)}
                    className="flex flex-col items-center justify-between p-1 bg-white hover:bg-emerald-50 active:bg-emerald-100 border border-slate-300 hover:border-emerald-400 rounded-lg min-w-[32px] md:min-w-[44px] h-11 md:h-12 shadow-xs transition-colors"
                  >
                    <span className="text-[9px] md:text-[10px] font-mono text-slate-400 self-start leading-none">
                      {displayKey}
                    </span>
                    <span className="text-sm md:text-base font-bold text-slate-800 leading-none mt-auto">
                      {displayChar}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}

          {/* Bottom Space & Action Row */}
          <div className="flex justify-center gap-2 mt-0.5">
            <button
              type="button"
              onClick={() => setIsShiftActive(!isShiftActive)}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${
                isShiftActive
                  ? 'bg-rose-500 text-white border-rose-600'
                  : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
              }`}
            >
              Shift
            </button>

            <button
              type="button"
              onClick={() => onInsertChar(' ')}
              className="w-72 md:w-96 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-2"
            >
              <Space className="w-4 h-4 text-slate-400" />
              <span>खाली ठाउँ (Space)</span>
            </button>

            <button
              type="button"
              onClick={() => onInsertChar('\n')}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>Enter</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

