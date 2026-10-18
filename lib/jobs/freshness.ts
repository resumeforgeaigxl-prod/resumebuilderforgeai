import { createAdminClient } from '@/lib/supabase/admin';
import {
  inspectUrlFreshness,
  calculateNextVerifySchedule,
  resolveCanonicalStatus,
} from './verify';
import { notifyJobUrlUpdated, notifyJobUrlRemoved } from './indexing';
import type {
  JobStatus,
  VerificationResult,
  FreshnessBatchResult,
  ClosureReason,
} from './types';

const FRESHNESS_WINDOW_HOURS = 2; // Jobs verified within 2 hours are considered fresh for UI actions

export interface VerifyJobOptions {
  force?: boolean;
}

/**
 * Verifies a single canonical job's live status across its tracked source occurrences.
 * Updates both public.jobs and public.job_sources in Supabase with verified evidence.
 */
export async function verifyCanonicalJob(
  jobId: string,
  options?: VerifyJobOptions
): Promise<VerificationResult> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // 1. Fetch canonical job record
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    throw new Error(`Job not found for verification: ${jobId}`);
  }

  // If already marked CLOSED and not forcing reverification, return closed state
  if (job.status === 'CLOSED' && !options?.force) {
    return {
      jobId,
      status: 'CLOSED',
      confidence: 1.0,
      verifiedAt: job.last_verified_at || now,
      closedAt: job.closed_at || now,
      closureReason: (job.closure_reason as ClosureReason) || 'EXPLICIT_CLOSED_TEXT',
      evidence: job.verification_evidence || { timestamp: now, details: 'Previously marked CLOSED' },
    };
  }

  // Check freshness window: if verified recently and not forced, return cached state
  if (!options?.force && job.last_verified_at) {
    const elapsedMs = Date.now() - new Date(job.last_verified_at).getTime();
    if (elapsedMs < FRESHNESS_WINDOW_HOURS * 60 * 60 * 1000) {
      return {
        jobId,
        status: job.status as JobStatus,
        confidence: 0.9,
        verifiedAt: job.last_verified_at,
        nextVerifyAt: job.next_verify_at,
        closedAt: job.closed_at,
        closureReason: job.closure_reason as ClosureReason,
        evidence: job.verification_evidence || { timestamp: job.last_verified_at, details: 'Cached freshness verification' },
      };
    }
  }

  // 2. Fetch associated source occurrences
  const { data: occurrences } = await supabase
    .from('job_sources')
    .select('*')
    .eq('job_id', jobId);

  const sourcesList = occurrences && occurrences.length > 0 ? occurrences : [];

  // 3. Inspect Apply Destinations
  const sourcesEvidence: {
    source: string;
    status: JobStatus;
    reason?: ClosureReason;
    evidence?: any;
  }[] = [];

  // Inspect the canonical apply URL first
  const canonicalUrlToTest = job.canonical_url || job.apply_url;
  const canonicalInspection = await inspectUrlFreshness(canonicalUrlToTest);

  sourcesEvidence.push({
    source: job.source || 'growx_crawl',
    status: canonicalInspection.status,
    reason: canonicalInspection.closureReason,
    evidence: {
      httpStatus: canonicalInspection.httpStatus,
      matchedClosurePhrase: canonicalInspection.matchedPhrase,
      details: canonicalInspection.details,
      timestamp: now,
    },
  });

  // Also inspect occurrences if distinct apply URLs exist
  for (const occurrence of sourcesList) {
    const occApplyUrl = occurrence.apply_url || occurrence.source_url;
    if (occApplyUrl && occApplyUrl !== canonicalUrlToTest) {
      const occInspection = await inspectUrlFreshness(occApplyUrl);

      sourcesEvidence.push({
        source: occurrence.source,
        status: occInspection.status,
        reason: occInspection.closureReason,
        evidence: {
          httpStatus: occInspection.httpStatus,
          matchedClosurePhrase: occInspection.matchedPhrase,
          details: occInspection.details,
          timestamp: now,
        },
      });

      // Update occurrence record in public.job_sources
      await supabase
        .from('job_sources')
        .update({
          status: occInspection.status,
          last_verified_at: now,
          closure_reason: occInspection.closureReason || null,
          http_status: occInspection.httpStatus || null,
          verification_evidence: {
            httpStatus: occInspection.httpStatus,
            details: occInspection.details,
            timestamp: now,
          },
          updated_at: now,
        })
        .eq('id', occurrence.id);
    }
  }

  // 4. Resolve Canonical Status using Authoritative Precedence
  const resolved = resolveCanonicalStatus(sourcesEvidence);
  const nextVerifySchedule = calculateNextVerifySchedule(job, resolved.status);

  const attempts = resolved.status === 'UNKNOWN' ? (job.verification_attempts || 0) + 1 : 0;
  const closedAt = resolved.status === 'CLOSED' ? (job.closed_at || now) : null;

  const primaryEvidence = sourcesEvidence[0]?.evidence || { timestamp: now };

  // 5. Persist Verified State in public.jobs
  const { error: updateError } = await supabase
    .from('jobs')
    .update({
      status: resolved.status,
      last_verified_at: now,
      next_verify_at: nextVerifySchedule,
      closed_at: closedAt,
      closure_reason: resolved.closureReason || null,
      verification_source: resolved.primarySource,
      verification_attempts: attempts,
      verification_evidence: primaryEvidence,
      updated_at: now,
    })
    .eq('id', jobId);

  if (updateError) {
    console.error(`[FreshnessService] Error updating job ${jobId}:`, updateError.message);
  } else {
    // Notify search engines downstream asynchronously (non-blocking)
    if (resolved.status === 'CLOSED') {
      notifyJobUrlRemoved(jobId, job.slug).catch((err: any) => {
        console.warn('[FreshnessService] Downstream URL_DELETED notification skipped/failed:', err?.message);
      });
    } else if (resolved.status === 'ACTIVE' && job.status !== 'ACTIVE') {
      notifyJobUrlUpdated(jobId, job.slug).catch((err: any) => {
        console.warn('[FreshnessService] Downstream URL_UPDATED notification skipped/failed:', err?.message);
      });
    }
  }

  return {
    jobId,
    status: resolved.status,
    confidence: resolved.confidence,
    verifiedAt: now,
    nextVerifyAt: nextVerifySchedule,
    closedAt,
    closureReason: resolved.closureReason,
    evidence: primaryEvidence,
    sourceStatuses: sourcesEvidence.map((s) => ({
      source: s.source,
      status: s.status,
      reason: s.reason,
    })),
  };
}

/**
 * Bounded Batch Freshness Checker
 * Selects up to `batchSize` jobs needing verification and processes them in parallel
 * with rate-controlled concurrency.
 */
export async function verifyStaleJobsBatch(batchSize: number = 50): Promise<FreshnessBatchResult> {
  const startTime = Date.now();
  const supabase = createAdminClient();

  const safeLimit = Math.min(Math.max(1, batchSize), 100); // Between 1 and 100

  // Select candidates where next_verify_at <= now or null, excluding CLOSED
  const { data: candidates, error } = await supabase
    .from('jobs')
    .select('id, title, company')
    .neq('status', 'CLOSED')
    .or(`next_verify_at.lte.${new Date().toISOString()},next_verify_at.is.null`)
    .order('next_verify_at', { ascending: true, nullsFirst: true })
    .limit(safeLimit);

  if (error || !candidates || candidates.length === 0) {
    return {
      success: true,
      processed: 0,
      active: 0,
      closed: 0,
      unknown: 0,
      errors: [],
      durationMs: Date.now() - startTime,
    };
  }

  const result: FreshnessBatchResult = {
    success: true,
    processed: candidates.length,
    active: 0,
    closed: 0,
    unknown: 0,
    errors: [],
    durationMs: 0,
  };

  // Process in small concurrency chunks (3-5 items at a time to be polite)
  const CONCURRENCY = 4;
  for (let i = 0; i < candidates.length; i += CONCURRENCY) {
    const chunk = candidates.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (candidate) => {
        try {
          const verification = await verifyCanonicalJob(candidate.id, { force: true });
          if (verification.status === 'ACTIVE') result.active++;
          else if (verification.status === 'CLOSED') result.closed++;
          else result.unknown++;
        } catch (err: any) {
          result.unknown++;
          result.errors.push({ jobId: candidate.id, reason: err.message });
        }
      })
    );
  }

  result.durationMs = Date.now() - startTime;
  console.log(
    `[FreshnessBatch] Verified ${result.processed} jobs: active=${result.active}, closed=${result.closed}, unknown=${result.unknown} (${result.durationMs}ms)`
  );

  return result;
}
