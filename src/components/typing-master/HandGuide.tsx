'use client';

import React from 'react';
import { FingerType, FINGER_NAMES_NEPALI } from '@/lib/typing-master-data';

interface HandGuideProps {
  activeFinger: FingerType | null;
  needsShift: boolean;
  shiftHand?: 'left' | 'right';
}

export const HandGuide: React.FC<HandGuideProps> = ({ activeFinger, needsShift, shiftHand = 'left' }) => {
  const getFingerClass = (finger: FingerType, isShift: boolean = false) => {
    if (isShift && needsShift) {
      return 'fill-rose-500 animate-pulse stroke-rose-600 stroke-2';
    }
    if (activeFinger === finger) {
      return 'fill-emerald-500 animate-bounce stroke-emerald-600 stroke-2';
    }
    return 'fill-slate-200 stroke-slate-300 hover:fill-slate-300';
  };

  return (
    <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center">
      <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-2">
        <span>१० औंला स्थान मार्गदर्शक (10-Finger Hand Guide):</span>
        {activeFinger && (
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
            {FINGER_NAMES_NEPALI[activeFinger]}
          </span>
        )}
        {needsShift && (
          <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
            + {shiftHand === 'left' ? 'बायाँ' : 'दायाँ'} Shift थिच्नुहोस्
          </span>
        )}
      </div>

      <div className="flex items-center justify-center gap-8 max-w-md w-full">
        {/* Left Hand SVG */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-semibold text-slate-500 mb-1">बायाँ हात (Left Hand)</span>
          <svg viewBox="0 0 160 160" className="w-32 h-32 drop-shadow-sm">
            {/* Palm */}
            <path d="M 30,110 Q 30,150 80,150 Q 130,150 130,110 Q 130,70 100,70 L 50,70 Z" className="fill-slate-100 stroke-slate-300 stroke-2" />
            {/* Left Pinky */}
            <rect x="25" y="45" width="16" height="55" rx="8" className={getFingerClass('pinky_left', shiftHand === 'left')} />
            {/* Left Ring */}
            <rect x="47" y="25" width="16" height="70" rx="8" className={getFingerClass('ring_left')} />
            {/* Left Middle */}
            <rect x="69" y="15" width="16" height="80" rx="8" className={getFingerClass('middle_left')} />
            {/* Left Index */}
            <rect x="91" y="25" width="16" height="70" rx="8" className={getFingerClass('index_left')} />
            {/* Left Thumb */}
            <rect x="115" y="80" width="30" height="18" rx="9" transform="rotate(30 115 80)" className={getFingerClass('thumb')} />
          </svg>
        </div>

        {/* Right Hand SVG */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-semibold text-slate-500 mb-1">दायाँ हात (Right Hand)</span>
          <svg viewBox="0 0 160 160" className="w-32 h-32 drop-shadow-sm">
            {/* Palm */}
            <path d="M 30,110 Q 30,150 80,150 Q 130,150 130,110 Q 130,70 60,70 L 110,70 Z" className="fill-slate-100 stroke-slate-300 stroke-2" />
            {/* Right Thumb */}
            <rect x="15" y="90" width="30" height="18" rx="9" transform="rotate(-30 15 90)" className={getFingerClass('thumb')} />
            {/* Right Index */}
            <rect x="53" y="25" width="16" height="70" rx="8" className={getFingerClass('index_right')} />
            {/* Right Middle */}
            <rect x="75" y="15" width="16" height="80" rx="8" className={getFingerClass('middle_right')} />
            {/* Right Ring */}
            <rect x="97" y="25" width="16" height="70" rx="8" className={getFingerClass('ring_right')} />
            {/* Right Pinky */}
            <rect x="119" y="45" width="16" height="55" rx="8" className={getFingerClass('pinky_right', shiftHand === 'right')} />
          </svg>
        </div>
      </div>
    </div>
  );
};

