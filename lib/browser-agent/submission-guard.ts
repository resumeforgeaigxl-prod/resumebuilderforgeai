/**
 * ResumeForge — Exactly-Once Submission Guard (Level 14)
 * Database-backed and memory-synchronized safeguard preventing duplicate final submission attempts.
 * Ties authorization to: user_id, application_id, package_version, browser_run_id, approval_id, form_version.
 */

import { createClient } from '@/lib/supabase/server';
import type { SubmissionGuardRecord } from './types';

// In-memory guard registry for high-performance atomic checks and deterministic testing
const activeGuards = new Map<string, SubmissionGuardRecord>();

export class SubmissionGuard {
  /**
   * Generates unique composite key for an application submission attempt.
   */
  private static makeCompositeKey(
    userId: string,
    applicationId: string,
    packageVersion: number,
    formVersion: string
  ): string {
    return `${userId}:${applicationId}:v${packageVersion}:${formVersion}`;
  }

  /**
   * Attempts to acquire an exclusive submission guard.
   * Fails if an active attempt already exists or was already submitted for this exact form & package version.
   */
  static async acquireGuard(params: {
    userId: string;
    applicationId: string;
    packageVersion: number;
    browserRunId: string;
    approvalId: string;
    formVersion: string;
  }): Promise<{ success: boolean; guardId?: string; error?: string }> {
    const { userId, applicationId, packageVersion, browserRunId, approvalId, formVersion } = params;
    const compositeKey = this.makeCompositeKey(userId, applicationId, packageVersion, formVersion);
    const now = new Date().toISOString();

    // 1. In-memory pre-check
    const existing = activeGuards.get(compositeKey);
    if (existing) {
      if (existing.status === 'SUBMITTED') {
        return {
          success: false,
          error: 'DUPLICATE_SUBMISSION_ATTEMPT_BLOCKED: Application has already been submitted for this package & form version.',
        };
      }
      if (existing.status === 'PENDING') {
        return {
          success: false,
          error: 'DUPLICATE_SUBMISSION_ATTEMPT_BLOCKED: Another active final-submission attempt is currently in progress.',
        };
      }
      if (existing.status === 'UNKNOWN') {
        return {
          success: false,
          error: 'DUPLICATE_SUBMISSION_ATTEMPT_BLOCKED: Previous submission status is UNKNOWN. Automatic retry is prohibited to prevent duplicate applications.',
        };
      }
    }

    const guardId = `guard_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newRecord: SubmissionGuardRecord = {
      id: guardId,
      userId,
      applicationId,
      packageVersion,
      browserRunId,
      approvalId,
      formVersion,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    };

    activeGuards.set(compositeKey, newRecord);

    // 2. Database atomic persistence
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('application_submission_guards')
        .insert({
          id: guardId,
          user_id: userId,
          application_id: applicationId,
          package_version: packageVersion,
          browser_run_id: browserRunId,
          approval_id: approvalId,
          form_version: formVersion,
          status: 'PENDING',
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single();

      if (error) {
        // Unique constraint violation in database
        if (error.code === '23505' || error.message.includes('unique')) {
          activeGuards.delete(compositeKey);
          return {
            success: false,
            error: 'DUPLICATE_SUBMISSION_ATTEMPT_BLOCKED: Unique database submission guard already exists.',
          };
        }
        console.warn('[SubmissionGuard.acquireGuard] DB notice:', error.message);
      } else if (data?.id) {
        newRecord.id = data.id;
      }
    } catch (err: any) {
      console.warn('[SubmissionGuard.acquireGuard] DB exception, continuing with in-memory lock:', err?.message || err);
    }

    return {
      success: true,
      guardId: newRecord.id,
    };
  }

  /**
   * Confirms that employer submission succeeded.
   */
  static async confirmSubmission(guardId: string): Promise<void> {
    const now = new Date().toISOString();
    activeGuards.forEach((guard, key) => {
      if (guard.id === guardId) {
        guard.status = 'SUBMITTED';
        guard.updatedAt = now;
        activeGuards.set(key, guard);
      }
    });

    try {
      const supabase = createClient();
      await supabase
        .from('application_submission_guards')
        .update({ status: 'SUBMITTED', updated_at: now })
        .eq('id', guardId);
    } catch {}
  }

  /**
   * Marks that submission failed before reaching employer server.
   */
  static async markFailed(guardId: string): Promise<void> {
    const now = new Date().toISOString();
    activeGuards.forEach((guard, key) => {
      if (guard.id === guardId) {
        guard.status = 'FAILED';
        guard.updatedAt = now;
        activeGuards.set(key, guard);
      }
    });

    try {
      const supabase = createClient();
      await supabase
        .from('application_submission_guards')
        .update({ status: 'FAILED', updated_at: now })
        .eq('id', guardId);
    } catch {}
  }

  /**
   * Marks submission as UNKNOWN when network dropped or confirmation is uncertain.
   * Does NOT allow automatic retry.
   */
  static async markUnknown(guardId: string): Promise<void> {
    const now = new Date().toISOString();
    activeGuards.forEach((guard, key) => {
      if (guard.id === guardId) {
        guard.status = 'UNKNOWN';
        guard.updatedAt = now;
        activeGuards.set(key, guard);
      }
    });

    try {
      const supabase = createClient();
      await supabase
        .from('application_submission_guards')
        .update({ status: 'UNKNOWN', updated_at: now })
        .eq('id', guardId);
    } catch {}
  }

  /**
   * Retrieves a guard record by ID (from memory or DB).
   */
  static async getGuard(guardId: string): Promise<SubmissionGuardRecord | null> {
    let matched: SubmissionGuardRecord | null = null;
    activeGuards.forEach((guard) => {
      if (guard.id === guardId) {
        matched = guard;
      }
    });
    if (matched) return matched;
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('application_submission_guards')
        .select('*')
        .eq('id', guardId)
        .maybeSingle();
      if (data) {
        return {
          id: data.id,
          userId: data.user_id,
          applicationId: data.application_id,
          packageVersion: data.package_version,
          browserRunId: data.browser_run_id,
          approvalId: data.approval_id,
          formVersion: data.form_version,
          status: data.status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch {}
    return null;
  }

  /**
   * Resets all in-memory guards (used for testing).
   */
  static clearMemory(): void {
    activeGuards.clear();
  }
}
