'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  BookOpen,
  Volume2,
  Star,
  Copy,
  Check,
  ArrowRight,
  Target,
  Sparkles,
  Filter,
  Plus,
  BookmarkCheck,
  CheckCircle2,
  HelpCircle,
  X,
  FileText,
  RotateCcw,
  RefreshCw,
  Shuffle,
  Loader2,
} from 'lucide-react';
import {
  NEPALI_LETTERS,
  NepaliLetter,
  BARAKHARI_MATRAS,
  DictionaryEntry,
  searchDictionary,
  loadLetterShard,
  getWordOfTheDay,
  NEPALI_PROVERBS,
  NepaliProverb,
  speakNepaliWord,
  checkSpelling,
} from '@/lib/nepali-dictionary';
import { unicodeToPreeti } from '@/lib/preeti-converter';

interface NepaliDictionaryViewProps {
  onSendToConverter?: (word: string, isPreeti?: boolean) => void;
  onSendToTypingMaster?: (practiceText: string) => void;
  isTabActive?: boolean;
}

export const NepaliDictionaryView: React.FC<NepaliDictionaryViewProps> = ({
  onSendToConverter,
  onSendToTypingMaster,
  isTabActive,
}) => {
  // Navigation & Filter State
  const [activeTab, setActiveTab] = useState<'dictionary' | 'proverbs' | 'bookmarks' | 'spellcheck'>('dictionary');
  const [selectedLetter, setSelectedLetter] = useState<NepaliLetter | null>('अ');
  const [selectedBarakhari, setSelectedBarakhari] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [detectedScript, setDetectedScript] = useState<string>('unicode');
  const [transliteratedQuery, setTransliteratedQuery] = useState<string>('');

  // Data State
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<DictionaryEntry | null>(null);
  const [wordOfTheDay, setWordOfTheDay] = useState<DictionaryEntry | null>(null);

  // Bookmarks & Custom Words State
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newWordText, setNewWordText] = useState<string>('');
  const [newWordPos, setNewWordPos] = useState<string>('ना.');
  const [newWordDef, setNewWordDef] = useState<string>('');
  const [newWordExample, setNewWordExample] = useState<string>('');

  // Spell Check State
  const [spellCheckInput, setSpellCheckInput] = useState<string>('हाम्रो देस नेपाल धेरै शुन्दर छ।');
  const [spellCheckResults, setSpellCheckResults] = useState<{ original: string; isCorrect: boolean; suggestions: string[] }[]>([]);
  const [isSpellChecking, setIsSpellChecking] = useState<boolean>(false);

  // Proverbs filter
  const [proverbCategory, setProverbCategory] = useState<string>('all');
  const [proverbQuery, setProverbQuery] = useState<string>('');

  // Function to refresh word of the day to a fresh, different word
  const refreshWordOfTheDay = useCallback(() => {
    setWordOfTheDay((prev) => getWordOfTheDay(prev?.word));
  }, []);

  // 1. Refresh on page refresh / initial mount
  useEffect(() => {
    refreshWordOfTheDay();

    try {
      const saved = localStorage.getItem('uni_bookmarked_words');
      if (saved) setBookmarkedIds(JSON.parse(saved));
    } catch {}

    // Load initial shard for 'अ'
    loadLetterWords('अ', 'all');
  }, [refreshWordOfTheDay]);

  // 2. Change word on every internal tab change (dictionary | proverbs | bookmarks | spellcheck)
  useEffect(() => {
    refreshWordOfTheDay();
  }, [activeTab, refreshWordOfTheDay]);

  // 3. Change word whenever user switches to the Dictionary section in main navigation
  useEffect(() => {
    if (isTabActive) {
      refreshWordOfTheDay();
    }
  }, [isTabActive, refreshWordOfTheDay]);

  const loadLetterWords = useCallback(async (letter: NepaliLetter, barakhari: string) => {
    setIsLoading(true);
    try {
      const res = await searchDictionary('', letter, barakhari);
      setEntries(res.entries);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle Search Input Change with Debounce
  useEffect(() => {
    const handler = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await searchDictionary(searchQuery, selectedLetter || undefined, selectedBarakhari);
        setEntries(res.entries);
        setDetectedScript(res.detectedScript);
        setTransliteratedQuery(res.transliteratedQuery);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [searchQuery, selectedLetter, selectedBarakhari]);

  // Select Letter
  const handleSelectLetter = (letter: NepaliLetter | null) => {
    setSelectedLetter(letter);
    setSelectedBarakhari('all');
    setSearchQuery('');
    if (letter) {
      loadLetterWords(letter, 'all');
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarkedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('uni_bookmarked_words', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Copy with Feedback
  const handleCopyText = (text: string, key: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Add Custom Word
  const handleSaveCustomWord = () => {
    if (!newWordText.trim() || !newWordDef.trim()) return;

    const newEntry: DictionaryEntry = {
      id: `custom_${Date.now()}`,
      word: newWordText.trim(),
      preeti: unicodeToPreeti(newWordText.trim()),
      preetiKeys: unicodeToPreeti(newWordText.trim()).split('').map((c) => `[ ${c} ]`).join(' + '),
      syllables: newWordText.trim().split('').join(' - '),
      pos: newWordPos,
      etymology: '[प्रयोगकर्ता-प्रविष्टि]',
      definitions: [newWordDef.trim()],
      examples: newWordExample.trim() ? [newWordExample.trim()] : [],
      synonyms: [],
    };

    try {
      const saved = localStorage.getItem('uni_custom_words');
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(newEntry);
      localStorage.setItem('uni_custom_words', JSON.stringify(list));
      setEntries((prev) => [newEntry, ...prev]);
    } catch {}

    setIsAddModalOpen(false);
    setNewWordText('');
    setNewWordDef('');
    setNewWordExample('');
  };

  // Run Spell Checker with 123,000+ dictionary shards
  const handleRunSpellCheck = useCallback(async (textToTest?: string) => {
    const text = textToTest !== undefined ? textToTest : spellCheckInput;
    if (!text.trim()) {
      setSpellCheckResults([]);
      return;
    }
    setIsSpellChecking(true);
    try {
      const results = await checkSpelling(text);
      setSpellCheckResults(results);
    } catch (err) {
      console.error('Spell check error:', err);
    } finally {
      setIsSpellChecking(false);
    }
  }, [spellCheckInput]);

  const handleApplySuggestion = (originalWord: string, replacementWord: string) => {
    // Replace whole word occurrence cleanly
    const updated = spellCheckInput.split(/(\s+|[,\.।!?\-—\(\)])/).map((token) => {
      return token === originalWord ? replacementWord : token;
    }).join('');
    setSpellCheckInput(updated);
    handleRunSpellCheck(updated);
  };

  // Filtered Proverbs
  const filteredProverbs = useMemo(() => {
    return NEPALI_PROVERBS.filter((p) => {
      const matchCat = proverbCategory === 'all' || p.category === proverbCategory;
      const matchQuery =
        !proverbQuery ||
        p.proverb.includes(proverbQuery) ||
        p.meaning.includes(proverbQuery) ||
        p.preeti.includes(proverbQuery);
      return matchCat && matchQuery;
    });
  }, [proverbCategory, proverbQuery]);

  // Vowel & Consonant splits for navigation
  const vowels = NEPALI_LETTERS.slice(0, 13);
  const consonants = NEPALI_LETTERS.slice(13);

  // Check if active letter is a consonant (so we show Barakhari)
  const isConsonantSelected = selectedLetter && consonants.includes(selectedLetter);

  return (
    <div className="w-full flex flex-col gap-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex-1 flex flex-col gap-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-emerald-100 text-xs font-bold w-fit">
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>नेपाली बृहत् शब्दकोश (अ देखि ज्ञ सम्म)</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            नेपाली डिजिटल बृहत् शब्दकोश
          </h2>
          <p className="text-xs md:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
            १,२३,०००+ भन्दा बढी आधिकारिक शब्दहरू, विस्तृत अर्थ, उदाहरण, पदवर्ग, स्रोत, प्रिती किस्ट्रोक र शुद्ध उच्चारण।
          </p>

          {/* Nav Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <button
              onClick={() => setActiveTab('dictionary')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                activeTab === 'dictionary'
                  ? 'bg-white text-emerald-800 shadow-md font-extrabold scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>शब्दकोश खोज</span>
            </button>
            <button
              onClick={() => setActiveTab('proverbs')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                activeTab === 'proverbs'
                  ? 'bg-white text-emerald-800 shadow-md font-extrabold scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>उखान-टुक्का र वाग्धारा</span>
            </button>
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                activeTab === 'bookmarks'
                  ? 'bg-white text-emerald-800 shadow-md font-extrabold scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>मनपर्ने शब्दहरू ({bookmarkedIds.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('spellcheck');
                handleRunSpellCheck();
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                activeTab === 'spellcheck'
                  ? 'bg-white text-emerald-800 shadow-md font-extrabold scale-105'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-300" />
              <span>हिज्जे जाँच (Spell Check)</span>
            </button>
          </div>
        </div>

        {/* Word of the Day Widget - Interactive & dynamically updates on click, tab change & refresh */}
        {wordOfTheDay && (
          <div
            onClick={refreshWordOfTheDay}
            title="यहाँ क्लिक गरी अर्को नयाँ शब्द हेर्नुहोस् (Click to view another Word of the Day)"
            className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 hover:border-amber-300/60 rounded-2xl p-4 text-white max-w-sm w-full flex flex-col gap-2 shadow-lg z-10 cursor-pointer transition-all hover:scale-[1.01] group relative select-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300" />
                <span>आजको शब्द (Word of the Day)</span>
                <span className="text-[10px] text-amber-100 bg-amber-400/20 group-hover:bg-amber-400/35 border border-amber-300/30 px-1.5 py-0.2 rounded-full font-medium transition-all flex items-center gap-0.5">
                  <RefreshCw className="w-2.5 h-2.5 group-hover:rotate-180 transition-transform duration-500" />
                  <span>नयाँ शब्द</span>
                </span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    refreshWordOfTheDay();
                  }}
                  title="नयाँ शब्द लोड गर्नुहोस् (Shuffle Word)"
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-amber-200 hover:text-white transition-colors"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakNepaliWord(wordOfTheDay.word);
                  }}
                  title="उच्चारण सुन्नुहोस्"
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-emerald-200" />
                </button>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h4 className="text-xl font-black group-hover:text-amber-200 transition-colors">{wordOfTheDay.word}</h4>
              <span className="text-[11px] text-emerald-200 font-mono bg-white/10 px-2 py-0.5 rounded-md">
                Preeti: {wordOfTheDay.preeti}
              </span>
            </div>
            <p className="text-xs text-white/90 line-clamp-2 leading-relaxed">
              {wordOfTheDay.definitions[0] || 'नेपाली बृहत् शब्दकोशबाट प्रामाणिक शब्द।'}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
              <span className="text-emerald-200">{wordOfTheDay.pos}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEntry(wordOfTheDay);
                }}
                className="text-amber-300 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>विस्तृत अर्थ हेर्नुहोस्</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= TAB 1: MAIN DICTIONARY SEARCH ================= */}
      {activeTab === 'dictionary' && (
        <div className="flex flex-col gap-6">
          {/* 4-Way Multi-Script Smart Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-emerald-600 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 शब्द खोज्नुहोस्: नेपाली युनिकोड (किताब), प्रिती (lstfa), Romanized (kitab) वा English (book)..."
                className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm md:text-base font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Script Detection & Action Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-1">
              <div className="flex items-center gap-2">
                {detectedScript === 'preeti' && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold flex items-center gap-1">
                    ⚡ प्रिती पहिचान: <code className="font-mono">{searchQuery}</code> → <strong>{transliteratedQuery}</strong>
                  </span>
                )}
                {detectedScript === 'romanized' && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold flex items-center gap-1">
                    🔤 रोमनाइज्ड: <code className="font-mono">{searchQuery}</code> → <strong>{transliteratedQuery}</strong>
                  </span>
                )}
                <span className="text-[11px] text-slate-400">
                  {entries.length} शब्दहरू फेला परे
                </span>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ नयाँ शब्द थप्नुहोस्</span>
              </button>
            </div>
          </div>

          {/* Alphabetical Varnamala Navigation Bar (अ देखि ज्ञ सम्म) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                <Filter className="w-3.5 h-3.5 text-emerald-600" /> वर्णमाला अक्षर छान्नुहोस् (Alphabetical Navigation):
              </span>
              <button
                onClick={() => handleSelectLetter(null)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors ${
                  selectedLetter === null
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                सबै वर्ण (All)
              </button>
            </div>

            {/* Row 1: १३ स्वर वर्ण (Vowels) */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">स्वर वर्ण (Vowels):</span>
              <div className="flex flex-wrap gap-1">
                {vowels.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => handleSelectLetter(letter)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${
                      selectedLetter === letter
                        ? 'bg-emerald-600 text-white shadow-md scale-105'
                        : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: ३६ व्यञ्जन तथा संयुक्त वर्ण (Consonants & Conjuncts) */}
            <div className="flex flex-col gap-1 pt-1 border-t border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">व्यञ्जन तथा संयुक्त वर्ण (Consonants & Conjuncts):</span>
              <div className="flex flex-wrap gap-1">
                {consonants.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => handleSelectLetter(letter)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${
                      selectedLetter === letter
                        ? 'bg-emerald-600 text-white shadow-md scale-105'
                        : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Dynamic Barakhari Matra Sub-Filter */}
            {isConsonantSelected && (
              <div className="flex flex-col gap-1 pt-2 border-t border-emerald-100 bg-emerald-50/50 p-2.5 rounded-xl">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase flex items-center gap-1">
                  <span>बाराखरी उप-फिल्टर ({selectedLetter} को मात्रा रूपहरू):</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {BARAKHARI_MATRAS.map((matra) => {
                    const isSelected = selectedBarakhari === matra.id;
                    const previewText =
                      matra.id === 'all'
                        ? `सबै ${selectedLetter}*`
                        : matra.id === 'halanta'
                        ? `${selectedLetter}्`
                        : `${selectedLetter}${matra.suffix}`;

                    return (
                      <button
                        key={matra.id}
                        onClick={() => {
                          setSelectedBarakhari(matra.id);
                          loadLetterWords(selectedLetter!, matra.id);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white hover:bg-emerald-100 text-slate-700 border border-emerald-200/60'
                        }`}
                      >
                        {previewText}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Word Results Grid */}
          {isLoading ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-500">शब्दकोश लोड हुँदैछ...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center flex flex-col items-center gap-3 shadow-sm">
              <HelpCircle className="w-10 h-10 text-slate-300" />
              <h4 className="text-base font-bold text-slate-700">कुनै शब्द फेला परेन</h4>
              <p className="text-xs text-slate-500 max-w-sm">
                तपाईंले खोज्नुभएको शब्द शब्दकोशमा फेला परेन। कृपया हिज्जे जाँच गर्नुहोस् वा नयाँ शब्द थप्नुहोस्।
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-colors"
              >
                + यो शब्द शब्दकोशमा थप्नुहोस्
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entries.map((item) => {
                const isBookmarked = bookmarkedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEntry(item)}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group relative"
                  >
                    {/* Header */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-xl font-black text-slate-800 group-hover:text-emerald-700 transition-colors">
                            {item.word}
                          </h3>
                          {item.pos && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                              {item.pos}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakNepaliWord(item.word);
                            }}
                            title="उच्चारण सुन्नुहोस्"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleToggleBookmark(item.id, e)}
                            title={isBookmarked ? 'मनपर्नेबाट हटाउनुहोस्' : 'मनपर्नेमा राख्नुहोस्'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isBookmarked
                                ? 'text-amber-500 hover:bg-amber-50'
                                : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Preeti Preview & Keys Chip */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          Preeti: {item.preeti}
                        </span>
                        {item.etymology && (
                          <span className="text-[10px] text-slate-400">{item.etymology}</span>
                        )}
                      </div>

                      {/* Definitions preview */}
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.definitions[0] || 'अर्थ उपलब्ध छैन।'}
                      </p>
                    </div>

                    {/* Footer Quick Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                      <span>{item.syllables ? `उच्चारण: ${item.syllables}` : ''}</span>
                      <div className="flex items-center gap-2.5">
                        {onSendToTypingMaster && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSendToTypingMaster(item.word);
                            }}
                            title="यो शब्द टाइपिङ मास्टरमा अभ्यास गर्नुहोस्"
                            className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Target className="w-3 h-3" />
                            <span>टाइपिङ</span>
                          </button>
                        )}
                        <span className="text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          विस्तृत <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PROVERBS & IDIOMS (उखान-टुक्का) ================= */}
      {activeTab === 'proverbs' && (
        <div className="flex flex-col gap-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
              <input
                type="text"
                value={proverbQuery}
                onChange={(e) => setProverbQuery(e.target.value)}
                placeholder="उखान वा अर्थ खोज्नुहोस्..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {['all', 'नैतिकता', 'अनुभव', 'व्यंग्य', 'जीवन'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setProverbCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    proverbCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat === 'all' ? 'सबै उखान' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProverbs.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between gap-3 hover:border-emerald-500 transition-all"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-black text-slate-800 leading-tight">
                      "{item.proverb}"
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                      {item.category}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                    Preeti: {item.preeti}
                  </div>

                  <div className="text-xs text-slate-700 leading-relaxed">
                    <strong>भावार्थ:</strong> {item.meaning}
                  </div>

                  {item.example && (
                    <div className="text-xs text-slate-500 italic bg-emerald-50/50 border-l-2 border-emerald-400 p-2 rounded-r-md">
                      <strong>उदाहरण:</strong> {item.example}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => speakNepaliWord(item.proverb)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition-colors"
                    title="उच्चारण सुन्नुहोस्"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleCopyText(item.proverb, `proverb_${item.id}`, e)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    {copiedKey === `proverb_${item.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>कपी</span>
                  </button>
                  {onSendToTypingMaster && (
                    <button
                      onClick={() => onSendToTypingMaster(item.proverb)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-xs"
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>टाइपिङ अभ्यास</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: BOOKMARKED WORDS ================= */}
      {activeTab === 'bookmarks' && (
        <div className="flex flex-col gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>तपाईंले सुरक्षित गर्नुभएका शब्दहरू ({bookmarkedIds.length})</span>
            </span>
            {bookmarkedIds.length > 0 && (
              <button
                onClick={() => {
                  setBookmarkedIds([]);
                  localStorage.removeItem('uni_bookmarked_words');
                }}
                className="text-xs text-rose-600 hover:underline font-bold"
              >
                सबै खाली गर्नुहोस्
              </button>
            )}
          </div>

          {bookmarkedIds.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center flex flex-col items-center gap-2">
              <BookmarkCheck className="w-10 h-10 text-slate-300" />
              <h4 className="text-sm font-bold text-slate-700">कुनै शब्द सुरक्षित गरिएको छैन</h4>
              <p className="text-xs text-slate-500">
                शब्दकोशमा शब्दको दायाँ छेउको तारा (⭐) आइकन थिचेर शब्द सुरक्षित गर्न सक्नुहुन्छ।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entries
                .filter((item) => bookmarkedIds.includes(item.id))
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEntry(item)}
                    className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black text-slate-800">{item.word}</h4>
                        <button
                          onClick={(e) => handleToggleBookmark(item.id, e)}
                          className="p-1 text-amber-500 hover:text-rose-500 transition-colors"
                        >
                          <Star className="w-4 h-4 fill-amber-400" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                        {item.definitions[0] || 'अर्थ उपलब्ध छैन।'}
                      </p>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">Preeti: {item.preeti}</div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: SPELL CHECKER ================= */}
      {activeTab === 'spellcheck' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <span>नेपाली हिज्जे तथा ह्रस्व-दीर्घ परीक्षक</span>
                <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  १,२३,०००+ बृहत् शब्दकोशमा आधारित
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                नेपाली अनुच्छेद प्रविष्ट गरी शब्दकोशसँग हिज्जे रुजु गर्नुहोस्। गलत शब्दको सुझावमा क्लिक गरेर सिधै सच्याउन सकिन्छ।
              </p>
            </div>
            {spellCheckResults.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>शुद्ध: {spellCheckResults.filter((r) => r.isCorrect).length}</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold flex items-center gap-1">
                  <X className="w-3.5 h-3.5 text-rose-600" />
                  <span>अशुद्ध: {spellCheckResults.filter((r) => !r.isCorrect).length}</span>
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <textarea
              rows={4}
              value={spellCheckInput}
              onChange={(e) => setSpellCheckInput(e.target.value)}
              placeholder="यहाँ नेपाली अनुच्छेद टाइप वा पेस्ट गर्नुहोस्..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const sample = 'हाम्रो देस नेपाल धेरै शुन्दर छ।';
                  setSpellCheckInput(sample);
                  handleRunSpellCheck(sample);
                }}
                className="text-xs text-emerald-700 hover:text-emerald-900 underline font-semibold cursor-pointer"
              >
                उदाहरण वाक्य लोड गर्नुहोस्
              </button>

              <button
                disabled={isSpellChecking}
                onClick={() => handleRunSpellCheck()}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                {isSpellChecking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{isSpellChecking ? 'जाँच गर्दैछ...' : 'हिज्जे परीक्षण गर्नुहोस्'}</span>
              </button>
            </div>
          </div>

          {spellCheckResults.length > 0 && (
            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                <span>परीक्षण परिणाम (Word Evaluation):</span>
                <span className="text-[11px] font-normal text-slate-400">
                  (गलत शब्दमा रहेको सुझावमा क्लिक गरी तुरुन्त सच्याउनुहोस्)
                </span>
              </span>
              <div className="flex flex-wrap gap-2">
                {spellCheckResults.map((res, i) => (
                  <div
                    key={i}
                    className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 shadow-xs transition-all ${
                      res.isCorrect
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    <span>{res.original}</span>
                    {res.isCorrect ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <div className="flex items-center gap-1.5 text-[11px] text-rose-700 flex-wrap">
                        <span className="font-semibold text-rose-600">(अशुद्ध)</span>
                        {res.suggestions.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-slate-500">सुझाव:</span>
                            {res.suggestions.map((sug, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                onClick={() => handleApplySuggestion(res.original, sug)}
                                title="यो सही शब्दले बदल्नुहोस् (Click to replace)"
                                className="font-bold text-emerald-800 bg-white hover:bg-emerald-100 hover:border-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                              >
                                <span>👉 {sug}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= WORD DETAIL MODAL / DRAWER (FULL-PAGE BIG CONTAINER) ================= */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-5xl md:max-w-6xl h-[92vh] border border-slate-200 shadow-2xl overflow-hidden flex flex-col animate-scaleUp">
            {/* Modal Header Banner */}
            <div className="p-6 md:p-8 bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 text-white flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl md:text-4xl font-black shadow-inner shrink-0 border border-white/20">
                  {selectedEntry.word[0]}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-3xl md:text-5xl font-black tracking-tight text-white drop-shadow-xs">
                      {selectedEntry.word}
                    </h3>
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold border border-white/20">
                      {selectedEntry.pos}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-semibold border border-emerald-300/30">
                      {selectedEntry.etymology || '[नेपाली]'}
                    </span>
                  </div>
                  {selectedEntry.syllables && (
                    <div className="text-xs text-emerald-100/80 font-mono flex items-center gap-1.5">
                      <span className="text-emerald-300 font-bold">अक्षर विच्छेद:</span>
                      <span>{selectedEntry.syllables}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakNepaliWord(selectedEntry.word)}
                  title="उच्चारण सुन्नुहोस् (Listen Pronunciation)"
                  className="px-3.5 py-2 rounded-2xl bg-white/15 hover:bg-white/25 transition-all flex items-center gap-2 font-bold text-xs shadow-xs"
                >
                  <Volume2 className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span className="hidden sm:inline">उच्चारण सुन्नुहोस्</span>
                </button>
                <button
                  onClick={() => setSelectedEntry(null)}
                  title="बन्द गर्नुहोस् (Close)"
                  className="p-2.5 rounded-2xl bg-white/15 hover:bg-rose-600 transition-all text-white shadow-xs"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body - 2 Columns on Desktop */}
            <div className="p-6 md:p-8 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
              {/* Left Column (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                {/* Preeti & Keystroke Recipe Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-100 pb-2">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>प्रिती फन्ट र टाइप गर्ने तरिका (Keystroke Recipe):</span>
                    </span>
                    <button
                      onClick={(e) => handleCopyText(selectedEntry.preeti, 'modal_preeti', e)}
                      className="text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 text-xs font-bold"
                    >
                      {copiedKey === 'modal_preeti' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Preeti कपी</span>
                    </button>
                  </div>

                  {/* Giant Preeti Font Display */}
                  <div className="bg-emerald-50/40 border border-emerald-200/80 rounded-xl p-4 text-center">
                    <span className="text-xs text-slate-400 block mb-1">Preeti Font Rendered:</span>
                    <div className="font-preeti text-4xl md:text-5xl text-emerald-800 tracking-wide select-all">
                      {selectedEntry.preeti}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">कच्चा अक्षर (Raw ASCII):</span>
                      <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {selectedEntry.preeti}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-mono mt-1">
                      <span className="text-slate-400 font-sans font-bold block mb-1">कुञ्जी क्रम (Key Sequence):</span>
                      <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md block leading-relaxed border border-blue-200/60">
                        {selectedEntry.preetiKeys || selectedEntry.preeti.split('').map((c) => `[ ${c} ]`).join(' + ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Linguistic Profile Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2">
                    भाषिक विवरण (Linguistic Profile)
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                      <span className="text-slate-400 font-medium">पदवर्ग (Part of Speech):</span>
                      <span className="font-bold text-slate-800 text-sm">{selectedEntry.pos}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                      <span className="text-slate-400 font-medium">स्रोत (Etymology):</span>
                      <span className="font-bold text-slate-800 text-sm">{selectedEntry.etymology || '[नेपाली]'}</span>
                    </div>
                  </div>
                  {selectedEntry.english && (
                    <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs">
                      <span className="text-blue-600 font-bold block mb-0.5">English Equivalent:</span>
                      <span className="text-slate-800 font-medium">{selectedEntry.english}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column (7 Cols) */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Definitions Section */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-3">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>नेपाली बृहत् शब्दकोश अर्थ (Definitions):</span>
                    <span className="text-xs font-normal text-slate-400 normal-case ml-auto">
                      {selectedEntry.definitions.length} अर्थहरू
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {selectedEntry.definitions.map((def, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-base md:text-lg text-slate-800 font-medium leading-relaxed flex items-start gap-3 shadow-2xs"
                      >
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div className="flex-1">{def}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Authentic Examples Section */}
                {selectedEntry.examples && selectedEntry.examples.length > 0 && (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-3">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>वाक्यमा प्रामाणिक प्रयोग (Authentic Examples):</span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      {selectedEntry.examples.map((ex, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl bg-slate-50 border-l-4 border-emerald-500 text-sm md:text-base text-slate-700 italic leading-relaxed"
                        >
                          "{ex}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions Bar */}
            <div className="p-4 md:px-8 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleCopyText(selectedEntry.word, 'modal_uni', e)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-2xs transition-all"
                >
                  {copiedKey === 'modal_uni' ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>युनिकोड कपी</span>
                </button>
                <button
                  onClick={() => handleToggleBookmark(selectedEntry.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all ${
                    bookmarkedIds.includes(selectedEntry.id)
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800'
                  }`}
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span>{bookmarkedIds.includes(selectedEntry.id) ? 'सुरक्षित गरिएको' : 'बुकमार्क'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {onSendToConverter && (
                  <button
                    onClick={() => {
                      onSendToConverter(selectedEntry.word);
                      setSelectedEntry(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>अनुवादकमा पठाउनुहोस्</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {onSendToTypingMaster && (
                  <button
                    onClick={() => {
                      onSendToTypingMaster(selectedEntry.word);
                      setSelectedEntry(null);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Target className="w-4 h-4" />
                    <span>टाइपिङ अभ्यास</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all ml-2"
                >
                  बन्द गर्नुहोस्
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD CUSTOM WORD MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col p-6 gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>नयाँ शब्द थप्नुहोस् (Add Word)</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">शब्द (Word):</label>
                <input
                  type="text"
                  value={newWordText}
                  onChange={(e) => setNewWordText(e.target.value)}
                  placeholder="उदा. प्रविधि"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">पदवर्ग (Part of Speech):</label>
                <select
                  value={newWordPos}
                  onChange={(e) => setNewWordPos(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ना.">नाम (Noun)</option>
                  <option value="वि.">विशेषण (Adjective)</option>
                  <option value="क्रि.">क्रियापद (Verb)</option>
                  <option value="अव्य.">अव्यय (Adverb / Particle)</option>
                  <option value="स.ना.">सर्वनाम (Pronoun)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">अर्थ (Definition):</label>
                <textarea
                  rows={2}
                  value={newWordDef}
                  onChange={(e) => setNewWordDef(e.target.value)}
                  placeholder="शब्दको नेपाली अर्थ..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">वाक्यमा प्रयोग (Example sentence - ऐच्छिक):</label>
                <input
                  type="text"
                  value={newWordExample}
                  onChange={(e) => setNewWordExample(e.target.value)}
                  placeholder="उदा. नेपालमा सूचना प्रविधिको विकास तीव्र छ।"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                onClick={handleSaveCustomWord}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                सुरक्षित गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
