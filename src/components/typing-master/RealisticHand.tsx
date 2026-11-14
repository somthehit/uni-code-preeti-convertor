'use client';

import React from 'react';
import { FingerType } from '@/lib/typing-master-data';

interface RealisticHandProps {
  hand: 'left' | 'right';
  activeFinger: FingerType | null;
  needsShift?: boolean;
  shiftHand?: 'left' | 'right';
}

export const RealisticHand: React.FC<RealisticHandProps> = ({
  hand,
  activeFinger,
  needsShift = false,
  shiftHand = 'left',
}) => {
  const isLeft = hand === 'left';
  const side = isLeft ? 'left' : 'right';

  // Check which finger is active on this hand
  const isPinkyActive = isLeft
    ? activeFinger === 'pinky_left' || (needsShift && shiftHand === 'left')
    : activeFinger === 'pinky_right' || (needsShift && shiftHand === 'right');
  const isRingActive = isLeft ? activeFinger === 'ring_left' : activeFinger === 'ring_right';
  const isMiddleActive = isLeft ? activeFinger === 'middle_left' : activeFinger === 'middle_right';
  const isIndexActive = isLeft ? activeFinger === 'index_left' : activeFinger === 'index_right';
  const isThumbActive = activeFinger === 'thumb';

  const isPinkyShift = needsShift && ((isLeft && shiftHand === 'left') || (!isLeft && shiftHand === 'right'));

  // Active finger label
  const getActiveLabel = () => {
    if (isPinkyShift) return 'Shift थिच्नुहोस् (कान्छी)';
    if (isPinkyActive) return 'कान्छी औँला (Pinky) 👆';
    if (isRingActive) return 'साहिँली औँला (Ring) 👆';
    if (isMiddleActive) return 'माझी औँला (Middle) 👆';
    if (isIndexActive) return 'चोर औँला (Index) 👆';
    if (isThumbActive) return 'बुढी औँला (Thumb) 👆';
    return null;
  };

  const activeLabel = getActiveLabel();

  // Anatomical knuckle pivot points for realistic typing keystroke
  const pinkyPivot = isLeft ? '12% 40%' : '88% 40%';
  const ringPivot = isLeft ? '31% 36%' : '69% 36%';
  const middlePivot = isLeft ? '46% 34%' : '54% 34%';
  const indexPivot = isLeft ? '65% 35%' : '35% 35%';
  const thumbPivot = isLeft ? '78% 52%' : '22% 52%';

  return (
    <div className="flex flex-col items-center select-none w-36 md:w-44">
      {/* Hand title & active moving finger badge */}
      <div className="flex flex-col items-center gap-1 mb-2 h-10 justify-end">
        <span className="text-[11px] font-black text-slate-700 tracking-wider uppercase">
          {isLeft ? 'बायाँ हात (LEFT)' : 'दायाँ हात (RIGHT)'}
        </span>
        {activeLabel ? (
          <span
            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm text-white whitespace-nowrap transition-all ${isPinkyShift
              ? 'bg-rose-600 ring-2 ring-rose-300'
              : 'bg-blue-600 ring-2 ring-blue-300 animate-pulse'
              }`}
          >
            {activeLabel}
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 font-medium">तयार (Home Row)</span>
        )}
      </div>

      {/* Seamless Photorealistic Real Human Hand with Animated Typing Keystrokes */}
      <div className="relative w-full aspect-[465/889] max-h-64 md:max-h-72 drop-shadow-md select-none">
        {/* Layer 1: COMPLETE INTACT REAL HAND (Zero cuts, zero holes, 100% continuous skin) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/images/real-hand-${side}.png`}
          alt={`${side} hand intact`}
          className="w-full h-full object-contain pointer-events-none select-none z-0"
          draggable={false}
        />

        {/* Layer 2: Active Thumb (Seamlessly feathered at base, physically taps Spacebar) */}
        {isThumbActive && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/images/hand-thumb-${side}.png`}
            alt={`${side} thumb active`}
            style={{ transformOrigin: thumbPivot }}
            className={`absolute inset-0 w-full h-full object-contain pointer-events-none z-20 ${isLeft ? 'animate-thumb-strike-left' : 'animate-thumb-strike-right'
              }`}
            draggable={false}
          />
        )}

        {/* Layer 3: Active Index Finger (Seamlessly feathered at knuckle, physically taps key) */}
        {isIndexActive && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/images/hand-index-${side}.png`}
            alt={`${side} index active`}
            style={{ transformOrigin: indexPivot }}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20 animate-finger-strike"
            draggable={false}
          />
        )}

        {/* Layer 4: Active Middle Finger (Seamlessly feathered at knuckle, physically taps key) */}
        {isMiddleActive && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/images/hand-middle-${side}.png`}
            alt={`${side} middle active`}
            style={{ transformOrigin: middlePivot }}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20 animate-finger-strike"
            draggable={false}
          />
        )}

        {/* Layer 5: Active Ring Finger (Seamlessly feathered at knuckle, physically taps key) */}
        {isRingActive && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/images/hand-ring-${side}.png`}
            alt={`${side} ring active`}
            style={{ transformOrigin: ringPivot }}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-20 animate-finger-strike"
            draggable={false}
          />
        )}

        {/* Layer 6: Active Pinky Finger (Seamlessly feathered at knuckle, physically taps key / holds Shift) */}
        {isPinkyActive && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/images/hand-pinky-${side}.png`}
            alt={`${side} pinky active`}
            style={{ transformOrigin: pinkyPivot }}
            className={`absolute inset-0 w-full h-full object-contain pointer-events-none z-20 ${isPinkyShift ? 'animate-pinky-shift-press' : 'animate-finger-strike'
              }`}
            draggable={false}
          />
        )}
      </div>
    </div>
  );
};
