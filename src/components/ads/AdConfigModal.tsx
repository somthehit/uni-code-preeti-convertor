'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Megaphone, ShieldCheck } from 'lucide-react';

interface AdConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const AdConfigModal: React.FC<AdConfigModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [adClient, setAdClient] = useState<string>('');
  const [topSlot, setTopSlot] = useState<string>('');
  const [midSlot, setMidSlot] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedClient = localStorage.getItem('nepali_adsense_client_id') || '';
      const savedTop = localStorage.getItem('nepali_adsense_top_slot') || '';
      const savedMid = localStorage.getItem('nepali_adsense_mid_slot') || '';
      setAdClient(savedClient);
      setTopSlot(savedTop);
      setMidSlot(savedMid);
    } catch {}
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      localStorage.setItem('nepali_adsense_client_id', adClient.trim());
      localStorage.setItem('nepali_adsense_top_slot', topSlot.trim());
      localStorage.setItem('nepali_adsense_mid_slot', midSlot.trim());
      setIsSaved(true);
      onSaved?.();
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1000);
    } catch {}
  };

  const handleClear = () => {
    try {
      localStorage.removeItem('nepali_adsense_client_id');
      localStorage.removeItem('nepali_adsense_top_slot');
      localStorage.removeItem('nepali_adsense_mid_slot');
      setAdClient('');
      setTopSlot('');
      setMidSlot('');
      onSaved?.();
      onClose();
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 flex flex-col gap-4 text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                गुगल विज्ञापन सेटिङ (Google AdSense)
              </h3>
              <p className="text-[11px] text-slate-500">
                वेबसाइटमा आफ्ना आधिकारिक AdSense विज्ञापनहरू देखाउनुहोस्
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Google AdSense Publisher ID:
            </label>
            <input
              type="text"
              placeholder="उदाहरण: ca-pub-1234567890123456"
              value={adClient}
              onChange={(e) => setAdClient(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Top Leaderboard Ad Slot ID (वैकल्पिक):
            </label>
            <input
              type="text"
              placeholder="उदाहरण: 9876543210"
              value={topSlot}
              onChange={(e) => setTopSlot(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Mid Content Ad Slot ID (वैकल्पिक):
            </label>
            <input
              type="text"
              placeholder="उदाहरण: 5432109876"
              value={midSlot}
              onChange={(e) => setMidSlot(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              आईडी नराख्दासम्म सफा र व्यावसायिक प्रायोजित ब्यानर देखिनेछ। गुगलबाट अनुमोदन भएपछि यहाँ आफ्नो आईडी राख्न सक्नुहुन्छ।
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            हटाउनुहोस् (Reset)
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              रद्द गर्नुहोस्
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-transform hover:scale-102"
            >
              {isSaved ? <Check className="w-4 h-4" /> : null}
              <span>{isSaved ? 'सेभ भयो!' : 'सेभ गर्नुहोस्'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
