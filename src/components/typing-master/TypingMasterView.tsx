'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TYPING_LEVELS, KEY_FINGER_ASSIGNMENTS, FingerType, FINGER_NAMES_NEPALI } from '@/lib/typing-master-data';
import { ColorCodedKeyboard } from './ColorCodedKeyboard';
import { soundEffects } from '@/lib/sound-effects';
import { unicodeToPreeti, preetiToUnicode } from '@/lib/preeti-converter';
import {
  unicodeToRomanizedKeystrokes,
  ROMAN_KEY_TO_DEVANAGARI,
  transliterateRomanizedText,
} from '@/lib/romanized-converter';
import {
  generateRandomizedLevelPrompt,
  learnFromUserTypedText,
} from '@/lib/nepali-ai-engine';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Clock,
  Award,
  Flame,
  ChevronRight,
  ChevronLeft,
  Lock,
  Printer,
  AlertTriangle,
  Sparkles,
  Shuffle,
  Brain,
  RefreshCw,
} from 'lucide-react';

export interface TypingMasterViewProps {
  customPracticePayload?: { text: string; id: number } | null;
  onClearCustomPayload?: () => void;
}

export const TypingMasterView: React.FC<TypingMasterViewProps> = ({
  customPracticePayload,
  onClearCustomPayload,
}) => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [layoutMode, setLayoutMode] = useState<'preeti' | 'romanized'>('preeti');
  const [userInput, setUserInput] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<number>(0);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(soundEffects.isMuted());

  // Wrong key notification state
  const [wrongKeyAlert, setWrongKeyAlert] = useState<{
    typed: string;
    expected: string;
    expectedGlyph?: string;
  } | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [keystrokeDisplayMode, setKeystrokeDisplayMode] = useState<'preeti' | 'latin'>('preeti');

  // Lok Sewa Exam controls
  const [examDuration, setExamDuration] = useState<number>(300); // 5 min (300s) default
  const [backspaceLocked, setBackspaceLocked] = useState<boolean>(false);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>('प्रशिक्षार्थी (Trainee)');

  // Key Accuracy tracking in localStorage
  const [keyAccuracyMap, setKeyAccuracyMap] = useState<Record<string, { total: number; correct: number }>>({});
  const [customPrompt, setCustomPrompt] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiModelUsed, setAiModelUsed] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const level = TYPING_LEVELS[currentLevelIdx];

  // User weak keys identified from typing history
  const weakKeys = useMemo(() => {
    return Object.entries(keyAccuracyMap)
      .filter(([_, data]) => data.total >= 3 && data.correct / data.total < 0.75)
      .map(([k]) => k);
  }, [keyAccuracyMap]);

  const targetDevanagari = useMemo(() => {
    return customPrompt || level.textPrompt;
  }, [customPrompt, level.textPrompt]);

  // Expected keystrokes depending on layoutMode
  const targetKeystrokes = useMemo(() => {
    if (layoutMode === 'preeti') {
      return unicodeToPreeti(targetDevanagari);
    }
    return unicodeToRomanizedKeystrokes(targetDevanagari);
  }, [layoutMode, targetDevanagari]);

  // Reset exercise
  const resetExercise = useCallback(() => {
    setUserInput('');
    setStartTime(null);
    setElapsedSeconds(0);
    setIsCompleted(false);
    setMistakes(0);
    setWrongKeyAlert(null);
    setIsShaking(false);
    if (timerRef.current) clearInterval(timerRef.current);
    inputRef.current?.focus();
  }, []);

  // Handle external practice text payload (e.g. from Dictionary or Proverbs)
  useEffect(() => {
    if (customPracticePayload?.text && customPracticePayload.text.trim()) {
      setCustomPrompt(customPracticePayload.text.trim());
      setAiModelUsed(null);
      setUserInput('');
      setStartTime(null);
      setElapsedSeconds(0);
      setIsCompleted(false);
      setMistakes(0);
      setWrongKeyAlert(null);
      setIsShaking(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [customPracticePayload]);

  // Generate fresh AI randomized sentence for current level (Google Gemini AI or local generator)
  const handleRandomizeAiText = useCallback(async () => {
    setIsGeneratingAi(true);
    const key = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;

    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_practice',
          level: level.level,
          weakKeys,
          apiKey: key || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.text) {
        setCustomPrompt(data.text);
        setAiModelUsed(data.model || 'Gemini AI');
        resetExercise();
        setIsGeneratingAi(false);
        return;
      }
    } catch { }

    // Fallback to local adaptive generator
    const fresh = generateRandomizedLevelPrompt(level.level, 18, weakKeys);
    setCustomPrompt(fresh);
    setAiModelUsed(null);
    resetExercise();
    setIsGeneratingAi(false);
  }, [level.level, weakKeys, resetExercise]);

  // Load saved key accuracy from localStorage
  useEffect(() => {
    try {
      const savedAcc = localStorage.getItem('uni_preeti_key_acc');
      if (savedAcc) {
        setKeyAccuracyMap(JSON.parse(savedAcc));
      }
    } catch { }
  }, []);

  // Save key accuracy
  const updateKeyAccuracy = useCallback((key: string, isCorrect: boolean) => {
    setKeyAccuracyMap((prev) => {
      const cur = prev[key] || { total: 0, correct: 0 };
      const updated = {
        ...prev,
        [key]: {
          total: cur.total + 1,
          correct: isCorrect ? cur.correct + 1 : cur.correct,
        },
      };
      try {
        localStorage.setItem('uni_preeti_key_acc', JSON.stringify(updated));
      } catch { }
      return updated;
    });
  }, []);

  // Timer loop
  useEffect(() => {
    if (startTime && !isCompleted) {
      timerRef.current = setInterval(() => {
        const sec = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(sec);

        if (level.isExam && sec >= examDuration) {
          setIsCompleted(true);
          soundEffects.playLevelUp();
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, isCompleted, level.isExam, examDuration]);

  // Focus input automatically & clear custom prompt on level change
  useEffect(() => {
    setCustomPrompt(null);
    inputRef.current?.focus();
  }, [currentLevelIdx, layoutMode]);

  // Active character and finger hints
  const activeCharIdx = userInput.length;
  const activeExpectedKey = targetKeystrokes[activeCharIdx] || '';
  const isShiftNeeded = /[A-Z!@#$%^&*()_+{}|:"<>?]/.test(activeExpectedKey);
  const activeFinger: FingerType | null = activeExpectedKey
    ? KEY_FINGER_ASSIGNMENTS[activeExpectedKey] || KEY_FINGER_ASSIGNMENTS[activeExpectedKey.toLowerCase()] || null
    : null;
  const shiftHand = activeFinger?.includes('right') ? 'left' : 'right';

  // Devanagari equivalent for current keystroke
  const activeExpectedGlyph = useMemo(() => {
    if (!activeExpectedKey) return '';
    if (layoutMode === 'preeti') {
      return preetiToUnicode(activeExpectedKey) || activeExpectedKey;
    }
    return (
      ROMAN_KEY_TO_DEVANAGARI[activeExpectedKey] ||
      ROMAN_KEY_TO_DEVANAGARI[activeExpectedKey.toLowerCase()] ||
      activeExpectedKey
    );
  }, [activeExpectedKey, layoutMode]);

  // Handle Input typing with immediate wrong key alert and protection against spamming
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isCompleted) return;

    // Prevent backspace if locked in exam
    if (level.isExam && backspaceLocked && e.key === 'Backspace') {
      e.preventDefault();
      soundEffects.playErrorBuzz();
      return;
    }

    // Ignore modifier keys alone
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
      return;
    }

    if (!startTime && e.key.length === 1) {
      setStartTime(Date.now());
    }

    if (e.key === 'Backspace') {
      setWrongKeyAlert(null);
      return;
    }

    // If single character key typed
    if (e.key.length === 1) {
      const typedChar = e.key;
      const expectedChar = targetKeystrokes[userInput.length];

      // Support typing either:
      // - Direct ASCII key (s, d, f)
      // - In Romanized: Case-insensitive when shift not required (e.g. 'm' matches 'm')
      // - In Preeti: Devanagari equivalent (क, म, ा)
      const typedMatches =
        typedChar === expectedChar ||
        (layoutMode === 'romanized' && typedChar.toLowerCase() === expectedChar.toLowerCase()) ||
        (layoutMode === 'preeti' && (preetiToUnicode(typedChar) === activeExpectedGlyph || unicodeToPreeti(typedChar) === expectedChar));

      if (typedMatches) {
        // Correct key!
        soundEffects.playKeyClick();
        updateKeyAccuracy(expectedChar, true);
        setWrongKeyAlert(null);
      } else {
        // Wrong key typed!
        e.preventDefault(); // Stop endless wrong character spam like "पाllllननननन..."
        soundEffects.playErrorBuzz();
        setMistakes((m) => m + 1);
        updateKeyAccuracy(expectedChar, false);

        // Trigger visual shake and notification
        setWrongKeyAlert({
          typed: typedChar === ' ' ? 'Space' : typedChar,
          expected: expectedChar === ' ' ? 'Space' : expectedChar,
          expectedGlyph: activeExpectedGlyph,
        });

        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isCompleted) return;
    const val = e.target.value;
    setUserInput(val);

    // Completion condition
    if (val.length >= targetKeystrokes.length) {
      setIsCompleted(true);
      soundEffects.playLevelUp();
      learnFromUserTypedText(targetDevanagari);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Performance calculations
  const totalKeystrokes = userInput.length;
  const minutes = Math.max(0.05, elapsedSeconds / 60);
  const grossWpm = Math.round(totalKeystrokes / 5 / minutes);
  const netWpm = Math.max(0, Math.round((totalKeystrokes / 5 - mistakes) / minutes));
  const accuracy =
    totalKeystrokes > 0 ? Math.max(0, Math.round(((totalKeystrokes - mistakes) / (totalKeystrokes + mistakes)) * 100)) : 100;
  const kpm = Math.round(totalKeystrokes / minutes);

  // Helper keystroke hint label for UI
  const getKeystrokeHint = (char: string) => {
    if (!char) return '';
    if (char === ' ') return 'Space (खाली ठाउँ)';
    return isShiftNeeded
      ? `Shift + [ ${activeExpectedKey.toLowerCase()} ]`
      : `[ ${char} ]`;
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            🎯
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800">
              नेपाली टाइपिङ मास्टर प्रो (Typing Master Pro)
            </h2>
            <p className="text-xs text-slate-500">
              १५ तह पाठ्यक्रम, किबोर्डको दायाँ-बायाँ वास्तविक हात गाइड र गलत कुञ्जी तत्काल सूचना
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sound toggle */}
          <button
            type="button"
            onClick={() => setIsSoundMuted(soundEffects.toggleMute())}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${isSoundMuted ? 'bg-slate-100 text-slate-600 border-slate-300' : 'bg-emerald-50 text-emerald-700 border-emerald-300'
              }`}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSoundMuted ? 'ध्वनि बन्द' : 'ध्वनि चालु'}</span>
          </button>

          {/* Heatmap toggle */}
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${showHeatmap ? 'bg-rose-50 text-rose-700 border-rose-300' : 'bg-slate-100 text-slate-600 border-slate-300'
              }`}
          >
            <Flame className="w-4 h-4 text-rose-500" />
            <span>{showHeatmap ? 'हिटम्याप चालु' : 'किबोर्ड हिटम्याप'}</span>
          </button>

          {/* Reset button */}
          <button
            type="button"
            onClick={resetExercise}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>पुनः सुरु</span>
          </button>
        </div>
      </div>

      {/* Level Navigator Ribbon */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            disabled={currentLevelIdx === 0}
            onClick={() => {
              setCurrentLevelIdx((i) => Math.max(0, i - 1));
              resetExercise();
            }}
            className="p-2 border rounded-xl disabled:opacity-40 hover:bg-slate-100 text-slate-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <select
            value={currentLevelIdx}
            onChange={(e) => {
              setCurrentLevelIdx(Number(e.target.value));
              resetExercise();
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 flex-1 md:w-80 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {TYPING_LEVELS.map((lvl, idx) => (
              <option key={lvl.level} value={idx}>
                {lvl.titleNepali}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={currentLevelIdx === TYPING_LEVELS.length - 1}
            onClick={() => {
              setCurrentLevelIdx((i) => Math.min(TYPING_LEVELS.length - 1, i + 1));
              resetExercise();
            }}
            className="p-2 border rounded-xl disabled:opacity-40 hover:bg-slate-100 text-slate-700"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Right side controls: AI Random Words, Weak-Key Badge & Layout Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AI Randomize Words Button */}
          <button
            type="button"
            disabled={isGeneratingAi}
            onClick={handleRandomizeAiText}
            title="Google Gemini AI वा Local AI द्वारा नयाँ अभ्यास वाक्य सिर्जना गर्नुहोस्"
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isGeneratingAi ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Gemini सिर्जना गर्दै...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>🎲 नयाँ AI शब्दहरू (Randomize)</span>
              </>
            )}
          </button>

          {/* Weak key indicator badge if any */}
          {weakKeys.length > 0 && (
            <div
              className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px] font-bold flex items-center gap-1"
              title={`कमजोर कुञ्जीहरू: ${weakKeys.join(', ')}`}
            >
              <Brain className="w-3 h-3 text-rose-500" />
              <span>कमजोर कुञ्जी सुधार: {weakKeys.slice(0, 3).join(', ')}</span>
            </div>
          )}

          {/* Keyboard Layout Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setLayoutMode('preeti');
                resetExercise();
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${layoutMode === 'preeti' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              प्रिती फन्ट
            </button>
            <button
              type="button"
              onClick={() => {
                setLayoutMode('romanized');
                resetExercise();
              }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${layoutMode === 'romanized' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              युनिकोड रोमनाइज्ड
            </button>
          </div>
        </div>
      </div>

      {/* Special Controls for Exam Mode (Level 15) */}
      {level.isExam && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <Award className="w-5 h-5 text-amber-600" />
            <span>लोकसेवा आयोग परीक्षा मोड (Exam Mode):</span>
            <div className="flex gap-1 ml-2">
              <button
                type="button"
                onClick={() => {
                  setExamDuration(300);
                  resetExercise();
                }}
                className={`px-2.5 py-1 rounded-lg border font-bold ${examDuration === 300 ? 'bg-amber-600 text-white border-amber-700' : 'bg-white text-amber-900 border-amber-300'
                  }`}
              >
                ५ मिनेट
              </button>
              <button
                type="button"
                onClick={() => {
                  setExamDuration(600);
                  resetExercise();
                }}
                className={`px-2.5 py-1 rounded-lg border font-bold ${examDuration === 600 ? 'bg-amber-600 text-white border-amber-700' : 'bg-white text-amber-900 border-amber-300'
                  }`}
              >
                १० मिनेट
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer font-bold">
              <input
                type="checkbox"
                checked={backspaceLocked}
                onChange={(e) => setBackspaceLocked(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <Lock className="w-3.5 h-3.5" />
              <span>Backspace Lock (सच्याउन नमिल्ने)</span>
            </label>

            <button
              type="button"
              onClick={() => setShowCertificate(true)}
              className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-700 flex items-center gap-1 shadow-sm"
            >
              <Award className="w-3.5 h-3.5" />
              <span>प्रमाणपत्र हेर्नुहोस्</span>
            </button>
          </div>
        </div>
      )}

      {/* Live Prompt Ribbon Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        {/* Top Info Bar */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>{level.subtitle}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-700 font-bold">
              <Clock className="w-4 h-4 text-emerald-600" />
              {Math.floor(elapsedSeconds / 60)}:
              {String(elapsedSeconds % 60).padStart(2, '0')}
            </span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              {grossWpm} WPM
            </span>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
              {accuracy}% शुद्धता
            </span>
          </div>
        </div>

        {/* 1. Target Devanagari Passage Display in large clear font */}
        <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-emerald-800 font-bold block">
              लक्ष्य नेपाली वाक्य (Target Sentence):
            </span>
            {customPrompt && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${aiModelUsed
                  ? 'text-indigo-800 bg-indigo-100 border border-indigo-300'
                  : 'text-emerald-800 bg-emerald-100/90 border border-emerald-300'
                  }`}>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>
                    {aiModelUsed
                      ? `✨ ${aiModelUsed} द्वारा सिर्जना गरिएको वाक्य सक्रिय`
                      : customPracticePayload?.text === customPrompt
                      ? '🎯 शब्दकोश / उखान अभ्यास सक्रिय'
                      : 'AI अनियमित शब्द अभ्यास सक्रिय'}
                  </span>
                </span>

                {/* Drill 5x option if single word */}
                {customPrompt.trim().split(/\s+/).length === 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const word = customPrompt.trim();
                      const repeated = `${word} ${word} ${word} ${word} ${word}`;
                      setCustomPrompt(repeated);
                      resetExercise();
                    }}
                    title="यो शब्दलाई ५ पटक निरन्तर अभ्यास गर्नुहोस्"
                    className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-md transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                  >
                    <span>🔁 ५ पटक अभ्यास (5x Drill)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setCustomPrompt(null);
                    setAiModelUsed(null);
                    onClearCustomPayload?.();
                    resetExercise();
                  }}
                  title="पाठ्यक्रमको पूर्वनिर्धारित स्तरमा फर्कनुहोस्"
                  className="text-[10px] font-bold text-slate-500 hover:text-rose-600 bg-white border border-slate-200 hover:border-rose-300 px-2 py-0.5 rounded-md transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                >
                  <span>✕ तह {level.level} मा फर्कनुहोस्</span>
                </button>
              </div>
            )}
          </div>
          <div className="text-xl md:text-2xl font-bold text-slate-800 font-devanagari leading-relaxed tracking-wide">
            {targetDevanagari}
          </div>
        </div>

        {/* 2. Target Keystrokes Ribbon (Character-by-character live color feedback) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[90px] select-none relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 font-bold font-sans">
              टाइप गर्नुपर्ने कुञ्जीहरू ({layoutMode === 'preeti' ? 'Preeti Keystrokes' : 'रोमनाइज्ड कुञ्जीहरू (Romanized Keys)'}):
            </span>

            {layoutMode === 'preeti' && (
              <div className="flex bg-slate-200/70 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setKeystrokeDisplayMode('preeti')}
                  className={`px-2 py-0.5 rounded transition-all ${keystrokeDisplayMode === 'preeti'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  👁 प्रिती फन्ट
                </button>
                <button
                  type="button"
                  onClick={() => setKeystrokeDisplayMode('latin')}
                  className={`px-2 py-0.5 rounded transition-all ${keystrokeDisplayMode === 'latin'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  &lt;&gt; a b c d
                </button>
              </div>
            )}
          </div>

          <div
            className={`leading-relaxed select-none ${layoutMode === 'preeti' && keystrokeDisplayMode === 'preeti'
              ? 'font-preeti text-2xl md:text-3xl'
              : 'font-mono text-lg md:text-xl tracking-wider'
              }`}
          >
            {targetKeystrokes.split('').map((char, index) => {
              const isCompletedChar = index < userInput.length;
              const isCurrent = index === userInput.length;

              let charClass = 'text-slate-400';
              if (isCompletedChar) {
                charClass = 'text-emerald-600 bg-emerald-50 font-bold rounded';
              } else if (isCurrent) {
                charClass =
                  'text-blue-900 bg-blue-100 border-b-2 border-blue-600 px-1 rounded animate-pulse font-extrabold';
              }

              return (
                <span key={index} className={`transition-colors duration-150 ${charClass}`}>
                  {char}
                </span>
              );
            })}
          </div>
        </div>

        {/* 3. Live Keystroke Hint & Wrong Key Notification Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 min-h-[36px]">
          {/* Active Key Hint */}
          {activeExpectedKey && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span>अर्को कुञ्जी:</span>
              <span className="bg-blue-600 text-white font-mono px-3 py-1 rounded-full font-bold shadow-xs animate-bounce">
                {getKeystrokeHint(activeExpectedKey)} {activeExpectedGlyph ? `(${activeExpectedGlyph})` : ''}
              </span>
              {activeFinger && (
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                  {FINGER_NAMES_NEPALI[activeFinger]}
                </span>
              )}
            </div>
          )}

          {/* Prominent Wrong Key Notification Alert */}
          {wrongKeyAlert && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-300 text-rose-800 px-3 py-1.5 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-right duration-150 shadow-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                गलत कुञ्जी! तपाईंले &apos;
                <span className="font-mono underline text-rose-700 font-black">{wrongKeyAlert.typed}</span>
                &apos; थिच्नुभयो — कृपया &apos;
                <span className="font-mono text-emerald-700 underline font-black">
                  {wrongKeyAlert.expected} {wrongKeyAlert.expectedGlyph ? `(${wrongKeyAlert.expectedGlyph})` : ''}
                </span>
                &apos; थिच्नुहोस्!
              </span>
            </div>
          )}
        </div>

        {/* 4. Typing Input Box with Visual Shake on Error & Preeti rendering */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            disabled={isCompleted}
            placeholder={
              layoutMode === 'preeti'
                ? "यहाँ क्लिक गरेर माथिका प्रिती कुञ्जीहरू टाइप गर्न सुरु गर्नुहोस्..."
                : "यहाँ क्लिक गरेर माथिका रोमनाइज्ड कुञ्जीहरू (a, b, c, d) टाइप गर्न सुरु गर्नुहोस्..."
            }
            className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:bg-white outline-none transition-all ${layoutMode === 'preeti' && keystrokeDisplayMode === 'preeti'
              ? 'font-preeti text-2xl text-slate-800 tracking-wide'
              : 'font-mono text-lg text-slate-800'
              } ${isShaking
                ? 'animate-shake border-rose-500 ring-4 ring-rose-400/50 bg-rose-50/50'
                : 'border-slate-300 focus:ring-2 focus:ring-emerald-500'
              }`}
          />
          {layoutMode === 'romanized' && userInput.length > 0 && (
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5 font-medium bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
              <span className="font-bold text-emerald-800">नेपाली युनिकोड रूपान्तरण:</span>
              <span className="font-bold text-slate-800">{transliterateRomanizedText(userInput)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Realistic Color-Coded Keyboard with Realistic Hands on LEFT and RIGHT sides */}
      <ColorCodedKeyboard
        layoutMode={layoutMode}
        activeKey={activeExpectedKey}
        isShiftActive={isShiftNeeded}
        showHeatmap={showHeatmap}
        keyAccuracyMap={keyAccuracyMap}
        onKeyClick={(key) => {
          if (isCompleted) return;
          const expectedChar = targetKeystrokes[userInput.length];
          const matches =
            key === expectedChar ||
            (layoutMode === 'romanized' && key.toLowerCase() === expectedChar.toLowerCase()) ||
            (layoutMode === 'preeti' && (preetiToUnicode(key) === activeExpectedGlyph || unicodeToPreeti(key) === expectedChar));

          if (matches) {
            soundEffects.playKeyClick();
            setUserInput((prev) => prev + expectedChar);
            setWrongKeyAlert(null);
          } else {
            soundEffects.playErrorBuzz();
            setMistakes((m) => m + 1);
            setWrongKeyAlert({
              typed: key,
              expected: expectedChar,
              expectedGlyph: activeExpectedGlyph,
            });
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 400);
          }
        }}
        activeFinger={activeFinger}
        needsShift={isShiftNeeded}
        shiftHand={shiftHand}
      />

      {/* Completion Modal / Scorecard */}
      {isCompleted && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
              🎉
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">बधाई छ! अभ्यास पूरा भयो</h3>
              <p className="text-xs text-slate-500 mt-1">{level.titleNepali}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-bold block">Gross WPM</span>
                <span className="text-2xl font-black text-slate-800">{grossWpm}</span>
              </div>
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                <span className="text-[11px] text-emerald-700 font-bold block">Net WPM</span>
                <span className="text-2xl font-black text-emerald-700">{netWpm}</span>
              </div>
              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200">
                <span className="text-[11px] text-blue-700 font-bold block">Accuracy</span>
                <span className="text-2xl font-black text-blue-700">{accuracy}%</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
                <span className="text-[11px] text-amber-700 font-bold block">KPM</span>
                <span className="text-2xl font-black text-amber-700">{kpm}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetExercise}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-sm transition-colors"
              >
                पुनः अभ्यास गर्नुहोस्
              </button>
              {currentLevelIdx < TYPING_LEVELS.length - 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentLevelIdx((i) => i + 1);
                    resetExercise();
                  }}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors"
                >
                  अर्को तह जानुहोस् →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Official Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border-8 border-double border-emerald-600 rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative flex flex-col gap-6 text-center">
            <button
              type="button"
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-lg"
            >
              ✕
            </button>

            <div className="flex flex-col items-center">
              <span className="text-4xl">🇳🇵</span>
              <h2 className="text-xl md:text-2xl font-black text-emerald-800 uppercase tracking-wider mt-2">
                नेपाली टाइपिङ दक्षता प्रमाणपत्र
              </h2>
              <span className="text-xs text-slate-500 font-semibold tracking-widest uppercase">
                Nepali Typing Proficiency Certificate / Scorecard
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              प्रमाणित गरिन्छ कि श्री/सुश्री{' '}
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="border-b-2 border-emerald-600 font-bold text-slate-800 text-center px-2 outline-none"
              />{' '}
              ले लोकसेवा आयोग मापदण्ड अनुरूप नेपाली टाइपिङ परीक्षा सफलतापूर्वक सम्पन्न गर्नुभएको छ।
            </p>

            <div className="grid grid-cols-4 gap-3 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Gross WPM</span>
                <span className="text-xl font-black text-slate-800">{grossWpm}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Net WPM</span>
                <span className="text-xl font-black text-emerald-700">{netWpm}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">शुद्धता (Accuracy)</span>
                <span className="text-xl font-black text-blue-700">{accuracy}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">नतिजा</span>
                <span className={`text-base font-black ${netWpm >= 25 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {netWpm >= 25 ? 'उत्तीर्ण (PASS)' : 'अनुत्तीर्ण (FAIL)'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 pt-4">
              <span>प्रणाली: नेपाली अनुवादक तथा टाइपिङ मास्टर</span>
              <span>मिति: {new Date().toLocaleDateString('ne-NP')}</span>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-700 shadow-md text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>प्रिन्ट / PDF सेभ गर्नुहोस्</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
