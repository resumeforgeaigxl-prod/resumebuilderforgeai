export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth/jwt';
import { sendJobAlertEmail } from '@/lib/brevo';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const isTest = searchParams.get('test') === 'true';
        const cronSecret = process.env.CRON_SECRET;
        const authHeader = req.headers.get('authorization');

        // Initialize Supabase Admin client to bypass RLS and read all tables
        const supabase = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        let targets: any[] = [];

        if (isTest) {
            // Test Mode: send test email only to currently logged in user
            const session = await getSession();
            if (!session?.userId) {
                return NextResponse.json({ error: 'Unauthorized: You must be logged in to trigger a test alert' }, { status: 401 });
            }

            // Get logged in user's email and details
            const { data: userRow } = await supabase
                .from('users')
                .select('email, full_name')
                .eq('id', session.userId)
                .single();

            if (!userRow) {
                return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
            }

            // Fetch user's job alert preferences
            const { data: alertPref } = await supabase
                .from('job_alerts')
                .select('*')
                .eq('user_id', session.userId)
                .single();

            if (!alertPref || !alertPref.is_active) {
                return NextResponse.json({ 
                    error: 'Job alerts are not active for your profile. Please enable the active toggle on the dashboard.' 
                }, { status: 400 });
            }

            targets = [{
                ...alertPref,
                email: userRow.email,
                full_name: userRow.full_name
            }];
            console.log(`[JobAlerts Dispatcher] Running in TEST mode for user: ${userRow.email}`);
        } else {
            // Production Cron Mode: Verify Authorization header or Cron Secret query parameter
            const token = authHeader?.split(' ')[1];
            const isAuthorized = token === cronSecret || searchParams.get('secret') === cronSecret;

            if (!isAuthorized) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            // Fetch all active subscribers
            const { data: activeAlerts, error: alertError } = await supabase
                .from('job_alerts')
                .select(`
                    *,
                    users ( email, full_name )
                `)
                .eq('is_active', true);

            if (alertError) throw alertError;

            targets = (activeAlerts || []).map((a: any) => ({
                ...a,
                email: a.users?.email,
                full_name: a.users?.full_name
            })).filter(t => t.email);

            console.log(`[JobAlerts Dispatcher] Running cron for ${targets.length} active subscribers`);
        }

        if (targets.length === 0) {
            return NextResponse.json({ success: true, message: 'No active subscribers found' });
        }

        // Fetch all jobs in the database to run match checking
        // Limit to 200 jobs to prevent memory overload in serverless
        const { data: allJobs, error: jobsError } = await supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);

        if (jobsError) throw jobsError;
        const jobsList = allJobs || [];

        const results: any[] = [];

        // Run matching logic for each target
        for (const target of targets) {
            const prefSkills: string[] = target.skills || [];
            const prefLocations: string[] = target.locations || [];

            // Match checking
            const matchedJobs = jobsList.filter(job => {
                // 1. Check locations match (case-insensitive)
                let locMatch = prefLocations.length === 0; // if preference is empty, match any location
                if (!locMatch && job.location) {
                    locMatch = prefLocations.some(prefLoc => 
                        job.location.toLowerCase().includes(prefLoc.toLowerCase()) ||
                        (job.country && job.country.toLowerCase().includes(prefLoc.toLowerCase()))
                    );
                }

                // 2. Check skills match (case-insensitive checks on title and description)
                let skillMatch = prefSkills.length === 0; // if preference is empty, match any skill
                if (!skillMatch) {
                    const textToSearch = `${job.title || ''} ${job.description || ''}`.toLowerCase();
                    skillMatch = prefSkills.some(prefSkill => 
                        textToSearch.includes(prefSkill.toLowerCase())
                    );
                }

                return locMatch && skillMatch;
            });

            // Limit to top 5 matches
            const topMatches = matchedJobs.slice(0, 5);

            // Fallback for test mode: if no matches, send the latest 3 jobs so the test works
            if (isTest && topMatches.length === 0 && jobsList.length > 0) {
                topMatches.push(...jobsList.slice(0, 3));
            }

            if (topMatches.length > 0) {
                console.log(`[JobAlerts Dispatcher] Sending ${topMatches.length} matches to ${target.email}`);
                await sendJobAlertEmail(target.email, target.full_name, topMatches);
                results.push({ email: target.email, matchesCount: topMatches.length, status: 'Sent' });
            } else {
                results.push({ email: target.email, matchesCount: 0, status: 'No matches found (skipped)' });
            }
        }

        return NextResponse.json({ 
            success: true, 
            mode: isTest ? 'test' : 'cron',
            processedCount: targets.length,
            results 
        });

    } catch (err: any) {
        console.error('[JobAlerts Dispatcher ERROR]', err);
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
    }
}
