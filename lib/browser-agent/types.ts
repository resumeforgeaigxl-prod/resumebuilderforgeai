/**
 * ResumeForge — Browser Application Agent V2 (Level 14)
 * Provider-Neutral Browser Abstraction, Reliability, Recovery & Human Takeover Types
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
  | 'PAUSED_NEEDS_USER'
  | 'RECOVERING'
  | 'RETRY_SCHEDULED'
  | 'SESSION_EXPIRED'
  | 'NEEDS_USER'
  | 'UNSUPPORTED'
  | 'FAILED'
  | 'CANCELLED'
  | 'SUBMISSION_UNKNOWN'
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
  | 'HANDOFF_TRIGGERED'
  | 'RECOVERING'
  | 'CANCELLED';

export type OmniPresenceState =
  | 'IDLE'
  | 'READING'
  | 'THINKING'
  | 'WORKING'
  | 'EDITING'
  | 'NEEDS_USER';

export type CheckpointStep =
  | 'APPLICATION_OPENED'
  | 'ATS_DETECTED'
  | 'FORM_INSPECTED'
  | 'FIELDS_MAPPED'
  | 'FIELDS_COMPLETED'
  | 'RESUME_UPLOADED'
  | 'FORM_VALIDATED'
  | 'APPROVAL_REQUESTED';

export interface BrowserCheckpoint {
  id: string;
  runId: string;
  step: CheckpointStep;
  sequence: number;
  status: 'COMPLETED' | 'FAILED' | 'WAITING';
  safeResultReference?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface BrowserCapabilities {
  canReconnectSession: boolean;
  supportsHumanTakeover: boolean;
  supportsSessionSnapshots: boolean;
}

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
  readonly capabilities: BrowserCapabilities;
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
  reconnectSession?(sessionReference: string): Promise<BrowserSession | null>;
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

export type AtsFormSchema = ApplicationFormSchema;

export interface HandoffRequest {
  runId: string;
  reason:
    | 'CAPTCHA_REQUIRED'
    | 'MFA_REQUIRED'
    | 'LOGIN_REQUIRED'
    | 'IDENTITY_VERIFICATION'
    | 'UNKNOWN_REQUIRED_FIELD'
    | 'SENSITIVE_ANSWER_REQUIRED'
    | 'LEGAL_DECLARATION'
    | 'UNSUPPORTED_INTERACTION'
    | 'LOW_CONFIDENCE'
    | string;
  message: string;
  requiredAction: string;
  canResume: boolean;
  takeoverUrl?: string;
  expiresAt?: string;
  questionKey?: string;
  options?: string[];
  fieldKey?: string;
  question?: string;
  company?: string;
  jobTitle?: string;
  filledFieldsCount?: number;
  resumeUploaded?: boolean;
  resumeFileName?: string;
  applyUrl?: string;
  [key: string]: any;
}

export interface SubmissionGuardRecord {
  id: string;
  userId: string;
  applicationId: string;
  packageVersion: number;
  browserRunId: string;
  approvalId: string;
  formVersion: string;
  status: 'PENDING' | 'SUBMITTED' | 'FAILED' | 'UNKNOWN';
  createdAt: string;
  updatedAt: string;
}

export interface BrowserRunTelemetry {
  browserSessionDurationMs: number;
  provider: string;
  sessionCount: number;
  retryCount: number;
  recoveryCount: number;
  aiCallsCount: number;
  estimatedBrowserCostUsd: number;
  estimatedTotalCostUsd: number;
}

export type BrowserErrorCode =
  | 'NAVIGATION_TIMEOUT'
  | 'BROWSER_DISCONNECTED'
  | 'BROWSER_PROVIDER_UNAVAILABLE'
  | 'SESSION_EXPIRED'
  | 'FORM_CHANGED'
  | 'FIELD_MAPPING_FAILED'
  | 'UPLOAD_FAILED'
  | 'AUTH_REQUIRED'
  | 'CAPTCHA_REQUIRED'
  | 'MFA_REQUIRED'
  | 'SENSITIVE_ANSWER_REQUIRED'
  | 'UNKNOWN_REQUIRED_FIELD'
  | 'APPROVAL_EXPIRED'
  | 'JOB_CLOSED'
  | 'PACKAGE_STALE'
  | 'INSUFFICIENT_CREDITS'
  | 'SUBMISSION_UNKNOWN'
  | 'RECOVERY_EXHAUSTED'
  | 'DUPLICATE_SUBMISSION_ATTEMPT_BLOCKED'
  | 'CIRCUIT_BREAKER_TRIPPED';

export type BrowserNextAction =
  | 'RETRY_SAFE_STEP'
  | 'RECOVER_SESSION'
  | 'ASK_USER'
  | 'MANUAL_FALLBACK'
  | 'STOP';

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
  handoffPayload?: HandoffRequest | Record<string, any> | null;
  userApprovedAt?: string | null;
  submittedAt?: string | null;
  confirmationUrl?: string | null;
  confirmationText?: string | null;
  evidence: Record<string, any>;
  creditReservationId?: string | null;
  idempotencyKey?: string | null;
  errorCode?: BrowserErrorCode | string | null;
  errorMessage?: string | null;
  startedAt: string;
  updatedAt: string;
  expiresAt?: string | null;

  // Level 14: Reliability & Recovery State
  checkpointVersion: number;
  attemptCount: number;
  recoveryCount: number;
  sessionReference?: string | null;
  browserSessionExpiresAt?: string | null;
  workerId?: string | null;
  leaseExpiresAt?: string | null;
  lastHeartbeatAt?: string | null;
  formVersion?: string | null;
  packageVersion?: number;
  approvalId?: string | null;
  telemetry?: BrowserRunTelemetry;
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

export interface RecoverRunOptions {
  userId: string;
  runId: string;
}

export interface CancelRunOptions {
  userId: string;
  runId: string;
  reason?: string;
}

export interface HeartbeatRunOptions {
  runId: string;
  workerId: string;
  ttlSeconds?: number;
}
