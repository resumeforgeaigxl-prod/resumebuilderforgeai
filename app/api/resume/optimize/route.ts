import { NextResponse } from 'next/server';
import { generateAIResponse, logAIUsage, stripMarkdown } from '@/lib/ai-provider';
import { ResumeData } from '@/types/resume';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const resumeData: ResumeData = body.resumeData;
        const jobDescription: string = body.jobDescription;

        if (!resumeData || !jobDescription) {
            return NextResponse.json({ error: 'Missing resume data or job description' }, { status: 400 });
        }

        const systemPrompt = `You are a resume enhancement engine.

Your job is to improve clarity, impact, and keyword strength WITHOUT changing meaning.

Rules:
- Never fabricate numbers.
- Never invent metrics.
- If metrics are missing, suggest placeholders instead of inventing.
- Preserve original project intent.
- Improve grammar and impact only.
- Strengthen action verbs.
- Add relevant ATS keywords based on technologies mentioned (e.g., if Next.js/JS is mentioned, include "REST API", "Async handling" if applicable).
- Keep output realistic and believable.
- Do not exaggerate.
- Do not make corporate fluff.
- Keep sentences concise.
- Maintain authenticity.
- Project Bullet Rule: Detect technologies, inject keywords naturally, improve clarity. If metric exists, refine it. If missing, do NOT rewrite to include fake numbers.`;

        const prompt = `Enhance the experience "points" and project "descriptions" in this Resume JSON to align with the provided Job Description. 
        Focus on technology relevance and impact without inventing achievements.
        Return ONLY valid JSON.
        
        RESUME:
        ${JSON.stringify(resumeData)}
        
        JOB DESCRIPTION:
        ${jobDescription}`;

        const startTime = Date.now();
        const aiResult = await generateAIResponse(prompt, undefined, systemPrompt, 0.3, 2000);
        const endTime = Date.now();
        const aiOutput = aiResult.text;

        const supabase = createClient();
        await logAIUsage(supabase, session.userId, null, aiResult, endTime - startTime);

        let optimizedJson;
        try {
            // Clean AI Output from markdown artifacts before parsing
            const cleaned = aiOutput
                .replace(/^```json/i, '')
                .replace(/^```/i, '')
                .replace(/```$/i, '')
                .trim();

            optimizedJson = JSON.parse(cleaned);

            // Validation and deep-cleaning the strings in the optimized JSON
            const cleanObj = (obj: unknown): unknown => {
                if (typeof obj === 'string') return stripMarkdown(obj);
                if (Array.isArray(obj)) return obj.map(cleanObj);
                if (obj !== null && typeof obj === 'object') {
                    const newObj: Record<string, unknown> = {};
                    Object.entries(obj).forEach(([key, val]) => {
                        newObj[key] = cleanObj(val);
                    });
                    return newObj;
                }
                return obj;
            };

            optimizedJson = cleanObj(optimizedJson) as Partial<ResumeData>;

            // Ensure core structure is preserved from original if missing in AI response
            optimizedJson = { ...resumeData, ...optimizedJson };

            // Re-assert array structures
            if (!Array.isArray(optimizedJson.experience)) optimizedJson.experience = resumeData.experience || [];
            if (!Array.isArray(optimizedJson.projects)) optimizedJson.projects = resumeData.projects || [];
            if (!Array.isArray(optimizedJson.skills)) optimizedJson.skills = resumeData.skills || [];
            if (!Array.isArray(optimizedJson.skillCategories)) optimizedJson.skillCategories = resumeData.skillCategories || [];

            console.log("[Optimize] Successfully validated and cleaned AI output.");
        } catch {
            console.log("[Optimize] JSON Parse Error. Raw output:", aiOutput);
            throw new Error("AI returned an invalid format. Please try again.");
        }

        return NextResponse.json({ success: true, optimizedData: optimizedJson });


    } catch (e: unknown) {
        console.error("Error optimizing resume:", e);
        return NextResponse.json({
            success: false,
            error: e instanceof Error ? e.message : 'Internal Server Error'
        }, { status: 500 });
    }
}
