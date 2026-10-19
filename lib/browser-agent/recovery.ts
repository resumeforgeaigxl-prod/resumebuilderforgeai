/**
 * ResumeForge — Recovery Orchestrator (Level 14)
 * Orchestrates recovery after interruption (crashes, timeouts, worker restarts, session expiry).
 * Safely restores sessions where supported or initiates clean rebuilds with fresh approval.
 */

import { createClient } from '@/lib/supabase/server';
import type {
  ApplicationRunRecord,
  BrowserDriver,
  BrowserSession,
  StepTraceEntry,
  OmniPresenceState,
  BrowserActivityStep,
} from './types';
import { CheckpointManager } from './checkpoints';
import { SafeRetryClassifier, DEFAULT_EXECUTION_LIMITS } from './retries';
import { getAtsAdapter } from './ats';
import { AtsDetector } from './ats/detector';
import { ApplicationPreparationEngine } from '@/lib/application-engine/engine';
import { ApprovalManager } from './approvals';
import { TakeoverManager } from './takeover';

export interface RecoveryResult {
  success: boolean;
  run: ApplicationRunRecord;
  session?: BrowserSession | null;
  recoveredFromCheckpoint?: string;
  sessionRebuilt: boolean;
  requiresFreshApproval: boolean;
  error?: string;
}

export class RecoveryOrchestrator {
  /**
   * Recovers an interrupted browser application run.
   */
  static async recover(params: {
    run: ApplicationRunRecord;
    driver: BrowserDriver;
    userId: string;
  }): Promise<RecoveryResult> {
    const { run, driver, userId } = params;
    const now = new Date().toISOString();

    // 1. Verify User Ownership
    if (run.userId !== userId) {
      throw new Error('UNAUTHORIZED: Browser run does not belong to the authenticated user.');
    }

    // 2. Prevent infinite recovery loops (Section 9)
    const currentRecoveryCount = (run.recoveryCount || 0) + 1;
    if (currentRecoveryCount > DEFAULT_EXECUTION_LIMITS.maxRecoveryAttempts) {
      const exhaustedTrace = [...(run.stepsTrace || [])];
      exhaustedTrace.push({
        step: 'RECOVERING',
        timestamp: now,
        message: `Recovery limit reached (${DEFAULT_EXECUTION_LIMITS.maxRecoveryAttempts} attempts). Halting automated execution to prevent infinite loop.`,
        omniPresence: 'IDLE',
      });

      const failedRun = {
        ...run,
        status: 'FAILED' as const,
        recoveryCount: currentRecoveryCount,
        stepsTrace: exhaustedTrace,
        errorCode: 'RECOVERY_EXHAUSTED',
        errorMessage: 'Maximum recovery attempts exceeded. Please restart application or apply manually.',
        updatedAt: now,
      };

      await this.saveRunRecord(failedRun);
      return {
        success: false,
        run: failedRun,
        sessionRebuilt: false,
        requiresFreshApproval: false,
        error: 'RECOVERY_EXHAUSTED',
      };
    }

    // 3. Check Duration Limits
    const durationCheck = SafeRetryClassifier.checkDurationLimits(
      new Date(run.startedAt).getTime(),
      run.browserSessionExpiresAt ? new Date(run.browserSessionExpiresAt).getTime() - DEFAULT_EXECUTION_LIMITS.maxBrowserSessionDurationMs : undefined
    );

    if (durationCheck.exceeded) {
      const expiredRun = {
        ...run,
        status: 'SESSION_EXPIRED' as const,
        recoveryCount: currentRecoveryCount,
        errorCode: 'SESSION_EXPIRED',
        errorMessage: durationCheck.reason || 'Browser session expired.',
        updatedAt: now,
      };
      await this.saveRunRecord(expiredRun);
      return {
        success: false,
        run: expiredRun,
        sessionRebuilt: false,
        requiresFreshApproval: false,
        error: 'SESSION_EXPIRED',
      };
    }

    // 4. Determine last confirmed checkpoint (Section 6)
    const lastCheckpoint = await CheckpointManager.getLatestCompletedCheckpoint(run.id);

    // 5. Update status to RECOVERING
    const trace = [...(run.stepsTrace || [])];
    trace.push({
      step: 'RECOVERING',
      timestamp: now,
      message: `Interruption detected. Recovering run from checkpoint: ${lastCheckpoint?.step || 'START'} (Attempt ${currentRecoveryCount}/${DEFAULT_EXECUTION_LIMITS.maxRecoveryAttempts})...`,
      omniPresence: 'THINKING',
    });

    let activeSession: BrowserSession | null = null;
    let sessionRebuilt = false;

    // 6. Attempt session reconnection if driver supports it (Section 7)
    if (driver.capabilities.canReconnectSession && run.sessionReference && driver.reconnectSession) {
      try {
        activeSession = await driver.reconnectSession(run.sessionReference);
      } catch (reconnectErr) {
        console.warn('[RecoveryOrchestrator] Session reconnection failed:', reconnectErr);
      }
    }

    // 7. If session could not be reconnected, expire old and rebuild fresh session
    const appPackage = await ApplicationPreparationEngine.getPackage({
      userId,
      packageId: run.applicationPackageId,
    });

    if (!appPackage || appPackage.status !== 'READY') {
      const invalidRun = {
        ...run,
        status: 'FAILED' as const,
        recoveryCount: currentRecoveryCount,
        errorCode: 'PACKAGE_STALE',
        errorMessage: 'Application package has changed or is no longer READY. Please re-prepare application.',
        updatedAt: now,
      };
      await this.saveRunRecord(invalidRun);
      return {
        success: false,
        run: invalidRun,
        sessionRebuilt,
        requiresFreshApproval: true,
        error: 'PACKAGE_STALE',
      };
    }

    const applyUrl = appPackage.jobSnapshot?.applyUrl || run.evidence?.applyUrl;

    if (!activeSession) {
      sessionRebuilt = true;
      trace.push({
        step: 'RECOVERING',
        timestamp: new Date().toISOString(),
        message: 'Previous browser session expired or disconnected. Initializing clean, isolated recovery session...',
        omniPresence: 'WORKING',
      });

      activeSession = await driver.createSession({ userId });
      await driver.open(activeSession, applyUrl);
    }

    // 8. Form-State Verification (Section 26 & 27)
    const currentUrl = await driver.getCurrentUrl(activeSession);

    // Guard against unexpected external navigation
    if (currentUrl && !this.isAllowedUrl(currentUrl, applyUrl)) {
      trace.push({
        step: 'RECOVERING',
        timestamp: new Date().toISOString(),
        message: `Unexpected external navigation detected (${currentUrl}). Stopping automated run to protect user safety.`,
        omniPresence: 'IDLE',
      });

      const blockedRun = {
        ...run,
        status: 'POLICY_BLOCKED' as const,
        recoveryCount: currentRecoveryCount,
        stepsTrace: trace,
        errorCode: 'NAVIGATION_BLOCKED',
        errorMessage: `Browser navigated to an unrecognized external domain: ${currentUrl}`,
        updatedAt: new Date().toISOString(),
      };
      await this.saveRunRecord(blockedRun);
      await driver.closeSession(activeSession).catch(() => {});
      return {
        success: false,
        run: blockedRun,
        sessionRebuilt,
        requiresFreshApproval: true,
        error: 'NAVIGATION_BLOCKED',
      };
    }

    // Re-inspect form
    const pageState = await driver.getPageState(activeSession);
    const inspection = await driver.inspectForm(activeSession);
    const detectedProvider = AtsDetector.detect(currentUrl, pageState, inspection);
    const adapter = getAtsAdapter(detectedProvider) || getAtsAdapter('GENERIC_FORM')!;

    // Check for CAPTCHA / MFA during recovery
    if (inspection.captchaDetected || inspection.mfaOrAuthRequired) {
      const handoff = TakeoverManager.createHandoffRequest({
        runId: run.id,
        userId,
        reason: inspection.captchaDetected ? 'CAPTCHA_REQUIRED' : 'MFA_REQUIRED',
        message: inspection.captchaDetected
          ? 'Employer portal displayed a security verification (CAPTCHA). Please complete it to resume.'
          : 'Employer portal requires authentication or multi-factor authentication.',
        requiredAction: 'HUMAN_SECURITY_CHALLENGE',
        driver,
        session: activeSession,
      });

      trace.push({
        step: 'HANDOFF_TRIGGERED',
        timestamp: new Date().toISOString(),
        message: handoff.message,
        omniPresence: 'NEEDS_USER',
      });

      const pausedRun = {
        ...run,
        status: 'PAUSED_NEEDS_USER' as const,
        recoveryCount: currentRecoveryCount,
        requiresUserAction: true,
        handoffReason: handoff.reason,
        handoffPayload: handoff,
        stepsTrace: trace,
        sessionReference: activeSession.sessionId,
        updatedAt: new Date().toISOString(),
      };
      await this.saveRunRecord(pausedRun);
      return {
        success: true,
        run: pausedRun,
        session: activeSession,
        sessionRebuilt,
        requiresFreshApproval: true,
      };
    }

    const formSchema = await adapter.inspect(pageState);
    formSchema.fields = inspection.fields;
    formSchema.buttons = inspection.buttons;

    // Check for material form changes compared to original inspection
    const newFormHash = ApprovalManager.hashFormSchema(formSchema);
    const formMateriallyChanged = run.formVersion && run.formVersion !== newFormHash;

    // Re-map and refill fields from Application Package
    const mappingResult = adapter.mapFields(formSchema, appPackage);
    if (!mappingResult.canProceedToFill) {
      const unresolved = mappingResult.unresolvedRequired[0] || mappingResult.sensitiveUnresolved[0];
      const handoff = TakeoverManager.createHandoffRequest({
        runId: run.id,
        userId,
        reason: unresolved.sensitive ? 'SENSITIVE_ANSWER_REQUIRED' : 'UNKNOWN_REQUIRED_FIELD',
        message: `Employer asks: "${unresolved.label}". Please verify your answer to continue.`,
        requiredAction: 'CONFIRM_ANSWER',
        questionKey: unresolved.formFieldKey,
        options: unresolved.allowedOptions,
        driver,
        session: activeSession,
      });

      const pausedRun = {
        ...run,
        status: 'PAUSED_NEEDS_USER' as const,
        recoveryCount: currentRecoveryCount,
        requiresUserAction: true,
        handoffReason: handoff.reason,
        handoffPayload: handoff,
        stepsTrace: trace,
        sessionReference: activeSession.sessionId,
        updatedAt: new Date().toISOString(),
      };
      await this.saveRunRecord(pausedRun);
      return {
        success: true,
        run: pausedRun,
        session: activeSession,
        sessionRebuilt,
        requiresFreshApproval: true,
      };
    }

    // Refill fields safely
    trace.push({
      step: 'FIELDS_FILLED',
      timestamp: new Date().toISOString(),
      message: `Restoring ${mappingResult.mappings.length} verified candidate fields in recovered session...`,
      omniPresence: 'WORKING',
    });
    const fillResult = await adapter.fill(driver, activeSession, mappingResult.mappings, appPackage);

    // Validate form
    const validation = await adapter.validate(driver, activeSession, formSchema);

    // Checkpoint recovery complete
    await CheckpointManager.recordCheckpoint({
      runId: run.id,
      step: 'FORM_VALIDATED',
      sequence: 7,
      status: 'COMPLETED',
      safeResultReference: `recovery_attempt_${currentRecoveryCount}`,
      metadata: { filledCount: fillResult.filledCount, resumeUploaded: fillResult.resumeUploaded },
    });

    // Fresh approval rule: If session was rebuilt OR form layout changed, require fresh approval!
    const requiresFreshApproval = sessionRebuilt || Boolean(formMateriallyChanged);

    trace.push({
      step: 'AWAITING_APPROVAL',
      timestamp: new Date().toISOString(),
      message: requiresFreshApproval
        ? 'Application state recovered and re-validated. Fresh approval required before final submission.'
        : 'Session safely reconnected. Ready for submission.',
      omniPresence: 'IDLE',
    });

    const recoveredRun: ApplicationRunRecord = {
      ...run,
      status: 'AWAITING_APPROVAL',
      currentStep: 'AWAITING_APPROVAL',
      recoveryCount: currentRecoveryCount,
      sessionReference: activeSession.sessionId,
      formVersion: newFormHash,
      formSchema,
      filledFields: mappingResult.mappings,
      validationResult: validation,
      requiresUserAction: true,
      handoffReason: 'AWAITING_USER_APPROVAL',
      // Invalidate old approval if rebuilt
      approvalId: requiresFreshApproval ? null : run.approvalId,
      userApprovedAt: requiresFreshApproval ? null : run.userApprovedAt,
      stepsTrace: trace,
      updatedAt: new Date().toISOString(),
    };

    await this.saveRunRecord(recoveredRun);

    return {
      success: true,
      run: recoveredRun,
      session: activeSession,
      recoveredFromCheckpoint: lastCheckpoint?.step,
      sessionRebuilt,
      requiresFreshApproval,
    };
  }

  private static isAllowedUrl(currentUrl: string, originalUrl?: string): boolean {
    if (!originalUrl) return true;
    try {
      const orig = new URL(originalUrl);
      const curr = new URL(currentUrl);

      // Same hostname or trusted subdomains/redirects
      if (curr.hostname === orig.hostname) return true;
      if (curr.hostname.endsWith(orig.hostname)) return true;

      // Common trusted ATS redirect patterns
      const trusted = ['greenhouse.io', 'lever.co', 'ashbyhq.com', 'grnh.se'];
      return trusted.some((t) => curr.hostname.includes(t) || orig.hostname.includes(t));
    } catch {
      return false;
    }
  }

  private static async saveRunRecord(run: ApplicationRunRecord): Promise<void> {
    try {
      const supabase = createClient();
      await supabase
        .from('application_runs')
        .update({
          status: run.status,
          current_step: run.currentStep,
          recovery_count: run.recoveryCount,
          session_reference: run.sessionReference,
          form_version: run.formVersion,
          form_schema: run.formSchema,
          filled_fields: run.filledFields,
          validation_result: run.validationResult,
          requires_user_action: run.requiresUserAction,
          handoff_reason: run.handoffReason,
          handoff_payload: run.handoffPayload,
          approval_id: run.approvalId,
          user_approved_at: run.userApprovedAt,
          steps_trace: run.stepsTrace,
          error_code: run.errorCode,
          error_message: run.errorMessage,
          updated_at: run.updatedAt,
        })
        .eq('id', run.id);
    } catch (e: any) {
      console.warn('[RecoveryOrchestrator.saveRunRecord] DB save notice:', e?.message || e);
    }
  }
}
