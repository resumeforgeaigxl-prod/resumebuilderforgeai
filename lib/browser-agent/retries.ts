/**
 * ResumeForge — Safe Retry Policy & Loop Classifier (Level 14)
 * Strict rules governing which operations may be retried and bounded loop limits.
 * Guarantees that final submissions are NEVER blindly retried.
 */

export type RetryableOperation =
  | 'BROWSER_LAUNCH'
  | 'PAGE_NAVIGATION'
  | 'READ_ONLY_INSPECTION'
  | 'FIELD_FILLING'
  | 'FILE_UPLOAD'
  | 'FORM_VALIDATION'
  | 'CONTINUE_NEXT'
  | 'FINAL_SUBMIT';

export interface RetryEvaluation {
  canRetry: boolean;
  maxAttempts: number;
  backoffMs: number;
  reason: string;
  isTerminal?: boolean;
}

export interface ExecutionLimits {
  maxNavigationAttempts: number;
  maxStepRetries: number;
  maxRecoveryAttempts: number;
  maxRunDurationMs: number;
  maxBrowserSessionDurationMs: number;
}

export const DEFAULT_EXECUTION_LIMITS: ExecutionLimits = {
  maxNavigationAttempts: 3,
  maxStepRetries: 3,
  maxRecoveryAttempts: 3,
  maxRunDurationMs: 15 * 60 * 1000, // 15 minutes
  maxBrowserSessionDurationMs: 10 * 60 * 1000, // 10 minutes
};

export class SafeRetryClassifier {
  /**
   * Evaluates whether an operation is eligible for safe retry.
   */
  static evaluate(
    operation: RetryableOperation,
    attemptNumber: number,
    limits: Partial<ExecutionLimits> = {}
  ): RetryEvaluation {
    const mergedLimits = { ...DEFAULT_EXECUTION_LIMITS, ...limits };

    // 1. FINAL SUBMIT IS NEVER BLINDLY RETRIED
    if (operation === 'FINAL_SUBMIT') {
      return {
        canRetry: false,
        maxAttempts: 1,
        backoffMs: 0,
        reason: 'CRITICAL_SAFETY: Final employer submission must NEVER be blindly retried to prevent duplicate applications.',
        isTerminal: true,
      };
    }

    // 2. Determine per-operation retry limits
    let maxAttempts = mergedLimits.maxStepRetries;
    if (operation === 'BROWSER_LAUNCH') {
      maxAttempts = 2;
    } else if (operation === 'PAGE_NAVIGATION') {
      maxAttempts = mergedLimits.maxNavigationAttempts;
    } else if (operation === 'READ_ONLY_INSPECTION') {
      maxAttempts = 3;
    } else if (operation === 'FIELD_FILLING') {
      maxAttempts = 2; // Requires inspecting current field value before refill
    } else if (operation === 'FILE_UPLOAD') {
      maxAttempts = 2; // Verify existing upload before re-upload
    } else if (operation === 'FORM_VALIDATION') {
      maxAttempts = 2;
    } else if (operation === 'CONTINUE_NEXT') {
      maxAttempts = 2;
    }

    if (attemptNumber >= maxAttempts) {
      return {
        canRetry: false,
        maxAttempts,
        backoffMs: 0,
        reason: `EXHAUSTED_RETRIES: Operation ${operation} exceeded maximum limit of attempts (${maxAttempts}).`,
        isTerminal: true,
      };
    }

    const backoffMs = this.calculateBackoff(attemptNumber);

    return {
      canRetry: true,
      maxAttempts,
      backoffMs,
      reason: `Safe to retry operation ${operation} with bounded backoff.`,
      isTerminal: false,
    };
  }

  /**
   * Classifies an operation attempt with an explicit action recommendation.
   */
  static classify(
    operation: RetryableOperation,
    attemptNumber: number,
    error?: Error,
    limits?: Partial<ExecutionLimits>
  ): {
    canRetry: boolean;
    backoffMs: number;
    action: 'RETRY' | 'PAUSE_NEEDS_USER' | 'FAIL';
    reason: string;
    uncertainSubmission?: boolean;
  } {
    if (operation === 'FINAL_SUBMIT') {
      return {
        canRetry: false,
        backoffMs: 0,
        action: 'PAUSE_NEEDS_USER',
        reason: 'CRITICAL_SAFETY: Final submission is non-idempotent and must NEVER be blindly retried.',
        uncertainSubmission: true,
      };
    }

    const evalResult = this.evaluate(operation, attemptNumber, limits);
    if (!evalResult.canRetry) {
      return {
        canRetry: false,
        backoffMs: 0,
        action: 'FAIL',
        reason: evalResult.reason,
      };
    }

    return {
      canRetry: true,
      backoffMs: evalResult.backoffMs,
      action: 'RETRY',
      reason: evalResult.reason,
    };
  }

  /**
   * Calculates exponential backoff with full jitter to avoid thundering herds.
   */
  static calculateBackoff(
    attempt: number,
    baseMs: number = 400,
    maxMs: number = 4000,
    factor: number = 2,
    jitterRatio: number = 0.2
  ): number {
    const exp = Math.min(maxMs, baseMs * Math.pow(factor, Math.max(0, attempt - 1)));
    const jitter = Math.floor(Math.random() * (exp * jitterRatio));
    return Math.min(maxMs, exp + jitter);
  }

  /**
   * Checks whether total run duration or session duration has exceeded safe boundaries.
   */
  static checkDurationLimits(
    startedAtMs: number,
    sessionCreatedAtMs?: number,
    limits: Partial<ExecutionLimits> = {}
  ): { exceeded: boolean; reason?: string } {
    const mergedLimits = { ...DEFAULT_EXECUTION_LIMITS, ...limits };
    const now = Date.now();

    if (now - startedAtMs > mergedLimits.maxRunDurationMs) {
      return {
        exceeded: true,
        reason: `RUN_DURATION_EXCEEDED: Maximum run duration exceeded ${mergedLimits.maxRunDurationMs / 60000} minutes.`,
      };
    }

    if (sessionCreatedAtMs && now - sessionCreatedAtMs > mergedLimits.maxBrowserSessionDurationMs) {
      return {
        exceeded: true,
        reason: `SESSION_DURATION_EXCEEDED: Maximum browser session duration exceeded ${mergedLimits.maxBrowserSessionDurationMs / 60000} minutes.`,
      };
    }

    return { exceeded: false };
  }
}
