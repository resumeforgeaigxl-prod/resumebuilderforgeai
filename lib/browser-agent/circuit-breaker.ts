/**
 * ResumeForge — ATS Adapter Circuit Breaker (Level 14)
 * Protects against sending agents into broken or newly-modified employer workflows.
 */

import type { AtsProvider } from './types';

interface CircuitState {
  failures: number;
  lastFailureAt?: number;
  trippedUntil?: number;
  lastFailureReason?: string;
}

const FAILURE_THRESHOLD = 3; // Trip after 3 consecutive mapping or validation failures
const COOLDOWN_DURATION_MS = 15 * 60 * 1000; // 15 minutes cooldown

const circuitStates = new Map<AtsProvider, CircuitState>();

export class AtsCircuitBreaker {
  /**
   * Verifies if an ATS adapter is healthy and available for automation.
   */
  static isAvailable(provider: AtsProvider): { available: boolean; reason?: string } {
    if (provider === 'UNSUPPORTED') {
      return { available: false, reason: 'Provider is not supported for browser automation.' };
    }

    const state = circuitStates.get(provider);
    if (!state) {
      return { available: true };
    }

    const now = Date.now();
    if (state.trippedUntil && state.trippedUntil > now) {
      const remainingMinutes = Math.ceil((state.trippedUntil - now) / 60000);
      return {
        available: false,
        reason: `CIRCUIT_BREAKER_TRIPPED: ${provider} adapter has encountered repeated layout or validation failures (${state.lastFailureReason || 'external layout change'}). Temporarily paused for ${remainingMinutes} more minutes. Fallback to manual application.`,
      };
    }

    // Cooldown elapsed — allow trial run
    if (state.trippedUntil && state.trippedUntil <= now) {
      state.failures = 1; // half-open state
      delete state.trippedUntil;
    }

    return { available: true };
  }

  /**
   * Checks whether the circuit for a provider is currently tripped (OPEN).
   */
  static isTripped(provider: AtsProvider): boolean {
    return !this.isAvailable(provider).available;
  }

  /**
   * Returns current circuit state metrics for telemetry and monitoring.
   */
  static getStatus(provider: AtsProvider): {
    state: 'OPEN' | 'CLOSED';
    consecutiveFailures: number;
    cooldownExpiresAt?: string;
  } {
    const state = circuitStates.get(provider);
    const tripped = this.isTripped(provider);
    return {
      state: tripped ? 'OPEN' : 'CLOSED',
      consecutiveFailures: state?.failures || 0,
      cooldownExpiresAt: state?.trippedUntil ? new Date(state.trippedUntil).toISOString() : undefined,
    };
  }

  /**
   * Records a mapping or validation failure for an adapter.
   */
  static recordFailure(
    provider: AtsProvider,
    reason: string
  ): { state: 'OPEN' | 'CLOSED'; consecutiveFailures: number } {
    if (provider === 'UNSUPPORTED') {
      return { state: 'OPEN', consecutiveFailures: 0 };
    }

    const state = circuitStates.get(provider) || { failures: 0 };
    state.failures++;
    state.lastFailureAt = Date.now();
    state.lastFailureReason = reason;

    if (state.failures >= FAILURE_THRESHOLD) {
      state.trippedUntil = Date.now() + COOLDOWN_DURATION_MS;
      console.warn(
        `[AtsCircuitBreaker] Tripped circuit for ${provider} after ${state.failures} consecutive failures. Cooldown: 15m. Reason: ${reason}`
      );
    }

    circuitStates.set(provider, state);
    return {
      state: this.isTripped(provider) ? 'OPEN' : 'CLOSED',
      consecutiveFailures: state.failures,
    };
  }

  /**
   * Resets failure counter upon successful validation and submission.
   */
  static recordSuccess(provider: AtsProvider): void {
    circuitStates.delete(provider);
  }

  /**
   * Resets all circuit states (used for testing).
   */
  static resetAll(): void {
    circuitStates.clear();
  }
}
