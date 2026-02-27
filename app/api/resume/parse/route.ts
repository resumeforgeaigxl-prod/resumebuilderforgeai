import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { generateAIResponse } from '@/lib/ai-provider';
import mammoth from 'mammoth';
import { runOCR } from '@/lib/parser/ocrParser';

export const runtime = 'nodejs';

async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    const mod = await import('pdf-parse');
    if ('PDFParse' in mod) {
      const { PDFParse } = mod as unknown as { PDFParse: new (o: { data: Uint8Array }) => { getText: () => Promise<{ text: string }> } };
      const result = await new PDFParse({ data: new Uint8Array(buffer) }).getText();
      return result.text;
    }
    const fn = (mod as unknown as { default?: (b: Buffer) => Promise<{ text: string }> }).default;
    if (typeof fn === 'function') return (await fn(buffer)).text;
    throw new Error('pdf-parse: no usable export');
  } catch (err) {
    console.error('[PDF]', err);
    throw new Error('PDF parsing failed.');
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isDocx = file.type.includes('wordprocessingml') || file.name.toLowerCase().endsWith('.docx');
    if (!isPdf && !isDocx) return NextResponse.json({ error: 'Only PDF or DOCX supported.' }, { status: 400 });

    // File size guard — max 5 MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large. Maximum size is 5 MB.' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // ── Hybrid extraction ──────────────────────────────────────────────────
    let rawText: string;
    let parseMethod: string;

    if (isDocx) {
      // DOCX: always use mammoth (unchanged)
      rawText = (await mammoth.extractRawText({ buffer })).value;
      parseMethod = 'mammoth';
    } else {
      // PDF: try pdf-parse first
      let pdfText = '';
      try {
        pdfText = await parsePdf(buffer);
      } catch {
        console.warn('[Parse] pdf-parse threw — will attempt OCR fallback');
      }

      if (pdfText && pdfText.trim().length >= 100) {
        // pdf-parse succeeded with enough text
        rawText = pdfText;
        parseMethod = 'pdf-parse';
      } else {
        // Text too short or empty — scanned / image PDF → try OCR
        console.log('[Parse] PDF text too small (got', pdfText.trim().length, 'chars). Running OCR fallback...');
        const ocrText = await runOCR(buffer);
        if (ocrText && ocrText.trim().length > 50) {
          rawText = ocrText;
          parseMethod = 'ocr-fallback';
        } else {
          // Both methods failed — use whatever we have or error
          rawText = pdfText || ocrText;
          parseMethod = rawText.trim() ? 'pdf-parse-partial' : 'failed';
        }
      }
    }

    console.log(`[Parse] Extraction method: ${parseMethod} | chars: ${rawText?.trim().length ?? 0}`);
    // ── End hybrid extraction ──────────────────────────────────────────────

    if (!rawText?.trim()) return NextResponse.json({ error: 'No text extracted from file.' }, { status: 400 });

    const prompt = `
You are an expert resume parser. Extract all information from the raw text and return structured JSON.

RULES:
1. Return ONLY valid JSON. No markdown. No extra text.
2. DO NOT fabricate any data.
3. Classify skills into these 7 categories ONLY:
   Languages, Frontend, Backend, Databases, Cloud & DevOps, System Design, AI & Automation
4. Max 3 bullets per project (max 20 words per bullet).
5. Max 4 experience bullets per role (max 20 words each).

SCHEMA:
{
  "name": "",
  "email": "",
  "phone": "",
  "linkedin": "",
  "github": "",
  "summary": "",
  "skills": ["string"],
  "skillCategories": [
    { "category": "Languages", "skills": [] },
    { "category": "Frontend", "skills": [] },
    { "category": "Backend", "skills": [] },
    { "category": "Databases", "skills": [] },
    { "category": "Cloud & DevOps", "skills": [] },
    { "category": "System Design", "skills": [] },
    { "category": "AI & Automation", "skills": [] }
  ],
  "experience": [
    { "id": "uid", "company": "", "role": "", "duration": "", "points": [] }
  ],
  "projects": [
    { "id": "uid", "title": "", "tech": [], "description": [], "liveLink": "", "githubLink": "" }
  ],
  "education": [
    { "id": "uid", "school": "", "degree": "", "duration": "", "cgpa": "" }
  ],
  "certifications": [
    { "id": "uid", "title": "", "issuer": "", "year": "" }
  ]
}

RAW RESUME TEXT:
${rawText}
`;

    const aiOut = await generateAIResponse(prompt);
    let parsed;
    try {
      parsed = JSON.parse(aiOut.replace(/```json/g, '').replace(/```/g, '').trim());
    } catch {
      console.error('[Parse] JSON parse fail, raw:', aiOut.substring(0, 300));
      throw new Error('AI returned invalid JSON.');
    }

    if (formData.get('returnJson') === 'true') {
      return NextResponse.json({ success: true, data: parsed });
    }

    const supabase = createClient();
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error: dbErr } = await (supabase as any)
      .from('resumes')
      .insert({ user_id: session.userId, title: parsed.name ? `${parsed.name}'s Resume` : 'Imported Resume', resume_json: parsed, template_selected: 'harvard' })
      .select().single();

    if (dbErr || !row) return NextResponse.json({ error: 'DB error' }, { status: 500 });
    return NextResponse.json({ success: true, resumeId: row.id });

  } catch (e) {
    console.error('[Parse]', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
  }
}
