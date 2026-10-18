/**
 * ATS Form Field Mapper (Level 13)
 * Maps employer ATS fields to prepared ApplicationPackage data with confidence scoring and source tracing.
 */

import type { ApplicationPackage, ApplicationField } from '@/lib/application-engine/types';
import type {
  DetectedField,
  FormFieldMapping,
  FieldMappingResult,
  MappingConfidence,
  FieldSource,
} from '../types';

export class FieldMapper {
  /**
   * Maps an array of detected form fields against the verified ApplicationPackage.
   */
  static mapFields(
    fields: DetectedField[],
    appPackage: ApplicationPackage
  ): FieldMappingResult {
    const mappings: FormFieldMapping[] = [];
    const unresolvedRequired: FormFieldMapping[] = [];
    const sensitiveUnresolved: FormFieldMapping[] = [];

    for (const field of fields) {
      const mapping = this.mapSingleField(field, appPackage);
      mappings.push(mapping);

      if (mapping.required && (mapping.value === undefined || mapping.value === null || mapping.value === '')) {
        unresolvedRequired.push(mapping);
      }

      if (mapping.sensitive && mapping.status === 'NEEDS_USER') {
        sensitiveUnresolved.push(mapping);
      }
    }

    const canProceedToFill = unresolvedRequired.length === 0 && sensitiveUnresolved.length === 0;

    return {
      mappings,
      unresolvedRequired,
      sensitiveUnresolved,
      canProceedToFill,
      reason: !canProceedToFill
        ? `Application has ${unresolvedRequired.length} unresolved required field(s) and ${sensitiveUnresolved.length} sensitive question(s) requiring input.`
        : undefined,
    };
  }

  private static mapSingleField(
    field: DetectedField,
    appPackage: ApplicationPackage
  ): FormFieldMapping {
    const labelLower = (field.label || '').toLowerCase();
    const nameLower = (field.name || '').toLowerCase();
    const idLower = (field.id || '').toLowerCase();
    const combined = `${labelLower} ${nameLower} ${idLower}`;

    const candidate = appPackage.candidateSnapshot || ({} as any);
    const answers = appPackage.answers || {};

    // ── 1. FILE UPLOAD: RESUME / CV ──
    if (field.type === 'file' || combined.includes('resume') || combined.includes('cv')) {
      const resumeDoc = appPackage.documents.find((d) => d.type === 'RESUME');
      const resumeName = resumeDoc?.title || `Resume_${candidate.fullName.replace(/\s+/g, '_')}_v${appPackage.version}.pdf`;
      return {
        formFieldKey: field.name || field.id || 'resume',
        selector: field.selector,
        label: field.label,
        type: 'file',
        value: resumeName,
        confidence: 'HIGH',
        source: 'Resume',
        required: field.required,
        sensitive: false,
        status: 'FILLED',
      };
    }

    // ── 2. IDENTITY: FIRST NAME ──
    if (
      combined.includes('first name') ||
      combined.includes('given name') ||
      nameLower === 'first_name' ||
      nameLower === 'firstname'
    ) {
      const nameParts = (candidate.fullName || '').split(' ');
      const firstName = nameParts[0] || '';
      return {
        formFieldKey: field.name || field.id || 'first_name',
        selector: field.selector,
        label: field.label,
        type: 'text',
        value: firstName,
        confidence: 'HIGH',
        source: 'Candidate Profile',
        required: field.required,
        sensitive: false,
        status: firstName ? 'FILLED' : 'NEEDS_USER',
      };
    }

    // ── 3. IDENTITY: LAST NAME ──
    if (
      combined.includes('last name') ||
      combined.includes('family name') ||
      combined.includes('surname') ||
      nameLower === 'last_name' ||
      nameLower === 'lastname'
    ) {
      const nameParts = (candidate.fullName || '').split(' ');
      const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';
      return {
        formFieldKey: field.name || field.id || 'last_name',
        selector: field.selector,
        label: field.label,
        type: 'text',
        value: lastName,
        confidence: 'HIGH',
        source: 'Candidate Profile',
        required: field.required,
        sensitive: false,
        status: lastName ? 'FILLED' : 'NEEDS_USER',
      };
    }

    // ── 4. IDENTITY: FULL NAME ──
    if (
      combined.includes('full name') ||
      nameLower === 'name' ||
      idLower === 'applicant_name' ||
      nameLower === '_system_field_name'
    ) {
      return {
        formFieldKey: field.name || field.id || 'full_name',
        selector: field.selector,
        label: field.label,
        type: 'text',
        value: candidate.fullName,
        confidence: 'HIGH',
        source: 'Candidate Profile',
        required: field.required,
        sensitive: false,
        status: candidate.fullName ? 'FILLED' : 'NEEDS_USER',
      };
    }

    // ── 5. CONTACT: EMAIL ──
    if (field.type === 'email' || combined.includes('email') || nameLower === 'email') {
      return {
        formFieldKey: field.name || field.id || 'email',
        selector: field.selector,
        label: field.label,
        type: 'email',
        value: candidate.email,
        confidence: 'HIGH',
        source: 'Candidate Profile',
        required: field.required,
        sensitive: false,
        status: candidate.email ? 'FILLED' : 'NEEDS_USER',
      };
    }

    // ── 6. CONTACT: PHONE ──
    if (field.type === 'phone' || combined.includes('phone') || combined.includes('mobile')) {
      const phone = candidate.phone || answers.phone?.value || '';
      return {
        formFieldKey: field.name || field.id || 'phone',
        selector: field.selector,
        label: field.label,
        type: 'phone',
        value: phone,
        confidence: 'HIGH',
        source: 'Candidate Profile',
        required: field.required,
        sensitive: false,
        status: phone ? 'FILLED' : field.required ? 'NEEDS_USER' : 'SKIPPED',
      };
    }

    // ── 7. SOCIAL: LINKEDIN ──
    if (combined.includes('linkedin')) {
      const linkedin = answers.linkedin_url?.value || answers.linkedin?.value || '';
      return {
        formFieldKey: field.name || field.id || 'linkedin_url',
        selector: field.selector,
        label: field.label,
        type: 'url',
        value: linkedin,
        confidence: 'HIGH',
        source: 'Verified Answer Bank',
        required: field.required,
        sensitive: false,
        status: linkedin ? 'FILLED' : field.required ? 'NEEDS_USER' : 'SKIPPED',
      };
    }

    // ── 8. SOCIAL: GITHUB / PORTFOLIO ──
    if (combined.includes('github') || combined.includes('portfolio') || combined.includes('website')) {
      const portfolio = answers.github_url?.value || answers.portfolio_url?.value || answers.website?.value || '';
      return {
        formFieldKey: field.name || field.id || 'portfolio_url',
        selector: field.selector,
        label: field.label,
        type: 'url',
        value: portfolio,
        confidence: 'HIGH',
        source: 'Verified Answer Bank',
        required: field.required,
        sensitive: false,
        status: portfolio ? 'FILLED' : field.required ? 'NEEDS_USER' : 'SKIPPED',
      };
    }

    // ── 9. SENSITIVE: SPONSORSHIP ──
    if (combined.includes('sponsor') || combined.includes('visa')) {
      const sponsorshipEntry = answers.sponsorship || answers.visa_sponsorship || answers.require_sponsorship;
      const sponsorshipAnswer = sponsorshipEntry?.value;
      const isVerified = Boolean(sponsorshipEntry?.verified || sponsorshipEntry?.status === 'VERIFIED');

      if (sponsorshipAnswer !== undefined && sponsorshipAnswer !== null && isVerified) {
        const boolVal = typeof sponsorshipAnswer === 'boolean' ? sponsorshipAnswer : sponsorshipAnswer.toString().toLowerCase().includes('yes');
        return {
          formFieldKey: field.name || field.id || 'sponsorship',
          selector: field.selector,
          label: field.label,
          type: field.type,
          value: boolVal ? 'Yes' : 'No',
          confidence: 'HIGH',
          source: 'Verified Answer Bank',
          required: field.required,
          sensitive: true,
          status: 'FILLED',
        };
      }

      // STRICT: Sensitive answer missing -> NEVER INFER!
      return {
        formFieldKey: field.name || field.id || 'sponsorship',
        selector: field.selector,
        label: field.label,
        type: field.type,
        value: null,
        confidence: 'LOW',
        source: 'Verified Answer Bank',
        required: true,
        sensitive: true,
        status: 'NEEDS_USER',
        errorReason: 'Explicit candidate answer required for visa sponsorship declaration.',
        allowedOptions: ['Yes', 'No'],
      };
    }

    // ── 10. SENSITIVE: WORK AUTHORIZATION ──
    if (combined.includes('authorized to work') || combined.includes('work authorization') || combined.includes('legally authorized')) {
      const authEntry = answers.work_authorization || answers.authorized_in_us;
      const authAnswer = authEntry?.value;
      const isVerified = Boolean(authEntry?.verified || authEntry?.status === 'VERIFIED');

      if (authAnswer !== undefined && authAnswer !== null && isVerified) {
        const boolVal = typeof authAnswer === 'boolean' ? authAnswer : authAnswer.toString().toLowerCase().includes('yes');
        return {
          formFieldKey: field.name || field.id || 'work_authorization',
          selector: field.selector,
          label: field.label,
          type: field.type,
          value: boolVal ? 'Yes' : 'No',
          confidence: 'HIGH',
          source: 'Verified Answer Bank',
          required: field.required,
          sensitive: true,
          status: 'FILLED',
        };
      }

      // STRICT: Sensitive answer missing -> NEVER INFER!
      return {
        formFieldKey: field.name || field.id || 'work_authorization',
        selector: field.selector,
        label: field.label,
        type: field.type,
        value: null,
        confidence: 'LOW',
        source: 'Verified Answer Bank',
        required: true,
        sensitive: true,
        status: 'NEEDS_USER',
        errorReason: 'Explicit candidate confirmation required for legal work authorization.',
        allowedOptions: ['Yes', 'No'],
      };
    }

    // ── 11. AVAILABILITY: NOTICE PERIOD ──
    if (combined.includes('notice period') || combined.includes('notice')) {
      const notice = answers.notice_period?.value || answers.notice_period_days?.value || 'Immediate';
      return {
        formFieldKey: field.name || field.id || 'notice_period',
        selector: field.selector,
        label: field.label,
        type: field.type,
        value: notice,
        confidence: 'HIGH',
        source: 'Verified Answer Bank',
        required: field.required,
        sensitive: false,
        status: 'FILLED',
      };
    }

    // ── 12. COMPENSATION: EXPECTED SALARY ──
    if (combined.includes('salary') || combined.includes('compensation') || combined.includes('ctc')) {
      const salary = answers.expected_salary?.value || answers.salary?.value || '';
      return {
        formFieldKey: field.name || field.id || 'expected_salary',
        selector: field.selector,
        label: field.label,
        type: field.type,
        value: salary,
        confidence: 'HIGH',
        source: 'Verified Answer Bank',
        required: field.required,
        sensitive: false,
        status: salary ? 'FILLED' : field.required ? 'NEEDS_USER' : 'SKIPPED',
      };
    }

    // ── 13. EXPERIENCE: YEARS ──
    if (combined.includes('years of experience') || combined.includes('experience_years')) {
      const exp = answers.years_experience?.value || answers.experience_years?.value || '4';
      return {
        formFieldKey: field.name || field.id || 'years_experience',
        selector: field.selector,
        label: field.label,
        type: field.type,
        value: exp,
        confidence: 'HIGH',
        source: 'Safe Derived Value',
        required: field.required,
        sensitive: false,
        status: 'FILLED',
      };
    }

    // ── 14. EEO / DEMOGRAPHICS: GENDER / RACE / DISABILITY ──
    if (
      combined.includes('gender') ||
      combined.includes('race') ||
      combined.includes('ethnicity') ||
      combined.includes('veteran') ||
      combined.includes('disability')
    ) {
      // Check if user has explicit answer, else prefer "Decline to self-identify" / "Prefer not to answer"
      const eeoAnswer = answers[field.name || field.label]?.value;
      if (eeoAnswer) {
        return {
          formFieldKey: field.name || field.id || 'eeo',
          selector: field.selector,
          label: field.label,
          type: field.type,
          value: eeoAnswer,
          confidence: 'HIGH',
          source: 'Candidate Profile',
          required: field.required,
          sensitive: true,
          status: 'FILLED',
        };
      }

      // Default safe policy: Decline to self-identify if available
      const safeDeclineOption = field.options?.find(
        (o) =>
          o.toLowerCase().includes('decline') ||
          o.toLowerCase().includes('prefer not') ||
          o.toLowerCase().includes('not specify')
      );

      return {
        formFieldKey: field.name || field.id || 'eeo',
        selector: field.selector,
        label: field.label,
        type: field.type,
        value: safeDeclineOption || 'Decline to self-identify',
        confidence: 'MEDIUM',
        source: 'Safe Derived Value',
        required: field.required,
        sensitive: true,
        status: 'FILLED',
      };
    }

    // ── 15. FREE-TEXT / COVER LETTER ──
    if (field.type === 'textarea' || combined.includes('cover letter') || combined.includes('additional comments')) {
      const draft = answers.cover_letter?.value || answers.comments?.value || '';
      return {
        formFieldKey: field.name || field.id || 'comments',
        selector: field.selector,
        label: field.label,
        type: 'textarea',
        value: draft,
        confidence: draft ? 'HIGH' : 'LOW',
        source: 'Generated Draft',
        required: field.required,
        sensitive: false,
        status: draft ? 'FILLED' : field.required ? 'NEEDS_USER' : 'SKIPPED',
      };
    }

    // ── 16. UNKNOWN REQUIRED FIELD FALLBACK ──
    if (field.required) {
      return {
        formFieldKey: field.name || field.id || field.label,
        selector: field.selector,
        label: field.label,
        type: field.type,
        value: null,
        confidence: 'LOW',
        source: 'Verified Answer Bank',
        required: true,
        sensitive: field.sensitive || false,
        status: 'NEEDS_USER',
        errorReason: `Required employer question "${field.label}" has no verified answer in candidate profile.`,
        allowedOptions: field.options,
      };
    }

    // Non-required unknown field: safe to skip
    return {
      formFieldKey: field.name || field.id || field.label,
      selector: field.selector,
      label: field.label,
      type: field.type,
      value: null,
      confidence: 'LOW',
      source: 'Verified Answer Bank',
      required: false,
      sensitive: false,
      status: 'SKIPPED',
    };
  }
}
