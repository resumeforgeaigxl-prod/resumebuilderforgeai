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

        const systemPrompt = `You are a resume enhancement engine focused on intelligent JD-alignment.

Rules:
1. Extract key technologies and skills from the Job Description.
2. Compare them with the candidate's resume.
3. Enhance ONLY matching sections (Experience points and Project descriptions) to highlight relevant skills.
4. Insert missing relevant keywords NATURALLY where they fit the candidate's actual work.
5. PRESERVE authenticity: Do NOT rewrite the entire resume or invent achievements.
6. DO NOT fabricate impact, metrics, or percentages.
7. Tone: Realistic and technical. No corporate fluff.
8. Maintain the original meaning and project intent.
9. Return a JSON object containing:
   - "optimized_resume": The full ResumeData object (all fields).
   - "analysis": {
       "match_score": 0-100,
       "matched_keywords": ["skill1", "tech2"],
       "missing_keywords": ["skill3"],
       "improvements": ["improvement description 1", "improvement description 2"]
     }`;

        const prompt = `Enhance this Resume JSON to align with the provided Job Description.
        
        STEPS:
        1. Identify JD keywords.
        2. Map them to existing resume experiences and projects.
        3. Inject keywords naturally while improving clarity.
        4. Focus on matching tech stacks.
        
        RESUME:
        ${JSON.stringify(resumeData)}
        
        JOB DESCRIPTION:
        ${jobDescription}`;

        const startTime = Date.now();
        const aiResult = await generateAIResponse(prompt, undefined, systemPrompt, 0.2, 3000);
        const endTime = Date.now();
        const aiOutput = aiResult.text;

        const supabase = createClient();
        await logAIUsage(supabase, session.userId, null, aiResult, endTime - startTime);

        let parsedResult;
        try {
            // Clean AI Output from markdown artifacts before parsing
            const cleaned = aiOutput
                .replace(/^```json/i, '')
                .replace(/^```/i, '')
                .replace(/```$/i, '')
                .trim();

            parsedResult = JSON.parse(cleaned);
            let optimizedJson = parsedResult.optimized_resume || parsedResult;
            const analysis = parsedResult.analysis || {
                match_score: 0,
                matched_keywords: [],
                missing_keywords: [],
                improvements: []
            };

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

            return NextResponse.json({
                success: true,
                optimizedData: optimizedJson,
                analysis: analysis
            });
        } catch (e) {
            console.error("[Optimize] Parse Error:", e);
            return NextResponse.json({ success: false, error: "AI returned an invalid format." }, { status: 500 });
        }


    } catch (e: unknown) {
        console.error("Error optimizing resume:", e);
        return NextResponse.json({
            success: false,
            error: e instanceof Error ? e.message : 'Internal Server Error'
        }, { status: 500 });
    }
}
