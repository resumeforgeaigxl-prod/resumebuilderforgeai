import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient as createAdminClient } from '@supabase/supabase-js';

/**
 * Fetch job listings with optional section filtering.
 * ?section=mnc | remote | latest | fresher (default: latest)
 *
 * Enforces visibility limits based on user subscription plan:
 * - FREE:    max 30 jobs per section (rest returned as locked)
 * - PREMIUM: max 80 jobs per section
 * - CAREER:  unlimited
 */

const PLAN_LIMITS: Record<string, number> = {
    free: 30,
    premium: 80,
    career: Infinity,
    pro: 80,       // legacy 'pro' → treat as premium
    admin: Infinity,
};

function getPlanLimit(plan: string | null | undefined): number {
    if (!plan) return PLAN_LIMITS.free;
    return PLAN_LIMITS[plan.toLowerCase()] ?? PLAN_LIMITS.free;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const section = searchParams.get('section') || 'latest';

        const supabase = createClient();

        // ── 1. Determine user plan ───────────────────────────────────────────
        let userPlan: string = 'free';

        const session = await getSession();
        if (session?.userId) {
            // Admin shortcut
            if (session.role === 'admin') {
                userPlan = 'admin';
            } else {
                // Fetch plan from DB (service-role so RLS doesn't block)
                const supabaseAdmin = createAdminClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                );

                // Check user row first
                const { data: userRow } = await supabaseAdmin
                    .from('users')
                    .select('plan, plan_type, role, free_unlimited, is_free_override, access_expires_at')
                    .eq('id', session.userId)
                    .single();

                if (userRow) {
                    const now = new Date();
                    const expired = userRow.access_expires_at
                        ? new Date(userRow.access_expires_at) < now
                        : false;

                    if (userRow.role === 'admin') {
                        userPlan = 'admin';
                    } else if (userRow.free_unlimited || userRow.is_free_override) {
                        userPlan = 'premium';
                    } else if (userRow.plan_type && !expired) {
                        // plan_type = 'premium' | 'career' | 'pro'
                        userPlan = userRow.plan_type;
                    } else if (userRow.plan && userRow.plan !== 'free' && !expired) {
                        userPlan = userRow.plan;
                    } else {
                        // Fall back to subscriptions table
                        const { data: sub } = await supabaseAdmin
                            .from('subscriptions')
                            .select('plan')
                            .eq('user_id', session.userId)
                            .eq('status', 'active')
                            .or(`expires_at.is.null,expires_at.gt.${now.toISOString()}`)
                            .limit(1)
                            .single();

                        if (sub?.plan) userPlan = sub.plan;
                    }
                }
            }
        }

        const limit = getPlanLimit(userPlan);

        // ── 2. Fetch ALL jobs for this section (up to 200 from DB) ──────────
        let query = supabase
            .from('jobs')
            .select('*')
            .order('posted_at', { ascending: false })
            .limit(200); // always fetch all available

        switch (section) {
            case 'mnc':
                query = query.eq('is_mnc', true);
                break;
            case 'remote':
                query = query.ilike('location', '%remote%');
                break;
            case 'fresher':
                query = query.eq('level', 'fresher');
                break;
            // 'latest' — no additional filter
        }

        const { data, error } = await query;

        if (error) {
            console.error('[API] Jobs List Error:', error);
            return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
        }

        const allJobs = data || [];
        const totalJobs = allJobs.length;

        // ── 3. Apply plan-based limits ──────────────────────────────────────
        let visibleJobs = allJobs;
        let lockedJobs: typeof allJobs = [];

        if (limit !== Infinity && totalJobs > limit) {
            visibleJobs = allJobs.slice(0, limit);
            // Return locked job stubs (no description/apply_url for security)
            lockedJobs = allJobs.slice(limit).map(job => ({
                id: job.id,
                title: job.title,
                company: job.company,
                location: job.location,
                is_mnc: job.is_mnc,
                level: job.level,
                source: job.source,
                employment_type: job.employment_type,
                posted_at: job.posted_at,
                // Sensitive fields stripped for locked jobs
                description: null,
                apply_url: null,
                locked: true,
            }));
        }

        return NextResponse.json({
            success: true,
            jobs: visibleJobs,
            lockedJobs,
            totalJobs,
            visibleCount: visibleJobs.length,
            lockedCount: lockedJobs.length,
            userPlan,
            planLimit: limit === Infinity ? null : limit,
        });

    } catch (error: unknown) {
        console.error('[API] Jobs List Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
