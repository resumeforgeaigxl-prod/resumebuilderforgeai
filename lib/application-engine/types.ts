/**
 * ResumeForge — Application Preparation Engine (Level 12)
 * Canonical Type Contracts & Data Definitions
 */

import type { CanonicalJobRecord } from '@/lib/jobs/types';
import type { CandidateApplicationProfile } from '@/lib/capabilities/profile';
import type { CandidateJobMatchResult } from '@/lib/matching/types';

export type ApplicationPackageStatus =
  | 'DRAFT'
  | 'PREPARING'
  | 'NEEDS_USER'
  | 'READY'
  | 'BLOCKED'
  | 'FAILED'
  | 'EXPIRED';

export type AnswerStatus =
  | 'VERIFIED'
  | 'DERIVED_SAFE'
  | 'NEEDS_USER'
  | 'NOT_APPLICABLE'
  | 'BLOCKED'
  | 'GENERATED_DRAFT';

export type QuestionCategory =
  | 'IDENTITY'
  | 'EXPERIENCE'
  | 'SALARY'
  | 'AVAILABILITY'
  | 'LOCATION'
  | 'WORK_AUTHORIZATION'
  | 'SPONSORSHIP'
  | 'RELOCATION'
  | 'LEGAL'
  | 'SELF_IDENTIFICATION'
  | 'EMPLOYER_SPECIFIC'
  | 'FREE_TEXT'
  | 'OTHER';

export type FieldType =
  | 'TEXT'
  | 'NUMBER'
  | 'EMAIL'
  | 'PHONE'
  | 'URL'
  | 'DATE'
  | 'BOOLEAN'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'FILE'
  | 'LONG_TEXT';

export interface ApplicationField {
  key: string;
  label: string;
  type: FieldType;
  value: any;
  status: AnswerStatus;
  source: 'profile' | 'resume' | 'derived' | 'generated' | 'user';
  verified: boolean;
  required: boolean;
  sensitive: boolean;
  allowedOptions?: string[];
  evidence?: string;
}

export interface UnknownQuestion {
  key: string;
  question: string;
  category: QuestionCategory;
  required: boolean;
  reason: string;
  allowedOptions?: string[];
  sensitive: boolean;
  defaultValue?: any;
}

export interface ApplicationDocument {
  type: 'RESUME' | 'COVER_LETTER' | 'PORTFOLIO' | 'GITHUB' | 'OTHER';
  title: string;
  url: string;
  version?: string;
  sourceResumeId?: string;
  status: 'READY' | 'DRAFT' | 'FAILED';
  required: boolean;
}

export interface CandidateSnapshot {
  profileVersion: string;
  profileCompleteness: number;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  verifiedAt: string;
}

export interface JobSnapshot {
  id: string;
  title: string;
  company: string;
  applyUrl: string;
  status: string;
  lastVerifiedAt: string;
  location?: string;
  employmentType?: string;
  descriptionSnippet?: string;
}

export interface TailoringEvidence {
  baseResumeId: string;
  tailoredResumeId?: string;
  tailoringStatus: 'NONE' | 'REUSED' | 'TAILORED' | 'NOT_NEEDED' | 'FAILED';
  emphasizedSkills: string[];
  factualChanges: string[];
  truthPreservedConfirmed: boolean;
}

export interface MatchSnapshot {
  score: number;
  category: string;
  recommendation: string;
  confidence: string;
  underrepresentedSkills: string[];
  missingRequirements: string[];
  blockers: string[];
}

export interface ApplicationPackage {
  id: string;
  userId: string;
  jobId: string;
  jobApplicationId?: string | null;
  status: ApplicationPackageStatus;
  version: number;
  candidateSnapshot: CandidateSnapshot;
  jobSnapshot: JobSnapshot;
  resumeId?: string | null;
  resumeVersionId?: string | null;
  tailoredResumeId?: string | null;
  tailoringStatus: 'NONE' | 'REUSED' | 'TAILORED' | 'NOT_NEEDED' | 'FAILED';
  tailoringEvidence?: TailoringEvidence;
  answers: Record<string, ApplicationField>;
  unknownQuestions: UnknownQuestion[];
  documents: ApplicationDocument[];
  matchSnapshot: MatchSnapshot;
  readinessScore: number; // 0-100 percentage for UI display
  blockedReason?: string | null;
  blockedEvidence?: string | null;
  creditOperation?: {
    reservationId?: string;
    preparedCharged: number;
    tailorCharged: number;
  };
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

/**
 * Output contract consumed by the future Browser Agent.
 * Contains only verified truth, without requiring candidate reasoning.
 */
export interface ExecutableApplicationPackage {
  packageId: string;
  userId: string;
  jobId: string;
  applyUrl: string;
  candidateFields: Record<string, any>;
  answers: Record<string, any>;
  documents: ApplicationDocument[];
  resumeUrl: string;
  resumeId: string;
  status: 'READY';
  preparedAt: string;
  expiresAt: string;
}

export interface PrepareApplicationOptions {
  userId: string;
  jobId: string;
  forceFresh?: boolean;
  userOverride?: boolean;
  includeCoverLetter?: boolean;
}
