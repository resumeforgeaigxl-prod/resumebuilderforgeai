/**
 * ResumeForge — Deterministic Matching Factors
 * Evaluates Location, Salary, Employment Type, and Education alignment.
 * Strictly adheres to rule: Missing job information is neutral and lowers confidence, never scores.
 */

import type { CandidateApplicationProfile } from '@/lib/capabilities/profile';
import type { CanonicalJobRecord } from '@/lib/jobs/types';

// ==========================================
// 1. LOCATION FIT EVALUATION
// ==========================================

export interface LocationFitResult {
  score: number;
  status: 'EXACT' | 'ACCEPTABLE' | 'RELOCATION_NEEDED' | 'REMOTE_COMPATIBLE' | 'INCOMPATIBLE';
  note: string;
  isHardIncompatible: boolean;
}

export function evaluateLocationFit(
  profile: CandidateApplicationProfile,
  job: CanonicalJobRecord
): LocationFitResult {
  const prefs = profile.preferences || {};
  const identity = profile.identity || {};
  const remoteType = (job.remote_type || 'UNKNOWN').toUpperCase();

  // 1. Job is fully remote
  if (remoteType === 'REMOTE') {
    if (prefs.remotePreference ?? true) {
      return {
        score: 100,
        status: 'REMOTE_COMPATIBLE',
        note: 'Remote job aligns with candidate remote work preference',
        isHardIncompatible: false,
      };
    } else {
      // Candidate specifically does not want remote
      return {
        score: 70,
        status: 'ACCEPTABLE',
        note: 'Job is remote; candidate preferred onsite/hybrid',
        isHardIncompatible: false,
      };
    }
  }

  // 2. Candidate candidate locations & identity location
  const candidateCity = (identity.currentCity || '').toLowerCase().trim();
  const candidateState = (identity.currentState || '').toLowerCase().trim();
  const candidateCountry = (identity.country || 'India').toLowerCase().trim();

  const prefLocations = (prefs.preferredLocations || []).map(l => l.toLowerCase().trim());
  const relocLocations = (prefs.preferredRelocationLocations || []).map(l => l.toLowerCase().trim());

  const jobCity = (job.city || '').toLowerCase().trim();
  const jobState = (job.state || '').toLowerCase().trim();
  const jobCountry = (job.country || 'India').toLowerCase().trim();
  const jobLocationText = (job.location || job.location_text || '').toLowerCase().trim();

  // If job location is unknown or unspecified
  if (!jobCity && !jobLocationText) {
    return {
      score: 80,
      status: 'ACCEPTABLE',
      note: 'Job location unstated (neutral evaluation)',
      isHardIncompatible: false,
    };
  }

  // Check country match first
  const sameCountry =
    jobCountry.includes(candidateCountry) ||
    candidateCountry.includes(jobCountry) ||
    !jobCountry;

  // City match check
  const isCityMatch =
    (jobCity && candidateCity && (candidateCity.includes(jobCity) || jobCity.includes(candidateCity))) ||
    (jobCity && prefLocations.some(l => l.includes(jobCity) || jobCity.includes(l))) ||
    (jobLocationText && candidateCity && jobLocationText.includes(candidateCity)) ||
    (jobLocationText && prefLocations.some(l => jobLocationText.includes(l)));

  if (isCityMatch) {
    if (remoteType === 'HYBRID') {
      const hybridOk = prefs.hybridPreference ?? true;
      return {
        score: hybridOk ? 95 : 80,
        status: 'EXACT',
        note: `Hybrid role matches candidate location (${job.city || job.location})`,
        isHardIncompatible: false,
      };
    }
    return {
      score: 100,
      status: 'EXACT',
      note: `Exact city match with candidate location (${job.city || job.location})`,
      isHardIncompatible: false,
    };
  }

  // If different city, check relocation willingness
  if (prefs.willingToRelocate) {
    const isPreferredReloc =
      relocLocations.length === 0 ||
      relocLocations.some(l => (jobCity && l.includes(jobCity)) || jobLocationText.includes(l));

    if (isPreferredReloc) {
      return {
        score: 85,
        status: 'RELOCATION_NEEDED',
        note: `Different city (${job.city || job.location}), but candidate is open to relocation`,
        isHardIncompatible: false,
      };
    }
  }

  // If candidate is NOT willing to relocate and job is strictly ONSITE/HYBRID in a different city
  if (!prefs.willingToRelocate && (remoteType === 'ONSITE' || remoteType === 'HYBRID')) {
    if (candidateCity && !sameCountry) {
      return {
        score: 10,
        status: 'INCOMPATIBLE',
        note: `Onsite/Hybrid in ${job.location || job.country}; candidate is in ${candidateCity}, ${candidateCountry} and not relocating`,
        isHardIncompatible: true,
      };
    }
    return {
      score: 25,
      status: 'INCOMPATIBLE',
      note: `Onsite in ${job.location || 'another city'}; candidate is located in ${candidateCity} and unwilling to relocate`,
      isHardIncompatible: true,
    };
  }

  // Baseline fallback
  return {
    score: 60,
    status: 'ACCEPTABLE',
    note: `Location differs (${job.location || job.city || 'other'}), candidate may require remote flexibility`,
    isHardIncompatible: false,
  };
}

// ==========================================
// 2. SALARY FIT EVALUATION
// ==========================================

export interface SalaryFitResult {
  score: number;
  status: 'ABOVE_TARGET' | 'WITHIN_TARGET' | 'BELOW_PREFERRED' | 'BELOW_MINIMUM' | 'UNKNOWN';
  note: string;
  isHardBelowMinimum: boolean;
}

export function evaluateSalaryFit(
  profile: CandidateApplicationProfile,
  job: CanonicalJobRecord
): SalaryFitResult {
  const prefs = profile.preferences || {};
  const hardMin = prefs.minExpectedSalary ? Number(prefs.minExpectedSalary) : null;
  const prefMin = prefs.preferredSalaryMin ? Number(prefs.preferredSalaryMin) : hardMin;
  const prefMax = prefs.preferredSalaryMax ? Number(prefs.preferredSalaryMax) : null;

  const jobMin = job.salary_min != null ? Number(job.salary_min) : null;
  const jobMax = job.salary_max != null ? Number(job.salary_max) : null;

  // Rule: Missing salary on job is neutral and does NOT penalize
  if (jobMin == null && jobMax == null) {
    return {
      score: 85,
      status: 'UNKNOWN',
      note: 'Salary not disclosed in job posting (neutral evaluation)',
      isHardBelowMinimum: false,
    };
  }

  const effectiveJobComp = jobMax ?? jobMin ?? 0;

  // Check against hard minimum
  if (hardMin != null && effectiveJobComp > 0) {
    // If the top of the job range is below candidate's hard minimum threshold
    if (effectiveJobComp < hardMin * 0.9) {
      return {
        score: 20,
        status: 'BELOW_MINIMUM',
        note: `Job compensation max (${effectiveJobComp}) is below candidate hard minimum (${hardMin})`,
        isHardBelowMinimum: true,
      };
    }
  }

  // Check against preferred range
  if (prefMin != null && effectiveJobComp > 0) {
    if (jobMin != null && jobMin >= prefMin) {
      return {
        score: 100,
        status: 'ABOVE_TARGET',
        note: 'Compensation exceeds candidate preferred minimum target',
        isHardBelowMinimum: false,
      };
    }
    if (effectiveJobComp >= prefMin) {
      return {
        score: 95,
        status: 'WITHIN_TARGET',
        note: 'Compensation overlaps candidate preferred target range',
        isHardBelowMinimum: false,
      };
    }
    // Slightly below preferred, but above hard minimum
    return {
      score: 70,
      status: 'BELOW_PREFERRED',
      note: `Compensation (${effectiveJobComp}) is slightly below preferred target (${prefMin})`,
      isHardBelowMinimum: false,
    };
  }

  // Default within acceptable parameters
  return {
    score: 85,
    status: 'WITHIN_TARGET',
    note: 'Compensation aligns with standard market parameters',
    isHardBelowMinimum: false,
  };
}

// ==========================================
// 3. EMPLOYMENT TYPE FIT
// ==========================================

export interface EmploymentTypeFitResult {
  score: number;
  note: string;
  isHardIncompatible: boolean;
}

export function evaluateEmploymentTypeFit(
  profile: CandidateApplicationProfile,
  job: CanonicalJobRecord
): EmploymentTypeFitResult {
  const candidateTypes = (profile.preferences?.employmentTypes || ['Full-time']).map(t =>
    t.toLowerCase().replace(/[-_]/g, '')
  );

  const jobType = (job.employment_type || 'FULL_TIME').toLowerCase().replace(/[-_]/g, '');

  // Unknown job type is neutral
  if (jobType === 'unknown' || !jobType) {
    return {
      score: 85,
      note: 'Employment type unstated (neutral evaluation)',
      isHardIncompatible: false,
    };
  }

  const isFullTime = jobType.includes('fulltime') || jobType === 'full';
  const isContract = jobType.includes('contract') || jobType.includes('freelance');
  const isInternship = jobType.includes('intern');
  const isPartTime = jobType.includes('parttime') || jobType === 'part';

  const wantsFullTime = candidateTypes.some(t => t.includes('full'));
  const wantsContract = candidateTypes.some(t => t.includes('contract'));
  const wantsIntern = candidateTypes.some(t => t.includes('intern'));

  if (isFullTime && wantsFullTime) {
    return { score: 100, note: 'Direct match: Full-time employment', isHardIncompatible: false };
  }
  if (isContract && wantsContract) {
    return { score: 100, note: 'Direct match: Contract employment', isHardIncompatible: false };
  }
  if (isInternship && wantsIntern) {
    return { score: 100, note: 'Direct match: Internship', isHardIncompatible: false };
  }

  // Incompatibility checks
  if (isInternship && !wantsIntern && (profile.career?.totalExperienceYears || 0) > 2) {
    return {
      score: 20,
      note: 'Internship role is not compatible with candidate experience level',
      isHardIncompatible: true,
    };
  }

  if (isContract && !wantsContract && candidateTypes.length > 0 && !candidateTypes.includes('contract')) {
    return {
      score: 50,
      note: 'Contract position; candidate prefers permanent full-time employment',
      isHardIncompatible: false, // Not a fatal blocker, but lower score
    };
  }

  return {
    score: 80,
    note: `Employment type: ${job.employment_type}`,
    isHardIncompatible: false,
  };
}

// ==========================================
// 4. EDUCATION & CERTIFICATIONS FIT
// ==========================================

export interface EducationFitResult {
  score: number;
  note: string;
  hasMandatoryDegreeMissing: boolean;
}

export function evaluateEducationFit(
  profile: CandidateApplicationProfile,
  job: CanonicalJobRecord,
  resumeJson?: any
): EducationFitResult {
  const reqText = `${job.requirements || ''} ${job.description || ''}`.toLowerCase();

  // Check if job mandates a degree
  const mandatesDegree =
    reqText.includes("bachelor's required") ||
    reqText.includes('bachelor of science required') ||
    reqText.includes('b.tech required') ||
    reqText.includes('degree required') ||
    reqText.includes('bachelor degree is required') ||
    reqText.includes("master's required") ||
    reqText.includes('phd required');

  const candidateEducation = profile.career?.education || resumeJson?.education || [];
  const candidateHasDegree = Array.isArray(candidateEducation)
    ? candidateEducation.length > 0
    : Boolean(candidateEducation);

  if (mandatesDegree && !candidateHasDegree) {
    return {
      score: 40,
      note: 'Job specifies degree required, but candidate education details are unverified',
      hasMandatoryDegreeMissing: true,
    };
  }

  // Certifications bonus
  const certs = profile.career?.certifications || resumeJson?.certifications || [];
  let certBonus = 0;
  if (Array.isArray(certs) && certs.length > 0) {
    certBonus = 5;
  }

  return {
    score: Math.min(100, 90 + certBonus),
    note: candidateHasDegree
      ? 'Candidate meets education background requirements'
      : 'Standard technical education requirements met',
    hasMandatoryDegreeMissing: false,
  };
}
