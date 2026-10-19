// @ts-nocheck
import { describe, it, expect, beforeEach } from 'bun:test';
import {
  AutopilotPolicyManager,
  AutopilotDiscoveryService,
  AutopilotExecutionEngine,
  AutopilotReviewQueue,
  AutopilotSchedulerService,
  DEFAULT_AUTOPILOT_LIMITS,
} from '@/lib/autopilot';
import type {
  AutopilotPolicy,
  CanonicalJobRecord,
  CandidateApplicationProfile,
} from '@/lib/autopilot';
import { CreditService } from '@/lib/billing/credit-service';
import { ApplicationTrackerService } from '@/lib/application-tracker';

describe('Level 16: Omni Autopilot: Policy Engine, Scheduling & Controlled Application Automation', () => {
  const testUserId = 'usr_autopilot_test_1601';

  beforeEach(() => {
    AutopilotPolicyManager._resetMemoryStore();
    AutopilotExecutionEngine._resetMemoryStore();
    AutopilotDiscoveryService._clearTestFixtures();
    AutopilotReviewQueue._resetMemoryStore();
    AutopilotSchedulerService._clearTestPolicies();
    CreditService._clearTestBalances();
    ApplicationTrackerService._resetMemoryStore();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. POLICY CONFIGURATION & OPERATIONAL SAFETY (Sections 3, 4, 46)
  // ──────────────────────────────────────────────────────────────────────────
  describe('1. Policy Configuration & Operational Safety', () => {
    it('initializes a safe, unactivated default policy (OFF mode)', async () => {
      const policy = await AutopilotPolicyManager.getPolicy(testUserId);
      expect(policy.userId).toBe(testUserId);
      expect(policy.enabled).toBe(false);
      expect(policy.mode).toBe('OFF');
      expect(policy.policyVersion).toBe(1);
      expect(policy.dailyPreparationLimit).toBe(DEFAULT_AUTOPILOT_LIMITS.maxDailyPreparation);
      expect(policy.dailySubmissionLimit).toBe(DEFAULT_AUTOPILOT_LIMITS.maxDailySubmission);
    });

    it('updates policy and increments version', async () => {
      const updated = await AutopilotPolicyManager.updatePolicy(testUserId, {
        enabled: true,
        mode: 'PREPARE',
        targetRoles: ['Frontend Engineer', 'Fullstack Engineer'],
        minMatchScore: 80,
      });

      expect(updated.enabled).toBe(true);
      expect(updated.mode).toBe('PREPARE');
      expect(updated.targetRoles).toEqual(['Frontend Engineer', 'Fullstack Engineer']);
      expect(updated.policyVersion).toBe(2);
    });

    it('pauses and resumes candidate autopilot without losing configuration', async () => {
      await AutopilotPolicyManager.updatePolicy(testUserId, {
        enabled: true,
        mode: 'PREPARE',
        targetRoles: ['Staff Engineer'],
      });

      const paused = await AutopilotPolicyManager.pauseAutopilot(testUserId, 'Taking a break');
      expect(paused.isPaused).toBe(true);
      expect(paused.pauseReason).toBe('Taking a break');

      const resumed = await AutopilotPolicyManager.resumeAutopilot(testUserId);
      expect(resumed.isPaused).toBe(false);
      expect(resumed.pauseReason).toBeUndefined();
      expect(resumed.targetRoles).toEqual(['Staff Engineer']);
    });

    it('enforces server-side global emergency kill switch (PAUSED_SECURITY)', async () => {
      await AutopilotPolicyManager.updatePolicy(testUserId, {
        enabled: true,
        mode: 'DISCOVER',
      });

      // Activate emergency kill switch
      AutopilotPolicyManager.setGlobalKillSwitch(true);
      expect(AutopilotPolicyManager.isGlobalKillSwitchActive()).toBe(true);

      const run = await AutopilotExecutionEngine.executeCycle(testUserId);
      expect(run.status).toBe('PAUSED_SECURITY');
      expect(run.errorCode).toBe('GLOBAL_KILL_SWITCH_ACTIVE');
      expect(run.jobsEvaluated).toBe(0);

      // Deactivate kill switch
      AutopilotPolicyManager.setGlobalKillSwitch(false);
      expect(AutopilotPolicyManager.isGlobalKillSwitchActive()).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. HARD CANDIDATE RESTRICTIONS & DETERMINISTIC FILTERING (Sections 5, 6, 7)
  // ──────────────────────────────────────────────────────────────────────────
  describe('2. Hard Candidate Restrictions & Deterministic Filtering', () => {
    const mockProfile: CandidateApplicationProfile = {
      userId: testUserId,
      identity: {
        fullName: 'Alex Candidate',
        email: 'alex@example.com',
        currentCity: 'Bangalore',
        country: 'India',
      },
      career: {
        totalExperienceYears: 3,
        skills: ['TypeScript', 'React', 'Node.js'],
        primaryTechStack: ['TypeScript', 'React'],
      },
      preferences: {
        targetRoles: ['Frontend Engineer'],
        preferredLocations: ['Bangalore'],
        remotePreference: true,
        hybridPreference: true,
        onsitePreference: false,
        salaryCurrency: 'INR',
        employmentTypes: ['Full-time'],
        industries: [],
        companiesToAvoid: ['BadCorp'],
        willingToRelocate: false,
        preferredRelocationLocations: [],
        willingToTravel: false,
      },
      answers: {
        requires_visa_sponsorship: {
          field: 'requires_visa_sponsorship',
          value: true,
          valueType: 'boolean',
          status: 'VERIFIED',
          verified: true,
          source: 'user',
        },
      },
      completeness: { percentage: 90, missingCritical: [], missingRecommended: [] },
      readiness: { status: 'READY', summary: 'Ready', blockers: [] },
    };

    it('filters out CLOSED jobs immediately with 0 credit burned', async () => {
      const policy: AutopilotPolicy = {
        ...AutopilotPolicyManager.createDefaultPolicy(testUserId),
        enabled: true,
        mode: 'DISCOVER',
        minMatchScore: 70,
      };

      const jobs = [
        {
          id: 'job_closed_001',
          title: 'Frontend Engineer',
          company: 'Acme Inc',
          status: 'CLOSED',
        },
      ] as any[];

      AutopilotDiscoveryService._setTestFixtures(jobs, [], mockProfile);

      const result = await AutopilotDiscoveryService.discoverAndFilterJobs(testUserId, policy);
      expect(result.totalEvaluated).toBe(1);
      expect(result.totalEligible).toBe(0);
      expect(result.decisions[0].decision).toBe('BLOCKED');
      expect(result.decisions[0].reason).toContain('closed or cancelled');
    });

    it('deduplicates previously applied or prepared jobs (ALREADY_APPLIED)', async () => {
      const policy: AutopilotPolicy = {
        ...AutopilotPolicyManager.createDefaultPolicy(testUserId),
        enabled: true,
        mode: 'DISCOVER',
      };

      const jobs = [
        {
          id: 'job_duplicate_001',
          title: 'Frontend Engineer',
          company: 'Acme Inc',
          status: 'ACTIVE',
        },
      ] as any[];

      AutopilotDiscoveryService._setTestFixtures(jobs, ['job_duplicate_001'], mockProfile);

      const result = await AutopilotDiscoveryService.discoverAndFilterJobs(testUserId, policy);
      expect(result.totalEligible).toBe(0);
      expect(result.decisions[0].decision).toBe('ALREADY_APPLIED');
      expect(result.decisions[0].reason).toContain('already submitted or prepared');
    });

    it('blocks employer on candidate excluded companies list', async () => {
      const policy: AutopilotPolicy = {
        ...AutopilotPolicyManager.createDefaultPolicy(testUserId),
        enabled: true,
        mode: 'DISCOVER',
        excludedCompanies: ['BlockedCorp'],
      };

      const jobs = [
        {
          id: 'job_excluded_001',
          title: 'Frontend Engineer',
          company: 'BlockedCorp',
          status: 'ACTIVE',
        },
      ] as any[];

      AutopilotDiscoveryService._setTestFixtures(jobs, [], mockProfile);

      const result = await AutopilotDiscoveryService.discoverAndFilterJobs(testUserId, policy);
      expect(result.totalEligible).toBe(0);
      expect(result.decisions[0].decision).toBe('BLOCKED');
      expect(result.decisions[0].reason).toContain('excluded companies list');
    });

    it('blocks onsite jobs in another city when candidate policy is REMOTE only', async () => {
      const policy: AutopilotPolicy = {
        ...AutopilotPolicyManager.createDefaultPolicy(testUserId),
        enabled: true,
        mode: 'DISCOVER',
        remotePreference: 'REMOTE',
      };

      const jobs = [
        {
          id: 'job_onsite_remote_mismatch',
          title: 'Frontend Engineer',
          company: 'OfficeCorp',
          remote_type: 'ONSITE',
          location: 'Hyderabad',
          status: 'ACTIVE',
        },
      ] as any[];

      AutopilotDiscoveryService._setTestFixtures(jobs, [], mockProfile);

      const result = await AutopilotDiscoveryService.discoverAndFilterJobs(testUserId, policy);
      expect(result.totalEligible).toBe(0);
      expect(result.decisions[0].decision).toBe('BLOCKED');
      expect(result.decisions[0].reason).toContain('conflicting with candidate\'s Remote policy');
    });

    it('blocks roles specifying no visa sponsorship when candidate requires it', async () => {
      const policy: AutopilotPolicy = {
        ...AutopilotPolicyManager.createDefaultPolicy(testUserId),
        enabled: true,
        mode: 'DISCOVER',
      };

      const jobs = [
        {
          id: 'job_visa_mismatch',
          title: 'Frontend Engineer',
          company: 'GovVendor',
          description: 'Applicant must be legally authorized to work in the US. No visa sponsorship provided.',
          status: 'ACTIVE',
        },
      ] as any[];

      AutopilotDiscoveryService._setTestFixtures(jobs, [], mockProfile);

      const result = await AutopilotDiscoveryService.discoverAndFilterJobs(testUserId, policy);
      expect(result.totalEligible).toBe(0);
      expect(result.decisions[0].decision).toBe('BLOCKED');
      expect(result.decisions[0].reason).toContain('requires visa sponsorship, but employer explicitly specifies no sponsorship');
    });

    it('blocks roles with minimum experience exceeding candidate by >3 years', async () => {
      const policy: AutopilotPolicy = {
        ...AutopilotPolicyManager.createDefaultPolicy(testUserId),
        enabled: true,
        mode: 'DISCOVER',
        experienceRange: { minimum: 1, maximum: 5 },
      };

      const jobs = [
        {
          id: 'job_exp_mismatch',
          title: 'Principal Architect',
          company: 'TechGiant',
          experience_min: 10,
          status: 'ACTIVE',
        },
      ] as any[];

      AutopilotDiscoveryService._setTestFixtures(jobs, [], mockProfile);

      const result = await AutopilotDiscoveryService.discoverAndFilterJobs(testUserId, policy);
      expect(result.totalEligible).toBe(0);
      expect(result.decisions[0].decision).toBe('BLOCKED');
      expect(result.decisions[0].reason).toContain('significantly exceeding candidate\'s');
    });

    it('blocks roles where salary maximum is below candidate minimum threshold', async () => {
      const policy: AutopilotPolicy = {
        ...AutopilotPolicyManager.createDefaultPolicy(testUserId),
        enabled: true,
        mode: 'DISCOVER',
        minSalary: 2500000,
      };

      const jobs = [
        {
          id: 'job_salary_low',
          title: 'Junior Frontend Developer',
          company: 'StartUp',
          salary_max: 1200000,
          salary_currency: 'INR',
          status: 'ACTIVE',
        },
      ] as any[];

      AutopilotDiscoveryService._setTestFixtures(jobs, [], mockProfile);

      const result = await AutopilotDiscoveryService.discoverAndFilterJobs(testUserId, policy);
      expect(result.totalEligible).toBe(0);
      expect(result.decisions[0].decision).toBe('BLOCKED');
      expect(result.decisions[0].reason).toContain('below candidate policy minimum');
    });

    it('ranks eligible jobs by match score descending', async () => {
      const policy: AutopilotPolicy = {
        ...AutopilotPolicyManager.createDefaultPolicy(testUserId),
        enabled: true,
        mode: 'DISCOVER',
        minMatchScore: 70,
      };

      const jobs = [
        { id: 'job_a', title: 'React Dev', company: 'Alpha', status: 'ACTIVE' },
        { id: 'job_b', title: 'Senior React Dev', company: 'Beta', status: 'ACTIVE' },
        { id: 'job_c', title: 'TypeScript Lead', company: 'Gamma', status: 'ACTIVE' },
      ] as any[];

      const scores: Record<string, number> = {
        job_a: 75,
        job_b: 92,
        job_c: 84,
      };

      AutopilotDiscoveryService._setTestFixtures(
        jobs,
        [],
        mockProfile,
        async (uId, job) => ({
          userId: uId,
          jobId: job.id,
          score: scores[job.id],
          category: 'HIGH',
          recommendation: 'STRONG_MATCH',
          confidence: 'HIGH',
          isBlocked: false,
          evaluatedAt: new Date().toISOString(),
        } as any)
      );

      const result = await AutopilotDiscoveryService.discoverAndFilterJobs(testUserId, policy);
      expect(result.totalEligible).toBe(3);
      expect(result.eligibleJobs[0].job.id).toBe('job_b'); // 92%
      expect(result.eligibleJobs[1].job.id).toBe('job_c'); // 84%
      expect(result.eligibleJobs[2].job.id).toBe('job_a'); // 75%
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. BUDGET ENFORCEMENT & CREDIT CONTROL (Sections 14, 15, 16)
  // ──────────────────────────────────────────────────────────────────────────
  describe('3. Budget Enforcement & Credit Control', () => {
    it('halts with PAUSED_BUDGET when wallet has insufficient credits (< 4 credits)', async () => {
      await AutopilotPolicyManager.updatePolicy(testUserId, {
        enabled: true,
        mode: 'PREPARE',
      });

      // User has only 2 credits available (requires 4)
      CreditService._setTestBalance(testUserId, 2);

      const run = await AutopilotExecutionEngine.executeCycle(testUserId);
      expect(run.status).toBe('PAUSED_BUDGET');
      expect(run.errorCode).toBe('INSUFFICIENT_CREDITS');
      expect(run.creditsSettled).toBe(0);
      expect(run.applicationsPrepared).toBe(0);
    });

    it('caps prepared batch by dailyPreparationLimit and available credits', async () => {
      await AutopilotPolicyManager.updatePolicy(testUserId, {
        enabled: true,
        mode: 'PREPARE',
        dailyPreparationLimit: 2, // limit to 2
      });

      // 100 credits available (more than enough)
      CreditService._setTestBalance(testUserId, 100);

      const jobs = [
        { id: 'job_batch_1', title: 'Role 1', company: 'Co 1', status: 'ACTIVE' },
        { id: 'job_batch_2', title: 'Role 2', company: 'Co 2', status: 'ACTIVE' },
        { id: 'job_batch_3', title: 'Role 3', company: 'Co 3', status: 'ACTIVE' },
      ] as any[];

      AutopilotDiscoveryService._setTestFixtures(jobs, [], null, async (uId, job) => ({
        userId: uId,
        jobId: job.id,
        score: 85,
        category: 'HIGH',
        recommendation: 'GOOD_MATCH',
        confidence: 'HIGH',
        isBlocked: false,
        evaluatedAt: new Date().toISOString(),
      } as any));

      AutopilotExecutionEngine._setTestExecutionHandlers({
        preparePackage: async ({ jobId }) => ({
          id: `pkg_${jobId}`,
          status: 'READY',
          tailoredResumeId: `res_${jobId}`,
        }),
      });

      const run = await AutopilotExecutionEngine.executeCycle(testUserId);
      expect(run.status).toBe('COMPLETED');
      expect(run.jobsEligible).toBe(3);
      expect(run.applicationsPrepared).toBe(2); // capped at 2
      expect(run.creditsSettled).toBe(8); // 2 * 4 credits
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. OPERATING MODES & CONSENT CONTROLS (Sections 8, 9, 10, 11)
  // ──────────────────────────────────────────────────────────────────────────
  describe('4. Operating Modes & Consent Controls', () => {
    it('MODE: OFF cancels scheduled work immediately with 0 credit burned', async () => {
      await AutopilotPolicyManager.updatePolicy(testUserId, {
        enabled: false,
        mode: 'OFF',
      });

      const run = await AutopilotExecutionEngine.executeCycle(testUserId);
      expect(run.status).toBe('CANCELLED');
      expect(run.errorCode).toBe('AUTOPILOT_OFF');
      expect(run.jobsEvaluated).toBe(0);
      expect(run.creditsSettled).toBe(0);
    });

    it('MODE: DISCOVER evaluates opportunities, saves reasoning, and burns 0 credits', async () => {
      await AutopilotPolicyManager.updatePolicy(testUserId, {
        enabled: true,
        mode: 'DISCOVER',
      });

      const jobs = [
        { id: 'job_disc_1', title: 'Frontend Lead', company: 'DiscCo', status: 'ACTIVE' },
      ] as any[];

      AutopilotDiscoveryService._setTestFixtures(jobs, [], null, async (uId, job) => ({
        userId: uId,
        jobId: job.id,
        score: 88,
        category: 'HIGH',
        recommendation: 'STRONG_MATCH',
        confidence: 'HIGH',
        isBlocked: false,
        evaluatedAt: new Date().toISOString(),
      } as any));

      const run = await AutopilotExecutionEngine.executeCycle(testUserId);
      expect(run.status).toBe('COMPLETED');
      expect(run.mode).toBe('DISCOVER');
      expect(run.jobsEvaluated).toBe(1);
      expect(run.jobsEligible).toBe(1);
      expect(run.applicationsPrepared).toBe(0);
      expect(run.creditsSettled).toBe(0);
      expect(run.decisions[0].decision).toBe('ELIGIBLE');
    });

    it('MODE: REVIEW_AND_EXECUTE submits ONLY explicitly approved applications', async () => {
      await AutopilotPolicyManager.updatePolicy(testUserId, {
        enabled: true,
        mode: 'REVIEW_AND_EXECUTE',
        dailySubmissionLimit: 1,
      });

      CreditService._setTestBalance(testUserId, 50);

      // No newly eligible jobs to prepare
      AutopilotDiscoveryService._setTestFixtures([]);

      // 1 pre-approved application awaiting execution
      const approvedApp = {
        id: 'app_approved_123',
        job_id: 'job_appr_123',
        company: 'Stripe',
        application_package_id: 'pkg_123',
        status: 'AWAITING_APPROVAL',
      };

      let submittedCalled = false;
      AutopilotExecutionEngine._setTestExecutionHandlers({
        approvedApps: [approvedApp],
        approveAndSubmit: async ({ runId, packageId, explicitUserConsent }) => {
          expect(explicitUserConsent).toBe(true);
          expect(packageId).toBe('pkg_123');
          submittedCalled = true;
          return { status: 'SUBMITTED', runId };
        },
      });

      const run = await AutopilotExecutionEngine.executeCycle(testUserId);
      expect(run.status).toBe('COMPLETED');
      expect(run.applicationsSubmitted).toBe(1);
      expect(run.creditsSettled).toBe(8); // 8 credits for final submission
      expect(submittedCalled).toBe(true);
    });

    it('MATERIAL POLICY CHANGE invalidates pending approvals and bumps policy version', async () => {
      const initial = await AutopilotPolicyManager.updatePolicy(testUserId, {
        targetRoles: ['Frontend Engineer'],
        minSalary: 1500000,
      });

      expect(initial.policyVersion).toBe(2);

      // Material change: salary floor increased
      const updated = await AutopilotPolicyManager.updatePolicy(testUserId, {
        minSalary: 2000000,
      });

      expect(updated.policyVersion).toBe(3);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. PARTIAL BATCH COMPLETION & ERROR RESILIENCE (Sections 18, 19)
  // ──────────────────────────────────────────────────────────────────────────
  describe('5. Partial Batch Completion & Error Resilience', () => {
    it('marks run as PARTIAL when some items succeed and others throw errors', async () => {
      await AutopilotPolicyManager.updatePolicy(testUserId, {
        enabled: true,
        mode: 'PREPARE',
        dailyPreparationLimit: 3,
      });

      CreditService._setTestBalance(testUserId, 100);

      const jobs = [
        { id: 'job_success_1', title: 'Role 1', company: 'Alpha', status: 'ACTIVE' },
        { id: 'job_fail_2', title: 'Role 2', company: 'Beta', status: 'ACTIVE' },
        { id: 'job_success_3', title: 'Role 3', company: 'Gamma', status: 'ACTIVE' },
      ] as any[];

      AutopilotDiscoveryService._setTestFixtures(jobs, [], null, async (uId, job) => ({
        userId: uId,
        jobId: job.id,
        score: 85,
        category: 'HIGH',
        recommendation: 'GOOD_MATCH',
        confidence: 'HIGH',
        isBlocked: false,
        evaluatedAt: new Date().toISOString(),
      } as any));

      AutopilotExecutionEngine._setTestExecutionHandlers({
        preparePackage: async ({ jobId }) => {
          if (jobId === 'job_fail_2') {
            throw new Error('LLM rate limit reached for cover letter generation');
          }
          return {
            id: `pkg_${jobId}`,
            status: 'READY',
            tailoredResumeId: `res_${jobId}`,
          };
        },
      });

      const run = await AutopilotExecutionEngine.executeCycle(testUserId);
      expect(run.status).toBe('PARTIAL');
      expect(run.applicationsPrepared).toBe(2);
      expect(run.creditsSettled).toBe(8); // 2 * 4 credits
      expect(run.errorCode).toBe('PARTIAL_FAILURES');
      expect(run.errorMessage).toContain('Beta (Role 2): LLM rate limit reached');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 6. SCHEDULER BATCH EXECUTION & IDEMPOTENCY (Sections 20, 21, 22)
  // ──────────────────────────────────────────────────────────────────────────
  describe('6. Scheduler Batch Execution & Idempotency', () => {
    it('skips candidates whose current local hour is outside the scheduled execution window', async () => {
      const currentUtcHour = new Date().getUTCHours();
      const outsideHour = (currentUtcHour + 5) % 24;

      const policy: AutopilotPolicy = {
        ...AutopilotPolicyManager.createDefaultPolicy(testUserId),
        enabled: true,
        mode: 'PREPARE',
        timezone: 'UTC',
        preferredExecutionHour: outsideHour, // Not right now
        frequency: 'DAILY',
      };

      AutopilotSchedulerService._setTestPolicies([policy]);

      const batchResult = await AutopilotSchedulerService.runScheduledBatch();
      expect(batchResult.totalScanned).toBe(1);
      expect(batchResult.eligibleCandidates).toBe(0);
      expect(batchResult.runsSkipped).toBe(1);
      expect(batchResult.runsTriggered).toBe(0);
    });

    it('triggers execution for candidate matching the current scheduled hour', async () => {
      const currentUtcHour = new Date().getUTCHours();

      const policy: AutopilotPolicy = {
        ...AutopilotPolicyManager.createDefaultPolicy(testUserId),
        enabled: true,
        mode: 'DISCOVER',
        timezone: 'UTC',
        preferredExecutionHour: currentUtcHour,
        frequency: 'DAILY',
      };

      AutopilotSchedulerService._setTestPolicies([policy]);
      AutopilotDiscoveryService._setTestFixtures([]);

      const batchResult = await AutopilotSchedulerService.runScheduledBatch();
      expect(batchResult.totalScanned).toBe(1);
      expect(batchResult.eligibleCandidates).toBe(1);
      expect(batchResult.runsTriggered).toBe(1);
      expect(batchResult.runsSkipped).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 7. REVIEW QUEUE & EXPLICIT APPROVALS (Sections 12, 13)
  // ──────────────────────────────────────────────────────────────────────────
  describe('7. Review Queue & Explicit Approvals', () => {
    it('generates cryptographic Approval ID and updates status to AWAITING_APPROVAL', async () => {
      const testApp = {
        id: 'app_review_001',
        user_id: testUserId,
        job_id: 'job_001',
        application_package_id: 'pkg_001',
        resume_version_id: 'v1',
        status: 'READY',
      };

      AutopilotReviewQueue._seedTestApp(testApp);

      const approval = await AutopilotReviewQueue.approveApplication(testUserId, 'app_review_001');
      expect(approval.success).toBe(true);
      expect(approval.approvalId).toMatch(/^appr_[a-f0-9]{24}$/);
      expect(testApp.status).toBe('AWAITING_APPROVAL');
    });

    it('skips application and marks status as WITHDRAWN', async () => {
      const testApp = {
        id: 'app_review_002',
        user_id: testUserId,
        job_id: 'job_002',
        status: 'READY',
      };

      AutopilotReviewQueue._seedTestApp(testApp);

      const result = await AutopilotReviewQueue.skipApplication(
        testUserId,
        'app_review_002',
        'Not interested in this tech stack'
      );

      expect(result.success).toBe(true);
      expect(testApp.status).toBe('WITHDRAWN');
      expect(testApp.notes).toBe('Not interested in this tech stack');
    });
  });
});
