import { NextResponse } from 'next/server';
import { generateAIResponse, logAIUsage, stripMarkdown } from '@/lib/ai-provider';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { role, skills, experienceText, educationText, projectsText, jobDescription } = body;

        const systemPrompt = `You are a professional resume writer for tech candidates. 
Generate an authentic, JD-aligned professional summary.

RULES:
- Keep it 2–4 concise lines (no more).
- If a Job Description is provided, align the summary to that role by including matching keywords naturally.
- Reflect the candidate's REAL career stage (e.g., student, junior, or professional) based on Education and Projects.
- Tone: Realistic and hands-on. 
- AVOID: Corporate fluff, "seasoned professional" for students, and faking experience.
- DO NOT fabricate achievements or roles.
- CRITICAL: Return the response as a JSON object with the key "summary".
- CONTENT: Purely the summary string inside the JSON, no markdown, no introductory text.`;

        const jdContext = jobDescription ? `\nTarget Job Description:\n${jobDescription}` : '';
        const prompt = `Generate a realistic resume summary for:
Role: ${role || 'Software Developer'}
Skills: ${skills}
Experience: ${experienceText}
Education: ${educationText}
Projects: ${projectsText}
${jdContext}

Return the result in a JSON object.`;

        const startTime = Date.now();
        const aiResult = await generateAIResponse(prompt, undefined, systemPrompt, 0.3, 500);
        const aiOutput = aiResult.text;
        const endTime = Date.now();

        // Parse JSON response safely
        let summary = "";
        try {
            const cleaned = aiOutput.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
            const parsed = JSON.parse(cleaned);
            summary = parsed.summary || aiOutput;
        } catch (e) {
            console.warn("[AI Generate Summary] JSON Parse failed, falling back to raw output", e);
            summary = aiOutput;
        }

        summary = stripMarkdown(summary);

        const supabase = createClient();
        await logAIUsage(supabase, session.userId, null, aiResult, endTime - startTime);

        return NextResponse.json({ success: true, summary });

    } catch (e: unknown) {
        console.error("Error generating summary:", e);
        return NextResponse.json({
            success: false,
            error: e instanceof Error ? e.message : 'Internal Server Error'
        }, { status: 500 });
    }
}
