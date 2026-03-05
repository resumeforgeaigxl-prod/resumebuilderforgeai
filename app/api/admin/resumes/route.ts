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
        const { data: resumes, error } = await admin
            .from('resumes')
            .select(`
                id, title, created_at, updated_at,
                user_id,
                users ( email ),
                resume_analysis ( keyword_score )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Flatten data structure easily for frontend table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = resumes.map((r: any) => ({
            id: r.id,
            title: r.title,
            created_at: r.created_at,
            updated_at: r.updated_at,
            user_email: (Array.isArray(r.users) ? r.users[0]?.email : r.users?.email) || 'Unknown',
            ats_score: Array.isArray(r.resume_analysis) ? r.resume_analysis[0]?.keyword_score ?? null : null
        }));

        return NextResponse.json({ success: true, resumes: formatted });
    } catch (error: unknown) {
        const e = error as Error;
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
