import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = createAdminClient();
        const { data: adminUser } = await admin.from('users').select('role').eq('id', session.userId).single();

        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { data: scores, error } = await admin
            .from('interview_scores')
            .select(`
                *,
                users ( email, full_name )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = (scores || []).map((s: any) => ({
            ...s,
            user_email: s.users?.email || 'Unknown',
            user_name: s.users?.full_name || 'Anonymous'
        }));

        return NextResponse.json({ success: true, scores: formatted });
    } catch (err) {
        console.error('[GET /api/admin/interview-intel]', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
