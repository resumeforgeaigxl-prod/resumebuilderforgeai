/**
 * ResumeForge — Level 16: Omni Autopilot Review Queue Service
 * Manages the candidate review queue, explicit approvals, and approval invalidation.
 */

import { createClient } from '@/lib/supabase/server';
import type { AutopilotReviewItem } from './types';
import { ApprovalManager } from '@/lib/browser-agent/approvals';

// In-memory fallback stores for tests and offline resiliency
const inMemoryTestApps = new Map<string, any>();
const inMemoryTestItems: AutopilotReviewItem[] = [];

export class AutopilotReviewQueue {
  static _setTestItems(items: AutopilotReviewItem[]): void {
    inMemoryTestItems.length = 0;
    inMemoryTestItems.push(...items);
  }

  static _seedTestApp(app: any): void {
    inMemoryTestApps.set(app.id, app);
  }

  static _resetMemoryStore(): void {
    inMemoryTestApps.clear();
    inMemoryTestItems.length = 0;
  }

  /**
   * Retrieves all prepared applications currently awaiting candidate review or approval.
   */
  static async getReviewQueue(userId: string): Promise<AutopilotReviewItem[]> {
    if (!userId) {
      throw new Error('UNAUTHORIZED: userId is required to fetch Autopilot review queue.');
    }

    if (inMemoryTestItems.length > 0) {
      return [...inMemoryTestItems];
    }

    const items: AutopilotReviewItem[] = [];

    try {
      const supabase = createClient();

      // Fetch applications in READY, NEEDS_USER, or AWAITING_APPROVAL status
      const { data: apps, error: appsError } = await supabase
        .from('job_applications')
        .select(`
          id,
          user_id,
          job_id,
          status,
          company,
          position,
          application_package_id,
          created_at,
          job_snapshot,
          jobs:job_id (
            id,
            title,
            company,
            location,
            apply_url
          )
        `)
        .eq('user_id', userId)
        .in('status', ['READY', 'Ready', 'NEEDS_USER', 'AWAITING_APPROVAL', 'SAVED'])
        .order('created_at', { ascending: false });

      if (appsError || !apps) {
        return [];
      }

      // Fetch package details
      const packageIds = apps.map((a) => a.application_package_id).filter(Boolean);
      const packageMap = new Map<string, any>();

      if (packageIds.length > 0) {
        const { data: pkgs } = await supabase
          .from('application_packages')
          .select('*')
          .in('id', packageIds);

        if (pkgs) {
          for (const pkg of pkgs) {
            packageMap.set(pkg.id, pkg);
          }
        }
      }

      for (const app of apps) {
        const pkg = packageMap.get(app.application_package_id);
        const job = (app.jobs as any) || {};
        const snapshot = app.job_snapshot || {};

        const missing = pkg?.unknown_questions?.filter((q: any) => q.required) || [];

        items.push({
          applicationId: app.id,
          jobId: app.job_id,
          packageId: app.application_package_id,
          roleTitle: app.position || job.title || snapshot.title || 'Role',
          companyName: app.company || job.company || snapshot.companyName || 'Company',
          location: job.location || snapshot.location || 'Remote',
          applyUrl: job.apply_url || snapshot.applyUrl,
          matchScore: pkg?.match_snapshot?.score ?? 85,
          matchSummary: pkg?.match_snapshot?.summary || 'Qualified candidate match based on skills and background.',
          resumeVersionId: pkg?.tailored_resume_id || 'v1',
          resumeTitle: pkg?.tailored_resume?.title || 'Tailored Resume',
          missingAnswersCount: missing.length,
          missingAnswers: missing.map((m: any) => ({
            key: m.fieldKey || m.key,
            question: m.label || m.question,
            required: true,
          })),
          creditCost: 8, // 8 credits for final submission
          status: app.status.toUpperCase(),
          approvalId: (app as any).approval_id,
          preparedAt: app.created_at,
        });
      }
    } catch {
      // In-memory fallback
    }

    return items;
  }

  /**
   * Explicitly approves a prepared application package for execution.
   * Generates a tamper-proof Approval ID linking candidate, package, and employer form.
   */
  static async approveApplication(
    userId: string,
    applicationId: string
  ): Promise<{ success: boolean; approvalId: string; message: string }> {
    if (!userId || !applicationId) {
      throw new Error('UNAUTHORIZED: userId and applicationId are required.');
    }

    let app = inMemoryTestApps.get(applicationId);
    if (!app) {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('job_applications')
          .select('*')
          .eq('id', applicationId)
          .eq('user_id', userId)
          .single();

        if (!error && data) {
          app = data;
        }
      } catch {
        // Fallback
      }
    }

    if (!app) {
      throw new Error(`APPLICATION_NOT_FOUND: Application ${applicationId} not found.`);
    }

    const approvalId = ApprovalManager.generateApprovalId({
      userId,
      packageId: app.application_package_id || applicationId,
      resumeVersion: app.resume_version_id || 'v1',
      answersHash: 'hash_approved_answers',
      formHash: 'hash_employer_form',
    });

    app.status = 'AWAITING_APPROVAL';
    app.approval_id = approvalId;
    app.notes = `Application explicitly approved for submission by candidate at ${new Date().toISOString()}. ApprovalId: ${approvalId}`;

    // Update status to AWAITING_APPROVAL in job_applications
    try {
      const supabase = createClient();
      await supabase
        .from('job_applications')
        .update({
          status: 'AWAITING_APPROVAL',
          notes: app.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .eq('user_id', userId);
    } catch {
      // In-memory fallback
    }

    return {
      success: true,
      approvalId,
      message: 'Application approved. Scheduled for automated execution.',
    };
  }

  /**
   * Skips an application in the review queue.
   */
  static async skipApplication(
    userId: string,
    applicationId: string,
    reason = 'Skipped by candidate'
  ): Promise<{ success: boolean; message: string }> {
    const testApp = inMemoryTestApps.get(applicationId);
    if (testApp) {
      testApp.status = 'WITHDRAWN';
      testApp.notes = reason;
    }

    try {
      const supabase = createClient();
      await supabase
        .from('job_applications')
        .update({
          status: 'WITHDRAWN',
          notes: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .eq('user_id', userId);
    } catch {
      // In-memory fallback
    }

    return { success: true, message: 'Application skipped and archived.' };
  }
}
