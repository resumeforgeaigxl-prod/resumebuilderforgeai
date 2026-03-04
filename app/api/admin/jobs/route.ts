export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth/jwt';

// Use service role to allow cross-table join (RLS bypass)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [totalRes, mncRes, appsRes, viewsRes, recentAppsRes] = await Promise.all([
            supabaseAdmin.from('jobs').select('id', { count: 'exact', head: true }),
            supabaseAdmin.from('jobs').select('id', { count: 'exact', head: true }).eq('is_mnc', true),
            supabaseAdmin.from('job_applications').select('id', { count: 'exact', head: true }),
            supabaseAdmin.from('job_views').select('id', { count: 'exact', head: true }),
            // JOIN with users table to get email and full_name
            supabaseAdmin
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
                .limit(30)
        ]);

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
            recentApplications
        });

    } catch (error: unknown) {
        console.error('[Admin Jobs] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
