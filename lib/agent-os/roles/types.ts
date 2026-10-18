/**
 * ResumeForge — Agent Role Definitions & Permissions (Level 12.5)
 */

import type { ToolCategory } from '../policies/tool-use-policy';
import type { PolicyId } from '../policies/types';

export type AgentRoleType =
  | 'omni'
  | 'job_agent'
  | 'resume_agent'
  | 'application_prep_agent'
  | 'browser_agent';

export interface AgentRoleDefinition {
  role: AgentRoleType;
  title: string;
  description: string;
  allowedSkills: string[];
  allowedTools: string[];
  allowedCategories: ToolCategory[];
  deniedActions: string[];
  applicablePolicies: PolicyId[];
  systemRolePrompt: string;
}
