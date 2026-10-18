/**
 * ResumeForge — Domain Policy Types (Level 12.5)
 */

export type PolicyId =
  | 'resume-policy'
  | 'job-policy'
  | 'matching-policy'
  | 'application-policy'
  | 'sensitive-answer-policy'
  | 'credit-policy'
  | 'browser-policy'
  | 'human-handoff-policy'
  | 'memory-policy'
  | 'model-routing-policy'
  | 'tool-use-policy';

export interface HandoffRequest {
  reason: string;
  question: string;
  requiredAction: string;
  resumableState: Record<string, any>;
  expiresAt?: string;
}

export interface PolicyDecision {
  allowed: boolean;
  policyId: PolicyId;
  reasonCode: string;
  humanMessage?: string;
  requiredHandoff?: HandoffRequest;
  details?: Record<string, any>;
}

export interface PolicyEvaluationContext {
  action: string;
  agentRole: string;
  userId: string;
  jobId?: string;
  resumeId?: string;
  packageId?: string;
  data?: any;
  job?: any;
  profile?: any;
  package?: any;
  wallet?: any;
  proposedChanges?: any;
  [key: string]: any;
}

export interface DomainPolicy {
  id: PolicyId;
  name: string;
  version: string;
  description: string;
  evaluate: (ctx: PolicyEvaluationContext) => Promise<PolicyDecision>;
  getPromptSnippet: () => string;
}
