/**
 * ResumeForge — Level 16: Omni Autopilot Execution Engine
 * Orchestrates policy-driven discovery, preparation, controlled execution,
 * credit limits, partial completion, and error categorization.
 */

import { createClient } from '@/lib/supabase/server';
import { AutopilotPolicyManager } from './policy';
import { AutopilotDiscoveryService } from './discovery';
import { ApplicationPreparationEngine } from '@/lib/application-engine/engine';
import { BrowserApplicationAgentService } from '@/lib/browser-agent';
import { CreditService } from '@/lib/billing/credit-service';
import { ApplicationTrackerService } from '@/lib/application-tracker';
import type {
  AutopilotPolicy,
  AutopilotRunRecord,
  AutopilotRunStatus,
  AutopilotActivityStats,
  AutopilotJobDecision,
} from './types';
import { DEFAULT_AUTOPILOT_LIMITS } from './types';

// In-memory fallback run cache for test runner and deterministic execution
const inMemoryRuns = new Map<string, AutopilotRunRecord>();
const activeUserLocks = new Set<string>();
let inMemoryPackagePreparer: ((options: { userId: string; jobId: string }) => Promise<any>) | null = null;
let inMemoryApprovedApps: any[] | null = null;
let inMemorySubmitter: ((options: any) => Promise<any>) | null = null;

export interface ExecuteCycleOptions {
  force?: boolean;
  idempotencyKey?: string;
}

export class AutopilotExecutionEngine {
  /**
   * Resets in-memory run cache and concurrency locks (strictly for test isolation).
   */
  static _resetMemoryStore(): void {
    inMemoryRuns.clear();
    activeUserLocks.clear();
    inMemoryPackagePreparer = null;
    inMemoryApprovedApps = null;
    inMemorySubmitter = null;
  }

  static _setTestExecutionHandlers(
    handlers: {
      preparePackage?: (options: { userId: string; jobId: string }) => Promise<any>;
      approvedApps?: any[];
      approveAndSubmit?: (options: any) => Promise<any>;
    } | null
  ): void {
    if (!handlers) {
      inMemoryPackagePreparer = null;
      inMemoryApprovedApps = null;
      inMemorySubmitter = null;
    } else {
      inMemoryPackagePreparer = handlers.preparePackage || null;
      inMemoryApprovedApps = handlers.approvedApps || null;
      inMemorySubmitter = handlers.approveAndSubmit || null;
    }
  }

  static _seedRun(run: AutopilotRunRecord): void {
    inMemoryRuns.set(run.id, run);
  }

  /**
   * Executes a bounded Autopilot cycle for a candidate.
   */
  static async executeCycle(
    userId: string,
    options?: ExecuteCycleOptions
  ): Promise<AutopilotRunRecord> {
    const now = new Date().toISOString();
    const runId = `run_auto_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const idempotencyKey =
      options?.idempotencyKey || `auto_${userId}_${now.split('T')[0]}_${Date.now()}`;

    // 1. Check Global Emergency Kill Switch (Section 46)
    if (AutopilotPolicyManager.isGlobalKillSwitchActive()) {
      return this.recordRunResult({
        id: runId,
        userId,
        policyVersion: 1,
        mode: 'OFF',
        status: 'PAUSED_SECURITY',
        startedAt: now,
        finishedAt: now,
        jobsEvaluated: 0,
        jobsEligible: 0,
        applicationsPrepared: 0,
        applicationsSubmitted: 0,
        creditsReserved: 0,
        creditsSettled: 0,
        decisions: [],
        errorCode: 'GLOBAL_KILL_SWITCH_ACTIVE',
        errorMessage: 'Autopilot execution is globally halted for operational safety.',
        idempotencyKey,
        createdAt: now,
      });
    }

    // 2. Fetch User Policy
    const policy = await AutopilotPolicyManager.getPolicy(userId);

    // Check Enabled & Mode
    if (!policy.enabled || policy.mode === 'OFF') {
      return this.recordRunResult({
        id: runId,
        userId,
        policyVersion: policy.policyVersion,
        mode: policy.mode,
        status: 'CANCELLED',
        startedAt: now,
        finishedAt: now,
        jobsEvaluated: 0,
        jobsEligible: 0,
        applicationsPrepared: 0,
        applicationsSubmitted: 0,
        creditsReserved: 0,
        creditsSettled: 0,
        decisions: [],
        errorCode: 'AUTOPILOT_OFF',
        errorMessage: 'Autopilot is currently OFF or disabled for candidate.',
        idempotencyKey,
        createdAt: now,
      });
    }

    // Check Candidate Pause State
    if (policy.isPaused) {
      return this.recordRunResult({
        id: runId,
        userId,
        policyVersion: policy.policyVersion,
        mode: policy.mode,
        status: 'PAUSED_USER',
        startedAt: now,
        finishedAt: now,
        jobsEvaluated: 0,
        jobsEligible: 0,
        applicationsPrepared: 0,
        applicationsSubmitted: 0,
        creditsReserved: 0,
        creditsSettled: 0,
        decisions: [],
        errorCode: 'PAUSED_BY_USER',
        errorMessage: policy.pauseReason || 'Autopilot is paused by candidate.',
        idempotencyKey,
        createdAt: now,
      });
    }

    // 3. Concurrency Lock: Prevent multiple concurrent runs for same user
    if (activeUserLocks.has(userId) && !options?.force) {
      throw new Error(`CONCURRENT_RUN_BLOCKED: An Autopilot cycle is already executing for user ${userId}.`);
    }
    activeUserLocks.add(userId);

    try {
      // 4. Credit & Budget Sanity Checks
      const balance = await CreditService.getBalance(userId);
      const isBillableMode = policy.mode === 'PREPARE' || policy.mode === 'REVIEW_AND_EXECUTE';

      if (isBillableMode && balance.available < DEFAULT_AUTOPILOT_LIMITS.preparationCostPerApp) {
        return await this.recordRunResult({
          id: runId,
          userId,
          policyVersion: policy.policyVersion,
          mode: policy.mode,
          status: 'PAUSED_BUDGET',
          startedAt: now,
          finishedAt: new Date().toISOString(),
          jobsEvaluated: 0,
          jobsEligible: 0,
          applicationsPrepared: 0,
          applicationsSubmitted: 0,
          creditsReserved: 0,
          creditsSettled: 0,
          decisions: [],
          errorCode: 'INSUFFICIENT_CREDITS',
          errorMessage: `Available credits (${balance.available}) are insufficient for application preparation (requires ${DEFAULT_AUTOPILOT_LIMITS.preparationCostPerApp} credits).`,
          idempotencyKey,
          createdAt: now,
        });
      }

      // 5. Automated Job Discovery & Hard Constraints Evaluation
      const discovery = await AutopilotDiscoveryService.discoverAndFilterJobs(userId, policy);
      const { eligibleJobs, decisions } = discovery;

      // ── MODE 1: DISCOVER ONLY ──────────────────────────────────────────────
      if (policy.mode === 'DISCOVER') {
        const finishedAt = new Date().toISOString();
        await AutopilotPolicyManager.updatePolicy(userId, { lastRunAt: finishedAt });

        return await this.recordRunResult({
          id: runId,
          userId,
          policyVersion: policy.policyVersion,
          mode: 'DISCOVER',
          status: 'COMPLETED',
          startedAt: now,
          finishedAt,
          jobsEvaluated: discovery.totalEvaluated,
          jobsEligible: discovery.totalEligible,
          applicationsPrepared: 0,
          applicationsSubmitted: 0,
          creditsReserved: 0,
          creditsSettled: 0,
          decisions,
          idempotencyKey,
          createdAt: now,
        });
      }

      // ── MODE 2 & 3: PREPARE AND REVIEW_AND_EXECUTE ────────────────────────
      let preparedCount = 0;
      let submittedCount = 0;
      let settledCredits = 0;
      let partialErrors: string[] = [];

      // Determine batch quota based on daily limit & budget
      const maxBatch = Math.min(
        policy.dailyPreparationLimit,
        Math.floor(balance.available / DEFAULT_AUTOPILOT_LIMITS.preparationCostPerApp),
        eligibleJobs.length
      );

      const targetBatch = eligibleJobs.slice(0, maxBatch);

      for (const item of targetBatch) {
        try {
          // Prepare application package (settles 4 credits inside engine)
          const pkg = inMemoryPackagePreparer
            ? await inMemoryPackagePreparer({ userId, jobId: item.job.id })
            : await ApplicationPreparationEngine.preparePackage({
                userId,
                jobId: item.job.id,
                userOverride: false,
                forceFresh: false,
              });

          preparedCount++;
          settledCredits += DEFAULT_AUTOPILOT_LIMITS.preparationCostPerApp;

          // Sync canonical application tracking record
          await ApplicationTrackerService.createOrGetApplication({
            userId,
            jobId: item.job.id,
            companyName: item.job.company,
            roleTitle: item.job.title,
            applicationPackageId: pkg.id,
            resumeVersionId: pkg.tailoredResumeId,
            submissionMethod: 'OMNI_BROWSER',
            initialStatus: pkg.status === 'READY' ? 'READY' : 'NEEDS_USER',
            jobSnapshot: {
              jobId: item.job.id,
              title: item.job.title,
              companyName: item.job.company,
              location: item.job.location,
              applyUrl: item.job.apply_url,
              capturedAt: now,
            },
          });
        } catch (prepErr: any) {
          console.warn(`[Autopilot] Preparation failed for job ${item.job.id}:`, prepErr.message);
          partialErrors.push(`${item.job.company} (${item.job.title}): ${prepErr.message}`);
        }
      }

      // ── REVIEW_AND_EXECUTE: SUBMIT ONLY PRE-APPROVED APPLICATIONS ──────────
      if (policy.mode === 'REVIEW_AND_EXECUTE') {
        try {
          // Check if user has explicitly approved applications in AWAITING_APPROVAL
          let approvedApps = inMemoryApprovedApps;
          if (!approvedApps) {
            try {
              const supabase = createClient();
              const { data } = await supabase
                .from('job_applications')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'AWAITING_APPROVAL')
                .limit(policy.dailySubmissionLimit);
              approvedApps = data || [];
            } catch {
              approvedApps = [];
            }
          }

          if (approvedApps && approvedApps.length > 0) {
            for (const app of approvedApps) {
              if (submittedCount >= policy.dailySubmissionLimit) break;

              try {
                // Submit approved application
                const run = inMemorySubmitter
                  ? await inMemorySubmitter({
                      userId,
                      runId: app.active_run_id || `run_${app.id}`,
                      packageId: app.application_package_id,
                      explicitUserConsent: true,
                    })
                  : await BrowserApplicationAgentService.approveAndSubmit({
                      userId,
                      runId: app.active_run_id || `run_${app.id}`,
                      packageId: app.application_package_id,
                      explicitUserConsent: true,
                    });

                if (run.status === 'SUBMITTED') {
                  submittedCount++;
                  settledCredits += DEFAULT_AUTOPILOT_LIMITS.submissionCostPerApp;
                }
              } catch (subErr: any) {
                console.warn(`[Autopilot Submission] Execution failed for app ${app.id}:`, subErr.message);
                partialErrors.push(`Submission ${app.company}: ${subErr.message}`);
              }
            }
          }
        } catch {
          // Non-fatal
        }
      }

      const finishedAt = new Date().toISOString();
      await AutopilotPolicyManager.updatePolicy(userId, { lastRunAt: finishedAt });

      let finalStatus: AutopilotRunStatus = 'COMPLETED';
      if (partialErrors.length > 0 && preparedCount > 0) {
        finalStatus = 'PARTIAL';
      } else if (partialErrors.length > 0 && preparedCount === 0) {
        finalStatus = 'FAILED';
      }

      return await this.recordRunResult({
        id: runId,
        userId,
        policyVersion: policy.policyVersion,
        mode: policy.mode,
        status: finalStatus,
        startedAt: now,
        finishedAt,
        jobsEvaluated: discovery.totalEvaluated,
        jobsEligible: discovery.totalEligible,
        applicationsPrepared: preparedCount,
        applicationsSubmitted: submittedCount,
        creditsReserved: settledCredits,
        creditsSettled: settledCredits,
        decisions,
        errorCode: partialErrors.length > 0 ? 'PARTIAL_FAILURES' : undefined,
        errorMessage: partialErrors.length > 0 ? partialErrors.join('; ') : undefined,
        idempotencyKey,
        createdAt: now,
      });
    } finally {
      activeUserLocks.delete(userId);
    }
  }

  /**
   * Retrieves summary statistics of Autopilot activity for the candidate.
   */
  static async getActivityStats(userId: string): Promise<AutopilotActivityStats> {
    const today = new Date().toISOString().split('T')[0];
    const policy = await AutopilotPolicyManager.getPolicy(userId);

    let jobsEvaluated = 0;
    let jobsEligible = 0;
    let appsPrepared = 0;
    let appsSubmitted = 0;
    let creditsSpent = 0;
    let lastRunStatus: AutopilotRunStatus | undefined;
    let lastRunTime: string | undefined;

    // Aggregate from in-memory runs
    for (const run of Array.from(inMemoryRuns.values())) {
      if (run.userId === userId) {
        if (!lastRunTime || new Date(run.createdAt).getTime() > new Date(lastRunTime).getTime()) {
          lastRunTime = run.createdAt;
          lastRunStatus = run.status;
        }

        if (run.createdAt.startsWith(today)) {
          jobsEvaluated += run.jobsEvaluated;
          jobsEligible += run.jobsEligible;
          appsPrepared += run.applicationsPrepared;
          appsSubmitted += run.applicationsSubmitted;
          creditsSpent += run.creditsSettled;
        }
      }
    }

    // Also check DB runs if available
    try {
      const supabase = createClient();
      const { data: dbRuns } = await supabase
        .from('autopilot_runs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .order('created_at', { ascending: false });

      if (dbRuns && dbRuns.length > 0) {
        for (const row of dbRuns) {
          if (!inMemoryRuns.has(row.id)) {
            jobsEvaluated += row.jobs_evaluated || 0;
            jobsEligible += row.jobs_eligible || 0;
            appsPrepared += row.applications_prepared || 0;
            appsSubmitted += row.applications_submitted || 0;
            creditsSpent += row.credits_settled || 0;
          }
        }
        if (!lastRunStatus && dbRuns[0]) {
          lastRunStatus = dbRuns[0].status;
          lastRunTime = dbRuns[0].created_at;
        }
      }
    } catch {
      // Fallback
    }

    // Fetch review queue pending count
    let pendingReviewCount = 0;
    try {
      const supabase = createClient();
      const { count } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .in('status', ['READY', 'Ready', 'NEEDS_USER', 'AWAITING_APPROVAL']);

      pendingReviewCount = count || 0;
    } catch {
      pendingReviewCount = appsPrepared;
    }

    const budgetRemaining = Math.max(0, policy.creditBudgetPerDay - creditsSpent);

    return {
      jobsEvaluatedToday: jobsEvaluated,
      jobsEligibleToday: jobsEligible,
      applicationsPreparedToday: appsPrepared,
      applicationsSubmittedToday: appsSubmitted,
      pendingReviewCount,
      creditsSpentToday: creditsSpent,
      creditsBudgetRemaining: budgetRemaining,
      lastRunStatus,
      lastRunTime,
    };
  }

  private static async recordRunResult(run: AutopilotRunRecord): Promise<AutopilotRunRecord> {
    inMemoryRuns.set(run.id, run);

    try {
      const supabase = createClient();
      await supabase.from('autopilot_runs').insert({
        id: run.id,
        user_id: run.userId,
        policy_version: run.policyVersion,
        mode: run.mode,
        status: run.status,
        started_at: run.startedAt,
        finished_at: run.finishedAt || null,
        jobs_evaluated: run.jobsEvaluated,
        jobs_eligible: run.jobsEligible,
        applications_prepared: run.applicationsPrepared,
        applications_submitted: run.applicationsSubmitted,
        credits_reserved: run.creditsReserved,
        credits_settled: run.creditsSettled,
        decisions: run.decisions,
        error_code: run.errorCode || null,
        error_message: run.errorMessage || null,
        idempotency_key: run.idempotencyKey,
        created_at: run.createdAt,
      });
    } catch {
      // Retain in-memory
    }

    return run;
  }
}
