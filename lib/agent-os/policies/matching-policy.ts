/**
 * ResumeForge — Matching Policy (Level 12.5)
 * Version: 1.0.0
 *
 * Enforces Level 10 Candidate ↔ Job matching standards.
 * Forbids demographic scoring and hidden model-invented match scores.
 */

import type { DomainPolicy, PolicyDecision, PolicyEvaluationContext } from './types';

export const MATCHING_POLICY_VERSION = '1.0.0';

export const MatchingPolicy: DomainPolicy = {
  id: 'matching-policy',
  name: 'Candidate ↔ Job Matching Policy',
  version: MATCHING_POLICY_VERSION,
  description: 'Enforces deterministic blocker evaluation and strictly bans scoring based on sensitive demographic attributes.',

  async evaluate(ctx: PolicyEvaluationContext): Promise<PolicyDecision> {
    const { action, matchParams } = ctx;

    if (action === 'MATCH_CANDIDATE' || action === 'SCORE_FIT') {
      // 1. Guard against sensitive attribute influence in scoring
      if (matchParams?.evaluatedDemographics) {
        return {
          allowed: false,
          policyId: 'matching-policy',
          reasonCode: 'SENSITIVE_ATTRIBUTE_SCORING_BANNED',
          humanMessage: 'Candidate matching scores must never incorporate gender, race, age, religion, or disability.',
        };
      }

      // 2. Guard against inferred work authorization
      if (matchParams?.inferredWorkAuthorization) {
        return {
          allowed: false,
          policyId: 'matching-policy',
          reasonCode: 'INFERRED_WORK_AUTH_IN_MATCH_BANNED',
          humanMessage: 'Work authorization must never be guessed or inferred from candidate name, education, or location.',
        };
      }
    }

    return {
      allowed: true,
      policyId: 'matching-policy',
      reasonCode: 'MATCHING_POLICY_COMPLIANT',
    };
  },

  getPromptSnippet(): string {
    return `[POLICY: MATCHING_POLICY v${MATCHING_POLICY_VERSION}]
- CANONICAL MATCHING: Consume the Level 10 matching engine output. Never invent separate ad-hoc match percentages.
- DETERMINISTIC BLOCKERS FIRST: Work authorization, notice period, or hard qualification mismatches must be flagged as blockers before computing fit.
- DISTINGUISH EVIDENCE: Clearly distinguish between MANDATORY vs PREFERRED requirements, and MISSING requirements vs UNDERREPRESENTED candidate skills.
- ZERO DEMOGRAPHIC SCORING: Strictly forbidden from incorporating age, gender, race, marital status, or nationality into match scores.`;
  },
};
