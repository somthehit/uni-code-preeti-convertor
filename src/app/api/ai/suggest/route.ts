import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

async function generateWithGemini(ai: GoogleGenAI, prompt: string) {
  // Ultra-fast model gemini-3.5-flash-lite (1.2s response time) followed by robust fallbacks
  const models = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-4-hydrogen'];
  let lastError: any = null;
  for (const m of models) {
    try {
      const resp = await ai.models.generateContent({
        model: m,
        contents: prompt,
      });
      return { text: resp.text || '', model: m };
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${m} failed:`, err?.message);
    }
  }
  throw lastError;
}

export async function GET() {
  const hasServerKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  return NextResponse.json({
    active: hasServerKey,
    model: 'gemini-3.5-flash-lite',
    provider: 'Google Gemini AI',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, apiKey, action = 'suggest', level, weakKeys } = body;

    const keyToUse = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (!keyToUse) {
      return NextResponse.json(
        {
          success: false,
          needKey: true,
          message: 'Gemini API key is required. Please provide a free Gemini API key.',
        },
        { status: 401 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: keyToUse });

    if (action === 'generate_practice') {
      const prompt = `You are an expert Nepali typing tutor and language master.
Generate a cohesive, natural, and authentic Nepali practice paragraph for typing practice.
Level Number: ${level || 1}
Target Difficulty / Constraint: Focus on vocabulary suitable for general typing practice in modern Nepali.
${weakKeys && weakKeys.length > 0 ? `The student often makes mistakes on these keys/letters: ${weakKeys.join(', ')}. Please naturally include some words containing these letters.` : ''}
Requirements:
1. Provide ONLY 25 to 35 words in pure Devanagari Nepali script.
2. The paragraph should make real sense (meaningful sentence about Nepali culture, nature, history, daily life, or government service).
3. Do not include English words, romanized text, numbers, or markdown tags. Just pure Nepali text.`;

      const result = await generateWithGemini(ai, prompt);
      const generatedText = result.text.trim().replace(/[*_#`]/g, '');
      return NextResponse.json({ success: true, text: generatedText, model: result.model });
    }

    // Default action: 'suggest' (Word / sentence autocomplete)
    if (!text || text.trim().length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: ['नेपाल', 'हाम्रो', 'धन्यवाद', 'नमस्कार', 'श्रीमान्'],
        model: 'gemini-3.5-flash-lite',
      });
    }

    const prompt = `You are a real-time predictive Nepali language AI.
The user is typing in Nepali. Given the current typed sentence/text so far, predict the top 5 to 6 most logical, grammatically correct next words, declensions, or suffix completions that should naturally follow in Nepali.

Current typed text:
"""${text.trim()}"""

Rules:
1. ALWAYS suggest COMPLETE Nepali words. If the user is typing mid-word (e.g. 'हामी'), suggest full words with declensions (e.g. 'हामीले', 'हामीलाई', 'हाम्रो', 'हामीसँग', 'हामीहरू', 'सबै'). NEVER return isolated suffix fragments (do NOT return just 'ले' or 'लाई').
2. If the text ends with a space, suggest natural subsequent words that grammatically follow the sentence.
3. Return ONLY a valid JSON array of 5 to 6 complete Nepali words.
Example format: ["शब्द१", "शब्द२", "शब्द३", "शब्द४", "शब्द५"]
Do NOT wrap in markdown code blocks like \`\`\`json. Return raw JSON array only.`;

    const result = await generateWithGemini(ai, prompt);
    const rawOutput = result.text.trim();
    // Clean potential code block wrapping
    const cleanedJson = rawOutput.replace(/^```(json)?/i, '').replace(/```$/g, '').trim();

    let suggestions: string[] = [];
    try {
      suggestions = JSON.parse(cleanedJson);
    } catch {
      // Fallback extraction by regex
      const matches = cleanedJson.match(/["']([^"']+)["']/g);
      if (matches) {
        suggestions = matches.map((m) => m.replace(/["']/g, '').trim());
      }
    }

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      suggestions = ['सबै', 'पनि', 'भने', 'र', 'तथा'];
    }

    return NextResponse.json({
      success: true,
      suggestions: suggestions.slice(0, 6),
      model: result.model,
    });
  } catch (error: any) {
    console.error('Gemini API Route Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Error communicating with Gemini AI',
      },
      { status: 500 }
    );
  }
}
