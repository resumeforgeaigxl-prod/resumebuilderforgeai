/**
 * ResumeForge — Browser Application Agent V1 Automated Test Suite (Level 13)
 * Validates Preconditions, ATS Detection, Safe Field Mapping, Sensitive Field Protection,
 * Mock Driver DOM Execution, Approval Mode, and Submission Guardrails.
 */

import { AtsDetector } from '../lib/browser-agent/ats/detector';
import { FieldMapper } from '../lib/browser-agent/ats/field-mapper';
import { getAtsAdapter } from '../lib/browser-agent/ats';
import { MockBrowserDriver } from '../lib/browser-agent/drivers/mock-driver';
import {
  GREENHOUSE_MOCK_HTML,
  LEVER_MOCK_HTML,
  ASHBY_MOCK_HTML,
  GENERIC_FORM_MOCK_HTML,
} from '../lib/browser-agent/fixtures';
import type { ApplicationPackage } from '../lib/application-engine/types';
import type { ApplicationFormSchema } from '../lib/browser-agent/types';
import { BrowserPolicy } from '../lib/agent-os/policies/browser-policy';
import { validateBlock } from '../components/agent/blocks/block-converter';

// Mock Candidate Application Package
const mockReadyPackage: any = {
  id: 'pkg_test_level13_ready',
  userId: 'usr_test_candidate',
  jobId: 'job_test_swe_stripe',
  status: 'READY',
  version: 1,
  candidateSnapshot: {
    profileVersion: 'v1.4',
    profileCompleteness: 95,
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    verifiedAt: new Date().toISOString(),
  },
  jobSnapshot: {
    id: 'job_test_swe_stripe',
    title: 'Senior Software Engineer',
    company: 'Stripe',
    applyUrl: 'https://boards.greenhouse.io/stripe/jobs/1234567#app',
    status: 'ACTIVE',
    lastVerifiedAt: new Date().toISOString(),
  },
  tailoringStatus: 'TAILORED' as any,
  tailoringEvidence: 'Tailored for Distributed Systems & TypeScript requirements.' as any,
  answers: {
    first_name: {
      key: 'first_name',
      label: 'First Name',
      value: 'Jane',
      source: 'user',
      status: 'VERIFIED',
    },
    last_name: {
      key: 'last_name',
      label: 'Last Name',
      value: 'Doe',
      source: 'user',
      status: 'VERIFIED',
    },
    email: {
      key: 'email',
      label: 'Email',
      value: 'jane.doe@example.com',
      source: 'user',
      status: 'VERIFIED',
    },
    phone: {
      key: 'phone',
      label: 'Phone Number',
      value: '+1 (555) 234-5678',
      source: 'user',
      status: 'VERIFIED',
    },
    linkedin: {
      key: 'linkedin',
      label: 'LinkedIn Profile',
      value: 'https://linkedin.com/in/janedoe',
      source: 'user',
      status: 'VERIFIED',
    },
    github: {
      key: 'github',
      label: 'GitHub URL',
      value: 'https://github.com/janedoe',
      source: 'user',
      status: 'VERIFIED',
    },
    authorized_in_us: {
      key: 'authorized_in_us',
      label: 'Are you authorized to work in the United States?',
      value: 'Yes',
      source: 'user',
      status: 'VERIFIED',
    },
    require_sponsorship: {
      key: 'require_sponsorship',
      label: 'Will you now or in the future require visa sponsorship?',
      value: 'No',
      source: 'user',
      status: 'VERIFIED',
    },
    notice_period: {
      key: 'notice_period',
      label: 'What is your notice period (in days)?',
      value: '30',
      source: 'user',
      status: 'VERIFIED',
    },
  },
  unknownQuestions: [],
  documents: [
    {
      type: 'RESUME',
      documentId: 'doc_resume_tailored_pdf',
      name: 'Jane_Doe_Resume_Stripe.pdf',
      url: 'https://storage.resumeforge.ai/resumes/jane_doe_stripe.pdf',
      status: 'READY',
      version: 1,
    },
  ],
  matchSnapshot: {
    score: 92,
    category: 'STRONG_MATCH',
    recommendation: 'HIGHLY_RECOMMENDED',
    confidence: 'HIGH',
    underrepresentedSkills: [],
    missingRequirements: [],
    blockers: [],
  },
  readinessScore: '98%',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${details ? ` -> ${details}` : ''}`);
    failed++;
  }
}

async function runBrowserAgentTests() {
  console.log('\n================================================================');
  console.log('   ResumeForge Level 13: Browser Application Agent V1 Test Suite');
  console.log('================================================================\n');

  // ─────────────────────────────────────────────────────────────────
  // TEST SUITE 1: ATS Detection Engine
  // ─────────────────────────────────────────────────────────────────
  console.log('SUITE 1: ATS Detection Engine');

  const ghDetected = AtsDetector.detect(
    'https://boards.greenhouse.io/stripe/jobs/1234567#app',
    { url: 'https://boards.greenhouse.io/stripe/jobs/1234567#app', title: 'Stripe Careers', html: GREENHOUSE_MOCK_HTML, hasForm: true },
    { formFound: true, fields: [], buttons: [], captchaDetected: false, mfaOrAuthRequired: false, hasAccountCreation: false }
  );
  assert(ghDetected === 'GREENHOUSE', 'Detects Greenhouse portal from URL and DOM');

  const leverDetected = AtsDetector.detect(
    'https://jobs.lever.co/figma/abcdef12-3456-7890/apply',
    { url: 'https://jobs.lever.co/figma/abcdef12-3456-7890/apply', title: 'Figma Careers', html: LEVER_MOCK_HTML, hasForm: true },
    { formFound: true, fields: [], buttons: [], captchaDetected: false, mfaOrAuthRequired: false, hasAccountCreation: false }
  );
  assert(leverDetected === 'LEVER', 'Detects Lever portal from URL and DOM');

  const ashbyDetected = AtsDetector.detect(
    'https://jobs.ashbyhq.com/linear/application',
    { url: 'https://jobs.ashbyhq.com/linear/application', title: 'Linear Careers', html: ASHBY_MOCK_HTML, hasForm: true },
    { formFound: true, fields: [], buttons: [], captchaDetected: false, mfaOrAuthRequired: false, hasAccountCreation: false }
  );
  assert(ashbyDetected === 'ASHBY', 'Detects Ashby portal from URL and DOM');

  const genericDetected = AtsDetector.detect(
    'https://acme-corp.com/careers/apply',
    { url: 'https://acme-corp.com/careers/apply', title: 'Acme Jobs', html: GENERIC_FORM_MOCK_HTML, hasForm: true },
    { formFound: true, fields: [], buttons: [], captchaDetected: false, mfaOrAuthRequired: false, hasAccountCreation: false }
  );
  assert(genericDetected === 'GENERIC_FORM', 'Detects Generic HTML form when standard tags present');

  const workdayDetected = AtsDetector.detect(
    'https://myworkdayjobs.com/netflix/job/R12345/apply',
    { url: 'https://myworkdayjobs.com/netflix/job/R12345/apply', title: 'Workday Portal', html: '<html><body>Workday Portal</body></html>', hasForm: true },
    { formFound: true, fields: [], buttons: [], captchaDetected: false, mfaOrAuthRequired: false, hasAccountCreation: false }
  );
  assert(workdayDetected === 'UNSUPPORTED', 'Classifies Workday as UNSUPPORTED for manual handoff');

  const linkedinDetected = AtsDetector.detect(
    'https://www.linkedin.com/jobs/view/123456789/',
    { url: 'https://www.linkedin.com/jobs/view/123456789/', title: 'LinkedIn Job', html: '<html><body>LinkedIn Job</body></html>', hasForm: false },
    { formFound: false, fields: [], buttons: [], captchaDetected: false, mfaOrAuthRequired: false, hasAccountCreation: false }
  );
  assert(linkedinDetected === 'UNSUPPORTED', 'Classifies LinkedIn Easy Apply as UNSUPPORTED');

  // ─────────────────────────────────────────────────────────────────
  // TEST SUITE 2: Mock Browser Driver & DOM Inspection
  // ─────────────────────────────────────────────────────────────────
  console.log('\nSUITE 2: Mock Browser Driver & DOM Inspection');

  const driver = new MockBrowserDriver();
  const session = await driver.createSession({ userId: 'usr_test_candidate' });
  assert(Boolean(session.sessionId), 'Creates isolated browser session');

  const ghPage = await driver.open(session, 'https://boards.greenhouse.io/stripe/jobs/1234567#app');
  assert(ghPage.hasForm === true, 'Opens Greenhouse fixture with form detected');

  const ghInspection = await driver.inspectForm(session);
  assert(ghInspection.fields.length >= 7, 'Inspects Greenhouse form fields (found >= 7 fields)');
  assert(ghInspection.buttons.length >= 1, 'Detects submit button in Greenhouse form');
  assert(ghInspection.captchaDetected === false, 'Verifies no CAPTCHA on standard Greenhouse form');

  // ─────────────────────────────────────────────────────────────────
  // TEST SUITE 3: Field Mapping & Zero-Inference Safety
  // ─────────────────────────────────────────────────────────────────
  console.log('\nSUITE 3: Field Mapping & Truth Preserving Safety');

  const ghAdapter = getAtsAdapter('GREENHOUSE')!;
  assert(Boolean(ghAdapter), 'Retrieves Greenhouse adapter');

  const ghSchema: ApplicationFormSchema = {
    provider: 'GREENHOUSE',
    formSelector: '#application_form',
    fields: ghInspection.fields,
    buttons: ghInspection.buttons,
    captchaDetected: false,
    authRequired: false,
    accountCreationRequired: false,
    hasSubmitButton: true,
    hasNavigationButton: false,
  };

  const mapResult = ghAdapter.mapFields(ghSchema, mockReadyPackage);
  assert(mapResult.canProceedToFill === true, 'Maps all required fields successfully when package is complete');
  assert(mapResult.unresolvedRequired.length === 0, 'Zero unresolved required fields for complete package');

  // Verify field mapping confidence
  const emailMapping = mapResult.mappings.find((m) => m.formFieldKey === 'email');
  assert(emailMapping?.confidence === 'HIGH', 'Email field mapped with HIGH confidence');
  assert(emailMapping?.value === 'jane.doe@example.com', 'Email value matches prepared package exactly');

  // Sensitive Field Protection: Package WITHOUT Sponsorship Answer
  const packageWithoutSponsorship: ApplicationPackage = {
    ...mockReadyPackage,
    answers: {
      ...mockReadyPackage.answers,
    },
  };
  delete (packageWithoutSponsorship.answers as any).require_sponsorship;
  delete (packageWithoutSponsorship.answers as any).sponsorship;
  delete (packageWithoutSponsorship.answers as any).visa_sponsorship;

  const incompleteMapResult = ghAdapter.mapFields(ghSchema, packageWithoutSponsorship);
  assert(
    incompleteMapResult.canProceedToFill === false,
    'Halts execution if required sensitive field is missing (NEEDS_USER handoff)'
  );
  assert(
    incompleteMapResult.sensitiveUnresolved.length > 0,
    'Correctly isolates unresolved sensitive question without guessing or hallucinating'
  );

  // ─────────────────────────────────────────────────────────────────
  // TEST SUITE 4: Form Filling & Validation in Approval Mode
  // ─────────────────────────────────────────────────────────────────
  console.log('\nSUITE 4: Form Filling & Validation (Approval Mode)');

  const fillResult = await ghAdapter.fill(driver, session, mapResult.mappings, mockReadyPackage);
  assert(fillResult.filledCount > 0, `Filled ${fillResult.filledCount} verified form fields`);
  assert(fillResult.resumeUploaded === true, 'Uploaded approved tailored resume PDF');

  const validation = await ghAdapter.validate(driver, session, ghSchema);
  assert(validation.isValid === true, 'Form validation passes all required fields');
  assert(validation.readyForApproval === true, 'Form marked readyForApproval (pauses for candidate)');

  // ─────────────────────────────────────────────────────────────────
  // TEST SUITE 5: Strict Submission Guardrails (No Autopilot)
  // ─────────────────────────────────────────────────────────────────
  console.log('\nSUITE 5: Strict Submission Guardrails & Explicit Consent');

  // Attempt submit WITHOUT explicit consent
  const unapprovedSubmit = await ghAdapter.submit(driver, session, false);
  assert(
    unapprovedSubmit.success === false && Boolean(unapprovedSubmit.error?.includes('POLICY_BLOCKED')),
    'Blocks final form submission when explicitUserConsent is false'
  );

  // Submit WITH explicit consent
  const confirmedSubmit = await ghAdapter.submit(driver, session, true);
  assert(confirmedSubmit.success === true, 'Executes single submission when explicitUserConsent is true');
  assert(confirmedSubmit.status === 'SUBMITTED', 'Transitions to SUBMITTED upon confirmed employer response');
  assert(Boolean(confirmedSubmit.confirmationUrl), 'Captures confirmation URL evidence');

  // ─────────────────────────────────────────────────────────────────
  // TEST SUITE 6: Lever & Ashby Adaptations
  // ─────────────────────────────────────────────────────────────────
  console.log('\nSUITE 6: Lever & Ashby Adapters');

  const leverAdapter = getAtsAdapter('LEVER')!;
  const leverPage = await driver.open(session, 'https://jobs.lever.co/figma/abcdef12-3456-7890/apply');
  const leverInspection = await driver.inspectForm(session);
  const leverSchema: ApplicationFormSchema = {
    provider: 'LEVER',
    formSelector: '.application-form',
    fields: leverInspection.fields,
    buttons: leverInspection.buttons,
    captchaDetected: false,
    authRequired: false,
    accountCreationRequired: false,
    hasSubmitButton: true,
    hasNavigationButton: false,
  };
  const leverMap = leverAdapter.mapFields(leverSchema, mockReadyPackage);
  assert(leverMap.mappings.length >= 4, 'Lever maps candidate name, email, phone, and links');

  const ashbyAdapter = getAtsAdapter('ASHBY')!;
  const ashbyPage = await driver.open(session, 'https://jobs.ashbyhq.com/linear/application');
  const ashbyInspection = await driver.inspectForm(session);
  const ashbySchema: ApplicationFormSchema = {
    provider: 'ASHBY',
    formSelector: '[data-ashby-application-form]',
    fields: ashbyInspection.fields,
    buttons: ashbyInspection.buttons,
    captchaDetected: false,
    authRequired: false,
    accountCreationRequired: false,
    hasSubmitButton: true,
    hasNavigationButton: false,
  };
  const ashbyMap = ashbyAdapter.mapFields(ashbySchema, mockReadyPackage);
  assert(ashbyMap.mappings.length >= 4, 'Ashby maps candidate fields cleanly');

  // ─────────────────────────────────────────────────────────────────
  // TEST SUITE 7: CAPTCHA & Security Challenge Detection
  // ─────────────────────────────────────────────────────────────────
  console.log('\nSUITE 7: CAPTCHA & Security Challenge Detection');

  const captchaPage = await driver.open(session, 'https://example.com/captcha-test');
  const captchaInspection = await driver.inspectForm(session);
  assert(captchaInspection.captchaDetected === true, 'Detects CAPTCHA challenge in DOM');

  const authPage = await driver.open(session, 'https://example.com/login-portal');
  const authInspection = await driver.inspectForm(session);
  assert(authInspection.mfaOrAuthRequired === true, 'Detects authentication / login wall in DOM');

  // ─────────────────────────────────────────────────────────────────
  // TEST SUITE 8: Browser Policy Enforcement (Level 13 Security Gates)
  // ─────────────────────────────────────────────────────────────────
  console.log('\nSUITE 8: Browser Policy Enforcement (Level 13 Gates)');

  // Policy gate: Autopilot attempt
  const autopilotEval = await BrowserPolicy.evaluate({
    action: 'EXECUTE_AUTOPILOT',
    userId: 'usr_test_candidate',
    agentRole: 'browser_agent' as any,
    userRole: 'candidate' as any,
    permissions: [],
  });
  assert(autopilotEval.allowed === false, 'Policy blocks EXECUTE_AUTOPILOT (Autopilot prohibited in Level 13)');

  // Policy gate: Submit without approval
  const unapprovedSubmitEval = await BrowserPolicy.evaluate({
    action: 'SUBMIT_WITHOUT_APPROVAL',
    userId: 'usr_test_candidate',
    agentRole: 'browser_agent' as any,
    userRole: 'candidate' as any,
    permissions: [],
  });
  assert(unapprovedSubmitEval.allowed === false, 'Policy blocks SUBMIT_WITHOUT_APPROVAL');

  // Policy gate: CAPTCHA bypass attempt
  const captchaBypassEval = await BrowserPolicy.evaluate({
    action: 'BYPASS_CAPTCHA',
    userId: 'usr_test_candidate',
    agentRole: 'browser_agent' as any,
    userRole: 'candidate' as any,
    permissions: [],
  });
  assert(captchaBypassEval.allowed === false, 'Policy blocks BYPASS_CAPTCHA (Strict human handoff required)');

  // Policy gate: Approval mode execution permitted
  const approvalModeEval = await BrowserPolicy.evaluate({
    action: 'FILL_FORM',
    userId: 'usr_test_candidate',
    agentRole: 'browser_agent' as any,
    userRole: 'candidate' as any,
    permissions: [],
    browserAction: {
      action: 'FILL',
      isFinalSubmit: false,
      url: 'https://boards.greenhouse.io/test',
    },
  });
  assert(approvalModeEval.allowed === true, 'Policy allows safe form filling under Approval Mode');

  // ─────────────────────────────────────────────────────────────────
  // TEST SUITE 9: Omni UI Application Block Converter
  // ─────────────────────────────────────────────────────────────────
  console.log('\nSUITE 9: Omni UI Block Converter');

  const approvalBlock = validateBlock({
    type: 'application',
    status: 'AWAITING_APPROVAL',
    jobTitle: 'Senior Software Engineer',
    company: 'Stripe',
    runId: 'run_123',
    provider: 'GREENHOUSE',
    filledFieldsCount: 8,
  }) as any;
  assert(approvalBlock?.status === 'AWAITING_APPROVAL', 'Converts browser run to AWAITING_APPROVAL block');
  assert(approvalBlock?.filledFieldsCount === 8, 'Preserves filled fields count in UI block');

  const submittedBlock = validateBlock({
    type: 'application',
    status: 'SUBMITTED',
    jobTitle: 'Senior Software Engineer',
    company: 'Stripe',
    runId: 'run_123',
    confirmationUrl: 'https://boards.greenhouse.io/stripe/confirmation',
  }) as any;
  assert(submittedBlock?.status === 'SUBMITTED', 'Converts submitted run to SUBMITTED block');
  assert(Boolean(submittedBlock?.confirmationUrl), 'Preserves confirmation URL in UI block');

  await driver.closeSession(session);

  console.log('\n================================================================');
  console.log(`Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runBrowserAgentTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
