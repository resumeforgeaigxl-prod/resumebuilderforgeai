export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { generateAIResponse, logAIUsage } from '@/lib/ai-provider';
import mammoth from 'mammoth';

import { extractTextFromPdf } from '@/lib/pdf-service';

async function parsePdf(buffer: Buffer, filename: string): Promise<string> {
  try {
    return await extractTextFromPdf(buffer, filename);
  } catch (err) {
    console.error('[PDF Service Integration]', err);
    throw new Error('PDF parsing failed. The extraction service might be offline.');
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
      // PDF: using Go PDF Parser Binary
      rawText = await parsePdf(buffer, file.name);
      parseMethod = 'go-binary-parser';
    }

    console.log(`[Parse] Extraction method: ${parseMethod} | chars: ${rawText?.trim().length ?? 0}`);
    // ── End hybrid extraction ──────────────────────────────────────────────

    if (!rawText?.trim()) return NextResponse.json({ error: 'No text extracted from file.' }, { status: 400 });

    const prompt = `
You are an expert resume parser. Extract information from the raw text provided and return ONLY a structured JSON object.

STRICT RULES:
1. Return ONLY valid JSON. No markdown blocks, no prefix text, no suffix text.
2. DO NOT fabricate or guess any information. If a field is not found, return "" (string) or [] (array).
3. Classify skills into these 7 categories ONLY:
   Languages, Frontend, Backend, Databases, Cloud & DevOps, System Design, AI & Automation
4. PROFESSIONAL SUMMARY RULE:
   - Extract ONLY the explicit "Summary" or "Objective" section.
   - DO NOT include the full resume text.
   - DO NOT include skills or lists of technologies.
   - DO NOT include project details or experience descriptions.
   - If no summary exists, return "".
5. PROJECTS RULE:
   - Map each project to the "projects" array.
   - "description" MUST be an array of bullet points (max 3 per project).
   - DO NOT include the project title or technologies inside the description bullets.
6. EXPERIENCE RULE:
   - "points" MUST be an array of bullet points (max 4 per role).

JSON SCHEMA:
{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "country": "",
  "linkedin": "",
  "github": "",
  "professional_summary": "",
  "skills": [],
  "projects": [
    {
      "title": "",
      "technologies": [],
      "bullets": []
    }
  ],
  "experience": [
    {
      "company": "",
      "role": "",
      "duration": "",
      "points": []
    }
  ],
  "education": [
    {
      "school": "",
      "degree": "",
      "duration": "",
      "cgpa": ""
    }
  ],
  "skillCategories": [
    { "category": "Languages", "skills": [] },
    { "category": "Frontend", "skills": [] },
    { "category": "Backend", "skills": [] },
    { "category": "Databases", "skills": [] },
    { "category": "Cloud & DevOps", "skills": [] },
    { "category": "System Design", "skills": [] },
    { "category": "AI & Automation", "skills": [] }
  ]
}

RAW RESUME TEXT:
${rawText}
`;

    const supabase = createClient();
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const startTime = Date.now();
    const aiResult = await generateAIResponse(prompt);
    const endTime = Date.now();
    const aiOut = aiResult.text;

    await logAIUsage(supabase, session.userId, null, aiResult, endTime - startTime);

    let parsed;
    try {
      const rawParsed = JSON.parse(aiOut.replace(/```json/g, '').replace(/```/g, '').trim());

      // Transform into strict internal ResumeData structure
      parsed = {
        name: String(rawParsed.name || ''),
        email: String(rawParsed.email || ''),
        phone: String(rawParsed.phone || ''),
        location: String(rawParsed.location || ''),
        country: String(rawParsed.country || 'India'),
        linkedin: String(rawParsed.linkedin || ''),
        github: String(rawParsed.github || ''),
        summary: String(rawParsed.professional_summary || ''), // Map summary properly
        skills: Array.isArray(rawParsed.skills) ? rawParsed.skills : [],
        skillCategories: Array.isArray(rawParsed.skillCategories) ? rawParsed.skillCategories : [],
        experience: (Array.isArray(rawParsed.experience) ? rawParsed.experience : []).map((exp: { company?: string; role?: string; duration?: string; points?: string[] }) => ({
          company: String(exp.company || ''),
          role: String(exp.role || ''),
          duration: String(exp.duration || ''),
          points: Array.isArray(exp.points) ? exp.points : []
        })),
        projects: (Array.isArray(rawParsed.projects) ? rawParsed.projects : []).map((proj: { title?: string; technologies?: string[]; bullets?: string[] }) => ({
          title: String(proj.title || ''),
          tech: Array.isArray(proj.technologies) ? proj.technologies : [], // Map tech properly
          description: Array.isArray(proj.bullets) ? proj.bullets : [] // Map bullets to description
        })),
        education: (Array.isArray(rawParsed.education) ? rawParsed.education : []).map((edu: { school?: string; degree?: string; duration?: string; cgpa?: string }) => ({
          school: String(edu.school || ''),
          degree: String(edu.degree || ''),
          duration: String(edu.duration || ''),
          cgpa: String(edu.cgpa || '')
        }))
      };
    } catch {
      console.error('[Parse] JSON parse/transform fail, raw:', aiOut.substring(0, 300));
      throw new Error('AI returned invalid data structure.');
    }

    if (formData.get('returnJson') === 'true') {
      return NextResponse.json({ success: true, data: parsed });
    }

    const { data: row, error: dbErr } = await supabase
      .from('resumes')

      .insert({
        user_id: session.userId,
        title: parsed.name ? `${parsed.name}'s Resume` : 'Imported Resume',
        resume_json: parsed,
        template_selected: 'harvard'
      })
      .select().single();

    if (dbErr || !row) {
      console.error('[Parse] DB Insert Error:', dbErr);
      return NextResponse.json({ error: 'Failed to save parsed resume' }, { status: 500 });
    }
    return NextResponse.json({ success: true, resumeId: row.id });

  } catch (e) {
    console.error('[Parse]', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal error' }, { status: 500 });
  }
}



