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

export function normalizeJob(job: Partial<NormalisedJob>): NormalisedJob {
    // LAYER 3: NORMALIZATION
    const company = (job.company || 'Unknown').trim();
    const title = (job.title || 'Untitled').trim();
    const rawLocation = (job.location || 'Remote').trim();

    // Simplify location (e.g., "Bangalore, Karnataka" -> "Bangalore")
    let location = rawLocation.split(',')[0].trim();
    if (location.toLowerCase().includes('remote')) location = 'Remote';

    // Normalize job type
    let jobType = (job.job_type || 'Full-time').toLowerCase().replace(/[-_ ]/g, '_');
    if (jobType.includes('intern')) jobType = 'internship';
    if (jobType.includes('full')) jobType = 'full_time';
    if (jobType.includes('contract')) jobType = 'contract';

    return {
        ...job,
        title,
        company,
        location,
        job_type: jobType,
        platform: job.platform || 'General',
        source: job.source || 'jobforgecollector',
        apply_url: job.apply_url || '',
        description: (job.description || '').slice(0, 5000),
        posted_date: job.posted_date || new Date().toISOString(),
        // Generate a deterministic ID based on the unique constraint fields (title, company, location)
        // This ensures the external_id and the (title, company, location) unique index are always in sync.
        external_id: `hash_${Buffer.from(title + company + location).toString('base64').replace(/[/+=]/g, '').slice(0, 24)}`,
    } as NormalisedJob;
}

export async function ingestJobs(jobs: Partial<NormalisedJob>[]) {
    if (jobs.length === 0) return { total: 0, inserted: 0, skipped: 0, duplicates_removed: 0 };

    // LAYER 3: NORMALIZATION
    const normalizedJobs = jobs.map(normalizeJob);

    // LAYER 4: DEDUPLICATION (Pre-check)
    // Rule: title + company + location
    // We check against existing jobs in the database to avoid even trying to upsert semantic duplicates
    // However, the DB unique index idx_jobs_deduplication handles this strictly.
    
    // Map to DB fields
    const dbJobs = normalizedJobs.map(j => ({
        title: j.title,
        company: j.company,
        location: j.location,
        description: j.description,
        apply_url: j.apply_url,
        employment_type: j.job_type,
        posted_at: j.posted_date,
        source: j.source,
        external_id: j.external_id,
        platform: j.platform,
        country: j.country || 'India',
        level: j.level || classifyLevel(j.title),
        is_mnc: j.is_mnc ?? isMNC(j.company),
        created_at: new Date().toISOString()
    }));

    console.log(`[IngestionPipeline] Starting ingestion for ${dbJobs.length} jobs...`);

    // LAYER 5: STORAGE
    // We use external_id as conflict target to allow updates if the job persists,
    // but the DB index on (title, company, location) will block semantic duplicates.
    const { data, error } = await supabaseAdmin
        .from('jobs')
        .upsert(dbJobs, { 
            onConflict: 'external_id', 
            ignoreDuplicates: true 
        })
        .select('id, title, company');

    if (error) {
        console.error('[IngestionPipeline] Storage Error:', error);
        throw error;
    }

    const inserted = data?.length || 0;
    const skipped = jobs.length - inserted;

    console.log(`[IngestionPipeline] Sync Complete: Total=${jobs.length}, Inserted=${inserted}, Skipped/Duplicates=${skipped}`);

    return {
        total: jobs.length,
        inserted,
        skipped,
        duplicates_removed: skipped
    };
}

export async function manualDeduplicate() {
    try {
        console.log('[IngestionPipeline] Running Manual Deduplication Layer...');
        const { data, error } = await supabaseAdmin.rpc('deduplicate_jobs');

        if (error) {
            console.error('[IngestionPipeline] Deduplication Layer Error:', error);
            return { success: false, error: error.message };
        }

        const count = Array.isArray(data) ? data[0]?.deleted_count : (data || 0);
        console.log(`[IngestionPipeline] Cleanup Complete: ${count} duplicates removed.`);
        return { success: true, count: [{ deleted_count: count }] };
    } catch (err) {
        return { success: false, error: String(err) };
    }
}
