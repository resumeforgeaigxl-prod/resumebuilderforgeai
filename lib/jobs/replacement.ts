import { createAdminClient } from '@/lib/supabase/admin';
import { getCandidateApplicationProfile } from '@/lib/capabilities/profile';
import type {
  CanonicalJobRecord,
  ReplacementCandidate,
} from './types';

export interface ReplacementWeights {
  titleWeight: number;       // default 0.30 (or 0.40 if anonymous)
  skillsWeight: number;      // default 0.25 (or 0.30 if anonymous)
  candidateWeight: number;   // default 0.20 (or 0.00 if anonymous)
  locationWeight: number;    // default 0.10 (or 0.15 if anonymous)
  experienceWeight: number;  // default 0.10 (or 0.10 if anonymous)
  freshnessWeight: number;   // default 0.05 (or 0.05 if anonymous)
}

const DEFAULT_AUTH_WEIGHTS: ReplacementWeights = {
  titleWeight: 0.30,
  skillsWeight: 0.25,
  candidateWeight: 0.20,
  locationWeight: 0.10,
  experienceWeight: 0.10,
  freshnessWeight: 0.05,
};

const DEFAULT_ANON_WEIGHTS: ReplacementWeights = {
  titleWeight: 0.40,
  skillsWeight: 0.30,
  candidateWeight: 0.00,
  locationWeight: 0.15,
  experienceWeight: 0.10,
  freshnessWeight: 0.05,
};

export interface FindReplacementsOptions {
  jobId: string;
  userId?: string | null;
  limit?: number; // default 3, max 5
  weights?: Partial<ReplacementWeights>;
}

export interface ReplacementResult {
  originalJobId: string;
  originalJobTitle: string;
  originalCompany: string;
  originalStatus: string;
  count: number;
  replacements: ReplacementCandidate[];
}

/**
 * Replacement Engine
 * When a vacancy is CLOSED, discovers 3–5 high-quality, currently ACTIVE alternatives
 * using multi-factor weighted relevance scoring and optional candidate profile grounding.
 */
export async function findReplacementJobs(
  options: FindReplacementsOptions
): Promise<ReplacementResult> {
  const { jobId, userId, limit = 3 } = options;
  const maxResults = Math.min(Math.max(1, limit), 5); // strict 3-5 range
  const supabase = createAdminClient();

  // 1. Fetch the original reference job
  const { data: originalJob, error: origError } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (origError || !originalJob) {
    throw new Error(`Reference job not found: ${jobId}`);
  }

  // 2. Fetch candidate profile if authenticated
  let candidateProfile: any = null;
  if (userId) {
    try {
      candidateProfile = await getCandidateApplicationProfile(userId);
    } catch {
      // Non-fatal: fallback to anonymous weights
      candidateProfile = null;
    }
  }

  const weights: ReplacementWeights = candidateProfile
    ? { ...DEFAULT_AUTH_WEIGHTS, ...options.weights }
    : { ...DEFAULT_ANON_WEIGHTS, ...options.weights };

  // 3. Query potential ACTIVE candidate vacancies (excluding the original job and any CLOSED jobs)
  const normalizedTitle = originalJob.normalized_title || originalJob.title || '';
  const searchKeywords = normalizedTitle
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(/\s+/)
    .filter((w: string) => w.length > 2 && !['and', 'the', 'for', 'with'].includes(w));

  const primaryKeyword = searchKeywords[0] || 'engineer';

  const { data: activePool, error: poolError } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'ACTIVE') // STRICT: NEVER return CLOSED jobs
    .neq('id', jobId)
    .or(`title.ilike.%${primaryKeyword}%,normalized_title.ilike.%${primaryKeyword}%,company.ilike.%${primaryKeyword}%`)
    .order('last_seen_at', { ascending: false })
    .limit(30);

  if (poolError || !activePool || activePool.length === 0) {
    return {
      originalJobId: jobId,
      originalJobTitle: originalJob.title,
      originalCompany: originalJob.company,
      originalStatus: originalJob.status,
      count: 0,
      replacements: [],
    };
  }

  // 4. Score each active candidate vacancy
  const scoredCandidates: ReplacementCandidate[] = [];

  for (const candidate of activePool as CanonicalJobRecord[]) {
    // A. Title Similarity (0-100)
    const titleScore = computeTitleSimilarity(normalizedTitle, candidate.normalized_title || candidate.title);

    // B. Skills Overlap (0-100)
    const skillsScore = computeSkillsOverlap(originalJob.skills || [], candidate.skills || []);

    // C. Location Fit (0-100)
    const locationScore = computeLocationFit(originalJob, candidate, candidateProfile);

    // D. Experience Fit (0-100)
    const experienceScore = computeExperienceFit(originalJob, candidate, candidateProfile);

    // E. Freshness Score (0-100)
    const freshnessScore = computeFreshnessScore(candidate);

    // F. Candidate Match Score (0-100, if profile present)
    let candidateMatchScore = 0;
    if (candidateProfile) {
      candidateMatchScore = computeCandidateProfileMatch(candidate, candidateProfile);
    }

    // Weighted Overall Score
    const totalScore = Math.round(
      titleScore * weights.titleWeight +
      skillsScore * weights.skillsWeight +
      candidateMatchScore * weights.candidateWeight +
      locationScore * weights.locationWeight +
      experienceScore * weights.experienceWeight +
      freshnessScore * weights.freshnessWeight
    );

    // Collect structured match explanations
    const matchReasons: string[] = [];
    if (titleScore >= 70) matchReasons.push('Similar technical role');
    if (skillsScore >= 60) matchReasons.push('Strong skill overlap');
    if (candidate.remote_type === 'REMOTE' || candidate.remote_type === originalJob.remote_type) {
      matchReasons.push('Compatible workplace model');
    }
    if (candidateMatchScore >= 75) matchReasons.push('High candidate profile fit');

    scoredCandidates.push({
      job: candidate,
      relevanceScore: Math.min(100, Math.max(0, totalScore)),
      titleScore,
      skillsScore,
      candidateMatchScore: candidateProfile ? candidateMatchScore : undefined,
      locationScore,
      experienceScore,
      freshnessScore,
      matchReasons,
    });
  }

  // 5. Sort descending by relevanceScore and take top N (3 to 5)
  scoredCandidates.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const topReplacements = scoredCandidates.slice(0, maxResults);

  return {
    originalJobId: jobId,
    originalJobTitle: originalJob.title,
    originalCompany: originalJob.company,
    originalStatus: originalJob.status,
    count: topReplacements.length,
    replacements: topReplacements,
  };
}

// ─── Scoring Helpers ──────────────────────────────────────────────────────────

function computeTitleSimilarity(titleA: string, titleB: string): number {
  const wordsA = new Set(titleA.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean));
  const wordsB = new Set(titleB.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 50;

  let intersection = 0;
  wordsA.forEach((w) => {
    if (wordsB.has(w)) intersection++;
  });
  const union = new Set(Array.from(wordsA).concat(Array.from(wordsB))).size;
  const jaccard = (intersection / union) * 100;

  // Seniority bonus if both share 'senior', 'lead', or 'staff'
  const isSeniorA = titleA.toLowerCase().includes('senior') || titleA.toLowerCase().includes('lead');
  const isSeniorB = titleB.toLowerCase().includes('senior') || titleB.toLowerCase().includes('lead');
  const seniorityBonus = isSeniorA === isSeniorB ? 10 : -10;

  return Math.min(100, Math.max(20, Math.round(jaccard * 0.8 + seniorityBonus + 20)));
}

function computeSkillsOverlap(skillsA: string[], skillsB: string[]): number {
  if (!skillsA.length || !skillsB.length) return 50;
  const setA = new Set(skillsA.map((s) => s.toLowerCase().trim()));
  const setB = new Set(skillsB.map((s) => s.toLowerCase().trim()));

  let matched = 0;
  setA.forEach((s) => {
    if (setB.has(s)) matched++;
  });
  const overlapRatio = (matched / Math.min(setA.size, setB.size)) * 100;
  return Math.min(100, Math.max(10, Math.round(overlapRatio)));
}

function computeLocationFit(jobA: any, jobB: any, profile?: any): number {
  // If either is REMOTE, excellent fit
  if (jobA.remote_type === 'REMOTE' || jobB.remote_type === 'REMOTE') return 100;
  // If same city
  if (jobA.city && jobB.city && jobA.city.toLowerCase() === jobB.city.toLowerCase()) return 95;
  // If same country
  if (jobA.country && jobB.country && jobA.country.toLowerCase() === jobB.country.toLowerCase()) return 70;
  // Check profile location preferences if present
  if (profile?.preferences?.targetLocations) {
    const targetLocs: string[] = profile.preferences.targetLocations.map((l: string) => l.toLowerCase());
    if (jobB.city && targetLocs.some((tl: string) => tl.includes(jobB.city.toLowerCase()))) return 95;
  }
  return 40;
}

function computeExperienceFit(jobA: any, jobB: any, profile?: any): number {
  const expA = jobA.experience_min ?? 2;
  const expB = jobB.experience_min ?? 2;
  const diff = Math.abs(expA - expB);
  if (diff === 0) return 100;
  if (diff <= 1) return 85;
  if (diff <= 2) return 70;
  return 40;
}

function computeFreshnessScore(candidate: CanonicalJobRecord): number {
  const reference = candidate.last_seen_at || candidate.created_at;
  if (!reference) return 50;
  const daysAgo = (Date.now() - new Date(reference).getTime()) / (1000 * 60 * 60 * 24);
  if (daysAgo <= 2) return 100;
  if (daysAgo <= 7) return 85;
  if (daysAgo <= 14) return 70;
  return 50;
}

function computeCandidateProfileMatch(job: CanonicalJobRecord, profile: any): number {
  let score = 70;
  // Match candidate target roles
  if (profile.preferences?.targetRoles && Array.isArray(profile.preferences.targetRoles)) {
    const roles: string[] = profile.preferences.targetRoles.map((r: string) => r.toLowerCase());
    const jobTitle = (job.normalized_title || job.title).toLowerCase();
    if (roles.some((r) => jobTitle.includes(r))) {
      score += 15;
    }
  }
  // Match candidate verified skills
  if (profile.skills && Array.isArray(profile.skills)) {
    const profileSkills = new Set(profile.skills.map((s: string) => s.toLowerCase()));
    const jobSkills = job.skills || [];
    const hits = jobSkills.filter((s: string) => profileSkills.has(s.toLowerCase())).length;
    if (hits >= 3) score += 15;
    else if (hits >= 1) score += 10;
  }
  return Math.min(100, Math.max(40, score));
}
