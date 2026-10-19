// @ts-nocheck
import { describe, it, expect, beforeEach } from 'bun:test';
import {
  SafeRetryClassifier,
  DEFAULT_EXECUTION_LIMITS,
} from '@/lib/browser-agent/retries';
import { CheckpointManager } from '@/lib/browser-agent/checkpoints';
import { AtsCircuitBreaker } from '@/lib/browser-agent/circuit-breaker';
import { SubmissionGuard } from '@/lib/browser-agent/submission-guard';
import { ApprovalManager } from '@/lib/browser-agent/approvals';
import { TakeoverManager } from '@/lib/browser-agent/takeover';
import { BrowserTelemetryTracker } from '@/lib/browser-agent/telemetry';
import { MockBrowserDriver } from '@/lib/browser-agent/drivers/mock-driver';
import { RecoveryOrchestrator } from '@/lib/browser-agent/recovery';
import { BrowserApplicationAgentService } from '@/lib/browser-agent/service';
import type { ApplicationRunRecord, AtsFormSchema } from '@/lib/browser-agent/types';

describe('Level 14: Browser Agent Reliability, Recovery & Human Takeover', () => {
  const testUserId = 'usr_test_rel_14001';
  const testAppId = 'app_test_rel_14001';
  const testPackageId = 'pkg_test_rel_14001';

  beforeEach(() => {
    CheckpointManager.clearMemory();
    SubmissionGuard.clearMemory();
    AtsCircuitBreaker.resetAll();
    BrowserApplicationAgentService.clearMemory();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. SAFE RETRY POLICY & LOOP LIMITS (Sections 8, 9, 10)
  // ──────────────────────────────────────────────────────────────────────────
  describe('1. Safe Retry Policy & Loop Limits', () => {
    it('MUST NEVER blindly retry final submission', () => {
      const decision = SafeRetryClassifier.classify('FINAL_SUBMIT', 1, new Error('Network timeout'));
      expect(decision.canRetry).toBe(false);
      expect(decision.backoffMs).toBe(0);
      expect(decision.action).toBe('PAUSE_NEEDS_USER');
      expect(decision.uncertainSubmission).toBe(true);
      expect(decision.reason).toContain('Final submission is non-idempotent');
    });

    it('allows bounded retry for safe idempotent steps', () => {
      const navDecision = SafeRetryClassifier.classify('PAGE_NAVIGATION', 1, new Error('Connection reset'));
      expect(navDecision.canRetry).toBe(true);
      expect(navDecision.backoffMs).toBeGreaterThan(0);
      expect(navDecision.action).toBe('RETRY');

      const inspectDecision = SafeRetryClassifier.classify('READ_ONLY_INSPECTION', 1, new Error('DOM not ready'));
      expect(inspectDecision.canRetry).toBe(true);

      const fillDecision = SafeRetryClassifier.classify('FIELD_FILLING', 1, new Error('Input temporarily detached'));
      expect(fillDecision.canRetry).toBe(true);

      const uploadDecision = SafeRetryClassifier.classify('FILE_UPLOAD', 1, new Error('Upload input busy'));
      expect(uploadDecision.canRetry).toBe(true);
    });

    it('enforces maxStepRetries and stops infinite retry loops', () => {
      const limitDecision = SafeRetryClassifier.classify('PAGE_NAVIGATION', 4, new Error('Connection reset'));
      expect(limitDecision.canRetry).toBe(false);
      expect(limitDecision.action).toBe('FAIL');
      expect(limitDecision.reason).toContain('exceeded maximum limit');
    });

    it('computes bounded exponential backoff with jitter', () => {
      const backoff1 = SafeRetryClassifier.calculateBackoff(1, 1000, 10000, 2, 0.2);
      const backoff2 = SafeRetryClassifier.calculateBackoff(2, 1000, 10000, 2, 0.2);
      const backoff3 = SafeRetryClassifier.calculateBackoff(3, 1000, 10000, 2, 0.2);

      expect(backoff1).toBeGreaterThanOrEqual(800);
      expect(backoff1).toBeLessThanOrEqual(1300);
      expect(backoff2).toBeGreaterThanOrEqual(1600);
      expect(backoff3).toBeGreaterThanOrEqual(3000);
    });

    it('detects run and session duration expiration', () => {
      const pastStartTime = Date.now() - (DEFAULT_EXECUTION_LIMITS.maxRunDurationMs + 5000);
      const durationCheck = SafeRetryClassifier.checkDurationLimits(pastStartTime);
      expect(durationCheck.exceeded).toBe(true);
      expect(durationCheck.reason).toContain('Maximum run duration');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. DURABLE CHECKPOINTS & PII SANITIZATION (Section 5)
  // ──────────────────────────────────────────────────────────────────────────
  describe('2. Durable Checkpoints & Sanitization', () => {
    it('persists and retrieves durable checkpoints', async () => {
      const runId = 'run_checkpoint_test_01';

      await CheckpointManager.saveCheckpoint({
        runId,
        step: 'APPLICATION_OPENED',
        sequence: 1,
        status: 'COMPLETED',
        safeResult: { url: 'https://boards.greenhouse.io/demo/jobs/123' },
      });

      await CheckpointManager.saveCheckpoint({
        runId,
        step: 'ATS_DETECTED',
        sequence: 2,
        status: 'COMPLETED',
        safeResult: { provider: 'GREENHOUSE' },
      });

      await CheckpointManager.saveCheckpoint({
        runId,
        step: 'FORM_INSPECTED',
        sequence: 3,
        status: 'COMPLETED',
        safeResult: { fieldsCount: 8 },
      });

      const latest = await CheckpointManager.getLatestCompletedCheckpoint(runId);
      expect(latest).not.toBeNull();
      expect(latest?.step).toBe('FORM_INSPECTED');
      expect(latest?.sequence).toBe(3);

      const all = await CheckpointManager.getCheckpoints(runId);
      expect(all.length).toBe(3);
    });

    it('strictly sanitizes passwords, auth tokens, MFA codes, and sensitive PII from checkpoints', async () => {
      const runId = 'run_checkpoint_pii_02';

      const uncleanedPayload = {
        candidateName: 'Jane Doe',
        password: 'SuperSecretPassword123!',
        mfaCode: '984123',
        sessionToken: 'jwt.bearer.token.abcdef',
        secretKey: 'sk-123456789',
        normalField: 'Software Engineer',
      };

      await CheckpointManager.saveCheckpoint({
        runId,
        step: 'FIELDS_MAPPED',
        sequence: 1,
        status: 'COMPLETED',
        safeResult: uncleanedPayload,
      });

      const checkpoints = await CheckpointManager.getCheckpoints(runId);
      const result = checkpoints[0].safeResultReference as any;

      expect(result.password).toBeUndefined();
      expect(result.mfaCode).toBeUndefined();
      expect(result.sessionToken).toBeUndefined();
      expect(result.secretKey).toBeUndefined();
      expect(result.candidateName).toBe('Jane Doe');
      expect(result.normalField).toBe('Software Engineer');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ATS CIRCUIT BREAKER (Section 16)
  // ──────────────────────────────────────────────────────────────────────────
  describe('3. ATS Circuit Breaker', () => {
    it('trips circuit breaker after consecutive adapter failures and cools down', () => {
      const provider = 'GREENHOUSE';

      expect(AtsCircuitBreaker.isTripped(provider)).toBe(false);

      // Record 2 failures -> should remain closed (threshold = 3)
      AtsCircuitBreaker.recordFailure(provider, 'Element not found');
      AtsCircuitBreaker.recordFailure(provider, 'Selector mismatch');
      expect(AtsCircuitBreaker.isTripped(provider)).toBe(false);

      // 3rd failure -> trips to OPEN
      const trippedState = AtsCircuitBreaker.recordFailure(provider, 'Layout structural shift');
      expect(trippedState.state).toBe('OPEN');
      expect(AtsCircuitBreaker.isTripped(provider)).toBe(true);

      const status = AtsCircuitBreaker.getStatus(provider);
      expect(status.state).toBe('OPEN');
      expect(status.consecutiveFailures).toBe(3);
      expect(status.cooldownExpiresAt).toBeDefined();

      // Successful call resets the breaker to CLOSED
      AtsCircuitBreaker.recordSuccess(provider);
      expect(AtsCircuitBreaker.isTripped(provider)).toBe(false);
      expect(AtsCircuitBreaker.getStatus(provider).consecutiveFailures).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. EXACTLY-ONCE SUBMISSION GUARD (Section 11)
  // ──────────────────────────────────────────────────────────────────────────
  describe('4. Exactly-Once Submission Guard', () => {
    it('acquires lock for valid submission and prevents duplicate concurrent or sequential attempts', async () => {
      const runId1 = 'run_guard_001';
      const runId2 = 'run_guard_002';
      const packageVersion = 1;
      const formVersion = 'form_hash_v1';
      const approvalId = 'appr_valid_001';

      // 1. Acquire initial submission lock
      const guardResult1 = await SubmissionGuard.acquireGuard({
        userId: testUserId,
        applicationId: testAppId,
        packageVersion,
        formVersion,
        browserRunId: runId1,
        approvalId,
      });

      expect(guardResult1.success).toBe(true);
      expect(guardResult1.guardId).toBeDefined();

      const guardRecord = await SubmissionGuard.getGuard(guardResult1.guardId!);
      expect(guardRecord?.status).toBe('PENDING');

      // 2. Second attempt concurrently should be rejected as concurrent attempt in progress
      const concurrentAttempt = await SubmissionGuard.acquireGuard({
        userId: testUserId,
        applicationId: testAppId,
        packageVersion,
        formVersion,
        browserRunId: runId2,
        approvalId,
      });

      expect(concurrentAttempt.success).toBe(false);
      expect(concurrentAttempt.error).toContain('DUPLICATE_SUBMISSION_ATTEMPT_BLOCKED');

      // 3. Mark the first submission as confirmed SUBMITTED
      await SubmissionGuard.confirmSubmission(guardResult1.guardId!);

      // 4. Any subsequent submission attempt for this same application and form version MUST be blocked
      const duplicateAttempt = await SubmissionGuard.acquireGuard({
        userId: testUserId,
        applicationId: testAppId,
        packageVersion,
        formVersion,
        browserRunId: 'run_guard_duplicate',
        approvalId,
      });

      expect(duplicateAttempt.success).toBe(false);
      expect(duplicateAttempt.error).toContain('already been submitted');
    });

    it('allows safe retry if previous submission explicitly FAILED', async () => {
      const runId = 'run_guard_failed_retry';
      const guardResult = await SubmissionGuard.acquireGuard({
        userId: testUserId,
        applicationId: 'app_retry_failed',
        packageVersion: 1,
        formVersion: 'v1',
        browserRunId: runId,
        approvalId: 'appr_01',
      });

      expect(guardResult.success).toBe(true);

      // Mark as FAILED
      await SubmissionGuard.markFailed(guardResult.guardId!);

      // Can re-acquire lock because previous attempt failed before employer transmission
      const reacquire = await SubmissionGuard.acquireGuard({
        userId: testUserId,
        applicationId: 'app_retry_failed',
        packageVersion: 1,
        formVersion: 'v1',
        browserRunId: 'run_guard_reacquire',
        approvalId: 'appr_02',
      });

      expect(reacquire.success).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. APPROVAL VALIDITY & MATERIAL CHANGE INVALIDATION (Section 12)
  // ──────────────────────────────────────────────────────────────────────────
  describe('5. Approval Validity & Invalidation Engine', () => {
    const mockFormSchema: AtsFormSchema = {
      provider: 'LEVER',
      formActionUrl: 'https://jobs.lever.co/test/apply',
      fields: [
        { key: 'fullName', label: 'Full Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
      ],
      hasCaptcha: false,
    };

    const mockAnswers = {
      fullName: 'Alice Walker',
      email: 'alice@example.com',
    };

    it('creates and validates approval within 30-minute window with matching data', () => {
      const approval = ApprovalManager.createApproval({
        userId: testUserId,
        applicationId: testAppId,
        packageVersion: 1,
        resumeVersion: 1,
        formSchema: mockFormSchema,
        answers: mockAnswers,
      });

      expect(approval.id).toBeDefined();

      const validation = ApprovalManager.validateApproval({
        approval,
        currentPackageVersion: 1,
        currentResumeVersion: 1,
        currentFormSchema: mockFormSchema,
        currentAnswers: mockAnswers,
      });

      expect(validation.isValid).toBe(true);
    });

    it('invalidates approval when resume version changes', () => {
      const approval = ApprovalManager.createApproval({
        userId: testUserId,
        applicationId: testAppId,
        packageVersion: 1,
        resumeVersion: 1,
        formSchema: mockFormSchema,
        answers: mockAnswers,
      });

      const validation = ApprovalManager.validateApproval({
        approval,
        currentPackageVersion: 1,
        currentResumeVersion: 2, // Resume updated
        currentFormSchema: mockFormSchema,
        currentAnswers: mockAnswers,
      });

      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain('Resume was updated');
    });

    it('invalidates approval when required answer changes', () => {
      const approval = ApprovalManager.createApproval({
        userId: testUserId,
        applicationId: testAppId,
        packageVersion: 1,
        resumeVersion: 1,
        formSchema: mockFormSchema,
        answers: mockAnswers,
      });

      const validation = ApprovalManager.validateApproval({
        approval,
        currentPackageVersion: 1,
        currentResumeVersion: 1,
        currentFormSchema: mockFormSchema,
        currentAnswers: {
          ...mockAnswers,
          email: 'new-email@example.com', // Modified answer
        },
      });

      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain('Application answers were modified');
    });

    it('invalidates approval when employer form schema changes', () => {
      const approval = ApprovalManager.createApproval({
        userId: testUserId,
        applicationId: testAppId,
        packageVersion: 1,
        resumeVersion: 1,
        formSchema: mockFormSchema,
        answers: mockAnswers,
      });

      const updatedFormSchema: AtsFormSchema = {
        ...mockFormSchema,
        fields: [
          ...mockFormSchema.fields,
          { key: 'phone', label: 'Phone Number', type: 'tel', required: true },
        ],
      };

      const validation = ApprovalManager.validateApproval({
        approval,
        currentPackageVersion: 1,
        currentResumeVersion: 1,
        currentFormSchema: updatedFormSchema,
        currentAnswers: mockAnswers,
      });

      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain('Employer form layout or fields changed');
    });

    it('invalidates approval when browser session must be rebuilt', () => {
      const approval = ApprovalManager.createApproval({
        userId: testUserId,
        applicationId: testAppId,
        packageVersion: 1,
        resumeVersion: 1,
        formSchema: mockFormSchema,
        answers: mockAnswers,
      });

      const validation = ApprovalManager.validateApproval({
        approval,
        currentPackageVersion: 1,
        currentResumeVersion: 1,
        currentFormSchema: mockFormSchema,
        currentAnswers: mockAnswers,
        sessionRebuilt: true, // Session was crashed/rebuilt
      });

      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain('Browser session was rebuilt');
    });

    it('invalidates approval when approval exceeds 30 minutes TTL', () => {
      const approval = ApprovalManager.createApproval({
        userId: testUserId,
        applicationId: testAppId,
        packageVersion: 1,
        resumeVersion: 1,
        formSchema: mockFormSchema,
        answers: mockAnswers,
      });

      // Simulate 31 minutes passage
      approval.approvedAt = new Date(Date.now() - 31 * 60 * 1000).toISOString();

      const validation = ApprovalManager.validateApproval({
        approval,
        currentPackageVersion: 1,
        currentResumeVersion: 1,
        currentFormSchema: mockFormSchema,
        currentAnswers: mockAnswers,
      });

      expect(validation.isValid).toBe(false);
      expect(validation.reason).toContain('expired');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 6. HUMAN TAKEOVER & HANDOFF SYSTEM (Sections 13, 14, 15)
  // ──────────────────────────────────────────────────────────────────────────
  describe('6. Human Takeover & Handoff System', () => {
    it('creates structured HandoffRequest and truthfully reports provider capabilities', () => {
      const driver = new MockBrowserDriver();

      // Mock driver truthfully reports supportsHumanTakeover = false
      expect(driver.capabilities.supportsHumanTakeover).toBe(false);
      expect(driver.capabilities.canReconnectSession).toBe(true);

      const handoff = TakeoverManager.createHandoffRequest({
        runId: 'run_takeover_01',
        userId: testUserId,
        reason: 'CAPTCHA_REQUIRED',
        message: 'Cloudflare Turnstile challenge detected on employer portal.',
        requiredAction: 'Please solve the captcha challenge to continue.',
        driver,
      });

      expect(handoff.runId).toBe('run_takeover_01');
      expect(handoff.reason).toBe('CAPTCHA_REQUIRED');
      expect(handoff.takeoverUrl).toBeUndefined(); // Truthful declaration: mock driver has no streaming remote URL
      expect(handoff.canResume).toBe(true);
      expect(handoff.expiresAt).toBeDefined();
    });

    it('generates cryptographic takeover token when interactive takeover is supported', () => {
      const mockInteractiveDriver: any = {
        capabilities: {
          canReconnectSession: true,
          supportsHumanTakeover: true,
          supportsSessionSnapshots: true,
        },
      };

      const mockSession = {
        sessionId: 'sess_remote_998',
        userId: testUserId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        active: true,
      };

      const handoff = TakeoverManager.createHandoffRequest({
        runId: 'run_takeover_02',
        userId: testUserId,
        reason: 'MFA_REQUIRED',
        message: 'Workday login requires two-factor authentication code.',
        requiredAction: 'Enter the code sent to your phone.',
        driver: mockInteractiveDriver,
        session: mockSession,
      });

      expect(handoff.takeoverUrl).toBeDefined();
      expect(handoff.takeoverUrl).toContain('/api/applications/browser-run/takeover');
      expect(handoff.takeoverUrl).toContain('token=');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 7. TELEMETRY & COGS TRACKING (Section 22)
  // ──────────────────────────────────────────────────────────────────────────
  describe('7. Telemetry & COGS Tracking', () => {
    it('computes execution duration, retry count, and estimated browser COGS', () => {
      const startTime = new Date(Date.now() - 45000).toISOString(); // 45 seconds ago
      const endTime = new Date().toISOString();

      const telemetry = BrowserTelemetryTracker.computeTelemetry({
        startedAt: startTime,
        completedAt: endTime,
        provider: 'ASHBY',
        sessionCount: 2,
        retryCount: 1,
        recoveryCount: 1,
      });

      expect(telemetry.browserSessionDurationMs).toBeGreaterThanOrEqual(44000);
      expect(telemetry.retryCount).toBe(1);
      expect(telemetry.recoveryCount).toBe(1);
      expect(telemetry.estimatedTotalCostUsd).toBeGreaterThan(0);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 8. SUBMISSION UNCERTAINTY HANDLING (Section 10)
  // ──────────────────────────────────────────────────────────────────────────
  describe('8. Submission Uncertainty Guard', () => {
    it('transitions to SUBMISSION_UNKNOWN and rejects automated submission retry on timeout', async () => {
      const runId = 'run_uncertain_001';
      const packageVersion = 1;
      const formVersion = 'form_lever_v1';

      // Acquire submission lock
      const guardResult = await SubmissionGuard.acquireGuard({
        userId: testUserId,
        applicationId: testAppId,
        packageVersion,
        formVersion,
        browserRunId: runId,
        approvalId: 'appr_valid',
      });

      expect(guardResult.success).toBe(true);

      // Simulate submit network disconnection -> mark unknown
      await SubmissionGuard.markUnknown(guardResult.guardId!);

      // Check guard state
      const guard = await SubmissionGuard.getGuard(guardResult.guardId!);
      expect(guard?.status).toBe('UNKNOWN');

      // Attempting automated submission retry MUST be blocked
      const retryAttempt = await SubmissionGuard.acquireGuard({
        userId: testUserId,
        applicationId: testAppId,
        packageVersion,
        formVersion,
        browserRunId: 'run_uncertain_retry',
        approvalId: 'appr_valid',
      });

      expect(retryAttempt.success).toBe(false);
      expect(retryAttempt.error).toContain('Previous submission status is UNKNOWN');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 9. RECOVERY ORCHESTRATION & LOOP PREVENTION (Sections 6, 7, 9)
  // ──────────────────────────────────────────────────────────────────────────
  describe('9. Recovery Orchestrator & Interruption Handling', () => {
    it('halts automated execution when maximum recovery attempts are exceeded', async () => {
      const driver = new MockBrowserDriver();

      const runRecord: ApplicationRunRecord = {
        id: 'run_exhausted_001',
        userId: testUserId,
        jobApplicationId: null,
        applicationPackageId: testPackageId,
        jobId: 'job_test_001',
        provider: 'GENERIC_FORM',
        status: 'RECOVERING',
        currentStep: 'RECOVERING',
        requiresUserAction: false,
        evidence: {},
        stepsTrace: [],
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        checkpointVersion: 1,
        attemptCount: 1,
        recoveryCount: DEFAULT_EXECUTION_LIMITS.maxRecoveryAttempts, // Already at max (3)
        packageVersion: 1,
      };

      const result = await RecoveryOrchestrator.recover({
        run: runRecord,
        driver,
        userId: testUserId,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('RECOVERY_EXHAUSTED');
      expect(result.run.status).toBe('FAILED');
    });

    it('rejects recovery if user ownership does not match authenticated user', async () => {
      const driver = new MockBrowserDriver();

      const runRecord: ApplicationRunRecord = {
        id: 'run_tampered_001',
        userId: 'different_user_999',
        jobApplicationId: null,
        applicationPackageId: testPackageId,
        jobId: 'job_test_001',
        provider: 'GENERIC_FORM',
        status: 'PAUSED_NEEDS_USER',
        currentStep: 'FORM_INSPECTED',
        requiresUserAction: true,
        evidence: {},
        stepsTrace: [],
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        checkpointVersion: 1,
        attemptCount: 1,
        recoveryCount: 0,
        packageVersion: 1,
      };

      expect(
        RecoveryOrchestrator.recover({
          run: runRecord,
          driver,
          userId: testUserId, // Mismatched user
        })
      ).rejects.toThrow('UNAUTHORIZED');
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 10. RUN CANCELLATION & CREDIT RESERVATION RELEASE (Section 20)
  // ──────────────────────────────────────────────────────────────────────────
  describe('10. Run Cancellation & Credit Release', () => {
    it('cancels active run, releases approvals, and transitions to CANCELLED', async () => {
      const mockRun: ApplicationRunRecord = {
        id: 'run_cancel_001',
        userId: testUserId,
        jobApplicationId: null,
        applicationPackageId: testPackageId,
        jobId: 'job_001',
        provider: 'GENERIC_FORM',
        status: 'AWAITING_APPROVAL',
        currentStep: 'AWAITING_APPROVAL',
        requiresUserAction: false,
        evidence: {},
        stepsTrace: [],
        startedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        checkpointVersion: 2,
        attemptCount: 1,
        recoveryCount: 0,
        packageVersion: 1,
        creditReservationId: 'res_credit_cancel_001',
      };

      // Register run in memory
      BrowserApplicationAgentService.setInMemoryRun(mockRun);

      const cancelledRun = await BrowserApplicationAgentService.cancelRun({
        userId: testUserId,
        runId: mockRun.id,
        reason: 'User cancelled before submitting',
      });

      expect(cancelledRun.status).toBe('CANCELLED');
      expect(cancelledRun.currentStep).toBe('CANCELLED');
      expect(cancelledRun.requiresUserAction).toBe(false);
      expect(cancelledRun.approvalId).toBeNull();
      expect(cancelledRun.errorMessage).toBe('User cancelled before submitting');
    });
  });
});
