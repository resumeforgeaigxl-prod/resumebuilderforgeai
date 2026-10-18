/**
 * ResumeForge — Hard Blockers Evaluation Module
 * Detects definitive non-negotiable obstacles that immediately override recommendation to BLOCKED.
 * Prevents wasted applications and preserves candidate trust.
 */

import type { CandidateApplicationProfile } from '@/lib/capabilities/profile';
import type { CanonicalJobRecord } from '@/lib/jobs/types';
import type { HardBlocker } from './types';
import { evaluateLocationFit } from './deterministic';
import { evaluateSalaryFit } from './deterministic';
import { evaluateEmploymentTypeFit } from './deterministic';
import { evaluateExperienceFit } from './experience';

export function evaluateHardBlockers(
  profile: CandidateApplicationProfile,
  job: CanonicalJobRecord,
  resumeJson?: any
): HardBlocker[] {
  const blockers: HardBlocker[] = [];

  // 1. Blocker: JOB_CLOSED (CRITICAL RULE: Closed jobs must NEVER receive an apply recommendation)
  if (job.status === 'CLOSED') {
    blockers.push({
      code: 'JOB_CLOSED',
      reason: 'This job posting has been detected as closed or expired. Applications are no longer accepted.',
      evidence: `Status: ${job.status}, Closure reason: ${job.closure_reason || 'Posting unavailable'}`,
    });
  }

  // 2. Blocker: EXCLUDED_COMPANY (Companies candidate explicitly asked to avoid)
  const companiesToAvoid = profile.preferences?.companiesToAvoid || [];
  const jobCompany = (job.company || '').toLowerCase().trim();
  if (jobCompany && companiesToAvoid.length > 0) {
    const isExcluded = companiesToAvoid.some(avoid => {
      const cleanAvoid = avoid.toLowerCase().trim();
      return (
        cleanAvoid &&
        (jobCompany.includes(cleanAvoid) || cleanAvoid.includes(jobCompany))
      );
    });

    if (isExcluded) {
      blockers.push({
        code: 'EXCLUDED_COMPANY',
        reason: `${job.company} is in your list of companies to avoid.`,
        evidence: `Matches candidate exclusion preference: "${job.company}"`,
      });
    }
  }

  // 3. Blocker: LOCATION_INCOMPATIBLE
  const locResult = evaluateLocationFit(profile, job);
  if (locResult.isHardIncompatible) {
    blockers.push({
      code: 'LOCATION_INCOMPATIBLE',
      reason: locResult.note,
      evidence: `Job: ${job.location || job.remote_type}, Candidate: ${profile.identity?.currentCity || 'Unspecified'} (Willing to relocate: ${profile.preferences?.willingToRelocate ? 'Yes' : 'No'})`,
    });
  }

  // 4. Blocker: SALARY_BELOW_MINIMUM
  const salaryResult = evaluateSalaryFit(profile, job);
  if (salaryResult.isHardBelowMinimum) {
    blockers.push({
      code: 'SALARY_BELOW_MINIMUM',
      reason: salaryResult.note,
      evidence: `Candidate hard minimum: ${profile.preferences?.minExpectedSalary}, Job max: ${job.salary_max || job.salary_min}`,
    });
  }

  // 5. Blocker: EMPLOYMENT_TYPE_INCOMPATIBLE
  const empResult = evaluateEmploymentTypeFit(profile, job);
  if (empResult.isHardIncompatible) {
    blockers.push({
      code: 'EMPLOYMENT_TYPE_INCOMPATIBLE',
      reason: empResult.note,
      evidence: `Job type: ${job.employment_type}`,
    });
  }

  // 6. Blocker: EXPERIENCE_GAP_MASSIVE
  const expResult = evaluateExperienceFit(profile, job, resumeJson);
  if (expResult.isMassiveGap) {
    blockers.push({
      code: 'EXPERIENCE_GAP_MASSIVE',
      reason: `Significant experience deficit: Role requires ${expResult.minRequired}+ years, candidate has ${expResult.relevantYears} relevant years.`,
      evidence: `Gap: ${expResult.gapYears.toFixed(1)} years under minimum required`,
    });
  }

  // 7. Blocker: WORK_AUTHORIZATION_INCOMPATIBLE
  // Only evaluate if candidate has EXPLICITLY verified work authorization answers
  const verifiedAuth = profile.answers?.work_authorization;
  if (verifiedAuth && verifiedAuth.verified) {
    const jobText = `${job.description || ''} ${job.requirements || ''}`.toLowerCase();
    const candidateAuthVal = String(verifiedAuth.value || '').toLowerCase();

    // Check US citizenship / secret clearance requirement
    const requiresCitizenship =
      jobText.includes('us citizen required') ||
      jobText.includes('must be a u.s. citizen') ||
      jobText.includes('security clearance required');

    if (requiresCitizenship && !candidateAuthVal.includes('citizen')) {
      blockers.push({
        code: 'WORK_AUTHORIZATION_INCOMPATIBLE',
        reason: 'Role requires verified US Citizenship / Security Clearance.',
        evidence: `Candidate verified status: ${candidateAuthVal}`,
      });
    }
  }

  return blockers;
}
