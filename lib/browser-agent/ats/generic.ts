/**
 * Generic HTML Form Application Adapter (Level 13)
 * Handles standard employer-hosted career apply forms.
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

export class GenericFormAdapter implements ApplicationFormAdapter {
  readonly provider: AtsProvider = 'GENERIC_FORM';

  detect(_url: string, pageState: PageState): boolean {
    const html = (pageState.html || '').toLowerCase();
    return html.includes('<form') && (html.includes('name="email"') || html.includes('type="email"') || html.includes('resume'));
  }

  async inspect(pageState: PageState): Promise<ApplicationFormSchema> {
    const html = pageState.html || '';
    const captchaDetected = html.includes('g-recaptcha') || html.includes('h-captcha');
    const authRequired = html.includes('Sign in to apply') || html.includes('login');

    return {
      provider: 'GENERIC_FORM',
      formSelector: 'form',
      fields: [],
      buttons: [
        {
          text: 'Apply Now',
          selector: 'button[type="submit"], input[type="submit"]',
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
      errors.push('CAPTCHA protection detected on employer page.');
    }
    if (schema.authRequired) {
      errors.push('Authentication or account creation required on employer page.');
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

    await driver.click(session, 'button[type="submit"], input[type="submit"], #submit-btn');
    const newPageState = await driver.getPageState(session);
    const html = (newPageState.html || '').toLowerCase();
    const url = newPageState.url || '';

    const isConfirmed =
      html.includes('thank you for applying') ||
      html.includes("we've received your application") ||
      html.includes('application submitted') ||
      html.includes('success') ||
      url.includes('success') ||
      url.includes('thanks');

    if (isConfirmed) {
      return {
        success: true,
        status: 'SUBMITTED',
        confirmationUrl: url,
        confirmationText: "We've received your application.",
        evidence: {
          provider: 'GENERIC_FORM',
          timestamp: new Date().toISOString(),
          confirmedUrl: url,
        },
      };
    }

    return {
      success: false,
      status: 'SUBMISSION_UNKNOWN',
      error: 'Form submitted but generic confirmation text could not be verified.',
      evidence: {
        provider: 'GENERIC_FORM',
        url,
      },
    };
  }
}
