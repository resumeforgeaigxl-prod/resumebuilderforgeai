import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

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
        const { data: tests, error } = await admin
            .from('mock_tests')
            .select(`
                id, company_name, job_title, total_questions, created_at,
                user_id,
                users ( email )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = tests.map((t: any) => ({
            id: t.id,
            company_name: t.company_name,
            job_title: t.job_title,
            total_questions: t.total_questions,
            created_at: t.created_at,
            user_email: (Array.isArray(t.users) ? t.users[0]?.email : t.users?.email) || 'Unknown'
        }));

        return NextResponse.json({ success: true, tests: formatted });
    } catch (error: unknown) {
        const e = error as Error;
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
