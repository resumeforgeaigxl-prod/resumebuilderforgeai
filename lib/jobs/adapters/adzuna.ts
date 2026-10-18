import type { CanonicalJobInput, EmploymentType } from '../types';

export interface AdzunaRawJob {
  id: string | number;
  title: string;
  description?: string;
  company?: { display_name?: string };
  location?: { display_name?: string; area?: string[] };
  redirect_url: string;
  contract_type?: string;
  contract_time?: string;
  created?: string;
  salary_min?: number;
  salary_max?: number;
  [key: string]: any;
}

/**
 * Translates raw Adzuna API results into CanonicalJobInput records.
 */
export function adaptAdzunaJobs(rawJobs: AdzunaRawJob[]): CanonicalJobInput[] {
  if (!Array.isArray(rawJobs)) return [];

  return rawJobs.map((raw) => {
    let employmentType: EmploymentType = 'FULL_TIME';
    if (raw.contract_type === 'permanent') employmentType = 'FULL_TIME';
    else if (raw.contract_type === 'contract') employmentType = 'CONTRACT';
    else if (raw.contract_time === 'part_time') employmentType = 'PART_TIME';

    return {
      title: raw.title || 'Untitled',
      company: raw.company?.display_name || 'Unknown',
      location: raw.location?.display_name || 'India',
      country: 'India',
      employmentType,
      description: raw.description || null,
      salaryMin: typeof raw.salary_min === 'number' ? raw.salary_min : null,
      salaryMax: typeof raw.salary_max === 'number' ? raw.salary_max : null,
      salaryCurrency: 'INR',
      salaryPeriod: 'YEAR',
      applyUrl: raw.redirect_url || '',
      canonicalUrl: raw.redirect_url || '',
      source: 'adzuna',
      sourceJobId: String(raw.id || ''),
      sourceUrl: raw.redirect_url || '',
      postedAt: raw.created || null,
      rawPayload: raw,
      status: 'ACTIVE',
    };
  });
}
