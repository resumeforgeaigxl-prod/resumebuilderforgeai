import { createHash } from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  JobSourceType,
  CanonicalJobInput,
  CanonicalJobRecord,
} from './types';

/**
 * Authoritative precedence score for job sources.
 * Higher score wins when reconciling conflicting metadata.
 */
export const SOURCE_AUTHORITY: Record<JobSourceType, number> = {
  greenhouse: 100,
  lever: 100,
  ashby: 100,
  growx_crawl: 80, // Verified employer career page crawler
  jsearch: 60,
  adzuna: 60,
  jobforgecollector: 50,
  custom_crawler: 50,
  web_search: 40,
  gemini_grounding: 40,
  other: 30,
};

export function getSourceAuthority(source: JobSourceType | string): number {
  return SOURCE_AUTHORITY[source as JobSourceType] ?? 30;
}

/**
 * Computes deterministic dedup key based on normalized company, title, and location.
 */
export function generateDedupKey(
  title: string,
  company: string,
  location?: string | null
): string {
  const normTitle = (title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normCompany = (company || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const normLocation = (location || 'india').toLowerCase().replace(/[^a-z0-9]/g, '');

  const input = `${normTitle}|${normCompany}|${normLocation}`;
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Generates a content fingerprint of the job description text for Level D deduplication.
 * Returns null if the description is too short to be unique (< 100 chars).
 */
export function generateContentFingerprint(description?: string | null): string | null {
  if (!description || typeof description !== 'string') return null;
  const cleaned = description
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleaned.length < 100) return null;
  // Hash the first 1000 characters of normalized alphanumeric text
  return createHash('sha256').update(cleaned.slice(0, 1000)).digest('hex');
}

export interface MatchResult {
  job: any;
  matchLevel: 'A' | 'B' | 'C' | 'D';
}

/**
 * Executes multi-tier deduplication search in order:
 * Level A: Exact source + source_job_id in public.job_sources
 * Level B: Canonical Apply URL match in public.jobs or public.job_sources
 * Level C: Normalized company + title + location (dedup_key)
 * Level D: Content description fingerprint
 */
export async function findCanonicalJobMatch(
  supabase: SupabaseClient,
  input: CanonicalJobInput,
  normalized: {
    normalizedTitle: string;
    normalizedApplyUrl: string | null;
    dedupKey: string;
    city?: string;
  }
): Promise<MatchResult | null> {
  // ─── LEVEL A: Exact Source + Source Job ID ─────────────────────────────────
  if (input.source && input.sourceJobId) {
    const { data: sourceMatch } = await supabase
      .from('job_sources')
      .select('job_id, jobs(*)')
      .eq('source', input.source)
      .eq('source_job_id', input.sourceJobId)
      .limit(1)
      .maybeSingle();

    if (sourceMatch?.jobs) {
      return { job: sourceMatch.jobs, matchLevel: 'A' };
    }
  }

  // ─── LEVEL B: Canonical / Apply URL Match ──────────────────────────────────
  if (normalized.normalizedApplyUrl) {
    // Check canonical_url on jobs
    const { data: urlJobMatch } = await supabase
      .from('jobs')
      .select('*')
      .or(`canonical_url.eq.${normalized.normalizedApplyUrl},apply_url.eq.${normalized.normalizedApplyUrl}`)
      .limit(1)
      .maybeSingle();

    if (urlJobMatch) {
      return { job: urlJobMatch, matchLevel: 'B' };
    }

    // Check apply_url in job_sources
    const { data: sourceUrlMatch } = await supabase
      .from('job_sources')
      .select('job_id, jobs(*)')
      .eq('apply_url', normalized.normalizedApplyUrl)
      .limit(1)
      .maybeSingle();

    if (sourceUrlMatch?.jobs) {
      return { job: sourceUrlMatch.jobs, matchLevel: 'B' };
    }
  }

  // ─── LEVEL C: Company + Title + Location Dedup Key ─────────────────────────
  if (normalized.dedupKey) {
    const { data: dedupMatch } = await supabase
      .from('jobs')
      .select('*')
      .eq('dedup_key', normalized.dedupKey)
      .limit(1)
      .maybeSingle();

    if (dedupMatch) {
      return { job: dedupMatch, matchLevel: 'C' };
    }
  }

  // Secondary Level C check: exact company match + normalized_title match
  if (input.company && normalized.normalizedTitle) {
    const { data: titleMatch } = await supabase
      .from('jobs')
      .select('*')
      .ilike('company', input.company.trim())
      .ilike('normalized_title', normalized.normalizedTitle.trim())
      .limit(1)
      .maybeSingle();

    if (titleMatch) {
      return { job: titleMatch, matchLevel: 'C' };
    }
  }

  // ─── LEVEL D: Content Fingerprint Match ────────────────────────────────────
  const fingerprint = generateContentFingerprint(input.description);
  if (fingerprint && input.company) {
    // If the company matches and description prefix hash matches
    const { data: companyJobs } = await supabase
      .from('jobs')
      .select('*')
      .ilike('company', input.company.trim())
      .limit(10);

    if (companyJobs && companyJobs.length > 0) {
      for (const candidate of companyJobs) {
        const candidateFp = generateContentFingerprint(candidate.description);
        if (candidateFp && candidateFp === fingerprint) {
          return { job: candidate, matchLevel: 'D' };
        }
      }
    }
  }

  return null;
}

/**
 * Merges incoming job metadata with an existing canonical job record
 * according to source authoritative precedence.
 *
 * Rules:
 * 1. Never overwrite an existing non-null value with null or empty.
 * 2. If incoming source authority >= existing source authority, update metadata.
 * 3. Union and deduplicate skills list.
 * 4. Update last_seen_at to now.
 * 5. Retain earliest posted_at / discovered_at.
 */
export function mergeCanonicalJob(
  existing: any,
  incoming: CanonicalJobInput,
  normalized: {
    normalizedTitle: string;
    normalizedApplyUrl: string | null;
    locationText: string;
    city?: string;
    state?: string;
    country: string;
    remoteType: string;
    employmentType: string;
    companyDomain?: string | null;
  }
): {
  merged: Record<string, any>;
  hasSubstantiveChanges: boolean;
} {
  const existingAuthority = getSourceAuthority(existing.source || 'other');
  const incomingAuthority = getSourceAuthority(incoming.source || 'other');
  const canOverwrite = incomingAuthority >= existingAuthority;

  let hasSubstantiveChanges = false;
  const updates: Record<string, any> = {
    last_seen_at: new Date().toISOString(),
  };

  // Title & Normalized Title
  if (canOverwrite && incoming.title && incoming.title !== existing.title) {
    updates.title = incoming.title;
    updates.normalized_title = normalized.normalizedTitle;
    hasSubstantiveChanges = true;
  } else if (!existing.normalized_title && normalized.normalizedTitle) {
    updates.normalized_title = normalized.normalizedTitle;
    hasSubstantiveChanges = true;
  }

  // Company Domain
  if (!existing.company_domain && normalized.companyDomain) {
    updates.company_domain = normalized.companyDomain;
    hasSubstantiveChanges = true;
  }

  // Location / City / State / Country
  if (
    canOverwrite &&
    normalized.locationText &&
    normalized.locationText !== existing.location
  ) {
    updates.location = normalized.locationText;
    updates.location_text = normalized.locationText;
    if (normalized.city) updates.city = normalized.city;
    if (normalized.state) updates.state = normalized.state;
    if (normalized.country) updates.country = normalized.country;
    hasSubstantiveChanges = true;
  } else {
    if (!existing.city && normalized.city) {
      updates.city = normalized.city;
      hasSubstantiveChanges = true;
    }
    if (!existing.state && normalized.state) {
      updates.state = normalized.state;
      hasSubstantiveChanges = true;
    }
  }

  // Remote Type
  if (
    normalized.remoteType !== 'UNKNOWN' &&
    (existing.remote_type === 'UNKNOWN' || canOverwrite)
  ) {
    if (existing.remote_type !== normalized.remoteType) {
      updates.remote_type = normalized.remoteType;
      hasSubstantiveChanges = true;
    }
  }

  // Employment Type
  if (
    normalized.employmentType !== 'UNKNOWN' &&
    (existing.employment_type === 'UNKNOWN' || canOverwrite)
  ) {
    if (existing.employment_type !== normalized.employmentType) {
      updates.employment_type = normalized.employmentType;
      hasSubstantiveChanges = true;
    }
  }

  // Description (preserve longer/richer description if incoming has one)
  if (incoming.description && typeof incoming.description === 'string') {
    const existingLen = (existing.description || '').length;
    const incomingLen = incoming.description.length;
    if (canOverwrite || incomingLen > existingLen + 50) {
      updates.description = incoming.description;
      hasSubstantiveChanges = true;
    }
  }

  // Requirements
  if (incoming.requirements && (!existing.requirements || canOverwrite)) {
    updates.requirements = incoming.requirements;
    hasSubstantiveChanges = true;
  }

  // Salary
  if (incoming.salaryMin !== undefined && incoming.salaryMin !== null) {
    if (existing.salary_min === null || canOverwrite) {
      updates.salary_min = incoming.salaryMin;
      updates.salary_max = incoming.salaryMax ?? existing.salary_max;
      updates.salary_currency = incoming.salaryCurrency || existing.salary_currency || 'INR';
      updates.salary_period = incoming.salaryPeriod || existing.salary_period || 'YEAR';
      hasSubstantiveChanges = true;
    }
  }

  // Experience
  if (incoming.experienceMin !== undefined && incoming.experienceMin !== null) {
    if (existing.experience_min === null || canOverwrite) {
      updates.experience_min = incoming.experienceMin;
      updates.experience_max = incoming.experienceMax ?? existing.experience_max;
      hasSubstantiveChanges = true;
    }
  }

  // Skills: Union & deduplicate
  const existingSkills: string[] = Array.isArray(existing.skills) ? existing.skills : [];
  const incomingSkills: string[] = Array.isArray(incoming.skills) ? incoming.skills : [];
  if (incomingSkills.length > 0) {
    const skillSet = new Set(existingSkills.map((s) => s.toLowerCase()));
    const mergedSkills = [...existingSkills];
    for (const skill of incomingSkills) {
      if (skill && !skillSet.has(skill.toLowerCase())) {
        skillSet.add(skill.toLowerCase());
        mergedSkills.push(skill.trim());
        hasSubstantiveChanges = true;
      }
    }
    updates.skills = mergedSkills;
  }

  // Apply URL & Canonical URL:
  // If existing is an aggregator URL and incoming is a direct career page (higher authority), upgrade it!
  if (normalized.normalizedApplyUrl && canOverwrite) {
    updates.apply_url = normalized.normalizedApplyUrl;
    updates.canonical_url = normalized.normalizedApplyUrl;
  }

  // Update authority source if higher
  if (canOverwrite && incoming.source !== existing.source) {
    updates.source = incoming.source;
    if (incoming.sourceJobId) updates.source_job_id = incoming.sourceJobId;
    if (incoming.sourceUrl) updates.source_url = incoming.sourceUrl;
    hasSubstantiveChanges = true;
  }

  return { merged: updates, hasSubstantiveChanges };
}
