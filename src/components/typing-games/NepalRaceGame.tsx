'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { soundEffects } from '@/lib/sound-effects';
import { unicodeToPreeti } from '@/lib/preeti-converter';
import { unicodeToRomanizedKeystrokes } from '@/lib/romanized-converter';
import { getAdaptiveGameWords, learnFromUserTypedText } from '@/lib/nepali-ai-engine';
import { RotateCcw, Volume2, VolumeX, Flame, Flag, Trophy, Gauge, Shuffle, Brain, Sparkles, Award, Zap } from 'lucide-react';

interface NepalRaceGameProps {
  difficulty: 'easy' | 'medium' | 'hard';
  fontMode: 'preeti' | 'unicode' | 'romanized';
  baseSpeedMultiplier?: number;
  onGameOver: (score: number, wpm: number) => void;
}

const DEFAULT_RACE_TEXT =
  'हाम्रो सुन्दर देश नेपाल प्राकृतिक सौन्दर्य र विविध संस्कृतिले भरिपूर्ण छ। महेन्द्रनगरबाट सुरु भएको यात्रा कर्णाली पुल, लुम्बिनी र काठमाडौँ हुँदै विश्वको सर्वोच्च शिखर सगरमाथासम्म पुग्दछ।';

const LANDMARKS = [
  { name: 'कञ्चनपुर (प्रस्थान)', pct: 0 },
  { name: 'कर्णाली पुल', pct: 20 },
  { name: 'लुम्बिनी (शान्तिभूमि)', pct: 40 },
  { name: 'मुग्लिन त्रिशूली', pct: 60 },
  { name: 'काठमाडौँ उपत्यका', pct: 80 },
  { name: 'सगरमाथा आधारशिविर (Finish)', pct: 100 },
];

const VEHICLES = [
  { id: 'bike', name: 'पल्सर बाइक', emoji: '🏍️' },
  { id: 'car', name: 'कार', emoji: '🚗' },
  { id: 'tempo', name: 'सफारी टेम्पो', emoji: '🛺' },
  { id: 'bus', name: 'साझा बस', emoji: '🚌' },
];

export const NepalRaceGame: React.FC<NepalRaceGameProps> = ({
  difficulty,
  fontMode,
  baseSpeedMultiplier = 1.0,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [raceText, setRaceText] = useState<string>(DEFAULT_RACE_TEXT);
  const [userInput, setUserInput] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('bike');
  const [nitro, setNitro] = useState<number>(0);
  const [isNitroActive, setIsNitroActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [playerRank, setPlayerRank] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.isMuted());
  const [displayMode, setDisplayMode] = useState<'nepali' | 'keys'>('keys');
  const [baseSpeed, setBaseSpeed] = useState<number>(baseSpeedMultiplier);

  // Dynamic progressive acceleration: as words are typed correctly, speed increases gradually
  const wordsMatched = Math.floor(userInput.length / 5);
  const dynamicSpeedMultiplier = useMemo(() => {
    return Math.min(3.2, baseSpeed * (1 + wordsMatched * 0.035));
  }, [baseSpeed, wordsMatched]);

  // AI Opponents positions (0 to 100%)
  const [aiPositions, setAiPositions] = useState<{ turtle: number; rabbit: number; leopard: number }>({
    turtle: 0,
    rabbit: 0,
    leopard: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Generate new AI Track adapting to difficulty and weak keys
  const handleNewAiRoute = () => {
    let weakKeys: string[] = [];
    try {
      const savedAcc = localStorage.getItem('uni_preeti_key_acc');
      if (savedAcc) {
        const parsed = JSON.parse(savedAcc);
        weakKeys = Object.entries(parsed)
          // @ts-expect-error weak key check
          .filter(([_, d]) => d.total >= 3 && d.correct / d.total < 0.75)
          .map(([k]) => k);
      }
    } catch {}

    const count = difficulty === 'easy' ? 14 : difficulty === 'medium' ? 22 : 30;
    const words = getAdaptiveGameWords(difficulty, count, weakKeys);
    setRaceText(words.join(' ') + '।');
    setUserInput('');
    setStartTime(null);
    setNitro(0);
    setIsFinished(false);
    setAiPositions({ turtle: 0, rabbit: 0, leopard: 0 });
    inputRef.current?.focus();
  };

  const targetKeystrokes = useMemo(() => {
    if (fontMode === 'preeti') return unicodeToPreeti(raceText);
    if (fontMode === 'romanized') return unicodeToRomanizedKeystrokes(raceText);
    return raceText;
  }, [fontMode, raceText]);

  // AI speed targets in WPM based on difficulty
  const aiSpeeds = useMemo(() => {
    if (difficulty === 'easy') return { turtle: 16, rabbit: 28, leopard: 42 };
    if (difficulty === 'medium') return { turtle: 22, rabbit: 38, leopard: 54 };
    return { turtle: 30, rabbit: 48, leopard: 68 };
  }, [difficulty]);

  const totalChars = Math.max(1, targetKeystrokes.length);
  const playerProgress = Math.min(100, (userInput.length / totalChars) * 100);

  // Current passing landmark
  const currentLandmark = useMemo(() => {
    const passed = LANDMARKS.filter((l) => playerProgress >= l.pct);
    return passed[passed.length - 1] || LANDMARKS[0];
  }, [playerProgress]);

  // Focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // AI Progress Loop
  useEffect(() => {
    if (!startTime || isFinished) return;

    const interval = setInterval(() => {
      const elapsedMin = (Date.now() - startTime) / 60000;

      const turtleChars = elapsedMin * (aiSpeeds.turtle * dynamicSpeedMultiplier) * 5;
      const rabbitChars = elapsedMin * (aiSpeeds.rabbit * dynamicSpeedMultiplier) * 5;
      const leopardChars = elapsedMin * (aiSpeeds.leopard * dynamicSpeedMultiplier) * 5;

      const tProg = Math.min(100, (turtleChars / totalChars) * 100);
      const rProg = Math.min(100, (rabbitChars / totalChars) * 100);
      const lProg = Math.min(100, (leopardChars / totalChars) * 100);

      setAiPositions({
        turtle: tProg,
        rabbit: rProg,
        leopard: lProg,
      });

      // Calculate ranking
      const scores = [
        { name: 'Player', p: playerProgress },
        { name: 'Leopard', p: lProg },
        { name: 'Rabbit', p: rProg },
        { name: 'Turtle', p: tProg },
      ].sort((a, b) => b.p - a.p);

      const rank = scores.findIndex((s) => s.name === 'Player') + 1;
      setPlayerRank(rank);

      if (playerProgress >= 100) {
        setIsFinished(true);
        soundEffects.playLevelUp();
        learnFromUserTypedText(raceText);
        const durationMin = Math.max(0.1, (Date.now() - startTime) / 60000);
        const wpm = Math.round(userInput.length / 5 / durationMin);
        onGameOver(Math.round(wpm * 15), wpm);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, isFinished, playerProgress, totalChars, userInput.length, onGameOver, aiSpeeds, raceText, dynamicSpeedMultiplier]);

  // Canvas Parallax Background & Racers rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear & Draw Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#38bdf8');
      skyGrad.addColorStop(0.6, '#bae6fd');
      skyGrad.addColorStop(1, '#fed7aa');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Parallax Distant Snowy Himalayan Peaks
      const offset = (playerProgress * 6) % width;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.moveTo(-offset, height - 170);
      ctx.lineTo(width * 0.25 - offset, height - 280);
      ctx.lineTo(width * 0.5 - offset, height - 200);
      ctx.lineTo(width * 0.75 - offset, height - 310); // Mt. Everest
      ctx.lineTo(width - offset, height - 190);
      ctx.lineTo(width * 1.3 - offset, height - 290);
      ctx.lineTo(width * 1.6 - offset, height - 170);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Middle Green Hills & Pine Trees
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.moveTo(0, height - 150);
      ctx.quadraticCurveTo(width * 0.3, height - 200, width * 0.6, height - 160);
      ctx.quadraticCurveTo(width * 0.85, height - 210, width, height - 150);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Traditional Red-Roofed Nepali House on the Hillside
      const houseX = (width * 0.7 - (playerProgress * 4)) % width;
      const drawHouse = (hx: number, hy: number) => {
        ctx.fillStyle = '#fef3c7'; // White/clay wall
        ctx.fillRect(hx, hy, 26, 18);
        ctx.fillStyle = '#dc2626'; // Red pitched roof
        ctx.beginPath();
        ctx.moveTo(hx - 4, hy);
        ctx.lineTo(hx + 13, hy - 10);
        ctx.lineTo(hx + 30, hy);
        ctx.closePath();
        ctx.fill();
      };
      drawHouse(houseX > 0 ? houseX : houseX + width, height - 170);

      // Asphalt Highway Road with 4 Lanes
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, height - 150, width, 150);

      // Road lane stripes
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([20, 20]);
      [height - 112, height - 75, height - 38].forEach((y) => {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Finish Line Banner at 100%
      if (playerProgress >= 95 || aiPositions.leopard >= 95) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(width - 50, height - 150, 15, 150);
        ctx.fillStyle = '#0f172a';
        for (let fy = height - 150; fy < height; fy += 15) {
          ctx.fillRect(width - 50, fy, 7.5, 7.5);
          ctx.fillRect(width - 42.5, fy + 7.5, 7.5, 7.5);
        }
      }

      // Draw 4 Racers
      const currentEmoji = VEHICLES.find((v) => v.id === selectedVehicle)?.emoji || '🏍️';

      const drawVehicle = (progress: number, laneY: number, emoji: string, name: string, isPlayer: boolean) => {
        const x = 50 + (progress / 100) * (width - 120);

        ctx.font = '26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(emoji, x, laneY);

        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = isPlayer ? '#38bdf8' : '#ffffff';
        ctx.fillText(name, x, laneY - 18);

        // Nitro exhaust flames
        if (isPlayer && isNitroActive) {
          ctx.font = '18px sans-serif';
          ctx.fillText('🔥', x - 22, laneY);
        }
      };

      drawVehicle(playerProgress, height - 125, currentEmoji, 'तपाईं (Player)', true);
      drawVehicle(aiPositions.leopard, height - 88, '🐆', `चितुवा (${aiSpeeds.leopard} WPM)`, false);
      drawVehicle(aiPositions.rabbit, height - 52, '🐇', `खरायो (${aiSpeeds.rabbit} WPM)`, false);
      drawVehicle(aiPositions.turtle, height - 16, '🐢', `कछुवा (${aiSpeeds.turtle} WPM)`, false);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [playerProgress, aiPositions, isNitroActive, selectedVehicle, aiSpeeds]);

  // Handle typing input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    const val = e.target.value;

    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    if (val.length > userInput.length) {
      const typed = val[val.length - 1];
      const expected = targetKeystrokes[userInput.length];

      const isMatch =
        fontMode === 'romanized' ? typed.toLowerCase() === expected.toLowerCase() : typed === expected;

      if (isMatch) {
        soundEffects.playKeyClick();
        setNitro((n) => {
          const next = Math.min(100, n + 3.0);
          if (next >= 100 && !isNitroActive) {
            setIsNitroActive(true);
            soundEffects.playNitroBoost();
            setTimeout(() => {
              setIsNitroActive(false);
              setNitro(0);
            }, 3000);
          }
          return next;
        });
      } else {
        soundEffects.playErrorBuzz();
        setNitro((n) => Math.max(0, n - 8));
        return; // Don't allow incorrect characters to advance
      }
    }

    setUserInput(val);
  };

  // Speedometer WPM
  const minutes = Math.max(0.05, (Date.now() - (startTime || Date.now())) / 60000);
  const currentWpm = Math.round(userInput.length / 5 / minutes);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* HUD Header Bar */}
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3 flex items-center justify-between text-white shadow-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-slate-400 font-bold uppercase">स्थान (Rank)</span>
            <span className="text-2xl font-black text-amber-400">
              {playerRank === 1 ? '१st 🥇' : playerRank === 2 ? '२nd 🥈' : playerRank === 3 ? '३rd 🥉' : '४th'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-sky-400" />
            <span className="text-xs text-slate-400 font-bold uppercase">गति (Speed)</span>
            <span className="text-xl font-black text-sky-400">{currentWpm} WPM</span>
          </div>

          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-emerald-400" />
            <span className="text-xs text-slate-400 font-bold uppercase">कोशेढुङ्गा (Landmark)</span>
            <span className="text-sm font-black text-emerald-300">{currentLandmark.name}</span>
          </div>

          {/* Interactive Speed Control with Gradual Acceleration Indicator */}
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-xl">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-slate-400 text-[11px]">गति:</span>
              <span className="text-amber-300 font-mono">{dynamicSpeedMultiplier.toFixed(2)}x</span>
              {wordsMatched > 0 && (
                <span className="text-[10px] text-emerald-400 font-semibold">
                  (+{Math.round(wordsMatched * 3.5)}% वृद्धि)
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 ml-1">
              <button
                type="button"
                onClick={() => setBaseSpeed((s) => Math.max(0.4, Number((s - 0.1).toFixed(1))))}
                title="गति घटाउनुहोस् (-0.1x)"
                className="w-4 h-4 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white text-[11px] font-bold cursor-pointer"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => setBaseSpeed((s) => Math.min(2.5, Number((s + 0.1).toFixed(1))))}
                title="गति बढाउनुहोस् (+0.1x)"
                className="w-4 h-4 bg-slate-700 hover:bg-slate-600 rounded flex items-center justify-center text-white text-[11px] font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Nitro Meter & Sound Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Flame className={`w-4 h-4 ${isNitroActive ? 'text-orange-500 animate-bounce' : 'text-slate-400'}`} />
            <div className="w-24 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-150 ${
                  isNitroActive ? 'bg-gradient-to-r from-amber-400 to-rose-500 animate-pulse' : 'bg-emerald-500'
                }`}
                style={{ width: `${nitro}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400">{Math.round(nitro)}%</span>
          </div>

          <button
            type="button"
            onClick={() => setIsMuted(soundEffects.toggleMute())}
            title={isMuted ? 'ध्वनि अन गर्नुहोस्' : 'ध्वनि बन्द गर्नुहोस्'}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Vehicle Selector & Route Options */}
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl px-5 py-2.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">सवारी छान्नुहोस्:</span>
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            {VEHICLES.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVehicle(v.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedVehicle === v.id ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{v.emoji}</span>
                <span>{v.name}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNewAiRoute}
          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Shuffle className="w-3.5 h-3.5 text-emerald-600" />
          <span>नयाँ राजमार्ग ट्रयाक (New Route)</span>
        </button>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        <canvas ref={canvasRef} width={800} height={360} className="w-full h-[360px] block bg-slate-950" />
      </div>

      {/* Live Keystroke Ribbon & Target Passage */}
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        {/* Original Devanagari Passage */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
          <span className="text-[11px] font-bold text-slate-500 block mb-1">नेपाली वाक्य (Target Passage):</span>
          <p className="text-base font-bold text-slate-800 leading-relaxed font-devanagari">{raceText}</p>
        </div>

        {/* Character-by-Character Ribbon */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden select-none">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase">
              टाइप गर्नुपर्ने कुञ्जीहरू ({fontMode === 'romanized' ? 'Romanized' : fontMode === 'preeti' ? 'Preeti' : 'Unicode'}):
            </span>
            <span className="text-xs text-amber-400 font-mono font-bold">
              प्रगति: {userInput.length} / {targetKeystrokes.length}
            </span>
          </div>

          <div className="font-mono text-base md:text-lg leading-relaxed tracking-wider break-all">
            {targetKeystrokes.split('').map((char, index) => {
              const isTyped = index < userInput.length;
              const isCurrent = index === userInput.length;

              let charClass = 'text-slate-500';
              if (isTyped) {
                charClass = 'text-emerald-400 font-bold';
              } else if (isCurrent) {
                charClass = 'text-amber-300 bg-amber-950/80 px-1 rounded font-black border-b-2 border-amber-400 animate-pulse';
              }

              return (
                <span key={index} className={`transition-colors ${charClass}`}>
                  {char === ' ' ? '␣' : char}
                </span>
              );
            })}
          </div>
        </div>

        {/* Typing Input */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleChange}
            disabled={isFinished}
            placeholder={isFinished ? 'दौड सम्पन्न भयो!' : 'यहाँ टाइप गर्न सुरु गर्नुहोस्...'}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Completion Modal / Victory Podium */}
      {isFinished && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl flex flex-col gap-4 border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-3xl">
              🏆
            </div>
            <h3 className="text-2xl font-black text-slate-800">
              {playerRank === 1 ? '🎉 विजय! तपाईं प्रथम हुनुभयो!' : `दौड सम्पन्न! तपाईं ${playerRank} स्थानमा आउनुभयो!`}
            </h3>
            <p className="text-slate-500 text-xs">सगरमाथा आधारशिविरसम्मको नेपाली राजमार्ग यात्रा सफलतापूर्वक सम्पन्न भयो।</p>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
              <div>
                <span className="text-xs text-slate-400 font-bold block">औसत गति (Speed)</span>
                <span className="text-xl font-black text-slate-800">{currentWpm} WPM</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold block">स्थान (Rank)</span>
                <span className="text-xl font-black text-amber-500">{playerRank}st</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNewAiRoute}
              className="mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>फेरि नयाँ दौड खेल्नुहोस्</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
