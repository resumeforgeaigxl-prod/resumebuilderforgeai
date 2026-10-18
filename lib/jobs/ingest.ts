import { createAdminClient } from '@/lib/supabase/admin';
import {
  normalizeTitle,
  normalizeLocation,
  normalizeRemoteType,
  normalizeEmploymentType,
  normalizeUrl,
  extractCompanyDomain,
} from './normalize';
import {
  findCanonicalJobMatch,
  generateDedupKey,
  mergeCanonicalJob,
} from './dedupe';
import { generateJobSlug } from './slug';
import { isJobIndexable } from './indexability';
import { notifyJobUrlUpdated } from './indexing';
import type {
  CanonicalJobInput,
  JobIngestionResult,
  JobSourceType,
} from './types';

const MAX_BATCH_SIZE = 100;
const MAX_DESCRIPTION_LENGTH = 30000;

export interface IngestOptions {
  batchSource?: JobSourceType;
}

/**
 * Canonical Job Ingestion Pipeline
 * Validates, normalizes, deduplicates, and upserts jobs into the canonical
 * public.jobs and public.job_sources tables.
 */
export async function ingestCanonicalJobs(
  rawJobs: CanonicalJobInput[],
  options?: IngestOptions
): Promise<JobIngestionResult> {
  const startTime = Date.now();
  const supabase = createAdminClient();

  const result: JobIngestionResult = {
    success: true,
    received: Array.isArray(rawJobs) ? rawJobs.length : 0,
    inserted: 0,
    updated: 0,
    duplicates: 0,
    rejected: 0,
    errors: [],
    durationMs: 0,
  };

  if (!rawJobs || !Array.isArray(rawJobs) || rawJobs.length === 0) {
    result.durationMs = Date.now() - startTime;
    return result;
  }

  // 1. Enforce batch size limit
  if (rawJobs.length > MAX_BATCH_SIZE) {
    result.success = false;
    result.rejected = rawJobs.length;
    result.errors?.push({
      index: -1,
      reason: `Batch size ${rawJobs.length} exceeds maximum limit of ${MAX_BATCH_SIZE} jobs per request.`,
    });
    result.durationMs = Date.now() - startTime;
    return result;
  }

  // 2. Process each incoming job item with partial batch fault tolerance
  for (let idx = 0; idx < rawJobs.length; idx++) {
    const item = rawJobs[idx];

    // ── Input Validation ───────────────────────────────────────────────────
    if (!item || typeof item !== 'object') {
      result.rejected++;
      result.errors?.push({ index: idx, reason: 'Invalid item: payload must be an object' });
      continue;
    }

    if (!item.title || typeof item.title !== 'string' || item.title.trim().length === 0) {
      result.rejected++;
      result.errors?.push({ index: idx, reason: 'Missing required field: title' });
      continue;
    }

    if (!item.company || typeof item.company !== 'string' || item.company.trim().length === 0) {
      result.rejected++;
      result.errors?.push({ index: idx, reason: 'Missing required field: company', item: { title: item.title } });
      continue;
    }

    if (!item.applyUrl || typeof item.applyUrl !== 'string' || item.applyUrl.trim().length === 0) {
      result.rejected++;
      result.errors?.push({ index: idx, reason: 'Missing required field: applyUrl', item: { title: item.title, company: item.company } });
      continue;
    }

    const normalizedApplyUrl = normalizeUrl(item.applyUrl);
    if (!normalizedApplyUrl) {
      result.rejected++;
      result.errors?.push({
        index: idx,
        reason: 'Malformed or insecure applyUrl (must be valid http/https URL and cannot be javascript/data protocol)',
        item: { title: item.title, company: item.company },
      });
      continue;
    }

    const source: JobSourceType = item.source || options?.batchSource || 'other';

    // ── Field Normalization ────────────────────────────────────────────────
    const normalizedTitle = normalizeTitle(item.title);
    const loc = normalizeLocation(item.location);
    const remoteType = item.remoteType || normalizeRemoteType(item.location, item.title);
    const employmentType = item.employmentType || normalizeEmploymentType(undefined, item.title);
    const canonicalUrl = normalizeUrl(item.canonicalUrl) || normalizedApplyUrl;
    const companyDomain = item.companyDomain || extractCompanyDomain(canonicalUrl);

    const dedupKey = generateDedupKey(
      normalizedTitle,
      item.company,
      loc.city || loc.locationText
    );

    const description = item.description
      ? String(item.description).slice(0, MAX_DESCRIPTION_LENGTH)
      : null;

    try {
      // ── Deduplication Search (Levels A, B, C, D) ───────────────────────────
      const matchResult = await findCanonicalJobMatch(supabase, item, {
        normalizedTitle,
        normalizedApplyUrl,
        dedupKey,
        city: loc.city,
      });

      const now = new Date().toISOString();

      if (matchResult && matchResult.job) {
        // MATCH FOUND: Merge and update existing canonical job
        const existingJob = matchResult.job;
        const { merged, hasSubstantiveChanges } = mergeCanonicalJob(existingJob, item, {
          normalizedTitle,
          normalizedApplyUrl,
          locationText: loc.locationText,
          city: loc.city,
          state: loc.state,
          country: loc.country,
          remoteType,
          employmentType,
          companyDomain,
        });

        // Update canonical record in public.jobs
        const { error: updateError } = await supabase
          .from('jobs')
          .update(merged)
          .eq('id', existingJob.id);

        if (updateError) {
          console.error(`[IngestPipeline] Failed to update job ${existingJob.id}:`, updateError.message);
          result.rejected++;
          result.errors?.push({
            index: idx,
            reason: `Database update failed: ${updateError.message}`,
            item: { title: item.title, company: item.company },
          });
          continue;
        }

        // Record source occurrence in public.job_sources
        await recordSourceOccurrence(supabase, {
          jobId: existingJob.id,
          source,
          sourceJobId: item.sourceJobId || null,
          sourceUrl: item.sourceUrl || null,
          applyUrl: normalizedApplyUrl,
          rawPayload: item.rawPayload || {},
          now,
        });

        if (hasSubstantiveChanges) {
          result.updated++;
          // Notify search engines downstream asynchronously (non-blocking)
          if (existingJob.status === 'ACTIVE' && isJobIndexable(existingJob).eligible) {
            notifyJobUrlUpdated(existingJob.id, existingJob.slug).catch(() => {});
          }
        } else {
          result.duplicates++;
        }
      } else {
        // NO MATCH: Insert new canonical job
        const newExternalId = `rf_${dedupKey.slice(0, 32)}`;

        const newJobPayload = {
          title: item.title.trim(),
          normalized_title: normalizedTitle,
          company: item.company.trim(),
          company_domain: companyDomain,
          location: loc.locationText,
          location_text: loc.locationText,
          city: loc.city || null,
          state: loc.state || null,
          country: loc.country,
          remote_type: remoteType,
          employment_type: employmentType,
          description: description,
          requirements: item.requirements || null,
          experience_min: item.experienceMin ?? null,
          experience_max: item.experienceMax ?? null,
          salary_min: item.salaryMin ?? null,
          salary_max: item.salaryMax ?? null,
          salary_currency: item.salaryCurrency || 'INR',
          salary_period: item.salaryPeriod || 'YEAR',
          skills: Array.isArray(item.skills) ? item.skills : [],
          apply_url: normalizedApplyUrl,
          canonical_url: canonicalUrl,
          source: source,
          source_job_id: item.sourceJobId || null,
          source_url: item.sourceUrl || null,
          posted_at: item.postedAt || now,
          discovered_at: now,
          last_seen_at: now,
          status: item.status || 'ACTIVE',
          external_id: newExternalId,
          dedup_key: dedupKey,
          created_at: now,
          updated_at: now,
        };

        const { data: insertedData, error: insertError } = await supabase
          .from('jobs')
          .insert(newJobPayload)
          .select('id')
          .single();

        if (insertError) {
          // If collision occurred on unique external_id or dedup_key, treat gracefully as duplicate/update
          if (insertError.code === '23505' || insertError.message.includes('unique constraint')) {
            const { data: fallbackJob } = await supabase
              .from('jobs')
              .select('id')
              .eq('external_id', newExternalId)
              .maybeSingle();

            if (fallbackJob) {
              await supabase
                .from('jobs')
                .update({ last_seen_at: now })
                .eq('id', fallbackJob.id);

              await recordSourceOccurrence(supabase, {
                jobId: fallbackJob.id,
                source,
                sourceJobId: item.sourceJobId || null,
                sourceUrl: item.sourceUrl || null,
                applyUrl: normalizedApplyUrl,
                rawPayload: item.rawPayload || {},
                now,
              });

              result.duplicates++;
              continue;
            }
          }

          console.error(`[IngestPipeline] Insert error for "${item.title}" at "${item.company}":`, insertError.message);
          result.rejected++;
          result.errors?.push({
            index: idx,
            reason: `Database insert failed: ${insertError.message}`,
            item: { title: item.title, company: item.company },
          });
          continue;
        }

        const newJobId = insertedData?.id;
        if (newJobId) {
          // Compute and persist canonical slug
          const canonicalSlug = generateJobSlug({
            id: newJobId,
            company: item.company,
            title: item.title,
            city: loc.city,
            location: loc.locationText,
          });

          await supabase
            .from('jobs')
            .update({ slug: canonicalSlug })
            .eq('id', newJobId);

          // Record source occurrence
          await recordSourceOccurrence(supabase, {
            jobId: newJobId,
            source,
            sourceJobId: item.sourceJobId || null,
            sourceUrl: item.sourceUrl || null,
            applyUrl: normalizedApplyUrl,
            rawPayload: item.rawPayload || {},
            now,
          });

          // Downstream Google Indexing notification (non-blocking)
          const isEligible = isJobIndexable({
            ...newJobPayload,
            id: newJobId,
            status: item.status || 'ACTIVE',
          }).eligible;

          if (isEligible) {
            notifyJobUrlUpdated(newJobId, canonicalSlug).catch((err: any) => {
              console.warn('[IngestPipeline] Downstream index notification skipped/failed:', err?.message);
            });
          }
        }

        result.inserted++;
      }
    } catch (procErr: any) {
      console.error(`[IngestPipeline] Processing error at index ${idx}:`, procErr.message);
      result.rejected++;
      result.errors?.push({
        index: idx,
        reason: `Unexpected processing error: ${procErr.message}`,
        item: { title: item.title, company: item.company },
      });
    }
  }

  result.durationMs = Date.now() - startTime;
  console.log(
    `[IngestPipeline] Completed batch: received=${result.received}, inserted=${result.inserted}, updated=${result.updated}, duplicates=${result.duplicates}, rejected=${result.rejected} (${result.durationMs}ms)`
  );

  return result;
}

/**
 * Inserts or updates source occurrence record in public.job_sources.
 */
async function recordSourceOccurrence(
  supabase: any,
  params: {
    jobId: string;
    source: string;
    sourceJobId: string | null;
    sourceUrl: string | null;
    applyUrl: string | null;
    rawPayload: Record<string, any>;
    now: string;
  }
) {
  try {
    if (params.sourceJobId) {
      // Upsert using (source, source_job_id)
      const { data: existingSource } = await supabase
        .from('job_sources')
        .select('id')
        .eq('source', params.source)
        .eq('source_job_id', params.sourceJobId)
        .maybeSingle();

      if (existingSource?.id) {
        await supabase
          .from('job_sources')
          .update({
            last_seen_at: params.now,
            apply_url: params.applyUrl,
            source_url: params.sourceUrl,
            raw_payload: params.rawPayload,
            updated_at: params.now,
          })
          .eq('id', existingSource.id);
        return;
      }
    }

    // Insert new occurrence
    await supabase.from('job_sources').insert({
      job_id: params.jobId,
      source: params.source,
      source_job_id: params.sourceJobId,
      source_url: params.sourceUrl,
      apply_url: params.applyUrl,
      raw_payload: params.rawPayload,
      discovered_at: params.now,
      last_seen_at: params.now,
      created_at: params.now,
      updated_at: params.now,
    });
  } catch (err: any) {
    console.warn('[recordSourceOccurrence] Error recording source:', err.message);
  }
}
