/**
 * ResumeForge — Browser Application Agent V1 (Level 13)
 * Provider-Neutral Browser Abstraction, ATS Adapters & Execution Types
 */

import type { ApplicationPackage, ApplicationField } from '@/lib/application-engine/types';

export type AtsProvider =
  | 'GREENHOUSE'
  | 'LEVER'
  | 'ASHBY'
  | 'GENERIC_FORM'
  | 'UNSUPPORTED';

export type ApplicationRunStatus =
  | 'READY'
  | 'STARTING'
  | 'INSPECTING'
  | 'FILLING'
  | 'VALIDATING'
  | 'AWAITING_APPROVAL'
  | 'SUBMITTING'
  | 'SUBMITTED'
  | 'NEEDS_USER'
  | 'UNSUPPORTED'
  | 'FAILED'
  | 'SUBMISSION_UNKNOWN'
  | 'SESSION_EXPIRED'
  | 'POLICY_BLOCKED';

export type BrowserActivityStep =
  | 'READY'
  | 'PAGE_OPENED'
  | 'ATS_DETECTED'
  | 'FORM_INSPECTED'
  | 'FIELDS_MAPPED'
  | 'FIELDS_FILLED'
  | 'RESUME_UPLOADED'
  | 'VALIDATION_COMPLETE'
  | 'AWAITING_APPROVAL'
  | 'SUBMIT_CLICKED'
  | 'SUBMISSION_CONFIRMED'
  | 'HANDOFF_TRIGGERED';

export type OmniPresenceState =
  | 'IDLE'
  | 'READING'
  | 'THINKING'
  | 'WORKING'
  | 'EDITING'
  | 'NEEDS_USER';

export interface BrowserSessionOptions {
  headless?: boolean;
  viewport?: { width: number; height: number };
  timeoutMs?: number;
  userId?: string;
}

export interface BrowserSession {
  sessionId: string;
  userId?: string;
  createdAt: number;
  active: boolean;
  currentUrl?: string;
  driverMetadata?: Record<string, any>;
}

export interface PageState {
  url: string;
  title: string;
  html?: string;
  hasForm?: boolean;
  readyState?: string;
  screenshotBase64?: string;
}

export interface DetectedField {
  id?: string;
  name?: string;
  label: string;
  selector: string;
  type: 'text' | 'email' | 'phone' | 'url' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file';
  required: boolean;
  options?: string[];
  section?: string;
  sensitive?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

export interface DetectedButton {
  text: string;
  selector: string;
  type: 'SUBMIT' | 'NAVIGATION' | 'SAVE' | 'CANCEL' | 'OTHER';
  isFinalSubmit: boolean;
}

export interface FormInspectionResult {
  formFound: boolean;
  formSelector?: string;
  fields: DetectedField[];
  buttons: DetectedButton[];
  captchaDetected: boolean;
  mfaOrAuthRequired: boolean;
  hasAccountCreation: boolean;
  providerHint?: AtsProvider;
}

export interface UploadFilePayload {
  filename: string;
  mimeType: string;
  buffer?: Buffer;
  url?: string;
  versionId?: string;
}

export interface BrowserDriver {
  createSession(options?: BrowserSessionOptions): Promise<BrowserSession>;
  open(session: BrowserSession, url: string): Promise<PageState>;
  getPageState(session: BrowserSession): Promise<PageState>;
  inspectForm(session: BrowserSession): Promise<FormInspectionResult>;
  fillField(session: BrowserSession, selector: string, value: any): Promise<boolean>;
  selectOption(session: BrowserSession, selector: string, value: string): Promise<boolean>;
  uploadFile(session: BrowserSession, selector: string, file: UploadFilePayload): Promise<boolean>;
  click(session: BrowserSession, selector: string): Promise<boolean>;
  captureScreenshot(session: BrowserSession): Promise<string | null>;
  getCurrentUrl(session: BrowserSession): Promise<string>;
  closeSession(session: BrowserSession): Promise<void>;
}

export type MappingConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export type FieldSource =
  | 'Candidate Profile'
  | 'Verified Answer Bank'
  | 'Resume'
  | 'Application Package'
  | 'Safe Derived Value'
  | 'Generated Draft';

export interface FormFieldMapping {
  formFieldKey: string;
  selector: string;
  label: string;
  type: DetectedField['type'];
  value: any;
  confidence: MappingConfidence;
  source: FieldSource;
  required: boolean;
  sensitive: boolean;
  status: 'FILLED' | 'SKIPPED' | 'NEEDS_USER' | 'ERROR';
  errorReason?: string;
  allowedOptions?: string[];
}

export interface ApplicationFormSchema {
  provider: AtsProvider;
  formSelector?: string;
  fields: DetectedField[];
  buttons: DetectedButton[];
  captchaDetected: boolean;
  authRequired: boolean;
  accountCreationRequired: boolean;
  hasSubmitButton: boolean;
  hasNavigationButton: boolean;
}

export interface FieldMappingResult {
  mappings: FormFieldMapping[];
  unresolvedRequired: FormFieldMapping[];
  sensitiveUnresolved: FormFieldMapping[];
  canProceedToFill: boolean;
  reason?: string;
}

export interface FillResult {
  success: boolean;
  filledCount: number;
  skippedCount: number;
  errors: { field: string; error: string }[];
  resumeUploaded: boolean;
  resumeFileName?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  readyForApproval: boolean;
  unresolvedCount: number;
}

export interface SubmissionResult {
  success: boolean;
  status: 'SUBMITTED' | 'SUBMISSION_UNKNOWN' | 'FAILED';
  confirmationUrl?: string;
  confirmationText?: string;
  evidence: Record<string, any>;
  error?: string;
}

export interface ApplicationFormAdapter {
  readonly provider: AtsProvider;
  detect(url: string, pageState: PageState): boolean;
  inspect(pageState: PageState): Promise<ApplicationFormSchema>;
  mapFields(schema: ApplicationFormSchema, appPackage: ApplicationPackage): FieldMappingResult;
  fill(
    driver: BrowserDriver,
    session: BrowserSession,
    mappings: FormFieldMapping[],
    appPackage: ApplicationPackage
  ): Promise<FillResult>;
  validate(
    driver: BrowserDriver,
    session: BrowserSession,
    schema: ApplicationFormSchema
  ): Promise<ValidationResult>;
  submit(
    driver: BrowserDriver,
    session: BrowserSession,
    userApproved: boolean
  ): Promise<SubmissionResult>;
}

export interface StepTraceEntry {
  step: BrowserActivityStep;
  timestamp: string;
  message: string;
  omniPresence: OmniPresenceState;
  metadata?: Record<string, any>;
}

export interface ApplicationRunRecord {
  id: string;
  userId: string;
  jobApplicationId?: string | null;
  applicationPackageId: string;
  jobId: string;
  provider: AtsProvider;
  status: ApplicationRunStatus;
  currentStep: BrowserActivityStep;
  stepsTrace: StepTraceEntry[];
  formSchema?: ApplicationFormSchema;
  filledFields?: FormFieldMapping[];
  validationResult?: ValidationResult;
  requiresUserAction: boolean;
  handoffReason?: string | null;
  handoffPayload?: Record<string, any> | null;
  userApprovedAt?: string | null;
  submittedAt?: string | null;
  confirmationUrl?: string | null;
  confirmationText?: string | null;
  evidence: Record<string, any>;
  creditReservationId?: string | null;
  idempotencyKey?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  startedAt: string;
  updatedAt: string;
  expiresAt?: string | null;
}

export interface StartBrowserRunOptions {
  userId: string;
  packageId: string;
  jobId?: string;
  idempotencyKey?: string;
}

export interface ApproveAndSubmitOptions {
  userId: string;
  runId: string;
  packageId: string;
  explicitUserConsent: boolean;
}

export interface AnswerHandoffOptions {
  userId: string;
  runId: string;
  answers: Record<string, any>;
}
