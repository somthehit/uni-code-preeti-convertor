'use client';

import React, { useState } from 'react';
import {
  Github,
  Mail,
  Heart,
  Code2,
  Sparkles,
  Award,
  Terminal,
  Cpu,
  Layers,
  BookOpen,
  Keyboard,
  Gamepad2,
  Printer,
  ShieldCheck,
  ExternalLink,
  MapPin,
  CheckCircle2,
  X,
  ZoomIn,
} from 'lucide-react';

interface AboutMeViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const AboutMeView: React.FC<AboutMeViewProps> = ({ onNavigateTab }) => {
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 pb-12 animate-fadeIn">
      {/* Hero Developer Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 text-white p-6 md:p-10 border border-emerald-800/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left">
          {/* Avatar with Glow & Flag Badge */}
          <div
            onClick={() => setIsPhotoModalOpen(true)}
            title="पूर्ण तस्विर हेर्न क्लिक गर्नुहोस् (Click to view full photo)"
            className="relative group shrink-0 cursor-pointer"
          >
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 p-1 shadow-xl group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-900 relative">
                <img
                  src="/images/about_me.jpg"
                  alt="Som (somthehit) - Software Engineer & Developer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  style={{ objectPosition: '75% 30%' }}
                />
                <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white drop-shadow-md" />
                </div>
              </div>
            </div>
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-rose-600 text-white text-xs font-bold rounded-full shadow-md border-2 border-slate-900 flex items-center gap-1 z-10">
              🇳🇵 नेपाल
            </span>
          </div>

          {/* Bio & Intro */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>सफ्टवेयर इन्जिनियर र क्रिएटर</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-rose-400" />
                <span>काठमाडौँ, नेपाल</span>
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Som <span className="text-emerald-400 text-2xl md:text-3xl font-mono">(somthehit)</span>
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
              नमस्ते! म नेपाली प्रविधि, खुला स्रोत (Open Source) र डिजिटल भाषिक सशक्तिकरणमा समर्पित सफ्टवेयर विकासकर्ता हुँ।
              मैले नेपाली भाषा, परम्परागत प्रिती फन्ट, युनिकोड र टाइपिङ शिक्षालाई विश्वभरका नेपालीहरूका लागि सहज र निःशुल्क बनाउन यो बृहत् प्लेटफर्म निर्माण गरेको हुँ।
            </p>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
              <a
                href="https://github.com/somthehit"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Github className="w-4 h-4" />
                <span>GitHub Profile</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <a
                href="https://github.com/somthehit/uni-code-preeti-convertor"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-105"
              >
                <Code2 className="w-4 h-4" />
                <span>Source Code (GitHub)</span>
                <ExternalLink className="w-3 h-3 text-emerald-200" />
              </a>

              <a
                href="mailto:somthehit@gmail.com"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 transition-all hover:scale-105"
              >
                <Mail className="w-4 h-4 text-amber-400" />
                <span>somthehit@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Story & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900">यस परियोजनाको प्रेरणा र उद्देश्य</h2>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
              नेपालमा अझै पनि सरकारी कार्यालय, विद्यालय, अदालत, सञ्चारमाध्यम तथा प्रेसहरूमा <strong>Preeti</strong> फन्ट व्यापक रूपमा प्रयोग गरिन्छ; जबकि इन्टरनेट र सामाजिक सञ्जालमा <strong>युनिकोड (Devanagari)</strong> अनिवार्य छ।
              दुई फन्टबीचको रूपान्तरण गर्दा धेरै प्रयोगकर्ताहरूले अक्षर बिग्रने, आधा अक्षर हराउने वा असुरक्षित वेबसाइटहरूमा संवेदनशील कागजात पेस्ट गर्नुपर्ने जोखिम भोगिरहेका थिए।
            </p>
            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium">
              त्यस समस्यालाई सदाका लागि समाधान गर्न मैले यो प्लेटफर्म १००% क्लाइन्ट-साइड (तपाईंको डेटा तपाईंको ब्राउजरमै रहने) गरी विकास गरेको हुँ।
            </p>
          </div>

          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800 font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>१००% निःशुल्क, सुरक्षित र कुनै पनि व्यक्तिगत डेटा सर्भरमा नपठाइने ग्यारेन्टी।</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900">यस प्लेटफर्मका अद्वितीय उपलब्धिहरू</h2>
            <div className="flex flex-col gap-2.5 text-xs text-slate-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>१,२३,०००+ बृहत् शब्दकोश:</strong> उच्च गतिको सार्डेड इन्डेक्सिङ प्रविधि र नेपाली हिज्जे जाँच।</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>१५ तह टाइपिङ मास्टर:</strong> वास्तविक हातको ३डी फोटोरियलिस्टिक औँला स्ट्राइक एनिमेसन।</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>३ आधुनिक क्यानभास गेम:</strong> टाइप्सला, बेलुन फोड्ने र नेपाल एक्सप्रेस दौड।</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>सरकारी A4 प्रिन्ट मार्जिन:</strong> १ इन्च र १.५ इन्च लेटरहेड मार्जिनमा शुद्ध प्रिती मुद्रण।</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>माइक्रोसफ्ट वर्ड र एक्सेल सपोर्ट:</strong> डकुमेन्ट सिधै प्रिती वा युनिकोडमा रूपान्तरण।</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs text-amber-900 font-bold">
            <span>💻 खुला स्रोत योगदानका लागि खुला</span>
            <a
              href="https://github.com/somthehit/uni-code-preeti-convertor"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>GitHub मा हेर्नुहोस्</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Technical Skills & Architecture */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-emerald-600" />
            <span>विकासकर्ताको प्राविधिक सीप र स्ट्याक (Technical Skills)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            यस परियोजनामा प्रयोग गरिएका अत्याधुनिक प्रविधिहरू र इन्जिनियरिङ ढाँचा:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-indigo-600 font-black text-sm">
              <Layers className="w-4 h-4" />
              <span>Frontend & UI</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
              <Terminal className="w-4 h-4" />
              <span>Nepali NLP & Regex</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Devanagari Unicode Normalization, Preeti ASCII Transliteration, Sharded JSON Dictionary Cache
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-600 font-black text-sm">
              <Gamepad2 className="w-4 h-4" />
              <span>60FPS Game Engines</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              HTML5 Canvas API, Particle Systems, 3D Skeletal Animation CSS, Web Audio Synthesizer
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
              <Sparkles className="w-4 h-4" />
              <span>AI Integration</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Google Gemini API, Next.js Edge Routes, Client-side Adaptive Learning Cache & Spell Checking
            </p>
          </div>
        </div>
      </div>

      {/* Feature Showcase Grid with Direct Navigation */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span>प्लेटफर्मका प्रमुख सुविधाहरू अवलोकन गर्नुहोस्</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              सबै सुविधाहरू १००% निःशुल्क, विज्ञापन-मैत्री र विज्ञापन हटाएर प्रयोग गर्न सकिने व्यवस्था छ।
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { id: 'converter', label: 'प्रिती ↔ युनिकोड', icon: Code2, color: 'text-emerald-400' },
            { id: 'dictionary', label: 'बृहत् शब्दकोश', icon: BookOpen, color: 'text-amber-400' },
            { id: 'typing_master', label: 'टाइपिङ मास्टर', icon: Keyboard, color: 'text-sky-400' },
            { id: 'typing_games', label: 'आर्केड गेमहरू', icon: Gamepad2, color: 'text-rose-400' },
            { id: 'romanized', label: 'रोमनाइज्ड टाइपिङ', icon: Terminal, color: 'text-purple-400' },
            { id: 'multi_font', label: 'बहु-फन्ट रूपान्तरण', icon: Layers, color: 'text-indigo-400' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigateTab?.(item.id)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 flex flex-col items-center text-center gap-2 transition-all hover:scale-105 cursor-pointer group"
              >
                <Icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contact & Support Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex flex-col gap-1.5 max-w-xl">
          <h3 className="text-xl font-black text-slate-900">
            कुनै सल्लाह, सुझाव वा नयाँ फिचरको आवश्यकता छ?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            तपाईंको प्रतिक्रियाले यो नेपाली प्लेटफर्मलाई अझ राम्रो र प्रभावकारी बनाउन मद्दत गर्दछ। सिधै ईमेल वा GitHub Issue मार्फत सम्पर्क गर्न सक्नुहुन्छ।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="mailto:somthehit@gmail.com"
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Mail className="w-4 h-4" />
            <span>ईमेल पठाउनुहोस्</span>
          </a>
          <a
            href="https://github.com/somthehit/uni-code-preeti-convertor/issues"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs border border-slate-300 flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Github className="w-4 h-4" />
            <span>GitHub Issue खोल्नुहोस्</span>
          </a>
        </div>
      </div>

      {/* Full Photo Modal */}
      {isPhotoModalOpen && (
        <div
          onClick={() => setIsPhotoModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm md:max-w-md w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 animate-scaleUp"
          >
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(false)}
              className="absolute top-3 right-3 z-10 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full shadow-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src="/images/about_me.jpg"
              alt="Som (somthehit) - Nepal Pokhara"
              className="w-full h-auto max-h-[80vh] object-contain rounded-3xl"
            />
            <div className="p-4 bg-slate-900/90 text-center border-t border-slate-800">
              <span className="text-xs font-bold text-emerald-400">Som (somthehit)</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">Wander, Explore, Discover — Pokhara, Nepal 🇳🇵</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
