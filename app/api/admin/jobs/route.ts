export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const admin = createAdminClient();
        const [totalRes, mncRes, appsRes, viewsRes, recentAppsRes, recentJobsRes] = await Promise.all([
            admin.from('jobs').select('id', { count: 'exact', head: true }),
            admin.from('jobs').select('id', { count: 'exact', head: true }).eq('is_mnc', true),
            admin.from('job_applications').select('id', { count: 'exact', head: true }),
            admin.from('job_views').select('id', { count: 'exact', head: true }),
            // JOIN with users table to get email and full_name
            admin
                .from('job_applications')
                .select(`
                    id,
                    user_id,
                    job_title,
                    company,
                    apply_url,
                    applied_at,
                    users ( email, full_name )
                `)
                .order('applied_at', { ascending: false })
                .limit(30),
            // Fetch recent jobs themselves to show ingestion status
            admin.from('jobs').select('id, title, company, created_at, source').order('created_at', { ascending: false }).limit(15)
        ]);

        const recentJobs = recentJobsRes.data || [];

        // Flatten user info into each application row
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recentApplications = (recentAppsRes.data || []).map((app: any) => {
            const userObj = Array.isArray(app.users) ? app.users[0] : app.users;
            return {
                id: app.id,
                user_id: app.user_id,
                user_email: userObj?.email || null,
                user_name: userObj?.full_name || null,
                job_title: app.job_title,
                company: app.company,
                apply_url: app.apply_url,
                applied_at: app.applied_at
            };
        });

        return NextResponse.json({
            success: true,
            total: totalRes.count ?? 0,
            mnc: mncRes.count ?? 0,
            applications: appsRes.count ?? 0,
            views: viewsRes.count ?? 0,
            recentApplications,
            recentJobs
        });

    } catch (error: unknown) {
        console.error('[Admin Jobs] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
