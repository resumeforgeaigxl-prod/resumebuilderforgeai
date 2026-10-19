/**
 * ResumeForge — Approval Validity & Invalidation Engine (Level 14)
 * Ensures that approval is strictly tied to the exact reviewed application state.
 * Automatically invalidates approval upon material form, package, resume, or session changes.
 */

import crypto from 'crypto';
import type { ApplicationFormSchema, FormFieldMapping } from './types';

export const MAX_APPROVAL_AGE_MS = 30 * 60 * 1000; // 30 minutes max approval validity

export interface ApprovalSnapshot {
  id: string;
  approvalId: string;
  userId: string;
  packageId: string;
  applicationId?: string;
  packageVersion: number;
  resumeVersion: string;
  answersHash: string;
  formHash: string;
  approvedAt: string;
  formSchema?: any;
  answers?: Record<string, any>;
}

export class ApprovalManager {
  /**
   * Generates a stable cryptographic hash for form fields and structure.
   */
  static hashFormSchema(schema?: any): string {
    if (!schema) return 'empty_form';
    const representation = {
      provider: schema.provider,
      fields: (schema.fields || []).map((f: any) => ({
        selector: f.selector || f.key,
        type: f.type,
        required: f.required,
        label: f.label,
      })),
      buttonsCount: (schema.buttons || []).length,
    };
    return crypto.createHash('sha256').update(JSON.stringify(representation)).digest('hex').substring(0, 16);
  }

  /**
   * Generates a stable hash for verified answers.
   */
  static hashAnswers(mappings?: any): string {
    if (!mappings) return 'no_answers';
    if (Array.isArray(mappings)) {
      if (mappings.length === 0) return 'no_answers';
      const sorted = [...mappings]
        .sort((a, b) => (a.formFieldKey || a.key || '').localeCompare(b.formFieldKey || b.key || ''))
        .map((m) => `${m.formFieldKey || m.key}=${String(m.value)}`);
      return crypto.createHash('sha256').update(sorted.join('|')).digest('hex').substring(0, 16);
    }
    // Object dictionary
    const entries = Object.entries(mappings);
    if (entries.length === 0) return 'no_answers';
    const sorted = entries
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${String(v)}`);
    return crypto.createHash('sha256').update(sorted.join('|')).digest('hex').substring(0, 16);
  }

  /**
   * Generates a secure Approval ID tied to the exact reviewed application state.
   */
  static generateApprovalId(params: {
    userId: string;
    packageId: string;
    resumeVersion: string;
    answersHash: string;
    formHash: string;
  }): string {
    const raw = `${params.userId}:${params.packageId}:${params.resumeVersion}:${params.answersHash}:${params.formHash}:${Date.now()}`;
    const token = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 24);
    return `appr_${token}`;
  }

  /**
   * Creates an Approval Snapshot recording the approved application state.
   */
  static createApproval(params: {
    userId: string;
    applicationId?: string;
    packageId?: string;
    packageVersion?: number;
    resumeVersion?: string | number;
    formSchema?: any;
    answers?: any;
  }): ApprovalSnapshot {
    const {
      userId,
      applicationId = '',
      packageId = applicationId,
      packageVersion = 1,
      resumeVersion = '1',
      formSchema,
      answers,
    } = params;

    const resumeVerStr = String(resumeVersion);
    const formHash = this.hashFormSchema(formSchema);
    const answersHash = this.hashAnswers(answers);
    const approvalId = this.generateApprovalId({
      userId,
      packageId,
      resumeVersion: resumeVerStr,
      answersHash,
      formHash,
    });

    return {
      id: approvalId,
      approvalId,
      userId,
      applicationId,
      packageId,
      packageVersion,
      resumeVersion: resumeVerStr,
      answersHash,
      formHash,
      approvedAt: new Date().toISOString(),
      formSchema,
      answers,
    };
  }

  /**
   * Validates whether an existing approval remains valid for submission.
   * Supports both explicit snapshot object and individual hash fields.
   */
  static validateApproval(params: {
    approval?: ApprovalSnapshot | null;
    currentPackageVersion?: number;
    currentResumeVersion?: string | number | null;
    currentFormSchema?: any;
    currentAnswers?: any;
    approvalId?: string | null;
    approvedAt?: string | null;
    originalResumeVersion?: string | null;
    originalAnswersHash?: string | null;
    currentAnswersHash?: string | null;
    originalFormHash?: string | null;
    currentFormHash?: string | null;
    sessionRebuilt?: boolean;
    isJobClosed?: boolean;
    isPackageStale?: boolean;
  }): { valid: boolean; isValid: boolean; reason?: string } {
    const {
      approval,
      currentPackageVersion,
      currentResumeVersion,
      currentFormSchema,
      currentAnswers,
      sessionRebuilt,
      isJobClosed,
      isPackageStale,
    } = params;

    const approvalId = approval ? approval.approvalId || approval.id : params.approvalId;
    const approvedAt = approval ? approval.approvedAt : params.approvedAt;
    const originalResume = approval ? approval.resumeVersion : params.originalResumeVersion;
    const currentResume = currentResumeVersion !== undefined ? String(currentResumeVersion) : undefined;
    const originalAnswers = approval ? approval.answersHash : params.originalAnswersHash;
    const currentAnswersHash = currentAnswers !== undefined ? this.hashAnswers(currentAnswers) : params.currentAnswersHash;
    const originalForm = approval ? approval.formHash : params.originalFormHash;
    const currentFormHash = currentFormSchema !== undefined ? this.hashFormSchema(currentFormSchema) : params.currentFormHash;

    if (!approvalId || !approvedAt) {
      return { valid: false, isValid: false, reason: 'NO_APPROVAL: Application has not been approved by the user.' };
    }

    // 1. Expiration check (> 30 mins)
    const ageMs = Date.now() - new Date(approvedAt).getTime();
    if (ageMs > MAX_APPROVAL_AGE_MS) {
      return {
        valid: false,
        isValid: false,
        reason: 'APPROVAL_EXPIRED: User approval expired after 30 minutes. Fresh review required.',
      };
    }

    // 2. Job Closed
    if (isJobClosed) {
      return { valid: false, isValid: false, reason: 'JOB_CLOSED: Target job has closed since approval was granted.' };
    }

    // 3. Package Stale
    if (isPackageStale) {
      return { valid: false, isValid: false, reason: 'PACKAGE_STALE: Application package has expired or become stale.' };
    }

    // 4. Session Rebuilt
    if (sessionRebuilt) {
      return {
        valid: false,
        isValid: false,
        reason: 'SESSION_REBUILT: Browser session was rebuilt from scratch. Fresh approval required before submission.',
      };
    }

    // 5. Resume Version Changed
    if (originalResume && currentResume && originalResume !== currentResume) {
      return {
        valid: false,
        isValid: false,
        reason: `RESUME_VERSION_CHANGED: Resume was updated (from ${originalResume} to ${currentResume}) after approval.`,
      };
    }

    // 6. Answers Changed
    if (originalAnswers && currentAnswersHash && originalAnswers !== currentAnswersHash) {
      return {
        valid: false,
        isValid: false,
        reason: 'ANSWERS_CHANGED: Application answers were modified after approval was granted.',
      };
    }

    // 7. Form Layout Materially Changed
    if (originalForm && currentFormHash && originalForm !== currentFormHash) {
      return {
        valid: false,
        isValid: false,
        reason: 'FORM_CHANGED: Employer form layout or fields changed after approval was granted.',
      };
    }

    return { valid: true, isValid: true };
  }
}
