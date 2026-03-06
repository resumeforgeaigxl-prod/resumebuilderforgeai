import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface InterviewData {
    id: string;
    role: string;
    job_description: string;
    experience_level: string;
    interview_type: string;
    num_questions: number;
    questions: string[];
    answers: string[];
    scores: Array<{ score: number; feedback: string; tips: string }>;
    final_score: number;
    created_at: string;
    user_id: string;
    users: { email: string; full_name: string } | { email: string; full_name: string }[];
}

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient();
    const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
    if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const admin = createAdminClient();
        const { data: interviews, error } = await admin
            .from('mock_interviews')
            .select(`
                id, role, job_description, experience_level, interview_type,
                num_questions, questions, answers, scores, final_score, created_at,
                user_id,
                users ( email, full_name )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = interviews.map((interview: InterviewData) => ({
            id: interview.id,
            role: interview.role,
            job_description: interview.job_description,
            experience_level: interview.experience_level,
            interview_type: interview.interview_type,
            num_questions: interview.num_questions,
            questions: interview.questions,
            answers: interview.answers,
            scores: interview.scores,
            final_score: interview.final_score,
            created_at: interview.created_at,
            user_email: (Array.isArray(interview.users) ? interview.users[0]?.email : interview.users?.email) || 'Unknown',
            user_name: (Array.isArray(interview.users) ? interview.users[0]?.full_name : interview.users?.full_name) || 'Unknown'
        }));

        // Calculate metrics
        const totalInterviews = interviews.length;
        const today = new Date().toISOString().split('T')[0];
        const interviewsToday = interviews.filter((i: InterviewData) => i.created_at.startsWith(today)).length;

        const scores = interviews.filter((i: InterviewData) => i.final_score).map((i: InterviewData) => i.final_score);
        const averageScore = scores.length > 0 ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1) : '0';

        // Most popular role
        const roleCounts = interviews.reduce((acc: Record<string, number>, interview: InterviewData) => {
            acc[interview.role] = (acc[interview.role] || 0) + 1;
            return acc;
        }, {});
        const mostPopularRole = Object.entries(roleCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'None';

        return NextResponse.json({
            success: true,
            interviews: formatted,
            metrics: {
                totalInterviews,
                interviewsToday,
                averageScore,
                mostPopularRole
            }
        });
    } catch (error: unknown) {
        const e = error as Error;
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createClient();
    const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
    if (!adminUser || adminUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: 'Interview ID required' }, { status: 400 });

        const admin = createAdminClient();
        const { error } = await admin
            .from('mock_interviews')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const e = error as Error;
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}