/**
 * ResumeForge — Canonical Skills Registry (Level 12.5)
 * Version: 1.0.0
 *
 * Wraps existing ResumeForge engines into modular, auditable skills.
 * Never duplicates capability engines; provides formal input/precondition/policy bounds.
 */

import type { SkillId, SkillDefinition, SkillResult, SkillExecutionContext } from './types';
import { verifyJobFreshness, getCanonicalJobById, matchCandidateToJob } from '@/lib/capabilities/jobs';
import { getCandidateApplicationProfile, upsertApplicationAnswer } from '@/lib/capabilities/profile';
import { ApplicationPreparationEngine } from '@/lib/application-engine';
import { resolveQuestionKey, isSensitiveField } from '@/lib/application-engine/question-library';
import { selectOrTailorResume } from '@/lib/application-engine/tailor-selection';
import { triggerMockInterview, evaluateInterviewAnswer } from '@/lib/capabilities/interview';
import { runCodeSandbox, triggerCodingChallenge } from '@/lib/capabilities/coding';
import { createLearningPlan } from '@/lib/capabilities/learning';
import { generateProjectBlueprint } from '@/lib/capabilities/projects';
import { negotiateSalaryOffer } from '@/lib/capabilities/salary';
import { PolicyEngine } from '../policies/policy-engine';

export const SKILLS_REGISTRY: Record<SkillId, SkillDefinition> = {
  // ── 1. VERIFY JOB ────────────────────────────────────────────────────────
  'verify-job': {
    skillId: 'verify-job',
    version: '1.0.0',
    outputType: 'status',
    purpose: 'Verifies canonical job freshness state (ACTIVE, UNKNOWN, CLOSED) via Level 8 engine.',
    allowedAgents: ['omni', 'job_agent'],
    allowedTools: ['verify_job_freshness', 'get_canonical_job'],
    requiredInputs: ['jobId'],
    preconditions: ['Canonical job exists in database'],
    procedure: [
      'Load canonical job record by ID',
      'Evaluate freshness timestamp',
      'If stale or UNKNOWN, invoke Level 8 freshness verification',
      'Return active status and evidence',
    ],
    stopConditions: ['Job ID missing', 'Job record not found'],
    successConditions: ['Status determined with high confidence'],
    failureConditions: ['Database error', 'Verification timeout'],
    applicablePolicies: ['job-policy', 'tool-use-policy'],
    estimatedCostClass: 'FREE',
    execute: async (inputs, ctx) => {
      const { jobId } = inputs;
      if (!jobId) {
        return {
          status: 'STOPPED',
          output: null,
          confidence: 'LOW',
          evidence: {},
          policyFlags: ['MISSING_REQUIRED_INPUT'],
        };
      }

      const res = await verifyJobFreshness(jobId);
      return {
        status: res.status === 'CLOSED' ? 'STOPPED' : 'SUCCESS',
        output: res,
        confidence: res.confidence >= 0.8 ? 'HIGH' : 'MEDIUM',
        evidence: { verifiedAt: res.verifiedAt, status: res.status, closureReason: res.closureReason },
        policyFlags: res.status === 'CLOSED' ? ['JOB_CLOSED'] : [],
      };
    },
  },

  // ── 2. ANALYZE JOB ───────────────────────────────────────────────────────
  'analyze-job': {
    skillId: 'analyze-job',
    version: '1.0.0',
    outputType: 'table',
    purpose: 'Inspects canonical job description, extracted skills, requirements, and compensation.',
    allowedAgents: ['omni', 'job_agent'],
    allowedTools: ['get_canonical_job'],
    requiredInputs: ['jobId'],
    preconditions: ['Canonical job ID exists'],
    procedure: [
      'Fetch canonical job record',
      'Extract normalized skills and requirements',
      'Format overview for agent reasoning',
    ],
    stopConditions: ['Job ID missing'],
    successConditions: ['Canonical job found and parsed'],
    failureConditions: ['Job not found'],
    applicablePolicies: ['job-policy'],
    estimatedCostClass: 'FREE',
    execute: async (inputs, ctx) => {
      const job = await getCanonicalJobById(inputs.jobId);
      if (!job) {
        return {
          status: 'FAILED',
          output: null,
          confidence: 'LOW',
          evidence: {},
          policyFlags: ['JOB_NOT_FOUND'],
        };
      }
      return {
        status: 'SUCCESS',
        output: job,
        confidence: 'HIGH',
        evidence: { id: job.id, company: job.company, title: job.title, skills: job.skills },
        policyFlags: [],
      };
    },
  },

  // ── 3. MATCH CANDIDATE ───────────────────────────────────────────────────
  'match-candidate': {
    skillId: 'match-candidate',
    version: '1.0.0',
    outputType: 'job_match',
    purpose: 'Evaluates candidate fit against target job using Level 10 matching engine.',
    allowedAgents: ['omni', 'job_agent'],
    allowedTools: ['match_candidate_job'],
    requiredInputs: ['userId', 'jobId'],
    preconditions: ['User profile exists', 'Canonical job is ACTIVE'],
    procedure: [
      'Invoke Level 10 matching engine',
      'Check deterministic blockers first',
      'Calculate score, category, confidence, and strengths',
      'Return match report',
    ],
    stopConditions: ['Job closed', 'User profile empty'],
    successConditions: ['Match output generated with blockers and confidence'],
    failureConditions: ['Matching engine execution failure'],
    applicablePolicies: ['matching-policy', 'job-policy', 'sensitive-answer-policy'],
    estimatedCostClass: 'LOW',
    billableAction: 'JOB_MATCH_DEEP',
    execute: async (inputs, ctx) => {
      const { jobId } = inputs;
      const userId = inputs.userId || ctx.userId;

      const matchRes = await matchCandidateToJob({ userId, jobId });
      return {
        status: matchRes.blockers && matchRes.blockers.length > 0 ? 'STOPPED' : 'SUCCESS',
        output: matchRes,
        confidence: matchRes.confidence || 'HIGH',
        evidence: {
          score: matchRes.score,
          category: matchRes.category,
          blockersCount: matchRes.blockers?.length || 0,
        },
        policyFlags: matchRes.blockers?.length > 0 ? ['HARD_BLOCKERS_PRESENT'] : [],
      };
    },
  },

  // ── 4. TAILOR RESUME ─────────────────────────────────────────────────────
  'tailor-resume': {
    skillId: 'tailor-resume',
    version: '1.0.0',
    outputType: 'resume',
    purpose: 'Truthfully customizes candidate resume for target job without hallucinating skills.',
    allowedAgents: ['omni', 'resume_agent'],
    allowedTools: ['tailor_resume_for_job'],
    requiredInputs: ['userId', 'jobId'],
    preconditions: ['Job is ACTIVE', 'Candidate master resume exists', 'Credit budget reserved'],
    procedure: [
      'Load canonical resume and target job',
      'Identify UNDERREPRESENTED candidate skills',
      'Check for existing tailored resume (reuses at 0 credits)',
      'Perform truthful tailoring and record evidence',
    ],
    stopConditions: ['Job closed', 'Candidate has hard blocker', 'Insufficient credits'],
    successConditions: ['Tailored resume created and saved without fabricated skills'],
    failureConditions: ['Credit reservation failed', 'Tailoring model error'],
    applicablePolicies: ['resume-policy', 'credit-policy', 'job-policy', 'memory-policy'],
    estimatedCostClass: 'HIGH',
    billableAction: 'RESUME_TAILOR_FOR_JOB',
    execute: async (inputs, ctx) => {
      const userId = inputs.userId || ctx.userId;
      const job = await getCanonicalJobById(inputs.jobId);
      if (!job) {
        return {
          status: 'FAILED',
          output: null,
          confidence: 'LOW',
          evidence: {},
          policyFlags: ['JOB_NOT_FOUND'],
        };
      }

      if (job.status === 'CLOSED') {
        return {
          status: 'STOPPED',
          output: null,
          confidence: 'HIGH',
          evidence: { closureReason: job.closure_reason },
          policyFlags: ['JOB_CLOSED'],
        };
      }

      const profile = await getCandidateApplicationProfile(userId);
      const matchRes = await matchCandidateToJob({ userId, jobId: job.id });

      const tailorRes = await selectOrTailorResume({
        userId,
        job,
        profile,
        matchResult: matchRes,
        forceFreshTailor: inputs.forceFresh || false,
      });

      return {
        status: 'SUCCESS',
        output: tailorRes,
        confidence: 'HIGH',
        evidence: {
          resumeId: tailorRes.resumeId,
          isTailored: tailorRes.isTailored,
          creditsCharged: tailorRes.creditsCharged,
        },
        policyFlags: [],
        cost: {
          creditsUsed: tailorRes.creditsCharged,
          costClass: tailorRes.creditsCharged > 0 ? 'HIGH' : 'FREE',
        },
      };
    },
  },

  // ── 5. PREPARE APPLICATION ───────────────────────────────────────────────
  'prepare-application': {
    skillId: 'prepare-application',
    version: '1.0.0',
    outputType: 'application',
    purpose: 'Coordinates complete application package preparation via Level 12 engine.',
    allowedAgents: ['omni', 'application_prep_agent'],
    allowedTools: ['prepare_job_application_package'],
    requiredInputs: ['userId', 'jobId'],
    preconditions: ['Job is ACTIVE', 'User profile exists', 'Credits available'],
    procedure: [
      'Verify job freshness',
      'Verify Level 10 match and hard blockers',
      'Reserve Level 11 credits',
      'Select or tailor resume',
      'Map verified vs unknown questions',
      'Classify package as READY, NEEDS_USER, or BLOCKED',
    ],
    stopConditions: ['Job is CLOSED', 'Hard blocker exists', 'Insufficient credits'],
    successConditions: ['Package prepared with versioned audit trail'],
    failureConditions: ['Credit reservation failed', 'Preparation engine exception'],
    applicablePolicies: [
      'application-policy',
      'sensitive-answer-policy',
      'credit-policy',
      'job-policy',
      'human-handoff-policy',
    ],
    estimatedCostClass: 'HIGH',
    billableAction: 'APPLICATION_PREPARE',
    execute: async (inputs, ctx) => {
      const userId = inputs.userId || ctx.userId;
      const pkg = await ApplicationPreparationEngine.preparePackage({
        userId,
        jobId: inputs.jobId,
        forceFresh: inputs.forceFresh || false,
        userOverride: inputs.userOverride || false,
      });

      const isHandoff = pkg.status === 'NEEDS_USER';
      const isStopped = pkg.status === 'BLOCKED';

      return {
        status: isHandoff ? 'HANDOFF_REQUIRED' : isStopped ? 'STOPPED' : 'SUCCESS',
        output: pkg,
        confidence: 'HIGH',
        evidence: {
          packageId: pkg.id,
          status: pkg.status,
          readinessScore: pkg.readinessScore,
          unknownQuestionsCount: pkg.unknownQuestions?.length || 0,
        },
        handoffRequired: isHandoff
          ? {
              reason: 'Mandatory application questions require candidate confirmation.',
              question: 'Please answer the missing questions to finalize preparation.',
              requiredAction: 'ANSWER_APPLICATION_QUESTIONS',
              resumableState: { packageId: pkg.id },
            }
          : undefined,
        policyFlags: isStopped ? ['PREPARATION_BLOCKED'] : isHandoff ? ['NEEDS_USER'] : [],
        cost: {
          creditsUsed: (pkg.creditOperation?.preparedCharged || 0) + (pkg.creditOperation?.tailorCharged || 0),
          costClass: 'HIGH',
        },
      };
    },
  },

  // ── 6. RESOLVE APPLICATION ANSWER ────────────────────────────────────────
  'resolve-application-answer': {
    skillId: 'resolve-application-answer',
    version: '1.0.0',
    outputType: 'status',
    purpose: 'Maps and verifies answers to application questions while protecting sensitive fields.',
    allowedAgents: ['omni', 'application_prep_agent'],
    allowedTools: ['answer_application_questions', 'update_candidate_application_answer'],
    requiredInputs: ['question', 'userId'],
    preconditions: ['User profile available'],
    procedure: [
      'Resolve question key using synonym library',
      'Check if question is sensitive',
      'If sensitive and not from user, flag NEEDS_USER',
      'If user provides answer, update package and global answer bank',
    ],
    stopConditions: ['Sensitive field without user confirmation'],
    successConditions: ['Answer mapped and verified'],
    failureConditions: ['Invalid key or format'],
    applicablePolicies: ['sensitive-answer-policy', 'memory-policy'],
    estimatedCostClass: 'FREE',
    execute: async (inputs, ctx) => {
      const userId = inputs.userId || ctx.userId;
      const key = resolveQuestionKey(inputs.question) || 'unknown_question';
      const isSensitive = isSensitiveField(key);

      if (isSensitive && !inputs.userConfirmed) {
        return {
          status: 'HANDOFF_REQUIRED',
          output: { key, sensitive: true, status: 'NEEDS_USER' },
          confidence: 'HIGH',
          evidence: { key, isSensitive: true },
          handoffRequired: {
            reason: `Field "${key}" is protected. Cannot guess or infer without user confirmation.`,
            question: inputs.question,
            requiredAction: 'CONFIRM_SENSITIVE_ANSWER',
            resumableState: { key },
          },
          policyFlags: ['SENSITIVE_FIELD_PROTECTED'],
        };
      }

      if (inputs.value !== undefined) {
        await upsertApplicationAnswer(userId, key, inputs.value, {
          status: 'VERIFIED',
          verified: true,
          source: 'user',
        });
      }

      return {
        status: 'SUCCESS',
        output: { key, value: inputs.value, verified: true },
        confidence: 'HIGH',
        evidence: { key },
        policyFlags: [],
      };
    },
  },

  // ── 7. PREPARE INTERVIEW ─────────────────────────────────────────────────
  'prepare-interview': {
    skillId: 'prepare-interview',
    version: '1.0.0',
    outputType: 'interview',
    purpose: 'Simulates mock interviews and evaluates responses against STAR criteria.',
    allowedAgents: ['omni'],
    allowedTools: ['trigger_mock_interview', 'evaluate_interview_answer'],
    requiredInputs: ['role'],
    preconditions: ['Target role specified'],
    procedure: [
      'Generate role-specific behavioral or technical interview questions',
      'Or grade candidate response using STAR rubric',
    ],
    stopConditions: ['Role missing'],
    successConditions: ['Interview session or score generated'],
    failureConditions: ['Engine error'],
    applicablePolicies: ['credit-policy', 'tool-use-policy'],
    estimatedCostClass: 'MEDIUM',
    billableAction: 'INTERVIEW_PREP',
    execute: async (inputs, ctx) => {
      const userId = inputs.userId || ctx.userId;
      if (inputs.userAnswer && inputs.question) {
        const evalRes = await evaluateInterviewAnswer(
          { role: inputs.role, question: inputs.question, userAnswer: inputs.userAnswer },
          userId
        );
        return {
          status: 'SUCCESS',
          output: evalRes,
          confidence: 'HIGH',
          evidence: { score: evalRes?.score },
          policyFlags: [],
        };
      }

      const session = await triggerMockInterview(
        { role: inputs.role, difficulty: inputs.difficulty || 'Mid' },
        userId
      );
      return {
        status: 'SUCCESS',
        output: session,
        confidence: 'HIGH',
        evidence: { sessionId: session?.sessionId },
        policyFlags: [],
      };
    },
  },

  // ── 8. RUN CODING PRACTICE ───────────────────────────────────────────────
  'run-coding-practice': {
    skillId: 'run-coding-practice',
    version: '1.0.0',
    outputType: 'coding',
    purpose: 'Runs technical code execution sandbox or generates algorithm practice drills.',
    allowedAgents: ['omni'],
    allowedTools: ['run_code_sandbox', 'trigger_coding_challenge'],
    requiredInputs: ['language'],
    preconditions: ['Code or topic provided'],
    procedure: [
      'If code provided: execute in secure sandbox with test cases',
      'If topic provided: generate algorithm challenge',
    ],
    stopConditions: ['Language unsupported'],
    successConditions: ['Code executed or challenge generated'],
    failureConditions: ['Execution timeout'],
    applicablePolicies: ['tool-use-policy'],
    estimatedCostClass: 'LOW',
    execute: async (inputs, ctx) => {
      const userId = inputs.userId || ctx.userId;
      if (inputs.code) {
        const execRes = await runCodeSandbox(
          { language: inputs.language, code: inputs.code, stdin: inputs.stdin },
          userId
        );
        return {
          status: 'SUCCESS',
          output: execRes,
          confidence: 'HIGH',
          evidence: { summary: execRes?.summary },
          policyFlags: [],
        };
      }

      const challenge = await triggerCodingChallenge(
        { topic: inputs.topic || 'Algorithms', difficulty: inputs.difficulty || 'Medium' },
        userId
      );
      return {
        status: 'SUCCESS',
        output: challenge,
        confidence: 'HIGH',
        evidence: { title: challenge?.title },
        policyFlags: [],
      };
    },
  },

  // ── 9. CREATE LEARNING PLAN ──────────────────────────────────────────────
  'create-learning-plan': {
    skillId: 'create-learning-plan',
    version: '1.0.0',
    outputType: 'learning_plan',
    purpose: 'Builds targeted study roadmaps for technology skills.',
    allowedAgents: ['omni'],
    allowedTools: ['create_learning_plan'],
    requiredInputs: ['topic'],
    preconditions: ['Topic specified'],
    procedure: ['Generate structured milestones and study schedule'],
    stopConditions: ['Topic empty'],
    successConditions: ['Plan created'],
    failureConditions: ['Generation error'],
    applicablePolicies: ['credit-policy'],
    estimatedCostClass: 'MEDIUM',
    billableAction: 'LEARNING_PLAN',
    execute: async (inputs, ctx) => {
      const userId = inputs.userId || ctx.userId;
      const plan = await createLearningPlan(
        { topic: inputs.topic, durationWeeks: inputs.durationWeeks || 4 },
        userId
      );
      return {
        status: 'SUCCESS',
        output: plan,
        confidence: 'HIGH',
        evidence: { topic: inputs.topic, durationWeeks: inputs.durationWeeks },
        policyFlags: [],
      };
    },
  },

  // ── 10. GENERATE PROJECT ─────────────────────────────────────────────────
  'generate-project': {
    skillId: 'generate-project',
    version: '1.0.0',
    outputType: 'project',
    purpose: 'Architects full-stack portfolio projects with architecture blueprints.',
    allowedAgents: ['omni'],
    allowedTools: ['generate_project_blueprint'],
    requiredInputs: ['idea'],
    preconditions: ['Idea provided'],
    procedure: ['Generate full architecture and starter files'],
    stopConditions: ['Idea empty'],
    successConditions: ['Blueprint generated'],
    failureConditions: ['Generation error'],
    applicablePolicies: ['credit-policy'],
    estimatedCostClass: 'HIGH',
    billableAction: 'PROJECT_BLUEPRINT',
    execute: async (inputs, ctx) => {
      const userId = inputs.userId || ctx.userId;
      const blueprint = await generateProjectBlueprint(userId, inputs.idea);
      return {
        status: 'SUCCESS',
        output: blueprint,
        confidence: 'HIGH',
        evidence: { idea: inputs.idea },
        policyFlags: [],
      };
    },
  },

  // ── 11. ANALYZE SALARY OFFER ─────────────────────────────────────────────
  'analyze-salary-offer': {
    skillId: 'analyze-salary-offer',
    version: '1.0.0',
    outputType: 'salary',
    purpose: 'Evaluates job offer compensation against benchmarks and writes negotiation scripts.',
    allowedAgents: ['omni'],
    allowedTools: ['negotiate_salary_offer'],
    requiredInputs: ['role', 'currentOffer'],
    preconditions: ['Role and offer provided'],
    procedure: ['Compare with benchmarks and draft counter-script'],
    stopConditions: ['Offer missing'],
    successConditions: ['Script generated'],
    failureConditions: ['Analysis error'],
    applicablePolicies: ['credit-policy'],
    estimatedCostClass: 'MEDIUM',
    billableAction: 'SALARY_ANALYSIS',
    execute: async (inputs, ctx) => {
      const userId = inputs.userId || ctx.userId;
      const res = await negotiateSalaryOffer(
        {
          role: inputs.role,
          currentOffer: String(inputs.currentOffer || ''),
          targetSalary: String(inputs.targetSalary || ''),
        },
        userId
      );
      return {
        status: 'SUCCESS',
        output: res,
        confidence: 'HIGH',
        evidence: { role: inputs.role },
        policyFlags: [],
      };
    },
  },

  // ── 12. APPLY TO JOB (LEVEL 13: BROWSER APPLICATION AGENT V1) ───────────
  'apply-to-job': {
    skillId: 'apply-to-job',
    version: '1.3.0',
    outputType: 'application',
    purpose: 'Executes browser-assisted job application in Approval Mode on supported employer ATS.',
    allowedAgents: ['browser_agent', 'omni'],
    allowedTools: ['start_browser_application', 'approve_and_submit_application'],
    requiredInputs: ['packageId'],
    preconditions: [
      'Application package status is READY',
      'Canonical job is ACTIVE',
      'Credits reserved (APPLICATION_SUBMIT = 8)',
      'Browser runtime available',
    ],
    procedure: [
      'Verify READY package',
      'Verify job freshness',
      'Open approved apply URL',
      'Detect ATS provider (Greenhouse, Lever, Ashby, Generic)',
      'Fill verified fields only',
      'Upload approved resume',
      'Validate employer form',
      'Halt at submission boundary (AWAITING_APPROVAL)',
      'Require explicit user approval before submit',
      'Submit once and verify confirmation',
    ],
    stopConditions: [
      'Package not READY',
      'CAPTCHA or MFA encountered (NEEDS_USER)',
      'Unresolved mandatory question (NEEDS_USER)',
      'Unsupported ATS portal (MANUAL_APPLY)',
      'Submission boundary reached (AWAITING_APPROVAL)',
    ],
    successConditions: ['Application prepared for approval OR submitted with confirmation'],
    failureConditions: ['Browser error', 'Employer site error', 'Validation error'],
    applicablePolicies: [
      'browser-policy',
      'application-policy',
      'human-handoff-policy',
      'credit-policy',
    ],
    estimatedCostClass: 'HIGH',
    billableAction: 'APPLICATION_SUBMIT',
    execute: async (inputs, ctx) => {
      const userId = inputs.userId || ctx.userId;
      const { BrowserApplicationAgentService } = await import('@/lib/browser-agent');

      // Check if this is an approval submission
      if (inputs.action === 'APPROVE_AND_SUBMIT') {
        const run = await BrowserApplicationAgentService.approveAndSubmit({
          userId,
          runId: inputs.runId,
          packageId: inputs.packageId,
          explicitUserConsent: Boolean(inputs.explicitUserConsent),
        });

        return {
          status: run.status === 'SUBMITTED' ? 'SUCCESS' : 'FAILED',
          output: run,
          confidence: 'HIGH',
          evidence: run.evidence,
          policyFlags: run.status === 'SUBMITTED' ? ['SUBMISSION_CONFIRMED'] : ['SUBMISSION_UNCERTAIN'],
        };
      }

      // Check if answering an inline handoff question
      if (inputs.action === 'ANSWER_HANDOFF') {
        const run = await BrowserApplicationAgentService.answerHandoff({
          userId,
          runId: inputs.runId,
          answers: inputs.answers,
        });

        return {
          status: run.status === 'AWAITING_APPROVAL' ? 'SUCCESS' : 'HANDOFF_REQUIRED',
          output: run,
          confidence: 'HIGH',
          evidence: run.evidence,
          handoffRequired: run.requiresUserAction ? {
            reason: run.handoffReason || 'User input required',
            question: run.handoffPayload?.question || 'Please answer the employer question.',
            requiredAction: run.handoffReason || 'USER_INPUT',
            resumableState: { runId: run.id, packageId: inputs.packageId },
          } : undefined,
          policyFlags: [],
        };
      }

      // Standard run start
      const run = await BrowserApplicationAgentService.startRun({
        userId,
        packageId: inputs.packageId,
        idempotencyKey: inputs.idempotencyKey,
      });

      if (run.status === 'AWAITING_APPROVAL') {
        return {
          status: 'SUCCESS',
          output: run,
          confidence: 'HIGH',
          evidence: run.evidence,
          nextAction: 'approve_and_submit',
          policyFlags: ['AWAITING_USER_APPROVAL_BOUNDARY'],
        };
      }

      if (run.status === 'NEEDS_USER') {
        return {
          status: 'HANDOFF_REQUIRED',
          output: run,
          confidence: 'HIGH',
          evidence: run.evidence,
          handoffRequired: {
            reason: run.handoffReason || 'User input required on application form',
            question: run.handoffPayload?.question || 'Please complete verification.',
            requiredAction: run.handoffReason || 'USER_INPUT',
            resumableState: { runId: run.id, packageId: inputs.packageId },
          },
          policyFlags: [run.handoffReason || 'HANDOFF_REQUIRED'],
        };
      }

      if (run.status === 'UNSUPPORTED') {
        return {
          status: 'STOPPED',
          output: run,
          confidence: 'HIGH',
          evidence: run.evidence,
          nextAction: 'manual_apply',
          policyFlags: ['UNSUPPORTED_ATS_MANUAL_FALLBACK'],
        };
      }

      return {
        status: run.status === 'SUBMITTED' ? 'SUCCESS' : 'FAILED',
        output: run,
        confidence: 'HIGH',
        evidence: run.evidence,
        policyFlags: [run.status],
      };
    },
  },
};

export class SkillRegistry {
  static getSkill(skillId: SkillId): SkillDefinition {
    const skill = SKILLS_REGISTRY[skillId];
    if (!skill) {
      throw new Error(`Skill "${skillId}" not found in registry.`);
    }
    return skill;
  }

  static getRegisteredSkillIds(): SkillId[] {
    return Object.keys(SKILLS_REGISTRY) as SkillId[];
  }
}
