import { NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/ai-provider';
import { ResumeData } from '@/types/resume';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const resumeData: ResumeData = body.resumeData;
        const jobDescription: string = body.jobDescription;

        if (!resumeData || !jobDescription) {
            return NextResponse.json({ error: 'Missing resume data or job description' }, { status: 400 });
        }

        const prompt = `
            You are an expert ATS (Applicant Tracking System) optimizer.
            Rewrite the following Resume JSON to align perfectly with the Job Description.
            
            STRICT OUTPUT RULES:
            1. Return ONLY the updated JSON. No markdown, no backticks, no text before or after.
            2. You MUST preserve the exact JSON structure provided.
            3. Rewrite "summary", "experience" bullet points, and "projects" descriptions to use high-impact keywords from the JD.
            4. If the candidate is missing skills mentioned in the JD that they reasonably possess based on their experience, add them to the "skills" array.
            5. Ensure all arrays ("experience", "projects", "skills", "education") are present and valid arrays in the output.
            
            CURRENT RESUME:
            ${JSON.stringify(resumeData)}
            
            JOB DESCRIPTION:
            ${jobDescription}
        `;

        const aiOutput = await generateAIResponse(prompt);
        let optimizedJson;

        try {
            // Clean AI Output from markdown artifacts
            const cleaned = aiOutput
                .replace(/^```json/i, '')
                .replace(/^```/i, '')
                .replace(/```$/i, '')
                .trim();

            optimizedJson = JSON.parse(cleaned);

            // Validation: Ensure core arrays exist to avoid client-side crashes
            const defaults = {
                experience: [],
                projects: [],
                education: [],
                skills: [],
                skillCategories: [],
                certifications: []
            };

            optimizedJson = { ...resumeData, ...optimizedJson, ...defaults };
            // Re-apply values from optimized if they are valid arrays
            if (Array.isArray(optimizedJson.experience)) optimizedJson.experience = optimizedJson.experience;
            if (Array.isArray(optimizedJson.projects)) optimizedJson.projects = optimizedJson.projects;

            console.log("[Optimize] Successfully validated AI output.");
        } catch {
            console.log("[Optimize] JSON Parse Error. Raw output:", aiOutput);
            throw new Error("AI returned an invalid JSON format. Please try again.");
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
