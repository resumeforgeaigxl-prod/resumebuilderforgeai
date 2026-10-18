/**
 * ResumeForge — Tool Use Policy (Level 12.5)
 * Version: 1.0.0
 *
 * Governs tool permissions, execution categorization, and side-effect safety.
 * Strictly bans universal database write tools and unauthenticated calls.
 */

import type { DomainPolicy, PolicyDecision, PolicyEvaluationContext } from './types';

export const TOOL_USE_POLICY_VERSION = '1.0.0';

export type ToolCategory =
  | 'READ'
  | 'WRITE_INTERNAL'
  | 'EXTERNAL_ACTION'
  | 'BILLABLE'
  | 'SENSITIVE';

export const BANNED_UNIVERSAL_TOOLS = [
  'updateDatabase',
  'runRawSql',
  'executeRawQuery',
  'bypassAuthorization',
  'launchRawBrowser',
  'dropTable',
] as const;

export const ToolUsePolicy: DomainPolicy = {
  id: 'tool-use-policy',
  name: 'Tool Authorization & Safety Policy',
  version: TOOL_USE_POLICY_VERSION,
  description: 'Guarantees that agents only call authorized, narrow domain tools with validated server-side permissions.',

  async evaluate(ctx: PolicyEvaluationContext): Promise<PolicyDecision> {
    const { toolName, agentRole, allowedTools } = ctx;

    if (!toolName) {
      return { allowed: true, policyId: 'tool-use-policy', reasonCode: 'NO_TOOL_REQUESTED' };
    }

    // 1. Strictly forbid universal database write or raw browser execution
    if (BANNED_UNIVERSAL_TOOLS.some((b) => b.toLowerCase() === toolName.toLowerCase())) {
      return {
        allowed: false,
        policyId: 'tool-use-policy',
        reasonCode: 'BANNED_UNIVERSAL_TOOL',
        humanMessage: `The tool "${toolName}" is a banned universal tool. Agents must only use explicit domain-scoped tools.`,
      };
    }

    // 2. Validate agent role permissions against tool
    if (allowedTools && Array.isArray(allowedTools)) {
      if (!allowedTools.includes(toolName) && !allowedTools.includes('*')) {
        return {
          allowed: false,
          policyId: 'tool-use-policy',
          reasonCode: 'TOOL_NOT_PERMITTED_FOR_ROLE',
          humanMessage: `Role "${agentRole}" does not have permission to execute tool "${toolName}".`,
          details: { requestedTool: toolName, agentRole },
        };
      }
    }

    return {
      allowed: true,
      policyId: 'tool-use-policy',
      reasonCode: 'TOOL_USE_POLICY_COMPLIANT',
    };
  },

  getPromptSnippet(): string {
    return `[POLICY: TOOL_USE_POLICY v${TOOL_USE_POLICY_VERSION}]
- EXPLICIT DOMAIN TOOLS ONLY: Call only predefined domain tools in your allowed toolset.
- NO UNIVERSAL WRITES: There is no raw SQL or universal database-write tool. Changes are applied via structured domain actions.
- SERVER-SIDE AUTHORIZATION: The server verifies your role, skill, and resource ownership before executing any tool. Unauthorized requests are blocked.`;
  },
};
