import type { RemoteType, EmploymentType } from './types';

/**
 * Normalizes a job title toward standard professional seniority and nomenclature
 * while preserving clear semantic meaning.
 */
export function normalizeTitle(rawTitle: string): string {
  if (!rawTitle) return 'Untitled';

  let title = rawTitle.trim();

  // 1. Remove common ATS job codes or gender tags: [REQ-123], (m/f/d), (w/m/d)
  title = title.replace(/\s*[\(\[](m\/f\/d|w\/m\/d|m\/w\/d|f\/m\/d)[\)\]]/gi, '');
  title = title.replace(/\s*[\(\[]req-?\d+[\)\]]/gi, '');
  title = title.replace(/\s*-\s*remote\s*$/i, '');

  // 2. Normalize standard contractions
  title = title.replace(/\bSr\.?\s+/gi, 'Senior ');
  title = title.replace(/\bJr\.?\s+/gi, 'Junior ');
  title = title.replace(/\bS\/W\b/gi, 'Software');
  title = title.replace(/\bFullstack\b/gi, 'Full Stack');
  title = title.replace(/\bFront-end\b/gi, 'Frontend');
  title = title.replace(/\bBack-end\b/gi, 'Backend');
  title = title.replace(/\bAI\/ML\b/gi, 'AI / ML');

  // 3. Normalize Developer -> Engineer where typical
  title = title.replace(/\bSoftware Developer\b/gi, 'Software Engineer');
  title = title.replace(/\bFull Stack Developer\b/gi, 'Full Stack Engineer');
  title = title.replace(/\bFrontend Developer\b/gi, 'Frontend Engineer');
  title = title.replace(/\bBackend Developer\b/gi, 'Backend Engineer');

  // Collapse multiple whitespaces
  return title.replace(/\s+/g, ' ').trim();
}

/**
 * Normalizes location text and extracts standardized city, state, and country.
 */
export function normalizeLocation(rawLocation?: string | null): {
  locationText: string;
  city?: string;
  state?: string;
  country: string;
} {
  if (!rawLocation || typeof rawLocation !== 'string' || rawLocation.trim().length === 0) {
    return { locationText: 'Remote', city: undefined, country: 'India' };
  }

  const locationText = rawLocation.trim().replace(/\s+/g, ' ');
  const lower = locationText.toLowerCase();

  let city: string | undefined = undefined;
  let state: string | undefined = undefined;
  let country = 'India';

  // Major Indian Cities normalization
  if (lower.includes('bengaluru') || lower.includes('bangalore')) city = 'Bangalore';
  else if (lower.includes('hyderabad') || lower.includes('secunderabad')) city = 'Hyderabad';
  else if (lower.includes('pune')) city = 'Pune';
  else if (lower.includes('mumbai') || lower.includes('bombay') || lower.includes('navi mumbai')) city = 'Mumbai';
  else if (lower.includes('delhi') || lower.includes('noida') || lower.includes('gurgaon') || lower.includes('gurugram')) city = 'Delhi NCR';
  else if (lower.includes('chennai') || lower.includes('madras')) city = 'Chennai';
  else if (lower.includes('kolkata') || lower.includes('calcutta')) city = 'Kolkata';
  else if (lower.includes('ahmedabad')) city = 'Ahmedabad';

  // Country inference
  if (lower.includes('united states') || lower.includes('usa') || lower.includes('us remote') || lower.includes('ca, usa') || lower.includes('ny, usa')) {
    country = 'United States';
  } else if (lower.includes('united kingdom') || lower.includes('london') || lower.includes('uk')) {
    country = 'United Kingdom';
  } else if (lower.includes('canada') || lower.includes('toronto') || lower.includes('vancouver')) {
    country = 'Canada';
  } else if (lower.includes('germany') || lower.includes('berlin') || lower.includes('munich')) {
    country = 'Germany';
  } else if (lower.includes('singapore')) {
    country = 'Singapore';
  } else if (lower.includes('remote') && !lower.includes('india')) {
    // Check if specifically India remote
    country = lower.includes('india') ? 'India' : 'Remote';
  }

  return {
    locationText,
    city,
    state,
    country,
  };
}

/**
 * Normalizes remote workplace policy into controlled enum.
 */
export function normalizeRemoteType(
  location?: string | null,
  title?: string | null,
  rawRemote?: string | null
): RemoteType {
  const combined = `${location || ''} ${title || ''} ${rawRemote || ''}`.toLowerCase();

  if (combined.includes('remote') || combined.includes('work from home') || combined.includes('wfh')) {
    if (combined.includes('hybrid')) return 'HYBRID';
    return 'REMOTE';
  }
  if (combined.includes('hybrid')) return 'HYBRID';
  if (combined.includes('on-site') || combined.includes('onsite') || combined.includes('in-office')) return 'ONSITE';

  return 'UNKNOWN';
}

/**
 * Normalizes employment type into controlled enum.
 */
export function normalizeEmploymentType(
  rawType?: string | null,
  title?: string | null
): EmploymentType {
  const combined = `${rawType || ''} ${title || ''}`.toLowerCase();

  if (combined.includes('intern')) return 'INTERNSHIP';
  if (combined.includes('contract') || combined.includes('freelance') || combined.includes('c2c')) return 'CONTRACT';
  if (combined.includes('part-time') || combined.includes('part time')) return 'PART_TIME';
  if (combined.includes('temporary') || combined.includes('temp')) return 'TEMPORARY';
  if (combined.includes('full-time') || combined.includes('full time') || combined.includes('permanent')) return 'FULL_TIME';

  return 'FULL_TIME'; // Standard default for professional engineering vacancies
}

/**
 * Normalizes URLs:
 * - Ensures http or https protocol
 * - Strips marketing tracking parameters (utm_*, ref, source, fbclid, etc.)
 * - Strips trailing slashes
 * - Rejects invalid, javascript: or data: URLs
 */
export function normalizeUrl(rawUrl?: string | null): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  const trimmed = rawUrl.trim();
  if (trimmed.length === 0) return null;

  // Security guardrail: reject dangerous URL protocols
  if (/^(javascript:|data:|file:|blob:)/i.test(trimmed)) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    // Tracking query parameter blacklist
    const trackingParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'ref',
      'source',
      'fbclid',
      'gclid',
      'trk',
      'trackingId',
      'originalSubdomain',
      'session_id',
    ];

    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }

    // Strip trailing slash if path is not just '/'
    let normalized = parsed.toString();
    if (normalized.endsWith('/') && parsed.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  } catch {
    // Malformed URL string
    return null;
  }
}

/**
 * Extracts normalized company domain from website/apply URL.
 */
export function extractCompanyDomain(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    // Exclude generic job aggregators from being company domain
    const aggregators = ['linkedin.com', 'indeed.com', 'naukri.com', 'glassdoor.com', 'adzuna.com', 'greenhouse.io', 'lever.co', 'ashbyhq.com'];
    if (aggregators.some((agg) => host.includes(agg))) {
      return null;
    }
    return host.replace(/^www\./, '');
  } catch {
    return null;
  }
}
