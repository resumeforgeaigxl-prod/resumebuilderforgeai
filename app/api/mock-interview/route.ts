import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createAdminClient } from '@/lib/supabase/admin';

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
            .select('id, plan_type, daily_mock_limit, plan_end')
            .eq('id', session.userId)
            .single();

        if (userError || !userData) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Count interviews used today
        const today = new Date().toISOString().split('T')[0];
        const { count, error: countError } = await admin
            .from('mock_interviews')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', session.userId)
            .gte('created_at', today);

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
        const limit = planLimits[userPlan as keyof typeof planLimits] || 3;
        const used = count || 0;

        return NextResponse.json({
            success: true,
            user: {
                id: userData.id,
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
