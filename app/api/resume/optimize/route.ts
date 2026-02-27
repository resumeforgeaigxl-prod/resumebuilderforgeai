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
            You are an expert ATS (Applicant Tracking System) optimizer and resume writer.
            I will provide you with a candidate's current resume (in JSON format) and a Job Description.
            
            Your task is to:
            1. Analyze the Job Description for key skills, keywords, and requirements.
            2. Rewrite the bullet points in the "experience" and "projects" sections of the resume to better align with the Job Description.
            3. Naturally integrate missing relevant keywords into the bullet points or the "skills" array.
            4. Improve the "summary" to be highly targeted towards the Job Description.
            
            CRITICAL RULES:
            1. DO NOT fabricate or invent any experience, qualifications, or past employers.
            2. Return ONLY valid JSON, exactly matching the schema of the provided resume.
            3. Do not include markdown formatting (like \`\`\`json).
            4. Do not include any explanations or conversational text.
            
            CURRENT RESUME JSON:
            ${JSON.stringify(resumeData, null, 2)}
            
            JOB DESCRIPTION:
            ${jobDescription}
        `;

        const aiOutput = await generateAIResponse(prompt);
        let optimizedJson;

        try {
            // Attempt to parse. Often AI might still inject markdown backticks
            const cleanedOutput = aiOutput.replace(/```json/g, '').replace(/```/g, '').trim();
            optimizedJson = JSON.parse(cleanedOutput);
            console.log("Successfully optimized resume JSON from Gemini.");
        } catch (error) {
            console.error("Failed to parse optimized AI output as JSON on first try:", error);
            console.error("Raw AI Output:", aiOutput);

            // The generated AI response utility already handles 1 retry natively,
            // but if it still fails here after removing backticks, we throw.
            throw new Error("Failed to parse strictly valid JSON from the AI provider.");
        }

        return NextResponse.json({ success: true, optimizedData: optimizedJson });

    } catch (e) {
        console.error("Error optimizing resume:", e);
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Internal Server Error' }, { status: 500 });
    }
}
