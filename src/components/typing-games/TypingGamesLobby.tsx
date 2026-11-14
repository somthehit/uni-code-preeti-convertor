'use client';

import React, { useState, useEffect } from 'react';
import { FallingWordsGame } from './FallingWordsGame';
import { BalloonPopGame } from './BalloonPopGame';
import { NepalRaceGame } from './NepalRaceGame';
import { Trophy, Gamepad2, ArrowLeft, Flame, Sparkles } from 'lucide-react';

export const TypingGamesLobby: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'falling' | 'balloon' | 'race' | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [fontMode, setFontMode] = useState<'preeti' | 'unicode' | 'romanized'>('preeti');
  const [baseSpeed, setBaseSpeed] = useState<number>(1.0);

  // Persistent Leaderboard
  const [leaderboard, setLeaderboard] = useState<Record<string, { score: number; wpm: number; date: string }>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem('uni_preeti_games_leaderboard');
      if (saved) {
        setLeaderboard(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const handleGameOver = (gameKey: string, score: number, wpm: number) => {
    setLeaderboard((prev) => {
      const existing = prev[gameKey] || { score: 0, wpm: 0, date: '' };
      if (score > existing.score) {
        const updated = {
          ...prev,
          [gameKey]: {
            score,
            wpm,
            date: new Date().toLocaleDateString('ne-NP'),
          },
        };
        try {
          localStorage.setItem('uni_preeti_games_leaderboard', JSON.stringify(updated));
        } catch {}
        return updated;
      }
      return prev;
    });
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            🎮
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800">
              नेपाली टाइपिङ आर्केड गेम्स (Arcade Games Suite)
            </h2>
            <p className="text-xs text-slate-500">
              ६० FPS क्यानभास एनिमेसन, वेभ अडियो साउन्ड इफेक्ट्स र ३ नेपाली फन्ट गेमहरू
            </p>
          </div>
        </div>

        {activeGame && (
          <button
            type="button"
            onClick={() => setActiveGame(null)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>खेल लबीमा फर्कनुहोस्</span>
          </button>
        )}
      </div>

      {/* Global Config Controls (Difficulty, Font Mode & Speed Control) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">कठिनाई (Difficulty):</span>
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {(['easy', 'medium', 'hard'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    difficulty === d ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {d === 'easy' ? 'सजिलो' : d === 'medium' ? 'मध्यम' : 'कठिन'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">फन्ट मोड (Font Mode):</span>
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setFontMode('preeti')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  fontMode === 'preeti' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                प्रिती फन्ट (Preeti)
              </button>
              <button
                type="button"
                onClick={() => setFontMode('romanized')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  fontMode === 'romanized' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                रोमनाइज्ड (Romanized)
              </button>
              <button
                type="button"
                onClick={() => setFontMode('unicode')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  fontMode === 'unicode' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                नेपाली युनिकोड
              </button>
            </div>
          </div>
        </div>

        {/* Speed Control Row */}
        <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>⚡ प्रारम्भिक गति (Base Speed):</span>
              <span className="text-amber-600 font-mono font-black">{baseSpeed.toFixed(1)}x</span>
            </span>

            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {[
                { val: 0.6, label: '०.६x (धीमा)' },
                { val: 1.0, label: '१.०x (सामान्य)' },
                { val: 1.4, label: '१.४x (तीव्र)' },
                { val: 1.8, label: '१.८x (प्रो)' },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => setBaseSpeed(p.val)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    baseSpeed === p.val
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <input
                type="range"
                min="0.4"
                max="2.4"
                step="0.1"
                value={baseSpeed}
                onChange={(e) => setBaseSpeed(parseFloat(e.target.value))}
                className="w-24 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            🚀 स्वचालित गति वृद्धि: सही शब्द मिलेसँगै खेलभित्र गति क्रमशः बढ्दै जानेछ!
          </span>
        </div>
      </div>

      {/* If No Active Game: Show 3-Game Selector Grid & High Scores */}
      {!activeGame ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Game 1 Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  🏔️
                </div>
                <h3 className="text-xl font-black text-slate-800">हिमाली शब्द रक्षा</h3>
                <span className="text-[11px] font-bold text-amber-600 tracking-wider uppercase block mt-1">
                  Typeshala Classic Invaders
                </span>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  स्वयम्भू स्तूपा र हिमालको दृश्यमा खसिरहेका शब्दहरूलाई स्तूपा लेजरले ध्वस्त पार्नुहोस्। हिउँ र चट्याङ शक्तिहरू सामेल छन्।
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400 font-bold block">उच्च अङ्क</span>
                  <span className="font-black text-slate-800">{leaderboard['falling']?.score || 0} अङ्क</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveGame('falling')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs shadow-md transition-transform hover:scale-105"
                >
                  खेल्नुहोस् →
                </button>
              </div>
            </div>

            {/* Game 2 Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  🎈
                </div>
                <h3 className="text-xl font-black text-slate-800">बेलुन फोड्ने खेल</h3>
                <span className="text-[11px] font-bold text-sky-600 tracking-wider uppercase block mt-1">
                  Key Reflex Trainer
                </span>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  फेवातालको आकाशमा उड्दै गरेका रंगीबिरंगी हट-एयर बेलुनहरूमा लेखिएका अक्षर थिचेर कन्फेटी पड्काउनुहोस्।
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400 font-bold block">उच्च अङ्क</span>
                  <span className="font-black text-slate-800">{leaderboard['balloon']?.score || 0} अङ्क</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveGame('balloon')}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl text-xs shadow-md transition-transform hover:scale-105"
                >
                  खेल्नुहोस् →
                </button>
              </div>
            </div>

            {/* Game 3 Card */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  🏍️
                </div>
                <h3 className="text-xl font-black text-slate-800">नेपाल एक्सप्रेस दौड</h3>
                <span className="text-[11px] font-bold text-emerald-600 tracking-wider uppercase block mt-1">
                  Speed Highway Race
                </span>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                  कञ्चनपुरदेखि सगरमाथासम्मको राजमार्गमा कछुवा, खरायो र चितुवासँग दौडिनुहोस्। नाइट्रो बुस्ट प्रयोग गर्नुहोस्।
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  <span className="text-slate-400 font-bold block">सर्वोत्तम गति</span>
                  <span className="font-black text-slate-800">{leaderboard['race']?.wpm || 0} WPM</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveGame('race')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs shadow-md transition-transform hover:scale-105"
                >
                  खेल्नुहोस् →
                </button>
              </div>
            </div>
          </div>

          {/* High Score Leaderboard Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h4 className="text-base font-black text-slate-800">
                स्थानीय उच्च अङ्क लिडरबोर्ड (Persistent High Scores)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold block">हिमाली शब्द रक्षा</span>
                  <span className="text-xl font-black text-amber-600">{leaderboard['falling']?.score || 0} अङ्क</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{leaderboard['falling']?.wpm || 0} WPM</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold block">बेलुन फोड्ने खेल</span>
                  <span className="text-xl font-black text-sky-600">{leaderboard['balloon']?.score || 0} अङ्क</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{leaderboard['balloon']?.wpm || 0} WPM</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold block">नेपाल एक्सप्रेस दौड</span>
                  <span className="text-xl font-black text-emerald-600">{leaderboard['race']?.wpm || 0} WPM</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{leaderboard['race']?.score || 0} अङ्क</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active Game Display */
        <div>
          {activeGame === 'falling' && (
            <FallingWordsGame
              difficulty={difficulty}
              fontMode={fontMode}
              baseSpeedMultiplier={baseSpeed}
              onGameOver={(score, wpm) => handleGameOver('falling', score, wpm)}
            />
          )}

          {activeGame === 'balloon' && (
            <BalloonPopGame
              difficulty={difficulty}
              fontMode={fontMode}
              baseSpeedMultiplier={baseSpeed}
              onGameOver={(score, wpm) => handleGameOver('balloon', score, wpm)}
            />
          )}

          {activeGame === 'race' && (
            <NepalRaceGame
              difficulty={difficulty}
              fontMode={fontMode}
              baseSpeedMultiplier={baseSpeed}
              onGameOver={(score, wpm) => handleGameOver('race', score, wpm)}
            />
          )}
        </div>
      )}
    </div>
  );
};

