import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

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
    tier?: number;
    priority_score?: number;
    dedup_key?: string;
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
    // 1. NORMALIZE & CLEAN (Strict as requested)
    const title = (job.title || 'Untitled').trim().replace(/\s+/g, ' ');
    const company = (job.company || 'Unknown').trim().replace(/\s+/g, ' ');
    const location = (job.location || 'India').trim().toLowerCase();
    const apply_url = (job.apply_url || '').trim();

    // 2. Normalize job type
    let jobType = (job.job_type || 'Full-time').toLowerCase().replace(/[-_ ]/g, '_');
    if (jobType.includes('intern')) jobType = 'internship';
    if (jobType.includes('full')) jobType = 'full_time';
    if (jobType.includes('contract')) jobType = 'contract';

    // 3. GENERATE DEDUP_KEY (SHA256 of title + company + location + source)
    const dedupInput = `${title}|${company}|${location}|${job.source || 'jfc'}`;
    const dedup_key = createHash('sha256').update(dedupInput).digest('hex');
    
    // For legacy support and batch dedup in memory
    const external_id = apply_url || `hash_${dedup_key.slice(0, 24)}`;

    return {
        ...job,
        title,
        company,
        location,
        job_type: jobType,
        platform: job.platform || 'General',
        source: job.source || 'jobforgecollector',
        apply_url: apply_url || null, // Ensure null if empty for unique index
        description: (job.description || '').slice(0, 5000),
        posted_date: job.posted_date || new Date().toISOString(),
        external_id,
        dedup_key
    } as NormalisedJob;
}

export async function ingestJobs(jobs: Partial<NormalisedJob>[]) {
    if (jobs.length === 0) return { total: 0, inserted: 0, skipped: 0, failed: 0 };

    // LAYER 3: NORMALIZATION
    const normalizedJobs = jobs.map(normalizeJob);
    const totalFetched = jobs.length;

    // LAYER 3.5: COMPANY PRIORITY ENRICHMENT
    const { data: priorities } = await supabaseAdmin.from('target_companies').select('name, tier, priority_score');
    const priorityMap = new Map();
    priorities?.forEach(p => {
        priorityMap.set(p.name.toLowerCase(), { tier: p.tier, priority_score: p.priority_score });
    });

    // LAYER 4: PRE-DEDUPLICATION (Identify reasons for skipping)
    const finalDbJobs: Record<string, unknown>[] = [];
    const skipLog: string[] = [];
    let inserted = 0;
    let skipped = 0;
    let failed = 0;
    
    // Fetch current existing keys to check against
    const { data: existingJobs } = await supabaseAdmin
        .from('jobs')
        .select('apply_url, dedup_key');
        
    const existingUrls = new Set(existingJobs?.map(j => j.apply_url).filter(Boolean));
    const existingHashes = new Set(existingJobs?.map(j => j.dedup_key).filter(Boolean));

    normalizedJobs.forEach(j => {
        const companyKey = j.company.toLowerCase();
        const pInfo = priorityMap.get(companyKey);

        if (j.apply_url && existingUrls.has(j.apply_url)) {
            if (skipLog.length < 5) skipLog.push(`Skipped due to duplicate apply_url: ${j.apply_url.slice(0, 50)}...`);
            skipped++;
            return;
        }

        if (j.dedup_key && existingHashes.has(j.dedup_key)) {
            if (skipLog.length < 5) skipLog.push(`Skipped due to dedup_key (hash): ${j.title} @ ${j.company}`);
            skipped++;
            return;
        }

        const dbJob = {
            title: j.title,
            company: j.company,
            location: j.location,
            description: j.description,
            apply_url: j.apply_url,
            employment_type: j.job_type,
            posted_at: j.posted_date,
            source: j.source,
            external_id: j.external_id,
            dedup_key: j.dedup_key,
            platform: j.platform,
            country: j.country || 'India',
            level: j.level || classifyLevel(j.title),
            is_mnc: j.is_mnc ?? isMNC(j.company),
            tier: pInfo?.tier || 0,
            priority_score: pInfo?.priority_score || 10,
            created_at: new Date().toISOString()
        };

        finalDbJobs.push(dbJob);
    });

    if (skipLog.length > 0) {
        console.log('[IngestionPipeline] First few duplicates found:');
        skipLog.forEach(l => console.log(`  - ${l}`));
    }

    console.log(`[IngestionPipeline] Processing ${finalDbJobs.length} unique jobs after DB check...`);

    if (finalDbJobs.length === 0) {
        return { total: totalFetched, inserted: 0, skipped: totalFetched, failed: 0 };
    }

    // LAYER 5: STORAGE (Split into batches to handle different unique constraints)
    const jobsWithUrl = finalDbJobs.filter(j => j.apply_url) as Record<string, unknown>[];
    const jobsWithoutUrl = finalDbJobs.filter(j => !j.apply_url) as Record<string, unknown>[];

    // Case 1: Jobs with apply_url (Conflict target: apply_url)
    if (jobsWithUrl.length > 0) {
        const { data, error } = await supabaseAdmin
            .from('jobs')
            .upsert(jobsWithUrl, { 
                onConflict: 'apply_url', 
                ignoreDuplicates: true 
            })
            .select('id');

        if (error) {
            console.error('[IngestionPipeline] Batch 1 (apply_url) Error:', error.message);
            failed += jobsWithUrl.length;
        } else {
            const batchInserted = data?.length || 0;
            inserted += batchInserted;
            skipped += (jobsWithUrl.length - batchInserted);
        }
    }

    // Case 2: Jobs without apply_url (Conflict target: dedup_key)
    if (jobsWithoutUrl.length > 0) {
        const { data, error } = await supabaseAdmin
            .from('jobs')
            .upsert(jobsWithoutUrl, { 
                onConflict: 'dedup_key', 
                ignoreDuplicates: true 
            })
            .select('id');

        if (error) {
            console.error('[IngestionPipeline] Batch 2 (dedup_key) Error:', error.message);
            failed += jobsWithoutUrl.length;
        } else {
            const batchInserted = data?.length || 0;
            inserted += batchInserted;
            skipped += (jobsWithoutUrl.length - batchInserted);
        }
    }

    // FINAL VALIDATION LOGGING
    console.log(`[IngestionPipeline] Result -> Inserted: ${inserted} | Skipped: ${skipped} | Failed: ${failed}`);

    return {
        total: totalFetched,
        inserted,
        skipped,
        failed
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
