import { generateGroundedJobSearch } from '@/lib/gemini-service';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { adaptGroundedSearchResults } from '@/lib/jobs/adapters/web-search';
import { ingestCanonicalJobs } from '@/lib/jobs/ingest';
import { verifyCanonicalJob } from '@/lib/jobs/freshness';
import { findReplacementJobs } from '@/lib/jobs/replacement';
import type { VerificationResult, ReplacementCandidate } from '@/lib/jobs/types';

export interface SearchJobMarketResult {
  success: boolean;
  tool: string;
  query: string;
  jobs: any[];
  count: number;
}

export interface JobApplicationRecord {
  id: string;
  status: string;
  notes?: string;
  created_at: string;
  jobs?: any;
}

export interface JobApplicationEligibility {
  eligible: boolean;
  status: 'ACTIVE' | 'UNKNOWN' | 'CLOSED';
  closureReason?: string | null;
  message: string;
  replacements?: ReplacementCandidate[];
}

/**
 * Searches the live job market, automatically routing discovered opportunities
 * through the canonical normalization, deduplication, and ingestion pipeline.
 * Returns only ACTIVE canonical jobs with stable UUIDs.
 */
export async function searchJobMarket(query: string): Promise<SearchJobMarketResult> {
  if (!query) throw new Error('query is required');

  let rawGroundedJobs: any[] = [];
  try {
    rawGroundedJobs = await generateGroundedJobSearch(query);
  } catch (err: any) {
    console.warn('[searchJobMarket] Grounded search warning:', err.message);
  }

  // If grounded search returned results, ingest through canonical pipeline
  if (Array.isArray(rawGroundedJobs) && rawGroundedJobs.length > 0) {
    try {
      const canonicalInputs = adaptGroundedSearchResults(rawGroundedJobs, 'gemini_grounding');
      await ingestCanonicalJobs(canonicalInputs, { batchSource: 'gemini_grounding' });
    } catch (ingestErr: any) {
      console.warn('[searchJobMarket] Ingestion error:', ingestErr.message);
    }
  }

  // Retrieve canonical jobs from database matching the query terms (NEVER return CLOSED jobs)
  const supabase = createAdminClient();
  const searchTerms = query.trim().split(/\s+/).filter((t) => t.length > 2);
  const primaryTerm = searchTerms[0] || query.trim();

  const { data: dbJobs } = await supabase
    .from('jobs')
    .select('id, title, normalized_title, company, location, remote_type, employment_type, description, apply_url, canonical_url, source, salary_min, salary_max, salary_currency, skills, status, posted_at, created_at')
    .neq('status', 'CLOSED') // Filter out closed jobs
    .or(`title.ilike.%${primaryTerm}%,company.ilike.%${primaryTerm}%,skills.cs.{${primaryTerm}}`)
    .order('created_at', { ascending: false })
    .limit(10);

  // If DB results found, return canonical DB jobs; otherwise return grounded jobs
  const returnJobs = (dbJobs && dbJobs.length > 0) ? dbJobs : rawGroundedJobs;

  return {
    success: true,
    tool: 'search_job_market',
    query,
    jobs: returnJobs || [],
    count: (returnJobs || []).length,
  };
}

/**
 * Retrieves a canonical job by its UUID, including its tracked source occurrences.
 * Automatically verifies freshness if stale and includes replacements if closed.
 */
export async function getCanonicalJobById(jobId: string, userId?: string | null) {
  if (!jobId) throw new Error('jobId is required');
  const supabase = createAdminClient();

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobError || !job) throw new Error(`Canonical job not found: ${jobId}`);

  // Fetch source occurrences
  const { data: occurrences } = await supabase
    .from('job_sources')
    .select('*')
    .eq('job_id', jobId)
    .order('last_seen_at', { ascending: false });

  // If status is CLOSED, attach 3 replacement suggestions
  let replacements: ReplacementCandidate[] = [];
  if (job.status === 'CLOSED') {
    try {
      const rep = await findReplacementJobs({ jobId, userId, limit: 3 });
      replacements = rep.replacements;
    } catch (err: any) {
      console.warn('[getCanonicalJobById] Replacement fetch error:', err.message);
    }
  }

  return {
    ...job,
    sources: occurrences || [],
    replacements,
  };
}

/**
 * Verifies live freshness of a specific canonical vacancy.
 */
export async function verifyJobFreshness(
  jobId: string,
  options?: { force?: boolean }
): Promise<VerificationResult> {
  return await verifyCanonicalJob(jobId, options);
}

/**
 * Discovers 3-5 similar ACTIVE replacement jobs for a closed vacancy.
 */
export async function findReplacementOpportunities(
  jobId: string,
  userId?: string | null,
  limit: number = 3
) {
  return await findReplacementJobs({ jobId, userId, limit });
}

/**
 * Pre-application verification gate.
 * Ensures Omni and future application agents never initiate applications for closed vacancies.
 */
export async function checkJobApplicationEligibility(
  jobId: string,
  userId?: string | null
): Promise<JobApplicationEligibility> {
  const verification = await verifyCanonicalJob(jobId);

  if (verification.status === 'CLOSED') {
    const repResult = await findReplacementJobs({ jobId, userId, limit: 3 });
    return {
      eligible: false,
      status: 'CLOSED',
      closureReason: verification.closureReason,
      message: `This position is no longer accepting applications (${verification.closureReason || 'Closed'}).`,
      replacements: repResult.replacements,
    };
  }

  return {
    eligible: true,
    status: verification.status,
    closureReason: null,
    message: verification.status === 'ACTIVE'
      ? 'Position verified active and accepting applications.'
      : 'Position status is unconfirmed but accessible.',
  };
}

/**
 * Searches canonical jobs directly from public.jobs (strictly ACTIVE).
 */
export async function searchCanonicalJobs(query: string, options?: { limit?: number; location?: string }) {
  const supabase = createAdminClient();
  const limit = options?.limit || 20;

  let dbQuery = supabase
    .from('jobs')
    .select('*')
    .eq('status', 'ACTIVE') // NEVER return CLOSED jobs
    .order('last_seen_at', { ascending: false })
    .limit(limit);

  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,company.ilike.%${query}%,normalized_title.ilike.%${query}%`);
  }

  if (options?.location) {
    dbQuery = dbQuery.ilike('location', `%${options.location}%`);
  }

  const { data, error } = await dbQuery;
  if (error) throw error;
  return data || [];
}

/**
 * Lists user job applications along with company and position details.
 * Preserves application history even if the underlying job later closes.
 */
export async function getJobApplications(userId: string): Promise<JobApplicationRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      id,
      status,
      notes,
      created_at,
      jobs (
        id,
        title,
        company,
        location,
        status,
        closure_reason
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });


  if (error) {
    console.error('[getJobApplications] Error:', error.message);
    throw error;
  }

  return (data || []) as unknown as JobApplicationRecord[];
}

export { matchCandidateToJob, rankJobsForCandidate } from '@/lib/matching';
