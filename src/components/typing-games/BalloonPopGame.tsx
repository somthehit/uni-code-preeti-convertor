'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { soundEffects } from '@/lib/sound-effects';
import { learnFromUserTypedText } from '@/lib/nepali-ai-engine';
import confetti from 'canvas-confetti';
import { RotateCcw, Volume2, VolumeX, Sparkles, Brain, Pause, Play, Zap } from 'lucide-react';

interface BalloonPopGameProps {
  difficulty: 'easy' | 'medium' | 'hard';
  fontMode: 'preeti' | 'unicode' | 'romanized';
  baseSpeedMultiplier?: number;
  onGameOver: (score: number, wpm: number) => void;
}

interface Balloon {
  id: string;
  charUnicode: string;
  keyRequired: string;
  displayKey: string;
  x: number;
  y: number;
  swayOffset: number;
  speed: number;
  color: string;
  radius: number;
}

interface FloatingScore {
  id: string;
  text: string;
  x: number;
  y: number;
  life: number;
  color: string;
}

const BALLOON_LETTERS: { uni: string; preeti: string; roman: string }[] = [
  // Home row & high-frequency consonants
  { uni: 'क', preeti: 's', roman: 'k' },
  { uni: 'म', preeti: 'd', roman: 'm' },
  { uni: 'न', preeti: 'g', roman: 'n' },
  { uni: 'ज', preeti: 'h', roman: 'j' },
  { uni: 'व', preeti: 'j', roman: 'w' },
  { uni: 'प', preeti: 'k', roman: 'p' },
  { uni: 'स', preeti: ';', roman: 's' },
  { uni: 'ख', preeti: 'v', roman: 'kh' },
  { uni: 'ग', preeti: 'u', roman: 'g' },
  { uni: 'घ', preeti: '3', roman: 'gh' },
  { uni: 'च', preeti: 'r', roman: 'ch' },
  { uni: 'छ', preeti: 'R', roman: 'chh' },
  { uni: 'झ', preeti: 'H', roman: 'jh' },
  { uni: 'त', preeti: 't', roman: 't' },
  { uni: 'थ', preeti: 'Y', roman: 'th' },
  { uni: 'द', preeti: 'b', roman: 'd' },
  { uni: 'ध', preeti: 'W', roman: 'dh' },
  { uni: 'ब', preeti: 'a', roman: 'b' },
  { uni: 'भ', preeti: 'E', roman: 'bh' },
  { uni: 'य', preeti: 'o', roman: 'y' },
  { uni: 'र', preeti: '/', roman: 'r' },
  { uni: 'ल', preeti: 'n', roman: 'l' },
  { uni: 'ह', preeti: 'x', roman: 'h' },
  { uni: 'श', preeti: 'z', roman: 'sh' },
  { uni: 'ष', preeti: 'Z', roman: 'sh' },
  { uni: 'ट', preeti: '5', roman: 'T' },
  { uni: 'ठ', preeti: '6', roman: 'Th' },
  { uni: 'ड', preeti: '7', roman: 'D' },
  { uni: 'ढ', preeti: '8', roman: 'Dh' },
  { uni: 'ण', preeti: '0', roman: 'N' },
  // Vowels
  { uni: 'अ', preeti: 'c', roman: 'a' },
  { uni: 'आ', preeti: 'cf', roman: 'aa' },
  { uni: 'इ', preeti: 'O', roman: 'i' },
  { uni: 'उ', preeti: 'p', roman: 'u' },
  { uni: 'ए', preeti: 'P', roman: 'e' },
  // Conjuncts
  { uni: 'क्ष', preeti: 'If', roman: 'x' },
  { uni: 'त्र', preeti: 'q', roman: 'tr' },
  { uni: 'ज्ञ', preeti: '1', roman: 'gy' },
  { uni: 'श्र', preeti: '>', roman: 'shr' },
  // Numerals
  { uni: '१', preeti: '!', roman: '1' },
  { uni: '२', preeti: '@', roman: '2' },
  { uni: '३', preeti: '#', roman: '3' },
  { uni: '४', preeti: '$', roman: '4' },
  { uni: '५', preeti: '%', roman: '5' },
  { uni: '९', preeti: '(', roman: '9' },
];

const BALLOON_COLORS = [
  '#f43f5e', // rose
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#3b82f6', // blue
];

export const BalloonPopGame: React.FC<BalloonPopGameProps> = ({
  difficulty,
  fontMode,
  baseSpeedMultiplier = 1.0,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [pops, setPops] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [escapedCount, setEscapedCount] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isBossRound, setIsBossRound] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.isMuted());
  const [baseSpeed, setBaseSpeed] = useState<number>(baseSpeedMultiplier);

  const speedMult = difficulty === 'easy' ? 0.65 : difficulty === 'medium' ? 1.0 : 1.45;

  // Dynamic progressive acceleration: each popped balloon increases speed by 3%
  const dynamicSpeedMultiplier = useMemo(() => {
    return Math.min(3.2, baseSpeed * speedMult * (1 + pops * 0.03));
  }, [baseSpeed, speedMult, pops]);

  const gameState = useRef<{
    balloons: Balloon[];
    floatingScores: FloatingScore[];
    lastSpawn: number;
    startTime: number;
    totalKeystrokes: number;
  }>({
    balloons: [],
    floatingScores: [],
    lastSpawn: 0,
    startTime: Date.now(),
    totalKeystrokes: 0,
  });

  // Spawn balloon with weak-key weighting
  const spawnBalloon = useCallback((width: number, height: number, forceBoss: boolean = false) => {
    let pool = [...BALLOON_LETTERS];
    try {
      const savedAcc = localStorage.getItem('uni_preeti_key_acc');
      if (savedAcc) {
        const parsed = JSON.parse(savedAcc);
        const weak = Object.entries(parsed)
          // @ts-expect-error weak key check
          .filter(([_, d]) => d.total >= 3 && d.correct / d.total < 0.75)
          .map(([k]) => k);
        if (weak.length > 0) {
          const matching = pool.filter((item) => weak.includes(item.preeti) || weak.includes(item.uni));
          if (matching.length > 0 && Math.random() < 0.55) {
            pool = matching;
          }
        }
      }
    } catch {}

    const item = pool[Math.floor(Math.random() * pool.length)];
    let keyRequired = item.preeti;
    let displayKey = item.preeti;

    if (fontMode === 'romanized') {
      keyRequired = item.roman;
      displayKey = item.roman;
    } else if (fontMode === 'unicode') {
      keyRequired = item.uni;
      displayKey = item.uni;
    }

    const balloon: Balloon = {
      id: Math.random().toString(36).substring(2, 9),
      charUnicode: item.uni,
      keyRequired,
      displayKey,
      x: Math.max(55, Math.min(width - 55, Math.random() * (width - 110) + 55)),
      y: height + 35,
      swayOffset: Math.random() * Math.PI * 2,
      speed: (1.0 + Math.random() * 0.7) * speedMult * (forceBoss ? 1.35 : 1),
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
      radius: 35,
    };

    gameState.current.balloons.push(balloon);
  }, [fontMode, speedMult]);

  // Main Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const now = Date.now();
      const elapsed = Math.floor((now - gameState.current.startTime) / 1000);

      // Check Boss round every 55s
      const boss = elapsed > 0 && elapsed % 55 < 12;
      setIsBossRound(boss);

      // Clear & Draw Scenic Phewa Lake / Pokhara Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#0284c7'); // sky azure
      skyGrad.addColorStop(0.5, '#7dd3fc');
      skyGrad.addColorStop(0.85, '#e0f2fe');
      skyGrad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant White Machhapuchhre (Fishtail) Mountain
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.moveTo(width * 0.42, height - 160);
      ctx.lineTo(width * 0.5, height - 320); // Fishtail double peak
      ctx.lineTo(width * 0.53, height - 280);
      ctx.lineTo(width * 0.56, height - 315);
      ctx.lineTo(width * 0.64, height - 160);
      ctx.closePath();
      ctx.fill();

      // Soft mountain shadows
      ctx.fillStyle = 'rgba(186, 230, 253, 0.5)';
      ctx.beginPath();
      ctx.moveTo(width * 0.5, height - 320);
      ctx.lineTo(width * 0.53, height - 280);
      ctx.lineTo(width * 0.56, height - 315);
      ctx.lineTo(width * 0.53, height - 160);
      ctx.closePath();
      ctx.fill();

      // Rolling green hills of Sarangkot & Peace Pagoda
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(0, height - 70);
      ctx.quadraticCurveTo(width * 0.25, height - 160, width * 0.5, height - 90);
      ctx.quadraticCurveTo(width * 0.75, height - 150, width, height - 60);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Peace Pagoda Dome on hill
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(width * 0.25, height - 120, 14, Math.PI, 0, false);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(width * 0.25 - 2, height - 132, 4, 12);

      // Phewa Lake Water at bottom
      const waterGrad = ctx.createLinearGradient(0, height - 60, 0, height);
      waterGrad.addColorStop(0, '#0369a1');
      waterGrad.addColorStop(1, '#075985');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, height - 60, width, 60);

      // Animated Water Waves
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1.5;
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        const wy = height - 45 + j * 14;
        for (let x = 0; x < width; x += 10) {
          const dy = Math.sin(now / 400 + x / 30 + j) * 2;
          if (x === 0) ctx.moveTo(x, wy + dy);
          else ctx.lineTo(x, wy + dy);
        }
        ctx.stroke();
      }

      // 2 Wooden Boats (Doonga) on Phewa lake
      const drawBoat = (bx: number, by: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(bx - 18, by);
        ctx.lineTo(bx + 18, by);
        ctx.lineTo(bx + 12, by + 8);
        ctx.lineTo(bx - 12, by + 8);
        ctx.closePath();
        ctx.fill();
        // Oar
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx - 4, by - 6);
        ctx.lineTo(bx + 10, by + 10);
        ctx.stroke();
      };
      drawBoat(width * 0.2 + Math.sin(now / 800) * 8, height - 32, '#dc2626');
      drawBoat(width * 0.75 + Math.cos(now / 900) * 8, height - 25, '#2563eb');

      // Spawn Balloons
      const dynamicFactor = dynamicSpeedMultiplier / speedMult;
      const spawnInterval = boss ? 450 : Math.max(700, Math.round((1800 - pops * 20) / Math.max(0.6, dynamicFactor)));
      if (!isPaused && now - gameState.current.lastSpawn > spawnInterval && !isGameOver) {
        spawnBalloon(width, height, boss);
        gameState.current.lastSpawn = now;
      }

      // Update & Render Balloons
      const surviving: Balloon[] = [];
      for (const b of gameState.current.balloons) {
        if (!isPaused) {
          b.y -= b.speed * (dynamicSpeedMultiplier / speedMult);
          b.swayOffset += 0.03;
          b.x += Math.sin(b.swayOffset) * 0.6;
        }

        // If escaped top of screen
        if (b.y < -45) {
          soundEffects.playErrorBuzz();
          setCombo(1);
          setEscapedCount((c) => {
            const next = c + 1;
            if (next >= 10) {
              setIsGameOver(true);
              const durationMin = Math.max(0.1, (Date.now() - gameState.current.startTime) / 60000);
              const wpm = Math.round(gameState.current.totalKeystrokes / 5 / durationMin);
              onGameOver(score, wpm);
            }
            return next;
          });
          continue;
        }

        surviving.push(b);

        // Draw Hot Air Balloon
        ctx.save();
        ctx.translate(b.x, b.y);

        // Balloon Body Gradient
        const bGrad = ctx.createRadialGradient(-8, -12, 4, 0, 0, b.radius);
        bGrad.addColorStop(0, '#ffffff');
        bGrad.addColorStop(0.3, b.color);
        bGrad.addColorStop(1, '#0f172a');

        ctx.fillStyle = bGrad;
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.ellipse(0, 0, b.radius, b.radius * 1.25, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Specular highlight gleam
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-b.radius * 0.35, -b.radius * 0.45, b.radius * 0.22, b.radius * 0.38, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Basket strings
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-10, b.radius * 1.15);
        ctx.lineTo(-6, b.radius * 1.55);
        ctx.moveTo(10, b.radius * 1.15);
        ctx.lineTo(6, b.radius * 1.55);
        ctx.stroke();

        // Wicker Basket
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.roundRect(-8, b.radius * 1.5, 16, 11, 3);
        ctx.fill();

        // Devanagari character
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Mukta, "Noto Sans Devanagari", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.fillText(b.charUnicode, 0, -6);
        ctx.shadowBlur = 0;

        // Key hint pill underneath
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(-18, 11, 36, 17, 5);
        ctx.fill();

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#fef08a';
        ctx.fillText(b.displayKey, 0, 20);

        ctx.restore();
      }

      // Update & Draw Floating Scores
      gameState.current.floatingScores = gameState.current.floatingScores.filter((f) => {
        if (!isPaused) {
          f.y -= 1.3;
          f.life -= 0.03;
        }
        ctx.save();
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 8;
        ctx.textAlign = 'center';
        ctx.fillText(f.text, f.x, f.y);
        ctx.restore();
        return f.life > 0;
      });

      gameState.current.balloons = surviving;

      if (!isGameOver) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isGameOver, isPaused, pops, score, spawnBalloon, onGameOver]);

  // Handle typing input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        setIsPaused((p) => !p);
        return;
      }
      if (e.key === 'Escape') {
        setIsPaused((p) => !p);
        return;
      }
      if (isPaused) return;

      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;

      const char = e.key;
      gameState.current.totalKeystrokes++;

      // Find lowest (most urgent) balloon matching keyRequired
      const balloons = gameState.current.balloons;
      let matchedIdx = -1;
      let lowestY = -999;

      for (let i = 0; i < balloons.length; i++) {
        const matches =
          fontMode === 'romanized'
            ? balloons[i].keyRequired.toLowerCase().startsWith(char.toLowerCase())
            : balloons[i].keyRequired.startsWith(char);

        if (matches && balloons[i].y > lowestY) {
          matchedIdx = i;
          lowestY = balloons[i].y;
        }
      }

      if (matchedIdx >= 0) {
        const popped = balloons[matchedIdx];
        soundEffects.playBalloonPop();
        soundEffects.playComboChime(combo);

        // Confetti burst on screen
        if (typeof window !== 'undefined') {
          confetti({
            particleCount: 20,
            spread: 55,
            origin: {
              x: popped.x / window.innerWidth,
              y: Math.max(0.1, popped.y / window.innerHeight),
            },
          });
        }

        const points = 15 * combo;
        setScore((s) => s + points);
        setPops((p) => p + 1);
        setCombo((c) => Math.min(10, c + 1));
        learnFromUserTypedText(popped.charUnicode);

        // Floating score popup
        gameState.current.floatingScores.push({
          id: Math.random().toString(),
          text: `+${points}${combo > 1 ? ` (${combo}x)` : ''}`,
          x: popped.x,
          y: popped.y,
          life: 1.0,
          color: '#fbbf24',
        });

        gameState.current.balloons.splice(matchedIdx, 1);
      } else {
        soundEffects.playErrorBuzz();
        setCombo(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver, isPaused, combo, fontMode]);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Game HUD Bar */}
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3 flex items-center justify-between text-white shadow-xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase">अङ्क (Score)</span>
            <span className="text-2xl font-black text-amber-400">{score}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase">फुटेका बेलुन</span>
            <span className="text-lg font-black text-emerald-400">{pops}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase">कम्बो (Combo)</span>
            <span className="text-lg font-black text-amber-300">{combo}x</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase">भागेका (Escaped)</span>
            <span className="text-lg font-black text-rose-400">{escapedCount}/10</span>
          </div>

          {/* Interactive Speed Control with Gradual Acceleration Indicator */}
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-xl">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-slate-400 text-[11px]">गति:</span>
              <span className="text-amber-300 font-mono">{dynamicSpeedMultiplier.toFixed(2)}x</span>
              {pops > 0 && (
                <span className="text-[10px] text-emerald-400 font-semibold">
                  (+{Math.round(pops * 3)}% वृद्धि)
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

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-sky-950/80 border border-sky-500/40 rounded-xl text-sky-300 text-xs font-bold">
            <Brain className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>
              {fontMode === 'romanized' ? '🔤 रोमनाइज्ड' : fontMode === 'preeti' ? '👁 प्रिती' : 'नेपाली'} ({difficulty})
            </span>
          </div>

          {isBossRound && (
            <div className="flex items-center gap-1.5 bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-black animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>BOSS ROUND!</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            title="पज / पुनः सुरु (Space / Escape)"
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setIsMuted(soundEffects.toggleMute())}
            title={isMuted ? 'ध्वनि अन गर्नुहोस्' : 'ध्वनि बन्द गर्नुहोस्'}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        <canvas ref={canvasRef} width={800} height={500} className="w-full h-[500px] block bg-sky-900" />

        {/* Pause Overlay */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
            <span className="text-4xl mb-2">⏸️</span>
            <h3 className="text-2xl font-black text-amber-400">खेल रोकिएको छ (Game Paused)</h3>
            <p className="text-slate-400 text-xs mt-1">जारी राख्न स्पेस (Space) वा तलको बटन थिच्नुहोस्</p>
            <button
              type="button"
              onClick={() => setIsPaused(false)}
              className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-sm flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>खेल जारी राख्नुहोस्</span>
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white animate-fadeIn">
            <span className="text-5xl mb-2">🎈</span>
            <h3 className="text-3xl font-black text-sky-400">खेल समाप्त (Game Over)</h3>
            <p className="text-slate-300 text-sm mt-1">
              तपाईंले <strong className="text-amber-300">{score}</strong> अङ्क र{' '}
              <strong className="text-emerald-300">{pops}</strong> बेलुन फुटाउनुभयो!
            </p>

            <button
              type="button"
              onClick={() => {
                setScore(0);
                setPops(0);
                setCombo(1);
                setEscapedCount(0);
                setIsGameOver(false);
                setIsPaused(false);
                gameState.current.balloons = [];
                gameState.current.startTime = Date.now();
                gameState.current.totalKeystrokes = 0;
              }}
              className="mt-6 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-xl flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>फेरि खेल्नुहोस्</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
