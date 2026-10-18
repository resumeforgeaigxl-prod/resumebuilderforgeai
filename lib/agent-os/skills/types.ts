/**
 * ResumeForge — Skill System Types (Level 12.5)
 */

import type { AgentRoleType } from '../roles/types';
import type { PolicyId, HandoffRequest } from '../policies/types';

export type SkillId =
  | 'verify-job'
  | 'analyze-job'
  | 'match-candidate'
  | 'tailor-resume'
  | 'prepare-application'
  | 'resolve-application-answer'
  | 'prepare-interview'
  | 'run-coding-practice'
  | 'create-learning-plan'
  | 'generate-project'
  | 'analyze-salary-offer'
  | 'apply-to-job';

export type CostClass = 'FREE' | 'LOW' | 'MEDIUM' | 'HIGH';

export interface SkillResult<T = any> {
  status: 'SUCCESS' | 'STOPPED' | 'FAILED' | 'HANDOFF_REQUIRED';
  output: T;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  evidence: Record<string, any>;
  nextAction?: string;
  handoffRequired?: HandoffRequest;
  policyFlags: string[];
  cost?: {
    creditsUsed: number;
    costClass: CostClass;
  };
}

export interface SkillExecutionContext {
  userId: string;
  agentRole: AgentRoleType;
  traceId?: string;
  [key: string]: any;
}

export type SkillOutputType =
  | 'status'
  | 'job_match'
  | 'resume'
  | 'application'
  | 'interview'
  | 'coding'
  | 'learning_plan'
  | 'project'
  | 'salary'
  | 'table'
  | 'text';

export interface SkillDefinition {
  skillId: SkillId;
  version: string;
  purpose: string;
  outputType?: SkillOutputType;
  allowedAgents: AgentRoleType[];
  allowedTools: string[];
  requiredInputs: string[];
  preconditions: string[];
  procedure: string[];
  stopConditions: string[];
  successConditions: string[];
  failureConditions: string[];
  applicablePolicies: PolicyId[];
  estimatedCostClass: CostClass;
  billableAction?: string;
  execute: (inputs: Record<string, any>, ctx: SkillExecutionContext) => Promise<SkillResult>;
}

