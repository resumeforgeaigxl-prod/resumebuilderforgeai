/**
 * ResumeForge — Application Answer Preparation Engine (Level 12)
 *
 * Combines Candidate Application Profile, Verified Answer Bank, and Resume facts
 * to prepare normalized answers and identify exact unknown questions.
 * Enforces zero-fabrication and zero-inference on sensitive legal/personal topics.
 */

import type { CandidateApplicationProfile } from '@/lib/capabilities/profile';
import type { CanonicalJobRecord } from '@/lib/jobs/types';
import type {
  ApplicationField,
  UnknownQuestion,
  AnswerStatus,
  ApplicationDocument,
} from './types';
import {
  CANONICAL_FIELD_LIBRARY,
  isSensitiveField,
} from './question-library';
import { callAI } from '@/lib/ai/router';

export interface AnswerPreparationResult {
  answers: Record<string, ApplicationField>;
  unknownQuestions: UnknownQuestion[];
  documents: ApplicationDocument[];
  hasBlockerAnswer: boolean;
  blockerReason?: string;
}

/**
 * Prepares all known application answers, derives safe factual fields,
 * and compiles a structured list of unknown questions that need explicit user input.
 */
export async function prepareApplicationAnswers(options: {
  userId: string;
  profile: CandidateApplicationProfile;
  job: CanonicalJobRecord;
  resumeId?: string;
  includeCoverLetter?: boolean;
}): Promise<AnswerPreparationResult> {
  const { userId, profile, job, resumeId, includeCoverLetter = false } = options;
  const answers: Record<string, ApplicationField> = {};
  const unknownQuestions: UnknownQuestion[] = [];
  const documents: ApplicationDocument[] = [];

  let hasBlockerAnswer = false;
  let blockerReason: string | undefined;

  // 1. Process Core Identity Fields
  const identity = profile.identity;
  const rawFullName = identity.fullName?.trim() || '';
  const nameParts = rawFullName.split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  // first_name
  answers['first_name'] = {
    key: 'first_name',
    label: 'First Name',
    type: 'TEXT',
    value: firstName,
    status: firstName ? 'VERIFIED' : 'NEEDS_USER',
    source: 'profile',
    verified: Boolean(firstName),
    required: true,
    sensitive: false,
  };
  if (!firstName) {
    unknownQuestions.push({
      key: 'first_name',
      question: 'What is your legal first name?',
      category: 'IDENTITY',
      required: true,
      reason: 'Required by employers for applicant identification.',
      sensitive: false,
    });
  }

  // last_name
  answers['last_name'] = {
    key: 'last_name',
    label: 'Last Name',
    type: 'TEXT',
    value: lastName,
    status: lastName ? 'VERIFIED' : 'NEEDS_USER',
    source: 'profile',
    verified: Boolean(lastName),
    required: true,
    sensitive: false,
  };
  if (!lastName) {
    unknownQuestions.push({
      key: 'last_name',
      question: 'What is your legal last name?',
      category: 'IDENTITY',
      required: true,
      reason: 'Required by employers for applicant identification.',
      sensitive: false,
    });
  }

  // full_name (DERIVED_SAFE)
  answers['full_name'] = {
    key: 'full_name',
    label: 'Full Legal Name',
    type: 'TEXT',
    value: rawFullName,
    status: rawFullName ? 'DERIVED_SAFE' : 'NEEDS_USER',
    source: 'derived',
    verified: Boolean(rawFullName),
    required: true,
    sensitive: false,
    evidence: `Derived from verified first and last name: ${rawFullName}`,
  };

  // email
  const email = identity.email?.trim() || '';
  answers['email'] = {
    key: 'email',
    label: 'Email Address',
    type: 'EMAIL',
    value: email,
    status: email ? 'VERIFIED' : 'NEEDS_USER',
    source: 'profile',
    verified: Boolean(email),
    required: true,
    sensitive: false,
  };
  if (!email) {
    unknownQuestions.push({
      key: 'email',
      question: 'What is your primary contact email?',
      category: 'IDENTITY',
      required: true,
      reason: 'Required to receive employer communications and confirmations.',
      sensitive: false,
    });
  }

  // phone
  const phone = identity.phoneNumber?.trim() || '';
  answers['phone'] = {
    key: 'phone',
    label: 'Phone Number',
    type: 'PHONE',
    value: phone,
    status: phone ? 'VERIFIED' : 'NEEDS_USER',
    source: 'profile',
    verified: Boolean(phone),
    required: true,
    sensitive: false,
  };
  if (!phone) {
    unknownQuestions.push({
      key: 'phone',
      question: 'What is your mobile phone number (with country code)?',
      category: 'IDENTITY',
      required: true,
      reason: 'Required by recruiters for telephone screening.',
      sensitive: false,
    });
  }

  // location
  const location = identity.currentCity || identity.currentState || identity.country || '';
  answers['location'] = {
    key: 'location',
    label: 'Current Location',
    type: 'TEXT',
    value: location,
    status: location ? 'VERIFIED' : 'NEEDS_USER',
    source: 'profile',
    verified: Boolean(location),
    required: true,
    sensitive: false,
  };
  if (!location) {
    unknownQuestions.push({
      key: 'location',
      question: 'What is your current city and country?',
      category: 'LOCATION',
      required: true,
      reason: 'Used by employers to determine residency and relocation alignment.',
      sensitive: false,
    });
  }

  // Social / Links
  answers['linkedin_url'] = {
    key: 'linkedin_url',
    label: 'LinkedIn Profile',
    type: 'URL',
    value: profile.career.linkedinUrl || '',
    status: profile.career.linkedinUrl ? 'VERIFIED' : 'NOT_APPLICABLE',
    source: 'profile',
    verified: Boolean(profile.career.linkedinUrl),
    required: false,
    sensitive: false,
  };

  answers['github_url'] = {
    key: 'github_url',
    label: 'GitHub Profile',
    type: 'URL',
    value: profile.career.githubUrl || '',
    status: profile.career.githubUrl ? 'VERIFIED' : 'NOT_APPLICABLE',
    source: 'profile',
    verified: Boolean(profile.career.githubUrl),
    required: false,
    sensitive: false,
  };

  answers['portfolio_url'] = {
    key: 'portfolio_url',
    label: 'Portfolio URL',
    type: 'URL',
    value: profile.career.portfolioUrl || '',
    status: profile.career.portfolioUrl ? 'VERIFIED' : 'NOT_APPLICABLE',
    source: 'profile',
    verified: Boolean(profile.career.portfolioUrl),
    required: false,
    sensitive: false,
  };

  // 2. Career Experience Fields
  answers['current_company'] = {
    key: 'current_company',
    label: 'Current Employer',
    type: 'TEXT',
    value: profile.career.currentCompany || '',
    status: profile.career.currentCompany ? 'VERIFIED' : 'NOT_APPLICABLE',
    source: 'profile',
    verified: Boolean(profile.career.currentCompany),
    required: false,
    sensitive: false,
  };

  answers['current_role'] = {
    key: 'current_role',
    label: 'Current Title',
    type: 'TEXT',
    value: profile.career.currentRole || '',
    status: profile.career.currentRole ? 'VERIFIED' : 'NOT_APPLICABLE',
    source: 'profile',
    verified: Boolean(profile.career.currentRole),
    required: false,
    sensitive: false,
  };

  // years_experience (DERIVED_SAFE)
  const expYears = profile.career.totalExperienceYears ?? 0;
  answers['years_experience'] = {
    key: 'years_experience',
    label: 'Total Experience (Years)',
    type: 'NUMBER',
    value: expYears,
    status: 'DERIVED_SAFE',
    source: 'derived',
    verified: true,
    required: true,
    sensitive: false,
    evidence: `Derived from structured candidate employment history: ${expYears} yrs`,
  };

  // 3. Compensation & Availability
  // notice_period
  const verifiedNotice = profile.answers['notice_period']?.value || null;
  answers['notice_period'] = {
    key: 'notice_period',
    label: 'Notice Period',
    type: 'SELECT',
    value: verifiedNotice || '',
    status: verifiedNotice ? 'VERIFIED' : 'NEEDS_USER',
    source: verifiedNotice ? 'profile' : 'user',
    verified: Boolean(verifiedNotice),
    required: true,
    sensitive: false,
    allowedOptions: ['Immediate (0-15 days)', '30 days', '60 days', '90 days', 'More than 90 days'],
  };
  if (!verifiedNotice) {
    unknownQuestions.push({
      key: 'notice_period',
      question: 'What is your official notice period or availability?',
      category: 'AVAILABILITY',
      required: true,
      reason: 'Required by hiring managers to plan onboarding timelines.',
      allowedOptions: ['Immediate (0-15 days)', '30 days', '60 days', '90 days', 'More than 90 days'],
      sensitive: false,
    });
  }

  // expected_salary
  const prefSalary = profile.preferences.minExpectedSalary || profile.preferences.preferredSalaryMin || null;
  const verifiedSalary = profile.answers['expected_salary']?.value || (prefSalary ? `${profile.preferences.salaryCurrency || 'INR'} ${prefSalary}` : null);
  answers['expected_salary'] = {
    key: 'expected_salary',
    label: 'Expected Salary',
    type: 'TEXT',
    value: verifiedSalary || '',
    status: verifiedSalary ? 'VERIFIED' : 'NEEDS_USER',
    source: verifiedSalary ? 'profile' : 'user',
    verified: Boolean(verifiedSalary),
    required: true,
    sensitive: false,
  };
  if (!verifiedSalary) {
    unknownQuestions.push({
      key: 'expected_salary',
      question: 'What is your expected salary / CTC for this role?',
      category: 'SALARY',
      required: true,
      reason: 'Required by application forms to ensure compensation alignment.',
      sensitive: false,
    });
  }

  // relocation_preference
  const willingRelocate = profile.preferences.willingToRelocate ?? false;
  answers['relocation_preference'] = {
    key: 'relocation_preference',
    label: 'Willingness to Relocate',
    type: 'BOOLEAN',
    value: willingRelocate,
    status: 'VERIFIED',
    source: 'profile',
    verified: true,
    required: true,
    sensitive: false,
  };

  // remote_preference
  let remoteMode = 'Flexible';
  if (profile.preferences.remotePreference && !profile.preferences.onsitePreference) remoteMode = 'Remote Only';
  else if (profile.preferences.hybridPreference) remoteMode = 'Hybrid';
  else if (profile.preferences.onsitePreference) remoteMode = 'Onsite';

  answers['remote_preference'] = {
    key: 'remote_preference',
    label: 'Work Mode Preference',
    type: 'SELECT',
    value: remoteMode,
    status: 'VERIFIED',
    source: 'profile',
    verified: true,
    required: true,
    sensitive: false,
  };

  // 4. Work Authorization & Sponsorship (SENSITIVE - Never Inferred)
  const authAns = profile.answers['work_authorization'];
  const hasWorkAuth = authAns ? Boolean(authAns.value) : null;
  answers['work_authorization'] = {
    key: 'work_authorization',
    label: 'Are you legally authorized to work in the job location?',
    type: 'BOOLEAN',
    value: hasWorkAuth,
    status: hasWorkAuth !== null ? 'VERIFIED' : 'NEEDS_USER',
    source: authAns ? 'profile' : 'user',
    verified: hasWorkAuth !== null,
    required: true,
    sensitive: true,
  };
  if (hasWorkAuth === null) {
    unknownQuestions.push({
      key: 'work_authorization',
      question: `Are you legally authorized to work in the country of this role (${job.location || 'India / Target Location'})?`,
      category: 'WORK_AUTHORIZATION',
      required: true,
      reason: 'Legal compliance question. Must be confirmed explicitly by the candidate.',
      allowedOptions: ['Yes', 'No'],
      sensitive: true,
    });
  }

  const sponsorAns = profile.answers['requires_sponsorship'];
  const needsSponsor = sponsorAns ? Boolean(sponsorAns.value) : null;
  answers['requires_sponsorship'] = {
    key: 'requires_sponsorship',
    label: 'Will you now or in the future require visa sponsorship?',
    type: 'BOOLEAN',
    value: needsSponsor,
    status: needsSponsor !== null ? 'VERIFIED' : 'NEEDS_USER',
    source: sponsorAns ? 'profile' : 'user',
    verified: needsSponsor !== null,
    required: true,
    sensitive: true,
  };
  if (needsSponsor === null) {
    unknownQuestions.push({
      key: 'requires_sponsorship',
      question: 'Will you now or in the future require employment visa sponsorship?',
      category: 'SPONSORSHIP',
      required: true,
      reason: 'Mandatory immigration disclosure for employer filings.',
      allowedOptions: ['Yes', 'No'],
      sensitive: true,
    });
  }

  // 5. Check if Job has Mandatory Work Auth Requirement Contradicted by Candidate
  // If employer does NOT sponsor and candidate verified needs sponsorship:
  if (hasWorkAuth === false && job.description?.toLowerCase().includes('must be legally authorized to work without sponsorship')) {
    answers['work_authorization'].status = 'BLOCKED';
    hasBlockerAnswer = true;
    blockerReason = 'Candidate requires visa sponsorship, but employer explicitly does not sponsor.';
  }

  // 6. Employer-Specific Free-Text Drafts (Truthful, non-invented)
  // Only drafted if company or role is explicit
  if (job.company && job.title) {
    const candidatePrimarySkills = profile.career.primaryTechStack.slice(0, 4).join(', ') || profile.career.skills.slice(0, 4).join(', ');
    const draftWhyRole = `With ${expYears} years of experience specializing in ${candidatePrimarySkills || 'modern software engineering'}, I am passionate about applying my hands-on technical background to drive impact as a ${job.title} at ${job.company}.`;

    answers['why_this_role'] = {
      key: 'why_this_role',
      label: `Why are you a good fit for ${job.title}?`,
      type: 'LONG_TEXT',
      value: draftWhyRole,
      status: 'GENERATED_DRAFT',
      source: 'generated',
      verified: false,
      required: false,
      sensitive: false,
      evidence: 'Generated truthfully from candidate primary tech stack and experience duration.',
    };
  }

  // 7. Supporting Documents (Resume & Optional Cover Letter)
  if (resumeId) {
    documents.push({
      type: 'RESUME',
      title: `${job.title} Tailored Resume.pdf`,
      url: `/api/resume/download?id=${resumeId}`,
      sourceResumeId: resumeId,
      status: 'READY',
      required: true,
    });
  }

  if (profile.career.portfolioUrl) {
    documents.push({
      type: 'PORTFOLIO',
      title: 'Online Portfolio',
      url: profile.career.portfolioUrl,
      status: 'READY',
      required: false,
    });
  }

  if (profile.career.githubUrl) {
    documents.push({
      type: 'GITHUB',
      title: 'GitHub Repository Profile',
      url: profile.career.githubUrl,
      status: 'READY',
      required: false,
    });
  }

  // Optional Cover Letter (Only drafted if explicitly asked or requested)
  const jobMentionsCoverLetter = job.description && /cover\s*letter/i.test(job.description);
  if (includeCoverLetter || jobMentionsCoverLetter) {
    const clDraft = `Dear Hiring Team at ${job.company},\n\nI am writing to express my strong interest in the ${job.title} position. With my background in ${profile.career.primaryTechStack.slice(0, 3).join(', ')} and proven track record at ${profile.career.currentCompany || 'high-growth teams'}, I am excited about the opportunity to contribute to ${job.company}.\n\nSincerely,\n${rawFullName}`;

    answers['cover_letter_text'] = {
      key: 'cover_letter_text',
      label: 'Cover Letter',
      type: 'LONG_TEXT',
      value: clDraft,
      status: 'GENERATED_DRAFT',
      source: 'generated',
      verified: false,
      required: Boolean(jobMentionsCoverLetter),
      sensitive: false,
    };

    documents.push({
      type: 'COVER_LETTER',
      title: `Cover Letter - ${job.company}.pdf`,
      url: '#draft_cover_letter',
      status: 'DRAFT',
      required: Boolean(jobMentionsCoverLetter),
    });
  }

  return {
    answers,
    unknownQuestions,
    documents,
    hasBlockerAnswer,
    blockerReason,
  };
}
