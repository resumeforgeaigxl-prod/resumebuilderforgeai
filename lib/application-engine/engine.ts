/**
 * ResumeForge — Canonical Application Preparation Engine (Level 12)
 *
 * Orchestrates truthful, complete application package preparation:
 * - Freshness check first (rejects CLOSED jobs with 0 credits burned)
 * - Level 10 match check (honors hard blockers; allows user override for low priority)
 * - Level 11 two-phase credit reservations & settlements
 * - Truth-preserving resume tailoring
 * - Reusable vs job-specific answer mapping
 * - Structured unknown questions extraction (READY vs NEEDS_USER vs BLOCKED)
 * - Provider-neutral ExecutableApplicationPackage handoff contract
 */

import { createClient } from '@/lib/supabase/server';
import { getCandidateApplicationProfile, upsertApplicationAnswer } from '@/lib/capabilities/profile';
import { verifyCanonicalJob } from '@/lib/jobs/freshness';
import { matchCandidateToJob } from '@/lib/matching/engine';
import { CreditService, CogsService } from '@/lib/billing';
import { selectOrTailorResume } from './tailor-selection';
import { prepareApplicationAnswers } from './answers';
import { CANONICAL_FIELD_LIBRARY } from './question-library';
import type {
  ApplicationPackage,
  ApplicationPackageStatus,
  ExecutableApplicationPackage,
  PrepareApplicationOptions,
} from './types';
import type { CanonicalJobRecord } from '@/lib/jobs/types';

const PACKAGE_EXPIRY_DAYS = 14;

export class ApplicationPreparationEngine {
  /**
   * Prepares a canonical application package for a candidate and job.
   */
  static async preparePackage(
    options: PrepareApplicationOptions
  ): Promise<ApplicationPackage> {
    const { userId, jobId, forceFresh = false, userOverride = false, includeCoverLetter = false } = options;
    const supabase = createClient();
    const now = new Date().toISOString();

    // ─────────────────────────────────────────────────────────────
    // STEP 1: Verify Job Status First (Level 8 Integration)
    // Must be ACTIVE. If CLOSED -> BLOCKED immediately with 0 credit cost.
    // ─────────────────────────────────────────────────────────────
    let jobRecord: CanonicalJobRecord;
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !jobData) {
      throw new Error(`JOB_NOT_FOUND: Job ${jobId} does not exist.`);
    }

    jobRecord = jobData as CanonicalJobRecord;

    // Check if verification is stale (older than 2 hours)
    const isStale = !jobRecord.last_verified_at ||
      (Date.now() - new Date(jobRecord.last_verified_at).getTime() > 2 * 60 * 60 * 1000);

    if (isStale || forceFresh) {
      try {
        const verifyResult = await verifyCanonicalJob(jobId, { force: forceFresh });
        jobRecord.status = verifyResult.status;
        jobRecord.last_verified_at = verifyResult.verifiedAt;
      } catch (verErr) {
        console.warn('[ApplicationPreparationEngine] Freshness check warning:', verErr);
      }
    }

    if (jobRecord.status === 'CLOSED') {
      return this.createBlockedPackage({
        userId,
        job: jobRecord,
        reason: 'JOB_CLOSED',
        evidence: 'Job listing has been verified as closed or expired on the employer site.',
      });
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 2: Use Level 10 Candidate ↔ Job Match Result
    // Check match score, recommendations, and hard blockers.
    // ─────────────────────────────────────────────────────────────
    const matchResult = await matchCandidateToJob({
      userId,
      jobId,
      job: jobRecord,
      forceRecalculate: forceFresh,
    });

    if (matchResult.blockers.length > 0 || matchResult.recommendation === 'BLOCKED') {
      const topBlocker = matchResult.blockers[0];
      return this.createBlockedPackage({
        userId,
        job: jobRecord,
        reason: topBlocker?.code || 'HARD_BLOCKER',
        evidence: topBlocker?.reason || 'Candidate has a verified hard conflict with job requirements.',
        matchResult,
      });
    }

    // If recommendation is LOW_PRIORITY or SKIP and user did NOT explicitly override:
    if ((matchResult.recommendation === 'LOW_PRIORITY' || matchResult.recommendation === 'SKIP') && !userOverride) {
      return this.createBlockedPackage({
        userId,
        job: jobRecord,
        reason: 'LOW_MATCH_RECOMMENDATION',
        evidence: `Match score is ${matchResult.score}% (${matchResult.recommendation}). To prepare this application anyway, enable user override.`,
        matchResult,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 3: Reserve Preparation Credits (Level 11 Integration)
    // APPLICATION_PREPARE = 4 credits
    // ─────────────────────────────────────────────────────────────
    const reservation = await CreditService.reserveCredits({
      userId,
      action: 'APPLICATION_PREPARE',
      amount: 4,
      referenceType: 'application_package',
      referenceId: jobId,
    });

    if (!reservation.success) {
      throw new Error(`INSUFFICIENT_CREDITS: Required 4 credits for application preparation.`);
    }

    try {
      // ─────────────────────────────────────────────────────────────
      // STEP 4: Load Candidate Profile & Snapshots
      // ─────────────────────────────────────────────────────────────
      const profile = await getCandidateApplicationProfile(userId);

      const candidateSnapshot = {
        profileVersion: `${profile.completeness.percentage}%_${profile.readiness.status}`,
        profileCompleteness: profile.completeness.percentage,
        fullName: profile.identity.fullName || 'Candidate',
        email: profile.identity.email || '',
        phone: profile.identity.phoneNumber,
        location: profile.identity.currentCity || profile.identity.country,
        verifiedAt: now,
      };

      const jobSnapshot = {
        id: jobRecord.id,
        title: jobRecord.title,
        company: jobRecord.company,
        applyUrl: jobRecord.apply_url || jobRecord.canonical_url || '',
        status: jobRecord.status,
        lastVerifiedAt: jobRecord.last_verified_at || now,
        location: jobRecord.location,
        employmentType: jobRecord.employment_type,
        descriptionSnippet: jobRecord.description ? jobRecord.description.slice(0, 300) : '',
      };

      // ─────────────────────────────────────────────────────────────
      // STEP 5: Select or Truthfully Tailor Resume
      // (Reuses existing tailored resumes without double charging)
      // ─────────────────────────────────────────────────────────────
      const resumeSelection = await selectOrTailorResume({
        userId,
        job: jobRecord,
        profile,
        matchResult,
        forceFreshTailor: forceFresh,
      });

      // ─────────────────────────────────────────────────────────────
      // STEP 6: Execute Application Answer Engine & Document Check
      // ─────────────────────────────────────────────────────────────
      const answerResult = await prepareApplicationAnswers({
        userId,
        profile,
        job: jobRecord,
        resumeId: resumeSelection.resumeId,
        includeCoverLetter,
      });

      if (answerResult.hasBlockerAnswer) {
        // Release reservation and return BLOCKED
        await CreditService.refundReservation({
          reservationId: reservation.reservationId!,
          reason: 'Application answer contradicted mandatory employer requirement.',
        });

        return this.createBlockedPackage({
          userId,
          job: jobRecord,
          reason: 'REQUIREMENT_CONTRADICTED',
          evidence: answerResult.blockerReason || 'Candidate answer contradicts mandatory requirement.',
          matchResult,
        });
      }

      // ─────────────────────────────────────────────────────────────
      // STEP 7: Calculate Package Status & Readiness Score
      // ─────────────────────────────────────────────────────────────
      const requiredQuestions = answerResult.unknownQuestions.filter((q) => q.required);
      const isReady = requiredQuestions.length === 0;
      const status: ApplicationPackageStatus = isReady ? 'READY' : 'NEEDS_USER';

      // Readiness score calculation
      const totalKeyFields = 10;
      const resolvedRequired = totalKeyFields - requiredQuestions.length;
      const readinessScore = Math.max(10, Math.min(100, Math.round((resolvedRequired / totalKeyFields) * 100)));

      const expiresAt = new Date(Date.now() + PACKAGE_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

      // ─────────────────────────────────────────────────────────────
      // STEP 8: Persist Application Package in Supabase
      // ─────────────────────────────────────────────────────────────
      const packagePayload = {
        user_id: userId,
        job_id: jobId,
        status,
        version: 1,
        candidate_snapshot: candidateSnapshot,
        job_snapshot: jobSnapshot,
        resume_id: resumeSelection.resumeId,
        tailored_resume_id: resumeSelection.isTailored ? resumeSelection.resumeId : null,
        tailoring_status: resumeSelection.tailoringStatus,
        tailoring_evidence: resumeSelection.tailoringEvidence || {},
        answers: answerResult.answers,
        unknown_questions: answerResult.unknownQuestions,
        documents: answerResult.documents,
        match_snapshot: {
          score: matchResult.score,
          category: matchResult.category,
          recommendation: matchResult.recommendation,
          confidence: matchResult.confidence,
          underrepresentedSkills: matchResult.explanation.underrepresentedSkills,
          missingRequirements: matchResult.explanation.missingRequirements,
          blockers: matchResult.blockers.map((b) => b.reason),
        },
        readiness_score: readinessScore,
        credit_operation: {
          reservationId: reservation.reservationId,
          preparedCharged: 4,
          tailorCharged: resumeSelection.creditsCharged,
        },
        updated_at: now,
        expires_at: expiresAt,
      };

      // Check if an existing package row exists for this user and job
      const { data: existingPkg } = await supabase
        .from('application_packages')
        .select('id, version')
        .eq('user_id', userId)
        .eq('job_id', jobId)
        .maybeSingle();

      let savedPackageId: string;
      if (existingPkg) {
        packagePayload.version = (existingPkg.version || 1) + 1;
        const { error: updateErr } = await supabase
          .from('application_packages')
          .update(packagePayload)
          .eq('id', existingPkg.id);

        if (updateErr) throw updateErr;
        savedPackageId = existingPkg.id;
      } else {
        const { data: inserted, error: insertErr } = await supabase
          .from('application_packages')
          .insert(packagePayload)
          .select('id')
          .single();

        if (insertErr) throw insertErr;
        savedPackageId = inserted.id;
      }

      // Link package with job_applications table for unified tracking
      await this.syncWithJobApplications(userId, jobId, savedPackageId, status);

      // ─────────────────────────────────────────────────────────────
      // STEP 9: Settle Level 11 Credit Reservation & Record COGS
      // ─────────────────────────────────────────────────────────────
      await CreditService.settleReservation({
        reservationId: reservation.reservationId!,
        actualCredits: 4,
        metadata: {
          packageId: savedPackageId,
          jobTitle: jobRecord.title,
          company: jobRecord.company,
          status,
        },
      });

      // Record internal COGS usage cost (approx 1,500 prompt tokens for matching + prep)
      await CogsService.recordUsageCost({
        userId,
        action: 'APPLICATION_PREPARE',
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        inputTokens: 1200,
        outputTokens: 300,
      });

      return {
        id: savedPackageId,
        userId,
        jobId,
        status,
        version: packagePayload.version,
        candidateSnapshot,
        jobSnapshot,
        resumeId: resumeSelection.resumeId,
        tailoredResumeId: resumeSelection.isTailored ? resumeSelection.resumeId : null,
        tailoringStatus: resumeSelection.tailoringStatus,
        tailoringEvidence: resumeSelection.tailoringEvidence,
        answers: answerResult.answers,
        unknownQuestions: answerResult.unknownQuestions,
        documents: answerResult.documents,
        matchSnapshot: packagePayload.match_snapshot,
        readinessScore,
        creditOperation: packagePayload.credit_operation,
        createdAt: now,
        updatedAt: now,
        expiresAt,
      };
    } catch (err: any) {
      // Release reservation on system failure
      if (reservation.reservationId) {
        await CreditService.refundReservation({
          reservationId: reservation.reservationId,
          reason: `System failure during preparation: ${err.message || 'UNKNOWN_ERROR'}`,
        });
      }
      throw err;
    }
  }

  /**
   * Completes missing user answers for a package.
   * Updates global candidate profile for reusable fields, and updates package to READY.
   */
  static async answerMissingQuestions(options: {
    packageId: string;
    userId: string;
    answers: Record<string, any>;
  }): Promise<ApplicationPackage> {
    const { packageId, userId, answers: userAnswers } = options;
    const supabase = createClient();
    const now = new Date().toISOString();

    const { data: pkg, error: fetchErr } = await supabase
      .from('application_packages')
      .select('*')
      .eq('id', packageId)
      .eq('user_id', userId)
      .single();

    if (fetchErr || !pkg) {
      throw new Error(`APPLICATION_PACKAGE_NOT_FOUND: Package ${packageId} does not exist.`);
    }

    const currentAnswers = (pkg.answers || {}) as Record<string, any>;
    const currentUnknowns = (pkg.unknown_questions || []) as any[];

    // Process each provided answer
    for (const [key, rawValue] of Object.entries(userAnswers)) {
      const fieldDef = CANONICAL_FIELD_LIBRARY[key];
      const isReusable = fieldDef ? fieldDef.isReusable : true;

      // Update package answer
      currentAnswers[key] = {
        key,
        label: fieldDef?.label || key,
        type: fieldDef?.type || 'TEXT',
        value: rawValue,
        status: 'VERIFIED',
        source: 'user',
        verified: true,
        required: fieldDef?.required ?? false,
        sensitive: fieldDef?.sensitive ?? false,
      };

      // If reusable globally, update Candidate Application Profile answer bank!
      if (isReusable && rawValue !== undefined && rawValue !== null && rawValue !== '') {
        try {
          await upsertApplicationAnswer(userId, key, rawValue, {
            status: 'VERIFIED',
            verified: true,
            source: 'user',
          });
        } catch (upErr) {
          console.warn(`[answerMissingQuestions] Could not update profile answer for ${key}:`, upErr);
        }
      }
    }

    // Filter out answered questions from unknown_questions
    const remainingUnknowns = currentUnknowns.filter((q) => !(q.key in userAnswers));
    const remainingRequired = remainingUnknowns.filter((q) => q.required);

    const isReady = remainingRequired.length === 0;
    const newStatus: ApplicationPackageStatus = isReady ? 'READY' : 'NEEDS_USER';
    const newVersion = (pkg.version || 1) + 1;

    // Update readiness score
    const totalKeyFields = 10;
    const resolvedRequired = totalKeyFields - remainingRequired.length;
    const readinessScore = Math.max(10, Math.min(100, Math.round((resolvedRequired / totalKeyFields) * 100)));

    const { data: updated, error: updateErr } = await supabase
      .from('application_packages')
      .update({
        status: newStatus,
        version: newVersion,
        answers: currentAnswers,
        unknown_questions: remainingUnknowns,
        readiness_score: readinessScore,
        updated_at: now,
      })
      .eq('id', packageId)
      .select('*')
      .single();

    if (updateErr || !updated) {
      throw updateErr || new Error('Failed to update application package.');
    }

    // Sync with job_applications status
    await this.syncWithJobApplications(userId, pkg.job_id, packageId, newStatus);

    return this.mapPackageRow(updated);
  }

  /**
   * Future Browser Agent Contract:
   * Returns a fully verified, executable application package ready for form filling.
   * Throws if status is not READY or job is no longer active.
   */
  static async getExecutableApplicationPackage(
    packageId: string,
    userId: string
  ): Promise<ExecutableApplicationPackage> {
    const supabase = createClient();

    const { data: pkg, error } = await supabase
      .from('application_packages')
      .select('*, jobs:job_id(*)')
      .eq('id', packageId)
      .eq('user_id', userId)
      .single();

    if (error || !pkg) {
      throw new Error(`APPLICATION_PACKAGE_NOT_FOUND: Package ${packageId} does not exist.`);
    }

    if (pkg.status !== 'READY') {
      throw new Error(
        `PACKAGE_NOT_READY: Application package status is ${pkg.status}. All missing questions must be resolved before execution.`
      );
    }

    // Check if job is still active
    const job = pkg.jobs;
    if (!job || job.status === 'CLOSED') {
      // Invalidate package
      await supabase
        .from('application_packages')
        .update({ status: 'BLOCKED', blocked_reason: 'JOB_CLOSED_POST_PREPARATION' })
        .eq('id', packageId);

      throw new Error(`JOB_CLOSED: The job listing has been closed and cannot be submitted.`);
    }

    // Check expiry
    if (pkg.expires_at && new Date(pkg.expires_at).getTime() < Date.now()) {
      await supabase
        .from('application_packages')
        .update({ status: 'EXPIRED' })
        .eq('id', packageId);

      throw new Error(`PACKAGE_EXPIRED: Application package has expired and must be re-prepared.`);
    }

    // Extract clean flat candidate fields dictionary for form filling
    const candidateFields: Record<string, any> = {};
    const answersObj = pkg.answers || {};
    for (const [key, field] of Object.entries(answersObj)) {
      candidateFields[key] = (field as any).value;
    }

    const resumeDoc = (pkg.documents || []).find((d: any) => d.type === 'RESUME');

    return {
      packageId: pkg.id,
      userId: pkg.user_id,
      jobId: pkg.job_id,
      applyUrl: pkg.job_snapshot?.applyUrl || job.apply_url || job.canonical_url || '',
      candidateFields,
      answers: answersObj,
      documents: pkg.documents || [],
      resumeUrl: resumeDoc?.url || '',
      resumeId: pkg.resume_id || '',
      status: 'READY',
      preparedAt: pkg.updated_at,
      expiresAt: pkg.expires_at || '',
    };
  }

  /**
   * Fetches an application package by ID or Job ID for a user.
   */
  static async getPackage(options: {
    userId: string;
    packageId?: string;
    jobId?: string;
  }): Promise<ApplicationPackage | null> {
    const { userId, packageId, jobId } = options;
    const supabase = createClient();

    let query = supabase.from('application_packages').select('*').eq('user_id', userId);

    if (packageId) {
      query = query.eq('id', packageId);
    } else if (jobId) {
      query = query.eq('job_id', jobId).order('updated_at', { ascending: false }).limit(1);
    } else {
      return null;
    }

    const { data: pkg, error } = await query.maybeSingle();
    if (error || !pkg) return null;

    return this.mapPackageRow(pkg);
  }

  /**
   * Discards an application package safely without deleting the canonical job,
   * candidate profile, or master resume.
   */
  static async discardPackage(packageId: string, userId: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from('application_packages')
      .delete()
      .eq('id', packageId)
      .eq('user_id', userId);

    return !error;
  }

  /**
   * Synchronizes application package state with the existing job_applications table.
   */
  private static async syncWithJobApplications(
    userId: string,
    jobId: string,
    packageId: string,
    packageStatus: ApplicationPackageStatus
  ): Promise<void> {
    const supabase = createClient();
    const now = new Date().toISOString();

    // Preparation status mapping:
    // Does NOT mark 'Applied'. Uses 'Preparing', 'Needs Input', 'Ready'.
    let preparationStatus = 'Preparing';
    if (packageStatus === 'READY') preparationStatus = 'Ready';
    else if (packageStatus === 'NEEDS_USER') preparationStatus = 'Needs Input';
    else if (packageStatus === 'BLOCKED') preparationStatus = 'Blocked';

    const { data: existingApp } = await supabase
      .from('job_applications')
      .select('id, status')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .maybeSingle();

    if (existingApp) {
      // Do not overwrite if user already marked it as 'Applied', 'Interview', 'Offer', 'Rejected'
      const isTerminal = ['Applied', 'Interview', 'Offer', 'Rejected'].includes(existingApp.status);
      await supabase
        .from('job_applications')
        .update({
          application_package_id: packageId,
          preparation_status: preparationStatus,
          status: isTerminal ? existingApp.status : preparationStatus,
          applied_at: now,
        })
        .eq('id', existingApp.id);
    } else {
      await supabase.from('job_applications').insert({
        user_id: userId,
        job_id: jobId,
        application_package_id: packageId,
        preparation_status: preparationStatus,
        status: preparationStatus,
        applied_at: now,
      });
    }
  }

  /**
   * Helper to construct a BLOCKED package result.
   */
  private static createBlockedPackage(options: {
    userId: string;
    job: CanonicalJobRecord;
    reason: string;
    evidence: string;
    matchResult?: any;
  }): ApplicationPackage {
    const now = new Date().toISOString();
    return {
      id: `blocked_${Date.now()}`,
      userId: options.userId,
      jobId: options.job.id,
      status: 'BLOCKED',
      version: 1,
      candidateSnapshot: {
        profileVersion: 'v1',
        profileCompleteness: 0,
        fullName: '',
        email: '',
        verifiedAt: now,
      },
      jobSnapshot: {
        id: options.job.id,
        title: options.job.title,
        company: options.job.company,
        applyUrl: options.job.apply_url || options.job.canonical_url || '',
        status: options.job.status,
        lastVerifiedAt: options.job.last_verified_at || now,
      },
      tailoringStatus: 'NONE',
      answers: {},
      unknownQuestions: [],
      documents: [],
      matchSnapshot: options.matchResult ? {
        score: options.matchResult.score,
        category: options.matchResult.category,
        recommendation: options.matchResult.recommendation,
        confidence: options.matchResult.confidence,
        underrepresentedSkills: options.matchResult.explanation?.underrepresentedSkills || [],
        missingRequirements: options.matchResult.explanation?.missingRequirements || [],
        blockers: options.matchResult.blockers?.map((b: any) => b.reason) || [],
      } : {
        score: 0,
        category: 'LOW',
        recommendation: 'BLOCKED',
        confidence: 'HIGH',
        underrepresentedSkills: [],
        missingRequirements: [],
        blockers: [options.evidence],
      },
      readinessScore: 0,
      blockedReason: options.reason,
      blockedEvidence: options.evidence,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Maps a raw Postgres database row to the typed ApplicationPackage interface.
   */
  private static mapPackageRow(row: any): ApplicationPackage {
    return {
      id: row.id,
      userId: row.user_id,
      jobId: row.job_id,
      jobApplicationId: row.job_application_id,
      status: row.status as ApplicationPackageStatus,
      version: row.version,
      candidateSnapshot: row.candidate_snapshot,
      jobSnapshot: row.job_snapshot,
      resumeId: row.resume_id,
      resumeVersionId: row.resume_version_id,
      tailoredResumeId: row.tailored_resume_id,
      tailoringStatus: row.tailoring_status || 'NONE',
      tailoringEvidence: row.tailoring_evidence,
      answers: row.answers || {},
      unknownQuestions: row.unknown_questions || [],
      documents: row.documents || [],
      matchSnapshot: row.match_snapshot || {},
      readinessScore: row.readiness_score || 0,
      blockedReason: row.blocked_reason,
      blockedEvidence: row.blocked_evidence,
      creditOperation: row.credit_operation,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      expiresAt: row.expires_at,
    };
  }
}
