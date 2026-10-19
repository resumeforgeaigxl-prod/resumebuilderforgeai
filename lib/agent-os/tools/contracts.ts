/**
 * ResumeForge — Canonical Tool Contracts (Level 12.5)
 * Version: 1.0.0
 *
 * Defines explicit permissions, categories, idempotency, side effects,
 * and billing actions for all tools exposed to agents.
 */

import type { ToolCategory } from '../policies/tool-use-policy';

export interface ToolContract {
  name: string;
  purpose: string;
  category: ToolCategory;
  sideEffects: boolean;
  idempotency: 'IDEMPOTENT' | 'NON_IDEMPOTENT' | 'READ_ONLY';
  requiredPermissions: string[];
  billableAction?: string;
}

export const TOOL_CONTRACTS: Record<string, ToolContract> = {
  // ── RESUME TOOLS ──
  list_resumes: {
    name: 'list_resumes',
    purpose: 'List user resumes with metadata and scores.',
    category: 'READ',
    sideEffects: false,
    idempotency: 'READ_ONLY',
    requiredPermissions: ['resume:read'],
  },
  get_resume_details: {
    name: 'get_resume_details',
    purpose: 'Retrieve full content and sections for a specific resume.',
    category: 'READ',
    sideEffects: false,
    idempotency: 'READ_ONLY',
    requiredPermissions: ['resume:read'],
  },
  audit_resume_ats: {
    name: 'audit_resume_ats',
    purpose: 'Audit resume for ATS readability and keyword strength.',
    category: 'BILLABLE',
    sideEffects: false,
    idempotency: 'IDEMPOTENT',
    requiredPermissions: ['resume:audit'],
    billableAction: 'ATS_ANALYSIS',
  },
  tailor_resume_for_job: {
    name: 'tailor_resume_for_job',
    purpose: 'Truthfully tailor resume for a target canonical job.',
    category: 'BILLABLE',
    sideEffects: true,
    idempotency: 'IDEMPOTENT', // Reuses existing tailored resume at 0 credits
    requiredPermissions: ['resume:tailor'],
    billableAction: 'RESUME_TAILOR_FOR_JOB',
  },
  trigger_resume_generation: {
    name: 'trigger_resume_generation',
    purpose: 'Generate an initial professional resume template from career profile.',
    category: 'WRITE_INTERNAL',
    sideEffects: true,
    idempotency: 'NON_IDEMPOTENT',
    requiredPermissions: ['resume:write'],
  },

  // ── JOB TOOLS ──
  get_job_database_counts: {
    name: 'get_job_database_counts',
    purpose: 'Read exact stored and active job counts.',
    category: 'READ',
    sideEffects: false,
    idempotency: 'READ_ONLY',
    requiredPermissions: ['jobs:read'],
  },
  search_job_market: {
    name: 'search_job_market',
    purpose: 'Search canonical active job vacancies across all ingested sources.',
    category: 'READ',
    sideEffects: false,
    idempotency: 'READ_ONLY',
    requiredPermissions: ['jobs:read'],
  },
  get_canonical_job: {
    name: 'get_canonical_job',
    purpose: 'Retrieve canonical job record by ID.',
    category: 'READ',
    sideEffects: false,
    idempotency: 'READ_ONLY',
    requiredPermissions: ['jobs:read'],
  },
  verify_job_freshness: {
    name: 'verify_job_freshness',
    purpose: 'Run Level 8 freshness verification on job posting.',
    category: 'READ',
    sideEffects: true,
    idempotency: 'IDEMPOTENT',
    requiredPermissions: ['jobs:verify'],
  },
  find_job_replacements: {
    name: 'find_job_replacements',
    purpose: 'Find active similar replacement jobs for a closed posting.',
    category: 'READ',
    sideEffects: false,
    idempotency: 'READ_ONLY',
    requiredPermissions: ['jobs:read'],
  },
  check_application_eligibility: {
    name: 'check_application_eligibility',
    purpose: 'Check if candidate profile meets baseline prerequisites for role.',
    category: 'READ',
    sideEffects: false,
    idempotency: 'READ_ONLY',
    requiredPermissions: ['matching:read'],
  },
  match_candidate_job: {
    name: 'match_candidate_job',
    purpose: 'Run Level 10 Candidate ↔ Job matching engine.',
    category: 'BILLABLE',
    sideEffects: false,
    idempotency: 'IDEMPOTENT',
    requiredPermissions: ['matching:read'],
    billableAction: 'JOB_MATCH_DEEP',
  },
  rank_candidate_jobs: {
    name: 'rank_candidate_jobs',
    purpose: 'Rank multiple candidate jobs by match fit.',
    category: 'READ',
    sideEffects: false,
    idempotency: 'READ_ONLY',
    requiredPermissions: ['matching:read'],
  },

  // ── APPLICATION PREPARATION TOOLS ──
  prepare_job_application_package: {
    name: 'prepare_job_application_package',
    purpose: 'Run Level 12 Application Preparation Engine.',
    category: 'BILLABLE',
    sideEffects: true,
    idempotency: 'IDEMPOTENT',
    requiredPermissions: ['applications:prepare'],
    billableAction: 'APPLICATION_PREPARE',
  },
  answer_application_questions: {
    name: 'answer_application_questions',
    purpose: 'Submit candidate answers to missing application package questions.',
    category: 'WRITE_INTERNAL',
    sideEffects: true,
    idempotency: 'IDEMPOTENT',
    requiredPermissions: ['applications:answer'],
  },
  start_browser_application: {
    name: 'start_browser_application',
    purpose: 'Inspect employer form, fill verified fields, upload approved resume, and halt for approval.',
    category: 'WRITE_INTERNAL',
    sideEffects: true,
    idempotency: 'IDEMPOTENT',
    requiredPermissions: ['browser:execute'],
  },
  approve_and_submit_application: {
    name: 'approve_and_submit_application',
    purpose: 'Submit an application to an employer ATS after explicit user approval.',
    category: 'BILLABLE',
    sideEffects: true,
    idempotency: 'NON_IDEMPOTENT',
    requiredPermissions: ['browser:submit'],
    billableAction: 'APPLICATION_SUBMIT',
  },

  // ── CANDIDATE PROFILE TOOLS ──
  get_candidate_profile: {
    name: 'get_candidate_profile',
    purpose: 'Fetch candidate identity, career history, and application answers.',
    category: 'READ',
    sideEffects: false,
    idempotency: 'READ_ONLY',
    requiredPermissions: ['profile:read'],
  },
  update_candidate_application_answer: {
    name: 'update_candidate_application_answer',
    purpose: 'Save explicit candidate answer to the global profile answer bank.',
    category: 'SENSITIVE',
    sideEffects: true,
    idempotency: 'IDEMPOTENT',
    requiredPermissions: ['profile:write'],
  },

  // ── INTERVIEW TOOLS ──
  trigger_mock_interview: {
    name: 'trigger_mock_interview',
    purpose: 'Start an AI mock interview session.',
    category: 'BILLABLE',
    sideEffects: true,
    idempotency: 'NON_IDEMPOTENT',
    requiredPermissions: ['interview:run'],
    billableAction: 'MOCK_INTERVIEW',
  },
  evaluate_interview_answer: {
    name: 'evaluate_interview_answer',
    purpose: 'Grade candidate answer against STAR rubric.',
    category: 'BILLABLE',
    sideEffects: true,
    idempotency: 'NON_IDEMPOTENT',
    requiredPermissions: ['interview:evaluate'],
    billableAction: 'MOCK_INTERVIEW_EVALUATION',
  },

  // ── CODING TOOLS ──
  run_code_sandbox: {
    name: 'run_code_sandbox',
    purpose: 'Execute code in secure sandbox.',
    category: 'WRITE_INTERNAL',
    sideEffects: false,
    idempotency: 'NON_IDEMPOTENT',
    requiredPermissions: ['coding:execute'],
  },
  trigger_coding_challenge: {
    name: 'trigger_coding_challenge',
    purpose: 'Generate an interactive DSA coding problem.',
    category: 'READ',
    sideEffects: false,
    idempotency: 'NON_IDEMPOTENT',
    requiredPermissions: ['coding:read'],
  },

  // ── LEARNING & PROJECT TOOLS ──
  trigger_study_plan: {
    name: 'trigger_study_plan',
    purpose: 'Generate structured learning curriculum.',
    category: 'BILLABLE',
    sideEffects: true,
    idempotency: 'NON_IDEMPOTENT',
    requiredPermissions: ['learning:write'],
    billableAction: 'LEARNING_PLAN',
  },
  generate_project_blueprint: {
    name: 'generate_project_blueprint',
    purpose: 'Architect production portfolio project with code starter.',
    category: 'BILLABLE',
    sideEffects: true,
    idempotency: 'NON_IDEMPOTENT',
    requiredPermissions: ['projects:write'],
    billableAction: 'PROJECT_BLUEPRINT',
  },
  negotiate_salary_offer: {
    name: 'negotiate_salary_offer',
    purpose: 'Generate executive salary benchmark and counter-offer script.',
    category: 'BILLABLE',
    sideEffects: false,
    idempotency: 'IDEMPOTENT',
    requiredPermissions: ['salary:read'],
    billableAction: 'SALARY_ANALYSIS',
  },
};
