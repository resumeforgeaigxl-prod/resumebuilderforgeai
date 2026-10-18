/**
 * ResumeForge — Memory Policy (Level 12.5)
 * Version: 1.0.0
 *
 * Governs truth priority and memory persistence rules.
 * Strictly prevents model inference from contaminating verified candidate records.
 */

import type { DomainPolicy, PolicyDecision, PolicyEvaluationContext } from './types';

export const MEMORY_POLICY_VERSION = '1.0.0';

export const MEMORY_TRUTH_HIERARCHY = [
  'VERIFIED_APPLICATION_PROFILE', // Highest authority (explicitly confirmed candidate truth)
  'CANONICAL_RESUME',             // Parsed & candidate-approved resume
  'STRUCTURED_PRODUCT_DATA',      // Jobs, applications, interview scores
  'CONVERSATION_CONTEXT',         // Session exchange
  'MODEL_INFERENCE',              // Lowest authority (probabilistic reasoning)
] as const;

export const MemoryPolicy: DomainPolicy = {
  id: 'memory-policy',
  name: 'Candidate Truth Hierarchy & Memory Write Policy',
  version: MEMORY_POLICY_VERSION,
  description: 'Guarantees that model inferences never silently overwrite verified candidate truth.',

  async evaluate(ctx: PolicyEvaluationContext): Promise<PolicyDecision> {
    const { action, memoryWrite } = ctx;

    if (action === 'WRITE_CANDIDATE_MEMORY' || action === 'UPDATE_PROFILE_FACT') {
      if (!memoryWrite) {
        return {
          allowed: false,
          policyId: 'memory-policy',
          reasonCode: 'MISSING_MEMORY_PAYLOAD',
          humanMessage: 'Memory update requires an explicit payload.',
        };
      }

      // Guard 1: Model inference cannot claim to be verified fact
      if (memoryWrite.source === 'model_inference' && memoryWrite.verified === true) {
        return {
          allowed: false,
          policyId: 'memory-policy',
          reasonCode: 'INFERENCE_AS_FACT_FORBIDDEN',
          humanMessage: 'Model inference cannot be written to verified candidate memory. Only user-confirmed facts may have verified=true.',
        };
      }

      // Guard 2: Model-generated flattering statements cannot become skills
      if (memoryWrite.isGeneratedPraise && memoryWrite.targetField === 'skills') {
        return {
          allowed: false,
          policyId: 'memory-policy',
          reasonCode: 'GENERATED_SKILL_INJECTION_BLOCKED',
          humanMessage: 'AI-generated statements cannot inject new skills into candidate profile.',
        };
      }
    }

    return {
      allowed: true,
      policyId: 'memory-policy',
      reasonCode: 'MEMORY_POLICY_COMPLIANT',
    };
  },

  getPromptSnippet(): string {
    return `[POLICY: MEMORY_POLICY v${MEMORY_POLICY_VERSION}]
- TRUTH HIERARCHY:
  1. Verified Application Profile (Highest truth)
  2. Canonical Master Resume
  3. Structured platform records (Jobs, Applications, ATS scores)
  4. Conversation context
  5. Model inference (Lowest truth)
- NO CONTAMINATION: Model inference must NEVER overwrite verified facts.
- WRITE RULES: You may record explicit candidate statements (e.g. "My notice period is 30 days" -> notice_period=30 days, source='user'). But generated summaries, praise, or assumptions must NEVER silently add skills or experience to the candidate profile.`;
  },
};
