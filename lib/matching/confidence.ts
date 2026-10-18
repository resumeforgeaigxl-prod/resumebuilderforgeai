/**
 * ResumeForge — Match Confidence Evaluator
 * Evaluates the depth and veracity of underlying candidate and job data.
 * Ensures the user knows whether a match score is based on rich facts or sparse guesses.
 */

import type { CandidateApplicationProfile } from '@/lib/capabilities/profile';
import type { CanonicalJobRecord } from '@/lib/jobs/types';
import type { MatchConfidence } from './types';

export interface ConfidenceEvaluationResult {
  confidence: MatchConfidence;
  candidateCompleteness: number; // 0-100
  jobDataRichness: number;        // 0-100
  unknowns: string[];
}

export function evaluateMatchConfidence(
  profile: CandidateApplicationProfile,
  job: CanonicalJobRecord
): ConfidenceEvaluationResult {
  const unknowns: string[] = [];

  // 1. Evaluate Job Data Richness (0 to 100)
  let jobPoints = 0;
  const maxJobPoints = 6;

  // Has parsed skills?
  if (Array.isArray(job.skills) && job.skills.length >= 3) {
    jobPoints++;
  } else {
    unknowns.push('Job lists few or no structured skills');
  }

  // Has detailed description / requirements?
  const descLength = (job.description || '').length + (job.requirements || '').length;
  if (descLength > 300) {
    jobPoints++;
  } else {
    unknowns.push('Job description is very brief or truncated');
  }

  // Has explicit experience requirements?
  if (job.experience_min != null || job.experience_max != null) {
    jobPoints++;
  } else {
    unknowns.push('Experience requirements not explicitly stated by employer');
  }

  // Has clear remote / onsite type?
  if (job.remote_type && job.remote_type !== 'UNKNOWN') {
    jobPoints++;
  } else {
    unknowns.push('Workplace model (remote/onsite/hybrid) is unverified');
  }

  // Has compensation disclosed?
  if (job.salary_min != null || job.salary_max != null) {
    jobPoints++;
  } else {
    unknowns.push('Salary range is not disclosed');
  }

  // Has structured location?
  if (job.city || job.location) {
    jobPoints++;
  } else {
    unknowns.push('Specific work location is unstated');
  }

  const jobDataRichness = Math.round((jobPoints / maxJobPoints) * 100);

  // 2. Evaluate Candidate Data Completeness (0 to 100)
  const candidateCompleteness = profile.completeness?.percentage ?? 50;

  if (candidateCompleteness < 60) {
    unknowns.push('Candidate application profile is partially incomplete');
  }

  // 3. Compute Composite Confidence
  let confidence: MatchConfidence = 'LOW';

  if (candidateCompleteness >= 70 && jobDataRichness >= 65) {
    confidence = 'HIGH';
  } else if (candidateCompleteness >= 50 && jobDataRichness >= 40) {
    confidence = 'MEDIUM';
  } else {
    confidence = 'LOW';
  }

  return {
    confidence,
    candidateCompleteness,
    jobDataRichness,
    unknowns,
  };
}
