/**
 * ResumeForge — Sensitive Answer Policy (Level 12.5)
 * Version: 1.0.0
 *
 * Forbids inferring or guessing legal, compliance, or sensitive personal attributes.
 */

import type { DomainPolicy, PolicyDecision, PolicyEvaluationContext, HandoffRequest } from './types';

export const SENSITIVE_ANSWER_POLICY_VERSION = '1.0.0';

export const PROTECTED_SENSITIVE_FIELDS: readonly string[] = [
  'citizenship',
  'work_authorization',
  'visa_status',
  'requires_sponsorship',
  'disability_status',
  'race',
  'ethnicity',
  'gender_identity',
  'veteran_status',
  'medical_information',
  'criminal_history',
  'legal_declarations',
  'background_check_consent',
  'restrictive_covenants',
  'non_compete',
  'non_compete_status',
] as const;

export const SensitiveAnswerPolicy: DomainPolicy = {
  id: 'sensitive-answer-policy',
  name: 'Sensitive & Legal Answer Protection Policy',
  version: SENSITIVE_ANSWER_POLICY_VERSION,
  description: 'Guarantees that sensitive and legal application answers are never inferred or answered without verified user consent.',

  async evaluate(ctx: PolicyEvaluationContext): Promise<PolicyDecision> {
    const { action, questionKey, answerPayload, profile } = ctx;

    if (action === 'ANSWER_QUESTION' || action === 'MAP_APPLICATION_ANSWER') {
      const key = String(questionKey || '').toLowerCase();
      const isSensitive = PROTECTED_SENSITIVE_FIELDS.some(
        (sf) => key.includes(sf) || sf.includes(key)
      );

      if (isSensitive) {
        // If an agent tries to provide an answer without verified user input
        if (answerPayload && answerPayload.source !== 'user') {
          const handoff: HandoffRequest = {
            reason: `Question "${questionKey}" addresses sensitive legal or demographic information.`,
            question: questionKey,
            requiredAction: 'CANDIDATE_EXPLICIT_CONFIRMATION',
            resumableState: { questionKey, pendingAction: action },
          };

          return {
            allowed: false,
            policyId: 'sensitive-answer-policy',
            reasonCode: 'INFERRED_SENSITIVE_ANSWER_REJECTED',
            humanMessage: `Cannot infer sensitive or legal answer for "${questionKey}". Explicit candidate confirmation required.`,
            requiredHandoff: handoff,
          };
        }

        // If no verified answer exists in profile
        const verifiedAnswer = profile?.answers?.[questionKey];
        if (!verifiedAnswer || verifiedAnswer.status !== 'VERIFIED') {
          const handoff: HandoffRequest = {
            reason: `Mandatory sensitive field "${questionKey}" is unverified in profile.`,
            question: questionKey,
            requiredAction: 'USER_INPUT_REQUIRED',
            resumableState: { questionKey },
          };

          return {
            allowed: false,
            policyId: 'sensitive-answer-policy',
            reasonCode: 'SENSITIVE_ANSWER_MISSING',
            humanMessage: `Field "${questionKey}" requires direct user confirmation before application preparation.`,
            requiredHandoff: handoff,
          };
        }
      }
    }

    return {
      allowed: true,
      policyId: 'sensitive-answer-policy',
      reasonCode: 'SENSITIVE_ANSWER_POLICY_COMPLIANT',
    };
  },

  getPromptSnippet(): string {
    return `[POLICY: SENSITIVE_ANSWER_POLICY v${SENSITIVE_ANSWER_POLICY_VERSION}]
- ZERO INFERENCE: Never infer, guess, or assume work authorization, visa status, sponsorship requirement, citizenship, disability, race, ethnicity, gender, veteran status, medical info, criminal history, or restrictive covenants.
- VERIFIED SOURCE ONLY: A sensitive question may ONLY be filled if an explicitly VERIFIED candidate answer exists from source 'user'.
- MANDATORY HANDOFF: If a required sensitive question is missing or unverified, STOP immediately and report NEEDS_USER with a handoff request.
- OPTIONAL QUESTIONS: For optional demographic questions, allow the candidate to select 'Decline to state' or 'Prefer not to answer'.`;
  },
};
