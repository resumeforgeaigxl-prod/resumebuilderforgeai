import { createClient } from '@/lib/supabase/server';

export type VerificationStatus = 'VERIFIED' | 'UNVERIFIED' | 'UNKNOWN';
export type AnswerSource = 'user' | 'resume' | 'account' | 'previous_application';
export type ApplicationReadiness = 'NOT_READY' | 'READY_WITH_CONFIRMATION' | 'READY';

export interface CandidateIdentity {
  fullName: string;
  preferredName?: string;
  email: string;
  phoneNumber?: string;
  currentCity?: string;
  currentState?: string;
  country?: string;
  postalCode?: string;
}

export interface CandidateCareer {
  currentRole?: string;
  totalExperienceYears?: number;
  currentCompany?: string;
  previousCompanies?: string[];
  education?: any;
  graduationYear?: string;
  skills: string[];
  primaryTechStack: string[];
  certifications?: string[];
  projects?: any[];
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  personalWebsite?: string;
  professionalSummary?: string;
}

export interface CandidatePreferences {
  targetRoles: string[];
  preferredLocations: string[];
  remotePreference: boolean;
  hybridPreference: boolean;
  onsitePreference: boolean;
  minExpectedSalary?: number;
  preferredSalaryMin?: number;
  preferredSalaryMax?: number;
  salaryCurrency: string;
  employmentTypes: string[]; // "Full-time" | "Contract" | "Internship" | "Part-time"
  industries: string[];
  companiesToAvoid: string[];
  willingToRelocate: boolean;
  preferredRelocationLocations: string[];
  willingToTravel: boolean;
}

export interface ApplicationAnswer<T = any> {
  field: string;
  value: T;
  valueType: 'string' | 'number' | 'boolean' | 'json' | 'array';
  status: VerificationStatus;
  verified: boolean;
  verifiedAt?: string | null;
  source: AnswerSource;
}

export interface CandidateApplicationProfile {
  userId: string;
  identity: CandidateIdentity;
  career: CandidateCareer;
  preferences: CandidatePreferences;
  answers: Record<string, ApplicationAnswer>;
  completeness: {
    percentage: number;
    missingCritical: string[];
    missingRecommended: string[];
  };
  readiness: {
    status: ApplicationReadiness;
    summary: string;
    blockers: string[];
  };
}

/**
 * List of sensitive fields that MUST NEVER be inferred or guessed by AI or resume parsers.
 * Must be explicitly provided or confirmed by the user.
 */
export const SENSITIVE_PROTECTED_FIELDS = [
  'work_authorization',
  'visa_sponsorship_now',
  'visa_sponsorship_future',
  'citizenship_status',
  'disability_status',
  'veteran_status',
  'race_ethnicity',
  'gender_identity',
  'criminal_history',
  'medical_declarations',
] as const;

/**
 * Standard default preferences if not configured yet.
 */
export const DEFAULT_CANDIDATE_PREFERENCES: CandidatePreferences = {
  targetRoles: [],
  preferredLocations: [],
  remotePreference: true,
  hybridPreference: true,
  onsitePreference: false,
  minExpectedSalary: undefined,
  preferredSalaryMin: undefined,
  preferredSalaryMax: undefined,
  salaryCurrency: 'INR',
  employmentTypes: ['Full-time'],
  industries: [],
  companiesToAvoid: [],
  willingToRelocate: false,
  preferredRelocationLocations: [],
  willingToTravel: false,
};

/**
 * Normalizes an answer into the standard ApplicationAnswer contract.
 */
export function createAnswer<T = any>(
  field: string,
  value: T,
  options: {
    status?: VerificationStatus;
    source?: AnswerSource;
    valueType?: 'string' | 'number' | 'boolean' | 'json' | 'array';
    verifiedAt?: string | null;
  } = {}
): ApplicationAnswer<T> {
  const status = options.status || (options.source === 'user' ? 'VERIFIED' : 'UNVERIFIED');
  return {
    field,
    value,
    valueType: options.valueType || (typeof value === 'object' ? (Array.isArray(value) ? 'array' : 'json') : typeof value as any),
    status,
    verified: status === 'VERIFIED',
    verifiedAt: status === 'VERIFIED' ? (options.verifiedAt || new Date().toISOString()) : null,
    source: options.source || 'user',
  };
}

/**
 * Calculates candidate application profile completeness and readiness.
 */
export function calculateProfileReadiness(
  identity: CandidateIdentity,
  career: CandidateCareer,
  preferences: CandidatePreferences,
  answers: Record<string, ApplicationAnswer>
): {
  completeness: { percentage: number; missingCritical: string[]; missingRecommended: string[] };
  readiness: { status: ApplicationReadiness; summary: string; blockers: string[] };
} {
  const missingCritical: string[] = [];
  const missingRecommended: string[] = [];
  const blockers: string[] = [];

  // 1. Identity Critical Checks
  if (!identity.fullName || identity.fullName.trim().length === 0) {
    missingCritical.push('Full Name');
    blockers.push('Full name is required for applications.');
  }
  if (!identity.email || identity.email.trim().length === 0) {
    missingCritical.push('Email');
    blockers.push('Email address is required for communication.');
  }
  if (!identity.phoneNumber || identity.phoneNumber.trim().length === 0) {
    missingCritical.push('Phone Number');
    blockers.push('Phone number is required for recruiter contact.');
  }

  // 2. Career Critical Checks
  if (!career.skills || career.skills.length === 0) {
    missingCritical.push('Skills');
    blockers.push('At least 3 core technical skills required.');
  }

  // 3. Application Critical Answer Checks
  const workAuth = answers['work_authorization'];
  if (!workAuth || workAuth.status === 'UNKNOWN' || !workAuth.value) {
    missingCritical.push('Work Authorization');
    blockers.push('Work authorization status must be confirmed.');
  }

  const expectedSalary = answers['expected_salary'] || answers['expected_ctc'];
  if (!expectedSalary || expectedSalary.status === 'UNKNOWN' || !expectedSalary.value) {
    if (!preferences.minExpectedSalary && !preferences.preferredSalaryMin) {
      missingCritical.push('Expected Salary');
      blockers.push('Expected salary range needed to filter matching jobs.');
    }
  }

  const noticePeriod = answers['notice_period'];
  if (!noticePeriod || noticePeriod.status === 'UNKNOWN' || !noticePeriod.value) {
    missingCritical.push('Notice Period');
    blockers.push('Notice period or availability date needed.');
  }

  // 4. Recommended Checks
  if (!identity.currentCity && !identity.country) missingRecommended.push('Location (City/Country)');
  if (preferences.targetRoles.length === 0) missingRecommended.push('Target Roles');
  if (preferences.preferredLocations.length === 0 && !preferences.remotePreference) missingRecommended.push('Preferred Locations');
  if (!career.currentRole) missingRecommended.push('Current Role');
  if (!career.linkedinUrl) missingRecommended.push('LinkedIn Profile');
  if (!career.githubUrl && !career.portfolioUrl) missingRecommended.push('Portfolio / GitHub Link');

  // Compute Completeness Percentage
  const totalScoreItems = 10;
  let earnedScore = 0;
  if (identity.fullName) earnedScore += 1;
  if (identity.email) earnedScore += 1;
  if (identity.phoneNumber) earnedScore += 1;
  if (career.skills.length > 0) earnedScore += 1;
  if (workAuth && workAuth.status !== 'UNKNOWN') earnedScore += 1.5;
  if ((expectedSalary && expectedSalary.status !== 'UNKNOWN') || preferences.preferredSalaryMin) earnedScore += 1.5;
  if (noticePeriod && noticePeriod.status !== 'UNKNOWN') earnedScore += 1;
  if (preferences.targetRoles.length > 0) earnedScore += 1;
  if (career.linkedinUrl || career.githubUrl || career.portfolioUrl) earnedScore += 1;

  const percentage = Math.min(100, Math.round((earnedScore / totalScoreItems) * 100));

  // Determine Readiness
  let status: ApplicationReadiness = 'NOT_READY';
  let summary = '';

  const hasCoreIdentityAndSkills =
    Boolean(identity.fullName) &&
    Boolean(identity.email) &&
    Boolean(identity.phoneNumber) &&
    career.skills.length > 0;

  const isWorkAuthVerified = workAuth?.status === 'VERIFIED';
  const isSalaryVerified = (expectedSalary?.status === 'VERIFIED') || Boolean(preferences.preferredSalaryMin);
  const isNoticeVerified = noticePeriod?.status === 'VERIFIED';

  if (!hasCoreIdentityAndSkills) {
    status = 'NOT_READY';
    summary = `Critical identity or skill records are incomplete (${blockers.length} blockers).`;
  } else if (isWorkAuthVerified && isSalaryVerified && isNoticeVerified) {
    status = 'READY';
    summary = 'Candidate application profile is fully verified and ready for agent-assisted applications.';
  } else {
    status = 'READY_WITH_CONFIRMATION';
    summary = 'Core identity exists, but specific application answers (work authorization, salary, or notice period) require confirmation before submitting.';
  }

  return {
    completeness: {
      percentage,
      missingCritical,
      missingRecommended,
    },
    readiness: {
      status,
      summary,
      blockers,
    },
  };
}

/**
 * Loads the complete Candidate Application Profile for a user,
 * combining public.users, candidate_application_preferences, and candidate_application_answers.
 */
export async function getCandidateApplicationProfile(userId: string): Promise<CandidateApplicationProfile> {
  const supabase = createClient();

  // 1. Fetch core user record
  const { data: user } = await (supabase as any)
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  // 2. Fetch candidate preferences
  let preferences: CandidatePreferences = { ...DEFAULT_CANDIDATE_PREFERENCES };
  try {
    const { data: prefRecord } = await (supabase as any)
      .from('candidate_application_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (prefRecord) {
      preferences = {
        targetRoles: prefRecord.target_roles || (user?.target_role ? [user.target_role] : []),
        preferredLocations: prefRecord.preferred_locations || [],
        remotePreference: prefRecord.remote_preference ?? (user?.preferred_work_mode === 'Remote' || true),
        hybridPreference: prefRecord.hybrid_preference ?? true,
        onsitePreference: prefRecord.onsite_preference ?? false,
        minExpectedSalary: prefRecord.min_expected_salary ? Number(prefRecord.min_expected_salary) : undefined,
        preferredSalaryMin: prefRecord.preferred_salary_min ? Number(prefRecord.preferred_salary_min) : undefined,
        preferredSalaryMax: prefRecord.preferred_salary_max ? Number(prefRecord.preferred_salary_max) : undefined,
        salaryCurrency: prefRecord.salary_currency || 'INR',
        employmentTypes: prefRecord.employment_types || ['Full-time'],
        industries: prefRecord.industries || [],
        companiesToAvoid: prefRecord.companies_to_avoid || [],
        willingToRelocate: prefRecord.willing_to_relocate ?? false,
        preferredRelocationLocations: prefRecord.preferred_relocation_locations || [],
        willingToTravel: prefRecord.willing_to_travel ?? false,
      };
    } else if (user?.target_role) {
      preferences.targetRoles = [user.target_role];
      if (user.preferred_work_mode) {
        preferences.remotePreference = user.preferred_work_mode === 'Remote';
      }
    }
  } catch (err) {
    console.warn('[getCandidateApplicationProfile] Failed to fetch preferences (table may not exist yet):', err);
  }

  // 3. Fetch candidate answers
  const answers: Record<string, ApplicationAnswer> = {};
  try {
    const { data: answerRecords } = await (supabase as any)
      .from('candidate_application_answers')
      .select('*')
      .eq('user_id', userId);

    if (answerRecords && answerRecords.length > 0) {
      for (const rec of answerRecords) {
        answers[rec.key] = {
          field: rec.key,
          value: rec.value,
          valueType: rec.value_type || 'string',
          status: rec.status || (rec.verified ? 'VERIFIED' : 'UNVERIFIED'),
          verified: Boolean(rec.verified || rec.status === 'VERIFIED'),
          verifiedAt: rec.verified_at,
          source: rec.source || 'user',
        };
      }
    }
  } catch (err) {
    console.warn('[getCandidateApplicationProfile] Failed to fetch answers (table may not exist yet):', err);
  }

  // Ensure sensitive answers have an explicit record of UNKNOWN if not provided yet
  for (const sensitiveField of SENSITIVE_PROTECTED_FIELDS) {
    if (!answers[sensitiveField]) {
      answers[sensitiveField] = {
        field: sensitiveField,
        value: null,
        valueType: 'string',
        status: 'UNKNOWN',
        verified: false,
        verifiedAt: null,
        source: 'user',
      };
    }
  }

  // Identity object
  const identity: CandidateIdentity = {
    fullName: user?.full_name || '',
    preferredName: user?.preferred_name || undefined,
    email: user?.email || '',
    phoneNumber: user?.phone_number || undefined,
    currentCity: user?.current_city || user?.city || undefined,
    currentState: user?.current_state || user?.state || undefined,
    country: user?.country || 'India',
    postalCode: user?.postal_code || undefined,
  };

  // Career object
  const career: CandidateCareer = {
    currentRole: user?.target_role || undefined,
    totalExperienceYears: user?.total_experience_years ? Number(user.total_experience_years) : undefined,
    currentCompany: user?.current_company || undefined,
    previousCompanies: [],
    education: user?.education || undefined,
    graduationYear: user?.education?.btech?.passingYear || user?.education?.masters?.passingYear || undefined,
    skills: Array.isArray(user?.skills) ? user.skills : [],
    primaryTechStack: Array.isArray(user?.primary_tech_stack) ? user.primary_tech_stack : (Array.isArray(user?.skills) ? user.skills.slice(0, 5) : []),
    certifications: [],
    projects: [],
    portfolioUrl: user?.portfolio_url || undefined,
    githubUrl: user?.github_url || undefined,
    linkedinUrl: user?.linkedin_url || undefined,
    personalWebsite: user?.personal_website || undefined,
    professionalSummary: user?.professional_summary || undefined,
  };

  // Compute Readiness & Completeness
  const { completeness, readiness } = calculateProfileReadiness(identity, career, preferences, answers);

  return {
    userId,
    identity,
    career,
    preferences,
    answers,
    completeness,
    readiness,
  };
}

/**
 * Updates Candidate Identity fields on public.users.
 */
export async function updateCandidateIdentity(
  userId: string,
  identity: Partial<CandidateIdentity>
): Promise<{ success: boolean }> {
  const supabase = createClient();
  const updatePayload: Record<string, any> = {};

  if (identity.fullName !== undefined) updatePayload.full_name = identity.fullName;
  if (identity.preferredName !== undefined) updatePayload.preferred_name = identity.preferredName;
  if (identity.phoneNumber !== undefined) updatePayload.phone_number = identity.phoneNumber;
  if (identity.currentCity !== undefined) updatePayload.current_city = identity.currentCity;
  if (identity.currentState !== undefined) updatePayload.current_state = identity.currentState;
  if (identity.country !== undefined) updatePayload.country = identity.country;
  if (identity.postalCode !== undefined) updatePayload.postal_code = identity.postalCode;

  if (Object.keys(updatePayload).length > 0) {
    const { error } = await (supabase as any)
      .from('users')
      .update(updatePayload)
      .eq('id', userId);

    if (error) {
      console.error('[updateCandidateIdentity] Error:', error.message);
      throw error;
    }
  }

  return { success: true };
}

/**
 * Updates Candidate Career fields on public.users.
 */
export async function updateCandidateCareer(
  userId: string,
  career: Partial<CandidateCareer>
): Promise<{ success: boolean }> {
  const supabase = createClient();
  const updatePayload: Record<string, any> = {};

  if (career.currentRole !== undefined) updatePayload.target_role = career.currentRole;
  if (career.totalExperienceYears !== undefined) updatePayload.total_experience_years = career.totalExperienceYears;
  if (career.currentCompany !== undefined) updatePayload.current_company = career.currentCompany;
  if (career.skills !== undefined) updatePayload.skills = career.skills;
  if (career.primaryTechStack !== undefined) updatePayload.primary_tech_stack = career.primaryTechStack;
  if (career.education !== undefined) updatePayload.education = career.education;
  if (career.portfolioUrl !== undefined) updatePayload.portfolio_url = career.portfolioUrl;
  if (career.githubUrl !== undefined) updatePayload.github_url = career.githubUrl;
  if (career.linkedinUrl !== undefined) updatePayload.linkedin_url = career.linkedinUrl;
  if (career.personalWebsite !== undefined) updatePayload.personal_website = career.personalWebsite;
  if (career.professionalSummary !== undefined) updatePayload.professional_summary = career.professionalSummary;

  if (Object.keys(updatePayload).length > 0) {
    const { error } = await (supabase as any)
      .from('users')
      .update(updatePayload)
      .eq('id', userId);

    if (error) {
      console.error('[updateCandidateCareer] Error:', error.message);
      throw error;
    }
  }

  return { success: true };
}

/**
 * Upserts Candidate Application Preferences.
 */
export async function updateCandidatePreferences(
  userId: string,
  prefs: Partial<CandidatePreferences>
): Promise<{ success: boolean }> {
  const supabase = createClient();

  const payload: Record<string, any> = {
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  if (prefs.targetRoles !== undefined) payload.target_roles = prefs.targetRoles;
  if (prefs.preferredLocations !== undefined) payload.preferred_locations = prefs.preferredLocations;
  if (prefs.remotePreference !== undefined) payload.remote_preference = prefs.remotePreference;
  if (prefs.hybridPreference !== undefined) payload.hybrid_preference = prefs.hybridPreference;
  if (prefs.onsitePreference !== undefined) payload.onsite_preference = prefs.onsitePreference;
  if (prefs.minExpectedSalary !== undefined) payload.min_expected_salary = prefs.minExpectedSalary;
  if (prefs.preferredSalaryMin !== undefined) payload.preferred_salary_min = prefs.preferredSalaryMin;
  if (prefs.preferredSalaryMax !== undefined) payload.preferred_salary_max = prefs.preferredSalaryMax;
  if (prefs.salaryCurrency !== undefined) payload.salary_currency = prefs.salaryCurrency;
  if (prefs.employmentTypes !== undefined) payload.employment_types = prefs.employmentTypes;
  if (prefs.industries !== undefined) payload.industries = prefs.industries;
  if (prefs.companiesToAvoid !== undefined) payload.companies_to_avoid = prefs.companiesToAvoid;
  if (prefs.willingToRelocate !== undefined) payload.willing_to_relocate = prefs.willingToRelocate;
  if (prefs.preferredRelocationLocations !== undefined) payload.preferred_relocation_locations = prefs.preferredRelocationLocations;
  if (prefs.willingToTravel !== undefined) payload.willing_to_travel = prefs.willingToTravel;

  const { error } = await (supabase as any)
    .from('candidate_application_preferences')
    .upsert(payload, { onConflict: 'user_id' });

  if (error) {
    console.error('[updateCandidatePreferences] Error:', error.message);
    throw error;
  }

  return { success: true };
}

/**
 * Upserts a reusable Application Answer in candidate_application_answers.
 * Ensures sensitive items are never marked verified unless explicitly set by user.
 */
export async function upsertApplicationAnswer(
  userId: string,
  key: string,
  value: any,
  options: {
    status?: VerificationStatus;
    verified?: boolean;
    source?: AnswerSource;
    valueType?: 'string' | 'number' | 'boolean' | 'json' | 'array';
  } = {}
): Promise<ApplicationAnswer> {
  const supabase = createClient();

  const isSensitive = SENSITIVE_PROTECTED_FIELDS.includes(key as any);
  let status: VerificationStatus = options.status || (options.verified ? 'VERIFIED' : 'UNVERIFIED');

  // Guardrail: if sensitive and source is not 'user', force UNKNOWN or UNVERIFIED
  if (isSensitive && options.source && options.source !== 'user') {
    status = 'UNKNOWN';
  }

  const verified = status === 'VERIFIED';
  const verifiedAt = verified ? new Date().toISOString() : null;
  const source = options.source || 'user';
  const valueType = options.valueType || (typeof value === 'object' ? (Array.isArray(value) ? 'array' : 'json') : typeof value as any);

  const payload = {
    user_id: userId,
    key,
    value,
    value_type: valueType,
    status,
    verified,
    verified_at: verifiedAt,
    source,
    updated_at: new Date().toISOString(),
  };

  const { error } = await (supabase as any)
    .from('candidate_application_answers')
    .upsert(payload, { onConflict: 'user_id,key' });

  if (error) {
    console.error('[upsertApplicationAnswer] Error:', error.message);
    throw error;
  }

  return {
    field: key,
    value,
    valueType,
    status,
    verified,
    verifiedAt,
    source,
  };
}

/**
 * Enriches the Candidate Application Profile from the user's latest Resume.
 * RULE: Only pre-fills missing/empty fields.
 * RULE: Sets source = 'resume' and verified = false (status = 'UNVERIFIED').
 * RULE: NEVER overwrites user-confirmed or verified profile values.
 * RULE: NEVER infers work authorization, visa, or citizenship.
 */
export async function enrichProfileFromResume(
  userId: string,
  resumeId?: string
): Promise<{ updatedCount: number; enrichedFields: string[]; skippedFields: string[] }> {
  const supabase = createClient();

  // 1. Fetch current profile
  const profile = await getCandidateApplicationProfile(userId);

  // 2. Fetch target resume
  let query = (supabase as any).from('resumes').select('*').eq('user_id', userId);
  if (resumeId) {
    query = query.eq('id', resumeId);
  } else {
    query = query.order('updated_at', { ascending: false }).limit(1);
  }
  const { data: resumes } = await query;
  const resume = resumes?.[0];

  if (!resume || !resume.resume_json) {
    return { updatedCount: 0, enrichedFields: [], skippedFields: [] };
  }

  const rData = resume.resume_json;
  const enrichedFields: string[] = [];
  const skippedFields: string[] = [];

  const identityUpdates: Partial<CandidateIdentity> = {};
  const careerUpdates: Partial<CandidateCareer> = {};

  // Check identity fields
  if (!profile.identity.fullName && rData.name) {
    identityUpdates.fullName = rData.name;
    enrichedFields.push('Full Name');
  } else if (rData.name && profile.identity.fullName !== rData.name) {
    skippedFields.push('Full Name (Preserved existing)');
  }

  if (!profile.identity.phoneNumber && rData.phone) {
    identityUpdates.phoneNumber = rData.phone;
    enrichedFields.push('Phone Number');
  }

  if (!profile.identity.currentCity && rData.location) {
    identityUpdates.currentCity = rData.location;
    enrichedFields.push('City / Location');
  }

  // Check career fields
  if (!profile.career.professionalSummary && rData.summary) {
    careerUpdates.professionalSummary = rData.summary;
    enrichedFields.push('Professional Summary');
  }

  if (!profile.career.linkedinUrl && rData.linkedin) {
    careerUpdates.linkedinUrl = rData.linkedin;
    enrichedFields.push('LinkedIn URL');
  }

  if (!profile.career.githubUrl && rData.github) {
    careerUpdates.githubUrl = rData.github;
    enrichedFields.push('GitHub URL');
  }

  // Skills enrichment: add missing skills without removing existing
  if (rData.skills) {
    const resumeSkills: string[] = [];
    if (Array.isArray(rData.skills)) {
      resumeSkills.push(...rData.skills);
    } else if (typeof rData.skills === 'object') {
      for (const val of Object.values(rData.skills)) {
        if (Array.isArray(val)) resumeSkills.push(...val);
      }
    }

    if (resumeSkills.length > 0) {
      const existingSkillSet = new Set((profile.career.skills || []).map((s) => s.toLowerCase()));
      const newSkillsToAdd = resumeSkills.filter((s) => !existingSkillSet.has(s.toLowerCase()));
      if (newSkillsToAdd.length > 0) {
        careerUpdates.skills = [...(profile.career.skills || []), ...newSkillsToAdd];
        enrichedFields.push(`Skills (+${newSkillsToAdd.length} added)`);
      }
    }
  }

  // Education enrichment if empty
  if (!profile.career.education && rData.education && rData.education.length > 0) {
    careerUpdates.education = rData.education;
    enrichedFields.push('Education');
  }

  // Commit Identity Updates
  if (Object.keys(identityUpdates).length > 0) {
    await updateCandidateIdentity(userId, identityUpdates);
  }

  // Commit Career Updates
  if (Object.keys(careerUpdates).length > 0) {
    await updateCandidateCareer(userId, careerUpdates);
  }

  // Also suggest reusable answers if empty
  if (!profile.answers['linkedin_url']?.value && rData.linkedin) {
    await upsertApplicationAnswer(userId, 'linkedin_url', rData.linkedin, {
      status: 'UNVERIFIED',
      source: 'resume',
      valueType: 'string',
    });
  }

  if (!profile.answers['github_url']?.value && rData.github) {
    await upsertApplicationAnswer(userId, 'github_url', rData.github, {
      status: 'UNVERIFIED',
      source: 'resume',
      valueType: 'string',
    });
  }

  return {
    updatedCount: enrichedFields.length,
    enrichedFields,
    skippedFields,
  };
}
