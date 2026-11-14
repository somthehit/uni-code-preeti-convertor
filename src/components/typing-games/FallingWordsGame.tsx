'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { soundEffects } from '@/lib/sound-effects';
import { unicodeToPreeti } from '@/lib/preeti-converter';
import { unicodeToRomanizedKeystrokes } from '@/lib/romanized-converter';
import { getAdaptiveGameWords, learnFromUserTypedText } from '@/lib/nepali-ai-engine';
import { RotateCcw, Volume2, VolumeX, Shield, Zap, Snowflake, Heart, Brain, Pause, Play, Target } from 'lucide-react';

interface FallingWordsGameProps {
  difficulty: 'easy' | 'medium' | 'hard';
  fontMode: 'preeti' | 'unicode' | 'romanized';
  baseSpeedMultiplier?: number;
  onGameOver: (score: number, wpm: number) => void;
}

interface FallingWord {
  id: string;
  wordUnicode: string;
  wordPreeti: string;
  wordRomanized: string;
  targetString: string;
  matchedChars: number;
  x: number;
  y: number;
  speed: number;
  powerUp?: 'freeze' | 'lightning' | 'life';
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface Laser {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
}

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  life: number;
  color: string;
}

interface SnowflakeParticle {
  x: number;
  y: number;
  speed: number;
  radius: number;
  sway: number;
}

const SAMPLE_WORDS = [
  'नेपाल', 'किताब', 'बुद्ध', 'सगरमाथा', 'कञ्चनपुर', 'पोखरा', 'हिमाल', 'काठमाडौँ',
  'शान्ति', 'मुस्कान', 'प्रकृति', 'मित्र', 'सत्य', 'विकास', 'धर्म', 'कर्म',
  'सुन्दर', 'विद्या', 'अक्षर', 'फूल', 'सूर्य', 'चन्द्र', 'नदी', 'आकाश',
  'माया', 'ज्ञान', 'संसार', 'गाउँ', 'माटो', 'हृदय', 'आशा', 'सपना'
];

export const FallingWordsGame: React.FC<FallingWordsGameProps> = ({
  difficulty,
  fontMode,
  baseSpeedMultiplier = 1.0,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [wave, setWave] = useState<number>(1);
  const [combo, setCombo] = useState<number>(1);
  const [lives, setLives] = useState<number>(5);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [freezeTime, setFreezeTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(soundEffects.isMuted());
  const [wordsDestroyed, setWordsDestroyed] = useState<number>(0);
  const [baseSpeed, setBaseSpeed] = useState<number>(baseSpeedMultiplier);

  // Difficulty multiplier
  const difficultyFactor = difficulty === 'easy' ? 0.65 : difficulty === 'medium' ? 1.0 : 1.45;

  // Gradual acceleration: each matched word increases speed by 3.5%
  const dynamicSpeedMultiplier = useMemo(() => {
    const wordBonus = 1 + (wordsDestroyed * 0.035);
    return Math.min(3.2, baseSpeed * difficultyFactor * wordBonus);
  }, [baseSpeed, difficultyFactor, wordsDestroyed]);

  const [wordBank] = useState<string[]>(() => {
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
    return getAdaptiveGameWords(difficulty, 60, weakKeys);
  });

  // Game state stored in ref for smooth 60fps loop
  const gameState = useRef<{
    words: FallingWord[];
    particles: Particle[];
    lasers: Laser[];
    floatingTexts: FloatingText[];
    snowflakes: SnowflakeParticle[];
    lastSpawn: number;
    activeWordId: string | null;
    totalKeystrokes: number;
    startTime: number;
    freezeUntil: number;
  }>({
    words: [],
    particles: [],
    lasers: [],
    floatingTexts: [],
    snowflakes: Array.from({ length: 30 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 500,
      speed: 0.5 + Math.random() * 1.0,
      radius: 1 + Math.random() * 2,
      sway: Math.random() * Math.PI * 2,
    })),
    lastSpawn: 0,
    activeWordId: null,
    totalKeystrokes: 0,
    startTime: Date.now(),
    freezeUntil: 0,
  });

  // Word spawning
  const spawnWord = useCallback((width: number) => {
    const pool = wordBank.length > 0 ? wordBank : SAMPLE_WORDS;
    const wordUnicode = pool[Math.floor(Math.random() * pool.length)];
    const wordPreeti = unicodeToPreeti(wordUnicode);
    const wordRomanized = unicodeToRomanizedKeystrokes(wordUnicode);

    let targetString = wordPreeti;
    if (fontMode === 'romanized') {
      targetString = wordRomanized;
    } else if (fontMode === 'unicode') {
      targetString = wordUnicode;
    }

    // 12% chance of power-up
    let powerUp: 'freeze' | 'lightning' | 'life' | undefined;
    const r = Math.random();
    if (r < 0.05) powerUp = 'freeze';
    else if (r < 0.09) powerUp = 'lightning';
    else if (r < 0.12) powerUp = 'life';

    const newWord: FallingWord = {
      id: Math.random().toString(36).substring(2, 9),
      wordUnicode,
      wordPreeti,
      wordRomanized,
      targetString,
      matchedChars: 0,
      x: Math.max(70, Math.min(width - 130, Math.random() * (width - 160) + 60)),
      y: -25,
      speed: (0.7 + Math.random() * 0.45) * dynamicSpeedMultiplier,
      powerUp,
    };

    gameState.current.words.push(newWord);
  }, [fontMode, dynamicSpeedMultiplier, wordBank]);

  // Main 60fps canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const now = Date.now();
      const width = canvas.width;
      const height = canvas.height;

      // 1. Clear & Draw scenic Himalayan background
      ctx.clearRect(0, 0, width, height);

      // Night / dawn sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#050d1a'); // deep mountain night
      skyGrad.addColorStop(0.65, '#132847'); // twilight indigo
      skyGrad.addColorStop(1, '#24143d'); // dawn purple
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Stars
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 45; i++) {
        const sx = (i * 139) % width;
        const sy = (i * 83) % (height * 0.52);
        const opacity = 0.4 + 0.6 * Math.sin(now / 500 + i);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      // Distant Himalayan Peaks silhouette (Machhapuchhre / Everest with snow caps)
      ctx.fillStyle = '#0f1d30';
      ctx.beginPath();
      ctx.moveTo(0, height - 120);
      ctx.lineTo(width * 0.18, height - 210);
      ctx.lineTo(width * 0.32, height - 150);
      ctx.lineTo(width * 0.5, height - 260); // Holy Peak
      ctx.lineTo(width * 0.68, height - 170);
      ctx.lineTo(width * 0.84, height - 230);
      ctx.lineTo(width, height - 130);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // White snow caps on peaks
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.moveTo(width * 0.46, height - 225);
      ctx.lineTo(width * 0.5, height - 260);
      ctx.lineTo(width * 0.54, height - 225);
      ctx.closePath();
      ctx.fill();

      // Falling Snowflakes
      if (!isPaused) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        for (const s of gameState.current.snowflakes) {
          s.y += s.speed;
          s.sway += 0.02;
          s.x += Math.sin(s.sway) * 0.5;
          if (s.y > height) {
            s.y = -10;
            s.x = Math.random() * width;
          }
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Prayer Flags (Lungta) fluttering across the upper mountains
      const flagColors = ['#2563eb', '#ffffff', '#dc2626', '#16a34a', '#eab308']; // Blue, White, Red, Green, Yellow
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, 110);
      ctx.quadraticCurveTo(width / 2, 140, width, 110);
      ctx.stroke();

      for (let i = 0; i < 24; i++) {
        const t = (i + 0.5) / 24;
        const fx = t * width;
        const fy = 110 + 30 * (4 * t * (1 - t));
        const color = flagColors[i % flagColors.length];
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(fx - 10, fy);
        ctx.lineTo(fx + 10, fy);
        ctx.lineTo(fx, fy + 16 + Math.sin(now / 300 + i) * 3);
        ctx.closePath();
        ctx.fill();
      }

      // Foreground Swayambhu Stupa Roofline & Turret at bottom
      ctx.fillStyle = '#0a101d';
      ctx.fillRect(0, height - 60, width, 60);

      // Golden Stupa Dome
      const centerX = width / 2;
      ctx.beginPath();
      ctx.arc(centerX, height - 55, 52, Math.PI, 0, false);
      const domeGrad = ctx.createLinearGradient(centerX - 50, height - 100, centerX + 50, height - 50);
      domeGrad.addColorStop(0, '#f59e0b');
      domeGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = domeGrad;
      ctx.fill();

      // Buddha Eyes on Stupa
      ctx.fillStyle = '#0f172a';
      // Left eye
      ctx.beginPath();
      ctx.arc(centerX - 18, height - 72, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(centerX - 18, height - 72, 3, 0, Math.PI * 2);
      ctx.fill();

      // Right eye
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(centerX + 18, height - 72, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(centerX + 18, height - 72, 3, 0, Math.PI * 2);
      ctx.fill();

      // Red Urna / Tilak
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(centerX, height - 82, 3, 0, Math.PI * 2);
      ctx.fill();

      // Golden Spire / Turret
      ctx.fillStyle = '#d97706';
      ctx.fillRect(centerX - 6, height - 135, 12, 35);
      ctx.beginPath();
      ctx.moveTo(centerX - 18, height - 135);
      ctx.lineTo(centerX + 18, height - 135);
      ctx.lineTo(centerX, height - 165);
      ctx.closePath();
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      // Spawn new words
      const isFrozen = now < gameState.current.freezeUntil;
      const spawnInterval = Math.max(750, (3600 - wordsDestroyed * 55) / (dynamicSpeedMultiplier / difficultyFactor));
      if (!isPaused && now - gameState.current.lastSpawn > spawnInterval && !isGameOver) {
        spawnWord(width);
        gameState.current.lastSpawn = now;
      }

      // Update & Draw Lasers
      ctx.lineWidth = 3;
      gameState.current.lasers = gameState.current.lasers.filter((laser) => {
        if (!isPaused) laser.progress += 0.25;
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(laser.startX, laser.startY);
        const curX = laser.startX + (laser.targetX - laser.startX) * Math.min(1, laser.progress);
        const curY = laser.startY + (laser.targetY - laser.startY) * Math.min(1, laser.progress);
        ctx.lineTo(curX, curY);
        ctx.stroke();
        ctx.shadowBlur = 0;
        return laser.progress < 1;
      });

      // Update & Draw Particles
      gameState.current.particles = gameState.current.particles.filter((p) => {
        if (!isPaused) {
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.035;
        }
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, p.life * 4), 0, Math.PI * 2);
        ctx.fill();
        return p.life > 0;
      });

      // Update & Draw Floating Score Texts
      gameState.current.floatingTexts = gameState.current.floatingTexts.filter((f) => {
        if (!isPaused) {
          f.y += f.vy;
          f.life -= 0.025;
        }
        ctx.save();
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 8;
        ctx.textAlign = 'center';
        ctx.fillText(f.text, f.x, f.y);
        ctx.restore();
        return f.life > 0;
      });

      // Update & Draw Falling Words
      const currentWords = gameState.current.words;
      const survivingWords: FallingWord[] = [];

      for (const word of currentWords) {
        if (!isPaused && !isFrozen) {
          word.y += word.speed;
        }

        // Check if hit the roofline
        if (word.y >= height - 68) {
          soundEffects.playErrorBuzz();
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setIsGameOver(true);
              const durationMin = Math.max(0.1, (Date.now() - gameState.current.startTime) / 60000);
              const wpm = Math.round(gameState.current.totalKeystrokes / 5 / durationMin);
              onGameOver(score, wpm);
            }
            return Math.max(0, nextL);
          });
          setCombo(1);
          if (gameState.current.activeWordId === word.id) {
            gameState.current.activeWordId = null;
          }
          continue;
        }

        survivingWords.push(word);

        // Draw Lantern / Meteor Card
        const isLocked = gameState.current.activeWordId === word.id;
        ctx.save();
        ctx.translate(word.x, word.y);

        const boxWidth = Math.max(105, word.wordUnicode.length * 20 + 36);
        const boxHeight = 48;

        // Card Glow when locked
        if (isLocked) {
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 14;
        }

        // Lantern background box
        ctx.fillStyle = isLocked ? 'rgba(30, 41, 59, 0.95)' : 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = isLocked ? '#fbbf24' : word.powerUp ? '#38bdf8' : 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = isLocked ? 2.5 : 1.5;

        ctx.beginPath();
        ctx.roundRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 12);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw Power-up badge
        if (word.powerUp) {
          ctx.font = 'bold 10px sans-serif';
          ctx.fillStyle = '#38bdf8';
          const pLabel = word.powerUp === 'freeze' ? '❄️ हिउँ' : word.powerUp === 'lightning' ? '💥 चट्याङ' : '❤️ जीवन';
          ctx.fillText(pLabel, -boxWidth / 2 + 8, -boxHeight / 2 - 4);
        }

        // Draw Target Reticle on locked word
        if (isLocked) {
          ctx.font = '12px sans-serif';
          ctx.fillStyle = '#fbbf24';
          ctx.fillText('🎯', -boxWidth / 2 - 14, 0);
        }

        // Word text rendering
        ctx.font = 'bold 17px Mukta, "Noto Sans Devanagari", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Colored matched progress
        if (isLocked && word.matchedChars > 0) {
          ctx.fillStyle = '#10b981'; // Green completed
          ctx.fillText(word.wordUnicode, 0, -6);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.fillText(word.wordUnicode, 0, -6);
        }

        // Keystroke guidance subtitle
        ctx.font = 'bold 11px monospace';
        const displayKey =
          fontMode === 'romanized' ? word.wordRomanized : fontMode === 'preeti' ? word.wordPreeti : word.wordUnicode;

        if (isLocked) {
          // Highlight next keystroke
          ctx.fillStyle = '#fbbf24';
          ctx.fillText(`कुञ्जी: ${displayKey}`, 0, 13);
        } else {
          ctx.fillStyle = '#94a3b8';
          ctx.fillText(displayKey, 0, 13);
        }

        ctx.restore();
      }

      gameState.current.words = survivingWords;

      if (!isGameOver) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [wave, isGameOver, isPaused, score, spawnWord, dynamicSpeedMultiplier, fontMode, onGameOver]);

  // Handle typing keystrokes
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
      const state = gameState.current;
      state.totalKeystrokes++;

      // If active locked word
      if (state.activeWordId) {
        const activeWord = state.words.find((w) => w.id === state.activeWordId);
        if (activeWord) {
          const expectedChar = activeWord.targetString[activeWord.matchedChars];
          const isMatch =
            fontMode === 'romanized'
              ? char.toLowerCase() === expectedChar?.toLowerCase()
              : char === expectedChar;

          if (isMatch) {
            activeWord.matchedChars++;
            soundEffects.playWordLaser();

            // Fire stupa turret laser
            if (canvasRef.current) {
              state.lasers.push({
                startX: canvasRef.current.width / 2,
                startY: canvasRef.current.height - 150,
                targetX: activeWord.x,
                targetY: activeWord.y,
                progress: 0,
              });
            }

            // Word completed!
            if (activeWord.matchedChars >= activeWord.targetString.length) {
              soundEffects.playComboChime(combo);
              const pointsEarned = 10 * combo;
              setScore((s) => s + pointsEarned);
              setCombo((c) => Math.min(10, c + 1));
              setWordsDestroyed((w) => w + 1);
              learnFromUserTypedText(activeWord.wordUnicode);

              // Floating score animation
              state.floatingTexts.push({
                id: Math.random().toString(),
                text: `+${pointsEarned} (कम्बो x${combo})`,
                x: activeWord.x,
                y: activeWord.y - 10,
                vy: -1.2,
                life: 1.0,
                color: '#fbbf24',
              });

              // Spawn explosion particles
              for (let i = 0; i < 22; i++) {
                state.particles.push({
                  x: activeWord.x,
                  y: activeWord.y,
                  vx: (Math.random() - 0.5) * 7,
                  vy: (Math.random() - 0.5) * 7,
                  life: 1.0,
                  color: ['#fbbf24', '#f59e0b', '#38bdf8', '#34d399', '#f43f5e'][Math.floor(Math.random() * 5)],
                });
              }

              // Power-up triggers
              if (activeWord.powerUp === 'freeze') {
                state.freezeUntil = Date.now() + 5000;
                setFreezeTime(5);
                state.floatingTexts.push({
                  id: Math.random().toString(),
                  text: '❄️ हिउँ शक्ति! (5 सेकेन्ड स्थिर)',
                  x: activeWord.x,
                  y: activeWord.y - 30,
                  vy: -1.0,
                  life: 1.2,
                  color: '#38bdf8',
                });
              } else if (activeWord.powerUp === 'lightning') {
                state.words = [];
                state.floatingTexts.push({
                  id: Math.random().toString(),
                  text: '💥 महा-चट्याङ! (सबै नष्ट)',
                  x: canvasRef.current?.width ? canvasRef.current.width / 2 : 400,
                  y: 200,
                  vy: -0.5,
                  life: 1.5,
                  color: '#fbbf24',
                });
              } else if (activeWord.powerUp === 'life') {
                setLives((l) => Math.min(5, l + 1));
                state.floatingTexts.push({
                  id: Math.random().toString(),
                  text: '❤️ +१ जीवन प्राप्त!',
                  x: activeWord.x,
                  y: activeWord.y - 30,
                  vy: -1.0,
                  life: 1.2,
                  color: '#f43f5e',
                });
              }

              // Remove word
              state.words = state.words.filter((w) => w.id !== activeWord.id);
              state.activeWordId = null;

              // Wave progression
              setWave((w) => Math.min(20, Math.floor(score / 100) + 1));
            }
            return;
          } else {
            soundEffects.playErrorBuzz();
            setCombo(1);
          }
        }
      }

      // Lock on to a new matching falling word
      const match = state.words.find((w) => {
        if (fontMode === 'romanized') {
          return w.targetString.toLowerCase().startsWith(char.toLowerCase());
        }
        return w.targetString.startsWith(char);
      });

      if (match) {
        state.activeWordId = match.id;
        match.matchedChars = 1;
        soundEffects.playWordLaser();

        if (canvasRef.current) {
          state.lasers.push({
            startX: canvasRef.current.width / 2,
            startY: canvasRef.current.height - 150,
            targetX: match.x,
            targetY: match.y,
            progress: 0,
          });
        }

        // If 1-character word, complete immediately
        if (match.matchedChars >= match.targetString.length) {
          soundEffects.playComboChime(combo);
          const pointsEarned = 10 * combo;
          setScore((s) => s + pointsEarned);
          setCombo((c) => Math.min(10, c + 1));
          setWordsDestroyed((w) => w + 1);
          state.words = state.words.filter((w) => w.id !== match.id);
          state.activeWordId = null;
        }
      } else {
        soundEffects.playErrorBuzz();
        setCombo(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver, isPaused, combo, score, fontMode]);

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Game HUD Bar */}
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl px-6 py-3 flex flex-wrap items-center justify-between text-white shadow-xl gap-3">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase">अङ्क (Score)</span>
            <span className="text-2xl font-black text-amber-400">{score}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase">तह (Wave)</span>
            <span className="text-lg font-black text-sky-400">{wave}/20</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase">कम्बो (Combo)</span>
            <span className="text-lg font-black text-emerald-400">{combo}x</span>
          </div>

          {/* Interactive Speed Control with Gradual Acceleration Indicator */}
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 rounded-xl">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span className="text-slate-400 text-[11px]">गति:</span>
              <span className="text-amber-300 font-mono">{dynamicSpeedMultiplier.toFixed(2)}x</span>
              {wordsDestroyed > 0 && (
                <span className="text-[10px] text-emerald-400 font-semibold">
                  (+{Math.round(wordsDestroyed * 3.5)}% वृद्धि)
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

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold">
            <Brain className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>
              {fontMode === 'romanized' ? '🔤 रोमनाइज्ड' : fontMode === 'preeti' ? '👁 प्रिती' : 'नेपाली'} ({difficulty})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Lives hearts */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-base ${i < lives ? 'text-rose-500' : 'text-slate-600'}`}>
                ❤️
              </span>
            ))}
          </div>

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
        <canvas ref={canvasRef} width={800} height={500} className="w-full h-[500px] block bg-slate-950" />

        {/* Pause Overlay */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white">
            <span className="text-4xl mb-2">⏸️</span>
            <h3 className="text-2xl font-black text-amber-400">खेल रोकिएको छ (Game Paused)</h3>
            <p className="text-slate-400 text-xs mt-1">जारी राख्न स्पेस (Space) वा तलको बटन थिच्नुहोस्</p>
            <button
              type="button"
              onClick={() => setIsPaused(false)}
              className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-sm flex items-center gap-2 shadow-md"
            >
              <Play className="w-4 h-4" />
              <span>खेल जारी राख्नुहोस्</span>
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white animate-fadeIn">
            <span className="text-5xl mb-2">🏔️</span>
            <h3 className="text-3xl font-black text-amber-400">खेल समाप्त (Game Over)</h3>
            <p className="text-slate-300 text-sm mt-1">
              तपाईंले <strong className="text-amber-300">{score}</strong> अङ्क र अधिकतम{' '}
              <strong className="text-emerald-300">{combo}x</strong> कम्बो प्राप्त गर्नुभयो!
            </p>

            <button
              type="button"
              onClick={() => {
                setScore(0);
                setWave(1);
                setCombo(1);
                setLives(5);
                setIsGameOver(false);
                setIsPaused(false);
                gameState.current.words = [];
                gameState.current.activeWordId = null;
                gameState.current.startTime = Date.now();
                gameState.current.totalKeystrokes = 0;
              }}
              className="mt-6 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl flex items-center gap-2 shadow-lg transition-transform hover:scale-105 cursor-pointer"
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
