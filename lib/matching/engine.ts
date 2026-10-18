/**
 * ResumeForge — Canonical Candidate ↔ Job Matching Engine
 * Deterministic-first matching, ranking, explainability, confidence scoring,
 * and intelligent caching.
 */

import { createClient } from '@/lib/supabase/server';
import { getCandidateApplicationProfile } from '@/lib/capabilities/profile';
import type { CanonicalJobRecord } from '@/lib/jobs/types';
import { MATCH_CONFIG } from './config';
import type {
  CandidateJobMatchResult,
  ComponentScores,
  HardBlocker,
  MatchCategory,
  MatchConfidence,
  MatchEvidenceItem,
  MatchExplanation,
  MatchRecommendation,
  MatchCandidateOptions,
  RankJobsOptions,
} from './types';
import {
  extractCandidateSkills,
  parseJobSkillRequirements,
  evaluateSkillsFit,
} from './skills';
import { evaluateRoleFit } from './roles';
import { evaluateExperienceFit } from './experience';
import {
  evaluateLocationFit,
  evaluateSalaryFit,
  evaluateEmploymentTypeFit,
  evaluateEducationFit,
} from './deterministic';
import { evaluateHardBlockers } from './blockers';
import { evaluateMatchConfidence } from './confidence';
import { evaluateSemanticFit } from './semantic';

/**
 * Calculates or retrieves cached explainable match between a candidate and a canonical job.
 */
export async function matchCandidateToJob(
  options: MatchCandidateOptions
): Promise<CandidateJobMatchResult> {
  const { userId, jobId, forceRecalculate = false } = options;
  const supabase = createClient();

  // 1. Fetch Candidate Profile & Active Resume
  const profile = await getCandidateApplicationProfile(userId);

  const { data: resumeData } = await supabase
    .from('resumes')
    .select('id, updated_at, parsed_json, content')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const resumeJson = resumeData?.parsed_json || null;
  const resumeVersion = resumeData?.updated_at || 'no_resume';
  const profileVersion = `${profile.completeness.percentage}_${profile.readiness.status}`;

  // 2. Fetch Job Record (or use pre-fetched job from options)
  let job: CanonicalJobRecord;
  if (options.job) {
    job = options.job;
  } else {
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .maybeSingle();

    if (jobError || !jobData) {
      throw new Error(`Job not found for ID: ${jobId}`);
    }
    job = jobData as CanonicalJobRecord;
  }

  const jobUpdatedAt = job.updated_at || job.created_at || new Date().toISOString();

  // 3. Cache Validation (unless forceRecalculate is true)
  if (!forceRecalculate) {
    const { data: cachedMatch } = await supabase
      .from('job_matches')
      .select('*')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .maybeSingle();

    if (
      cachedMatch &&
      cachedMatch.match_algorithm_version === MATCH_CONFIG.version &&
      cachedMatch.job_updated_at === jobUpdatedAt &&
      cachedMatch.candidate_profile_version === profileVersion &&
      cachedMatch.resume_version === resumeVersion
    ) {
      // Valid cache hit! Return stored result
      return {
        id: cachedMatch.id,
        userId: cachedMatch.user_id,
        jobId: cachedMatch.job_id,
        job,
        score: cachedMatch.score,
        category: cachedMatch.category as MatchCategory,
        recommendation: cachedMatch.recommendation as MatchRecommendation,
        confidence: cachedMatch.confidence as MatchConfidence,
        componentScores: cachedMatch.component_scores as ComponentScores,
        blockers: (cachedMatch.blockers || []).map((b: string) => ({
          code: 'OTHER',
          reason: b,
        })),
        isBlocked: cachedMatch.recommendation === 'BLOCKED',
        explanation: cachedMatch.explanation as MatchExplanation,
        evidence: (cachedMatch.evidence || []) as MatchEvidenceItem[],
        metadata: {
          candidateProfileVersion: cachedMatch.candidate_profile_version,
          resumeVersion: cachedMatch.resume_version,
          jobUpdatedAt: cachedMatch.job_updated_at,
          matchAlgorithmVersion: cachedMatch.match_algorithm_version,
          evaluatedAt: cachedMatch.updated_at,
        },
      };
    }
  }

  // 4. Compute Match Components
  // A. Skills Fit (35%)
  const candidateSkills = extractCandidateSkills(profile, resumeJson);
  const jobRequirements = parseJobSkillRequirements(job);
  const skillsFitResult = evaluateSkillsFit(candidateSkills, jobRequirements, resumeJson);

  // B. Experience Fit (20%)
  const expFitResult = evaluateExperienceFit(profile, job, resumeJson);

  // C. Role Fit (15%)
  const roleFitResult = evaluateRoleFit(
    profile.preferences?.targetRoles,
    profile.career?.currentRole,
    job.title,
    job.normalized_title
  );

  // D. Location Fit (10%)
  const locFitResult = evaluateLocationFit(profile, job);

  // E. Employment Type Fit (5%)
  const empFitResult = evaluateEmploymentTypeFit(profile, job);

  // F. Salary Fit (5%)
  const salaryFitResult = evaluateSalaryFit(profile, job);

  // G. Education Fit (5%)
  const eduFitResult = evaluateEducationFit(profile, job, resumeJson);

  // H. Semantic Fit (5%)
  const semanticFitResult = evaluateSemanticFit(profile, job, resumeJson);

  // 5. Calculate Weighted Composite Score (0-100)
  const componentScores: ComponentScores = {
    skillsFit: skillsFitResult.score,
    experienceFit: expFitResult.score,
    roleFit: roleFitResult.score,
    locationFit: locFitResult.score,
    employmentFit: empFitResult.score,
    salaryFit: salaryFitResult.score,
    educationFit: eduFitResult.score,
    semanticFit: semanticFitResult.score,
  };

  const weightedScore = Math.round(
    componentScores.skillsFit * MATCH_CONFIG.weights.skillsFit +
    componentScores.experienceFit * MATCH_CONFIG.weights.experienceFit +
    componentScores.roleFit * MATCH_CONFIG.weights.roleFit +
    componentScores.locationFit * MATCH_CONFIG.weights.locationFit +
    componentScores.employmentFit * MATCH_CONFIG.weights.employmentFit +
    componentScores.salaryFit * MATCH_CONFIG.weights.salaryFit +
    componentScores.educationFit * MATCH_CONFIG.weights.educationFit +
    componentScores.semanticFit * MATCH_CONFIG.weights.semanticFit
  );

  const finalScore = Math.min(100, Math.max(0, weightedScore));

  // 6. Score Category
  let category: MatchCategory = 'LOW';
  if (finalScore >= MATCH_CONFIG.thresholds.excellent) category = 'EXCELLENT';
  else if (finalScore >= MATCH_CONFIG.thresholds.strong) category = 'STRONG';
  else if (finalScore >= MATCH_CONFIG.thresholds.possible) category = 'POSSIBLE';
  else if (finalScore >= MATCH_CONFIG.thresholds.weak) category = 'WEAK';
  else category = 'LOW';

  // 7. Confidence Evaluation
  const confidenceResult = evaluateMatchConfidence(profile, job);
  const confidence = confidenceResult.confidence;

  // 8. Hard Blockers Evaluation
  const hardBlockers = evaluateHardBlockers(profile, job, resumeJson);
  const isBlocked = hardBlockers.length > 0;

  // 9. Recommendation Determination
  let recommendation: MatchRecommendation = 'SKIP';

  if (isBlocked) {
    recommendation = 'BLOCKED';
  } else {
    if (finalScore >= MATCH_CONFIG.recommendationThresholds.excellentApply) {
      recommendation = confidence === 'LOW' ? 'STRONG_APPLY' : 'EXCELLENT_APPLY';
    } else if (finalScore >= MATCH_CONFIG.recommendationThresholds.strongApply) {
      recommendation = 'STRONG_APPLY';
    } else if (finalScore >= MATCH_CONFIG.recommendationThresholds.applyIfInterested) {
      recommendation = 'APPLY_IF_INTERESTED';
    } else if (finalScore >= MATCH_CONFIG.recommendationThresholds.lowPriority) {
      recommendation = 'LOW_PRIORITY';
    } else {
      recommendation = 'SKIP';
    }
  }

  // 10. Synthesize Explainability Lists
  const strongMatches: string[] = [];
  const partialMatches: string[] = [];
  const missingRequirements: string[] = [...skillsFitResult.missing];
  const underrepresentedSkills: string[] = [...skillsFitResult.underrepresented];
  const blockerNotes: string[] = hardBlockers.map(b => b.reason);
  const unknowns: string[] = [...confidenceResult.unknowns];

  // Strong matches highlights
  if (skillsFitResult.matched.length > 0) {
    strongMatches.push(
      `Verified skills match: ${skillsFitResult.matched.slice(0, 5).join(', ')}`
    );
  }
  if (expFitResult.score >= 85) {
    strongMatches.push(expFitResult.note);
  }
  if (roleFitResult.score >= 85) {
    strongMatches.push(roleFitResult.affinityNote);
  }
  if (locFitResult.score >= 90) {
    strongMatches.push(locFitResult.note);
  }

  // Partial matches highlights
  if (roleFitResult.score >= 70 && roleFitResult.score < 85) {
    partialMatches.push(roleFitResult.affinityNote);
  }
  if (expFitResult.score >= 60 && expFitResult.score < 85) {
    partialMatches.push(expFitResult.note);
  }
  if (locFitResult.score >= 60 && locFitResult.score < 90) {
    partialMatches.push(locFitResult.note);
  }

  // Summary statement
  let summary = '';
  if (isBlocked) {
    summary = `Application Blocked: ${hardBlockers[0]?.reason || 'Critical requirements mismatch'}.`;
  } else {
    summary = `${category} match (${finalScore}/100) for ${job.title} at ${job.company}. ${
      skillsFitResult.matched.length
    } core skills matched, ${expFitResult.note.toLowerCase()}.`;
  }

  const explanation: MatchExplanation = {
    summary,
    strongMatches,
    partialMatches,
    missingRequirements,
    underrepresentedSkills,
    unknowns,
    blockers: blockerNotes,
  };

  // 11. Evidence Items
  const evidence: MatchEvidenceItem[] = [];

  // Skills evidence
  for (const skill of skillsFitResult.matched) {
    evidence.push({
      requirement: skill,
      candidateEvidence: `Possesses ${skill} with strong project/work experience`,
      jobEvidence: `Mentioned in job requirements for ${job.title}`,
      status: 'MATCHED',
    });
  }

  for (const skill of skillsFitResult.underrepresented) {
    evidence.push({
      requirement: skill,
      candidateEvidence: `Present in candidate profile/skills, but needs more visibility in active resume`,
      jobEvidence: `Required or preferred by ${job.company}`,
      status: 'UNDERREPRESENTED',
    });
  }

  for (const skill of skillsFitResult.missing) {
    evidence.push({
      requirement: skill,
      candidateEvidence: 'No documented experience or project evidence found in profile',
      jobEvidence: `Required by job posting`,
      status: 'MISSING',
    });
  }

  const evaluatedAt = new Date().toISOString();

  // 12. Persist / Upsert into public.job_matches
  const { data: upsertedData, error: upsertError } = await supabase
    .from('job_matches')
    .upsert(
      {
        user_id: userId,
        job_id: jobId,
        score: finalScore,
        category,
        recommendation,
        confidence,
        component_scores: componentScores,
        blockers: blockerNotes,
        strong_matches: strongMatches,
        partial_matches: partialMatches,
        missing_requirements: missingRequirements,
        underrepresented_skills: underrepresentedSkills,
        unknowns,
        explanation,
        evidence,
        candidate_profile_version: profileVersion,
        resume_version: resumeVersion,
        job_updated_at: jobUpdatedAt,
        match_algorithm_version: MATCH_CONFIG.version,
        updated_at: evaluatedAt,
      },
      { onConflict: 'user_id,job_id' }
    )
    .select('id')
    .maybeSingle();

  if (upsertError) {
    console.warn('[matchCandidateToJob] Upsert cache warning:', upsertError.message);
  }

  return {
    id: upsertedData?.id,
    userId,
    jobId,
    job,
    score: finalScore,
    category,
    recommendation,
    confidence,
    componentScores,
    blockers: hardBlockers,
    isBlocked,
    explanation,
    evidence,
    metadata: {
      candidateProfileVersion: profileVersion,
      resumeVersion,
      jobUpdatedAt,
      matchAlgorithmVersion: MATCH_CONFIG.version,
      evaluatedAt,
    },
  };
}

/**
 * 2-Stage High-Performance Ranking Engine
 * Evaluates candidate against a pool of canonical jobs.
 * Stage 1: Fast deterministic prefilter across active jobs.
 * Stage 2: Deep evaluation (skills, semantic, explainability, caching) on top candidates.
 */
export async function rankJobsForCandidate(
  options: RankJobsOptions
): Promise<CandidateJobMatchResult[]> {
  const {
    userId,
    jobIds,
    limit = 20,
    minScore = 0,
    excludeBlocked = true,
  } = options;

  const supabase = createClient();

  // 1. Fetch Candidate Profile
  const profile = await getCandidateApplicationProfile(userId);
  const targetRoles = profile.preferences?.targetRoles || [];
  const candidateSkills = (profile.career?.skills || []).map(s => s.toLowerCase());

  // 2. Fetch Jobs to consider
  let jobsQuery = supabase
    .from('jobs')
    .select('*')
    .neq('status', 'CLOSED');

  if (jobIds && jobIds.length > 0) {
    jobsQuery = jobsQuery.in('id', jobIds);
  } else {
    // Stage 1 Pool: Get up to 100 recent active jobs
    jobsQuery = jobsQuery
      .eq('status', 'ACTIVE')
      .order('discovered_at', { ascending: false })
      .limit(MATCH_CONFIG.batchLimits.maxBatchSize);
  }

  const { data: rawJobs, error: jobsError } = await jobsQuery;
  if (jobsError || !rawJobs || rawJobs.length === 0) {
    return [];
  }

  const candidateJobs = rawJobs as CanonicalJobRecord[];

  // 3. Stage 1: Fast Deterministic Heuristic Scoring
  const scoredStage1 = candidateJobs.map(job => {
    let heuristicScore = 50;

    // Fast Role Family overlap
    const roleFit = evaluateRoleFit(targetRoles, profile.career?.currentRole, job.title, job.normalized_title);
    heuristicScore += (roleFit.score - 50) * 0.4;

    // Fast Skills overlap
    if (Array.isArray(job.skills) && job.skills.length > 0 && candidateSkills.length > 0) {
      const jobSkillsNorm = job.skills.map(s => s.toLowerCase());
      const common = candidateSkills.filter(s => jobSkillsNorm.some(js => js.includes(s) || s.includes(js)));
      heuristicScore += Math.min(30, common.length * 6);
    }

    // Fast Location check
    if (job.remote_type === 'REMOTE') {
      heuristicScore += 10;
    }

    return { job, heuristicScore };
  });

  // Sort Stage 1 results and pick top N for deep evaluation
  scoredStage1.sort((a, b) => b.heuristicScore - a.heuristicScore);
  const topCandidates = scoredStage1
    .slice(0, Math.min(MATCH_CONFIG.batchLimits.stage1CandidateLimit, Math.max(limit * 2, 25)))
    .map(item => item.job);

  // 4. Stage 2: Deep Match Evaluation
  const deepResults: CandidateJobMatchResult[] = [];

  for (const job of topCandidates) {
    try {
      const match = await matchCandidateToJob({
        userId,
        jobId: job.id,
        job,
      });

      // Filter by minScore and excludeBlocked if requested
      if (excludeBlocked && match.isBlocked) {
        continue;
      }
      if (match.score < minScore) {
        continue;
      }

      deepResults.push(match);
    } catch (err) {
      console.error(`[rankJobsForCandidate] Error matching job ${job.id}:`, err);
    }
  }

  // 5. Final Ranking Sort
  // 1. Not blocked first
  // 2. Score descending
  // 3. High confidence over lower confidence
  deepResults.sort((a, b) => {
    if (a.isBlocked !== b.isBlocked) return a.isBlocked ? 1 : -1;
    if (b.score !== a.score) return b.score - a.score;
    const confScore = (c: MatchConfidence) => (c === 'HIGH' ? 3 : c === 'MEDIUM' ? 2 : 1);
    return confScore(b.confidence) - confScore(a.confidence);
  });

  return deepResults.slice(0, limit);
}
