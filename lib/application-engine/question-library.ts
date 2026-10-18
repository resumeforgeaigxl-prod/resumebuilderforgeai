/**
 * ResumeForge — Canonical Application Question Library & Synonyms
 * Standard dictionary of application fields, types, categories, and synonym mapping.
 */

import type { FieldType, QuestionCategory } from './types';

export interface FieldDefinition {
  key: string;
  label: string;
  type: FieldType;
  category: QuestionCategory;
  required: boolean;
  sensitive: boolean;
  isReusable: boolean; // Reusable across jobs vs job-specific
  allowedOptions?: string[];
  description?: string;
}

/**
 * Standard Library of Known Canonical Application Fields
 */
export const CANONICAL_FIELD_LIBRARY: Record<string, FieldDefinition> = {
  // Identity & Contact
  first_name: {
    key: 'first_name',
    label: 'First Name',
    type: 'TEXT',
    category: 'IDENTITY',
    required: true,
    sensitive: false,
    isReusable: true,
  },
  last_name: {
    key: 'last_name',
    label: 'Last Name',
    type: 'TEXT',
    category: 'IDENTITY',
    required: true,
    sensitive: false,
    isReusable: true,
  },
  full_name: {
    key: 'full_name',
    label: 'Full Legal Name',
    type: 'TEXT',
    category: 'IDENTITY',
    required: true,
    sensitive: false,
    isReusable: true,
  },
  email: {
    key: 'email',
    label: 'Email Address',
    type: 'EMAIL',
    category: 'IDENTITY',
    required: true,
    sensitive: false,
    isReusable: true,
  },
  phone: {
    key: 'phone',
    label: 'Phone Number',
    type: 'PHONE',
    category: 'IDENTITY',
    required: true,
    sensitive: false,
    isReusable: true,
  },
  location: {
    key: 'location',
    label: 'Current Location / City',
    type: 'TEXT',
    category: 'LOCATION',
    required: true,
    sensitive: false,
    isReusable: true,
  },
  linkedin_url: {
    key: 'linkedin_url',
    label: 'LinkedIn Profile URL',
    type: 'URL',
    category: 'IDENTITY',
    required: false,
    sensitive: false,
    isReusable: true,
  },
  github_url: {
    key: 'github_url',
    label: 'GitHub Profile URL',
    type: 'URL',
    category: 'IDENTITY',
    required: false,
    sensitive: false,
    isReusable: true,
  },
  portfolio_url: {
    key: 'portfolio_url',
    label: 'Portfolio / Personal Website',
    type: 'URL',
    category: 'IDENTITY',
    required: false,
    sensitive: false,
    isReusable: true,
  },

  // Employment & Career History
  current_company: {
    key: 'current_company',
    label: 'Current Employer',
    type: 'TEXT',
    category: 'EXPERIENCE',
    required: false,
    sensitive: false,
    isReusable: true,
  },
  current_role: {
    key: 'current_role',
    label: 'Current Job Title',
    type: 'TEXT',
    category: 'EXPERIENCE',
    required: false,
    sensitive: false,
    isReusable: true,
  },
  years_experience: {
    key: 'years_experience',
    label: 'Total Years of Experience',
    type: 'NUMBER',
    category: 'EXPERIENCE',
    required: true,
    sensitive: false,
    isReusable: true,
  },

  // Compensation
  current_salary: {
    key: 'current_salary',
    label: 'Current Compensation / CTC',
    type: 'TEXT',
    category: 'SALARY',
    required: false,
    sensitive: false,
    isReusable: true,
  },
  expected_salary: {
    key: 'expected_salary',
    label: 'Expected Compensation / CTC',
    type: 'TEXT',
    category: 'SALARY',
    required: true,
    sensitive: false,
    isReusable: true,
  },

  // Availability & Work Preferences
  notice_period: {
    key: 'notice_period',
    label: 'Notice Period',
    type: 'SELECT',
    category: 'AVAILABILITY',
    required: true,
    sensitive: false,
    isReusable: true,
    allowedOptions: ['Immediate (0-15 days)', '30 days', '60 days', '90 days', 'More than 90 days'],
  },
  available_start_date: {
    key: 'available_start_date',
    label: 'Earliest Available Start Date',
    type: 'DATE',
    category: 'AVAILABILITY',
    required: false,
    sensitive: false,
    isReusable: true,
  },
  relocation_preference: {
    key: 'relocation_preference',
    label: 'Willingness to Relocate',
    type: 'BOOLEAN',
    category: 'RELOCATION',
    required: true,
    sensitive: false,
    isReusable: true,
  },
  remote_preference: {
    key: 'remote_preference',
    label: 'Work Mode Preference (Remote / Hybrid / Onsite)',
    type: 'SELECT',
    category: 'LOCATION',
    required: true,
    sensitive: false,
    isReusable: true,
    allowedOptions: ['Remote Only', 'Hybrid', 'Onsite', 'Flexible'],
  },

  // Work Authorization (SENSITIVE - Never Inferred)
  work_authorization: {
    key: 'work_authorization',
    label: 'Are you legally authorized to work in this country?',
    type: 'BOOLEAN',
    category: 'WORK_AUTHORIZATION',
    required: true,
    sensitive: true,
    isReusable: true,
  },
  requires_sponsorship: {
    key: 'requires_sponsorship',
    label: 'Will you now or in the future require employment visa sponsorship?',
    type: 'BOOLEAN',
    category: 'SPONSORSHIP',
    required: true,
    sensitive: true,
    isReusable: true,
  },

  // Legal & Declarations (SENSITIVE - Never Inferred)
  non_compete: {
    key: 'non_compete',
    label: 'Are you currently subject to a non-compete or restrictive covenant?',
    type: 'BOOLEAN',
    category: 'LEGAL',
    required: false,
    sensitive: true,
    isReusable: true,
  },

  // Optional Self-Identification (SENSITIVE - Always preserves "Prefer not to answer")
  gender_identity: {
    key: 'gender_identity',
    label: 'Gender Identity',
    type: 'SELECT',
    category: 'SELF_IDENTIFICATION',
    required: false,
    sensitive: true,
    isReusable: true,
    allowedOptions: ['Male', 'Female', 'Non-binary', 'Prefer not to answer'],
  },
  disability_status: {
    key: 'disability_status',
    label: 'Voluntary Self-Identification of Disability',
    type: 'SELECT',
    category: 'SELF_IDENTIFICATION',
    required: false,
    sensitive: true,
    isReusable: true,
    allowedOptions: ['Yes, I have a disability', 'No, I do not have a disability', 'Prefer not to answer'],
  },
  veteran_status: {
    key: 'veteran_status',
    label: 'Veteran Status',
    type: 'SELECT',
    category: 'SELF_IDENTIFICATION',
    required: false,
    sensitive: true,
    isReusable: true,
    allowedOptions: ['I am a protected veteran', 'I am not a protected veteran', 'Prefer not to answer'],
  },

  // Job-Specific (NOT stored in global profile)
  why_this_company: {
    key: 'why_this_company',
    label: 'Why are you interested in joining our company?',
    type: 'LONG_TEXT',
    category: 'EMPLOYER_SPECIFIC',
    required: false,
    sensitive: false,
    isReusable: false,
  },
  why_this_role: {
    key: 'why_this_role',
    label: 'Why are you a great fit for this role?',
    type: 'LONG_TEXT',
    category: 'EMPLOYER_SPECIFIC',
    required: false,
    sensitive: false,
    isReusable: false,
  },
  relevant_project: {
    key: 'relevant_project',
    label: 'Describe a project you worked on relevant to this role.',
    type: 'LONG_TEXT',
    category: 'EMPLOYER_SPECIFIC',
    required: false,
    sensitive: false,
    isReusable: false,
  },
};

/**
 * Common Question Aliases / Synonyms for Mapping External ATS Fields
 */
export const FIELD_SYNONYMS: Record<string, string> = {
  // Notice period synonyms
  'notice period': 'notice_period',
  'how soon can you join': 'notice_period',
  'how soon can you start': 'notice_period',
  'availability': 'notice_period',
  'joining time': 'notice_period',
  'earliest start date': 'available_start_date',

  // Sponsorship synonyms
  'will you now or in the future require sponsorship': 'requires_sponsorship',
  'do you require visa sponsorship': 'requires_sponsorship',
  'sponsorship required': 'requires_sponsorship',
  'visa sponsorship': 'requires_sponsorship',
  'require sponsorship': 'requires_sponsorship',

  // Work auth synonyms
  'are you authorized to work in this country': 'work_authorization',
  'legally authorized to work': 'work_authorization',
  'work authorization': 'work_authorization',
  'right to work': 'work_authorization',

  // Compensation synonyms
  'expected salary': 'expected_salary',
  'salary expectation': 'expected_salary',
  'desired salary': 'expected_salary',
  'expected ctc': 'expected_salary',
  'current ctc': 'current_salary',
  'current salary': 'current_salary',

  // Relocation
  'are you willing to relocate': 'relocation_preference',
  'willing to relocate': 'relocation_preference',
  'relocation': 'relocation_preference',

  // Legal & Restrictive Covenants
  'non compete': 'non_compete',
  'noncompete': 'non_compete',
  'restrictive covenant': 'non_compete',
  'restrictive covenants': 'non_compete',

  // Experience
  'total years of experience': 'years_experience',
  'years of experience': 'years_experience',
  'experience (years)': 'years_experience',
};

/**
 * Normalizes an arbitrary question string into a known canonical field key if recognized.
 */
export function resolveQuestionKey(rawQuestion: string): string | null {
  const normalized = rawQuestion.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');

  for (const [synonym, key] of Object.entries(FIELD_SYNONYMS)) {
    if (normalized.includes(synonym)) {
      return key;
    }
  }

  return null;
}

/**
 * Checks whether a field is classified as strictly sensitive (requires explicit user consent/confirmation).
 */
export function isSensitiveField(key: string): boolean {
  const def = CANONICAL_FIELD_LIBRARY[key];
  if (def) return def.sensitive;
  return [
    'work_authorization',
    'requires_sponsorship',
    'citizenship',
    'disability_status',
    'veteran_status',
    'race_ethnicity',
    'gender_identity',
    'criminal_history',
    'medical_declarations',
  ].includes(key);
}
