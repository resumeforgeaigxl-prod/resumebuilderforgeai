/**
 * ResumeForge — Browser Telemetry & Cost Control (Level 14)
 * Tracks browser session duration, retry counts, recovery overhead,
 * and estimated COGS without heavyweight external dependencies.
 */

import type { BrowserRunTelemetry } from './types';

// Cost estimates based on lean serverless/container unit economics
const ESTIMATED_BROWSER_COST_PER_MINUTE_USD = 0.004; // ~$0.24 / hour
const ESTIMATED_AI_CALL_COST_USD = 0.0015;

export class BrowserTelemetryTracker {
  /**
   * Initializes or updates telemetry for an application run.
   */
  static computeTelemetry(params: {
    startedAt: string | Date;
    completedAt?: string | Date;
    provider: string;
    sessionCount?: number;
    retryCount?: number;
    recoveryCount?: number;
    aiCallsCount?: number;
  }): BrowserRunTelemetry {
    const {
      startedAt,
      completedAt,
      provider,
      sessionCount = 1,
      retryCount = 0,
      recoveryCount = 0,
      aiCallsCount = 1,
    } = params;

    const startMs = new Date(startedAt).getTime();
    const endMs = completedAt ? new Date(completedAt).getTime() : Date.now();
    const durationMs = Math.max(0, endMs - startMs);
    const durationMinutes = durationMs / 60000;

    const estimatedBrowserCostUsd = Number(
      (durationMinutes * ESTIMATED_BROWSER_COST_PER_MINUTE_USD).toFixed(5)
    );
    const estimatedTotalCostUsd = Number(
      (estimatedBrowserCostUsd + aiCallsCount * ESTIMATED_AI_CALL_COST_USD).toFixed(5)
    );

    return {
      browserSessionDurationMs: durationMs,
      provider,
      sessionCount,
      retryCount,
      recoveryCount,
      aiCallsCount,
      estimatedBrowserCostUsd,
      estimatedTotalCostUsd,
    };
  }
}
