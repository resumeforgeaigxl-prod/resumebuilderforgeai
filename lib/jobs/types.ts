/**
 * ResumeForge — Canonical Job Ingestion & Freshness Lifecycle Types
 */

export type JobSourceType =
  | 'growx_crawl'
  | 'adzuna'
  | 'web_search'
  | 'gemini_grounding'
  | 'greenhouse'
  | 'lever'
  | 'ashby'
  | 'jsearch'
  | 'jobforgecollector'
  | 'custom_crawler'
  | 'other';

export type JobStatus = 'ACTIVE' | 'UNKNOWN' | 'CLOSED';

export type RemoteType = 'REMOTE' | 'HYBRID' | 'ONSITE' | 'UNKNOWN';

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'TEMPORARY'
  | 'UNKNOWN';

export type ClosureReason =
  | 'HTTP_GONE'           // HTTP 410 Gone
  | 'HTTP_NOT_FOUND'      // HTTP 404 Not Found
  | 'EXPLICIT_CLOSED_TEXT'// "Job no longer available", "Position filled", etc.
  | 'ATS_INACTIVE'        // ATS structured payload marks vacancy inactive
  | 'EXPIRED'             // Application deadline or validThrough timestamp passed
  | 'SOURCE_REMOVED'      // Aggregator or employer explicitly pulled posting
  | 'MANUAL_ADMIN'        // Admin intervention
  | 'UNKNOWN';

export interface VerificationEvidence {
  httpStatus?: number;
  matchedClosurePhrase?: string;
  atsStatus?: string;
  pageTitle?: string;
  source?: string;
  timestamp: string;
  details?: string;
  [key: string]: any;
}

export interface VerificationResult {
  jobId: string;
  status: JobStatus;
  confidence: number;
  verifiedAt: string;
  nextVerifyAt?: string | null;
  closedAt?: string | null;
  closureReason?: ClosureReason;
  evidence: VerificationEvidence;
  sourceStatuses?: { source: string; status: JobStatus; reason?: string }[];
}

export interface ReplacementCandidate {
  job: CanonicalJobRecord;
  relevanceScore: number; // 0 to 100
  titleScore: number;
  skillsScore: number;
  candidateMatchScore?: number;
  locationScore: number;
  experienceScore: number;
  freshnessScore: number;
  matchReasons: string[];
}

export interface FreshnessBatchResult {
  success: boolean;
  processed: number;
  active: number;
  closed: number;
  unknown: number;
  errors: { jobId: string; reason: string }[];
  durationMs: number;
}

/**
 * Normalized input contract accepted by the canonical ingestion pipeline.
 */
export interface CanonicalJobInput {
  title: string;
  company: string;
  companyDomain?: string | null;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  remoteType?: RemoteType;
  employmentType?: EmploymentType;
  description?: string | null;
  requirements?: string | null;
  experienceMin?: number | null;
  experienceMax?: number | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: 'YEAR' | 'MONTH' | 'HOUR' | null;
  skills?: string[];
  applyUrl: string;
  canonicalUrl?: string | null;
  source: JobSourceType;
  sourceJobId?: string | null;
  sourceUrl?: string | null;
  postedAt?: string | null;
  expiresAt?: string | null;
  rawPayload?: Record<string, any>;
  status?: JobStatus;
}

/**
 * Complete canonical record stored in public.jobs.
 */
export interface CanonicalJobRecord {
  id: string;
  title: string;
  normalized_title: string;
  company: string;
  company_domain?: string | null;
  location: string;
  location_text?: string | null;
  city?: string | null;
  state?: string | null;
  country: string;
  remote_type: RemoteType;
  employment_type: string;
  description?: string | null;
  requirements?: string | null;
  experience_min?: number | null;
  experience_max?: number | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  salary_period?: string | null;
  skills: string[];
  apply_url: string;
  canonical_url: string;
  source: string;
  source_job_id?: string | null;
  source_url?: string | null;
  posted_at?: string | null;
  discovered_at: string;
  last_seen_at: string;
  last_verified_at: string;
  next_verify_at?: string | null;
  closed_at?: string | null;
  expires_at?: string | null;
  verification_attempts: number;
  verification_source?: string | null;
  closure_reason?: ClosureReason | null;
  verification_evidence?: VerificationEvidence;
  status: JobStatus;
  external_id: string;
  dedup_key: string;
  is_mnc?: boolean;
  level?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Occurrence record stored in public.job_sources.
 */
export interface JobSourceOccurrence {
  id: string;
  job_id: string;
  source: JobSourceType;
  source_job_id?: string | null;
  source_url?: string | null;
  apply_url?: string | null;
  raw_payload?: Record<string, any>;
  status: JobStatus;
  last_verified_at?: string | null;
  closure_reason?: ClosureReason | null;
  http_status?: number | null;
  verification_evidence?: VerificationEvidence;
  discovered_at: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

/**
 * Batch ingestion result reported back to external crawlers (Growx Crawl).
 */
export interface JobIngestionResult {
  success: boolean;
  received: number;
  inserted: number;
  updated: number;
  duplicates: number;
  rejected: number;
  errors?: { index: number; reason: string; item?: { title?: string; company?: string } }[];
  durationMs: number;
}
