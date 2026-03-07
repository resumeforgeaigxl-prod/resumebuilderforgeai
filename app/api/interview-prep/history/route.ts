import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const admin = createAdminClient();

        const [historyRes, calendarRes] = await Promise.all([
            admin
                .from('mock_interviews')
                .select('id, role, final_score, created_at, detailed_scores')
                .eq('user_id', session.userId)
                .order('created_at', { ascending: false })
                .limit(10),
            admin
                .from('interview_calendar')
                .select('*')
                .eq('user_id', session.userId)
                .gte('interview_date', new Date().toISOString().split('T')[0])
                .order('interview_date', { ascending: true })
        ]);

        return NextResponse.json({
            success: true,
            history: historyRes.data || [],
            calendar: calendarRes.data || []
        });
    } catch {
        return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { company, role, date, notes } = body;

        const admin = createAdminClient();
        const { data, error } = await admin.from('interview_calendar').insert({
            user_id: session.userId,
            company,
            role,
            interview_date: date,
            notes
        }).select().single();

        if (error) throw error;

        return NextResponse.json({ success: true, event: data });
    } catch {
        return NextResponse.json({ success: false, error: 'Failed to add event' }, { status: 500 });
    }
}
