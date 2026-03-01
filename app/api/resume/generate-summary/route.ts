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
        const { role, skills, experienceText, educationText, projectsText } = body;

        const systemPrompt = `Generate an authentic professional resume summary.

Constraints:
- 3 to 4 lines only.
- Reflect real career stage (Student, Intern, Junior, Entry-Level vs Professional).
- Use Education context (Degree, University) and Projects to determine if user is a student. 
- Do NOT use senior corporate double-speak for juniors/students.
- Mention role, key skills, and real impact context.
- No markdown, no fluff, purely professional but authentic.`;

        const prompt = `Generate an authentic summary for:
Role: ${role || 'Professional'}
Skills: ${skills}
Experience Context: ${experienceText}
Education: ${educationText}
Projects: ${projectsText}`;

        const startTime = Date.now();
        const aiResult = await generateAIResponse(prompt, undefined, systemPrompt, 0.4, 500);
        const endTime = Date.now();

        const summary = stripMarkdown(aiResult.text);

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
