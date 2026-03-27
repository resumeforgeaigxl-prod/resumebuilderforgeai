import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient as createAdminClient } from '@supabase/supabase-js';


export const dynamic = 'force-dynamic';

const PLAN_LIMITS: Record<string, number> = {
    free: 5,         // New Forge Ecosystem limit: 5 free jobs
    premium: 100,
    career: Infinity,
    pro: 100,
    admin: Infinity,
};


function getPlanLimit(plan: string | null | undefined): number {
    if (!plan) return PLAN_LIMITS.free;
    return PLAN_LIMITS[plan.toLowerCase()] ?? PLAN_LIMITS.free;
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        // --- 1. Detect User Location (Headers) ---
        const userCountryHeader = req.headers.get('x-vercel-ip-country')?.toUpperCase();
        let defaultCountryFilter = null;
        if (userCountryHeader === 'IN') defaultCountryFilter = 'India';
        else if (userCountryHeader === 'US') defaultCountryFilter = 'United States';

        // --- 2. Extract Filters ---
        const search = searchParams.get('search');
        const location = searchParams.get('location'); // Specific city or country
        const remote = searchParams.get('remote') === 'true';

        // Support both 'experience' and legacy 'type' param
        const experienceParam = searchParams.get('experience');
        const typeParam = searchParams.get('type');
        const level = experienceParam || typeParam;

        const jobType = searchParams.get('job_type'); // Full-time, Contract, etc.
        const country = searchParams.get('country') || defaultCountryFilter;
        const tier = searchParams.get('tier'); // 1, 2, 3, 4
        const companyParam = searchParams.get('company');

        const page = parseInt(searchParams.get('page') || '1');
        const limitParam = parseInt(searchParams.get('limit') || '20');

        const supabase = createClient();

        // ── 3. Determine user plan & limits ───────────────────────────────────
        let userPlan: string = 'free';
        const session = await getSession();

        if (session?.userId) {
            const supabaseAdmin = createAdminClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            const { data: userRow } = await supabaseAdmin
                .from('users')
                .select('plan_type, role')
                .eq('id', session.userId)
                .single();

            if (userRow) {
                userPlan = userRow.role === 'admin' ? 'admin' : (userRow.plan_type || 'free');
            }
        }

        const planLimit = getPlanLimit(userPlan);

        // ── 4. Build Query ──────────────────────────────────────────────────
        let query = supabase
            .from('jobs')
            .select('*', { count: 'exact' });

        // Apply Filters
        if (search) {
            query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%`);
        }

        if (companyParam) {
            query = query.ilike('company', `%${companyParam}%`);
        }

        if (remote) {
            query = query.ilike('location', '%remote%');
        }

        if (tier) {
            query = query.eq('tier', parseInt(tier));
        }

        // Priority: If country is explicitly set, use it.
        // Otherwise try to infer country from location name (usa, india).
        // Otherwise filter by location text.
        if (country) {
            query = query.eq('country', country);
        } else if (location) {
            const locLower = location.toLowerCase();
            if (locLower === 'usa' || locLower === 'us') {
                query = query.eq('country', 'United States');
            } else if (locLower === 'india' || locLower === 'in') {
                query = query.eq('country', 'India');
            } else {
                query = query.ilike('location', `%${location}%`);
            }
        }

        // Handle level/job_type overlap
        if (level === 'fresher' && jobType === 'Internship') {
            query = query.eq('level', 'intern');
        } else {
            if (level) query = query.eq('level', level);
            if (jobType) query = query.eq('job_type', jobType);
        }

        // Pagination
        const from = (page - 1) * limitParam;
        const to = from + limitParam - 1;

        const { data: allJobs, error, count } = await query
            .order('created_at', { ascending: false })
            .order('priority_score', { ascending: false })
            .range(from, to);

        if (error) throw error;

        const totalMatching = count || 0;

        // Apply plan-based locking
        const jobs = (allJobs || []).map((job, idx) => {
            const globalIndex = from + idx;
            const isLocked = globalIndex >= planLimit;

            if (isLocked) {
                return {
                    id: job.id,
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    country: job.country,
                    job_type: job.job_type,
                    salary: 'Locked',
                    level: job.level,
                    source: job.source,
                    created_at: job.created_at,
                    description: null,
                    apply_url: null,
                    locked: true,
                };
            }
            return job;
        });

        const response = NextResponse.json({
            success: true,
            jobs,
            totalJobs: totalMatching,
            page,
            totalPages: Math.ceil(totalMatching / limitParam),
            userCountry: userCountryHeader || 'Other',
            userPlan
        });

        // Add caching headers: 5 minutes for users, 1 hour for public/bots
        const cacheSeconds = session ? 300 : 3600;
        response.headers.set('Cache-Control', `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds / 2}`);

        return response;

    } catch (error: unknown) {
        console.error('[API] Jobs List Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
