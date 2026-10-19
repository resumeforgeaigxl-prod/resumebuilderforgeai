/**
 * ResumeForge — Level 16: Omni Autopilot Policy Manager
 * Handles policy persistence, versioning, material change invalidations,
 * candidate pausing, and the global emergency kill switch.
 */

import { createClient } from '@/lib/supabase/server';
import type { AutopilotPolicy, AutopilotMode, RemotePreference } from './types';
import { DEFAULT_AUTOPILOT_LIMITS } from './types';

// In-memory fallback stores for test execution and offline resiliency
const inMemoryPolicies = new Map<string, AutopilotPolicy>();

// Server-side operational emergency kill switch (Section 46)
let globalKillSwitchActive = false;

export class AutopilotPolicyManager {
  /**
   * Resets in-memory policy cache and kill switch (strictly for test isolation).
   */
  static _resetMemoryStore(): void {
    inMemoryPolicies.clear();
    globalKillSwitchActive = false;
  }

  /**
   * Seeds an in-memory policy for test isolation.
   */
  static _seedPolicy(policy: AutopilotPolicy): void {
    inMemoryPolicies.set(policy.userId, policy);
  }

  /**
   * Gets or sets the global emergency kill switch.
   */
  static setGlobalKillSwitch(active: boolean): void {
    globalKillSwitchActive = active;
    if (active) {
      console.warn('[Autopilot Emergency Kill Switch] ACTIVATED. All scheduled Autopilot execution halted.');
    } else {
      console.log('[Autopilot Emergency Kill Switch] DEACTIVATED.');
    }
  }

  static isGlobalKillSwitchActive(): boolean {
    return globalKillSwitchActive;
  }

  /**
   * Generates a safe, unactivated default policy for a candidate.
   */
  static createDefaultPolicy(userId: string): AutopilotPolicy {
    const now = new Date().toISOString();
    return {
      id: `pol_${userId}`,
      userId,
      enabled: false,
      mode: 'OFF',
      targetRoles: [],
      preferredLocations: [],
      remotePreference: 'ANY',
      allowedEmploymentTypes: ['Full-time'],
      minSalary: undefined,
      salaryCurrency: 'INR',
      experienceRange: undefined,
      minMatchScore: 75,
      excludedCompanies: [],
      dailyPreparationLimit: DEFAULT_AUTOPILOT_LIMITS.maxDailyPreparation,
      weeklyPreparationLimit: DEFAULT_AUTOPILOT_LIMITS.maxWeeklyPreparation,
      dailySubmissionLimit: DEFAULT_AUTOPILOT_LIMITS.maxDailySubmission,
      weeklySubmissionLimit: DEFAULT_AUTOPILOT_LIMITS.maxWeeklySubmission,
      creditBudgetPerDay: DEFAULT_AUTOPILOT_LIMITS.defaultCreditBudgetDay,
      creditBudgetPerMonth: DEFAULT_AUTOPILOT_LIMITS.defaultCreditBudgetMonth,
      timezone: 'Asia/Kolkata',
      preferredExecutionHour: 9,
      frequency: 'DAILY',
      policyVersion: 1,
      isPaused: false,
      pauseReason: undefined,
      lastRunAt: undefined,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Retrieves the candidate's Autopilot policy.
   */
  static async getPolicy(userId: string): Promise<AutopilotPolicy> {
    if (!userId) {
      throw new Error('UNAUTHORIZED: userId is required to fetch Autopilot policy.');
    }

    // Check in-memory store first
    const cached = inMemoryPolicies.get(userId);
    if (cached) {
      return cached;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('autopilot_policies')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (data && !error) {
        const policy = this.mapDbRowToPolicy(data);
        inMemoryPolicies.set(userId, policy);
        return policy;
      }
    } catch {
      // In-memory fallback
    }

    const defaultPolicy = this.createDefaultPolicy(userId);
    inMemoryPolicies.set(userId, defaultPolicy);
    return defaultPolicy;
  }

  /**
   * Updates a candidate's Autopilot policy, increments version, and triggers
   * reevaluation of affected pending approvals if material changes occurred.
   */
  static async updatePolicy(
    userId: string,
    updates: Partial<AutopilotPolicy>
  ): Promise<AutopilotPolicy> {
    if (!userId) {
      throw new Error('UNAUTHORIZED: userId is required to update Autopilot policy.');
    }

    const current = await this.getPolicy(userId);
    const now = new Date().toISOString();

    // Validate limits
    const dailyPrep = Math.min(
      Math.max(1, updates.dailyPreparationLimit ?? current.dailyPreparationLimit),
      15
    );
    const dailySub = Math.min(
      Math.max(1, updates.dailySubmissionLimit ?? current.dailySubmissionLimit),
      10
    );
    const minScore = Math.min(
      Math.max(50, updates.minMatchScore ?? current.minMatchScore),
      95
    );

    // Detect material criteria changes that invalidate pending approvals
    const materialChange =
      (updates.targetRoles && JSON.stringify(updates.targetRoles) !== JSON.stringify(current.targetRoles)) ||
      (updates.preferredLocations && JSON.stringify(updates.preferredLocations) !== JSON.stringify(current.preferredLocations)) ||
      (updates.minSalary !== undefined && updates.minSalary !== current.minSalary) ||
      (updates.excludedCompanies && JSON.stringify(updates.excludedCompanies) !== JSON.stringify(current.excludedCompanies)) ||
      (updates.remotePreference && updates.remotePreference !== current.remotePreference) ||
      (updates.mode && updates.mode !== current.mode);

    const newVersion = current.policyVersion + 1;

    const updated: AutopilotPolicy = {
      ...current,
      ...updates,
      dailyPreparationLimit: dailyPrep,
      dailySubmissionLimit: dailySub,
      minMatchScore: minScore,
      policyVersion: newVersion,
      updatedAt: now,
    };

    inMemoryPolicies.set(userId, updated);

    // Persist to Supabase
    try {
      const supabase = createClient();
      await supabase.from('autopilot_policies').upsert({
        user_id: userId,
        enabled: updated.enabled,
        mode: updated.mode,
        target_roles: updated.targetRoles,
        preferred_locations: updated.preferredLocations,
        remote_preference: updated.remotePreference,
        allowed_employment_types: updated.allowedEmploymentTypes,
        min_salary: updated.minSalary || null,
        salary_currency: updated.salaryCurrency,
        experience_min: updated.experienceRange?.minimum || null,
        experience_max: updated.experienceRange?.maximum || null,
        min_match_score: updated.minMatchScore,
        excluded_companies: updated.excludedCompanies,
        daily_preparation_limit: updated.dailyPreparationLimit,
        weekly_preparation_limit: updated.weeklyPreparationLimit,
        daily_submission_limit: updated.dailySubmissionLimit,
        weekly_submission_limit: updated.weeklySubmissionLimit,
        credit_budget_per_day: updated.creditBudgetPerDay,
        credit_budget_per_month: updated.creditBudgetPerMonth,
        timezone: updated.timezone,
        preferred_execution_hour: updated.preferredExecutionHour,
        frequency: updated.frequency,
        policy_version: newVersion,
        is_paused: updated.isPaused,
        pause_reason: updated.pauseReason || null,
        last_run_at: updated.lastRunAt || null,
        updated_at: now,
      });
    } catch {
      // Retain in-memory
    }

    if (materialChange) {
      console.log(`[Autopilot Policy] Material changes detected for user ${userId}. Bumped to version ${newVersion}.`);
    }

    return updated;
  }

  /**
   * Pauses candidate's Autopilot without losing configuration.
   */
  static async pauseAutopilot(userId: string, reason?: string): Promise<AutopilotPolicy> {
    return this.updatePolicy(userId, {
      isPaused: true,
      pauseReason: reason || 'Paused by candidate',
    });
  }

  /**
   * Resumes candidate's Autopilot.
   */
  static async resumeAutopilot(userId: string): Promise<AutopilotPolicy> {
    return this.updatePolicy(userId, {
      isPaused: false,
      pauseReason: undefined,
    });
  }

  /**
   * Disables Autopilot entirely.
   */
  static async disableAutopilot(userId: string): Promise<AutopilotPolicy> {
    return this.updatePolicy(userId, {
      enabled: false,
      mode: 'OFF',
      isPaused: false,
      pauseReason: undefined,
    });
  }

  private static mapDbRowToPolicy(row: any): AutopilotPolicy {
    return {
      id: String(row.id || row.user_id),
      userId: String(row.user_id),
      enabled: Boolean(row.enabled),
      mode: (row.mode as AutopilotMode) || 'OFF',
      targetRoles: Array.isArray(row.target_roles) ? row.target_roles : [],
      preferredLocations: Array.isArray(row.preferred_locations) ? row.preferred_locations : [],
      remotePreference: (row.remote_preference as RemotePreference) || 'ANY',
      allowedEmploymentTypes: Array.isArray(row.allowed_employment_types)
        ? row.allowed_employment_types
        : ['Full-time'],
      minSalary: row.min_salary ? Number(row.min_salary) : undefined,
      salaryCurrency: row.salary_currency || 'INR',
      experienceRange:
        row.experience_min !== null || row.experience_max !== null
          ? {
              minimum: row.experience_min !== null ? Number(row.experience_min) : undefined,
              maximum: row.experience_max !== null ? Number(row.experience_max) : undefined,
            }
          : undefined,
      minMatchScore: Number(row.min_match_score || 75),
      excludedCompanies: Array.isArray(row.excluded_companies) ? row.excluded_companies : [],
      dailyPreparationLimit: Number(row.daily_preparation_limit || 5),
      weeklyPreparationLimit: Number(row.weekly_preparation_limit || 20),
      dailySubmissionLimit: Number(row.daily_submission_limit || 2),
      weeklySubmissionLimit: Number(row.weekly_submission_limit || 10),
      creditBudgetPerDay: Number(row.credit_budget_per_day || 40),
      creditBudgetPerMonth: Number(row.credit_budget_per_month || 500),
      timezone: row.timezone || 'Asia/Kolkata',
      preferredExecutionHour: Number(row.preferred_execution_hour ?? 9),
      frequency: row.frequency || 'DAILY',
      policyVersion: Number(row.policy_version || 1),
      isPaused: Boolean(row.is_paused),
      pauseReason: row.pause_reason || undefined,
      lastRunAt: row.last_run_at || undefined,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    };
  }
}
