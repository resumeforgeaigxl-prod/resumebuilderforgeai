/**
 * ResumeForge — Central Policy Engine (Level 12.5)
 * Version: 1.0.0
 *
 * Coordinates execution evaluation across all 11 domain policies.
 * Server-side authoritative barrier between agent intent and tool execution.
 */

import type { PolicyId, PolicyDecision, PolicyEvaluationContext, DomainPolicy } from './types';
import { ResumePolicy } from './resume-policy';
import { JobPolicy } from './job-policy';
import { MatchingPolicy } from './matching-policy';
import { ApplicationPolicy } from './application-policy';
import { SensitiveAnswerPolicy } from './sensitive-answer-policy';
import { CreditPolicy } from './credit-policy';
import { BrowserPolicy } from './browser-policy';
import { HumanHandoffPolicy } from './human-handoff-policy';
import { MemoryPolicy } from './memory-policy';
import { ModelRoutingPolicy } from './model-routing-policy';
import { ToolUsePolicy } from './tool-use-policy';

export class PolicyEngine {
  private static policies: Map<PolicyId, DomainPolicy> = new Map([
    ['resume-policy', ResumePolicy],
    ['job-policy', JobPolicy],
    ['matching-policy', MatchingPolicy],
    ['application-policy', ApplicationPolicy],
    ['sensitive-answer-policy', SensitiveAnswerPolicy],
    ['credit-policy', CreditPolicy],
    ['browser-policy', BrowserPolicy],
    ['human-handoff-policy', HumanHandoffPolicy],
    ['memory-policy', MemoryPolicy],
    ['model-routing-policy', ModelRoutingPolicy],
    ['tool-use-policy', ToolUsePolicy],
  ]);

  /**
   * Evaluates a single specific policy.
   */
  static async evaluatePolicy(
    policyId: PolicyId,
    ctx: PolicyEvaluationContext
  ): Promise<PolicyDecision> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      return {
        allowed: false,
        policyId,
        reasonCode: 'POLICY_NOT_FOUND',
        humanMessage: `Policy "${policyId}" does not exist in registry.`,
      };
    }

    try {
      return await policy.evaluate(ctx);
    } catch (err: any) {
      console.error(`[PolicyEngine] Error evaluating ${policyId}:`, err);
      return {
        allowed: false,
        policyId,
        reasonCode: 'POLICY_EVALUATION_ERROR',
        humanMessage: `Internal error evaluating policy ${policyId}: ${err.message}`,
      };
    }
  }

  /**
   * Evaluates a set of applicable policies for an action.
   * Fails fast if any policy returns allowed: false.
   */
  static async evaluateAll(
    policyIds: PolicyId[],
    ctx: PolicyEvaluationContext
  ): Promise<PolicyDecision> {
    for (const policyId of policyIds) {
      const decision = await this.evaluatePolicy(policyId, ctx);
      if (!decision.allowed) {
        return decision; // Block immediately on first violation
      }
    }

    return {
      allowed: true,
      policyId: policyIds[0] || 'application-policy',
      reasonCode: 'ALL_POLICIES_SATISFIED',
    };
  }

  /**
   * Returns composable prompt snippets for the requested policies.
   */
  static getPromptSnippets(policyIds: PolicyId[]): string {
    const snippets: string[] = [];
    for (const pid of policyIds) {
      const policy = this.policies.get(pid);
      if (policy) {
        snippets.push(policy.getPromptSnippet());
      }
    }
    return snippets.join('\n\n');
  }

  /**
   * Returns list of all registered policy IDs.
   */
  static getRegisteredPolicyIds(): PolicyId[] {
    return Array.from(this.policies.keys());
  }
}
