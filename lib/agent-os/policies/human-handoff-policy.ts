/**
 * ResumeForge — Human Handoff Policy (Level 12.5)
 * Version: 1.0.0
 *
 * Governs when and how autonomous execution pauses to request explicit candidate intervention.
 */

import type { DomainPolicy, PolicyDecision, PolicyEvaluationContext, HandoffRequest } from './types';

export const HUMAN_HANDOFF_POLICY_VERSION = '1.0.0';

export type HandoffTrigger =
  | 'UNKNOWN_MANDATORY_SENSITIVE_QUESTION'
  | 'LEGAL_DECLARATION'
  | 'CAPTCHA_ENCOUNTERED'
  | 'MFA_REQUIRED'
  | 'LOGIN_APPROVAL_REQUIRED'
  | 'UNEXPECTED_PAYMENT_REQUEST'
  | 'IDENTITY_VERIFICATION'
  | 'UNRECOGNIZED_EXTERNAL_ACTION'
  | 'LOW_CONFIDENCE_DANGEROUS_ACTION'
  | 'UNSUPPORTED_WORKFLOW';

export const HumanHandoffPolicy: DomainPolicy = {
  id: 'human-handoff-policy',
  name: 'Human-in-the-Loop Handoff Policy',
  version: HUMAN_HANDOFF_POLICY_VERSION,
  description: 'Guarantees that agents halt and hand control to the candidate whenever autonomous safety or legal boundaries are reached.',

  async evaluate(ctx: PolicyEvaluationContext): Promise<PolicyDecision> {
    const { handoffTrigger, triggerDetails } = ctx;

    if (handoffTrigger) {
      const handoff: HandoffRequest = {
        reason: triggerDetails?.reason || `Execution paused due to ${handoffTrigger}`,
        question: triggerDetails?.question || 'Your confirmation or intervention is required to proceed.',
        requiredAction: handoffTrigger,
        resumableState: triggerDetails?.resumableState || {},
        expiresAt: triggerDetails?.expiresAt || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      };

      return {
        allowed: false,
        policyId: 'human-handoff-policy',
        reasonCode: handoffTrigger,
        humanMessage: `Autonomous execution paused: ${handoff.reason}`,
        requiredHandoff: handoff,
        details: triggerDetails,
      };
    }

    return {
      allowed: true,
      policyId: 'human-handoff-policy',
      reasonCode: 'NO_HANDOFF_REQUIRED',
    };
  },

  getPromptSnippet(): string {
    return `[POLICY: HUMAN_HANDOFF_POLICY v${HUMAN_HANDOFF_POLICY_VERSION}]
- PROACTIVE PAUSE: You must immediately STOP and hand control to the candidate when encountering:
  1. Unknown mandatory sensitive questions (work auth, visa, disability, veteran, race, gender)
  2. Legal declarations (non-compete, NDA, binding arbitration, criminal record)
  3. Security challenges (CAPTCHA, MFA, 2FA prompt, account login)
  4. Identity verification (uploading passport, national ID)
  5. Any unexpected financial charge or payment gate
  6. Ambiguous or low-confidence actions where guessing could damage the candidate.
- RESUMABLE STATE: Every handoff must clearly explain what the candidate must do and preserve state so execution can resume cleanly once answered.`;
  },
};
