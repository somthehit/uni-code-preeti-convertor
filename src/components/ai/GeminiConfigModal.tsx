'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Key, ExternalLink, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

interface GeminiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: (key: string) => void;
}

export const GeminiConfigModal: React.FC<GeminiConfigModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [serverActive, setServerActive] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('gemini_api_key') || '';
      setApiKey(savedKey);
      if (savedKey) setIsSaved(true);

      fetch('/api/ai/suggest')
        .then((r) => r.json())
        .then((d) => {
          if (d.active) setServerActive(true);
        })
        .catch(() => {});
    } catch {}
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      if (apiKey.trim()) {
        localStorage.setItem('gemini_api_key', apiKey.trim());
        setIsSaved(true);
        onKeySaved?.(apiKey.trim());
      } else {
        localStorage.removeItem('gemini_api_key');
        setIsSaved(false);
        onKeySaved?.('');
      }
    } catch {}
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'हामी',
          apiKey: apiKey.trim() || undefined,
          action: 'suggest',
        }),
      });

      const data = await res.json();
      if (data.success && data.suggestions) {
        setTestResult({
          success: true,
          message: `सफल! Gemini AI ले सुझाव दियो: ${data.suggestions.slice(0, 4).join(', ')}... (Model: ${data.model || 'Gemini 4'})`,
        });
        if (apiKey.trim()) {
          handleSave();
        }
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Gemini API प्रमाणीकरण असफल भयो। कृपया Key जाँच गर्नुहोस्।',
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: 'जडान त्रुटि: ' + (e.message || 'अज्ञात त्रुटि'),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRemove = () => {
    try {
      localStorage.removeItem('gemini_api_key');
      setApiKey('');
      setIsSaved(false);
      setTestResult(null);
      onKeySaved?.('');
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Google Gemini AI सेटअप</h3>
              <p className="text-xs text-white/80">वास्तविक Neural AI मोडेलबाट नेपाली सुझाव तथा अभ्यास</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          <div className="text-xs text-slate-600 leading-relaxed bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>१००% नि:शुल्क र व्यक्तिगत Google Gemini Key</span>
            </div>
            <p>
              Google ले प्रत्येक प्रयोगकर्तालाई <strong>Google AI Studio</strong> मार्फत प्रतिदिन हजारौं निःशुल्क Gemini API Request हरू प्रदान गर्दछ। आफ्नो नि:शुल्क Key यहाँ राख्दा तपाईंको ब्राउजरमै सुरक्षित रहन्छ।
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-700 font-extrabold hover:underline mt-1"
            >
              <span>👉 यहाँ क्लिक गरी निःशुल्क Gemini API Key लिनुहोस्</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Key Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-4 h-4 text-emerald-600" />
                Gemini API Key:
              </span>
              {isSaved ? (
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  ब्राउजर Key सक्रिय
                </span>
              ) : serverActive ? (
                <span className="text-[11px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                  .env सर्भर Key सक्रिय
                </span>
              ) : null}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder={serverActive ? "सर्भर Key (.env) पहिले नै सक्रिय छ (वा नयाँ Key यहाँ राख्नुहोस्)" : "AIzaSy..."}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
            />
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-300'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              {isSaved && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                >
                  Key हटाउनुहोस्
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                disabled={isTesting || !apiKey.trim()}
                onClick={handleTest}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>परीक्षण गर्दै...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>परीक्षण गर्नुहोस् (Test)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSave();
                  onClose();
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>सुरक्षित गर्नुहोस् (Save)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
