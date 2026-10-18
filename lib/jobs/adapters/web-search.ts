import type { CanonicalJobInput, JobSourceType } from '../types';

export interface GroundedJobSearchItem {
  title?: string;
  company?: string;
  location?: string;
  job_type?: string;
  apply_url?: string;
  url?: string;
  description?: string;
  requirements?: string;
  [key: string]: any;
}

export interface GenericSearchResultItem {
  title: string;
  description: string;
  url: string;
}

/**
 * Translates Gemini Grounded Search results into CanonicalJobInput records.
 */
export function adaptGroundedSearchResults(
  items: GroundedJobSearchItem[],
  source: JobSourceType = 'gemini_grounding'
): CanonicalJobInput[] {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item && (item.title || item.company) && (item.apply_url || item.url))
    .map((item) => {
      const applyUrl = item.apply_url || item.url || '';
      return {
        title: item.title || 'Software Opportunity',
        company: item.company || 'Tech Employer',
        location: item.location || 'India',
        description: item.description || null,
        requirements: item.requirements || null,
        applyUrl,
        canonicalUrl: applyUrl,
        source,
        sourceUrl: applyUrl,
        rawPayload: item,
        status: 'ACTIVE',
      };
    });
}

/**
 * Translates organic web search results (Serper, Tavily) into CanonicalJobInput records.
 */
export function adaptOrganicSearchResults(
  items: GenericSearchResultItem[],
  query?: string,
  source: JobSourceType = 'web_search'
): CanonicalJobInput[] {
  if (!Array.isArray(items)) return [];

  return items
    .filter((item) => item && item.url && item.title)
    .map((item) => {
      // Extract tentative company name from title (e.g. "Software Engineer at Google" or "Google - Software Engineer")
      let company = 'Company';
      let title = item.title;

      if (title.includes(' at ')) {
        const parts = title.split(' at ');
        title = parts[0].trim();
        company = parts[1].split(/[-–|]/)[0].trim();
      } else if (title.includes(' - ')) {
        const parts = title.split(' - ');
        company = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      } else if (title.includes(' | ')) {
        const parts = title.split(' | ');
        title = parts[0].trim();
        company = parts[1].trim();
      }

      return {
        title,
        company,
        location: 'Remote',
        description: item.description,
        applyUrl: item.url,
        canonicalUrl: item.url,
        source,
        sourceUrl: item.url,
        rawPayload: { ...item, originalQuery: query },
        status: 'ACTIVE',
      };
    });
}
