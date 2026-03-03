import { NextResponse } from 'next/server';
import { generateAIResponse, logAIUsage } from '@/lib/ai-provider';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { resumeData, jobDescription, roleTitle, companyName, options } = await req.json();

        if (!resumeData || !jobDescription || !roleTitle) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { isFormal, isConcise, isDetailed } = options || {};

        let wordCountTarget = "300–400";
        if (isConcise) wordCountTarget = "approximately 250";
        if (isDetailed) wordCountTarget = "approximately 450";

        const currentDate = new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });

        const systemPrompt = `You are a professional career coach and expert cover letter writer. 
        Your goal is to generate a highly structured, JD-aligned, and professional cover letter based ONLY on the candidate's actual experience.
        
        STRUCTURE REQUIREMENTS:
        1. HEADER: 
           - Candidate Full Name
           - Email | Phone | LinkedIn (if present)
           - Current Date: ${currentDate}
        
        2. RECIPIENT:
           - To: Hiring Manager
           - ${companyName || 'The Company Name'}
        
        3. SUBJECT:
           - Subject: Application for ${roleTitle}
        
        4. GREETING:
           - Dear Hiring Manager,
        
        5. BODY (3-4 Paragraphs):
           - P1: Role interest and high-level alignment with JD.
           - P2: Specific technical skills and project highlights matching the role requirements.
           - P3: Experience/Project impact with metrics (if available in JSON).
           - P4: Soft skills and excitement about ${companyName || 'the company'}'s goals.
        
        6. CLOSING:
           - Thank you for your time and consideration.
           - Sincerely,
           - [Candidate Full Name]
           - [Candidate Phone]
           - [Candidate Email]

        RULES:
        - Use ONLY data from the provided resume JSON. Do not fabricate experience.
        - Word count: Aim for ${wordCountTarget} words for the body.
        - Tone: ${isFormal ? 'Strictly formal and executive' : 'Professional and modern'}.
        - Formatting: PLAIN TEXT ONLY. No markdown, no bolding, no emojis.
        `;

        const userPrompt = `
        ROLE: ${roleTitle}
        COMPANY: ${companyName || 'the company'}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        CANDIDATE RESUME DATA:
        ${JSON.stringify(resumeData, null, 2)}
        `;

        const startTime = Date.now();
        const aiResult = await generateAIResponse(userPrompt, undefined, systemPrompt);
        const endTime = Date.now();

        const supabase = createClient();
        await logAIUsage(supabase, session.userId, null, aiResult, endTime - startTime);

        return NextResponse.json({
            success: true,
            content: aiResult.text
        });

    } catch (error: unknown) {
        console.error('[API] Cover Letter Gen Error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to generate cover letter'
        }, { status: 500 });
    }
}
