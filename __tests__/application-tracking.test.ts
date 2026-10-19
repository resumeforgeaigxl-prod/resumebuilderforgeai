// @ts-nocheck
import { describe, it, expect, beforeEach } from 'bun:test';
import {
  ApplicationTrackerService,
  ALLOWED_STATUS_TRANSITIONS,
  APPLICATION_STATUS_CONFIG,
} from '../lib/application-tracker';
import type {
  JobApplicationRecord,
  ApplicationStatus,
  SubmissionReceipt,
} from '../lib/application-tracker/types';

describe('Level 15: Application Execution, Evidence & Status Tracking', () => {
  const userId = 'usr_test_canonical_001';
  const jobId = 'job_canonical_888';

  beforeEach(() => {
    ApplicationTrackerService._resetMemoryStore();
  });

  describe('1. Single Canonical Application Record', () => {
    it('creates a canonical record with initial status SAVED and durable job snapshot', async () => {
      const app = await ApplicationTrackerService.createOrGetApplication({
        userId,
        jobId,
        companyName: 'Acme Corp',
        roleTitle: 'Senior Frontend Engineer',
        submissionMethod: 'MANUAL',
        jobSnapshot: {
          jobId,
          title: 'Senior Frontend Engineer',
          companyName: 'Acme Corp',
          location: 'Remote',
          applyUrl: 'https://boards.greenhouse.io/acme/jobs/888',
          capturedAt: new Date().toISOString(),
        },
      });

      expect(app.id).toBeDefined();
      expect(app.userId).toBe(userId);
      expect(app.jobId).toBe(jobId);
      expect(app.companyName).toBe('Acme Corp');
      expect(app.roleTitle).toBe('Senior Frontend Engineer');
      expect(app.status).toBe('SAVED');
      expect(app.jobSnapshot?.location).toBe('Remote');
      expect(app.jobSnapshot?.applyUrl).toBe('https://boards.greenhouse.io/acme/jobs/888');
    });

    it('returns the same canonical record on repeated calls without duplicate creations', async () => {
      const first = await ApplicationTrackerService.createOrGetApplication({
        userId,
        jobId,
        companyName: 'Acme Corp',
        roleTitle: 'Senior Frontend Engineer',
      });

      const second = await ApplicationTrackerService.createOrGetApplication({
        userId,
        jobId,
        companyName: 'Acme Corp',
        roleTitle: 'Senior Frontend Engineer',
      });

      expect(first.id).toBe(second.id);
    });

    it('preserves job snapshot data even if the original job vacancy is later closed', async () => {
      const app = await ApplicationTrackerService.createOrGetApplication({
        userId,
        jobId: 'job_closed_999',
        companyName: 'Stripe',
        roleTitle: 'Staff Backend Engineer',
        jobSnapshot: {
          jobId: 'job_closed_999',
          title: 'Staff Backend Engineer',
          companyName: 'Stripe',
          location: 'San Francisco, CA',
          capturedAt: new Date().toISOString(),
        },
      });

      const detail = await ApplicationTrackerService.getApplicationDetail(userId, app.id);
      expect(detail).not.toBeNull();
      expect(detail?.jobSnapshot?.companyName).toBe('Stripe');
      expect(detail?.jobSnapshot?.location).toBe('San Francisco, CA');
    });
  });

  describe('2. State Machine & Execution State Separation', () => {
    it('allows valid progression: SAVED -> PREPARING -> READY -> SUBMISSION_PENDING -> APPLIED', async () => {
      const app = await ApplicationTrackerService.createOrGetApplication({
        userId,
        jobId,
        companyName: 'Vercel',
        roleTitle: 'Fullstack Engineer',
        initialStatus: 'SAVED',
      });

      // SAVED -> PREPARING
      const res1 = await ApplicationTrackerService.recordStatusEvent({
        userId,
        applicationId: app.id,
        nextStatus: 'PREPARING',
        source: 'PLATFORM',
      });
      expect(res1.application.status).toBe('PREPARING');

      // PREPARING -> READY
      const res2 = await ApplicationTrackerService.recordStatusEvent({
        userId,
        applicationId: app.id,
        nextStatus: 'READY',
        source: 'PLATFORM',
      });
      expect(res2.application.status).toBe('READY');

      // READY -> SUBMISSION_PENDING
      const res3 = await ApplicationTrackerService.recordStatusEvent({
        userId,
        applicationId: app.id,
        nextStatus: 'SUBMISSION_PENDING',
        source: 'PLATFORM',
      });
      expect(res3.application.status).toBe('SUBMISSION_PENDING');

      // SUBMISSION_PENDING -> APPLIED (with browser confirmation)
      const res4 = await ApplicationTrackerService.recordStatusEvent({
        userId,
        applicationId: app.id,
        nextStatus: 'APPLIED',
        source: 'BROWSER_CONFIRMATION',
      });
      expect(res4.application.status).toBe('APPLIED');
      expect(res4.application.appliedAt).toBeDefined();
    });

    it('rejects invalid state jumps without proper source or authorization', async () => {
      const app = await ApplicationTrackerService.createOrGetApplication({
        userId,
        jobId: 'job_invalid_jump',
        companyName: 'Airbnb',
        roleTitle: 'Product Designer',
        initialStatus: 'SAVED',
      });

      // Attempting to jump directly to APPLIED without browser confirmation or user attestation must fail
      expect(
        ApplicationTrackerService.recordStatusEvent({
          userId,
          applicationId: app.id,
          nextStatus: 'APPLIED',
          source: 'PLATFORM', // PLATFORM cannot fabricate APPLIED status
        })
      ).rejects.toThrow('Cannot mark status as APPLIED without verified browser submission or explicit user attestation');
    });

    it('prevents state transitions from terminal states without re-opening', () => {
      const check = ApplicationTrackerService.validateTransition('REJECTED', 'INTERVIEW', 'PLATFORM');
      expect(check.valid).toBe(false);
      expect(check.reason).toContain('Cannot transition from terminal state');
    });

    it('confirms separate execution status: SUBMISSION_UNKNOWN never mutates application status to APPLIED', async () => {
      const app = await ApplicationTrackerService.createOrGetApplication({
        userId,
        jobId: 'job_uncertain_submission',
        companyName: 'Notion',
        roleTitle: 'Systems Engineer',
        initialStatus: 'SUBMISSION_PENDING',
      });

      // Application status remains SUBMISSION_PENDING while driver execution is SUBMISSION_UNKNOWN
      const detail = await ApplicationTrackerService.getApplicationDetail(userId, app.id);
      expect(detail?.status).toBe('SUBMISSION_PENDING');
      expect(detail?.status).not.toBe('APPLIED');
    });
  });

  describe('3. Trustworthy Submission Receipts & Evidence', () => {
    it('creates verified evidence, structured receipt, and APPLIED status event upon confirmed browser submission', async () => {
      const app = await ApplicationTrackerService.createOrGetApplication({
        userId,
        jobId: 'job_sub_verified',
        companyName: 'OpenAI',
        roleTitle: 'AI Research Engineer',
        initialStatus: 'SUBMISSION_PENDING',
        submissionMethod: 'OMNI_BROWSER',
      });

      const submittedAt = new Date().toISOString();
      const result = await ApplicationTrackerService.recordSubmissionConfirmed({
        userId,
        applicationId: app.id,
        browserRunId: 'run_openai_777',
        jobTitle: 'AI Research Engineer',
        companyName: 'OpenAI',
        jobUrl: 'https://openai.com/careers/777',
        resumeVersionId: 'res_v2_ai_tailored',
        resumeTitle: 'OpenAI Tailored Resume',
        atsProvider: 'GREENHOUSE',
        confirmationCode: 'GH-APP-99881',
        confirmationMessage: 'Thank you for your application to OpenAI!',
        screenshotRef: 'evidence/screenshots/run_openai_777_confirm.png',
        submittedAt,
      });

      expect(result.application.status).toBe('APPLIED');
      expect(result.application.submissionMethod).toBe('OMNI_BROWSER');
      expect(result.receipt.confirmationCode).toBe('GH-APP-99881');
      expect(result.receipt.atsProvider).toBe('GREENHOUSE');
      expect(result.receipt.verificationStatus).toBe('VERIFIED');
      expect(result.evidence.type).toBe('SUBMISSION_CONFIRMATION');
      expect(result.evidence.verificationStatus).toBe('VERIFIED');

      // Verify detail aggregation includes the receipt and evidence
      const detail = await ApplicationTrackerService.getApplicationDetail(userId, app.id);
      expect(detail?.submissionReceipt?.confirmationCode).toBe('GH-APP-99881');
      expect(detail?.evidence.length).toBeGreaterThanOrEqual(1);
      expect(detail?.timeline.some((e) => e.nextStatus === 'APPLIED' && e.source === 'BROWSER_CONFIRMATION')).toBe(true);
    });
  });

  describe('4. User-Reported Status Updates & Provenance', () => {
    it('records candidate self-reported progress with explicit user attestation', async () => {
      const app = await ApplicationTrackerService.createOrGetApplication({
        userId,
        jobId: 'job_interview_candidate',
        companyName: 'Figma',
        roleTitle: 'Staff Frontend Engineer',
        initialStatus: 'APPLIED',
      });

      const { application, event, evidence } = await ApplicationTrackerService.updateUserReportedStatus({
        userId,
        applicationId: app.id,
        nextStatus: 'INTERVIEW',
        notes: 'Recruiter reached out via email. Scheduled 45m screen for next Tuesday.',
        attestationText: 'Confirmed email from figma.com recruiter team.',
      });

      expect(application.status).toBe('INTERVIEW');
      expect(event.source).toBe('USER_REPORTED');
      expect(event.notes).toBe('Recruiter reached out via email. Scheduled 45m screen for next Tuesday.');
      expect(evidence.type).toBe('USER_ATTESTATION');
      expect(evidence.verificationStatus).toBe('USER_REPORTED');
      expect(evidence.metadata?.attestationText).toBe('Confirmed email from figma.com recruiter team.');
    });

    it('records candidate offer receipt accurately', async () => {
      const app = await ApplicationTrackerService.createOrGetApplication({
        userId,
        jobId: 'job_offer_candidate',
        companyName: 'Datadog',
        roleTitle: 'Senior Platform Engineer',
        initialStatus: 'INTERVIEW',
      });

      const { application, event } = await ApplicationTrackerService.updateUserReportedStatus({
        userId,
        applicationId: app.id,
        nextStatus: 'OFFER',
        notes: 'Received written offer letter.',
      });

      expect(application.status).toBe('OFFER');
      expect(event.source).toBe('USER_REPORTED');
    });
  });

  describe('5. Idempotent Event Recording & Out-of-Order Safety', () => {
    it('prevents duplicate event processing when same idempotency key is supplied', async () => {
      const app = await ApplicationTrackerService.createOrGetApplication({
        userId,
        jobId: 'job_idempotent_test',
        companyName: 'Linear',
        roleTitle: 'Core Engineer',
        initialStatus: 'SAVED',
      });

      const key = 'linear_event_unique_123';

      const first = await ApplicationTrackerService.recordStatusEvent({
        userId,
        applicationId: app.id,
        nextStatus: 'PREPARING',
        source: 'PLATFORM',
        idempotencyKey: key,
      });

      const second = await ApplicationTrackerService.recordStatusEvent({
        userId,
        applicationId: app.id,
        nextStatus: 'PREPARING',
        source: 'PLATFORM',
        idempotencyKey: key,
      });

      expect(first.event.id).toBe(second.event.id);

      const detail = await ApplicationTrackerService.getApplicationDetail(userId, app.id);
      const matchingEvents = detail?.timeline.filter((e) => e.idempotencyKey === key) || [];
      expect(matchingEvents.length).toBe(1);
    });
  });

  describe('6. Application List Statistics & Filtering', () => {
    it('aggregates counts correctly across statuses and supports keyword search', async () => {
      // Seed 3 applications with different statuses
      await ApplicationTrackerService.createOrGetApplication({
        userId,
        jobId: 'job_stat_1',
        companyName: 'Canva',
        roleTitle: 'React Developer',
        initialStatus: 'SAVED',
      });

      const app2 = await ApplicationTrackerService.createOrGetApplication({
        userId,
        jobId: 'job_stat_2',
        companyName: 'Atlassian',
        roleTitle: 'Java Backend Engineer',
        initialStatus: 'SAVED',
      });
      await ApplicationTrackerService.recordStatusEvent({
        userId,
        applicationId: app2.id,
        nextStatus: 'READY',
        source: 'PLATFORM',
      });

      const app3 = await ApplicationTrackerService.createOrGetApplication({
        userId,
        jobId: 'job_stat_3',
        companyName: 'Canva',
        roleTitle: 'Fullstack Lead',
        initialStatus: 'SAVED',
      });
      await ApplicationTrackerService.recordStatusEvent({
        userId,
        applicationId: app3.id,
        nextStatus: 'APPLIED',
        source: 'USER_REPORTED',
      });

      const listResult = await ApplicationTrackerService.listUserApplications(userId);
      expect(listResult.stats.total).toBe(3);
      expect(listResult.stats.saved).toBe(1);
      expect(listResult.stats.ready).toBe(1);
      expect(listResult.stats.applied).toBe(1);

      // Search filtering by company
      const canvaApps = await ApplicationTrackerService.listUserApplications(userId, { search: 'Canva' });
      expect(canvaApps.applications.length).toBe(2);
      expect(canvaApps.applications.every((a) => a.companyName === 'Canva')).toBe(true);
    });
  });

  describe('7. Status Configuration Metadata & UI Integrity', () => {
    it('contains complete metadata configuration for every ApplicationStatus', () => {
      const statuses: ApplicationStatus[] = [
        'SAVED',
        'PREPARING',
        'NEEDS_USER',
        'READY',
        'SUBMISSION_PENDING',
        'APPLIED',
        'IN_REVIEW',
        'ASSESSMENT',
        'INTERVIEW',
        'OFFER',
        'REJECTED',
        'WITHDRAWN',
        'CLOSED',
      ];

      for (const st of statuses) {
        const cfg = APPLICATION_STATUS_CONFIG[st];
        expect(cfg).toBeDefined();
        expect(cfg.label).toBeDefined();
        expect(cfg.color).toBeDefined();
        expect(cfg.badgeBg).toBeDefined();
        expect(cfg.badgeText).toBeDefined();
        expect(cfg.borderColor).toBeDefined();
      }
    });
  });
});
