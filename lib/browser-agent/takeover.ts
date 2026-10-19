/**
 * ResumeForge — Human Takeover System & Handoff Manager (Level 14)
 * Provides genuine human handoff when security challenges, unknown fields,
 * or sensitive legal questions are encountered.
 * Supports secure interactive takeover where provider-supported, or truthful manual fallback.
 */

import crypto from 'crypto';
import type { BrowserDriver, BrowserSession, HandoffRequest } from './types';

export class TakeoverManager {
  /**
   * Constructs a structured HandoffRequest for the candidate inside Omni.
   */
  static createHandoffRequest(params: {
    runId: string;
    userId: string;
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
    canResume?: boolean;
    questionKey?: string;
    options?: string[];
    fieldKey?: string;
    driver?: BrowserDriver;
    session?: BrowserSession | null;
  }): HandoffRequest {
    const {
      runId,
      userId,
      reason,
      message,
      requiredAction,
      canResume = true,
      questionKey,
      options,
      fieldKey,
      driver,
      session,
    } = params;

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes TTL

    // Check if the current driver provider actually supports secure interactive takeover
    let takeoverUrl: string | undefined;
    if (driver?.capabilities.supportsHumanTakeover && session) {
      // Generate short-lived, user-scoped signed takeover token
      const token = crypto
        .createHmac('sha256', process.env.JWT_SECRET || 'browser_takeover_secret')
        .update(`${runId}:${userId}:${session.sessionId}:${expiresAt}`)
        .digest('hex');

      takeoverUrl = `/api/applications/browser-run/takeover?runId=${runId}&token=${token}&expires=${encodeURIComponent(expiresAt)}`;
    }

    return {
      runId,
      reason,
      message,
      requiredAction,
      canResume,
      takeoverUrl,
      expiresAt,
      questionKey,
      options,
      fieldKey,
    };
  }

  /**
   * Verifies an interactive takeover token.
   */
  static verifyTakeoverToken(params: {
    runId: string;
    userId: string;
    sessionId: string;
    token: string;
    expires: string;
  }): boolean {
    const { runId, userId, sessionId, token, expires } = params;

    // Check expiration
    if (new Date(expires).getTime() < Date.now()) {
      return false;
    }

    const expected = crypto
      .createHmac('sha256', process.env.JWT_SECRET || 'browser_takeover_secret')
      .update(`${runId}:${userId}:${sessionId}:${expires}`)
      .digest('hex');

    try {
      const bufToken = Buffer.from(token, 'utf-8');
      const bufExpected = Buffer.from(expected, 'utf-8');
      if (bufToken.length !== bufExpected.length) return false;
      return crypto.timingSafeEqual(bufToken, bufExpected);
    } catch {
      return false;
    }
  }
}
