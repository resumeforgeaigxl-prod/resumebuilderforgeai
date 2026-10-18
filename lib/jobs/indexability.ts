/**
 * ResumeForge — Public Job Indexability & Schema.org/JobPosting Generator
 * Determines whether a job is eligible for search engine indexing and constructs
 * strictly compliant, non-fabricated JSON-LD structured data.
 */

import type { CanonicalJobRecord } from './types';

export interface IndexabilityResult {
  eligible: boolean;
  reasons: string[];
}

const PLACEHOLDER_COMPANIES = new Set([
  'test',
  'dummy',
  'confidential',
  'anonymous',
  'unknown',
  'n/a',
  'na',
  'sample company',
]);

const PLACEHOLDER_TITLES = new Set([
  'test',
  'dummy',
  'asdf',
  'sample',
  'n/a',
  'na',
  'tbd',
  'position',
  'job',
]);

/**
 * Server-side evaluation to determine if a job satisfies strict SEO quality criteria.
 * Low-quality, test, incomplete, closed, or spam vacancies must never be indexed.
 */
export function isJobIndexable(job: Partial<CanonicalJobRecord> | any): IndexabilityResult {
  const reasons: string[] = [];

  if (!job) {
    return { eligible: false, reasons: ['Job record is missing or null'] };
  }

  // 1. Status check — strictly ACTIVE jobs only
  if (job.status !== 'ACTIVE') {
    reasons.push(`Job status is ${job.status || 'UNKNOWN'}, must be ACTIVE for public search indexing`);
  }

  // 2. Meaningful title check
  const title = (job.title || '').trim();
  if (title.length < 3) {
    reasons.push('Job title is too short (less than 3 characters)');
  }
  if (PLACEHOLDER_TITLES.has(title.toLowerCase())) {
    reasons.push(`Job title "${title}" appears to be a placeholder or test string`);
  }

  // 3. Valid company name check
  const company = (job.company || '').trim();
  if (company.length < 2) {
    reasons.push('Company name is missing or too short');
  }
  if (PLACEHOLDER_COMPANIES.has(company.toLowerCase())) {
    reasons.push(`Company name "${company}" is anonymous or a placeholder`);
  }

  // 4. Meaningful description check (minimum 100 characters)
  const description = (job.description || '').trim();
  if (description.length < 100) {
    reasons.push(`Job description is too brief (${description.length} characters, minimum 100 required)`);
  }

  // 5. Valid apply or source destination
  const applyUrl = job.apply_url || job.source_url || job.canonical_url;
  if (!applyUrl || !applyUrl.startsWith('http')) {
    reasons.push('Job lacks a valid HTTP/HTTPS application destination');
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

/**
 * Builds valid schema.org/JobPosting JSON-LD based strictly on genuine canonical data.
 * Emits NULL if the vacancy is CLOSED, UNKNOWN, or fails quality criteria.
 */
export function buildJobPostingJsonLd(
  job: Partial<CanonicalJobRecord> | any,
  canonicalUrl: string
): Record<string, any> | null {
  // Only ACTIVE, eligible jobs may emit active JobPosting structured data
  const { eligible } = isJobIndexable(job);
  if (!eligible || job.status !== 'ACTIVE') {
    return null;
  }

  // 1. Core metadata
  const jsonLd: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title.trim(),
    description: job.description.trim(),
    identifier: {
      '@type': 'PropertyValue',
      name: job.company.trim(),
      value: job.id,
    },
    // Preserve original source datePosted when available; never substitute discovery date
    datePosted: job.posted_at || job.created_at || new Date().toISOString(),
    url: canonicalUrl,
    directApply: true,
  };

  // 2. Application deadline / validThrough
  if (job.expires_at) {
    jsonLd.validThrough = job.expires_at;
  }

  // 3. Hiring organization
  const hiringOrg: Record<string, any> = {
    '@type': 'Organization',
    name: job.company.trim(),
  };
  if (job.company_domain && !job.company_domain.includes('example.com')) {
    hiringOrg.sameAs = job.company_domain.startsWith('http')
      ? job.company_domain
      : `https://${job.company_domain}`;
  }
  if (job.logo_url && job.logo_url.startsWith('http')) {
    hiringOrg.logo = job.logo_url;
  }
  jsonLd.hiringOrganization = hiringOrg;

  // 4. Employment type mapping
  const empTypeMap: Record<string, string> = {
    FULL_TIME: 'FULL_TIME',
    'Full-time': 'FULL_TIME',
    PART_TIME: 'PART_TIME',
    'Part-time': 'PART_TIME',
    CONTRACT: 'CONTRACTOR',
    Contract: 'CONTRACTOR',
    INTERNSHIP: 'INTERN',
    Internship: 'INTERN',
    TEMPORARY: 'TEMPORARY',
  };
  const mappedEmpType = empTypeMap[job.employment_type || job.job_type || ''] || 'FULL_TIME';
  jsonLd.employmentType = mappedEmpType;

  // 5. Location & Remote (Telecommute) handling
  const isRemote = job.remote_type === 'REMOTE' || (job.location || '').toLowerCase().includes('remote');

  if (isRemote) {
    jsonLd.jobLocationType = 'TELECOMMUTE';
    jsonLd.applicantLocationRequirements = {
      '@type': 'Country',
      name: job.country || 'India',
    };
  }

  // Physical job location
  if (job.city || job.location) {
    const addressLocality = job.city || job.location || 'India';
    jsonLd.jobLocation = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality,
        ...(job.state ? { addressRegion: job.state } : {}),
        addressCountry: job.country || 'IN',
      },
    };
  }

  // 6. Base salary (Strict: ONLY output when genuine numeric salary is available)
  const minSal = typeof job.salary_min === 'number' && job.salary_min > 0 ? job.salary_min : null;
  const maxSal = typeof job.salary_max === 'number' && job.salary_max > 0 ? job.salary_max : null;

  if (minSal !== null || maxSal !== null) {
    const currency = job.salary_currency || 'INR';
    const unitText = job.salary_period === 'HOUR' ? 'HOUR' : job.salary_period === 'MONTH' ? 'MONTH' : 'YEAR';

    if (minSal !== null && maxSal !== null) {
      jsonLd.baseSalary = {
        '@type': 'MonetaryAmount',
        currency,
        value: {
          '@type': 'QuantitativeValue',
          minValue: minSal,
          maxValue: maxSal,
          unitText,
        },
      };
    } else {
      jsonLd.baseSalary = {
        '@type': 'MonetaryAmount',
        currency,
        value: {
          '@type': 'QuantitativeValue',
          value: minSal ?? maxSal,
          unitText,
        },
      };
    }
  }

  return jsonLd;
}
