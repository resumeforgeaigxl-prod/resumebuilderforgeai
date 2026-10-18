/**
 * ResumeForge — Model Routing & Escalation Policy (Level 12.5)
 * Version: 1.0.0
 *
 * Governs tiered model selection and cost-efficient escalation.
 * Deterministic code always outranks model execution.
 */

import type { DomainPolicy, PolicyDecision, PolicyEvaluationContext } from './types';

export const MODEL_ROUTING_POLICY_VERSION = '1.0.0';

export type ModelTier = 0 | 1 | 2 | 3 | 4;

export interface TierDescription {
  tier: ModelTier;
  label: string;
  engine: string;
  useCases: string[];
}

export const ROUTING_TIERS: readonly TierDescription[] = [
  {
    tier: 0,
    label: 'Deterministic Code',
    engine: 'Internal Typescript Engine / Database Query',
    useCases: ['Job status checks', 'Balance lookups', 'Profile retrieval', 'Freshness checks', 'Synonym mapping'],
  },
  {
    tier: 1,
    label: 'Fast / Cost-Effective LLM',
    engine: 'gemini-1.5-flash / groq:llama-3.1-8b',
    useCases: ['Intent routing', 'Basic question classification', 'Summary extraction', 'Keyword tagging'],
  },
  {
    tier: 2,
    label: 'Reliable Production LLM',
    engine: 'gemini-2.0-flash / gpt-4o-mini / mistral-large',
    useCases: ['Truthful resume tailoring', 'STAR interview evaluation', 'Job match explanations', 'Employer answer drafting'],
  },
  {
    tier: 3,
    label: 'Frontier / Complex LLM',
    engine: 'gemini-1.5-pro / gpt-4o / claude-3-5-sonnet',
    useCases: ['High-ambiguity edge cases', 'Low-confidence schema recovery', 'Complex executive negotiations'],
  },
  {
    tier: 4,
    label: 'Human Intervention',
    engine: 'Candidate In-the-Loop',
    useCases: ['Sensitive legal questions', 'Work authorization confirmations', 'CAPTCHA / MFA challenges'],
  },
] as const;

export const ModelRoutingPolicy: DomainPolicy = {
  id: 'model-routing-policy',
  name: 'Tiered Model Routing & Escalation Policy',
  version: MODEL_ROUTING_POLICY_VERSION,
  description: 'Enforces deterministic-first execution and cost-conscious model tiering.',

  async evaluate(ctx: PolicyEvaluationContext): Promise<PolicyDecision> {
    const { action, isDeterministicTask, requestedModelTier, confidence } = ctx;

    // 1. If deterministic code can solve it, calling an LLM is a policy violation
    if (isDeterministicTask && requestedModelTier && requestedModelTier > 0) {
      return {
        allowed: false,
        policyId: 'model-routing-policy',
        reasonCode: 'DETERMINISTIC_FIRST_VIOLATION',
        humanMessage: 'Task is solvable via deterministic code/tools. Do not invoke an LLM for deterministic operations.',
      };
    }

    // 2. Escalation check: Escalation to Tier 3 requires an explicit complexity or confidence justification
    if (requestedModelTier === 3 && confidence && confidence >= 0.85) {
      return {
        allowed: false,
        policyId: 'model-routing-policy',
        reasonCode: 'UNJUSTIFIED_FRONTIER_ESCALATION',
        humanMessage: 'Confidence is high (>= 85%). Task must be handled by Tier 1 or Tier 2 model to conserve compute costs.',
      };
    }

    return {
      allowed: true,
      policyId: 'model-routing-policy',
      reasonCode: 'ROUTING_POLICY_COMPLIANT',
    };
  },

  getPromptSnippet(): string {
    return `[POLICY: MODEL_ROUTING_POLICY v${MODEL_ROUTING_POLICY_VERSION}]
- TIER 0 FIRST: If deterministic code, database lookup, or tool can answer (e.g. credit balance, job status, salary currency), DO NOT guess with an LLM.
- TIER 1 DEFAULT: Use cost-effective models for routing, parsing, and classification.
- TIER 2 FOR REASONING: Use reliable models for resume tailoring and structured draft generation.
- TIER 3 ESCALATION: Only escalate to frontier models when schema extraction fails or confidence is critically low.
- TIER 4 FOR SENSITIVE: Never guess sensitive facts; hand off to the candidate.`;
  },
};
