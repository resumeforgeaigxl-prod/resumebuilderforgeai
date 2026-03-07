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

        // 1. Fetch Standard Resumes
        const { data: resumes, error: resError } = await admin
            .from('resumes')
            .select(`
                id, title, created_at, updated_at,
                user_id,
                users ( email ),
                resume_analysis ( keyword_score )
            `)
            .order('created_at', { ascending: false });

        if (resError) throw resError;

        // 2. Fetch Optimized Resumes
        const { data: optimized, error: optError } = await admin
            .from('optimized_resumes')
            .select(`
                id, created_at,
                user_id,
                match_score,
                users ( email ),
                resumes ( title )
            `)
            .order('created_at', { ascending: false });

        if (optError) throw optError;

        // 3. Format Standard Resumes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedResumes = (resumes || []).map((r: any) => ({
            id: r.id,
            title: r.title || 'Untitled Resume',
            created_at: r.created_at,
            updated_at: r.updated_at,
            user_email: (Array.isArray(r.users) ? r.users[0]?.email : r.users?.email) || 'Unknown',
            ats_score: Array.isArray(r.resume_analysis) ? r.resume_analysis[0]?.keyword_score ?? null : null,
            type: 'standard'
        }));

        // 4. Format Optimized Resumes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedOptimized = (optimized || []).map((r: any) => ({
            id: r.id,
            title: `Optimized: ${r.resumes?.title || 'Unknown Base'}`,
            created_at: r.created_at,
            updated_at: r.created_at, // optimized resumes don't have an updated_at column
            user_email: (Array.isArray(r.users) ? r.users[0]?.email : r.users?.email) || 'Unknown',
            ats_score: r.match_score || null,
            type: 'optimized'
        }));

        // 5. Combine and Sort by Updated At
        const combined = [...formattedResumes, ...formattedOptimized].sort((a, b) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );

        return NextResponse.json({ success: true, resumes: combined });
    } catch (error: unknown) {
        const e = error as Error;
        console.error("[Admin Resumes] Fetch Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
