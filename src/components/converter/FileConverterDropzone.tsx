'use client';

import React, { useState, useRef } from 'react';
import {
  convertDocxFile,
  convertXlsxFile,
  convertTextOrCsvFile,
  downloadConvertedFile,
  ConversionDirection,
} from '@/lib/document-converter';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface FileConverterDropzoneProps {
  defaultDirection?: ConversionDirection;
}

export const FileConverterDropzone: React.FC<FileConverterDropzoneProps> = ({
  defaultDirection = 'u2p',
}) => {
  const [direction, setDirection] = useState<ConversionDirection>(defaultDirection);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsConverting(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const lowerName = file.name.toLowerCase();

        let convertedBlob: Blob | null = null;
        if (lowerName.endsWith('.docx')) {
          convertedBlob = await convertDocxFile(file, direction);
        } else if (lowerName.endsWith('.xlsx')) {
          convertedBlob = await convertXlsxFile(file, direction);
        } else if (
          lowerName.endsWith('.csv') ||
          lowerName.endsWith('.txt') ||
          lowerName.endsWith('.rtf')
        ) {
          convertedBlob = await convertTextOrCsvFile(file, direction);
        } else {
          throw new Error(
            `फाइल '${file.name}' समर्थित छैन। कृपया .docx, .xlsx, .csv वा .txt फाइल छान्नुहोस्।`
          );
        }

        if (convertedBlob) {
          downloadConvertedFile(file.name, convertedBlob, direction);
        }
      }

      setStatusMessage(
        `सफलतापूर्वक रूपान्तरण भयो! फाइल डाउनलोड सुरु भएको छ।`
      );
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'फाइल रूपान्तरण गर्दा त्रुटि भयो।'
      );
    } finally {
      setIsConverting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="w-full bg-white border border-emerald-100/80 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-5">
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800">
              कागजात फाइल रूपान्तरण (File Converter)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Word (.docx), Excel (.xlsx), CSV वा Text (.txt) फाइल अपलोड गर्नुहोस् — नेपाली रूपान्तरण हुन्छ, अङ्ग्रेजी शब्द र एक्सेल फर्मुलाहरू जस्ताको तस्तै सुरक्षित रहन्छन्।
            </p>
          </div>

          {/* Direction toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
            <button
              type="button"
              onClick={() => setDirection('u2p')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                direction === 'u2p'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              युनिकोड → प्रिती
            </button>
            <button
              type="button"
              onClick={() => setDirection('p2u')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                direction === 'p2u'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              प्रिती → युनिकोड
            </button>
          </div>
        </div>
      </div>

      {/* Dropzone Card */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-emerald-200 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all gap-3"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".docx,.xlsx,.csv,.txt,.rtf"
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl shadow-xs">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div>
          <h4 className="text-base font-bold text-slate-800">
            यहाँ फाइल तान्नुहोस् (Drag & Drop) वा छान्नुहोस्
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            समर्थित ढाँचाहरू: .docx (Word), .xlsx (Excel), .csv, .txt (Text), .rtf (ब्याच फाइल सपोर्ट)
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold shadow-xs">
          <span>✅ नेपाली र अङ्ग्रेजी मिश्रित कागजात तथा एक्सेल फर्मुला पूर्ण रूपमा सुरक्षित रहने प्रविधि</span>
        </div>

        <button
          type="button"
          disabled={isConverting}
          className="mt-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2 transition-transform hover:scale-105"
        >
          {isConverting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>रूपान्तरण हुँदैछ...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span>फाइल छान्नुहोस्</span>
            </>
          )}
        </button>
      </div>

      {/* Success / Error alerts */}
      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

