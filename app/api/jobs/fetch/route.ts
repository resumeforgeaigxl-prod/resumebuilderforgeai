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
const FRESHER_KEYWORDS = ['fresher', 'junior', 'entry level', 'entry-level', 'trainee', 'graduate'];
const INTERN_KEYWORDS = ['intern', 'internship'];

function isMNC(company: string): boolean {
    const lower = (company || '').toLowerCase();
    return MNC_LIST.some(m => lower.includes(m));
}

function classifyLevel(title: string): 'fresher' | 'intern' | 'experienced' {
    const lower = (title || '').toLowerCase();
    if (INTERN_KEYWORDS.some(k => lower.includes(k))) return 'intern';
    if (FRESHER_KEYWORDS.some(k => lower.includes(k))) return 'fresher';
    return 'experienced';
}

// ─── Normalised Shape ─────────────────────────────────────────────────────────
interface NormalisedJob {
    external_id: string;
    title: string;
    company: string;
    location: string;
    country: string;
    job_type: string;
    salary: string;
    description: string;
    apply_url: string;
    employment_type: string;
    created_at: string;
    source: string;
    is_mnc: boolean;
    level: 'fresher' | 'intern' | 'experienced';
}

// ─── API 1: JSearch (RapidAPI) ────────────────────────────────────────────────
async function fetchJSearch(apiKey: string): Promise<NormalisedJob[]> {
    const regions = [
        { country: 'India', queries: ['software engineer fresher india', 'web developer intern india'] },
        { country: 'United States', queries: ['software engineer entry level usa', 'remote developer usa'] }
    ];
    const results: NormalisedJob[] = [];

    for (const region of regions) {
        for (const q of region.queries) {
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

                if (!res.ok) continue;

                const data = await res.json();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const jobs: any[] = data?.data || [];

                for (const j of jobs) {
                    const company = j.employer_name || 'Unknown';
                    const title = j.job_title || '';

                    let jobType = 'Full-time';
                    const empType = j.job_employment_type?.toUpperCase() || 'FULLTIME';
                    if (empType.includes('PARTTIME')) jobType = 'Part-time';
                    if (empType.includes('CONTRACTOR')) jobType = 'Contract';
                    if (empType.includes('INTERN')) jobType = 'Internship';

                    results.push({
                        external_id: `jsearch_${j.job_id}`,
                        title,
                        company,
                        location: j.job_is_remote ? 'Remote' : (j.job_city ? `${j.job_city}, ${j.job_country || region.country}` : region.country),
                        country: region.country,
                        job_type: jobType,
                        salary: j.job_salary_range || 'Competitive',
                        description: (j.job_description || '').slice(0, 1000),
                        apply_url: j.job_apply_link || '',
                        employment_type: empType,
                        created_at: j.job_posted_at_datetime_utc || new Date().toISOString(),
                        source: 'JSearch',
                        is_mnc: isMNC(company),
                        level: classifyLevel(title)
                    });
                }
            } catch (err) {
                console.warn(`[JSearch] Error:`, err);
            }
        }
    }
    return results;
}

// ─── API 2: Adzuna ────────────────────────────────────────────────────────────
async function fetchAdzuna(appId: string, appKey: string): Promise<NormalisedJob[]> {
    const queries = [
        { country: 'in', label: 'India', what: 'software engineer fresher' },
        { country: 'us', label: 'United States', what: 'software engineer entry level' }
    ];
    const results: NormalisedJob[] = [];

    for (const q of queries) {
        try {
            const url = `https://api.adzuna.com/v1/api/jobs/${q.country}/search/1?app_id=${appId}&app_key=${appKey}&what=${encodeURIComponent(q.what)}&results_per_page=20&content-type=application/json`;
            const res = await fetch(url, { next: { revalidate: 0 } });
            if (!res.ok) continue;

            const data = await res.json();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const jobs: any[] = data?.results || [];

            for (const j of jobs) {
                const company = j.company?.display_name || 'Unknown';
                const title = j.title || '';
                results.push({
                    external_id: `adzuna_${j.id}`,
                    title,
                    company,
                    location: j.location?.display_name || q.label,
                    country: q.label,
                    job_type: j.contract_type === 'permanent' ? 'Full-time' : 'Contract',
                    salary: j.salary_min ? `${j.salary_min} - ${j.salary_max || ''}` : 'Competitive',
                    description: (j.description || '').slice(0, 1000),
                    apply_url: j.redirect_url || '',
                    employment_type: j.contract_type === 'permanent' ? 'FULLTIME' : 'CONTRACT',
                    created_at: j.created || new Date().toISOString(),
                    source: 'Adzuna',
                    is_mnc: isMNC(company),
                    level: classifyLevel(title)
                });
            }
        } catch (err) {
            console.warn(`[Adzuna] Error:`, err);
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
        const internCount = deduped.filter(j => j.level === 'intern').length;
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
                intern: internCount,
                experienced: experiencedCount
            }
        });

    } catch (error: unknown) {
        console.error('[API] Job fetch handler error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
