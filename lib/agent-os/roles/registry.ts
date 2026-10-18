/**
 * ResumeForge — Agent Role Registry (Level 12.5)
 * Version: 1.0.0
 *
 * Defines logical roles, permitted skills, allowed tool boundaries, and policies.
 * Server code enforces these boundaries before executing tools.
 */

import type { AgentRoleType, AgentRoleDefinition } from './types';

export const AGENT_REGISTRY: Record<AgentRoleType, AgentRoleDefinition> = {
  // ── 1. OMNI ORCHESTRATOR ──────────────────────────────────────────────
  omni: {
    role: 'omni',
    title: 'Omni Orchestrator',
    description: 'Central orchestrator connecting candidate intent to specialized skills and agents.',
    allowedSkills: [
      'verify-job',
      'analyze-job',
      'match-candidate',
      'tailor-resume',
      'prepare-application',
      'resolve-application-answer',
      'prepare-interview',
      'run-coding-practice',
      'create-learning-plan',
      'generate-project',
      'analyze-salary-offer',
    ],
    allowedTools: ['*'], // Omni delegates through skills; permitted to orchestrate
    allowedCategories: ['READ', 'WRITE_INTERNAL', 'BILLABLE', 'SENSITIVE'],
    deniedActions: [
      'BYPASS_SPECIALIST_POLICIES',
      'RAW_BROWSER_SUBMISSION',
      'UNIVERSAL_DB_WRITE',
      'FABRICATE_CANDIDATE_FACTS',
    ],
    applicablePolicies: [
      'resume-policy',
      'job-policy',
      'matching-policy',
      'application-policy',
      'sensitive-answer-policy',
      'credit-policy',
      'browser-policy',
      'human-handoff-policy',
      'memory-policy',
      'model-routing-policy',
      'tool-use-policy',
    ],
    systemRolePrompt: `You are Omni, the central orchestrator of ResumeForge.
You understand candidate intent, select appropriate skills, delegate to specialized domain logic, and synthesize results.
You cannot bypass specialist policies or submit unverified applications directly.`,
  },

  // ── 2. JOB AGENT ──────────────────────────────────────────────────────
  job_agent: {
    role: 'job_agent',
    title: 'Job Market & Discovery Agent',
    description: 'Discovers, canonicalizes, verifies freshness, and ranks canonical jobs.',
    allowedSkills: ['verify-job', 'analyze-job', 'match-candidate'],
    allowedTools: [
      'search_job_market',
      'get_canonical_job',
      'verify_job_freshness',
      'find_job_replacements',
      'check_application_eligibility',
      'match_candidate_job',
      'rank_candidate_jobs',
    ],
    allowedCategories: ['READ'],
    deniedActions: [
      'MODIFY_CANDIDATE_TRUTH',
      'SUBMIT_APPLICATION',
      'ALTER_BILLING',
      'MODIFY_RESUME_DIRECTLY',
    ],
    applicablePolicies: ['job-policy', 'matching-policy', 'tool-use-policy'],
    systemRolePrompt: `You are the Job Discovery & Freshness Specialist.
You inspect canonical job postings, evaluate Level 8 freshness, and assess eligibility.
You never modify candidate profile records or submit applications.`,
  },

  // ── 3. RESUME AGENT ───────────────────────────────────────────────────
  resume_agent: {
    role: 'resume_agent',
    title: 'Resume & ATS Specialist',
    description: 'Audits ATS compliance and tailors resumes truthfully for specific canonical jobs.',
    allowedSkills: ['tailor-resume'],
    allowedTools: [
      'list_resumes',
      'get_resume_details',
      'audit_resume_ats',
      'tailor_resume_for_job',
      'trigger_resume_generation',
      'get_candidate_profile',
    ],
    allowedCategories: ['READ', 'WRITE_INTERNAL', 'BILLABLE'],
    deniedActions: [
      'SUBMIT_APPLICATIONS',
      'CHANGE_WORK_AUTHORIZATION',
      'CHANGE_LEGAL_ANSWERS',
      'FABRICATE_CANDIDATE_FACTS',
    ],
    applicablePolicies: ['resume-policy', 'credit-policy', 'memory-policy', 'tool-use-policy'],
    systemRolePrompt: `You are the Resume & ATS Intelligence Specialist.
You rephrase and emphasize genuine candidate achievements for ATS optimization.
You are strictly forbidden from inventing skills, metrics, certifications, or employment periods.`,
  },

  // ── 4. APPLICATION PREPARATION AGENT ──────────────────────────────────
  application_prep_agent: {
    role: 'application_prep_agent',
    title: 'Application Preparation Specialist',
    description: 'Prepares structured application packages, verified answers, and required documents.',
    allowedSkills: ['prepare-application', 'resolve-application-answer'],
    allowedTools: [
      'prepare_job_application_package',
      'answer_application_questions',
      'get_candidate_profile',
      'get_canonical_job',
      'verify_job_freshness',
      'match_candidate_job',
      'update_candidate_application_answer',
    ],
    allowedCategories: ['READ', 'WRITE_INTERNAL', 'BILLABLE', 'SENSITIVE'],
    deniedActions: [
      'SUBMIT_EMPLOYER_APPLICATION',
      'OPERATE_EXTERNAL_BROWSER',
      'GUESS_UNKNOWN_SENSITIVE_ANSWERS',
    ],
    applicablePolicies: [
      'application-policy',
      'sensitive-answer-policy',
      'credit-policy',
      'job-policy',
      'human-handoff-policy',
      'tool-use-policy',
    ],
    systemRolePrompt: `You are the Application Preparation Specialist.
You compile complete, auditable application packages before any browser execution.
You never guess sensitive legal or demographic answers and never submit applications to employer ATS.`,
  },

  // ── 5. BROWSER APPLICATION AGENT (LEVEL 13: APPROVAL MODE) ────────────
  browser_agent: {
    role: 'browser_agent',
    title: 'Browser Application Agent',
    description: 'Executes browser-assisted job application form filling and submission in Approval Mode on supported employer ATS.',
    allowedSkills: ['apply-to-job'],
    allowedTools: ['start_browser_application', 'approve_and_submit_application'],
    allowedCategories: ['READ', 'EXTERNAL_ACTION', 'BILLABLE', 'WRITE_INTERNAL'],
    deniedActions: [
      'CHANGE_CANDIDATE_PROFILE',
      'CHANGE_RESUME_TRUTH',
      'CHANGE_MATCH_SCORE',
      'GENERATE_NEW_CANDIDATE_FACTS',
      'SPEND_OUTSIDE_RESERVATION',
      'OPERATE_UNRELATED_WEBSITES',
      'SUBMIT_WITHOUT_APPROVAL',
      'EXECUTE_AUTOPILOT',
    ],
    applicablePolicies: [
      'browser-policy',
      'human-handoff-policy',
      'credit-policy',
      'application-policy',
      'tool-use-policy',
    ],
    systemRolePrompt: `You are the Browser Application Agent.
You inspect employer career applications, map verified candidate facts, upload approved resumes, and validate forms.
You operate strictly in APPROVAL MODE: you never submit applications until the user gives explicit approval.`,
  },
};

export class AgentRoleRegistry {
  static getRole(role: AgentRoleType): AgentRoleDefinition {
    const def = AGENT_REGISTRY[role];
    if (!def) {
      throw new Error(`Unknown agent role: ${role}`);
    }
    return def;
  }

  static isActionPermitted(role: AgentRoleType, action: string): boolean {
    const def = this.getRole(role);
    if (def.deniedActions.includes(action)) {
      return false;
    }
    return true;
  }

  static isToolPermitted(role: AgentRoleType, toolName: string): boolean {
    const def = this.getRole(role);
    if (def.allowedTools.includes('*')) return true;
    return def.allowedTools.includes(toolName);
  }

  static getApplicablePolicies(role: AgentRoleType) {
    return this.getRole(role).applicablePolicies;
  }
}
