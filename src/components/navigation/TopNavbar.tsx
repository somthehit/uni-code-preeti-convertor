'use client';

import React from 'react';
import { Keyboard as KeyboardIcon, BookOpen, Sparkles } from 'lucide-react';

export type ActiveTab =
  | 'converter'
  | 'dictionary'
  | 'typing_master'
  | 'typing_games'
  | 'romanized'
  | 'multi_font'
  | 'number_currency'
  | 'date_converter'
  | 'cleaner_ocr'
  | 'about';

interface TopNavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onToggleVirtualKeyboard: () => void;
  onOpenCheatsheet: () => void;
  onOpenGeminiModal?: () => void;
  isVirtualKeyboardOpen: boolean;
  isGeminiActive?: boolean;
}

const NAV_TABS = [
  { id: 'converter' as ActiveTab, label: '🔄 प्रिती ↔ युनिकोड' },
  { id: 'dictionary' as ActiveTab, label: '📚 नेपाली शब्दकोश (अ–ज्ञ)' },
  { id: 'typing_master' as ActiveTab, label: '🎯 टाइपिङ मास्टर' },
  { id: 'typing_games' as ActiveTab, label: '🎮 नेपाली टाइपिङ गेम' },
  { id: 'romanized' as ActiveTab, label: '🔤 रोमनाइज्ड टाइपिङ' },
  { id: 'multi_font' as ActiveTab, label: '🗂️ बहु-फन्ट रूपान्तरण' },
  { id: 'number_currency' as ActiveTab, label: '🔢 अङ्क र अक्षर (चेक/भौचर)' },
  { id: 'date_converter' as ActiveTab, label: '📅 मिति रूपान्तरण (BS ↔ AD)' },
  { id: 'cleaner_ocr' as ActiveTab, label: '✨ टेक्स्ट क्लिनर र OCR' },
  { id: 'about' as ActiveTab, label: '👨‍💻 मेरो बारेमा (About Me)' },
];

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  onSelectTab,
  onToggleVirtualKeyboard,
  onOpenCheatsheet,
  onOpenGeminiModal,
  isVirtualKeyboardOpen,
  isGeminiActive = false,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Left Brand */}
        <div
          onClick={() => onSelectTab('converter')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-full bg-emerald-600 group-hover:bg-emerald-700 text-white font-bold flex items-center justify-center text-lg shadow-sm transition-all group-hover:scale-105">
            ने
          </div>
          <div>
            <h1 className="text-emerald-700 font-extrabold text-lg leading-tight tracking-tight">
              नेपाली अनुवादक
            </h1>
            <span className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider block -mt-0.5">
              युनिकोड, टाइपिङ र टुलकिट
            </span>
          </div>
        </div>

        {/* Right Utility Buttons */}
        <div className="flex items-center gap-2">
          {/* Google Gemini AI Button */}
          {onOpenGeminiModal && (
            <button
              type="button"
              onClick={onOpenGeminiModal}
              title="Google Gemini AI Key व्यवस्थापन गर्नुहोस्"
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs ${isGeminiActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-emerald-200'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI</span>
            </button>
          )}

          {/* Virtual Keyboard Toggle */}
          <button
            type="button"
            onClick={onToggleVirtualKeyboard}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${isVirtualKeyboardOpen
                ? 'bg-emerald-600 text-white shadow-emerald-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
          >
            <KeyboardIcon className="w-4 h-4" />
            <span className="hidden sm:inline">भर्चुअल किबोर्ड</span>
          </button>

          {/* Cheatsheet Button */}
          <button
            type="button"
            onClick={onOpenCheatsheet}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>चीटशीट</span>
          </button>
        </div>
      </div>

      {/* Sub-bar Navigation Tabs (Horizontal Scrollable Ribbon) */}
      <div className="border-t border-slate-100 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1.5 no-scrollbar">
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

