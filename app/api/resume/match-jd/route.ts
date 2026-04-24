export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';
import { generateAIResponse, logAIUsage } from '@/lib/ai-provider';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { resumeId, resumeData, jdText } = body;

        if (!resumeId || !resumeData || !jdText || jdText.trim().length < 50) {
            return NextResponse.json({ error: 'Resume ID, Data, and JD text (>50 chars) required' }, { status: 400 });
        }

        const supabase = createClient();

        // Ensure owner
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: ownership } = await (supabase as any)
            .from('resumes')
            .select('id')
            .eq('id', resumeId)
            .eq('user_id', session.userId)
            .single();

        if (!ownership) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });

        // AI Matcher
        const startTime = Date.now();
        const prompt = `You are an expert ATS (Applicant Tracking System).
Analyze this Job Description and this candidate's Resume.
Identify the hard skills, soft skills, and keywords required in the JD.
Compare them against the Resume.

Return ONLY a JSON object exactly matching this schema:
{
  "match_percentage": 0-100,
  "missing_keywords": ["keyword1", "keyword2", "keyword3"],
  "present_keywords": ["keyword4", "keyword5"]
}

Do NOT include markdown wrapping or any other text.
Job Description:
${jdText.slice(0, 3000)}

Resume Data:
${JSON.stringify(resumeData).slice(0, 3000)}`;

        const aiResult = await generateAIResponse(prompt);
        const aiResponse = aiResult.text;
        const endTime = Date.now();
        await logAIUsage(supabase, session.userId, null, aiResult, endTime - startTime);

        let parsedResult;
        try {
            parsedResult = JSON.parse(aiResponse.replace(/```json/g, '').replace(/```/g, '').trim());
            // Cap at top 10 missing to prevent UI bloat
            if (Array.isArray(parsedResult.missing_keywords)) {
                parsedResult.missing_keywords = parsedResult.missing_keywords.slice(0, 10);
            }
        } catch {
            return NextResponse.json({ error: 'AI parsing failed' }, { status: 500 });
        }

        // Store analysis
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: analysis, error } = await (supabase as any)
            .from('jd_analysis')
            .insert({
                resume_id: resumeId,
                jd_text: jdText.trim(),
                match_percentage: parsedResult.match_percentage || 0,
                missing_keywords: parsedResult.missing_keywords || []
            })
            .select()
            .single();

        if (error) {
            console.error('[JD Matcher] Insert Error:', error);
            // Non-fatal, return results anyway
        }

        return NextResponse.json({
            success: true,
            analysis: parsedResult,
            savedId: analysis?.id
        });

    } catch (e) {
        console.error('[JD Matcher]', e);
        return NextResponse.json({ error: 'Internal JD matching error' }, { status: 500 });
    }
}



