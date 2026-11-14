import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import { AboutMeView } from '@/components/about/AboutMeView';

export const metadata: Metadata = {
  title: 'विकासकर्ताको बारेमा (About Developer) | Som (somthehit)',
  description:
    'नेपाली अनुवादक, बृहत् शब्दकोश, टाइपिङ मास्टर र टुलकिट प्लेटफर्मका विकासकर्ता Som (somthehit) को परिचय, उद्देश्य र प्राविधिक विवरण।',
  keywords: [
    'Som developer Nepal',
    'somthehit',
    'Nepali Unicode to Preeti developer',
    'Nepali software engineer',
    'नेपाली अनुवादक विकासकर्ता',
  ],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'विकासकर्ताको बारेमा (About Developer) - Som (somthehit)',
    description:
      'नेपाली अनुवादक, बृहत् शब्दकोश र टाइपिङ मास्टर प्लेटफर्मका विकासकर्ता Som को परिचय र खुला स्रोत यात्रा।',
    url: 'https://unicodesom.vercel.app/about',
    type: 'profile',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50/60">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-700 hover:text-emerald-700 font-bold text-xs transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>मुख्य पृष्ठमा फर्कनुहोस् (Home)</span>
          </Link>

          <Link
            href="/"
            className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>नेपाली अनुवादक खोल्नुहोस्</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        <AboutMeView />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
              ने
            </span>
            <span className="font-bold text-slate-700">नेपाली अनुवादक, टाइपिङ मास्टर र टुलकिट</span>
          </div>

          <p className="text-slate-400">
            विकासकर्ता: <strong>Som (somthehit)</strong> | खुला स्रोत नेपाली प्रविधि अभियान 🇳🇵
          </p>

          <Link href="/" className="text-emerald-700 font-bold hover:underline">
            गृहपृष्ठ (Home) →
          </Link>
        </div>
      </footer>
    </div>
  );
}
