/**
 * Nepali Text Cleaner, PDF Matra Fixer & Bulk Sanitizer
 */

export interface FindReplaceRule {
  id: string;
  find: string;
  replace: string;
  isRegex?: boolean;
}

export function cleanNepaliText(
  text: string,
  options: {
    fixPdfMatras?: boolean;
    removeZwj?: boolean;
    normalizeDanda?: boolean;
    trimSpaces?: boolean;
    customRules?: FindReplaceRule[];
  } = {
    fixPdfMatras: true,
    removeZwj: true,
    normalizeDanda: true,
    trimSpaces: true,
  }
): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Remove Zero Width Joiners / Non-Joiners if requested
  if (options.removeZwj) {
    cleaned = cleaned.replace(/[\u200B\u200C\u200D\uFEFF]/g, '');
  }

  // 2. Fix PDF detached / broken matras
  if (options.fixPdfMatras) {
    // Matra placed after space or misplaced halanta
    cleaned = cleaned
      // Fix broken space before matras
      .replace(/\s+([ािीुूृेैोौौंँः्])/g, '$1')
      // Fix double virama / halantas
      .replace(/्\s*्+/g, '्')
      // Fix reph detachment (र् followed by space)
      .replace(/र्\s+([क-ह])/g, 'र्$1')
      // Fix misplaced anunasik / anusvara
      .replace(/([ाीुूृेैोौ])\s+([ंँ])/g, '$1$2')
      // Fix isolated matras that get rendered detached in PDF copies
      .replace(/([क-ह])\s+([ािीुूृेैोौ])/g, '$1$2');
  }

  // 3. Normalize Punctuation / Danda
  if (options.normalizeDanda) {
    cleaned = cleaned
      // Replace English period with Nepali danda when following Nepali text
      .replace(/([क-ह०-९ा-ौ्ंँ])\s*\./g, '$1।')
      // Fix multiple dandas with clean spacing
      .replace(/।+/g, '। ')
      .replace(/\s+।/g, '।');
  }

  // 4. Trim extra spaces
  if (options.trimSpaces) {
    cleaned = cleaned
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }

  // 5. Apply custom find & replace rules
  if (options.customRules && options.customRules.length > 0) {
    for (const rule of options.customRules) {
      if (!rule.find) continue;
      try {
        if (rule.isRegex) {
          const rx = new RegExp(rule.find, 'g');
          cleaned = cleaned.replace(rx, rule.replace);
        } else {
          cleaned = cleaned.split(rule.find).join(rule.replace);
        }
      } catch {
        // Continue on invalid regex
      }
    }
  }

  return cleaned;
}

