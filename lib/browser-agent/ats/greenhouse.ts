/**
 * Greenhouse ATS Application Form Adapter (Level 13)
 */

import type {
  AtsProvider,
  ApplicationFormAdapter,
  ApplicationFormSchema,
  FieldMappingResult,
  FormFieldMapping,
  FillResult,
  ValidationResult,
  SubmissionResult,
  PageState,
  BrowserDriver,
  BrowserSession,
} from '../types';
import type { ApplicationPackage } from '@/lib/application-engine/types';
import { FieldMapper } from './field-mapper';

export class GreenhouseAdapter implements ApplicationFormAdapter {
  readonly provider: AtsProvider = 'GREENHOUSE';

  detect(url: string, pageState: PageState): boolean {
    const cleanUrl = url.toLowerCase();
    const html = (pageState.html || '').toLowerCase();
    return (
      cleanUrl.includes('greenhouse.io') ||
      cleanUrl.includes('grnh.se') ||
      html.includes('id="application_form"') ||
      html.includes('data-qa="greenhouse"')
    );
  }

  async inspect(pageState: PageState): Promise<ApplicationFormSchema> {
    const html = pageState.html || '';
    const captchaDetected = html.includes('g-recaptcha') || html.includes('h-captcha');
    const authRequired = html.includes('Sign in to apply') || html.includes('login_required');

    return {
      provider: 'GREENHOUSE',
      formSelector: '#application_form',
      fields: [], // In real flow, populated from driver.inspectForm()
      buttons: [
        {
          text: 'Submit Application',
          selector: '#submit_app',
          type: 'SUBMIT',
          isFinalSubmit: true,
        },
      ],
      captchaDetected,
      authRequired,
      accountCreationRequired: false,
      hasSubmitButton: true,
      hasNavigationButton: false,
    };
  }

  mapFields(schema: ApplicationFormSchema, appPackage: ApplicationPackage): FieldMappingResult {
    return FieldMapper.mapFields(schema.fields, appPackage);
  }

  async fill(
    driver: BrowserDriver,
    session: BrowserSession,
    mappings: FormFieldMapping[],
    appPackage: ApplicationPackage
  ): Promise<FillResult> {
    let filledCount = 0;
    let skippedCount = 0;
    const errors: { field: string; error: string }[] = [];
    let resumeUploaded = false;
    let resumeFileName = '';

    for (const mapping of mappings) {
      if (mapping.status === 'SKIPPED' || mapping.value === null || mapping.value === undefined) {
        skippedCount++;
        continue;
      }

      try {
        if (mapping.type === 'file') {
          const resumeDoc = appPackage.documents.find((d) => d.type === 'RESUME');
          resumeFileName = resumeDoc?.title || `Resume_${appPackage.candidateSnapshot.fullName}.pdf`;
          await driver.uploadFile(session, mapping.selector, {
            filename: resumeFileName,
            mimeType: 'application/pdf',
            versionId: appPackage.resumeVersionId || undefined,
          });
          resumeUploaded = true;
          filledCount++;
        } else if (mapping.type === 'select') {
          await driver.selectOption(session, mapping.selector, String(mapping.value));
          filledCount++;
        } else {
          await driver.fillField(session, mapping.selector, mapping.value);
          filledCount++;
        }
      } catch (err: any) {
        errors.push({ field: mapping.formFieldKey, error: err.message });
      }
    }

    return {
      success: errors.length === 0,
      filledCount,
      skippedCount,
      errors,
      resumeUploaded,
      resumeFileName,
    };
  }

  async validate(
    _driver: BrowserDriver,
    _session: BrowserSession,
    schema: ApplicationFormSchema
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (schema.captchaDetected) {
      errors.push('CAPTCHA verification required on employer form.');
    }
    if (schema.authRequired) {
      errors.push('Authentication or employer login required.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      readyForApproval: errors.length === 0,
      unresolvedCount: errors.length,
    };
  }

  async submit(
    driver: BrowserDriver,
    session: BrowserSession,
    userApproved: boolean
  ): Promise<SubmissionResult> {
    if (!userApproved) {
      return {
        success: false,
        status: 'FAILED',
        error: 'POLICY_BLOCKED: Final submission requires explicit user approval.',
        evidence: {},
      };
    }

    // Submit Greenhouse application form
    await driver.click(session, '#submit_app');
    const newPageState = await driver.getPageState(session);
    const html = (newPageState.html || '').toLowerCase();
    const url = newPageState.url || '';

    const isConfirmed =
      html.includes('thank you for applying') ||
      html.includes("we've received your application") ||
      html.includes('application confirmation') ||
      url.includes('confirmation');

    if (isConfirmed) {
      return {
        success: true,
        status: 'SUBMITTED',
        confirmationUrl: url,
        confirmationText: "We've received your application.",
        evidence: {
          provider: 'GREENHOUSE',
          timestamp: new Date().toISOString(),
          confirmedUrl: url,
        },
      };
    }

    // Ambiguous submission: do NOT blindly retry
    return {
      success: false,
      status: 'SUBMISSION_UNKNOWN',
      error: 'Form was submitted but Greenhouse confirmation text was not conclusively detected.',
      evidence: {
        provider: 'GREENHOUSE',
        url,
      },
    };
  }
}
