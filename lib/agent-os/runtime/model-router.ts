/**
 * ResumeForge — Tiered Model Router & Escalation Engine (Level 12.5)
 * Version: 1.0.0
 *
 * Directs tasks to the cheapest capable model tier.
 * Deterministic code always outranks model execution.
 */

import type { ModelTier } from '../policies/model-routing-policy';
import { PROVIDER_CONFIGS } from '@/lib/ai/config';

export interface RouteDecision {
  tier: ModelTier;
  targetProvider: string;
  targetModel: string;
  isDeterministic: boolean;
  requiresHumanHandoff: boolean;
  escalationReason?: string;
  estimatedCostPer1k: number;
}

export class ModelRouter {
  /**
   * Evaluates task complexity and confidence to select the appropriate model tier.
   */
  static routeTask(params: {
    taskType: string;
    isDeterministic?: boolean;
    hasSchemaFailure?: boolean;
    confidenceScore?: number;
    isSensitiveQuestion?: boolean;
    forceTier?: ModelTier;
  }): RouteDecision {
    const {
      taskType,
      isDeterministic = false,
      hasSchemaFailure = false,
      confidenceScore = 1.0,
      isSensitiveQuestion = false,
      forceTier,
    } = params;

    // 1. Tier 4: Human Handoff required for sensitive/legal questions
    if (isSensitiveQuestion) {
      return {
        tier: 4,
        targetProvider: 'human',
        targetModel: 'candidate-interactive',
        isDeterministic: false,
        requiresHumanHandoff: true,
        escalationReason: 'SENSITIVE_LEGAL_DEMOGRAPHIC_QUESTION',
        estimatedCostPer1k: 0,
      };
    }

    // 2. Tier 0: Deterministic code (no model needed)
    const deterministicTasks = [
      'job_status_check',
      'wallet_balance_check',
      'profile_lookup',
      'synonym_resolution',
      'currency_conversion',
      'idempotency_check',
    ];

    if (isDeterministic || deterministicTasks.includes(taskType)) {
      return {
        tier: 0,
        targetProvider: 'internal_engine',
        targetModel: 'typescript_deterministic',
        isDeterministic: true,
        requiresHumanHandoff: false,
        estimatedCostPer1k: 0,
      };
    }

    // 3. Forced tier if specified
    if (forceTier !== undefined) {
      return this.getModelForTier(forceTier, 'EXPLICIT_TIER_OVERRIDE');
    }

    // 4. Escalation checks:
    // If previous attempt had a schema failure, escalate to Tier 3
    if (hasSchemaFailure) {
      return this.getModelForTier(3, 'PREVIOUS_SCHEMA_VALIDATION_FAILURE');
    }

    // If confidence is critically low (< 0.65), escalate to Tier 3
    if (confidenceScore < 0.65) {
      return this.getModelForTier(3, 'CONFIDENCE_BELOW_THRESHOLD');
    }

    // 5. Tier 2: Complex reasoning tasks (Tailoring, Match Explanation, Negotiation)
    const tier2Tasks = [
      'resume_tailoring',
      'match_explanation',
      'star_interview_evaluation',
      'salary_negotiation_script',
      'project_architecture',
    ];

    if (tier2Tasks.includes(taskType)) {
      return this.getModelForTier(2, 'COMPLEX_SEMANTIC_REASONING');
    }

    // 6. Tier 1: Default fast, cost-effective model (Classification, Parsing, Intent Routing)
    return this.getModelForTier(1, 'STANDARD_PARSING_AND_ROUTING');
  }

  private static getModelForTier(tier: ModelTier, reason?: string): RouteDecision {
    switch (tier) {
      case 0:
        return {
          tier: 0,
          targetProvider: 'internal_engine',
          targetModel: 'typescript_deterministic',
          isDeterministic: true,
          requiresHumanHandoff: false,
          escalationReason: reason,
          estimatedCostPer1k: 0,
        };
      case 1:
        return {
          tier: 1,
          targetProvider: 'gemini',
          targetModel: PROVIDER_CONFIGS.gemini.defaultModel,
          isDeterministic: false,
          requiresHumanHandoff: false,
          escalationReason: reason,
          estimatedCostPer1k: 0.008,
        };
      case 2:
        return {
          tier: 2,
          targetProvider: 'gemini',
          targetModel: PROVIDER_CONFIGS.gemini.defaultModel,
          isDeterministic: false,
          requiresHumanHandoff: false,
          escalationReason: reason,
          estimatedCostPer1k: 0.02,
        };
      case 3:
        return {
          tier: 3,
          targetProvider: 'gemini',
          targetModel: process.env.GEMINI_REASONING_MODEL || 'gemini-3.1-pro-preview',
          isDeterministic: false,
          requiresHumanHandoff: false,
          escalationReason: reason,
          estimatedCostPer1k: 0.25,
        };
      case 4:
      default:
        return {
          tier: 4,
          targetProvider: 'human',
          targetModel: 'candidate-interactive',
          isDeterministic: false,
          requiresHumanHandoff: true,
          escalationReason: reason,
          estimatedCostPer1k: 0,
        };
    }
  }
}
