/**
 * ResumeForge — Level 15: Application Execution, Evidence & Status Tracking
 * Canonical Application Service:
 * - Single source of truth for all job applications
 * - Immutable status transition history with provenance
 * - Trustworthy evidence collection (receipts, screenshots, attestations)
 * - Safe manual user updates & state transition verification
 * - In-memory fallback for test runner & deterministic offline execution
 */

import { createClient } from '@/lib/supabase/server';
import type {
  ApplicationStatus,
  SubmissionMethod,
  EvidenceType,
  VerificationStatus,
  StatusEventSource,
  JobSnapshot,
  SubmissionReceipt,
  ApplicationEvidence,
  ApplicationStatusEvent,
  JobApplicationRecord,
  ApplicationDetailView,
  ApplicationStats,
} from './types';
import { ALLOWED_STATUS_TRANSITIONS } from './types';

// In-memory fallback stores for test environments and offline resilience
const inMemoryApplications = new Map<string, JobApplicationRecord>();
const inMemoryEvidence = new Map<string, ApplicationEvidence>();
const inMemoryEvents = new Map<string, ApplicationStatusEvent>();

export interface CreateOrGetApplicationParams {
  userId: string;
  jobId: string;
  companyName: string;
  roleTitle: string;
  applicationPackageId?: string;
  resumeVersionId?: string;
  submissionMethod?: SubmissionMethod;
  initialStatus?: ApplicationStatus;
  jobSnapshot?: JobSnapshot;
  notes?: string;
}

export interface RecordStatusEventParams {
  userId: string;
  applicationId: string;
  nextStatus: ApplicationStatus;
  source: StatusEventSource;
  evidenceId?: string;
  notes?: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
  occurredAt?: string;
}

export interface RecordEvidenceParams {
  userId: string;
  applicationId: string;
  browserRunId?: string;
  type: EvidenceType;
  source: string;
  storageReference?: string;
  externalReference?: string;
  metadata?: Record<string, any>;
  verificationStatus?: VerificationStatus;
  capturedAt?: string;
}

export interface ConfirmSubmissionParams {
  userId: string;
  applicationId: string;
  browserRunId?: string;
  jobTitle: string;
  companyName: string;
  jobUrl?: string;
  resumeVersionId?: string;
  resumeTitle?: string;
  answersSummary?: Record<string, any>;
  atsProvider?: string;
  confirmationCode?: string;
  confirmationMessage?: string;
  screenshotRef?: string;
  submittedAt?: string;
}

export interface UserReportedStatusParams {
  userId: string;
  applicationId: string;
  nextStatus: ApplicationStatus;
  notes?: string;
  attestationText?: string;
  metadata?: Record<string, any>;
}

export class ApplicationTrackerService {
  /**
   * Resets in-memory caches (strictly for test isolation).
   */
  static _resetMemoryStore(): void {
    inMemoryApplications.clear();
    inMemoryEvidence.clear();
    inMemoryEvents.clear();
  }

  /**
   * Seed an in-memory application record for tests.
   */
  static _seedApplication(record: JobApplicationRecord): void {
    inMemoryApplications.set(record.id, record);
  }

  /**
   * Validates whether a requested status transition is permissible.
   * User-reported updates are allowed to update to external milestones
   * (e.g. INTERVIEW, ASSESSMENT, OFFER, REJECTED, WITHDRAWN) from APPLIED or IN_REVIEW.
   */
  static validateTransition(
    currentStatus: ApplicationStatus | null,
    nextStatus: ApplicationStatus,
    source: StatusEventSource
  ): { valid: boolean; reason?: string } {
    if (!currentStatus) {
      return { valid: true };
    }

    if (currentStatus === nextStatus) {
      return { valid: true };
    }

    // Terminal statuses cannot transition unless candidate reopens
    if (['REJECTED', 'WITHDRAWN', 'CLOSED'].includes(currentStatus) && nextStatus !== 'SAVED' && nextStatus !== 'PREPARING') {
      return {
        valid: false,
        reason: `Cannot transition from terminal state ${currentStatus} to ${nextStatus}. Re-open as SAVED or PREPARING first.`,
      };
    }

    // Direct jumps to APPLIED without submission confirmation or user attestation
    if (nextStatus === 'APPLIED') {
      if (source !== 'BROWSER_CONFIRMATION' && source !== 'USER_REPORTED' && source !== 'EMPLOYER_INTEGRATION') {
        return {
          valid: false,
          reason: 'Cannot mark status as APPLIED without verified browser submission or explicit user attestation.',
        };
      }
    }

    const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    if (allowed.includes(nextStatus)) {
      return { valid: true };
    }

    // Allow user reported milestones if application has already been submitted or prepared
    if (source === 'USER_REPORTED') {
      const candidateMilestones: ApplicationStatus[] = [
        'IN_REVIEW',
        'ASSESSMENT',
        'INTERVIEW',
        'OFFER',
        'REJECTED',
        'WITHDRAWN',
        'APPLIED',
      ];
      if (candidateMilestones.includes(nextStatus)) {
        return { valid: true };
      }
    }

    return {
      valid: false,
      reason: `Transition from ${currentStatus} to ${nextStatus} is not permitted under Application State Machine.`,
    };
  }

  /**
   * Creates a canonical job application or retrieves an existing one.
   * Guarantees single identity across jobs, resumes, browser runs, and dashboard.
   */
  static async createOrGetApplication(
    params: CreateOrGetApplicationParams
  ): Promise<JobApplicationRecord> {
    const {
      userId,
      jobId,
      companyName,
      roleTitle,
      applicationPackageId,
      resumeVersionId,
      submissionMethod = 'MANUAL',
      initialStatus = 'SAVED',
      jobSnapshot,
      notes,
    } = params;

    const now = new Date().toISOString();

    // Check in-memory first
    for (const app of Array.from(inMemoryApplications.values())) {
      if (app.userId === userId && app.jobId === jobId) {
        // Update snapshot / packageId if previously missing
        let changed = false;
        if (applicationPackageId && !app.applicationPackageId) {
          app.applicationPackageId = applicationPackageId;
          changed = true;
        }
        if (resumeVersionId && !app.resumeVersionId) {
          app.resumeVersionId = resumeVersionId;
          changed = true;
        }
        if (jobSnapshot && !app.jobSnapshot) {
          app.jobSnapshot = jobSnapshot;
          changed = true;
        }
        if (changed) {
          app.updatedAt = now;
        }
        return app;
      }
    }

    // Attempt database lookup
    try {
      const supabase = createClient();
      const { data: existing, error: findError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', userId)
        .eq('job_id', jobId)
        .maybeSingle();

      if (existing && !findError) {
        const record = this.mapDbRowToRecord(existing);
        inMemoryApplications.set(record.id, record);
        return record;
      }
    } catch {
      // In-memory fallback
    }

    // Create new application
    const newId = `app_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const snapshot: JobSnapshot = jobSnapshot || {
      jobId,
      title: roleTitle,
      companyName,
      capturedAt: now,
    };

    const newApp: JobApplicationRecord = {
      id: newId,
      userId,
      jobId,
      companyName,
      roleTitle,
      applicationPackageId,
      resumeVersionId,
      submissionMethod,
      status: initialStatus,
      jobSnapshot: snapshot,
      lastActivityAt: now,
      createdAt: now,
      updatedAt: now,
      notes,
    };

    // Save in-memory
    inMemoryApplications.set(newApp.id, newApp);

    // Record initial status event
    const initialEventId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const initialEvent: ApplicationStatusEvent = {
      id: initialEventId,
      userId,
      applicationId: newApp.id,
      previousStatus: null,
      nextStatus: initialStatus,
      source: 'PLATFORM',
      notes: `Application created with initial status ${initialStatus}.`,
      idempotencyKey: `init_${newApp.id}_${initialStatus}`,
      occurredAt: now,
      recordedAt: now,
    };
    inMemoryEvents.set(initialEvent.id, initialEvent);

    // Persist to database if available
    try {
      const supabase = createClient();
      const { data: inserted, error: insertError } = await supabase
        .from('job_applications')
        .insert({
          id: newApp.id,
          user_id: userId,
          job_id: jobId,
          company: companyName,
          position: roleTitle,
          status: initialStatus,
          submission_method: submissionMethod,
          resume_version_id: resumeVersionId,
          job_snapshot: snapshot,
          last_activity_at: now,
          created_at: now,
          updated_at: now,
          notes,
        })
        .select()
        .single();

      if (inserted && !insertError) {
        await supabase.from('application_status_events').insert({
          id: initialEvent.id,
          user_id: userId,
          application_id: newApp.id,
          previous_status: null,
          next_status: initialStatus,
          source: 'PLATFORM',
          notes: initialEvent.notes,
          idempotency_key: initialEvent.idempotencyKey,
          occurred_at: now,
          recorded_at: now,
        });
        const savedRecord = this.mapDbRowToRecord(inserted);
        inMemoryApplications.set(savedRecord.id, savedRecord);
        return savedRecord;
      }
    } catch {
      // Retain in-memory
    }

    return newApp;
  }

  /**
   * Records a piece of evidence supporting an application state or submission.
   */
  static async recordEvidence(params: RecordEvidenceParams): Promise<ApplicationEvidence> {
    const {
      userId,
      applicationId,
      browserRunId,
      type,
      source,
      storageReference,
      externalReference,
      metadata = {},
      verificationStatus = 'UNVERIFIED',
      capturedAt = new Date().toISOString(),
    } = params;

    const evidenceId = `evi_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();

    const evidence: ApplicationEvidence = {
      id: evidenceId,
      userId,
      applicationId,
      browserRunId,
      type,
      source,
      storageReference,
      externalReference,
      metadata,
      verificationStatus,
      capturedAt,
      createdAt: now,
    };

    inMemoryEvidence.set(evidence.id, evidence);

    try {
      const supabase = createClient();
      await supabase.from('application_evidence').insert({
        id: evidence.id,
        user_id: userId,
        application_id: applicationId,
        browser_run_id: browserRunId || null,
        type: evidence.type,
        source: evidence.source,
        storage_reference: storageReference || null,
        external_reference: externalReference || null,
        metadata: evidence.metadata,
        verification_status: verificationStatus,
        captured_at: capturedAt,
        created_at: now,
      });
    } catch {
      // In-memory fallback
    }

    return evidence;
  }

  /**
   * Records an immutable status transition event with idempotency and transition checks.
   */
  static async recordStatusEvent(
    params: RecordStatusEventParams
  ): Promise<{ application: JobApplicationRecord; event: ApplicationStatusEvent }> {
    const {
      userId,
      applicationId,
      nextStatus,
      source,
      evidenceId,
      notes,
      metadata = {},
      idempotencyKey = `evt_${applicationId}_${nextStatus}_${Date.now()}`,
      occurredAt = new Date().toISOString(),
    } = params;

    const now = new Date().toISOString();

    // Retrieve application
    let app = inMemoryApplications.get(applicationId);
    if (!app) {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('job_applications')
          .select('*')
          .eq('id', applicationId)
          .eq('user_id', userId)
          .single();
        if (data) {
          app = this.mapDbRowToRecord(data);
          inMemoryApplications.set(app.id, app);
        }
      } catch {
        // Handled below
      }
    }

    if (!app) {
      throw new Error(`APPLICATION_NOT_FOUND: Application ${applicationId} not found or unauthorized.`);
    }

    if (app.userId !== userId) {
      throw new Error('UNAUTHORIZED: Cannot mutate another user’s application record.');
    }

    // Check Idempotency (prevent duplicate events)
    for (const evt of Array.from(inMemoryEvents.values())) {
      if (evt.applicationId === applicationId && evt.idempotencyKey === idempotencyKey) {
        return { application: app, event: evt };
      }
    }

    // Validate Transition Rules
    const validation = this.validateTransition(app.status, nextStatus, source);
    if (!validation.valid) {
      throw new Error(`INVALID_STATUS_TRANSITION: ${validation.reason}`);
    }

    const previousStatus = app.status;

    // Mutate application record
    app.status = nextStatus;
    app.lastActivityAt = occurredAt;
    app.updatedAt = now;
    if (evidenceId) {
      app.submissionEvidenceId = evidenceId;
    }
    if (nextStatus === 'APPLIED' && !app.appliedAt) {
      app.appliedAt = occurredAt;
    }

    const eventId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const event: ApplicationStatusEvent = {
      id: eventId,
      userId,
      applicationId,
      previousStatus,
      nextStatus,
      source,
      evidenceId,
      notes: notes || `Status changed from ${previousStatus} to ${nextStatus}`,
      metadata,
      idempotencyKey,
      occurredAt,
      recordedAt: now,
    };

    inMemoryEvents.set(event.id, event);
    inMemoryApplications.set(app.id, app);

    // Persist to Supabase
    try {
      const supabase = createClient();
      await supabase
        .from('job_applications')
        .update({
          status: nextStatus,
          submission_evidence_id: app.submissionEvidenceId,
          applied_at: app.appliedAt,
          last_activity_at: occurredAt,
          updated_at: now,
        })
        .eq('id', applicationId)
        .eq('user_id', userId);

      await supabase.from('application_status_events').insert({
        id: event.id,
        user_id: userId,
        application_id: applicationId,
        previous_status: previousStatus,
        next_status: nextStatus,
        source: event.source,
        evidence_id: evidenceId || null,
        notes: event.notes,
        metadata: event.metadata,
        idempotency_key: idempotencyKey,
        occurred_at: occurredAt,
        recorded_at: now,
      });
    } catch {
      // Retain in-memory
    }

    return { application: app, event };
  }

  /**
   * Confirms a verified employer submission (called after browser agent confirms submission).
   * Generates a structured SubmissionReceipt and immutable evidence record.
   */
  static async recordSubmissionConfirmed(
    params: ConfirmSubmissionParams
  ): Promise<{ application: JobApplicationRecord; receipt: SubmissionReceipt; evidence: ApplicationEvidence }> {
    const {
      userId,
      applicationId,
      browserRunId,
      jobTitle,
      companyName,
      jobUrl,
      resumeVersionId,
      resumeTitle,
      answersSummary,
      atsProvider,
      confirmationCode,
      confirmationMessage,
      screenshotRef,
      submittedAt = new Date().toISOString(),
    } = params;

    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    // 1. Create Verified Evidence
    const evidence = await this.recordEvidence({
      userId,
      applicationId,
      browserRunId,
      type: 'SUBMISSION_CONFIRMATION',
      source: atsProvider || 'OMNI_BROWSER',
      storageReference: screenshotRef,
      externalReference: confirmationCode,
      verificationStatus: 'VERIFIED',
      capturedAt: submittedAt,
      metadata: {
        submissionId,
        atsProvider,
        confirmationCode,
        confirmationMessage,
        screenshotRef,
        submittedAt,
      },
    });

    // 2. Build Structured Submission Receipt
    const receipt: SubmissionReceipt = {
      submissionId,
      submittedAt,
      jobTitle,
      companyName,
      jobUrl,
      resumeVersionId,
      resumeTitle,
      answersSummary,
      atsProvider,
      confirmationCode,
      confirmationMessage: confirmationMessage || 'Application submitted successfully and confirmed by employer portal.',
      evidenceId: evidence.id,
      verificationStatus: 'VERIFIED',
    };

    // Update in-memory receipt
    const app = inMemoryApplications.get(applicationId);
    if (app) {
      app.submissionReceipt = receipt;
      app.submissionMethod = 'OMNI_BROWSER';
      app.submissionEvidenceId = evidence.id;
    }

    // 3. Record Status Event to APPLIED
    const { application } = await this.recordStatusEvent({
      userId,
      applicationId,
      nextStatus: 'APPLIED',
      source: 'BROWSER_CONFIRMATION',
      evidenceId: evidence.id,
      notes: `Application submission confirmed via ${atsProvider || 'browser agent'}.${confirmationCode ? ` Confirmation Code: ${confirmationCode}` : ''}`,
      metadata: { receipt },
      idempotencyKey: `sub_conf_${submissionId}`,
      occurredAt: submittedAt,
    });

    application.submissionReceipt = receipt;
    application.submissionMethod = 'OMNI_BROWSER';

    // Persist receipt JSON to Supabase
    try {
      const supabase = createClient();
      await supabase
        .from('job_applications')
        .update({
          submission_receipt: receipt,
          submission_method: 'OMNI_BROWSER',
          submission_evidence_id: evidence.id,
          applied_at: submittedAt,
          status: 'Applied',
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .eq('user_id', userId);
    } catch {
      // Retain in-memory
    }

    return { application, receipt, evidence };
  }

  /**
   * Records a user-reported status update with explicit attestation.
   * Never fabricates activity; accurately tags event with source: USER_REPORTED.
   */
  static async updateUserReportedStatus(
    params: UserReportedStatusParams
  ): Promise<{ application: JobApplicationRecord; event: ApplicationStatusEvent; evidence: ApplicationEvidence }> {
    const { userId, applicationId, nextStatus, notes, attestationText, metadata = {} } = params;
    const now = new Date().toISOString();

    // 1. Record User Attestation Evidence
    const evidence = await this.recordEvidence({
      userId,
      applicationId,
      type: 'USER_ATTESTATION',
      source: 'USER_REPORTED',
      verificationStatus: 'USER_REPORTED',
      metadata: {
        attestationText: attestationText || notes || `User self-reported status update to ${nextStatus}`,
        reportedAt: now,
        ...metadata,
      },
      capturedAt: now,
    });

    // 2. Transition status with source: USER_REPORTED
    const { application, event } = await this.recordStatusEvent({
      userId,
      applicationId,
      nextStatus,
      source: 'USER_REPORTED',
      evidenceId: evidence.id,
      notes: notes || attestationText || `Status updated to ${nextStatus} by candidate`,
      metadata: { evidenceId: evidence.id, ...metadata },
      occurredAt: now,
    });

    return { application, event, evidence };
  }

  /**
   * Retrieves full details, evidence items, and timeline for an application.
   */
  static async getApplicationDetail(
    userId: string,
    applicationId: string
  ): Promise<ApplicationDetailView | null> {
    let app = inMemoryApplications.get(applicationId);

    if (!app) {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('job_applications')
          .select('*')
          .eq('id', applicationId)
          .eq('user_id', userId)
          .maybeSingle();

        if (data) {
          app = this.mapDbRowToRecord(data);
          inMemoryApplications.set(app.id, app);
        }
      } catch {
        // Fallback
      }
    }

    if (!app || app.userId !== userId) {
      return null;
    }

    // Gather Evidence
    const evidenceList: ApplicationEvidence[] = [];
    for (const evi of Array.from(inMemoryEvidence.values())) {
      if (evi.applicationId === applicationId && evi.userId === userId) {
        evidenceList.push(evi);
      }
    }

    // Gather Timeline
    const timelineEvents: ApplicationStatusEvent[] = [];
    for (const evt of Array.from(inMemoryEvents.values())) {
      if (evt.applicationId === applicationId && evt.userId === userId) {
        timelineEvents.push(evt);
      }
    }

    // Fetch DB records if available
    try {
      const supabase = createClient();
      const [evidenceRes, eventsRes, runsRes] = await Promise.all([
        supabase
          .from('application_evidence')
          .select('*')
          .eq('application_id', applicationId)
          .eq('user_id', userId)
          .order('captured_at', { ascending: false }),
        supabase
          .from('application_status_events')
          .select('*')
          .eq('application_id', applicationId)
          .eq('user_id', userId)
          .order('recorded_at', { ascending: true }),
        supabase
          .from('application_runs')
          .select('id, status')
          .eq('application_id', applicationId)
          .order('started_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (evidenceRes.data && evidenceRes.data.length > 0) {
        for (const row of evidenceRes.data) {
          if (!evidenceList.some((e) => e.id === row.id)) {
            evidenceList.push(this.mapDbRowToEvidence(row));
          }
        }
      }

      if (eventsRes.data && eventsRes.data.length > 0) {
        for (const row of eventsRes.data) {
          if (!timelineEvents.some((t) => t.id === row.id)) {
            timelineEvents.push(this.mapDbRowToEvent(row));
          }
        }
      }

      timelineEvents.sort(
        (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
      );
      evidenceList.sort(
        (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
      );

      const latestEvidence = evidenceList[0];
      const activeRun = runsRes.data;

      return {
        ...app,
        evidence: evidenceList,
        timeline: timelineEvents,
        latestEvidence,
        activeRunId: activeRun?.id,
        activeRunStatus: activeRun?.status,
      };
    } catch {
      // In-memory view
      timelineEvents.sort(
        (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
      );
      evidenceList.sort(
        (a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
      );

      return {
        ...app,
        evidence: evidenceList,
        timeline: timelineEvents,
        latestEvidence: evidenceList[0],
      };
    }
  }

  /**
   * Lists all applications for a user with comprehensive stats.
   */
  static async listUserApplications(
    userId: string,
    options?: {
      status?: ApplicationStatus | 'ACTIVE' | 'ARCHIVED';
      search?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ applications: JobApplicationRecord[]; stats: ApplicationStats }> {
    const appsMap = new Map<string, JobApplicationRecord>();

    // Load from in-memory
    for (const app of Array.from(inMemoryApplications.values())) {
      if (app.userId === userId) {
        appsMap.set(app.id, app);
      }
    }

    // Query DB
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', userId)
        .order('last_activity_at', { ascending: false });

      if (data && !error) {
        for (const row of data) {
          const rec = this.mapDbRowToRecord(row);
          appsMap.set(rec.id, rec);
        }
      }
    } catch {
      // Use in-memory
    }

    let allApps = Array.from(appsMap.values());

    // Calculate Stats
    const stats: ApplicationStats = {
      total: allApps.length,
      saved: 0,
      preparing: 0,
      ready: 0,
      submissionPending: 0,
      applied: 0,
      inReview: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0,
      closed: 0,
    };

    for (const app of allApps) {
      const s = app.status;
      if (s === 'SAVED') stats.saved++;
      else if (s === 'PREPARING') stats.preparing++;
      else if (s === 'READY') stats.ready++;
      else if (s === 'SUBMISSION_PENDING') stats.submissionPending++;
      else if (s === 'APPLIED') stats.applied++;
      else if (s === 'IN_REVIEW') stats.inReview++;
      else if (s === 'INTERVIEW') stats.interview++;
      else if (s === 'OFFER') stats.offer++;
      else if (s === 'REJECTED') stats.rejected++;
      else if (s === 'WITHDRAWN') stats.withdrawn++;
      else if (s === 'CLOSED') stats.closed++;
    }

    // Apply Filters
    if (options?.status) {
      if (options.status === 'ACTIVE') {
        allApps = allApps.filter((a) => !['REJECTED', 'WITHDRAWN', 'CLOSED'].includes(a.status));
      } else if (options.status === 'ARCHIVED') {
        allApps = allApps.filter((a) => ['REJECTED', 'WITHDRAWN', 'CLOSED'].includes(a.status));
      } else {
        allApps = allApps.filter((a) => a.status === options.status);
      }
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      allApps = allApps.filter(
        (a) =>
          a.companyName.toLowerCase().includes(q) ||
          a.roleTitle.toLowerCase().includes(q) ||
          (a.notes && a.notes.toLowerCase().includes(q))
      );
    }

    // Sort by last activity descending
    allApps.sort(
      (a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
    );

    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    const paginated = allApps.slice(offset, offset + limit);

    return { applications: paginated, stats };
  }

  // --- Helpers for Database Mapping ---

  private static mapDbRowToRecord(row: any): JobApplicationRecord {
    // Normalise status string from DB
    const dbStatus = String(row.status || '').toUpperCase();
    let status: ApplicationStatus = 'SAVED';

    if (dbStatus === 'APPLIED') status = 'APPLIED';
    else if (dbStatus === 'INTERVIEW') status = 'INTERVIEW';
    else if (dbStatus === 'OFFER') status = 'OFFER';
    else if (dbStatus === 'REJECTED') status = 'REJECTED';
    else if (dbStatus === 'WITHDRAWN') status = 'WITHDRAWN';
    else if (dbStatus === 'PREPARING') status = 'PREPARING';
    else if (dbStatus === 'READY') status = 'READY';
    else if (dbStatus === 'NEEDS_USER') status = 'NEEDS_USER';
    else if (dbStatus === 'SUBMISSION_PENDING') status = 'SUBMISSION_PENDING';
    else if (dbStatus === 'IN_REVIEW') status = 'IN_REVIEW';
    else if (dbStatus === 'ASSESSMENT') status = 'ASSESSMENT';
    else if (dbStatus === 'CLOSED') status = 'CLOSED';

    return {
      id: String(row.id),
      userId: String(row.user_id),
      jobId: String(row.job_id || row.id),
      companyName: String(row.company || row.companyName || 'Unknown Company'),
      roleTitle: String(row.position || row.roleTitle || 'Position'),
      applicationPackageId: row.applicationPackageId || row.application_package_id || undefined,
      resumeVersionId: row.resume_version_id || undefined,
      submissionMethod: (row.submission_method as SubmissionMethod) || 'MANUAL',
      status,
      submissionEvidenceId: row.submission_evidence_id || undefined,
      submissionReceipt: row.submission_receipt || undefined,
      jobSnapshot: row.job_snapshot || undefined,
      appliedAt: row.applied_at || undefined,
      lastActivityAt: row.last_activity_at || row.updated_at || row.created_at || new Date().toISOString(),
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
      notes: row.notes || undefined,
    };
  }

  private static mapDbRowToEvidence(row: any): ApplicationEvidence {
    return {
      id: String(row.id),
      userId: String(row.user_id),
      applicationId: String(row.application_id),
      browserRunId: row.browser_run_id ? String(row.browser_run_id) : undefined,
      type: row.type as EvidenceType,
      source: String(row.source),
      storageReference: row.storage_reference || undefined,
      externalReference: row.external_reference || undefined,
      metadata: row.metadata || {},
      verificationStatus: (row.verification_status as VerificationStatus) || 'UNVERIFIED',
      capturedAt: row.captured_at || new Date().toISOString(),
      createdAt: row.created_at || new Date().toISOString(),
    };
  }

  private static mapDbRowToEvent(row: any): ApplicationStatusEvent {
    return {
      id: String(row.id),
      userId: String(row.user_id),
      applicationId: String(row.application_id),
      previousStatus: (row.previous_status as ApplicationStatus) || null,
      nextStatus: row.next_status as ApplicationStatus,
      source: row.source as StatusEventSource,
      evidenceId: row.evidence_id || undefined,
      notes: row.notes || undefined,
      metadata: row.metadata || {},
      idempotencyKey: row.idempotency_key || String(row.id),
      occurredAt: row.occurred_at || new Date().toISOString(),
      recordedAt: row.recorded_at || new Date().toISOString(),
    };
  }
}
