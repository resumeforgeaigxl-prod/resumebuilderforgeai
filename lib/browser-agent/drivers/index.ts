/**
 * Browser Driver Factory (Level 13)
 * Provides abstract driver instantiation based on BROWSER_PROVIDER configuration.
 */

import type { BrowserDriver } from '../types';
import { MockBrowserDriver } from './mock-driver';
import { PuppeteerBrowserDriver } from './puppeteer-driver';

export * from './driver-interface';
export * from './mock-driver';
export * from './puppeteer-driver';

export function getBrowserDriver(preferredProvider?: string): BrowserDriver {
  const provider = (preferredProvider || process.env.BROWSER_PROVIDER || 'mock').toLowerCase();

  if (provider === 'puppeteer' || provider === 'chromium') {
    return new PuppeteerBrowserDriver();
  }

  // Default: safe, deterministic, zero-infrastructure mock browser driver
  return new MockBrowserDriver();
}
