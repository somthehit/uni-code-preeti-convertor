/**
 * Document & Spreadsheet Converter (.docx, .xlsx, .csv, .txt, .rtf)
 * Preserves XML structure, Excel formulas (<f>), formatting, and English words
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { preetiToUnicode, unicodeToPreeti, ConverterOptions } from './preeti-converter';

export type ConversionDirection = 'u2p' | 'p2u';

/**
 * Translates an XML text block while keeping all tags intact
 */
function translateXmlContent(
  xml: string,
  tagRegex: RegExp,
  converter: (text: string) => string
): string {
  return xml.replace(tagRegex, (fullMatch, openTag, textContent, closeTag) => {
    // If empty or purely whitespace, preserve
    if (!textContent || !textContent.trim()) {
      return fullMatch;
    }
    const converted = converter(textContent);
    return `${openTag}${converted}${closeTag}`;
  });
}

/**
 * Converts Word Document (.docx) preserving XML formatting, styles, and tables
 */
export async function convertDocxFile(
  file: File,
  direction: ConversionDirection,
  options: ConverterOptions = { smartEnglishLock: true }
): Promise<Blob> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  const converter = direction === 'u2p' ? (t: string) => unicodeToPreeti(t, options) : (t: string) => preetiToUnicode(t, options);

  // Targets in a standard .docx archive
  const targetFiles = [
    'word/document.xml',
    'word/header1.xml',
    'word/header2.xml',
    'word/header3.xml',
    'word/footer1.xml',
    'word/footer2.xml',
    'word/footer3.xml',
    'word/footnotes.xml',
    'word/endnotes.xml',
  ];

  // Regex matches <w:t ...>content</w:t>
  const wtRegex = /(<w:t(?:\s+[^>]*)?>)([\s\S]*?)(<\/w:t>)/g;

  for (const filename of targetFiles) {
    const docFile = loadedZip.file(filename);
    if (docFile) {
      const xml = await docFile.async('string');
      const updatedXml = translateXmlContent(xml, wtRegex, converter);
      loadedZip.file(filename, updatedXml);
    }
  }

  return await loadedZip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

/**
 * Converts Excel (.xlsx) file preserving formulas (<f>), styles, and numbers
 */
export async function convertXlsxFile(
  file: File,
  direction: ConversionDirection,
  options: ConverterOptions = { smartEnglishLock: true }
): Promise<Blob> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  const converter = direction === 'u2p' ? (t: string) => unicodeToPreeti(t, options) : (t: string) => preetiToUnicode(t, options);

  // Excel stores non-formula text strings in xl/sharedStrings.xml
  const sharedStringsFile = loadedZip.file('xl/sharedStrings.xml');
  if (sharedStringsFile) {
    const xml = await sharedStringsFile.async('string');
    // Regex matches <t ...>content</t> inside <si>
    const tRegex = /(<t(?:\s+[^>]*)?>)([\s\S]*?)(<\/t>)/g;
    const updatedXml = translateXmlContent(xml, tRegex, converter);
    loadedZip.file('xl/sharedStrings.xml', updatedXml);
  }

  // Also check individual worksheet inline strings <is><t>content</t></is>
  const sheetFiles = Object.keys(loadedZip.files).filter((path) => path.startsWith('xl/worksheets/sheet'));
  const isTRegex = /(<is>[\s\S]*?<t(?:\s+[^>]*)?>)([\s\S]*?)(<\/t>[\s\S]*?<\/is>)/g;
  for (const sheetPath of sheetFiles) {
    const sheetFile = loadedZip.file(sheetPath);
    if (sheetFile) {
      const xml = await sheetFile.async('string');
      // Only translate <is><t>...</t></is>, NEVER formulas <f>...</f> or values <v>...</v>
      const updatedXml = xml.replace(isTRegex, (fullMatch, before, text, after) => {
        return `${before}${converter(text)}${after}`;
      });
      loadedZip.file(sheetPath, updatedXml);
    }
  }

  return await loadedZip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Converts Plain Text or CSV file
 */
export async function convertTextOrCsvFile(
  file: File,
  direction: ConversionDirection,
  options: ConverterOptions = { smartEnglishLock: true }
): Promise<Blob> {
  const text = await file.text();
  const converted = direction === 'u2p' ? unicodeToPreeti(text, options) : preetiToUnicode(text, options);
  return new Blob([converted], { type: file.type || 'text/plain;charset=utf-8' });
}

/**
 * Downloads a converted blob with appropriate filename suffix
 */
export function downloadConvertedFile(originalFilename: string, blob: Blob, direction: ConversionDirection): void {
  const parts = originalFilename.split('.');
  const ext = parts.length > 1 ? `.${parts.pop()}` : '';
  const base = parts.join('.');
  const tag = direction === 'u2p' ? '_preeti' : '_unicode';
  const newFilename = `${base}${tag}${ext}`;
  saveAs(blob, newFilename);
}

