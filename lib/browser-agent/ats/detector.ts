/**
 * Deterministic ATS Provider Detector (Level 13)
 * Identifies supported employer ATS portals from URL, hostname, and DOM markers.
 */

import type { AtsProvider, PageState, FormInspectionResult } from '../types';

export const KNOWN_UNSUPPORTED_DOMAINS = [
  'linkedin.com',
  'workday.com',
  'myworkdayjobs.com',
  'smartrecruiters.com',
  'indeed.com',
  'taleo.net',
  'icims.com',
  'successfactors.com',
  'brassring.com',
  'usajobs.gov',
];

export class AtsDetector {
  /**
   * Deterministically identifies the ATS provider from URL and page state.
   */
  static detect(url: string, pageState?: PageState, inspection?: FormInspectionResult): AtsProvider {
    const cleanUrl = url.toLowerCase();

    // 1. Check known unsupported enterprise/complex portals
    for (const domain of KNOWN_UNSUPPORTED_DOMAINS) {
      if (cleanUrl.includes(domain)) {
        return 'UNSUPPORTED';
      }
    }

    // 2. Greenhouse detection
    if (
      cleanUrl.includes('boards.greenhouse.io') ||
      cleanUrl.includes('job-boards.greenhouse.io') ||
      cleanUrl.includes('grnh.se') ||
      cleanUrl.includes('greenhouse')
    ) {
      return 'GREENHOUSE';
    }

    // 3. Lever detection
    if (
      cleanUrl.includes('jobs.lever.co') ||
      cleanUrl.includes('lever.co')
    ) {
      return 'LEVER';
    }

    // 4. Ashby detection
    if (
      cleanUrl.includes('jobs.ashbyhq.com') ||
      cleanUrl.includes('ashbyhq.com')
    ) {
      return 'ASHBY';
    }

    // 5. Inspect DOM markers if PageState / Inspection provided
    const html = (pageState?.html || '').toLowerCase();

    if (
      html.includes('id="application_form"') ||
      html.includes('action="https://boards.greenhouse.io') ||
      html.includes('greenhouse.io/embed') ||
      html.includes('data-qa="greenhouse"')
    ) {
      return 'GREENHOUSE';
    }

    if (
      html.includes('class="application-form"') ||
      html.includes('action="https://jobs.lever.co') ||
      html.includes('lever.co/embed') ||
      html.includes('data-qa="lever"')
    ) {
      return 'LEVER';
    }

    if (
      html.includes('data-ashby-application-form') ||
      html.includes('ashbyhq.com/embed') ||
      html.includes('data-qa="ashby"')
    ) {
      return 'ASHBY';
    }

    // 6. Generic HTML form detection
    if (
      inspection?.formFound ||
      html.includes('<form') ||
      (pageState && (html.includes('type="email"') || html.includes('name="email"')))
    ) {
      return 'GENERIC_FORM';
    }

    return 'UNSUPPORTED';
  }
}
