/**
 * ResumeForge — Browser Application Agent Service (Level 13)
 * Orchestrates Preconditions, Form Inspection, Field Mapping, Approval Mode & Safe Submission.
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
  BrowserSession,
} from './types';
import { getBrowserDriver } from './drivers';
import { AtsDetector } from './ats/detector';
import { getAtsAdapter } from './ats';
import { CreditService } from '@/lib/billing/credit-service';
import { ApplicationPreparationEngine } from '@/lib/application-engine/engine';
import type { ApplicationPackage } from '@/lib/application-engine/types';
import { verifyCanonicalJob } from '@/lib/jobs';
import { upsertApplicationAnswer } from '@/lib/capabilities/profile';

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

    // Check existing active run to ensure single concurrent run per application
    const { data: existingActive } = await supabase
      .from('application_runs')
      .select('*')
      .eq('user_id', userId)
      .eq('application_package_id', packageId)
      .in('status', ['STARTING', 'INSPECTING', 'FILLING', 'VALIDATING', 'AWAITING_APPROVAL'])
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
    // APPLICATION_SUBMIT = 8 credits.
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
    };

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
      started_at: now,
      updated_at: now,
    });

    // ── 4. EXECUTE BROWSER AGENT PIPELINE ────────────────────────────────────
    const driver = getBrowserDriver();
    let session: BrowserSession | null = null;

    try {
      session = await driver.createSession({ userId });

      // Step: Open employer apply URL
      addTrace('PAGE_OPENED', `Opening employer application: ${job.company} — ${job.title}`, 'READING');
      const pageState = await driver.open(session, applyUrl);

      // Step: Inspect Form & Detect ATS
      const inspection = await driver.inspectForm(session);
      const provider = AtsDetector.detect(applyUrl, pageState, inspection);
      initialRun.provider = provider;
      addTrace('ATS_DETECTED', `Identified application portal: ${provider}`, 'THINKING', { provider });

      // 4A. Check for Unsupported ATS
      if (provider === 'UNSUPPORTED') {
        if (creditReservationId) {
          await CreditService.refundReservation({
            reservationId: creditReservationId,
            reason: 'Unsupported ATS portal: fallback to manual apply.',
          });
        }
        await driver.closeSession(session);

        const unsupportedRun = await this.updateRunStatus(initialRun.id, {
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
        return unsupportedRun;
      }

      // 4B. Check for CAPTCHA
      if (inspection.captchaDetected) {
        if (creditReservationId) {
          await CreditService.refundReservation({
            reservationId: creditReservationId,
            reason: 'CAPTCHA encountered: releasing reservation for user takeover.',
          });
        }
        await driver.closeSession(session);

        const captchaRun = await this.updateRunStatus(initialRun.id, {
          status: 'NEEDS_USER',
          currentStep: 'FORM_INSPECTED',
          provider,
          stepsTrace: trace,
          requiresUserAction: true,
          handoffReason: 'CAPTCHA',
          handoffPayload: {
            reason: 'CAPTCHA_REQUIRED',
            message: 'A security verification step (CAPTCHA) was detected. Please complete it to continue.',
            currentUrl: applyUrl,
          },
        });
        return captchaRun;
      }

      // 4C. Check for MFA / Authentication / Account Creation Required
      if (inspection.mfaOrAuthRequired || inspection.hasAccountCreation) {
        if (creditReservationId) {
          await CreditService.refundReservation({
            reservationId: creditReservationId,
            reason: 'Authentication required: releasing reservation.',
          });
        }
        await driver.closeSession(session);

        const authRun = await this.updateRunStatus(initialRun.id, {
          status: 'NEEDS_USER',
          currentStep: 'FORM_INSPECTED',
          provider,
          stepsTrace: trace,
          requiresUserAction: true,
          handoffReason: 'AUTHENTICATION_REQUIRED',
          handoffPayload: {
            reason: 'AUTH_REQUIRED',
            message: 'Employer portal requires account login or multi-factor authentication.',
            currentUrl: applyUrl,
          },
        });
        return authRun;
      }

      addTrace('FORM_INSPECTED', `Inspected application form: ${inspection.fields.length} fields detected.`, 'READING');

      // 4D. Map Fields to Application Package
      const adapter = getAtsAdapter(provider);
      if (!adapter) {
        throw new Error(`ADAPTER_NOT_FOUND: No adapter available for provider ${provider}`);
      }

      const formSchema = await adapter.inspect(pageState);
      formSchema.fields = inspection.fields;
      formSchema.buttons = inspection.buttons;

      addTrace('FIELDS_MAPPED', 'Mapping verified profile and package fields to form...', 'THINKING');
      const mappingResult = adapter.mapFields(formSchema, appPackage);

      // 4E. Check Unresolved Required / Sensitive Fields
      if (!mappingResult.canProceedToFill) {
        if (creditReservationId) {
          await CreditService.refundReservation({
            reservationId: creditReservationId,
            reason: 'Unresolved required questions: pausing for candidate input.',
          });
        }
        await driver.closeSession(session);

        const firstUnresolved = mappingResult.unresolvedRequired[0] || mappingResult.sensitiveUnresolved[0];
        const needsUserRun = await this.updateRunStatus(initialRun.id, {
          status: 'NEEDS_USER',
          currentStep: 'FIELDS_MAPPED',
          provider,
          stepsTrace: trace,
          formSchema,
          requiresUserAction: true,
          handoffReason: firstUnresolved.sensitive ? 'SENSITIVE_ANSWER_REQUIRED' : 'UNKNOWN_REQUIRED_FIELD',
          handoffPayload: {
            question: firstUnresolved.label,
            fieldKey: firstUnresolved.formFieldKey,
            options: firstUnresolved.allowedOptions || ['Yes', 'No'],
            reason: firstUnresolved.errorReason || `Employer asks "${firstUnresolved.label}". Please verify your answer.`,
            unresolvedCount: mappingResult.unresolvedRequired.length + mappingResult.sensitiveUnresolved.length,
          },
        });
        return needsUserRun;
      }

      // 4F. Fill Form Fields & Upload Resume
      addTrace('FIELDS_FILLED', `Filling ${mappingResult.mappings.length} verified candidate details...`, 'WORKING');
      const fillResult = await adapter.fill(driver, session, mappingResult.mappings, appPackage);

      if (fillResult.resumeUploaded) {
        addTrace('RESUME_UPLOADED', `Uploaded approved resume: ${fillResult.resumeFileName}`, 'WORKING');
      }

      // 4G. Validate Application Form
      addTrace('VALIDATION_COMPLETE', 'Validating completed form against employer rules...', 'EDITING');
      const validation = await adapter.validate(driver, session, formSchema);

      if (!validation.readyForApproval) {
        throw new Error(`FORM_VALIDATION_FAILED: ${validation.errors.join('; ')}`);
      }

      // ── 5. TRANSITION TO APPROVAL MODE (AWAITING_APPROVAL) ─────────────────
      // THE AGENT MUST NOT CLICK FINAL SUBMIT IN V1 UNTIL EXPLICIT USER APPROVAL!
      addTrace('AWAITING_APPROVAL', 'Application form completely prepared and verified. Awaiting explicit user approval to submit.', 'IDLE');

      const awaitingApprovalRun = await this.updateRunStatus(initialRun.id, {
        status: 'AWAITING_APPROVAL',
        currentStep: 'AWAITING_APPROVAL',
        provider,
        stepsTrace: trace,
        formSchema,
        filledFields: mappingResult.mappings,
        validationResult: validation,
        requiresUserAction: true,
        handoffReason: 'AWAITING_USER_APPROVAL',
        handoffPayload: {
          readyToSubmit: true,
          jobTitle: job.title,
          company: job.company,
          filledFieldsCount: fillResult.filledCount,
          resumeUploaded: fillResult.resumeUploaded,
          resumeFileName: fillResult.resumeFileName,
          unresolvedCount: 0,
        },
      });

      // Keep session reference or close gracefully (in V1 mock/ephemeral session stays recorded)
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
   * STRICT: Requires explicitUserConsent === true and valid existing AWAITING_APPROVAL run.
   */
  static async approveAndSubmit(options: ApproveAndSubmitOptions): Promise<ApplicationRunRecord> {
    const { userId, runId, packageId, explicitUserConsent } = options;
    const now = new Date().toISOString();

    if (!explicitUserConsent) {
      throw new Error('POLICY_BLOCKED: Final employer submission requires explicit user consent.');
    }

    const supabase = createClient();
    const { data: runRow, error } = await supabase
      .from('application_runs')
      .select('*')
      .eq('id', runId)
      .eq('user_id', userId)
      .single();

    if (error || !runRow) {
      throw new Error(`RUN_NOT_FOUND: Application run ${runId} does not exist or unauthorized.`);
    }

    if (runRow.status !== 'AWAITING_APPROVAL') {
      throw new Error(`INVALID_RUN_STATE: Run ${runId} is in status "${runRow.status}". Can only submit when AWAITING_APPROVAL.`);
    }

    // Revalidate package and job still active before clicking Submit
    const appPackage = await ApplicationPreparationEngine.getPackage({ userId, packageId });
    if (!appPackage || appPackage.status !== 'READY') {
      throw new Error('PACKAGE_INVALID: Application package has changed or is no longer READY.');
    }

    const { data: job } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', appPackage.jobId)
      .single();

    if (!job || job.status !== 'ACTIVE') {
      throw new Error('JOB_CLOSED: The job closed while awaiting approval. Submission stopped.');
    }

    // Transition to SUBMITTING
    const driver = getBrowserDriver();
    const session = await driver.createSession({ userId });
    const adapter = getAtsAdapter(runRow.provider as AtsProvider) || getAtsAdapter('GENERIC_FORM')!;

    const trace: StepTraceEntry[] = runRow.steps_trace || [];
    trace.push({
      step: 'SUBMIT_CLICKED',
      timestamp: now,
      message: 'User explicitly approved submission. Clicking Submit Application once...',
      omniPresence: 'WORKING',
    });

    await supabase.from('application_runs').update({
      status: 'SUBMITTING',
      current_step: 'SUBMIT_CLICKED',
      user_approved_at: now,
      steps_trace: trace,
      updated_at: now,
    }).eq('id', runId);

    // Click final submit once
    const submissionResult = await adapter.submit(driver, session, true);
    await driver.closeSession(session).catch(() => {});

    if (submissionResult.success && submissionResult.status === 'SUBMITTED') {
      // 1. Settle Credit Reservation (Level 11)
      if (runRow.credit_reservation_id) {
        await CreditService.settleReservation({
          reservationId: runRow.credit_reservation_id,
          actualCredits: 8,
          metadata: {
            description: `Confirmed application submission to ${job.company} — ${job.title}.`,
            runId,
          },
        });
      }

      // 2. Update existing job_applications table to Applied
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
          ...runRow.evidence,
          ...submissionResult.evidence,
          confirmedAt: now,
        },
      });
    }

    // 3. Ambiguous submission or failure
    const isAmbiguous = submissionResult.status === 'SUBMISSION_UNKNOWN';
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
        ...runRow.evidence,
        ...submissionResult.evidence,
      },
    });
  }

  /**
   * Resumes browser execution after candidate answers an unknown question inline.
   */
  static async answerHandoff(options: AnswerHandoffOptions): Promise<ApplicationRunRecord> {
    const { userId, runId, answers } = options;

    const supabase = createClient();
    const { data: runRow, error } = await supabase
      .from('application_runs')
      .select('*')
      .eq('id', runId)
      .eq('user_id', userId)
      .single();

    if (error || !runRow) {
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

    const { data: pkgRow } = await supabase
      .from('application_packages')
      .select('answers, unknown_questions')
      .eq('id', runRow.application_package_id)
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
        .eq('id', runRow.application_package_id);
    }

    // Re-trigger browser run
    return await this.startRun({
      userId,
      packageId: runRow.application_package_id,
      idempotencyKey: `resume_${runId}_${Date.now()}`,
    });
  }

  /**
   * Retrieves an application run by ID.
   */
  static async getRunById(runId: string, userId: string): Promise<ApplicationRunRecord | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('application_runs')
      .select('*')
      .eq('id', runId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return this.mapRunRow(data);
  }

  /**
   * Helper to persist run status updates.
   */
  private static async updateRunStatus(
    runId: string,
    updates: Partial<ApplicationRunRecord>
  ): Promise<ApplicationRunRecord> {
    const supabase = createClient();
    const now = new Date().toISOString();

    const dbPayload: Record<string, any> = {
      updated_at: now,
    };

    if (updates.status) dbPayload.status = updates.status;
    if (updates.currentStep) dbPayload.current_step = updates.currentStep;
    if (updates.provider) dbPayload.provider = updates.provider;
    if (updates.stepsTrace) dbPayload.steps_trace = updates.stepsTrace;
    if (updates.formSchema) dbPayload.form_schema = updates.formSchema;
    if (updates.filledFields) dbPayload.filled_fields = updates.filledFields;
    if (updates.validationResult) dbPayload.validation_result = updates.validationResult;
    if (updates.requiresUserAction !== undefined) dbPayload.requires_user_action = updates.requiresUserAction;
    if (updates.handoffReason !== undefined) dbPayload.handoff_reason = updates.handoffReason;
    if (updates.handoffPayload !== undefined) dbPayload.handoff_payload = updates.handoffPayload;
    if (updates.submittedAt) dbPayload.submitted_at = updates.submittedAt;
    if (updates.confirmationUrl !== undefined) dbPayload.confirmation_url = updates.confirmationUrl;
    if (updates.confirmationText !== undefined) dbPayload.confirmation_text = updates.confirmationText;
    if (updates.evidence) dbPayload.evidence = updates.evidence;
    if (updates.errorCode !== undefined) dbPayload.error_code = updates.errorCode;
    if (updates.errorMessage !== undefined) dbPayload.error_message = updates.errorMessage;

    const { data: updated, error } = await supabase
      .from('application_runs')
      .update(dbPayload)
      .eq('id', runId)
      .select('*')
      .single();

    if (error || !updated) {
      console.error('[BrowserApplicationAgentService.updateRunStatus] DB error:', error?.message);
      // Return optimistic record
      return {
        id: runId,
        userId: updates.userId || '',
        applicationPackageId: updates.applicationPackageId || '',
        jobId: updates.jobId || '',
        provider: updates.provider || 'GENERIC_FORM',
        status: updates.status || 'FAILED',
        currentStep: updates.currentStep || 'READY',
        stepsTrace: updates.stepsTrace || [],
        requiresUserAction: Boolean(updates.requiresUserAction),
        evidence: updates.evidence || {},
        startedAt: updates.startedAt || now,
        updatedAt: now,
        ...updates,
      } as ApplicationRunRecord;
    }

    return this.mapRunRow(updated);
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
    };
  }
}
