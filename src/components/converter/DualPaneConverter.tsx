'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  preetiToUnicode,
  unicodeToPreeti,
  ConverterOptions,
} from '@/lib/preeti-converter';
import { FileConverterDropzone } from './FileConverterDropzone';
import {
  ArrowLeftRight,
  Copy,
  Check,
  Trash2,
  ClipboardPaste,
  Download,
  Printer,
  Sparkles,
  Keyboard as KeyboardIcon,
  Eye,
  Code2,
  Brain,
  BookOpen,
  Volume2,
  X,
} from 'lucide-react';
import { GeminiConfigModal } from '@/components/ai/GeminiConfigModal';
import {
  getAiWordSuggestions,
  learnFromUserTypedText,
  getAiLearningCache,
} from '@/lib/nepali-ai-engine';
import { searchDictionary, speakNepaliWord, DictionaryEntry } from '@/lib/nepali-dictionary';
import { saveAs } from 'file-saver';

interface DualPaneConverterProps {
  onToggleVirtualKeyboard: () => void;
  insertedTextFromKeyboard?: string;
  onClearInsertedText?: () => void;
}

const SAMPLE_TEST_CASES = [
  'नेपाल',
  'नेपाली अनुवादक',
  'किताब',
  'कर्म',
  'पूर्ण',
  'स्थिति र प्रक्रिया',
  'क्षमता, त्रिशूल, ज्ञान, श्रम',
  'श्री अलंकार पब्लिक स्कूल',
  'रु. ७८,१८३.३३ (अठहत्तर हजार एक सय त्रियासी रुपैयाँ र तेत्तीस पैसा मात्र)',
];

export const PRINT_MARGINS = {
  normal: {
    id: 'normal',
    label: 'सामान्य (Normal)',
    desc: 'चारैतिर ~१ इन्च (२२mm) — सिफारिस गरिएको मानक मार्जिन',
    padding: '22mm 20mm 22mm 20mm',
  },
  narrow: {
    id: 'narrow',
    label: 'साँघुरो (Narrow)',
    desc: '०.५ इन्च (१२mm) — धेरै पाठ एउटै पृष्ठमा अटाउन',
    padding: '12mm 14mm 12mm 14mm',
  },
  wide: {
    id: 'wide',
    label: 'फराकिलो (Wide)',
    desc: '१.२५ इन्च (२८mm) — साहित्यिक तथा औपचारिक कागजात',
    padding: '30mm 26mm 30mm 26mm',
  },
  official: {
    id: 'official',
    label: 'सरकारी ढाँचा (Official)',
    desc: 'माथि लेटरहेडका लागि १.५ इन्च (३८mm) खाली ठाउँ',
    padding: '38mm 22mm 22mm 25mm',
  },
} as const;

export type PrintMarginKey = keyof typeof PRINT_MARGINS;

export const DualPaneConverter: React.FC<DualPaneConverterProps> = ({
  onToggleVirtualKeyboard,
  insertedTextFromKeyboard = '',
  onClearInsertedText,
}) => {
  const [direction, setDirection] = useState<'u2p' | 'p2u'>('u2p');
  const [inputText, setInputText] = useState<string>('');
  const [numeralMode, setNumeralMode] = useState<'nepali' | 'english' | 'keep'>('nepali');
  const [smartEnglishLock, setSmartEnglishLock] = useState<boolean>(true);
  const [preetiViewMode, setPreetiViewMode] = useState<'smart' | 'raw'>('smart');
  const [preetiInputViewMode, setPreetiInputViewMode] = useState<'smart' | 'raw'>('smart');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [sampleIdx, setSampleIdx] = useState<number>(0);
  const [learnedCount, setLearnedCount] = useState<number>(0);

  // Real Google Gemini AI states
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState<boolean>(false);
  const [isGeminiActive, setIsGeminiActive] = useState<boolean>(false);
  const [geminiSuggestions, setGeminiSuggestions] = useState<string[] | null>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false);
  const [isDictTooltipEnabled, setIsDictTooltipEnabled] = useState<boolean>(true);
  const [hoveredWordInfo, setHoveredWordInfo] = useState<DictionaryEntry | null>(null);

  // Print & Margin customization states
  const [printMargin, setPrintMargin] = useState<PrintMarginKey>('normal');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [showLetterhead, setShowLetterhead] = useState<boolean>(true);
  const [printFontSize, setPrintFontSize] = useState<'normal' | 'large' | 'small'>('normal');

  const inputTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Restore saved text & learned stats on load
  useEffect(() => {
    try {
      const savedInput = localStorage.getItem('uni_preeti_input_text');
      if (savedInput) setInputText(savedInput);
      const savedDir = localStorage.getItem('uni_preeti_direction');
      if (savedDir === 'u2p' || savedDir === 'p2u') setDirection(savedDir);

      const cache = getAiLearningCache();
      setLearnedCount(cache.userVocabularyCount);

      const key = localStorage.getItem('gemini_api_key');
      if (key && key.trim()) {
        setIsGeminiActive(true);
      } else {
        fetch('/api/ai/suggest')
          .then((r) => r.json())
          .then((d) => {
            if (d.active) setIsGeminiActive(true);
          })
          .catch(() => { });
      }
    } catch { }
  }, []);

  // Save text continuously & learn in background with debounce
  useEffect(() => {
    try {
      localStorage.setItem('uni_preeti_input_text', inputText);
      localStorage.setItem('uni_preeti_direction', direction);
    } catch { }

    const timer = setTimeout(() => {
      if (inputText.trim().length >= 3) {
        learnFromUserTypedText(inputText, direction === 'p2u');
        const updated = getAiLearningCache();
        setLearnedCount(updated.userVocabularyCount);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [inputText, direction]);

  // Real-time Google Gemini AI predictive call
  useEffect(() => {
    const textToAnalyze = (!/[\u0900-\u097F]/.test(inputText) && direction === 'p2u')
      ? preetiToUnicode(inputText)
      : inputText;

    if (!textToAnalyze || textToAnalyze.trim().length === 0) {
      setGeminiSuggestions(null);
      return;
    }

    const key = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;

    setIsGeminiLoading(true);
    const handler = setTimeout(async () => {
      try {
        const res = await fetch('/api/ai/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textToAnalyze,
            apiKey: key || undefined,
            action: 'suggest',
          }),
        });

        const data = await res.json();
        if (data.success && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setGeminiSuggestions(data.suggestions);
          setIsGeminiActive(true);
          learnFromUserTypedText(data.suggestions.join(' '));
        } else {
          setGeminiSuggestions(null);
        }
      } catch {
        setGeminiSuggestions(null);
      } finally {
        setIsGeminiLoading(false);
      }
    }, 450);

    return () => clearTimeout(handler);
  }, [inputText, direction]);

  // Compute local AI suggestions as instant fallback
  const localAiSuggestions = useMemo(() => {
    const hasUnicode = /[\u0900-\u097F]/.test(inputText);
    const textForAi = !hasUnicode && direction === 'p2u' ? preetiToUnicode(inputText) : inputText;
    return getAiWordSuggestions(textForAi, 6);
  }, [inputText, direction]);

  // Active suggestions: Gemini takes priority if available
  const activeSuggestions = (geminiSuggestions && geminiSuggestions.length > 0)
    ? geminiSuggestions
    : localAiSuggestions;

  // Handle applying an AI suggestion
  const handleApplySuggestion = (suggestionUnicode: string) => {
    // If input is purely ASCII Preeti in p2u mode, convert suggestion to Preeti
    const isPurePreetiAscii = direction === 'p2u' && !/[\u0900-\u097F]/.test(inputText);
    const textToInsert = isPurePreetiAscii ? unicodeToPreeti(suggestionUnicode) : suggestionUnicode;

    setInputText((prev) => {
      if (/\s$/.test(prev)) {
        return prev + textToInsert + ' ';
      }
      const trimmedEnd = prev.trimEnd();
      const lastSpaceIdx = trimmedEnd.lastIndexOf(' ');
      if (lastSpaceIdx === -1) {
        return textToInsert + ' ';
      }
      return prev.slice(0, lastSpaceIdx + 1) + textToInsert + ' ';
    });

    inputTextareaRef.current?.focus();
  };

  // Append text from virtual keyboard if provided
  useEffect(() => {
    if (insertedTextFromKeyboard) {
      setInputText((prev) => prev + insertedTextFromKeyboard);
      onClearInsertedText?.();
      inputTextareaRef.current?.focus();
    }
  }, [insertedTextFromKeyboard, onClearInsertedText]);

  // Options bundle
  const options: ConverterOptions = useMemo(
    () => ({
      numeralMode,
      smartEnglishLock,
    }),
    [numeralMode, smartEnglishLock]
  );

  // Real-time conversion output
  const outputText = useMemo(() => {
    if (!inputText) return '';
    return direction === 'u2p'
      ? unicodeToPreeti(inputText, options)
      : preetiToUnicode(inputText, options);
  }, [inputText, direction, options]);

  // Counters
  const charCount = inputText.length;
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const sentenceCount = inputText.trim()
    ? (inputText.match(/[।!?\n]+/g) || []).length || (inputText ? 1 : 0)
    : 0;

  const outCharCount = outputText.length;
  const outWordCount = outputText.trim() ? outputText.trim().split(/\s+/).length : 0;

  // Swap direction
  const handleSwap = () => {
    setDirection((prev) => (prev === 'u2p' ? 'p2u' : 'u2p'));
    setInputText(outputText);
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText((prev) => prev + text);
      }
    } catch { }
  };

  // Clear input
  const handleClear = () => {
    setInputText('');
    inputTextareaRef.current?.focus();
  };

  // Load sample test
  const handleLoadSample = () => {
    const sample = SAMPLE_TEST_CASES[sampleIdx % SAMPLE_TEST_CASES.length];
    setSampleIdx((i) => i + 1);
    if (direction === 'u2p') {
      setInputText(sample);
    } else {
      setInputText(unicodeToPreeti(sample));
    }
  };

  // Inspect word on double-click
  const handleWordInspect = async (e: React.MouseEvent<HTMLElement>) => {
    if (!isDictTooltipEnabled) return;
    let selectedWord = '';

    if (e.currentTarget instanceof HTMLTextAreaElement) {
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const text = textarea.value;
      if (start !== null && text) {
        let left = start;
        while (left > 0 && !/[\s,।!?\n]/.test(text[left - 1])) left--;
        let right = start;
        while (right < text.length && !/[\s,।!?\n]/.test(text[right])) right++;
        selectedWord = text.slice(left, right).trim();
      }
    } else {
      selectedWord = window.getSelection()?.toString().trim() || '';
    }

    if (selectedWord.length >= 1) {
      const isUnicode = /[\u0900-\u097F]/.test(selectedWord);
      const uniWord = isUnicode ? selectedWord : preetiToUnicode(selectedWord);
      const res = await searchDictionary(uniWord);
      if (res.entries.length > 0) {
        setHoveredWordInfo(res.entries[0]);
      }
    }
  };

  // Export .txt
  const handleExportTxt = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `nepali_converted_${Date.now()}.txt`);
  };

  // Export simple .docx format wrapper
  const handleExportDocx = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'application/msword;charset=utf-8' });
    saveAs(blob, `nepali_converted_${Date.now()}.doc`);
  };

  // Print converted document
  const handlePrint = () => {
    if (!outputText && !inputText) {
      alert('कृपया प्रिन्ट गर्नका लागि पहिले केही नेपाली पाठ प्रविष्ट वा रूपान्तरण गर्नुहोस्।');
      return;
    }
    window.print();
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-[1400px] mx-auto">
      {/* Screen-only Interactive Workspace */}
      <div className="print:hidden flex flex-col gap-6">
        {/* Mode Switcher & Controls Bar - Unified Single Row */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-2.5 md:p-3 shadow-xs flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5">
        {/* Left Side: Direction Toggle & Swap in one line */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setDirection('u2p')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                direction === 'u2p'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              युनिकोड → प्रिती
            </button>
            <button
              type="button"
              onClick={() => setDirection('p2u')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                direction === 'p2u'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              प्रिती → युनिकोड
            </button>
          </div>

          {/* Swap button */}
          <button
            type="button"
            onClick={handleSwap}
            title="दिशा बदल्नुहोस् (Swap Direction)"
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">दिशा बदल्नुहोस्</span>
          </button>
        </div>

        {/* Right Side: Quick Toolbar Pills in One Single Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Numeral Mode Toggle */}
          <select
            value={numeralMode}
            onChange={(e) => setNumeralMode(e.target.value as 'nepali' | 'english' | 'keep')}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="nepali">अङ्क: नेपाली (१२३)</option>
            <option value="english">अङ्क: English (123)</option>
            <option value="keep">जस्ताको तस्तै (Keep)</option>
          </select>

          {/* Smart English Lock Toggle */}
          <button
            type="button"
            onClick={() => setSmartEnglishLock(!smartEnglishLock)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
              smartEnglishLock
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            <span>🔒 English Lock: {smartEnglishLock ? 'ON' : 'OFF'}</span>
          </button>

          {/* Live Dictionary Tooltip Toggle */}
          <button
            type="button"
            onClick={() => setIsDictTooltipEnabled(!isDictTooltipEnabled)}
            title="कुनै पनि शब्दमा डबल-क्लिक गरी तत्काल शब्दार्थ र प्रिती कुञ्जी हेर्नुहोस्"
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
              isDictTooltipEnabled
                ? 'bg-blue-50 text-blue-800 border-blue-300'
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}
          >
            <span>📖 शब्दार्थ टुलटिप: {isDictTooltipEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Virtual Keyboard Toggle Pill */}
          <button
            type="button"
            onClick={onToggleVirtualKeyboard}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <KeyboardIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>भर्चुअल किबोर्ड</span>
          </button>

          {/* Load Sample Test */}
          <button
            type="button"
            onClick={handleLoadSample}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>⚡ उदाहरण परीक्षण</span>
          </button>
        </div>
      </div>

      {/* Dual Pane Real-Time Text Converter Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Input Pane */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800 text-sm">
                {direction === 'u2p' ? 'युनिकोड इनपुट' : 'प्रिती इनपुट'}
              </span>

              {/* View Switcher Pills when input is Preeti */}
              {direction === 'p2u' && (
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setPreetiInputViewMode('smart')}
                    className={`px-2 py-0.5 rounded flex items-center gap-1 ${preetiInputViewMode === 'smart'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500'
                      }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>👁 प्रिती फन्ट</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreetiInputViewMode('raw')}
                    className={`px-2 py-0.5 rounded flex items-center gap-1 ${preetiInputViewMode === 'raw'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500'
                      }`}
                  >
                    <Code2 className="w-3 h-3" />
                    <span>&lt;&gt; a b c d</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePaste}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                <span>पेस्ट</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>खाली</span>
              </button>
            </div>
          </div>

          <textarea
            ref={inputTextareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onDoubleClick={handleWordInspect}
            title={isDictTooltipEnabled ? 'कुनै पनि शब्दमा डबल-क्लिक गरी तत्काल शब्दकोश अर्थ हेर्नुहोस्' : undefined}
            placeholder={
              direction === 'u2p'
                ? 'यहाँ युनिकोड नेपाली टाइप वा पेस्ट गर्नुहोस्...'
                : 'यहाँ प्रिती फन्टको टेक्स्ट टाइप वा पेस्ट गर्नुहोस् (जस्तै: g]kfn)...'
            }
            className={`w-full flex-1 min-h-[280px] p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-y leading-relaxed placeholder:font-sans placeholder:text-sm placeholder:text-slate-400 ${direction === 'p2u'
              ? preetiInputViewMode === 'smart'
                ? 'font-preeti text-xl md:text-2xl text-slate-800'
                : 'font-mono text-base md:text-lg text-slate-700'
              : 'font-devanagari text-base md:text-lg text-slate-800'
              }`}
          />

          {/* AI Word Suggestions Pill Bar - ONLY visible when user has typed text */}
          {inputText.trim().length > 0 && activeSuggestions.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-indigo-50/70 border border-emerald-200/80 rounded-xl animate-fadeIn">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent font-extrabold">
                    AI सुझाव:
                  </span>
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  {activeSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplySuggestion(sug)}
                      className="px-2.5 py-0.5 bg-white hover:bg-emerald-600 text-slate-700 hover:text-white border border-emerald-200/90 hover:border-emerald-600 rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1 group"
                      title={`थप्न क्लिक गर्नुहोस् (${sug})`}
                    >
                      <span>{sug}</span>
                      <span className="text-[10px] text-slate-400 group-hover:text-emerald-100">↵</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Status / Configure Button */}
              <button
                type="button"
                onClick={() => setIsGeminiModalOpen(true)}
                title="AI Key व्यवस्थापन गर्नुहोस्"
                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all ${isGeminiActive
                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                  : 'bg-indigo-100/90 hover:bg-indigo-200 text-indigo-700 border border-indigo-200'
                  }`}
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>{isGeminiActive ? '✨ AI Active' : '✨ AI सेटअप'}</span>
              </button>
            </div>
          )}

          <div className="text-[11px] text-slate-400 font-semibold border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>
              वर्ण: {charCount} | शब्द: {wordCount} | वाक्य: {sentenceCount}
            </span>
            {learnedCount > 0 && (
              <span className="text-emerald-600 font-bold flex items-center gap-1" title="प्रयोगकर्ताबाट सिकिएको शब्दावली क्यास">
                <Brain className="w-3 h-3" />
                क्यास: {learnedCount} शब्द
              </span>
            )}
          </div>
        </div>

        {/* Right Card: Output Pane */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800 text-sm">
                {direction === 'u2p' ? 'प्रिती नतिजा' : 'युनिकोड नतिजा'}
              </span>

              {/* View Switcher Pills when output is Preeti */}
              {direction === 'u2p' && (
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setPreetiViewMode('smart')}
                    className={`px-2 py-0.5 rounded flex items-center gap-1 ${preetiViewMode === 'smart'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500'
                      }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>👁 स्मार्ट</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreetiViewMode('raw')}
                    className={`px-2 py-0.5 rounded flex items-center gap-1 ${preetiViewMode === 'raw'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500'
                      }`}
                  >
                    <Code2 className="w-3 h-3" />
                    <span>&lt;&gt; टेक्स्ट</span>
                  </button>
                </div>
              )}
            </div>

            {/* Output Action Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleExportTxt}
                title="TXT डाउनलोड गर्नुहोस्"
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsPrintModalOpen(true)}
                title="कागजात प्रिन्ट तथा मार्जिन मिलाउनुहोस् (Ctrl + P)"
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-200"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-600" />
                <span>प्रिन्ट / मार्जिन</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>कपी भयो!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>📋 कपी</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Output Display Area */}
          <div
            onDoubleClick={handleWordInspect}
            title={isDictTooltipEnabled ? 'कुनै पनि शब्दमा डबल-क्लिक गरी तत्काल शब्दकोश अर्थ हेर्नुहोस्' : undefined}
            className={`w-full flex-1 min-h-[280px] p-4 text-base md:text-lg rounded-2xl border border-slate-200 bg-slate-50/70 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all ${direction === 'u2p' && preetiViewMode === 'smart'
              ? 'font-preeti text-xl md:text-2xl text-slate-800'
              : direction === 'p2u'
                ? 'font-devanagari text-slate-800'
                : 'font-mono text-slate-700'
              }`}
          >
            {outputText || (
              <span className="text-slate-400 font-sans text-sm select-none">
                रूपान्तरण भएको नतिजा यहाँ तुरुन्त देखिनेछ...
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-semibold border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>
              वर्ण: {outCharCount} | शब्द: {outWordCount}
            </span>
          </div>
        </div>
      </div>

      {/* Live Dictionary Word Inspector Card */}
      {hoveredWordInfo && (
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-emerald-50/70 border border-blue-200 rounded-3xl p-5 shadow-md flex items-start justify-between gap-4 animate-fadeIn">
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xl font-black text-blue-950 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                {hoveredWordInfo.word}
              </span>
              {hoveredWordInfo.pos && (
                <span className="text-[11px] font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200">
                  {hoveredWordInfo.pos}
                </span>
              )}
              {hoveredWordInfo.etymology && (
                <span className="text-[11px] text-slate-500">
                  {hoveredWordInfo.etymology}
                </span>
              )}
              <span className="text-xs font-mono bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 text-slate-700 shadow-2xs">
                Preeti: <strong>{hoveredWordInfo.preeti}</strong>
              </span>
              <button
                type="button"
                onClick={() => speakNepaliWord(hoveredWordInfo.word)}
                title="उच्चारण सुन्नुहोस्"
                className="p-1 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {hoveredWordInfo.definitions[0] || 'नेपाली बृहत् शब्दकोशबाट प्रामाणिक शब्द।'}
            </p>

            {hoveredWordInfo.examples.length > 0 && (
              <p className="text-[11px] text-slate-500 italic bg-white/70 p-2 rounded-lg border-l-2 border-blue-400">
                "{hoveredWordInfo.examples[0]}"
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setHoveredWordInfo(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Document & Spreadsheet File Converter Dropzone */}
      <FileConverterDropzone defaultDirection={direction} />

      {/* Google Gemini AI Configuration Modal */}
      <GeminiConfigModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        onKeySaved={(key) => setIsGeminiActive(Boolean(key))}
      />

      {/* Print & Margin Settings Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 flex flex-col gap-5 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    कागजात प्रिन्ट तथा मार्जिन सेटिङ (Print Margins)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    A4 पृष्ठको मार्जिन र फन्ट ढाँचा मिलाएर प्रिन्ट वा PDF सेभ गर्नुहोस्
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Margin Options */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-700">कागजातको मार्जिन (Page Margins):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(PRINT_MARGINS) as PrintMarginKey[]).map((key) => {
                  const m = PRINT_MARGINS[key];
                  const isSelected = printMargin === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPrintMargin(key)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black ${isSelected ? 'text-emerald-800' : 'text-slate-800'}`}>
                          {m.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 leading-snug">{m.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Size & Header Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-700">प्रिन्ट फन्ट साइज:</span>
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  {[
                    { key: 'small', label: 'सानो' },
                    { key: 'normal', label: 'सामान्य' },
                    { key: 'large', label: 'ठूलो' },
                  ].map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setPrintFontSize(s.key as any)}
                      className={`flex-1 py-1 rounded-lg text-center transition-all ${
                        printFontSize === s.key ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-500'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-700">कागजातको हेडर / मिति:</span>
                <button
                  type="button"
                  onClick={() => setShowLetterhead(!showLetterhead)}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                    showLetterhead
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <span>शीर्ष हेडर तथा मिति</span>
                  <span>{showLetterhead ? 'देखाउने (ON)' : 'हटाउने (OFF)'}</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPrintModalOpen(false);
                  setTimeout(() => {
                    handlePrint();
                  }, 150);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-transform hover:scale-102"
              >
                <Printer className="w-4 h-4" />
                <span>अहिले प्रिन्ट / PDF सेभ गर्नुहोस्</span>
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Dedicated Clean Printable Document View (Visible ONLY when Printing) */}
      <div
        className="hidden print:block w-full bg-white text-black printable-document-page"
        style={{
          padding: PRINT_MARGINS[printMargin].padding,
          boxSizing: 'border-box',
        }}
      >
        {/* Document Header */}
        {showLetterhead && (
          <div className="border-b-2 border-slate-900 pb-3 mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-xl font-bold font-sans text-slate-900 tracking-tight">
                {direction === 'u2p' ? 'नेपाली रूपान्तरित कागजात (प्रिती फन्ट)' : 'नेपाली रूपान्तरित कागजात (युनिकोड)'}
              </h1>
              <p className="text-xs text-slate-600 font-sans mt-0.5">
                {direction === 'u2p'
                  ? 'फन्ट: Preeti (Standard Nepali Font)'
                  : 'फन्ट: नेपाली युनिकोड (Devanagari)'}
              </p>
            </div>
            <div className="text-right text-xs text-slate-600 font-sans">
              <div>मिति: {new Date().toLocaleDateString('ne-NP')}</div>
              <div>कुल शब्द: {outWordCount || wordCount} | अक्षर: {outCharCount || charCount}</div>
            </div>
          </div>
        )}

        {/* Document Body */}
        <div
          className={`w-full whitespace-pre-wrap break-words leading-relaxed text-black print-content ${
            direction === 'u2p' && preetiViewMode === 'smart'
              ? `font-preeti ${printFontSize === 'small' ? 'text-xl leading-[2.0]' : printFontSize === 'large' ? 'text-3xl leading-[2.4]' : 'text-2xl leading-[2.2]'}`
              : direction === 'p2u'
                ? `font-devanagari ${printFontSize === 'small' ? 'text-base leading-relaxed' : printFontSize === 'large' ? 'text-xl leading-relaxed' : 'text-lg leading-relaxed'}`
                : 'font-mono text-base leading-relaxed'
          }`}
          style={{
            fontFamily:
              direction === 'u2p' && preetiViewMode === 'smart' ? "'Preeti', sans-serif" : undefined,
          }}
        >
          {outputText || inputText || 'कुनै पाठ उपलब्ध छैन।'}
        </div>

        {/* Clean Minimal Document Footer */}
        <div className="mt-16 pt-3 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-400 font-sans">
          <span>नेपाली डिजिटल अनुवादक तथा प्रिती रूपान्तरण प्रणाली</span>
          <span>A4 Paper Print</span>
        </div>
      </div>
    </div>
  );
};

