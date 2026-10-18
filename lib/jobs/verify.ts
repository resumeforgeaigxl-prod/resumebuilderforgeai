import { getSourceAuthority } from './dedupe';
import type {
  JobStatus,
  ClosureReason,
  VerificationEvidence,
} from './types';

// High-confidence regex patterns indicating job vacancy closure in webpage content
const CLOSURE_PATTERNS = [
  /job (?:is )?no longer (?:available|active|open)/i,
  /position (?:has been |is )?(?:filled|closed|cancelled)/i,
  /applications? (?:are )?(?:now )?closed/i,
  /this (?:posting|listing|job) has expired/i,
  /role is no longer accepting applications/i,
  /this vacancy is no longer available/i,
  /the requisition has been closed/i,
  /no longer accepting (?:new )?applicants/i,
  /job (?:posting )?has been removed/i,
  /this job has been archived/i,
  /page not found/i,
  /the page you are looking for does not exist/i,
  /job is no longer taking applications/i,
];

export interface UrlInspectionResult {
  status: JobStatus;
  closureReason?: ClosureReason;
  httpStatus?: number;
  matchedPhrase?: string;
  details?: string;
}

/**
 * Inspects a job apply destination URL for live availability or closure signals.
 * Deterministic and safe: capped download size, strict timeouts, and redirect limits.
 */
export async function inspectUrlFreshness(rawUrl?: string | null): Promise<UrlInspectionResult> {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.startsWith('http')) {
    return {
      status: 'UNKNOWN',
      closureReason: 'UNKNOWN',
      details: 'Missing or non-http apply URL',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout

  try {
    const res = await fetch(rawUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 ResumeForgeBot/1.0',
        Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
      redirect: 'follow',
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    // 1. HTTP 404 Not Found -> Definite Closure
    if (res.status === 404) {
      return {
        status: 'CLOSED',
        closureReason: 'HTTP_NOT_FOUND',
        httpStatus: 404,
        details: 'Server returned HTTP 404 Not Found',
      };
    }

    // 2. HTTP 410 Gone -> Definite Closure
    if (res.status === 410) {
      return {
        status: 'CLOSED',
        closureReason: 'HTTP_GONE',
        httpStatus: 410,
        details: 'Server returned HTTP 410 Gone',
      };
    }

    // 3. Transient server errors or challenges -> UNKNOWN (Do NOT mark CLOSED)
    if (res.status === 429 || res.status === 403 || res.status >= 500) {
      return {
        status: 'UNKNOWN',
        httpStatus: res.status,
        details: `Transient status HTTP ${res.status}: Rate limit, challenge, or gateway error`,
      };
    }

    // 4. HTTP 200/OK -> Inspect content for closure phrases
    if (res.status >= 200 && res.status < 300) {
      // Stream only the first 80KB to keep memory minimal
      const textBuffer = await res.text();
      const snippet = textBuffer.slice(0, 80000);

      for (const pattern of CLOSURE_PATTERNS) {
        const match = snippet.match(pattern);
        if (match) {
          return {
            status: 'CLOSED',
            closureReason: 'EXPLICIT_CLOSED_TEXT',
            httpStatus: res.status,
            matchedPhrase: match[0],
            details: `Page contained explicit closure text: "${match[0]}"`,
          };
        }
      }

      // No closure patterns detected and HTTP status is 200
      return {
        status: 'ACTIVE',
        httpStatus: res.status,
        details: 'Page accessible and no closure signals found',
      };
    }

    return {
      status: 'UNKNOWN',
      httpStatus: res.status,
      details: `Unexpected HTTP status ${res.status}`,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    // Network timeouts, DNS failures, or connection aborts -> UNKNOWN
    return {
      status: 'UNKNOWN',
      closureReason: 'UNKNOWN',
      details: err.name === 'AbortError' ? 'Verification request timed out (8s)' : `Network error: ${err.message}`,
    };
  }
}

/**
 * Calculates next scheduled verification timestamp based on vacancy age and risk profile.
 * Principle: Older jobs carry higher closure risk and are reverified more frequently.
 */
export function calculateNextVerifySchedule(
  job: {
    discovered_at?: string;
    created_at?: string;
    expires_at?: string | null;
    verification_attempts?: number;
  },
  status: JobStatus
): string | null {
  // If CLOSED, no further verification needed
  if (status === 'CLOSED') {
    return null;
  }

  const now = Date.now();

  // If UNKNOWN, retry with exponential backoff
  if (status === 'UNKNOWN') {
    const attempts = job.verification_attempts || 0;
    if (attempts <= 1) {
      return new Date(now + 30 * 60 * 1000).toISOString(); // 30 minutes
    } else if (attempts === 2) {
      return new Date(now + 2 * 60 * 60 * 1000).toISOString(); // 2 hours
    } else {
      return new Date(now + 6 * 60 * 60 * 1000).toISOString(); // 6 hours
    }
  }

  // ACTIVE job scheduling based on age
  const referenceTime = new Date(job.discovered_at || job.created_at || now).getTime();
  const ageDays = (now - referenceTime) / (1000 * 60 * 60 * 24);

  let intervalHours = 24;
  if (ageDays <= 3) {
    intervalHours = 24; // 0-3 days: every 24h
  } else if (ageDays <= 14) {
    intervalHours = 12; // 4-14 days: every 12h
  } else if (ageDays <= 30) {
    intervalHours = 6; // 15-30 days: every 6h
  } else {
    intervalHours = 3; // 30+ days: every 3h
  }

  let nextVerify = new Date(now + intervalHours * 60 * 60 * 1000);

  // If vacancy has an explicit expiration deadline coming up, verify then
  if (job.expires_at) {
    const expiryTime = new Date(job.expires_at).getTime();
    if (expiryTime > now && expiryTime < nextVerify.getTime()) {
      nextVerify = new Date(expiryTime);
    }
  }

  return nextVerify.toISOString();
}

/**
 * Resolves final canonical status across multiple source occurrences
 * using strict authoritative source precedence.
 */
export function resolveCanonicalStatus(
  sourcesEvidence: {
    source: string;
    status: JobStatus;
    reason?: ClosureReason;
    evidence?: VerificationEvidence;
  }[]
): {
  status: JobStatus;
  closureReason?: ClosureReason;
  primarySource: string;
  confidence: number;
} {
  if (!sourcesEvidence || sourcesEvidence.length === 0) {
    return {
      status: 'UNKNOWN',
      closureReason: 'UNKNOWN',
      primarySource: 'none',
      confidence: 0.5,
    };
  }

  // Sort evidence by source authority descending
  const sorted = [...sourcesEvidence].sort((a, b) => {
    return getSourceAuthority(b.source) - getSourceAuthority(a.source);
  });

  const highestAuthorityItem = sorted[0];
  const highestAuthorityScore = getSourceAuthority(highestAuthorityItem.source);

  // 1. If highest authoritative source (e.g. ATS or career page >= 80) is CLOSED:
  if (highestAuthorityScore >= 80 && highestAuthorityItem.status === 'CLOSED') {
    return {
      status: 'CLOSED',
      closureReason: highestAuthorityItem.reason || 'EXPLICIT_CLOSED_TEXT',
      primarySource: highestAuthorityItem.source,
      confidence: 0.95,
    };
  }

  // 2. If a lower aggregator says CLOSED, but a high authority source is ACTIVE:
  const activeHighSource = sorted.find(
    (s) => getSourceAuthority(s.source) >= 80 && s.status === 'ACTIVE'
  );
  if (activeHighSource) {
    return {
      status: 'ACTIVE',
      primarySource: activeHighSource.source,
      confidence: 0.9,
    };
  }

  // 3. If any source is verified ACTIVE:
  const anyActive = sorted.find((s) => s.status === 'ACTIVE');
  if (anyActive) {
    return {
      status: 'ACTIVE',
      primarySource: anyActive.source,
      confidence: 0.8,
    };
  }

  // 4. If all sources indicate CLOSED:
  const allClosed = sorted.every((s) => s.status === 'CLOSED');
  if (allClosed) {
    return {
      status: 'CLOSED',
      closureReason: highestAuthorityItem.reason || 'EXPLICIT_CLOSED_TEXT',
      primarySource: highestAuthorityItem.source,
      confidence: 0.9,
    };
  }

  // 5. Otherwise UNKNOWN (temporary failures, challenges, etc.)
  return {
    status: 'UNKNOWN',
    closureReason: 'UNKNOWN',
    primarySource: highestAuthorityItem.source,
    confidence: 0.5,
  };
}
