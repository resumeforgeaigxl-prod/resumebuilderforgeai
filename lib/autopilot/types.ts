/**
 * ResumeForge — Level 16: Omni Autopilot Policy Engine & Scheduling
 * Domain types for candidate policy, decision outcomes, scheduled runs,
 * review queue, and cost controls.
 */

export type AutopilotMode =
  | 'OFF'
  | 'DISCOVER'
  | 'PREPARE'
  | 'REVIEW_AND_EXECUTE';

export type RemotePreference =
  | 'REMOTE'
  | 'HYBRID'
  | 'ONSITE'
  | 'ANY';

export type AutopilotDecisionType =
  | 'ELIGIBLE'
  | 'SKIPPED'
  | 'BLOCKED'
  | 'NEEDS_USER'
  | 'ALREADY_APPLIED'
  | 'UNSUPPORTED'
  | 'OVER_BUDGET';

export type AutopilotRunStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED'
  | 'CANCELLED'
  | 'PAUSED_BUDGET'
  | 'PAUSED_USER'
  | 'PAUSED_SECURITY';

export interface AutopilotPolicy {
  id: string;
  userId: string;
  enabled: boolean;
  mode: AutopilotMode;

  targetRoles: string[];
  preferredLocations: string[];
  remotePreference: RemotePreference;
  allowedEmploymentTypes: string[];

  minSalary?: number;
  salaryCurrency: string;

  experienceRange?: {
    minimum?: number;
    maximum?: number;
  };

  minMatchScore: number;
  excludedCompanies: string[];

  dailyPreparationLimit: number;
  weeklyPreparationLimit: number;

  dailySubmissionLimit: number;
  weeklySubmissionLimit: number;

  creditBudgetPerDay: number;
  creditBudgetPerMonth: number;

  timezone: string;
  preferredExecutionHour: number; // 0-23 in candidate's timezone
  frequency: 'DAILY' | 'TWICE_DAILY';

  policyVersion: number;
  isPaused: boolean;
  pauseReason?: string;
  lastRunAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface AutopilotJobDecision {
  jobId: string;
  jobTitle: string;
  company: string;
  decision: AutopilotDecisionType;
  reason: string;
  matchScore?: number;
  blockers?: string[];
  confidence?: string;
  evaluatedAt: string;
}

export interface AutopilotRunRecord {
  id: string;
  userId: string;
  policyVersion: number;
  mode: AutopilotMode;
  status: AutopilotRunStatus;

  startedAt: string;
  finishedAt?: string;

  jobsEvaluated: number;
  jobsEligible: number;
  applicationsPrepared: number;
  applicationsSubmitted: number;

  creditsReserved: number;
  creditsSettled: number;

  decisions: AutopilotJobDecision[];
  errorCode?: string;
  errorMessage?: string;
  idempotencyKey: string;
  createdAt: string;
}

export interface AutopilotReviewItem {
  applicationId: string;
  jobId: string;
  packageId?: string;
  roleTitle: string;
  companyName: string;
  location?: string;
  applyUrl?: string;
  matchScore: number;
  matchSummary?: string;
  resumeVersionId?: string;
  resumeTitle?: string;
  missingAnswersCount: number;
  missingAnswers?: Array<{ key: string; question: string; required: boolean }>;
  creditCost: number;
  status: string; // 'READY' | 'NEEDS_USER' | 'AWAITING_APPROVAL'
  approvalId?: string;
  approvedAt?: string;
  preparedAt: string;
}

export interface AutopilotActivityStats {
  jobsEvaluatedToday: number;
  jobsEligibleToday: number;
  applicationsPreparedToday: number;
  applicationsSubmittedToday: number;
  pendingReviewCount: number;
  creditsSpentToday: number;
  creditsBudgetRemaining: number;
  lastRunStatus?: AutopilotRunStatus;
  lastRunTime?: string;
}

export const DEFAULT_AUTOPILOT_LIMITS = {
  maxDailyPreparation: 5,
  maxWeeklyPreparation: 20,
  maxDailySubmission: 2,
  maxWeeklySubmission: 10,
  defaultCreditBudgetDay: 40,
  defaultCreditBudgetMonth: 500,
  preparationCostPerApp: 4,
  submissionCostPerApp: 8,
  minAllowedScore: 50,
  maxAllowedScore: 98,
};
