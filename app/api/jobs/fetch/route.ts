import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// ─── Supabase Admin (Service Role — bypasses RLS) ─────────────────────────────
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── MNC Company List ─────────────────────────────────────────────────────────
const MNC_LIST = [
    'amazon', 'ibm', 'deloitte', 'cognizant', 'infosys',
    'tcs', 'wipro', 'accenture', 'microsoft', 'google', 'capgemini',
    'oracle', 'meta', 'apple', 'adobe', 'salesforce', 'sap',
    'flipkart', 'phonepe', 'swiggy', 'zomato'
];

// Keywords that mark a job as fresher/intern level
const FRESHER_KEYWORDS = ['intern', 'internship', 'fresher', 'junior', 'entry level', 'entry-level', 'trainee', 'graduate'];

function isMNC(company: string): boolean {
    const lower = (company || '').toLowerCase();
    return MNC_LIST.some(m => lower.includes(m));
}

function classifyLevel(title: string): 'fresher' | 'experienced' {
    const lower = (title || '').toLowerCase();
    return FRESHER_KEYWORDS.some(k => lower.includes(k)) ? 'fresher' : 'experienced';
}

// ─── Normalised Shape ─────────────────────────────────────────────────────────
interface NormalisedJob {
    external_id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    apply_url: string;
    employment_type: string;
    posted_at: string;
    source: string;
    is_mnc: boolean;
    level: 'fresher' | 'experienced';
}

// ─── API 1: JSearch (RapidAPI) ────────────────────────────────────────────────
async function fetchJSearch(apiKey: string): Promise<NormalisedJob[]> {
    // Targeted queries: general tech + fresher/intern specific
    const queries = [
        'software developer intern fresher entry level india',
        'backend developer junior india',
        'full stack developer fresher india',
        'software engineer intern india remote'
    ];
    const results: NormalisedJob[] = [];

    for (const q of queries) {
        try {
            const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(q)}&page=1&num_pages=1&date_posted=month`;
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
                },
                next: { revalidate: 0 }
            });

            if (!res.ok) {
                console.warn(`[JSearch] Non-OK for query "${q}": ${res.status}`);
                continue;
            }

            const data = await res.json();
            const jobs: Record<string, unknown>[] = data?.data || [];

            for (const j of jobs) {
                const company = (j.employer_name as string) || '';
                const title = (j.job_title as string) || '';
                const location = (j.job_city && j.job_country)
                    ? `${j.job_city as string}, ${j.job_country as string}`
                    : (j.job_is_remote ? 'Remote' : 'India');

                results.push({
                    external_id: `jsearch_${j.job_id as string}`,
                    title,
                    company,
                    location,
                    description: ((j.job_description as string) || '').slice(0, 500),
                    apply_url: (j.job_apply_link as string) || '',
                    employment_type: (j.job_employment_type as string) || 'FULLTIME',
                    posted_at: j.job_posted_at_datetime_utc
                        ? new Date(j.job_posted_at_datetime_utc as string).toISOString()
                        : new Date().toISOString(),
                    source: 'JSearch',
                    is_mnc: isMNC(company),
                    level: classifyLevel(title)
                });
            }
        } catch (err) {
            console.warn(`[JSearch] Error for query "${q}":`, err);
        }
    }

    return results;
}

// ─── API 2: Adzuna ────────────────────────────────────────────────────────────
async function fetchAdzuna(appId: string, appKey: string): Promise<NormalisedJob[]> {
    // Targeted queries for fresher + general tech roles
    const queries = [
        { what: 'intern OR fresher OR junior developer', maxDays: 7 },
        { what: 'software engineer entry level', maxDays: 14 },
        { what: 'backend developer freshers', maxDays: 14 }
    ];
    const results: NormalisedJob[] = [];

    for (const q of queries) {
        try {
            const url = [
                `https://api.adzuna.com/v1/api/jobs/in/search/1`,
                `?app_id=${appId}`,
                `&app_key=${appKey}`,
                `&what=${encodeURIComponent(q.what)}`,
                `&results_per_page=20`,
                `&max_days_old=${q.maxDays}`,
                `&content-type=application/json`
            ].join('');

            const res = await fetch(url, { next: { revalidate: 0 } });

            if (!res.ok) {
                console.warn(`[Adzuna] Non-OK for query "${q.what}": ${res.status}`);
                continue;
            }

            const data = await res.json();
            const jobs: Record<string, unknown>[] = data?.results || [];

            for (const j of jobs) {
                const companyObj = j.company as Record<string, unknown>;
                const locationObj = j.location as Record<string, unknown>;
                const company = (companyObj?.display_name as string) || 'Unknown';
                const title = (j.title as string) || '';
                const location = (locationObj?.display_name as string) || 'India';

                results.push({
                    external_id: `adzuna_${j.id as string}`,
                    title,
                    company,
                    location,
                    description: ((j.description as string) || '').slice(0, 500),
                    apply_url: (j.redirect_url as string) || '',
                    employment_type: j.contract_type === 'permanent' ? 'FULLTIME' : ((j.contract_type as string) || 'FULLTIME'),
                    posted_at: j.created
                        ? new Date(j.created as string).toISOString()
                        : new Date().toISOString(),
                    source: 'Adzuna',
                    is_mnc: isMNC(company),
                    level: classifyLevel(title)
                });
            }
        } catch (err) {
            console.warn(`[Adzuna] Error for query "${q.what}":`, err);
        }
    }

    return results;
}

// ─── Deduplication (by apply_url, then title+company) ────────────────────────
function deduplicate(jobs: NormalisedJob[]): NormalisedJob[] {
    const seenUrls = new Set<string>();
    const seenTitleCompany = new Set<string>();

    return jobs.filter(job => {
        // Must have title and apply_url to be valid
        if (!job.title || !job.apply_url) return false;

        const urlKey = job.apply_url.trim().toLowerCase();
        if (seenUrls.has(urlKey)) return false;
        seenUrls.add(urlKey);

        const titleKey = `${job.title.toLowerCase()}__${job.company.toLowerCase()}`;
        if (seenTitleCompany.has(titleKey)) return false;
        seenTitleCompany.add(titleKey);

        return true;
    });
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export async function GET(req: Request) {
    try {
        // Protect in production — allow Vercel Cron or CRON_SECRET bearer
        const authHeader = req.headers.get('authorization');
        if (
            process.env.NODE_ENV === 'production' &&
            process.env.CRON_SECRET &&
            authHeader !== `Bearer ${process.env.CRON_SECRET}`
        ) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rapidKey = process.env.RAPIDAPI_KEY;
        const adzunaId = process.env.ADZUNA_APP_ID;
        const adzunaKey = process.env.ADZUNA_API_KEY;

        // Run APIs in parallel for speed
        const [jsearchResult, adzunaResult] = await Promise.allSettled([
            rapidKey ? fetchJSearch(rapidKey) : Promise.resolve<NormalisedJob[]>([]),
            adzunaId && adzunaKey ? fetchAdzuna(adzunaId, adzunaKey) : Promise.resolve<NormalisedJob[]>([])
        ]);

        const jsearchJobs = jsearchResult.status === 'fulfilled' ? jsearchResult.value : [];
        const adzunaJobs = adzunaResult.status === 'fulfilled' ? adzunaResult.value : [];

        const raw = [...jsearchJobs, ...adzunaJobs];
        const deduped = deduplicate(raw);

        const fresherCount = deduped.filter(j => j.level === 'fresher').length;
        const experiencedCount = deduped.filter(j => j.level === 'experienced').length;

        if (deduped.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No new jobs to insert. Check API keys.',
                fetched: 0,
                inserted: 0
            });
        }

        // Upsert — skip duplicates via external_id conflict
        // `level` field will be updated if job was re-fetched with better classification
        const { data, error } = await supabaseAdmin
            .from('jobs')
            .upsert(deduped, { onConflict: 'external_id', ignoreDuplicates: false })
            .select('id');

        if (error) {
            console.error('[API] Supabase upsert error:', error);
            return NextResponse.json({ error: 'DB upsert failed', detail: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            fetched: raw.length,
            afterDedup: deduped.length,
            inserted: data?.length || 0,
            breakdown: {
                jsearch: jsearchJobs.length,
                adzuna: adzunaJobs.length,
                fresher: fresherCount,
                experienced: experiencedCount
            }
        });

    } catch (error: unknown) {
        console.error('[API] Job fetch handler error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
