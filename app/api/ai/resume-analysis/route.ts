import { NextResponse } from 'next/server';
import { generateJsonGemini } from '@/lib/gemini-service';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export const runtime = 'nodejs';

const ANALYSIS_PROMPT = `
You are a professional Resume Strategist and ATS (Applicant Tracking System) Expert. 
Analyze the provided resume and provide a detailed analysis to help the user improve their chances of getting hired.

Return the analysis in JSON format with the following keys:
1. ats_score: A number between 0 and 100 representing how well the resume is structured and keyword-optimized.
2. strengths: An array of strings highlighting the key professional highlights and well-written sections.
3. missing_skills: An array of 5-8 technical or soft skills that are industry-relevant but missing from the resume.
4. improvements: An array of specific, actionable advice to make the resume more impactful.

Focus on:
- Quantitative impact (numbers, %, etc.)
- Action verbs
- Section clarity
- Visual hierarchy and structure

Resume Data:
{{RESUME_DATA}}
`;

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        const { resumeId, resumeData } = await req.json();

        if (!resumeId || !resumeData) {
            return NextResponse.json({ success: false, message: "Missing resume data" }, { status: 400 });
        }

        const supabase = createClient();

        // 1. Generate AI Analysis
        const prompt = ANALYSIS_PROMPT.replace('{{RESUME_DATA}}', JSON.stringify(resumeData));
        const aiResponse = await generateJsonGemini(prompt, "You are a Resume Intelligence AI.");

        if (!aiResponse || typeof aiResponse.ats_score !== 'number') {
            throw new Error("Invalid AI response");
        }

        // 2. Store in database
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('resume_analysis')
            .insert({
                resume_id: resumeId,
                user_id: session.userId,
                ats_score: aiResponse.ats_score,
                strengths: aiResponse.strengths,
                missing_skills: aiResponse.missing_skills,
                improvements: aiResponse.improvements
            })
            .select()
            .single();

        if (error) throw error;

        // 3. Log usage
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
            .from('ai_usage_logs')
            .insert({
                user_id: session.userId,
                feature: 'resume_intelligence',
                model: 'gemini-2.0-flash',
                tokens: JSON.stringify(aiResponse).length / 4
            });

        return NextResponse.json({
            success: true,
            analysis: data
        });

    } catch (error: unknown) {
        console.error('[Resume Analysis API] Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            success: false,
            message: "Failed to analyze resume",
            debug: message
        }, { status: 500 });
    }
}
