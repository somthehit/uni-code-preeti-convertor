'use client';

import React from 'react';
import { FINGER_COLORS, KEY_FINGER_ASSIGNMENTS, FingerType } from '@/lib/typing-master-data';
import { RealisticHand } from './RealisticHand';

interface ColorCodedKeyboardProps {
  activeKey?: string;
  isShiftActive?: boolean;
  showHeatmap?: boolean;
  keyAccuracyMap?: Record<string, { total: number; correct: number }>;
  onKeyClick?: (key: string) => void;
  activeFinger?: FingerType | null;
  needsShift?: boolean;
  shiftHand?: 'left' | 'right';
  layoutMode?: 'preeti' | 'romanized';
}

export const ROMANIZED_KEYBOARD_LAYOUT = [
  // Row 1 (Numbers)
  [
    { key: '`', shiftKey: '~', nep: '`', shiftNep: '~' },
    { key: '1', shiftKey: '!', nep: '१', shiftNep: '!' },
    { key: '2', shiftKey: '@', nep: '२', shiftNep: '@' },
    { key: '3', shiftKey: '#', nep: '३', shiftNep: '#' },
    { key: '4', shiftKey: '$', nep: '४', shiftNep: '$' },
    { key: '5', shiftKey: '%', nep: '५', shiftNep: '%' },
    { key: '6', shiftKey: '^', nep: '६', shiftNep: '^' },
    { key: '7', shiftKey: '&', nep: '७', shiftNep: '&' },
    { key: '8', shiftKey: '*', nep: '८', shiftNep: '*' },
    { key: '9', shiftKey: '(', nep: '९', shiftNep: '(' },
    { key: '0', shiftKey: ')', nep: '०', shiftNep: ')' },
    { key: '-', shiftKey: '_', nep: '-', shiftNep: '_' },
    { key: '=', shiftKey: '+', nep: '=', shiftNep: '+' },
  ],
  // Row 2 (Top)
  [
    { key: 'q', shiftKey: 'Q', nep: 'त्त', shiftNep: 'त्र' },
    { key: 'w', shiftKey: 'W', nep: 'व', shiftNep: 'ॐ' },
    { key: 'e', shiftKey: 'E', nep: 'े', shiftNep: 'ै' },
    { key: 'r', shiftKey: 'R', nep: 'र', shiftNep: 'ृ' },
    { key: 't', shiftKey: 'T', nep: 'त', shiftNep: 'ट' },
    { key: 'y', shiftKey: 'Y', nep: 'य', shiftNep: 'ञ' },
    { key: 'u', shiftKey: 'U', nep: 'ु', shiftNep: 'ू' },
    { key: 'i', shiftKey: 'I', nep: 'ि', shiftNep: 'ी' },
    { key: 'o', shiftKey: 'O', nep: 'ो', shiftNep: 'ौ' },
    { key: 'p', shiftKey: 'P', nep: 'प', shiftNep: 'फ' },
    { key: '[', shiftKey: '{', nep: '[', shiftNep: '{' },
    { key: ']', shiftKey: '}', nep: ']', shiftNep: '}' },
    { key: '\\', shiftKey: '|', nep: '्', shiftNep: '|' },
  ],
  // Row 3 (Home)
  [
    { key: 'a', shiftKey: 'A', nep: 'ा', shiftNep: 'आ' },
    { key: 's', shiftKey: 'S', nep: 'स', shiftNep: 'श' },
    { key: 'd', shiftKey: 'D', nep: 'द', shiftNep: 'ड' },
    { key: 'f', shiftKey: 'F', nep: 'ँ', shiftNep: 'ं' },
    { key: 'g', shiftKey: 'G', nep: 'ग', shiftNep: 'घ' },
    { key: 'h', shiftKey: 'H', nep: 'ह', shiftNep: 'ः' },
    { key: 'j', shiftKey: 'J', nep: 'ज', shiftNep: 'झ' },
    { key: 'k', shiftKey: 'K', nep: 'क', shiftNep: 'ख' },
    { key: 'l', shiftKey: 'L', nep: 'ल', shiftNep: 'ल्' },
    { key: ';', shiftKey: ':', nep: ';', shiftNep: ':' },
    { key: "'", shiftKey: '"', nep: "'", shiftNep: '"' },
  ],
  // Row 4 (Bottom)
  [
    { key: 'z', shiftKey: 'Z', nep: 'ष', shiftNep: 'ज्ञ' },
    { key: 'x', shiftKey: 'X', nep: 'क्ष', shiftNep: 'ह्र' },
    { key: 'c', shiftKey: 'C', nep: 'च', shiftNep: 'छ' },
    { key: 'v', shiftKey: 'V', nep: 'व', shiftNep: 'ॐ' },
    { key: 'b', shiftKey: 'B', nep: 'ब', shiftNep: 'भ' },
    { key: 'n', shiftKey: 'N', nep: 'न', shiftNep: 'ण' },
    { key: 'm', shiftKey: 'M', nep: 'म', shiftNep: 'ङ' },
    { key: ',', shiftKey: '<', nep: ',', shiftNep: '<' },
    { key: '.', shiftKey: '>', nep: '।', shiftNep: '>' },
    { key: '/', shiftKey: '?', nep: '/', shiftNep: '?' },
  ],
];

export const KEYBOARD_LAYOUT = [
  // Row 1 (Numbers)
  [
    { key: '`', shiftKey: '~', nep: 'ञ्', shiftNep: 'ञ्' },
    { key: '1', shiftKey: '!', nep: 'ज्ञ', shiftNep: '१' },
    { key: '2', shiftKey: '@', nep: 'द्ध', shiftNep: '२' },
    { key: '3', shiftKey: '#', nep: 'घ', shiftNep: '३' },
    { key: '4', shiftKey: '$', nep: 'झ', shiftNep: '४' },
    { key: '5', shiftKey: '%', nep: 'छ', shiftNep: '५' },
    { key: '6', shiftKey: '^', nep: 'ट', shiftNep: '६' },
    { key: '7', shiftKey: '&', nep: 'ठ', shiftNep: '७' },
    { key: '8', shiftKey: '*', nep: 'ड', shiftNep: '८' },
    { key: '9', shiftKey: '(', nep: 'ढ', shiftNep: '९' },
    { key: '0', shiftKey: ')', nep: 'ण', shiftNep: '०' },
    { key: '-', shiftKey: '_', nep: '-', shiftNep: ')' },
    { key: '=', shiftKey: '+', nep: '.', shiftNep: 'ं' },
  ],
  // Row 2 (Top)
  [
    { key: 'q', shiftKey: 'Q', nep: 'त्र', shiftNep: 'त्त' },
    { key: 'w', shiftKey: 'W', nep: 'ध', shiftNep: 'ध्' },
    { key: 'e', shiftKey: 'E', nep: 'भ', shiftNep: 'भ्' },
    { key: 'r', shiftKey: 'R', nep: 'च', shiftNep: 'च्' },
    { key: 't', shiftKey: 'T', nep: 'त', shiftNep: 'त्' },
    { key: 'y', shiftKey: 'Y', nep: 'थ', shiftNep: 'थ्' },
    { key: 'u', shiftKey: 'U', nep: 'ग', shiftNep: 'ग्' },
    { key: 'i', shiftKey: 'I', nep: 'ष', shiftNep: 'क्ष्' },
    { key: 'o', shiftKey: 'O', nep: 'य', shiftNep: 'इ' },
    { key: 'p', shiftKey: 'P', nep: 'उ', shiftNep: 'ए' },
    { key: '[', shiftKey: '{', nep: 'ृ', shiftNep: 'र्' },
    { key: ']', shiftKey: '}', nep: 'े', shiftNep: 'ै' },
    { key: '\\', shiftKey: '|', nep: '्', shiftNep: '्र' },
  ],
  // Row 3 (Home)
  [
    { key: 'a', shiftKey: 'A', nep: 'ब', shiftNep: 'ब्' },
    { key: 's', shiftKey: 'S', nep: 'क', shiftNep: 'क्' },
    { key: 'd', shiftKey: 'D', nep: 'म', shiftNep: 'म्' },
    { key: 'f', shiftKey: 'F', nep: 'ा', shiftNep: 'ँ' },
    { key: 'g', shiftKey: 'G', nep: 'न', shiftNep: 'न्' },
    { key: 'h', shiftKey: 'H', nep: 'ज', shiftNep: 'ज्' },
    { key: 'j', shiftKey: 'J', nep: 'व', shiftNep: 'व्' },
    { key: 'k', shiftKey: 'K', nep: 'प', shiftNep: 'प्' },
    { key: 'l', shiftKey: 'L', nep: 'ि', shiftNep: 'ी' },
    { key: ';', shiftKey: ':', nep: 'स', shiftNep: 'स्' },
    { key: "'", shiftKey: '"', nep: 'ु', shiftNep: 'ू' },
  ],
  // Row 4 (Bottom)
  [
    { key: 'z', shiftKey: 'Z', nep: 'श', shiftNep: 'श्' },
    { key: 'x', shiftKey: 'X', nep: 'ह', shiftNep: 'ह्' },
    { key: 'c', shiftKey: 'C', nep: 'अ', shiftNep: 'ऋ' },
    { key: 'v', shiftKey: 'V', nep: 'ख', shiftNep: 'ख्' },
    { key: 'b', shiftKey: 'B', nep: 'द', shiftNep: 'द्य' },
    { key: 'n', shiftKey: 'N', nep: 'ल', shiftNep: 'ल्' },
    { key: 'm', shiftKey: 'M', nep: 'फ', shiftNep: 'फ्' },
    { key: ',', shiftKey: '<', nep: ',', shiftNep: '?' },
    { key: '.', shiftKey: '>', nep: '।', shiftNep: 'श्र' },
    { key: '/', shiftKey: '?', nep: 'र', shiftNep: 'रु' },
  ],
];

export const ColorCodedKeyboard: React.FC<ColorCodedKeyboardProps> = ({
  activeKey = '',
  isShiftActive = false,
  showHeatmap = false,
  keyAccuracyMap = {},
  onKeyClick,
  activeFinger = null,
  needsShift = false,
  shiftHand = 'left',
  layoutMode = 'preeti',
}) => {
  const activeRows = layoutMode === 'romanized' ? ROMANIZED_KEYBOARD_LAYOUT : KEYBOARD_LAYOUT;

  const getKeyStyle = (charKey: string, finger: FingerType) => {
    // Heatmap mode
    if (showHeatmap && keyAccuracyMap[charKey]) {
      const stats = keyAccuracyMap[charKey];
      if (stats.total >= 3) {
        const acc = (stats.correct / stats.total) * 100;
        if (acc >= 95) return 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
        if (acc >= 85) return 'bg-amber-400 text-slate-900 border-amber-500 shadow-sm';
        return 'bg-rose-500 text-white border-rose-600 shadow-sm';
      }
    }

    // Active key highlight - shows its distinct finger color ONLY when it needs to be pressed!
    const isTarget = activeKey === charKey || (layoutMode === 'romanized' && activeKey.toLowerCase() === charKey.toLowerCase());
    if (isTarget) {
      const activeColor = FINGER_COLORS[finger] || 'bg-blue-600 text-white border-blue-700';
      return `${activeColor} shadow-lg ring-4 ring-amber-300 scale-105 z-10 transition-all animate-pulse font-black`;
    }

    // Default neutral keycap: all color removed until the key needs to be pressed
    return 'bg-white text-slate-800 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-xs';
  };

  return (
    <div className="w-full bg-slate-100/95 border border-slate-200/90 rounded-3xl p-3 md:p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 max-w-6xl mx-auto">
        {/* Left Hand Sitting on Left Side of Keyboard */}
        <div className="hidden md:flex shrink-0">
          <RealisticHand
            hand="left"
            activeFinger={activeFinger}
            needsShift={needsShift}
            shiftHand={shiftHand}
          />
        </div>

        {/* Center Keyboard Rows */}
        <div className="flex-1 w-full max-w-3xl flex flex-col gap-1.5 md:gap-2">
          {activeRows.map((row, rIdx) => (
            <div key={rIdx} className="flex justify-center gap-1 md:gap-1.5">
              {row.map((item) => {
                const displayChar = isShiftActive ? item.shiftNep : item.nep;
                const displayKey = isShiftActive ? item.shiftKey : item.key;
                const finger = KEY_FINGER_ASSIGNMENTS[item.key] || 'thumb';
                const keyStyle = getKeyStyle(displayKey, finger);

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onKeyClick?.(displayKey)}
                    className={`relative flex flex-col items-center justify-between p-1 md:p-1.5 rounded-lg border text-center transition-all min-w-[32px] md:min-w-[44px] h-11 md:h-13 font-semibold select-none ${keyStyle}`}
                  >
                    <span className="text-[9px] md:text-[11px] opacity-75 self-start leading-none font-mono">
                      {displayKey}
                    </span>
                    <span className="text-sm md:text-base font-bold leading-none mt-auto">
                      {displayChar}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}

          {/* Spacebar Row */}
          <div className="flex justify-center mt-1">
            <button
              type="button"
              onClick={() => onKeyClick?.(' ')}
              className={`w-56 md:w-80 h-10 md:h-12 rounded-lg border font-semibold text-xs flex items-center justify-center transition-all ${
                activeKey === ' '
                  ? 'bg-blue-600 text-white border-blue-700 ring-4 ring-amber-300 shadow-lg scale-105 z-10 animate-pulse font-black'
                  : 'bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
              }`}
            >
              खाली ठाउँ (Space)
            </button>
          </div>
        </div>

        {/* Right Hand Sitting on Right Side of Keyboard */}
        <div className="hidden md:flex shrink-0">
          <RealisticHand
            hand="right"
            activeFinger={activeFinger}
            needsShift={needsShift}
            shiftHand={shiftHand}
          />
        </div>
      </div>

      {/* Mobile Hands Display (Visible only on small screens where side-by-side won't fit) */}
      <div className="flex md:hidden items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-200">
        <RealisticHand
          hand="left"
          activeFinger={activeFinger}
          needsShift={needsShift}
          shiftHand={shiftHand}
        />
        <RealisticHand
          hand="right"
          activeFinger={activeFinger}
          needsShift={needsShift}
          shiftHand={shiftHand}
        />
      </div>
    </div>
  );
};
