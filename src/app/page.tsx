'use client';

import React, { useState, useEffect } from 'react';
import { TopNavbar, ActiveTab } from '@/components/navigation/TopNavbar';
import { DualPaneConverter } from '@/components/converter/DualPaneConverter';
import { TypingMasterView } from '@/components/typing-master/TypingMasterView';
import { TypingGamesLobby } from '@/components/typing-games/TypingGamesLobby';
import { RomanizedTypingTool } from '@/components/tools/RomanizedTypingTool';
import { MultiFontConverterTool } from '@/components/tools/MultiFontConverterTool';
import { NepaliNumberCurrencyTool } from '@/components/tools/NepaliNumberCurrencyTool';
import { NepaliDateConverterTool } from '@/components/tools/NepaliDateConverterTool';
import { NepaliTextCleanerTool } from '@/components/tools/NepaliTextCleanerTool';
import { NepaliOcrTool } from '@/components/tools/NepaliOcrTool';
import { PreetiVirtualKeyboard } from '@/components/virtual-keyboard/PreetiVirtualKeyboard';
import { CheatsheetModal } from '@/components/cheatsheet/CheatsheetModal';
import { GeminiConfigModal } from '@/components/ai/GeminiConfigModal';
import { NepaliDictionaryView } from '@/components/dictionary/NepaliDictionaryView';
import { AdBanner } from '@/components/ads/AdBanner';
import { AboutMeView } from '@/components/about/AboutMeView';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('converter');
  const [isVirtualKeyboardOpen, setIsVirtualKeyboardOpen] = useState<boolean>(false);
  const [isCheatsheetOpen, setIsCheatsheetOpen] = useState<boolean>(false);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState<boolean>(false);
  const [isGeminiActive, setIsGeminiActive] = useState<boolean>(false);
  const [insertedKeyFromKeyboard, setInsertedKeyFromKeyboard] = useState<string>('');
  const [typingMasterCustomPayload, setTypingMasterCustomPayload] = useState<{ text: string; id: number } | null>(null);

  useEffect(() => {
    try {
      const key = localStorage.getItem('gemini_api_key');
      if (key && key.trim()) {
        setIsGeminiActive(true);
      } else {
        fetch('/api/ai/suggest')
          .then((r) => r.json())
          .then((d) => {
            if (d.active) setIsGeminiActive(true);
          })
          .catch(() => {});
      }
    } catch { }
  }, [isGeminiModalOpen]);

  const handleInsertChar = (char: string) => {
    setInsertedKeyFromKeyboard(char);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Sticky Top Navbar */}
      <div className="print:hidden">
        <TopNavbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onToggleVirtualKeyboard={() => setIsVirtualKeyboardOpen(!isVirtualKeyboardOpen)}
          onOpenCheatsheet={() => setIsCheatsheetOpen(true)}
          onOpenGeminiModal={() => setIsGeminiModalOpen(true)}
          isVirtualKeyboardOpen={isVirtualKeyboardOpen}
          isGeminiActive={isGeminiActive}
        />
      </div>

      {/* Main Content Area - Wide Full-Container Workspace */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-3 md:px-6 py-4 print:p-0 print:m-0 print:max-w-none print:w-full">
        {/* Top Responsive Ad / Sponsor Banner */}
        <AdBanner slot="top-banner" onNavigateToTab={(tab) => setActiveTab(tab as any)} />

        <div className={activeTab === 'converter' ? 'block' : 'hidden'}>
          <DualPaneConverter
            onToggleVirtualKeyboard={() => setIsVirtualKeyboardOpen(!isVirtualKeyboardOpen)}
            insertedTextFromKeyboard={insertedKeyFromKeyboard}
            onClearInsertedText={() => setInsertedKeyFromKeyboard('')}
          />
        </div>

        <div className={activeTab === 'dictionary' ? 'block' : 'hidden'}>
          <NepaliDictionaryView
            isTabActive={activeTab === 'dictionary'}
            onSendToConverter={(word) => {
              setInsertedKeyFromKeyboard(word);
              setActiveTab('converter');
            }}
            onSendToTypingMaster={(practiceText) => {
              setTypingMasterCustomPayload({ text: practiceText, id: Date.now() });
              setActiveTab('typing_master');
            }}
          />
        </div>

        <div className={activeTab === 'typing_master' ? 'block' : 'hidden'}>
          <TypingMasterView
            customPracticePayload={typingMasterCustomPayload}
            onClearCustomPayload={() => setTypingMasterCustomPayload(null)}
          />
        </div>

        <div className={activeTab === 'typing_games' ? 'block' : 'hidden'}>
          <TypingGamesLobby />
        </div>

        <div className={activeTab === 'romanized' ? 'block' : 'hidden'}>
          <RomanizedTypingTool
            onSendToPreeti={(preetiText) => {
              setActiveTab('converter');
              setInsertedKeyFromKeyboard(preetiText);
            }}
          />
        </div>

        <div className={activeTab === 'multi_font' ? 'block' : 'hidden'}>
          <MultiFontConverterTool />
        </div>

        <div className={activeTab === 'number_currency' ? 'block' : 'hidden'}>
          <NepaliNumberCurrencyTool />
        </div>

        <div className={activeTab === 'date_converter' ? 'block' : 'hidden'}>
          <NepaliDateConverterTool />
        </div>

        <div className={activeTab === 'cleaner_ocr' ? 'block' : 'hidden'}>
          <div className="flex flex-col gap-8">
            <NepaliTextCleanerTool />
            <div className="border-t border-slate-200/80 my-2" />
            <NepaliOcrTool />
          </div>
        </div>

        <div className={activeTab === 'about' ? 'block' : 'hidden'}>
          <AboutMeView onNavigateTab={(tab) => setActiveTab(tab as any)} />
        </div>

        {/* Mid-Content Responsive Ad / Sponsor Banner */}
        <AdBanner slot="mid-banner" onNavigateToTab={(tab) => setActiveTab(tab as any)} />
      </main>

      {/* Preeti Virtual Keyboard Drawer */}
      <div className="print:hidden">
        <PreetiVirtualKeyboard
          isOpen={isVirtualKeyboardOpen}
          onClose={() => setIsVirtualKeyboardOpen(false)}
          onInsertChar={handleInsertChar}
        />
      </div>

      {/* Preeti Cheatsheet Modal */}
      <div className="print:hidden">
        <CheatsheetModal
          isOpen={isCheatsheetOpen}
          onClose={() => setIsCheatsheetOpen(false)}
          onInsertChar={(char) => {
            handleInsertChar(char);
          }}
        />
      </div>

      {/* Google Gemini AI Config Modal */}
      <div className="print:hidden">
        <GeminiConfigModal
          isOpen={isGeminiModalOpen}
          onClose={() => setIsGeminiModalOpen(false)}
          onKeySaved={(key) => setIsGeminiActive(Boolean(key))}
        />
      </div>

      {/* Footer */}
      <footer className="bg-white/80 border-t border-slate-200/80 py-6 mt-12 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
              ने
            </span>
            <span className="font-bold text-slate-700">नेपाली अनुवादक, टाइपिङ मास्टर र टुलकिट</span>
          </div>

          <p className="text-slate-400">
            १००% सुरक्षित र क्लाइन्ट-साइड — कुनै पनि डेटा सर्भरमा पठाउँदैन। पूर्ण अफलाइन क्षमता।
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('about')}
              className="text-emerald-700 hover:text-emerald-800 font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>👨‍💻 विकासकर्ताको बारेमा</span>
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-bold">नेपालमै निर्मित 🇳🇵</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

