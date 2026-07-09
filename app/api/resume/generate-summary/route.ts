export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { generateAIResponse, logAIUsage, stripMarkdown } from '@/lib/ai-provider';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { checkDailyLimit, logUsage } from '@/lib/usage';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Daily Limit Check
        const limitStatus = await checkDailyLimit(session.userId, 'ai_enhance');
        if (!limitStatus.allowed) {
            return NextResponse.json(
                {
                    error: `Daily limit reached (${limitStatus.used}/${limitStatus.limit} credits used). Upgrade to Pro for unlimited summary generations.`,
                    requiresUpgrade: true
                },
                { status: 429 }
            );
        }

        const body = await request.json();
        let { role, skills, experienceText, educationText, projectsText, jobDescription } = body;

        // Auto-fetch profile data from DB as fallback
        try {
            const supabaseForProfile = createClient();
            const { data: userProfile } = await supabaseForProfile
                .from('users')
                .select('target_role, skills, professional_summary, experience_level')
                .eq('id', session.userId)
                .single();

            if (userProfile) {
                if (!role && userProfile.target_role) role = userProfile.target_role;
                if (!skills && Array.isArray(userProfile.skills) && userProfile.skills.length > 0) {
                    skills = userProfile.skills.join(', ');
                }
                if (!experienceText && userProfile.experience_level) {
                    experienceText = `Experience Level: ${userProfile.experience_level}`;
                }
            }
        } catch (profileErr) {
            // Safe to ignore — frontend params will be used
        }

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
        
        // Log credit consumption
        await logUsage(session.userId, 'ai_enhance');

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



