/**
 * ResumeForge — Server-Side Tool Authorizer (Level 12.5)
 * Version: 1.0.0
 *
 * Enforces role-based access control and safety constraints on every tool call.
 * The model is never the authorization layer; server code is authoritative.
 */

import { TOOL_CONTRACTS } from './contracts';
import { AgentRoleRegistry } from '../roles/registry';
import { BANNED_UNIVERSAL_TOOLS } from '../policies/tool-use-policy';
import type { AgentRoleType } from '../roles/types';

export interface ToolAuthorizationResult {
  authorized: boolean;
  reasonCode?: string;
  errorMessage?: string;
}

export class ToolAuthorizer {
  /**
   * Authorizes a tool call server-side before execution.
   */
  static authorize(
    toolName: string,
    role: AgentRoleType,
    userId: string,
    args?: Record<string, any>
  ): ToolAuthorizationResult {
    // 1. Guard against banned universal tools
    if (BANNED_UNIVERSAL_TOOLS.some((b) => b.toLowerCase() === toolName.toLowerCase())) {
      return {
        authorized: false,
        reasonCode: 'BANNED_UNIVERSAL_TOOL',
        errorMessage: `Execution of universal or raw tool "${toolName}" is strictly banned by policy.`,
      };
    }

    // 2. Guard against raw unconstrained browser or shell commands
    if (
      toolName === 'raw_playwright' ||
      toolName === 'raw_browser' ||
      toolName === 'browser_eval' ||
      toolName === 'execute_script'
    ) {
      return {
        authorized: false,
        reasonCode: 'RAW_BROWSER_CONTROL_PROHIBITED',
        errorMessage: 'Raw unconstrained browser automation is strictly prohibited. Use managed application agent skills.',
      };
    }

    // 3. Verify tool exists in canonical contract registry
    const contract = TOOL_CONTRACTS[toolName];
    if (!contract) {
      return {
        authorized: false,
        reasonCode: 'UNKNOWN_TOOL',
        errorMessage: `Tool "${toolName}" is not registered in canonical tool contracts.`,
      };
    }

    // 4. Role-based permission check
    const isPermittedForRole = AgentRoleRegistry.isToolPermitted(role, toolName);
    if (!isPermittedForRole) {
      return {
        authorized: false,
        reasonCode: 'ROLE_PERMISSION_DENIED',
        errorMessage: `Agent role "${role}" does not have permission to execute tool "${toolName}".`,
      };
    }

    // 5. User context check for internal write or billable operations
    if (contract.category === 'BILLABLE' || contract.category === 'WRITE_INTERNAL' || contract.category === 'SENSITIVE') {
      if (!userId || userId.trim() === '') {
        return {
          authorized: false,
          reasonCode: 'AUTHENTICATION_REQUIRED',
          errorMessage: `Tool "${toolName}" requires an authenticated candidate user context.`,
        };
      }
    }

    return {
      authorized: true,
    };
  }
}
