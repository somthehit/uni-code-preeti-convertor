'use client';

import React, { useState, useRef } from 'react';
import { unicodeToPreeti } from '@/lib/preeti-converter';
import { UploadCloud, Image, Loader2, Copy, Check, FileText } from 'lucide-react';

export const NepaliOcrTool: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [extractedUnicode, setExtractedUnicode] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (file: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    runOcr(file);
  };

  const runOcr = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setExtractedUnicode('');

    try {
      // Lazy load tesseract.js client side
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('nep+eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const ret = await worker.recognize(file);
      setExtractedUnicode(ret.data.text);
      await worker.terminate();
    } catch (err) {
      console.error(err);
      setExtractedUnicode('OCR प्रक्रियामा त्रुटि भयो। कृपया स्पष्ट तस्बिर प्रयोग गर्नुहोस्।');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const preetiOutput = unicodeToPreeti(extractedUnicode);

  return (
    <div className="w-full flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            📷
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800">
              फोटो तथा स्क्यानबाट नेपाली टेक्स्ट (Image OCR)
            </h2>
            <p className="text-xs text-slate-500">
              सरकारी सूचना, पुस्तक वा पत्रपत्रिकाको फोटोबाट नेपाली अक्षरहरू स्वतः पहिचान गर्नुहोस्
            </p>
          </div>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors gap-3"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleImageUpload(e.target.files[0]);
            }
          }}
          className="hidden"
        />

        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl">
          <UploadCloud className="w-7 h-7" />
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-800">
            यहाँ नेपाली सूचना वा पृष्ठको फोटो अपलोड गर्नुहोस्
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            JPG, PNG, WebP समर्थित छन् (१००% ब्राउजरमै चल्छ, सर्भरमा जाँदैन)
          </p>
        </div>

        {isProcessing && (
          <div className="w-full max-w-xs flex flex-col items-center gap-2 mt-2">
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-rose-600 h-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              अक्षर पहिचान हुँदैछ... {progress}%
            </span>
          </div>
        )}
      </div>

      {/* Preview and Results Side-by-Side */}
      {extractedUnicode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unicode Text Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-extrabold text-slate-700">
                पहिचान भएको नेपाली युनिकोड
              </span>
              <button
                type="button"
                onClick={() => copyText('uni', extractedUnicode)}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                {copiedKey === 'uni' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>कपी</span>
              </button>
            </div>

            <div className="w-full min-h-[200px] p-3 text-base font-devanagari rounded-xl border border-slate-200 bg-slate-50/60 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
              {extractedUnicode}
            </div>
          </div>

          {/* Preeti Output Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-extrabold text-slate-700">
                प्रिती फन्टमा (Preeti ASCII)
              </span>
              <button
                type="button"
                onClick={() => copyText('preeti', preetiOutput)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                {copiedKey === 'preeti' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>कपी</span>
              </button>
            </div>

            <div className="w-full min-h-[200px] p-3 text-sm font-mono rounded-xl border border-slate-200 bg-slate-50/60 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all break-all">
              {preetiOutput}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

