import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateAIResponse, stripMarkdown } from '@/lib/ai-provider';

export const runtime = 'nodejs';

/**
 * GET /api/mock-interview/check-access
 * Checks if user is logged in and returns daily interview limits/usage.
 */
export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = createAdminClient();

        // 1. Fetch user plan details
        const { data: userData, error: userError } = await admin
            .from('users')
            .select('role, plan_type, daily_mock_limit, plan_end')
            .eq('id', session.userId)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Count interviews used today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count, error: countError } = await admin
            .from('mock_interviews')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', session.userId)
            .gte('created_at', today.toISOString());

        if (countError) {
            console.error('[MockInterview] Count error:', countError);
        }

        const planLimits = {
            free: 3,
            pro: 10,
            premium: 15,
            career: 999
        };

        const userPlan = userData.plan_type || 'free';
        // Use daily_mock_limit if set, otherwise fallback to plan defaults
        let limit = userData.daily_mock_limit || (planLimits[userPlan as keyof typeof planLimits] || 3);

        // Admins get unlimited access
        if (userData.role === 'admin') {
            limit = 9999;
        }

        const used = count || 0;

        return NextResponse.json({
            success: true,
            user: {
                id: session.userId,
                role: userData.role,
                plan_type: userPlan,
                interviewsUsed: used,
                interviewLimit: limit
            }
        });

    } catch (err) {
        console.error('[MockInterview] Access API Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/mock-interview/session
 * Creates or updates an interview session.
 */
export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { action, ...data } = body;
        const admin = createAdminClient();

        if (action === 'generate-questions') {
            const { role, jobDescription, experienceLevel, interviewType, numQuestions } = data;

            const prompt = `Generate ${numQuestions} interview questions for a ${experienceLevel} level ${interviewType} interview for the role: ${role}.

Job Description: ${jobDescription || 'Not provided'}

Questions should be relevant to the role and experience level. Return only a JSON array of question strings, no other text.

Example: ["Question 1", "Question 2", "Question 3"]`;

            const response = await generateAIResponse(prompt);
            const cleanText = stripMarkdown(response.text);
            let questions;

            try {
                questions = JSON.parse(cleanText);
            } catch (e) {
                console.error('Failed to parse questions:', e, cleanText);
                return NextResponse.json({ error: 'AI returned an invalid format' }, { status: 500 });
            }

            if (!Array.isArray(questions)) {
                return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
            }

            return NextResponse.json({ success: true, questions });
        }

        if (action === 'evaluate-answer') {
            const { question, answer } = data;

            const prompt = `Evaluate this interview answer on a scale of 0-10.

Question: ${question}
Answer: ${answer}

Return a JSON object with:
- score: number (0-10)
- feedback: string (brief feedback on the answer)
- tips: string (improvement suggestions)

Example: {"score": 7, "feedback": "Good explanation but could be more specific", "tips": "Add examples from your experience"}`;

            const response = await generateAIResponse(prompt);
            const cleanText = stripMarkdown(response.text);
            let evaluation;

            try {
                evaluation = JSON.parse(cleanText);
            } catch (e) {
                console.error('Failed to parse evaluation:', e, cleanText);
                return NextResponse.json({ error: 'AI returned an invalid evaluation' }, { status: 500 });
            }

            return NextResponse.json({ success: true, evaluation });
        }

        if (action === 'create') {
            const { role, jobDescription, experienceLevel, interviewType, numQuestions, questions } = data;

            const { data: interviewData, error: insertError } = await admin
                .from('mock_interviews')
                .insert({
                    user_id: session.userId,
                    role,
                    job_description: jobDescription,
                    experience_level: experienceLevel,
                    interview_type: interviewType,
                    num_questions: numQuestions,
                    questions
                })
                .select()
                .single();

            if (insertError) throw insertError;
            return NextResponse.json({ success: true, interview: interviewData });
        }

        if (action === 'update') {
            const { id, answers, scores, finalScore } = data;

            const updateData: Record<string, unknown> = {
                answers,
                scores
            };
            if (finalScore !== undefined) updateData.final_score = finalScore;

            const { error: updateError } = await admin
                .from('mock_interviews')
                .update(updateData)
                .eq('id', id)
                .eq('user_id', session.userId);

            if (updateError) throw updateError;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (err) {
        console.error('[MockInterview] Session API Error:', err);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
