/**
 * ResumeForge — Level 15: Application Execution, Evidence & Status Tracking
 * Core domain types for canonical application tracking, immutable provenance,
 * trustworthy evidence records, and structured receipts.
 */

export type ApplicationStatus =
  | 'SAVED'
  | 'PREPARING'
  | 'NEEDS_USER'
  | 'READY'
  | 'SUBMISSION_PENDING'
  | 'APPLIED'
  | 'IN_REVIEW'
  | 'ASSESSMENT'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'CLOSED';

export type SubmissionMethod =
  | 'OMNI_BROWSER'
  | 'MANUAL'
  | 'EXTERNAL_IMPORT';

export type EvidenceType =
  | 'SUBMISSION_CONFIRMATION'
  | 'PROVIDER_RECEIPT'
  | 'SCREENSHOT'
  | 'DOCUMENT_REFERENCE'
  | 'STATUS_UPDATE'
  | 'USER_ATTESTATION';

export type VerificationStatus =
  | 'VERIFIED'
  | 'UNVERIFIED'
  | 'USER_REPORTED';

export type StatusEventSource =
  | 'BROWSER_CONFIRMATION'
  | 'EMPLOYER_INTEGRATION'
  | 'USER_REPORTED'
  | 'PLATFORM';

export interface JobSnapshot {
  jobId?: string;
  title: string;
  companyName: string;
  location?: string;
  employmentType?: string;
  applyUrl?: string;
  salarySnippet?: string;
  atsProvider?: string;
  capturedAt: string;
}

export interface SubmissionReceipt {
  submissionId: string;
  submittedAt: string;
  jobTitle: string;
  companyName: string;
  jobUrl?: string;
  resumeVersionId?: string;
  resumeTitle?: string;
  answersSummary?: Record<string, any>;
  atsProvider?: string;
  confirmationCode?: string;
  confirmationMessage?: string;
  evidenceId?: string;
  verificationStatus: VerificationStatus;
}

export interface ApplicationEvidence {
  id: string;
  userId: string;
  applicationId: string;
  browserRunId?: string;
  type: EvidenceType;
  source: string;
  storageReference?: string;
  externalReference?: string;
  metadata?: Record<string, any>;
  verificationStatus: VerificationStatus;
  capturedAt: string;
  createdAt: string;
}

export interface ApplicationStatusEvent {
  id: string;
  userId: string;
  applicationId: string;
  previousStatus: ApplicationStatus | null;
  nextStatus: ApplicationStatus;
  source: StatusEventSource;
  evidenceId?: string;
  notes?: string;
  metadata?: Record<string, any>;
  idempotencyKey: string;
  occurredAt: string;
  recordedAt: string;
}

export interface JobApplicationRecord {
  id: string;
  userId: string;
  jobId: string;
  companyName: string;
  roleTitle: string;
  applicationPackageId?: string;
  resumeVersionId?: string;
  submissionMethod: SubmissionMethod;
  status: ApplicationStatus;
  submissionEvidenceId?: string;
  submissionReceipt?: SubmissionReceipt;
  jobSnapshot?: JobSnapshot;
  appliedAt?: string;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface ApplicationDetailView extends JobApplicationRecord {
  evidence: ApplicationEvidence[];
  timeline: ApplicationStatusEvent[];
  latestEvidence?: ApplicationEvidence;
  activeRunId?: string;
  activeRunStatus?: string;
}

export interface ApplicationStats {
  total: number;
  saved: number;
  preparing: number;
  ready: number;
  submissionPending: number;
  applied: number;
  inReview: number;
  interview: number;
  offer: number;
  rejected: number;
  withdrawn: number;
  closed: number;
}

/**
 * Valid state transitions matrix
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  SAVED: ['PREPARING', 'READY', 'SUBMISSION_PENDING', 'APPLIED', 'CLOSED'],
  PREPARING: ['SAVED', 'NEEDS_USER', 'READY', 'CLOSED'],
  NEEDS_USER: ['PREPARING', 'READY', 'CLOSED'],
  READY: ['PREPARING', 'SUBMISSION_PENDING', 'APPLIED', 'CLOSED'],
  SUBMISSION_PENDING: ['READY', 'APPLIED', 'CLOSED'],
  APPLIED: ['IN_REVIEW', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN', 'CLOSED'],
  IN_REVIEW: ['ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN', 'CLOSED'],
  ASSESSMENT: ['IN_REVIEW', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN', 'CLOSED'],
  INTERVIEW: ['ASSESSMENT', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN', 'CLOSED'],
  OFFER: ['APPLIED', 'CLOSED', 'WITHDRAWN'], // Can also conclude
  REJECTED: ['CLOSED'],
  WITHDRAWN: ['CLOSED'],
  CLOSED: ['SAVED'] // Can re-save or restart if reopened
};

/**
 * Human-friendly status metadata
 */
export const APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatus,
  {
    label: string;
    description: string;
    color: string;
    badgeBg: string;
    badgeText: string;
    borderColor: string;
    requiresEvidence: boolean;
  }
> = {
  SAVED: {
    label: 'Saved',
    description: 'Saved for later consideration',
    color: '#7E7E7E',
    badgeBg: '#1A1A1A',
    badgeText: '#BDBDBD',
    borderColor: '#242424',
    requiresEvidence: false,
  },
  PREPARING: {
    label: 'Preparing',
    description: 'Tailoring resume and answering questions',
    color: '#8B5CF6',
    badgeBg: 'rgba(139, 92, 246, 0.1)',
    badgeText: '#A78BFA',
    borderColor: 'rgba(139, 92, 246, 0.25)',
    requiresEvidence: false,
  },
  NEEDS_USER: {
    label: 'Needs Review',
    description: 'User input or clarification required',
    color: '#F59E0B',
    badgeBg: 'rgba(245, 158, 11, 0.1)',
    badgeText: '#FBBF24',
    borderColor: 'rgba(245, 158, 11, 0.25)',
    requiresEvidence: false,
  },
  READY: {
    label: 'Ready to Apply',
    description: 'Package complete and ready for submission',
    color: '#10B981',
    badgeBg: 'rgba(16, 185, 129, 0.1)',
    badgeText: '#34D399',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    requiresEvidence: false,
  },
  SUBMISSION_PENDING: {
    label: 'Submitting',
    description: 'Browser submission in progress',
    color: '#3B82F6',
    badgeBg: 'rgba(59, 130, 246, 0.1)',
    badgeText: '#60A5FA',
    borderColor: 'rgba(59, 130, 246, 0.25)',
    requiresEvidence: false,
  },
  APPLIED: {
    label: 'Applied',
    description: 'Submission confirmed with evidence or reported by user',
    color: '#8B5CF6',
    badgeBg: 'rgba(139, 92, 246, 0.15)',
    badgeText: '#C4B5FD',
    borderColor: 'rgba(139, 92, 246, 0.3)',
    requiresEvidence: true,
  },
  IN_REVIEW: {
    label: 'In Review',
    description: 'Application under employer evaluation',
    color: '#8B5CF6',
    badgeBg: 'rgba(139, 92, 246, 0.12)',
    badgeText: '#A78BFA',
    borderColor: 'rgba(139, 92, 246, 0.25)',
    requiresEvidence: false,
  },
  ASSESSMENT: {
    label: 'Assessment',
    description: 'Take-home assignment or technical test',
    color: '#EC4899',
    badgeBg: 'rgba(236, 72, 153, 0.1)',
    badgeText: '#F472B6',
    borderColor: 'rgba(236, 72, 153, 0.25)',
    requiresEvidence: false,
  },
  INTERVIEW: {
    label: 'Interview',
    description: 'Interview invited or scheduled',
    color: '#10B981',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    badgeText: '#6EE7B7',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    requiresEvidence: false,
  },
  OFFER: {
    label: 'Offer',
    description: 'Formal or informal offer received',
    color: '#F59E0B',
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    badgeText: '#FCD34D',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    requiresEvidence: false,
  },
  REJECTED: {
    label: 'Not Selected',
    description: 'Application declined by employer',
    color: '#EF4444',
    badgeBg: 'rgba(239, 68, 68, 0.1)',
    badgeText: '#F87171',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    requiresEvidence: false,
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    description: 'Application withdrawn by candidate',
    color: '#6B7280',
    badgeBg: '#18181B',
    badgeText: '#A1A1AA',
    borderColor: '#27272A',
    requiresEvidence: false,
  },
  CLOSED: {
    label: 'Position Closed',
    description: 'Role cancelled or filled by employer',
    color: '#4B5563',
    badgeBg: '#18181B',
    badgeText: '#71717A',
    borderColor: '#27272A',
    requiresEvidence: false,
  },
};
