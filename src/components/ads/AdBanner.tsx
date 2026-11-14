'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, ExternalLink, Sparkles, X, Settings } from 'lucide-react';
import { AdConfigModal } from './AdConfigModal';

interface AdBannerProps {
  slot: 'top-banner' | 'mid-banner' | 'sidebar' | 'footer-banner';
  className?: string;
  onNavigateToTab?: (tab: string) => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ slot, className = '', onNavigateToTab }) => {
  const [adClient, setAdClient] = useState<string>('');
  const [slotId, setSlotId] = useState<string>('');
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);

  const loadAdConfig = () => {
    try {
      const client = localStorage.getItem('nepali_adsense_client_id') || process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '';
      const top = localStorage.getItem('nepali_adsense_top_slot') || '';
      const mid = localStorage.getItem('nepali_adsense_mid_slot') || '';
      setAdClient(client);
      setSlotId(slot === 'top-banner' ? top : mid);
    } catch {}
  };

  useEffect(() => {
    loadAdConfig();
  }, [slot]);

  useEffect(() => {
    if (adClient && slotId && typeof window !== 'undefined') {
      try {
        // @ts-expect-error Google AdSense push
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {}
    }
  }, [adClient, slotId]);

  if (isDismissed) return null;

  // Real Google AdSense Render
  if (adClient && slotId) {
    return (
      <div className={`w-full relative my-2 overflow-hidden print:hidden ${className}`}>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 px-1">
          <span className="uppercase tracking-wider font-semibold">विज्ञापन (Advertisement)</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsConfigOpen(true)}
              title="विज्ञापन सेटिङ"
              className="hover:text-slate-600"
            >
              <Settings className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              title="विज्ञापन बन्द गर्नुहोस्"
              className="hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 min-h-[90px] flex items-center justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', textAlign: 'center' }}
            data-ad-client={adClient}
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>

        <AdConfigModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          onSaved={loadAdConfig}
        />
      </div>
    );
  }

  // Graceful, high-quality Nepali Sponsor / Promotional Display
  return (
    <aside
      aria-label="प्रायोजित सूचना तथा विज्ञापन"
      className={`w-full relative my-3 overflow-hidden rounded-2xl border transition-all print:hidden ${
        slot === 'top-banner'
          ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white border-emerald-700/40 shadow-sm'
          : 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 border-amber-300/80 text-slate-800 shadow-2xs'
      } ${className}`}
    >
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
            <Megaphone className="w-3 h-3" />
            <span>विज्ञापन / प्रायोजित</span>
          </span>

          {slot === 'top-banner' ? (
            <p className="text-xs md:text-sm font-bold text-emerald-100 flex items-center gap-1.5 flex-wrap">
              <span>🇳🇵 नेपालको १ नम्बर नेपाली टुलकिट:</span>
              <span className="text-amber-300 font-extrabold">१,२३,०००+ बृहत् शब्दकोश र १५-तह टाइपिङ मास्टर</span>
              <span className="hidden lg:inline text-slate-300 font-normal">— १००% निःशुल्क र सुरक्षित!</span>
            </p>
          ) : (
            <p className="text-xs md:text-sm font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>नेपाली टाइपिङ गति सुधार्न चाहनुहुन्छ?</span>
              <span className="text-emerald-700 font-extrabold">नेपाली टाइपिङ मास्टर प्रो र ३ क्यानभास गेमहरू खेल्नुहोस्!</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToTab && (
            <button
              type="button"
              onClick={() => onNavigateToTab(slot === 'top-banner' ? 'typing_master' : 'typing_games')}
              className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 cursor-pointer transition-all ${
                slot === 'top-banner'
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs hover:scale-105'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:scale-105'
              }`}
            >
              <span>{slot === 'top-banner' ? 'अभ्यास सुरु गर्नुहोस्' : 'गेम खेल्नुहोस्'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsConfigOpen(true)}
            title="Google AdSense विज्ञापन सेटिङ खोल्नुहोस्"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              slot === 'top-banner' ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            title="ब्यानर हटाउनुहोस्"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              slot === 'top-banner' ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <AdConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSaved={loadAdConfig}
      />
    </aside>
  );
};
