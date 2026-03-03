import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient();

        const [totalRes, mncRes, appsRes, viewsRes, recentAppsRes] = await Promise.all([
            supabase.from('jobs').select('id', { count: 'exact', head: true }),
            supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('is_mnc', true),
            supabase.from('job_applications').select('id', { count: 'exact', head: true }),
            supabase.from('job_views').select('id', { count: 'exact', head: true }),
            supabase
                .from('job_applications')
                .select('id, user_id, job_title, company, apply_url, applied_at')
                .order('applied_at', { ascending: false })
                .limit(20)
        ]);

        return NextResponse.json({
            success: true,
            total: totalRes.count ?? 0,
            mnc: mncRes.count ?? 0,
            applications: appsRes.count ?? 0,
            views: viewsRes.count ?? 0,
            recentApplications: recentAppsRes.data || []
        });

    } catch (error: unknown) {
        console.error('[Admin Jobs] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
