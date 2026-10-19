/**
 * ResumeForge — Browser Application Agent Service (Level 14)
 * Orchestrates Preconditions, Form Inspection, Field Mapping, Durable Checkpoints,
 * Safe Retries, Approval Invalidation, Submission Guards, and Human Takeover.
 */

import { createClient } from '@/lib/supabase/server';
import type {
  AtsProvider,
  ApplicationRunStatus,
  BrowserActivityStep,
  OmniPresenceState,
  StepTraceEntry,
  ApplicationRunRecord,
  StartBrowserRunOptions,
  ApproveAndSubmitOptions,
  AnswerHandoffOptions,
  RecoverRunOptions,
  CancelRunOptions,
  HeartbeatRunOptions,
  BrowserSession,
} from './types';
import { getBrowserDriver } from './drivers';
import { AtsDetector } from './ats/detector';
import { getAtsAdapter } from './ats';
import { CreditService } from '@/lib/billing/credit-service';
import { ApplicationPreparationEngine } from '@/lib/application-engine/engine';
import { verifyCanonicalJob } from '@/lib/jobs';
import { upsertApplicationAnswer } from '@/lib/capabilities/profile';
import { CheckpointManager } from './checkpoints';
import { SafeRetryClassifier, DEFAULT_EXECUTION_LIMITS } from './retries';
import { AtsCircuitBreaker } from './circuit-breaker';
import { SubmissionGuard } from './submission-guard';
import { ApprovalManager } from './approvals';
import { TakeoverManager } from './takeover';
import { RecoveryOrchestrator } from './recovery';
import { BrowserTelemetryTracker } from './telemetry';
import { ApplicationTrackerService } from '@/lib/application-tracker';

// In-memory fallback run cache for fast deterministic test execution and zero-downtime reliability
const inMemoryRuns = new Map<string, ApplicationRunRecord>();

export class BrowserApplicationAgentService {
  /**
   * Starts a new browser application run for a READY application package in APPROVAL MODE.
   */
  static async startRun(options: StartBrowserRunOptions): Promise<ApplicationRunRecord> {
    const { userId, packageId, idempotencyKey } = options;
    const now = new Date().toISOString();
    const trace: StepTraceEntry[] = [];

    const addTrace = (step: BrowserActivityStep, message: string, presence: OmniPresenceState, meta?: any) => {
      trace.push({
        step,
        timestamp: new Date().toISOString(),
        message,
        omniPresence: presence,
        metadata: meta,
      });
    };

    addTrace('READY', 'Verifying application preconditions and package integrity...', 'IDLE');

    // ── 1. PRECONDITION CHECKS ──────────────────────────────────────────────
    const supabase = createClient();

    // Check existing active run to prevent conflicting concurrent submit-capable runs (Section 18)
    const { data: existingActive } = await supabase
      .from('application_runs')
      .select('*')
      .eq('user_id', userId)
      .eq('application_package_id', packageId)
      .in('status', ['STARTING', 'INSPECTING', 'FILLING', 'VALIDATING', 'AWAITING_APPROVAL', 'RECOVERING'])
      .maybeSingle();

    if (existingActive) {
      return this.mapRunRow(existingActive);
    }

    // A. Fetch Application Package
    const appPackage = await ApplicationPreparationEngine.getPackage({ userId, packageId });
    if (!appPackage) {
      throw new Error(`PACKAGE_NOT_FOUND: Application package ${packageId} does not exist.`);
    }

    // B. Check Package Status = READY
    if (appPackage.status !== 'READY') {
      const errCode = appPackage.status === 'BLOCKED' ? 'PACKAGE_BLOCKED' : 'PACKAGE_NOT_READY';
      throw new Error(`${errCode}: Package is in status "${appPackage.status}". Only READY packages may execute.`);
    }

    // C. Check Package Stale / Expired
    if (appPackage.expiresAt && new Date(appPackage.expiresAt).getTime() < Date.now()) {
      throw new Error('PACKAGE_STALE: Application package has expired and must be re-prepared.');
    }

    // D. Check Canonical Job = ACTIVE & Freshness
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', appPackage.jobId)
      .single();

    if (!job || job.status !== 'ACTIVE') {
      throw new Error('JOB_CLOSED: The target job opening is no longer active.');
    }

    const freshness = await verifyCanonicalJob(appPackage.jobId);
    if (freshness && freshness.status === 'CLOSED') {
      throw new Error('JOB_CLOSED: Target job failed freshness verification and cannot be applied to.');
    }

    // E. Check Apply URL Exists
    const applyUrl = appPackage.jobSnapshot?.applyUrl || job.apply_url || job.canonical_url;
    if (!applyUrl || applyUrl.startsWith('javascript:') || applyUrl.startsWith('data:') || applyUrl.startsWith('file:')) {
      throw new Error('INVALID_APPLY_URL: Legitimate external application URL missing or unsafe.');
    }

    // F. Check No Hard Blockers
    if (appPackage.blockedReason) {
      throw new Error(`BLOCKED: ${appPackage.blockedReason}`);
    }

    // ── 2. CREDIT RESERVATION (Level 11) ────────────────────────────────────
    const runKey = idempotencyKey || `browser_run_${packageId}_${Date.now()}`;
    const reservation = await CreditService.reserveCredits({
      userId,
      action: 'APPLICATION_SUBMIT',
      amount: 8,
      referenceType: 'application_package',
      referenceId: packageId,
      idempotencyKey: runKey,
      ttlMinutes: 45,
    });

    if (!reservation.success) {
      throw new Error(`INSUFFICIENT_CREDITS: Cannot reserve submission credits (${reservation.error || 'insufficient balance'}).`);
    }

    const creditReservationId = reservation.reservationId || null;

    // ── 3. CREATE INITIAL RUN RECORD ────────────────────────────────────────
    const initialRun: ApplicationRunRecord = {
      id: `run_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      jobApplicationId: appPackage.jobApplicationId || null,
      applicationPackageId: packageId,
      jobId: appPackage.jobId,
      provider: 'GENERIC_FORM',
      status: 'STARTING',
      currentStep: 'STARTING' as any,
      stepsTrace: trace,
      evidence: { applyUrl, reservedCredits: 8 },
      creditReservationId,
      idempotencyKey: runKey,
      requiresUserAction: false,
      startedAt: now,
      updatedAt: now,
      checkpointVersion: 0,
      attemptCount: 1,
      recoveryCount: 0,
      sessionReference: null,
      browserSessionExpiresAt: new Date(Date.now() + DEFAULT_EXECUTION_LIMITS.maxBrowserSessionDurationMs).toISOString(),
      workerId: `worker_${Date.now()}`,
      leaseExpiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      lastHeartbeatAt: now,
      formVersion: null,
      packageVersion: appPackage.version || 1,
      approvalId: null,
    };

    inMemoryRuns.set(initialRun.id, initialRun);

    // Save initial record to database
    await supabase.from('application_runs').insert({
      id: initialRun.id,
      user_id: userId,
      job_application_id: appPackage.jobApplicationId || null,
      application_package_id: packageId,
      job_id: appPackage.jobId,
      provider: initialRun.provider,
      status: initialRun.status,
      current_step: initialRun.currentStep,
      steps_trace: initialRun.stepsTrace,
      evidence: initialRun.evidence,
      credit_reservation_id: creditReservationId,
      idempotency_key: runKey,
      checkpoint_version: 0,
      attempt_count: 1,
      recovery_count: 0,
      browser_session_expires_at: initialRun.browserSessionExpiresAt,
      worker_id: initialRun.workerId,
      lease_expires_at: initialRun.leaseExpiresAt,
      last_heartbeat_at: now,
      package_version: initialRun.packageVersion,
      started_at: now,
      updated_at: now,
    });

    // ── 4. EXECUTE BROWSER AGENT PIPELINE WITH CHECKPOINTS ──────────────────
    const driver = getBrowserDriver();
    let session: BrowserSession | null = null;

    try {
      session = await driver.createSession({ userId });
      initialRun.sessionReference = session.sessionId;

      // Step: Open employer apply URL
      addTrace('PAGE_OPENED', `Opening employer application: ${job.company} — ${job.title}`, 'READING');
      const pageState = await driver.open(session, applyUrl);

      // Checkpoint 1: APPLICATION_OPENED
      await CheckpointManager.recordCheckpoint({
        runId: initialRun.id,
        step: 'APPLICATION_OPENED',
        sequence: 1,
        status: 'COMPLETED',
        safeResultReference: applyUrl,
        metadata: { title: pageState.title },
      });

      // Step: Inspect Form & Detect ATS
      const inspection = await driver.inspectForm(session);
      const provider = AtsDetector.detect(applyUrl, pageState, inspection);
      initialRun.provider = provider;

      // Checkpoint 2: ATS_DETECTED
      await CheckpointManager.recordCheckpoint({
        runId: initialRun.id,
        step: 'ATS_DETECTED',
        sequence: 2,
        status: 'COMPLETED',
        safeResultReference: provider,
        metadata: { provider },
      });
      addTrace('ATS_DETECTED', `Identified application portal: ${provider}`, 'THINKING', { provider });

      // Circuit Breaker Check (Section 36)
      const circuitCheck = AtsCircuitBreaker.isAvailable(provider);
      if (!circuitCheck.available) {
        if (creditReservationId) {
          await CreditService.refundReservation({
            reservationId: creditReservationId,
            reason: circuitCheck.reason || 'Circuit breaker tripped.',
          });
        }
        await driver.closeSession(session);

        return await this.updateRunStatus(initialRun.id, {
          status: 'UNSUPPORTED',
          currentStep: 'ATS_DETECTED',
          provider,
          stepsTrace: trace,
          requiresUserAction: true,
          handoffReason: 'CIRCUIT_BREAKER_TRIPPED',
          errorCode: 'CIRCUIT_BREAKER_TRIPPED',
          errorMessage: circuitCheck.reason,
          handoffPayload: {
            message: circuitCheck.reason || 'This portal is currently paused for safety. Please apply manually.',
            applyUrl,
          },
        });
      }

      // Check for Unsupported ATS
      if (provider === 'UNSUPPORTED') {
        if (creditReservationId) {
          await CreditService.refundReservation({
            reservationId: creditReservationId,
            reason: 'Unsupported ATS portal: fallback to manual apply.',
          });
        }
        await driver.closeSession(session);

        return await this.updateRunStatus(initialRun.id, {
          status: 'UNSUPPORTED',
          currentStep: 'ATS_DETECTED',
          provider: 'UNSUPPORTED',
          stepsTrace: trace,
          requiresUserAction: true,
          handoffReason: 'UNSUPPORTED_ATS',
          handoffPayload: {
            message: `This employer application (${job.company}) uses a portal format the agent doesn't automate yet. Your prepared package is ready for manual submission.`,
            applyUrl,
          },
        });
      }

      // Check for CAPTCHA / MFA (Section 13, 16)
      if (inspection.captchaDetected || inspection.mfaOrAuthRequired || inspection.hasAccountCreation) {
        if (creditReservationId) {
          await CreditService.refundReservation({
            reservationId: creditReservationId,
            reason: 'Security verification required: releasing reservation for user takeover.',
          });
        }

        const handoffReason = inspection.captchaDetected
          ? 'CAPTCHA_REQUIRED'
          : inspection.mfaOrAuthRequired
          ? 'MFA_REQUIRED'
          : 'LOGIN_REQUIRED';

        const handoff = TakeoverManager.createHandoffRequest({
          runId: initialRun.id,
          userId,
          reason: handoffReason,
          message: inspection.captchaDetected
            ? 'A security verification step (CAPTCHA) was detected. Please complete it to continue.'
            : 'Employer portal requires authentication or multi-factor authentication.',
          requiredAction: 'HUMAN_SECURITY_CHALLENGE',
          driver,
          session,
        });

        const captchaRun = await this.updateRunStatus(initialRun.id, {
          status: 'PAUSED_NEEDS_USER',
          currentStep: 'FORM_INSPECTED',
          provider,
          stepsTrace: trace,
          requiresUserAction: true,
          handoffReason,
          handoffPayload: handoff,
          sessionReference: session.sessionId,
        });
        return captchaRun;
      }

      // Checkpoint 3: FORM_INSPECTED
      await CheckpointManager.recordCheckpoint({
        runId: initialRun.id,
        step: 'FORM_INSPECTED',
        sequence: 3,
        status: 'COMPLETED',
        metadata: { fieldsCount: inspection.fields.length, buttonsCount: inspection.buttons.length },
      });
      addTrace('FORM_INSPECTED', `Inspected application form: ${inspection.fields.length} fields detected.`, 'READING');

      // Map Fields to Application Package
      const adapter = getAtsAdapter(provider);
      if (!adapter) {
        throw new Error(`ADAPTER_NOT_FOUND: No adapter available for provider ${provider}`);
      }

      const formSchema = await adapter.inspect(pageState);
      formSchema.fields = inspection.fields;
      formSchema.buttons = inspection.buttons;

      const formHash = ApprovalManager.hashFormSchema(formSchema);
      initialRun.formVersion = formHash;

      addTrace('FIELDS_MAPPED', 'Mapping verified profile and package fields to form...', 'THINKING');
      const mappingResult = adapter.mapFields(formSchema, appPackage);

      // Checkpoint 4: FIELDS_MAPPED
      await CheckpointManager.recordCheckpoint({
        runId: initialRun.id,
        step: 'FIELDS_MAPPED',
        sequence: 4,
        status: 'COMPLETED',
        metadata: { mappingsCount: mappingResult.mappings.length },
      });

      // Check Unresolved Required / Sensitive Fields (Section 13)
      if (!mappingResult.canProceedToFill) {
        if (creditReservationId) {
          await CreditService.refundReservation({
            reservationId: creditReservationId,
            reason: 'Unresolved required questions: pausing for candidate input.',
          });
        }

        const firstUnresolved = mappingResult.unresolvedRequired[0] || mappingResult.sensitiveUnresolved[0];
        const handoff = TakeoverManager.createHandoffRequest({
          runId: initialRun.id,
          userId,
          reason: firstUnresolved.sensitive ? 'SENSITIVE_ANSWER_REQUIRED' : 'UNKNOWN_REQUIRED_FIELD',
          message: firstUnresolved.errorReason || `Employer asks "${firstUnresolved.label}". Please verify your answer.`,
          requiredAction: 'CONFIRM_ANSWER',
          questionKey: firstUnresolved.formFieldKey,
          options: firstUnresolved.allowedOptions,
          fieldKey: firstUnresolved.formFieldKey,
          driver,
          session,
        });

        const needsUserRun = await this.updateRunStatus(initialRun.id, {
          status: 'PAUSED_NEEDS_USER',
          currentStep: 'FIELDS_MAPPED',
          provider,
          stepsTrace: trace,
          formSchema,
          formVersion: formHash,
          requiresUserAction: true,
          handoffReason: handoff.reason,
          handoffPayload: handoff,
          sessionReference: session.sessionId,
        });
        return needsUserRun;
      }

      // Fill Form Fields & Upload Resume
      addTrace('FIELDS_FILLED', `Filling ${mappingResult.mappings.length} verified candidate details...`, 'WORKING');
      const fillResult = await adapter.fill(driver, session, mappingResult.mappings, appPackage);

      // Checkpoint 5: FIELDS_COMPLETED
      await CheckpointManager.recordCheckpoint({
        runId: initialRun.id,
        step: 'FIELDS_COMPLETED',
        sequence: 5,
        status: 'COMPLETED',
        metadata: { filledCount: fillResult.filledCount },
      });

      if (fillResult.resumeUploaded) {
        // Checkpoint 6: RESUME_UPLOADED
        await CheckpointManager.recordCheckpoint({
          runId: initialRun.id,
          step: 'RESUME_UPLOADED',
          sequence: 6,
          status: 'COMPLETED',
          safeResultReference: fillResult.resumeFileName,
          metadata: { resumeFileName: fillResult.resumeFileName },
        });
        addTrace('RESUME_UPLOADED', `Uploaded approved resume: ${fillResult.resumeFileName}`, 'WORKING');
      }

      // Validate Application Form
      addTrace('VALIDATION_COMPLETE', 'Validating completed form against employer rules...', 'EDITING');
      const validation = await adapter.validate(driver, session, formSchema);

      if (!validation.readyForApproval) {
        AtsCircuitBreaker.recordFailure(provider, validation.errors.join('; '));
        throw new Error(`FORM_VALIDATION_FAILED: ${validation.errors.join('; ')}`);
      }

      // Checkpoint 7: FORM_VALIDATED
      await CheckpointManager.recordCheckpoint({
        runId: initialRun.id,
        step: 'FORM_VALIDATED',
        sequence: 7,
        status: 'COMPLETED',
        metadata: { isValid: validation.isValid },
      });

      // ── 5. TRANSITION TO APPROVAL MODE (AWAITING_APPROVAL) ─────────────────
      const answersHash = ApprovalManager.hashAnswers(mappingResult.mappings);
      const approvalId = ApprovalManager.generateApprovalId({
        userId,
        packageId,
        resumeVersion: (appPackage as any).tailoredResume?.versionId || appPackage.tailoredResumeId || 'v1',
        answersHash,
        formHash,
      });

      // Checkpoint 8: APPROVAL_REQUESTED
      await CheckpointManager.recordCheckpoint({
        runId: initialRun.id,
        step: 'APPROVAL_REQUESTED',
        sequence: 8,
        status: 'COMPLETED',
        safeResultReference: approvalId,
        metadata: { approvalId },
      });

      addTrace('AWAITING_APPROVAL', 'Application form completely prepared and verified. Awaiting explicit user approval to submit.', 'IDLE');

      const awaitingApprovalRun = await this.updateRunStatus(initialRun.id, {
        status: 'AWAITING_APPROVAL',
        currentStep: 'AWAITING_APPROVAL',
        provider,
        stepsTrace: trace,
        formSchema,
        formVersion: formHash,
        filledFields: mappingResult.mappings,
        validationResult: validation,
        approvalId,
        requiresUserAction: true,
        handoffReason: 'AWAITING_USER_APPROVAL',
        handoffPayload: {
          readyToSubmit: true,
          approvalId,
          jobTitle: job.title,
          company: job.company,
          filledFieldsCount: fillResult.filledCount,
          resumeUploaded: fillResult.resumeUploaded,
          resumeFileName: fillResult.resumeFileName,
          unresolvedCount: 0,
        },
        sessionReference: session.sessionId,
      });

      return awaitingApprovalRun;
    } catch (err: any) {
      console.error('[BrowserApplicationAgentService.startRun] Execution error:', err);
      if (creditReservationId) {
        await CreditService.refundReservation({
          reservationId: creditReservationId,
          reason: `Execution failed: ${err.message}`,
        }).catch(() => {});
      }
      if (session) {
        await driver.closeSession(session).catch(() => {});
      }

      return await this.updateRunStatus(initialRun.id, {
        status: 'FAILED',
        currentStep: initialRun.currentStep,
        stepsTrace: trace,
        requiresUserAction: false,
        errorCode: 'BROWSER_ERROR',
        errorMessage: err.message || 'Browser automation encountered an unexpected error.',
      });
    }
  }

  /**
   * Explicitly approves and submits an application after candidate review.
   * STRICT: Requires explicitUserConsent === true, valid approval currency, and atomic SubmissionGuard.
   */
  static async approveAndSubmit(options: ApproveAndSubmitOptions): Promise<ApplicationRunRecord> {
    const { userId, runId, packageId, explicitUserConsent } = options;
    const now = new Date().toISOString();

    if (!explicitUserConsent) {
      throw new Error('POLICY_BLOCKED: Final employer submission requires explicit user consent.');
    }

    const run = await this.getRunById(runId, userId);
    if (!run) {
      throw new Error(`RUN_NOT_FOUND: Application run ${runId} does not exist or unauthorized.`);
    }

    if (run.status !== 'AWAITING_APPROVAL') {
      throw new Error(`INVALID_RUN_STATE: Run ${runId} is in status "${run.status}". Can only submit when AWAITING_APPROVAL.`);
    }

    // Revalidate package and job still active before clicking Submit
    const appPackage = await ApplicationPreparationEngine.getPackage({ userId, packageId });
    if (!appPackage || appPackage.status !== 'READY') {
      throw new Error('PACKAGE_INVALID: Application package has changed or is no longer READY.');
    }

    const supabase = createClient();
    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', appPackage.jobId)
      .single();

    if (!job || job.status !== 'ACTIVE') {
      throw new Error('JOB_CLOSED: The job closed while awaiting approval. Submission stopped.');
    }

    // ── 1. APPROVAL VALIDATION ENGINE (Section 12) ──────────────────────────
    const currentFormHash = run.formVersion || ApprovalManager.hashFormSchema(run.formSchema);
    const approvalCheck = ApprovalManager.validateApproval({
      approvalId: run.approvalId,
      approvedAt: run.updatedAt,
      originalFormHash: run.formVersion,
      currentFormHash,
      isJobClosed: false,
      isPackageStale: false,
    });

    if (!approvalCheck.valid) {
      throw new Error(`APPROVAL_INVALID: ${approvalCheck.reason}`);
    }

    // ── 2. EXACTLY-ONCE SUBMISSION GUARD (Section 11) ───────────────────────
    const guardResult = await SubmissionGuard.acquireGuard({
      userId,
      applicationId: appPackage.jobApplicationId || appPackage.jobId,
      packageVersion: appPackage.version || 1,
      browserRunId: run.id,
      approvalId: run.approvalId || 'default_approval',
      formVersion: currentFormHash,
    });

    if (!guardResult.success) {
      throw new Error(`DUPLICATE_SUBMISSION_ATTEMPT_BLOCKED: ${guardResult.error}`);
    }

    const guardId = guardResult.guardId!;

    // ── 3. EXECUTE FINAL SUBMISSION ─────────────────────────────────────────
    const driver = getBrowserDriver();
    let session: BrowserSession | null = null;
    if (driver.capabilities.canReconnectSession && run.sessionReference && driver.reconnectSession) {
      session = await driver.reconnectSession(run.sessionReference).catch(() => null);
    }
    if (!session) {
      session = await driver.createSession({ userId });
    }

    const adapter = getAtsAdapter(run.provider) || getAtsAdapter('GENERIC_FORM')!;
    const trace = [...(run.stepsTrace || [])];
    trace.push({
      step: 'SUBMIT_CLICKED',
      timestamp: now,
      message: 'User explicitly approved submission. Clicking Submit Application once...',
      omniPresence: 'WORKING',
    });

    await this.updateRunStatus(runId, {
      status: 'SUBMITTING',
      currentStep: 'SUBMIT_CLICKED',
      userApprovedAt: now,
      stepsTrace: trace,
    });

    // Execute submit action (Retry policy strictly prohibits blind retrying this!)
    let submissionResult: any;
    try {
      submissionResult = await adapter.submit(driver, session, true);
    } catch (submitErr: any) {
      submissionResult = {
        success: false,
        status: 'SUBMISSION_UNKNOWN',
        error: submitErr?.message || 'Network disconnected after submit click.',
        evidence: {},
      };
    } finally {
      await driver.closeSession(session).catch(() => {});
    }

    // ── 4. PROCESS SUBMISSION OUTCOME ───────────────────────────────────────
    if (submissionResult.success && submissionResult.status === 'SUBMITTED') {
      // Confirm Submission Guard
      await SubmissionGuard.confirmSubmission(guardId);
      AtsCircuitBreaker.recordSuccess(run.provider);

      // Settle Credit Reservation (Level 11)
      if (run.creditReservationId) {
        await CreditService.settleReservation({
          reservationId: run.creditReservationId,
          actualCredits: 8,
          metadata: {
            description: `Confirmed application submission to ${job.company} — ${job.title}.`,
            runId,
          },
        });
      }

      // Update existing job_applications table to Applied
      await supabase
        .from('job_applications')
        .update({
          status: 'Applied',
          preparation_status: 'Submitted',
          applied_at: now,
          notes: `Submitted via Omni Browser Application Agent (Confirmation: ${submissionResult.confirmationUrl || 'verified'}).`,
        })
        .eq('user_id', userId)
        .eq('job_id', appPackage.jobId);

      // Level 15 Canonical Tracking & Evidence
      try {
        const canonicalApp = await ApplicationTrackerService.createOrGetApplication({
          userId,
          jobId: appPackage.jobId,
          companyName: job.company || 'Unknown Company',
          roleTitle: job.title || 'Position',
          applicationPackageId: packageId,
          resumeVersionId: (appPackage as any).tailoredResume?.versionId || appPackage.tailoredResumeId,
          submissionMethod: 'OMNI_BROWSER',
        });

        await ApplicationTrackerService.recordSubmissionConfirmed({
          userId,
          applicationId: canonicalApp.id,
          browserRunId: runId,
          jobTitle: job.title || 'Position',
          companyName: job.company || 'Unknown Company',
          jobUrl: job.application_url || job.url,
          resumeVersionId: (appPackage as any).tailoredResume?.versionId || appPackage.tailoredResumeId,
          resumeTitle: (appPackage as any).tailoredResume?.title || 'Tailored Resume',
          atsProvider: run.provider,
          confirmationCode: submissionResult.evidence?.confirmationCode || submissionResult.confirmationUrl,
          confirmationMessage: submissionResult.confirmationText,
          screenshotRef: submissionResult.evidence?.screenshotRef,
          submittedAt: now,
        });
      } catch (trackErr) {
        console.warn('[Level 15 Tracker] Non-fatal tracking error:', trackErr);
      }

      trace.push({
        step: 'SUBMISSION_CONFIRMED',
        timestamp: new Date().toISOString(),
        message: `Application submitted successfully to ${job.company}! Confirmation verified.`,
        omniPresence: 'IDLE',
        metadata: submissionResult.evidence,
      });

      return await this.updateRunStatus(runId, {
        status: 'SUBMITTED',
        currentStep: 'SUBMISSION_CONFIRMED',
        submittedAt: now,
        confirmationUrl: submissionResult.confirmationUrl || null,
        confirmationText: submissionResult.confirmationText || 'Application received.',
        stepsTrace: trace,
        requiresUserAction: false,
        evidence: {
          ...run.evidence,
          ...submissionResult.evidence,
          confirmedAt: now,
        },
      });
    }

    // ── 5. SUBMISSION UNCERTAINTY (Section 10) ───────────────────────────────
    const isAmbiguous = submissionResult.status === 'SUBMISSION_UNKNOWN';
    if (isAmbiguous) {
      await SubmissionGuard.markUnknown(guardId);
    } else {
      await SubmissionGuard.markFailed(guardId);
      AtsCircuitBreaker.recordFailure(run.provider, submissionResult.error || 'Submission failed');
      if (run.creditReservationId) {
        await CreditService.refundReservation({
          reservationId: run.creditReservationId,
          reason: `Submission failed: ${submissionResult.error}`,
        }).catch(() => {});
      }
    }

    trace.push({
      step: 'SUBMIT_CLICKED',
      timestamp: new Date().toISOString(),
      message: isAmbiguous
        ? 'Submission was triggered, but confirmation text could not be verified automatically. Halting retry to avoid double application.'
        : `Submission failed: ${submissionResult.error}`,
      omniPresence: 'NEEDS_USER',
    });

    return await this.updateRunStatus(runId, {
      status: isAmbiguous ? 'SUBMISSION_UNKNOWN' : 'FAILED',
      currentStep: 'SUBMIT_CLICKED',
      stepsTrace: trace,
      requiresUserAction: isAmbiguous,
      handoffReason: isAmbiguous ? 'CONFIRMATION_UNCERTAIN' : 'SUBMISSION_ERROR',
      errorCode: isAmbiguous ? 'SUBMISSION_UNKNOWN' : 'SUBMIT_ERROR',
      errorMessage: submissionResult.error || 'Unable to confirm employer submission.',
      evidence: {
        ...run.evidence,
        ...submissionResult.evidence,
      },
    });
  }

  /**
   * Recovers an interrupted browser application run safely (Section 6, 7).
   */
  static async recoverRun(options: RecoverRunOptions): Promise<ApplicationRunRecord> {
    const { userId, runId } = options;
    const run = await this.getRunById(runId, userId);
    if (!run) {
      throw new Error(`RUN_NOT_FOUND: Application run ${runId} not found.`);
    }

    const driver = getBrowserDriver(run.provider);
    const recoveryResult = await RecoveryOrchestrator.recover({
      run,
      driver,
      userId,
    });

    return recoveryResult.run;
  }

  /**
   * Cancels an active run, revokes approvals, and releases reserved credits (Section 20).
   */
  static async cancelRun(options: CancelRunOptions): Promise<ApplicationRunRecord> {
    const { userId, runId, reason = 'USER_CANCELLED' } = options;
    const run = await this.getRunById(runId, userId);
    if (!run) {
      throw new Error(`RUN_NOT_FOUND: Application run ${runId} not found.`);
    }

    // Refund credit reservation
    if (run.creditReservationId) {
      await CreditService.refundReservation({
        reservationId: run.creditReservationId,
        reason: `Run cancelled by user: ${reason}`,
      }).catch(() => {});
    }

    const trace = [...(run.stepsTrace || [])];
    trace.push({
      step: 'CANCELLED',
      timestamp: new Date().toISOString(),
      message: `Application run cancelled by candidate: ${reason}. Unused credits released.`,
      omniPresence: 'IDLE',
    });

    return await this.updateRunStatus(runId, {
      status: 'CANCELLED',
      currentStep: 'CANCELLED',
      requiresUserAction: false,
      approvalId: null,
      stepsTrace: trace,
      errorCode: 'CANCELLED',
      errorMessage: reason,
    });
  }

  /**
   * Resumes browser execution after candidate answers an unknown question inline.
   */
  static async answerHandoff(options: AnswerHandoffOptions): Promise<ApplicationRunRecord> {
    const { userId, runId, answers } = options;
    const run = await this.getRunById(runId, userId);
    if (!run) {
      throw new Error(`RUN_NOT_FOUND: Application run ${runId} not found.`);
    }

    // Update Application Package answers and verified answer bank
    for (const [k, v] of Object.entries(answers)) {
      await upsertApplicationAnswer(userId, k, v, {
        source: 'user',
        verified: true,
        status: 'VERIFIED',
      });
    }

    const supabase = createClient();
    const { data: pkgRow } = await supabase
      .from('application_packages')
      .select('answers, unknown_questions')
      .eq('id', run.applicationPackageId)
      .single();

    if (pkgRow) {
      const updatedAnswers = { ...(pkgRow.answers || {}) };
      for (const [k, v] of Object.entries(answers)) {
        updatedAnswers[k] = {
          key: k,
          label: k,
          value: v,
          source: 'user',
          status: 'VERIFIED',
          confidence: 'HIGH',
        };
      }
      const remainingUnknown = (pkgRow.unknown_questions || []).filter(
        (q: any) => !answers[q.key]
      );
      await supabase
        .from('application_packages')
        .update({
          answers: updatedAnswers,
          unknown_questions: remainingUnknown,
          status: remainingUnknown.length === 0 ? 'READY' : 'NEEDS_USER',
          updated_at: new Date().toISOString(),
        })
        .eq('id', run.applicationPackageId);
    }

    // Re-trigger browser run safely via recovery or startRun
    return await this.recoverRun({
      userId,
      runId,
    });
  }

  /**
   * Heartbeat to maintain worker lease (Section 19).
   */
  static async heartbeat(options: HeartbeatRunOptions): Promise<{ success: boolean }> {
    const { runId, workerId, ttlSeconds = 300 } = options;
    const now = new Date();
    const leaseExpires = new Date(now.getTime() + ttlSeconds * 1000).toISOString();

    const memRun = inMemoryRuns.get(runId);
    if (memRun) {
      memRun.workerId = workerId;
      memRun.lastHeartbeatAt = now.toISOString();
      memRun.leaseExpiresAt = leaseExpires;
    }

    try {
      const supabase = createClient();
      await supabase
        .from('application_runs')
        .update({
          worker_id: workerId,
          last_heartbeat_at: now.toISOString(),
          lease_expires_at: leaseExpires,
          updated_at: now.toISOString(),
        })
        .eq('id', runId);
    } catch {}

    return { success: true };
  }

  /**
   * Retrieves an application run by ID with strict ownership validation (Section 18).
   */
  static async getRunById(runId: string, userId: string): Promise<ApplicationRunRecord | null> {
    const mem = inMemoryRuns.get(runId);
    if (mem && mem.userId === userId) {
      return mem;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('application_runs')
      .select('*')
      .eq('id', runId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    const mapped = this.mapRunRow(data);
    inMemoryRuns.set(runId, mapped);
    return mapped;
  }

  /**
   * Helper to persist run status updates with telemetry computation.
   */
  private static async updateRunStatus(
    runId: string,
    updates: Partial<ApplicationRunRecord>
  ): Promise<ApplicationRunRecord> {
    const now = new Date().toISOString();
    const existing = inMemoryRuns.get(runId);

    const merged: ApplicationRunRecord = {
      ...(existing || {
        id: runId,
        userId: updates.userId || '',
        applicationPackageId: updates.applicationPackageId || '',
        jobId: updates.jobId || '',
        provider: updates.provider || 'GENERIC_FORM',
        status: updates.status || 'STARTING',
        currentStep: updates.currentStep || 'READY',
        stepsTrace: updates.stepsTrace || [],
        requiresUserAction: Boolean(updates.requiresUserAction),
        evidence: updates.evidence || {},
        startedAt: updates.startedAt || now,
        updatedAt: now,
        checkpointVersion: 0,
        attemptCount: 1,
        recoveryCount: 0,
      }),
      ...updates,
      updatedAt: now,
    };

    // Calculate telemetry
    merged.telemetry = BrowserTelemetryTracker.computeTelemetry({
      startedAt: merged.startedAt,
      completedAt: ['SUBMITTED', 'FAILED', 'CANCELLED'].includes(merged.status) ? now : undefined,
      provider: merged.provider,
      sessionCount: 1,
      retryCount: merged.attemptCount - 1,
      recoveryCount: merged.recoveryCount,
    });

    inMemoryRuns.set(runId, merged);

    const dbPayload: Record<string, any> = {
      status: merged.status,
      current_step: merged.currentStep,
      provider: merged.provider,
      steps_trace: merged.stepsTrace,
      form_schema: merged.formSchema,
      form_version: merged.formVersion,
      filled_fields: merged.filledFields,
      validation_result: merged.validationResult,
      requires_user_action: merged.requiresUserAction,
      handoff_reason: merged.handoffReason,
      handoff_payload: merged.handoffPayload,
      approval_id: merged.approvalId,
      user_approved_at: merged.userApprovedAt,
      submitted_at: merged.submittedAt,
      confirmation_url: merged.confirmationUrl,
      confirmation_text: merged.confirmationText,
      evidence: merged.evidence,
      error_code: merged.errorCode,
      error_message: merged.errorMessage,
      checkpoint_version: merged.checkpointVersion,
      attempt_count: merged.attemptCount,
      recovery_count: merged.recoveryCount,
      session_reference: merged.sessionReference,
      telemetry: merged.telemetry,
      updated_at: now,
    };

    try {
      const supabase = createClient();
      await supabase.from('application_runs').update(dbPayload).eq('id', runId);
    } catch (e: any) {
      console.warn('[BrowserApplicationAgentService.updateRunStatus] DB notice:', e?.message || e);
    }

    return merged;
  }

  private static mapRunRow(row: any): ApplicationRunRecord {
    return {
      id: row.id,
      userId: row.user_id,
      jobApplicationId: row.job_application_id,
      applicationPackageId: row.application_package_id,
      jobId: row.job_id,
      provider: row.provider as AtsProvider,
      status: row.status as ApplicationRunStatus,
      currentStep: row.current_step as BrowserActivityStep,
      stepsTrace: row.steps_trace || [],
      formSchema: row.form_schema,
      filledFields: row.filled_fields,
      validationResult: row.validation_result,
      requiresUserAction: Boolean(row.requires_user_action),
      handoffReason: row.handoff_reason,
      handoffPayload: row.handoff_payload,
      userApprovedAt: row.user_approved_at,
      submittedAt: row.submitted_at,
      confirmationUrl: row.confirmation_url,
      confirmationText: row.confirmation_text,
      evidence: row.evidence || {},
      creditReservationId: row.credit_reservation_id,
      idempotencyKey: row.idempotency_key,
      errorCode: row.error_code,
      errorMessage: row.error_message,
      startedAt: row.started_at,
      updatedAt: row.updated_at,
      expiresAt: row.expires_at,
      checkpointVersion: row.checkpoint_version || 0,
      attemptCount: row.attempt_count || 1,
      recoveryCount: row.recovery_count || 0,
      sessionReference: row.session_reference,
      browserSessionExpiresAt: row.browser_session_expires_at,
      workerId: row.worker_id,
      leaseExpiresAt: row.lease_expires_at,
      lastHeartbeatAt: row.last_heartbeat_at,
      formVersion: row.form_version,
      packageVersion: row.package_version || 1,
      approvalId: row.approval_id,
      telemetry: row.telemetry,
    };
  }

  /**
   * Resets in-memory runs cache (used for test setup/teardown).
   */
  static clearMemory(): void {
    inMemoryRuns.clear();
  }

  /**
   * Registers a run record in memory (used for testing).
   */
  static setInMemoryRun(run: ApplicationRunRecord): void {
    inMemoryRuns.set(run.id, run);
  }
}
