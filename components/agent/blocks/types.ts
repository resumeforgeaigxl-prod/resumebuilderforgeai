'use client';

// Base text & typography blocks
export interface TextBlock {
  type: 'text';
  text: string;
}

export interface MarkdownBlock {
  type: 'markdown';
  content: string;
}

export interface HeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4;
  text: string;
}

export interface ListBlock {
  type: 'list';
  ordered?: boolean;
  items: string[];
}

// Data table block
export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TableBlock {
  type: 'table';
  title?: string;
  columns: TableColumn[];
  rows: Array<Record<string, any>>;
  caption?: string;
}

// Code & diff blocks
export interface CodeBlock {
  type: 'code';
  language: string;
  code: string;
  title?: string;
  showLineNumbers?: boolean;
}

export interface DiffBlock {
  type: 'diff';
  language?: string;
  title?: string;
  original: string;
  modified: string;
}

// Metrics, scores & progress
export interface MetricBlock {
  type: 'metric';
  label: string;
  value: string | number;
  delta?: string;
  category?: string;
  status?: 'positive' | 'negative' | 'neutral';
}

export interface ScoreBlock {
  type: 'score';
  label: string;
  score: number; // 0 - 100
  total?: number;
  category?: string;
  verdict?: string;
}

export interface ProgressBlock {
  type: 'progress';
  label: string;
  current: number;
  total: number;
  percentage?: number;
  status?: string;
}

export interface ChecklistBlock {
  type: 'checklist';
  title?: string;
  items: Array<{
    id: string;
    label: string;
    checked: boolean;
    description?: string;
  }>;
}

// Forms & questions inside chat
export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'radio' | 'checkbox' | 'select' | 'date';
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
  defaultValue?: any;
}

export interface FormBlock {
  type: 'form';
  id?: string;
  title?: string;
  description?: string;
  fields: FormField[];
  submitLabel?: string;
  action?: string;
}

export interface QuestionBlock {
  type: 'question';
  id?: string;
  prompt: string;
  category?: string;
  options?: Array<{ label: string; value: string }>;
  allowCustomInput?: boolean;
  submitLabel?: string;
}

// Status, alert, and timeline blocks
export interface StatusBlock {
  type: 'status';
  status: 'success' | 'warning' | 'info' | 'error' | 'blocked';
  title: string;
  message: string;
  details?: string;
}

export interface TimelineBlock {
  type: 'timeline';
  title?: string;
  steps: Array<{
    title: string;
    description?: string;
    status: 'completed' | 'current' | 'pending';
    date?: string;
  }>;
}

// Sandboxed HTML artifact block
export interface HtmlArtifactBlock {
  type: 'html_artifact';
  id?: string;
  title: string;
  html: string;
  description?: string;
  aspectRatio?: string;
}

// Interactive action buttons block
export interface ActionButton {
  id: string;
  label: string;
  action: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  payload?: Record<string, any>;
  icon?: string;
}

export interface ActionBlock {
  type: 'actions';
  title?: string;
  actions: ActionButton[];
}

// Domain-specific rich blocks
export interface LearningWeek {
  week: number;
  title: string;
  topics: string[];
}

export interface LearningPlanBlock {
  type: 'learning_plan';
  id?: string;
  title: string;
  topic: string;
  durationWeeks: number;
  progress?: number;
  weeks?: LearningWeek[];
  syllabus?: string[];
  status?: string;
}

export interface JobItem {
  id?: string;
  title: string;
  company: string;
  location?: string;
  matchScore?: number;
  snippet?: string;
  url?: string;
}

export interface JobBlock {
  type: 'job';
  query?: string;
  count?: number;
  jobs: JobItem[];
}

export interface JobMatchBlock {
  type: 'job_match';
  jobId: string;
  jobTitle: string;
  company: string;
  location?: string;
  score?: number;
  category?: string;
  recommendation?: string;
  confidence?: string;
  isBlocked?: boolean;
  summary?: string;
  strongMatches?: string[];
  partialMatches?: string[];
  missingRequirements?: string[];
  underrepresentedSkills?: string[];
  blockers?: string[];
}

export interface ResumeBlock {
  type: 'resume';
  resumeId?: string;
  title: string;
  atsScore: number;
  scoreCategory?: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  keyImprovements?: string[];
  downloadUrl?: string;
  isTailored?: boolean;
}

export interface ApplicationQuestion {
  key: string;
  question: string;
  required: boolean;
  reason?: string;
  sensitive?: boolean;
  allowedOptions?: string[];
}

export interface ApplicationBlock {
  type: 'application';
  packageId?: string;
  runId?: string;
  jobId?: string;
  jobTitle: string;
  company: string;
  status:
    | 'READY'
    | 'NEEDS_USER'
    | 'BLOCKED'
    | 'DRAFT'
    | 'STARTING'
    | 'INSPECTING'
    | 'FILLING'
    | 'VALIDATING'
    | 'AWAITING_APPROVAL'
    | 'SUBMITTING'
    | 'SUBMITTED'
    | 'UNSUPPORTED'
    | 'PAUSED_NEEDS_USER'
    | 'RECOVERING'
    | 'RETRY_SCHEDULED'
    | 'SESSION_EXPIRED'
    | 'FAILED'
    | 'CANCELLED'
    | 'SUBMISSION_UNKNOWN'
    | string;
  readinessScore: string | number;
  resumeUsed?: string;
  tailoringStatus?: string;
  missingQuestionsCount?: number;
  missingQuestions?: ApplicationQuestion[];
  filledFieldsCount?: number;
  provider?: string;
  submittedAt?: string;
  confirmationUrl?: string;
  applyUrl?: string;
  reason?: string;
  evidence?: string;
  handoffReason?: string;
  handoffMessage?: string;
  requiredAction?: string;
  takeoverUrl?: string;
  canResume?: boolean;
  recoveryCount?: number;
  attemptCount?: number;
}

export interface InterviewBlock {
  type: 'interview';
  sessionId?: string;
  role: string;
  difficulty?: string;
  topicCounts?: {
    technical?: number;
    behavioral?: number;
    resumeBased?: number;
  };
  focusAreas?: string[];
  questions?: string[];
  firstQuestion?: string;
}

export interface CodingBlock {
  type: 'coding';
  id?: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  topic?: string;
  description: string;
  approach?: string;
  starterCode?: string;
  testCases?: Array<{ input: string; output?: string; expected_output?: string }>;
  results?: Array<{ input?: string; actual?: string; expected?: string; passed?: boolean }>;
  summary?: { total: number; passed: number; failed: number };
}

export interface SalaryBlock {
  type: 'salary';
  role: string;
  currentOffer: string;
  targetSalary: string;
  recommendedCounter?: string;
  script?: string;
  keyPoints?: string[];
  marketInsight?: string;
}

export interface ProjectFile {
  path: string;
  code: string;
}

export interface ProjectBlock {
  type: 'project';
  projectName: string;
  techStack: string[];
  folderStructure?: string;
  files: ProjectFile[];
  explanation?: string;
}

export interface ErrorBlock {
  type: 'error';
  errorType:
    | 'CREDIT_EXHAUSTED'
    | 'RATE_LIMIT'
    | 'POLICY_BLOCKED'
    | 'TOOL_FAILED'
    | 'AUTHENTICATION_REQUIRED'
    | 'JOB_NOT_FOUND'
    | 'JOB_CLOSED'
    | 'JOB_UNVERIFIED'
    | 'JOB_UNSUPPORTED'
    | 'GENERAL';
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  action?: string;
  retryable?: boolean;
  details?: string;
}

export interface HandoffBlock {
  type: 'handoff';
  questionKey: string;
  prompt: string;
  reason?: string;
  options?: Array<{ label: string; value: string }>;
  actionLabel?: string;
}

// Canonical OmniBlock Union
export type OmniBlock =
  | TextBlock
  | MarkdownBlock
  | HeadingBlock
  | ListBlock
  | TableBlock
  | CodeBlock
  | DiffBlock
  | MetricBlock
  | ScoreBlock
  | ProgressBlock
  | ChecklistBlock
  | FormBlock
  | QuestionBlock
  | StatusBlock
  | TimelineBlock
  | HtmlArtifactBlock
  | ActionBlock
  | LearningPlanBlock
  | JobBlock
  | JobMatchBlock
  | ResumeBlock
  | ApplicationBlock
  | InterviewBlock
  | CodingBlock
  | SalaryBlock
  | ProjectBlock
  | ErrorBlock
  | HandoffBlock;

export type OmniBlockType = OmniBlock['type'];

// Canonical OmniMessage Structure
export interface OmniMessage {
  id: string;
  role: 'user' | 'assistant';
  blocks: OmniBlock[];
  // Backwards compatibility for legacy properties
  content?: string;
  suggestedAction?: string;
  artifacts?: any[];
  timestamp?: string;
}

// Canonical OmniResponse Envelope
export interface OmniResponseEnvelope {
  id: string;
  blocks: OmniBlock[];
  status: 'complete' | 'needs_user' | 'blocked' | 'failed';
  metadata?: {
    skill?: string;
    agent?: string;
    conversationId?: string;
    latencyMs?: number;
  };
}
