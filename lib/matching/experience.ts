/**
 * ResumeForge — Experience Matching Module
 * Evaluates candidate total and relevant years of experience against canonical job requirements.
 * Implements progressive underqualification penalty while protecting overqualified candidates.
 */

import type { CandidateApplicationProfile } from '@/lib/capabilities/profile';
import type { CanonicalJobRecord } from '@/lib/jobs/types';
import { identifyRoleFamily } from './roles';

export interface ExperienceFitResult {
  score: number;             // 0-100
  candidateYears: number;
  relevantYears: number;
  minRequired?: number | null;
  maxRequired?: number | null;
  gapYears: number;          // Positive if underqualified, 0 if meets/exceeds
  note: string;
  isMassiveGap: boolean;
}

/**
 * Extracts total and role-relevant years of experience from candidate profile and resume data.
 */
export function extractCandidateExperience(
  profile: CandidateApplicationProfile,
  resumeJson?: any,
  targetRoleFamily: string = 'general'
): { totalYears: number; relevantYears: number } {
  let totalYears = profile.career?.totalExperienceYears ?? 0;
  let relevantYears = totalYears;

  // If totalYears wasn't explicitly populated in career profile, compute from resume experience array
  if (totalYears === 0 && resumeJson) {
    const experiences = resumeJson.experience || resumeJson.work_experience || [];
    if (Array.isArray(experiences) && experiences.length > 0) {
      let totalMonths = 0;
      let relevantMonths = 0;

      for (const exp of experiences) {
        const start = exp.startDate || exp.start_date;
        const end = exp.endDate || exp.end_date || 'Present';
        const months = calculateMonthsBetween(start, end);

        totalMonths += months;

        const roleTitle = (exp.title || exp.position || '').toLowerCase();
        const expFamily = identifyRoleFamily(roleTitle);

        if (expFamily === targetRoleFamily || targetRoleFamily === 'general') {
          relevantMonths += months;
        } else {
          relevantMonths += Math.round(months * 0.7); // Transferable software experience
        }
      }

      totalYears = parseFloat((totalMonths / 12).toFixed(1));
      relevantYears = parseFloat((relevantMonths / 12).toFixed(1));
    }
  }

  return {
    totalYears: Math.max(0, totalYears),
    relevantYears: Math.max(0, Math.min(totalYears, relevantYears)),
  };
}

function calculateMonthsBetween(start?: string, end?: string): number {
  if (!start) return 12; // Default 1 year if unparseable
  try {
    const startDate = new Date(start);
    const endDate = !end || end.toLowerCase() === 'present' || end.toLowerCase() === 'current'
      ? new Date()
      : new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 12;

    const diffYears = endDate.getFullYear() - startDate.getFullYear();
    const diffMonths = endDate.getMonth() - startDate.getMonth();
    return Math.max(1, diffYears * 12 + diffMonths);
  } catch {
    return 12;
  }
}

/**
 * Evaluates experience alignment between candidate and canonical job.
 */
export function evaluateExperienceFit(
  profile: CandidateApplicationProfile,
  job: CanonicalJobRecord,
  resumeJson?: any
): ExperienceFitResult {
  const jobFamily = identifyRoleFamily(job.normalized_title || job.title);
  const { totalYears, relevantYears } = extractCandidateExperience(profile, resumeJson, jobFamily);

  const minRequired = job.experience_min != null ? Number(job.experience_min) : null;
  const maxRequired = job.experience_max != null ? Number(job.experience_max) : null;

  // Case 1: Job does not state experience requirements (neutral)
  if (minRequired == null && maxRequired == null) {
    return {
      score: 85,
      candidateYears: totalYears,
      relevantYears,
      minRequired: null,
      maxRequired: null,
      gapYears: 0,
      note: 'No strict minimum experience required by posting (neutral match)',
      isMassiveGap: false,
    };
  }

  const effectiveMin = minRequired ?? 0;
  const gapYears = Math.max(0, effectiveMin - relevantYears);
  const isMassiveGap = gapYears >= 5;

  let score = 100;
  let note = '';

  if (relevantYears >= effectiveMin) {
    // Candidate qualifies or exceeds minimum!
    if (maxRequired && relevantYears > maxRequired + 3) {
      // Significantly senior to posted range (overqualified) - don't penalize harshly, never block
      score = 85;
      note = `${relevantYears} yrs experience exceeds posted range (${effectiveMin}-${maxRequired} yrs). Qualified senior candidate.`;
    } else {
      score = 95;
      note = `${relevantYears} yrs experience meets required threshold of ${effectiveMin}+ yrs`;
    }
  } else {
    // Underqualified - progressive penalty
    if (gapYears <= 1) {
      score = 75;
      note = `Close experience fit: ${relevantYears} yrs vs ${effectiveMin} yrs required (minor gap of ${gapYears.toFixed(1)} yr)`;
    } else if (gapYears <= 2) {
      score = 60;
      note = `Moderate experience gap: ${relevantYears} yrs vs ${effectiveMin} yrs required (${gapYears.toFixed(1)} yrs under)`;
    } else if (gapYears <= 4) {
      score = 40;
      note = `Noticeable experience gap: ${relevantYears} yrs vs ${effectiveMin} yrs required`;
    } else {
      // Massive gap (>= 5 years)
      score = 20;
      note = `Significant experience gap: ${relevantYears} yrs vs ${effectiveMin} yrs required (${gapYears.toFixed(1)} yrs deficit)`;
    }
  }

  return {
    score: Math.min(100, Math.max(10, score)),
    candidateYears: totalYears,
    relevantYears,
    minRequired,
    maxRequired,
    gapYears,
    note,
    isMassiveGap,
  };
}
