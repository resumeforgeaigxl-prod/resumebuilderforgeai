import type { CanonicalJobInput, RemoteType, EmploymentType } from '../types';

export interface GrowxCrawlRawJob {
  title: string;
  company: string;
  company_domain?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  job_url?: string | null;
  apply_url?: string | null;
  url?: string | null;
  description?: string | null;
  requirements?: string | null;
  experience?: string | { min?: number | null; max?: number | null } | null;
  experience_min?: number | null;
  experience_max?: number | null;
  salary?: string | { min?: number | null; max?: number | null; currency?: string | null; period?: 'YEAR' | 'MONTH' | 'HOUR' | null } | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  salary_period?: 'YEAR' | 'MONTH' | 'HOUR' | null;
  skills?: string[] | null;
  source_id?: string | null;
  id?: string | null;
  posted_date?: string | null;
  posted_at?: string | null;
  workplace_type?: string | null;
  remote_type?: RemoteType | null;
  employment_type?: EmploymentType | null;
  [key: string]: any;
}

/**
 * Translates raw payloads from Growx Crawl into standardized CanonicalJobInput records.
 */
export function adaptGrowxCrawlJobs(rawPayloads: GrowxCrawlRawJob[]): CanonicalJobInput[] {
  if (!Array.isArray(rawPayloads)) return [];

  return rawPayloads.map((raw) => {
    // 1. Determine apply URL (prioritize direct apply_url over aggregator job_url)
    const applyUrl = raw.apply_url || raw.job_url || raw.url || '';
    const sourceUrl = raw.job_url || raw.url || applyUrl;

    // 2. Parse experience if formatted as object or numbers
    let expMin: number | null = null;
    let expMax: number | null = null;
    if (typeof raw.experience_min === 'number') expMin = raw.experience_min;
    if (typeof raw.experience_max === 'number') expMax = raw.experience_max;
    if (raw.experience && typeof raw.experience === 'object') {
      if (typeof raw.experience.min === 'number') expMin = raw.experience.min;
      if (typeof raw.experience.max === 'number') expMax = raw.experience.max;
    }

    // 3. Parse salary if formatted as object or numbers
    let salMin: number | null = null;
    let salMax: number | null = null;
    let salCurrency: string | null = raw.salary_currency || 'INR';
    let salPeriod: 'YEAR' | 'MONTH' | 'HOUR' | null = raw.salary_period || 'YEAR';

    if (typeof raw.salary_min === 'number') salMin = raw.salary_min;
    if (typeof raw.salary_max === 'number') salMax = raw.salary_max;
    if (raw.salary && typeof raw.salary === 'object') {
      if (typeof raw.salary.min === 'number') salMin = raw.salary.min;
      if (typeof raw.salary.max === 'number') salMax = raw.salary.max;
      if (raw.salary.currency) salCurrency = raw.salary.currency;
      if (raw.salary.period) salPeriod = raw.salary.period;
    }

    // 4. Skills extraction
    let skills: string[] = [];
    if (Array.isArray(raw.skills)) {
      skills = raw.skills.filter((s): s is string => typeof s === 'string' && s.trim().length > 0);
    }

    // 5. Build CanonicalJobInput
    return {
      title: raw.title || '',
      company: raw.company || '',
      companyDomain: raw.company_domain || null,
      location: raw.location || null,
      city: raw.city || null,
      state: raw.state || null,
      country: raw.country || null,
      remoteType: raw.remote_type || (raw.workplace_type?.toUpperCase() as RemoteType) || undefined,
      employmentType: raw.employment_type || undefined,
      description: raw.description || null,
      requirements: raw.requirements || null,
      experienceMin: expMin,
      experienceMax: expMax,
      salaryMin: salMin,
      salaryMax: salMax,
      salaryCurrency: salCurrency,
      salaryPeriod: salPeriod,
      skills,
      applyUrl,
      canonicalUrl: applyUrl,
      source: 'growx_crawl',
      sourceJobId: raw.source_id || raw.id || null,
      sourceUrl,
      postedAt: raw.posted_at || raw.posted_date || null,
      rawPayload: raw,
      status: 'ACTIVE',
    };
  });
}
