/**
 * ResumeForge — Skill Executor (Level 12.5)
 * Version: 1.0.0
 *
 * Coordinates execution of skills with policy enforcement, permission verification,
 * credit budgets, and structured audit tracing.
 */

import { SkillRegistry } from './registry';
import { AgentRoleRegistry } from '../roles/registry';
import { PolicyEngine } from '../policies/policy-engine';
import type { SkillId, SkillResult, SkillExecutionContext } from './types';
import type { PolicyDecision } from '../policies/types';

export class SkillExecutor {
  /**
   * Executes a skill with rigorous policy and permission gates.
   */
  static async runSkill(
    skillId: SkillId,
    inputs: Record<string, any>,
    ctx: SkillExecutionContext
  ): Promise<SkillResult> {
    const startTime = Date.now();
    const skill = SkillRegistry.getSkill(skillId);
    const agentRole = ctx.agentRole;

    // 1. Role permission check
    const roleDef = AgentRoleRegistry.getRole(agentRole);
    if (!roleDef.allowedSkills.includes(skillId) && !roleDef.allowedSkills.includes('*')) {
      return {
        status: 'STOPPED',
        output: null,
        confidence: 'HIGH',
        evidence: { requestedSkill: skillId, agentRole },
        policyFlags: ['SKILL_NOT_PERMITTED_FOR_ROLE'],
      };
    }

    // 2. Pre-execution policy check
    const policyCtx = {
      action: skillId,
      agentRole,
      userId: ctx.userId,
      jobId: inputs.jobId,
      ...inputs,
    };

    const policyDecision: PolicyDecision = await PolicyEngine.evaluateAll(
      skill.applicablePolicies,
      policyCtx
    );

    if (!policyDecision.allowed) {
      return {
        status: policyDecision.requiredHandoff ? 'HANDOFF_REQUIRED' : 'STOPPED',
        output: null,
        confidence: 'HIGH',
        evidence: {
          policyViolation: policyDecision.reasonCode,
          policyId: policyDecision.policyId,
        },
        handoffRequired: policyDecision.requiredHandoff,
        policyFlags: [policyDecision.reasonCode],
      };
    }

    // 3. Skill execution
    try {
      const result = await skill.execute(inputs, ctx);
      return result;
    } catch (err: any) {
      console.error(`[SkillExecutor] Error executing skill ${skillId}:`, err);
      return {
        status: 'FAILED',
        output: null,
        confidence: 'LOW',
        evidence: { error: err.message },
        policyFlags: ['SKILL_EXECUTION_EXCEPTION'],
      };
    }
  }
}
