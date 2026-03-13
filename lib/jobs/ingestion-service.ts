import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface NormalisedJob {
    title: string;
    company: string;
    location: string;
    job_type: string;
    platform: string;
    source: 'jsearch' | 'adzuna' | 'apify' | 'jobforgecollector';
    apply_url: string;
    description: string;
    posted_date: string;
    external_id: string; // for backup tracking
    country?: string;
    is_mnc?: boolean;
    level?: 'fresher' | 'intern' | 'experienced';
}

const MNC_LIST = [
    'amazon', 'ibm', 'deloitte', 'cognizant', 'infosys',
    'tcs', 'wipro', 'accenture', 'microsoft', 'google', 'capgemini',
    'oracle', 'meta', 'apple', 'adobe', 'salesforce', 'sap',
    'flipkart', 'phonepe', 'swiggy', 'zomato', 'netflix', 'meta', 'nvidia'
];

export function isMNC(company: string): boolean {
    const lower = (company || '').toLowerCase();
    return MNC_LIST.some(m => lower.includes(m));
}

export function classifyLevel(title: string): 'fresher' | 'intern' | 'experienced' {
    const lower = (title || '').toLowerCase();
    if (lower.includes('intern')) return 'intern';
    if (['fresher', 'junior', 'entry level', 'trainee', 'graduate'].some(k => lower.includes(k))) return 'fresher';
    return 'experienced';
}

export async function ingestJobs(jobs: NormalisedJob[]) {
    if (jobs.length === 0) return { inserted: 0, skipped: 0 };

    // Map to DB fields
    const dbJobs = jobs.map(j => ({
        title: j.title,
        company: j.company || 'Unknown',
        location: j.location || 'Remote',
        description: j.description?.slice(0, 5000),
        apply_url: j.apply_url,
        employment_type: j.job_type,
        posted_at: j.posted_date || new Date().toISOString(),
        source: j.source,
        external_id: j.external_id,
        platform: j.platform,
        country: j.country || 'India',
        level: j.level || classifyLevel(j.title),
        is_mnc: j.is_mnc ?? isMNC(j.company),
        created_at: new Date().toISOString()
    }));

    // Upsert using the unique constraint on (title, company, location)
    const { data, error } = await supabaseAdmin
        .from('jobs')
        .upsert(dbJobs, { 
            onConflict: 'title,company,location', 
            ignoreDuplicates: true 
        })
        .select('id');

    if (error) {
        console.error('[IngestionService] Error:', error);
        throw error;
    }

    return {
        total: jobs.length,
        inserted: data?.length || 0,
        skipped: jobs.length - (data?.length || 0)
    };
}
