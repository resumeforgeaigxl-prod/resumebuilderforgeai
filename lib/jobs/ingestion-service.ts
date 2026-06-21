import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { isValidLocation } from './utils';

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
    source: 'jsearch' | 'adzuna' | 'apify' | 'jobforgecollector' | 'arbeitnow' | 'jobicy' | 'themuse' | 'jooble' | 'findwork' | 'careerjet';
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
    // 1. NORMALIZE & CLEAN
    const title = String(job.title || 'Untitled').trim().replace(/\s+/g, ' ');
    const company = String(job.company || 'Unknown').trim().replace(/\s+/g, ' ');
    const rawLocation = job.location || 'India';
    let location = 'India';
    if (typeof rawLocation === 'string') {
        location = rawLocation;
    } else if (rawLocation && typeof rawLocation === 'object') {
        const obj = rawLocation as Record<string, unknown>;
        location = (obj.name as string) || (obj.display_name as string) || 'India';
    }
    const apply_url = (job.apply_url || '').trim();

    // 2. Normalize job type
    let jobType = String(job.job_type || 'Full-time').toLowerCase().replace(/[-_ ]/g, '_');
    if (jobType.includes('intern')) jobType = 'internship';
    else if (jobType.includes('full')) jobType = 'full_time';
    else if (jobType.includes('contract')) jobType = 'contract';
    else if (jobType.includes('part')) jobType = 'part_time';

    // 3. GENERATE STABLE EXTERNAL_ID (Based on Title + Company + Location)
    // We normalize the strings to ensure consistency across search platforms
    const normTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normLocation = location.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const dedupInput = `${normTitle}|${normCompany}|${normLocation}`;
    const dedup_key = createHash('sha256').update(dedupInput).digest('hex');
    
    // As per requirement: Stable external_id for global deduplication
    const external_id = `hash_${dedup_key.slice(0, 32)}`;

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
        dedup_key,
        country: job.country || 'India'
    } as NormalisedJob;
}




export async function ingestJobs(jobs: Partial<NormalisedJob>[]) {
    if (!jobs || jobs.length === 0) {
        console.log('[IngestionPipeline] Received 0 jobs.');
        return { total: 0, inserted: 0, filtered: 0, skipped: 0, failed: 0 };
    }

    const totalFetched = jobs.length;
    console.log(`[IngestionPipeline] Starting ingestion for ${totalFetched} items...`);

    // LAYER 3: NORMALIZATION & IN-MEMORY DEDUPLICATION (Batch Level)
    const seenInBatch = new Set<string>();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const readyToIngest = jobs
        .filter(job => isValidLocation(job.location || 'India')) // Filter by location early
        .map(normalizeJob)                                        // Normalize (generates stable external_id)
        .filter(j => {
            if (!j.external_id) return false;
            
            // Skip Duplicates in this same run
            if (seenInBatch.has(j.external_id)) return false;
            seenInBatch.add(j.external_id);

            // OPTIMIZATION: Skip very old jobs (30+ days)
            const postDate = new Date(j.posted_date);
            if (postDate < thirtyDaysAgo) return false;

            return true;
        });

    const filteredCount = totalFetched - readyToIngest.length;

    // LAYER 4: DATABASE CHECK (UPSERT LOGIC)

    // LAYER 4: DATABASE CHECK (UPSERT LOGIC)
    let inserted = 0;
    let skipped = 0;
    let failed = 0;
    
    const { data: recentJobs } = await supabaseAdmin
        .from('jobs')
        .select('external_id, apply_url, dedup_key')
        .order('created_at', { ascending: false })
        .limit(2000);
        
    const recentIds = new Set(recentJobs?.map(j => j.external_id).filter(Boolean) || []);
    const recentApplyUrls = new Set(recentJobs?.map(j => j.apply_url).filter(Boolean) || []);
    const recentDedupKeys = new Set(recentJobs?.map(j => j.dedup_key).filter(Boolean) || []);

    const skippedDetails: any[] = [];
    const insertedDetails: any[] = [];

    const finalDbJobs = readyToIngest.filter(j => {
        if (recentIds.has(j.external_id)) {
            skipped++;
            skippedDetails.push({ title: j.title, company: j.company, reason: 'Duplicate ID' });
            return false;
        }
        if (j.apply_url && recentApplyUrls.has(j.apply_url)) {
            skipped++;
            skippedDetails.push({ title: j.title, company: j.company, reason: 'Duplicate URL' });
            return false;
        }
        if (j.dedup_key && recentDedupKeys.has(j.dedup_key)) {
            skipped++;
            skippedDetails.push({ title: j.title, company: j.company, reason: 'Duplicate Key' });
            return false;
        }
        return true;
    }).map(j => ({
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
        created_at: new Date().toISOString()
    }));

    if (finalDbJobs.length === 0) {
        console.log(`[IngestionPipeline] All jobs duplicate/filtered. Fetched: ${totalFetched}, Skipped: ${skipped}`);
        return { 
            total: totalFetched, 
            filtered: filteredCount, 
            inserted: 0, 
            skipped, 
            failed: 0,
            skippedDetails 
        };
    }

    // Insert row-by-row to handle any production database unique constraint violations gracefully
    for (const job of finalDbJobs) {
        const { data, error } = await supabaseAdmin
            .from('jobs')
            .upsert(job, { 
                onConflict: 'external_id', 
                ignoreDuplicates: true 
            })
            .select('id, title, company');

        if (error) {
            // Check if it's a unique constraint violation error
            if (error.code === '23505' || error.message.includes('unique constraint') || error.message.includes('duplicate key')) {
                skipped++;
                skippedDetails.push({ title: job.title, company: job.company, reason: 'DB Constraint Conflict' });
            } else {
                console.error('[IngestionPipeline] DB Insert Error:', error.message);
                failed++;
            }
        } else if (data && data.length > 0) {
            inserted++;
            insertedDetails.push({ title: job.title, company: job.company });
        } else {
            // Ignored by DB onConflict
            skipped++;
            skippedDetails.push({ title: job.title, company: job.company, reason: 'Duplicate ID' });
        }
    }

    console.log(`[IngestionPipeline] Result: Fetched: ${totalFetched} | Inserted: ${inserted} | Skipped: ${skipped} | Failed: ${failed}`);

    return {
        total: totalFetched,
        filtered: filteredCount,
        inserted,
        skipped,
        failed,
        skippedDetails,
        insertedDetails
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

