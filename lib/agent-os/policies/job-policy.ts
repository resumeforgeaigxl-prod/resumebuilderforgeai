/**
 * ResumeForge — Job Policy (Level 12.5)
 * Version: 1.0.0
 *
 * Enforces canonical job source authority and Level 8 freshness rules.
 */

import type { DomainPolicy, PolicyDecision, PolicyEvaluationContext } from './types';

export const JOB_POLICY_VERSION = '1.0.0';

export const JobPolicy: DomainPolicy = {
  id: 'job-policy',
  name: 'Canonical Job & Freshness Policy',
  version: JOB_POLICY_VERSION,
  description: 'Guarantees that job actions strictly adhere to canonical job data and Level 8 freshness state.',

  async evaluate(ctx: PolicyEvaluationContext): Promise<PolicyDecision> {
    const { action, job } = ctx;

    if (!job) {
      if (action === 'PREPARE_APPLICATION' || action === 'TAILOR_RESUME_FOR_JOB' || action === 'MATCH_CANDIDATE') {
        return {
          allowed: false,
          policyId: 'job-policy',
          reasonCode: 'CANONICAL_JOB_REQUIRED',
          humanMessage: 'Action requires a valid canonical job record.',
        };
      }
      return { allowed: true, policyId: 'job-policy', reasonCode: 'NO_JOB_CONTEXT' };
    }

    const status = String(job.status || 'UNKNOWN').toUpperCase();

    // 1. CLOSED Jobs: Never allow recommendation, preparation, or submission
    if (status === 'CLOSED') {
      if (
        action === 'PREPARE_APPLICATION' ||
        action === 'SUBMIT_APPLICATION' ||
        action === 'RECOMMEND_APPLY' ||
        action === 'TAILOR_RESUME_FOR_JOB'
      ) {
        return {
          allowed: false,
          policyId: 'job-policy',
          reasonCode: 'JOB_CLOSED_DISALLOWED',
          humanMessage: `The job "${job.title}" at "${job.company}" is CLOSED and no longer accepting applications. No credits burned.`,
          details: { jobId: job.id, closureReason: job.closure_reason || 'POSITION_CLOSED' },
        };
      }
    }

    // 2. UNKNOWN Jobs: Re-verification required before expensive billable actions
    if (status === 'UNKNOWN') {
      if (action === 'PREPARE_APPLICATION' || action === 'SUBMIT_APPLICATION') {
        return {
          allowed: false,
          policyId: 'job-policy',
          reasonCode: 'JOB_VERIFICATION_REQUIRED',
          humanMessage: 'Job freshness status is UNKNOWN. Re-verification must succeed before preparing an application.',
          details: { jobId: job.id },
        };
      }
    }

    return {
      allowed: true,
      policyId: 'job-policy',
      reasonCode: 'JOB_POLICY_COMPLIANT',
    };
  },

  getPromptSnippet(): string {
    return `[POLICY: JOB_POLICY v${JOB_POLICY_VERSION}]
- CANONICAL AUTHORITY: All job recommendations and applications must reference verified canonical jobs with stable canonical IDs.
- CLOSED JOBS: Never recommend applying or prepare an application for a role marked CLOSED. Inform the user with empathy and suggest active replacements.
- UNKNOWN STATUS: Jobs with UNKNOWN status must be re-verified via Level 8 freshness checks before billable or preparation actions.
- ACTIVE ONLY: Only ACTIVE jobs are eligible for matching, tailoring, and application preparation.`;
  },
};
