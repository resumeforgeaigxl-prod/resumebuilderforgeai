'use client';

import type { LearningArtifact } from './LearningArtifactCard';
import type { ResumeArtifact } from './ResumeArtifactCard';
import type { JobArtifact } from './JobArtifactCard';
import type { InterviewArtifact } from './InterviewArtifactCard';
import type { CodingArtifact } from './CodingArtifactCard';
import type { ProjectArtifact } from './ProjectArtifactCard';
import type { SalaryArtifact } from './SalaryArtifactCard';
import type { ProfileArtifact } from './ProfileArtifactCard';

export type OmniResponseType =
  | 'SHORT_TEXT'
  | 'STRUCTURED_ARTIFACT'
  | 'ACTION_RESULT'
  | 'NEEDS_USER'
  | 'ERROR'
  | 'HANDOFF';

export interface JobMatchArtifact {
  tool?: 'get_job_match' | 'explain_job_match' | 'rank_candidate_jobs' | string;
  success?: boolean;
  jobId?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  score?: number;
  category?: 'EXCELLENT' | 'STRONG' | 'POSSIBLE' | 'WEAK' | 'LOW' | string;
  recommendation?:
    | 'EXCELLENT_APPLY'
    | 'STRONG_APPLY'
    | 'APPLY_IF_INTERESTED'
    | 'LOW_PRIORITY'
    | 'SKIP'
    | 'BLOCKED'
    | string;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  isBlocked?: boolean;
  summary?: string;
  strongMatches?: string[];
  missingRequirements?: string[];
  underrepresentedSkills?: string[];
  blockers?: string[];
  evidence?: Array<{
    requirement: string;
    candidateEvidence: string;
    jobEvidence: string;
    status: string;
  }>;
  matches?: Array<{
    jobId: string;
    score: number;
    category: string;
    recommendation: string;
    confidence: string;
    summary: string;
    strongMatches: string[];
    missingRequirements: string[];
    underrepresentedSkills: string[];
    isBlocked: boolean;
    jobTitle?: string;
    company?: string;
    location?: string;
  }>;
  message?: string;
}

export interface ApplicationArtifact {
  tool?: 'prepare_job_application_package' | 'answer_application_questions' | string;
  success?: boolean;
  status: 'READY' | 'NEEDS_USER' | 'BLOCKED' | 'DRAFT' | 'PREPARING' | string;
  packageId?: string;
  jobId?: string;
  jobTitle?: string;
  company?: string;
  readinessScore?: string | number;
  resumeUsed?: string;
  tailoringStatus?: string;
  missingQuestionsCount?: number;
  missingQuestions?: Array<{
    key: string;
    question: string;
    category?: string;
    required: boolean;
    reason: string;
    allowedOptions?: string[];
    sensitive?: boolean;
    defaultValue?: any;
  }>;
  reason?: string;
  evidence?: string;
  message?: string;
}

export type ErrorArtifactType =
  | 'CREDIT_EXHAUSTED'
  | 'RATE_LIMIT'
  | 'POLICY_BLOCKED'
  | 'TOOL_FAILED'
  | 'AUTHENTICATION_REQUIRED'
  | 'JOB_NOT_FOUND'
  | 'JOB_CLOSED'
  | 'JOB_UNVERIFIED'
  | 'JOB_UNSUPPORTED'
  | 'GENERAL';

export interface ErrorArtifact {
  tool?: 'error_card' | string;
  errorType: ErrorArtifactType;
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  actionType?: 'topup' | 'pricing' | 'retry' | 'profile' | 'dismiss' | 'explore_jobs';
  action?: string;
  retryable?: boolean;
  details?: string;
}

export type OmniArtifact =
  | LearningArtifact
  | ResumeArtifact
  | JobArtifact
  | JobMatchArtifact
  | InterviewArtifact
  | CodingArtifact
  | ProjectArtifact
  | SalaryArtifact
  | ProfileArtifact
  | ApplicationArtifact
  | ErrorArtifact;

export interface OmniMessage {
  role: 'user' | 'assistant';
  content: string;
  responseType?: OmniResponseType;
  suggestedAction?: string;
  analysis?: Record<string, unknown>;
  artifacts?: OmniArtifact[];
  blocks?: any[];
}

export interface OmniResponseEnvelope {
  reply: string;
  responseType?: OmniResponseType;
  suggestedAction?: string;
  analysis?: Record<string, unknown>;
  artifacts?: OmniArtifact[];
  blocks?: any[];
  status?: 'success' | 'error' | 'needs_user';
}

export type {
  LearningArtifact,
  ResumeArtifact,
  JobArtifact,
  InterviewArtifact,
  CodingArtifact,
  ProjectArtifact,
  SalaryArtifact,
  ProfileArtifact,
};
