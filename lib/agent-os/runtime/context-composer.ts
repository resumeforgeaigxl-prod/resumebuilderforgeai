/**
 * ResumeForge — Composable Context Composer (Level 12.5)
 * Version: 1.0.0
 *
 * Assembles dynamic, modular agent system prompts.
 * Avoids giant 20,000-line monolithic prompts by attaching only what the current task needs:
 * Base Constitution + Agent Role + Selected Skill + Relevant Policies + User Facts + Tool Schemas.
 */

import { getConstitutionPrompt } from '../constitution';
import { AgentRoleRegistry } from '../roles/registry';
import { SkillRegistry } from '../skills/registry';
import { PolicyEngine } from '../policies/policy-engine';
import type { AgentRoleType } from '../roles/types';
import type { SkillId } from '../skills/types';
import type { PolicyId } from '../policies/types';

export interface ComposeContextOptions {
  role: AgentRoleType;
  skillId?: SkillId;
  userContextSnippet?: string;
  taskDescription?: string;
}

export class ContextComposer {
  /**
   * Composes a lean, targeted system prompt for the agent runtime.
   */
  static compose(options: ComposeContextOptions): string {
    const { role, skillId, userContextSnippet = '', taskDescription } = options;

    const sections: string[] = [];

    // 1. Central Constitution (Mandatory across all agents & models)
    sections.push(getConstitutionPrompt());

    // 2. Specialized Agent Role Definition
    const roleDef = AgentRoleRegistry.getRole(role);
    sections.push(`=== AGENT ROLE: ${roleDef.title.toUpperCase()} ===\n${roleDef.systemRolePrompt}`);

    // 3. Selected Skill (Only loaded if a specific skill is active)
    let policiesToLoad: PolicyId[] = [...roleDef.applicablePolicies];

    if (skillId) {
      const skillDef = SkillRegistry.getSkill(skillId);
      sections.push(
        `=== ACTIVE SKILL: ${skillDef.skillId.toUpperCase()} (v${skillDef.version}) ===\n` +
        `PURPOSE: ${skillDef.purpose}\n` +
        `PRECONDITIONS: ${skillDef.preconditions.join('; ')}\n` +
        `PROCEDURE:\n${skillDef.procedure.map((p, idx) => `  ${idx + 1}. ${p}`).join('\n')}\n` +
        `STOP CONDITIONS: ${skillDef.stopConditions.join('; ')}`
      );

      // Merge skill-specific policies
      for (const p of skillDef.applicablePolicies) {
        if (!policiesToLoad.includes(p)) {
          policiesToLoad.push(p);
        }
      }
    }

    // 4. Applicable Policies (Only policies relevant to the active role and skill)
    if (policiesToLoad.length > 0) {
      const policySnippets = PolicyEngine.getPromptSnippets(policiesToLoad);
      if (policySnippets) {
        sections.push(`=== APPLICABLE OPERATING POLICIES ===\n${policySnippets}`);
      }
    }

    // 5. User Context (Truth-prioritized, filtered)
    if (userContextSnippet && userContextSnippet.trim() !== '') {
      sections.push(`=== CANDIDATE CONTEXT (VERIFIED RECORD) ===\n${userContextSnippet}`);
    }

    // 6. Current Task Focus
    if (taskDescription && taskDescription.trim() !== '') {
      sections.push(`=== TASK DIRECTIVE ===\n${taskDescription}`);
    }

    return sections.join('\n\n');
  }
}
