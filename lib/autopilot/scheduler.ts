/**
 * ResumeForge — Level 16: Omni Autopilot Scheduler Service
 * Lightweight, bounded cron runner with timezone-aware execution windows,
 * atomic idempotency leases, and concurrency controls.
 */

import { createClient } from '@/lib/supabase/server';
import { AutopilotPolicyManager } from './policy';
import { AutopilotExecutionEngine } from './engine';
import type { AutopilotPolicy, AutopilotRunRecord } from './types';

export interface SchedulerBatchResult {
  totalScanned: number;
  eligibleCandidates: number;
  runsTriggered: number;
  runsSkipped: number;
  errors: Array<{ userId: string; error: string }>;
}

let inMemoryTestPolicies: AutopilotPolicy[] | null = null;

export class AutopilotSchedulerService {
  static _setTestPolicies(policies: AutopilotPolicy[] | null): void {
    inMemoryTestPolicies = policies;
  }

  static _clearTestPolicies(): void {
    inMemoryTestPolicies = null;
  }

  /**
   * Runs the scheduled batch worker for all eligible Autopilot candidates.
   * Can be invoked via Vercel Cron, GitHub Actions, or local runner.
   */
  static async runScheduledBatch(): Promise<SchedulerBatchResult> {
    const result: SchedulerBatchResult = {
      totalScanned: 0,
      eligibleCandidates: 0,
      runsTriggered: 0,
      runsSkipped: 0,
      errors: [],
    };

    // 1. Check Global Emergency Kill Switch
    if (AutopilotPolicyManager.isGlobalKillSwitchActive()) {
      console.warn('[Scheduler] Halting batch run: Global kill switch is ACTIVE.');
      return result;
    }

    // 2. Fetch all enabled, active policies
    let policies: AutopilotPolicy[] = [];
    if (inMemoryTestPolicies) {
      policies = inMemoryTestPolicies.filter((p) => p.enabled && !p.isPaused && p.mode !== 'OFF');
    } else {
      try {
        const supabase = createClient();
      const { data, error } = await supabase
        .from('autopilot_policies')
        .select('*')
        .eq('enabled', true)
        .eq('is_paused', false)
        .neq('mode', 'OFF');

      if (!error && data) {
        policies = data.map((d: any) => ({
          id: d.id,
          userId: d.user_id,
          enabled: d.enabled,
          mode: d.mode,
          targetRoles: d.target_roles || [],
          preferredLocations: d.preferred_locations || [],
          remotePreference: d.remote_preference || 'ANY',
          allowedEmploymentTypes: d.allowed_employment_types || ['Full-time'],
          minSalary: d.min_salary,
          salaryCurrency: d.salary_currency || 'INR',
          minMatchScore: d.min_match_score || 75,
          excludedCompanies: d.excluded_companies || [],
          dailyPreparationLimit: d.daily_preparation_limit || 5,
          weeklyPreparationLimit: d.weekly_preparation_limit || 20,
          dailySubmissionLimit: d.daily_submission_limit || 2,
          weeklySubmissionLimit: d.weekly_submission_limit || 10,
          creditBudgetPerDay: d.credit_budget_per_day || 40,
          creditBudgetPerMonth: d.credit_budget_per_month || 500,
          timezone: d.timezone || 'Asia/Kolkata',
          preferredExecutionHour: d.preferred_execution_hour ?? 9,
          frequency: d.frequency || 'DAILY',
          policyVersion: d.policy_version || 1,
          isPaused: d.is_paused || false,
          lastRunAt: d.last_run_at,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    } catch {
      // Retain empty for offline fallback
    }
  }

    result.totalScanned = policies.length;

    const now = new Date();

    for (const policy of policies) {
      try {
        // Calculate candidate's current local hour
        const tz = policy.timezone || 'Asia/Kolkata';
        let candidateHour = now.getUTCHours();
        let candidateDateStr = now.toISOString().split('T')[0];

        try {
          const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hour: 'numeric',
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          });
          const parts = formatter.formatToParts(now);
          const hourPart = parts.find((p) => p.type === 'hour');
          if (hourPart) {
            candidateHour = parseInt(hourPart.value, 10);
          }
          const y = parts.find((p) => p.type === 'year')?.value;
          const m = parts.find((p) => p.type === 'month')?.value;
          const d = parts.find((p) => p.type === 'day')?.value;
          if (y && m && d) {
            candidateDateStr = `${y}-${m}-${d}`;
          }
        } catch {
          // Fallback to UTC
        }

        // Check if current hour matches execution window
        const isScheduledHour =
          candidateHour === policy.preferredExecutionHour ||
          (policy.frequency === 'TWICE_DAILY' && candidateHour === (policy.preferredExecutionHour + 8) % 24);

        if (!isScheduledHour) {
          result.runsSkipped++;
          continue;
        }

        result.eligibleCandidates++;

        // Exactly-once idempotency key per candidate per date and slot
        const slot = candidateHour >= 12 ? 'pm' : 'am';
        const idempotencyKey = `cron_${policy.userId}_${candidateDateStr}_${slot}`;

        await AutopilotExecutionEngine.executeCycle(policy.userId, {
          idempotencyKey,
        });

        result.runsTriggered++;
      } catch (err: any) {
        console.error(`[Scheduler] Error processing user ${policy.userId}:`, err.message);
        result.errors.push({ userId: policy.userId, error: err.message });
      }
    }

    return result;
  }
}
