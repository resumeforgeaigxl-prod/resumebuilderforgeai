/**
 * ResumeForge — Google Indexing API Service
 * Server-side abstraction for real-time notification of job URL additions, updates,
 * and removals to search engines.
 *
 * Designed to fail gracefully when service-account credentials are not configured,
 * ensuring local development and production builds never fail.
 */

import { getCanonicalJobUrl } from './slug';

export interface IndexingNotificationResult {
  success: boolean;
  skipped?: boolean;
  type: 'URL_UPDATED' | 'URL_DELETED';
  url: string;
  error?: string;
}

const INDEXING_API_ENDPOINT = 'https://indexing.googleapis.com/v3/urlNotifications:publish';
const OAUTH_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

/**
 * Generates an OAuth2 bearer token for the Google Indexing API using service-account credentials.
 */
async function getGoogleIndexingAccessToken(): Promise<string | null> {
  const clientEmail = process.env.GOOGLE_INDEXING_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_INDEXING_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    return null;
  }

  try {
    // Standardize newline formatting in private key
    privateKey = privateKey.replace(/\\n/g, '\n');

    const { SignJWT, importPKCS8 } = await import('jose');
    const privateKeyObj = await importPKCS8(privateKey, 'RS256');

    const now = Math.floor(Date.now() / 1000);
    const jwt = await new SignJWT({
      scope: 'https://www.googleapis.com/auth/indexing',
    })
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuer(clientEmail)
      .setSubject(clientEmail)
      .setAudience(OAUTH_TOKEN_ENDPOINT)
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(privateKeyObj);

    const tokenRes = await fetch(OAUTH_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!tokenRes.ok) {
      console.warn('[Google Indexing] Token exchange failed with status', tokenRes.status);
      return null;
    }

    const tokenData = await tokenRes.json();
    return tokenData.access_token || null;
  } catch (err: any) {
    console.warn('[Google Indexing] Error obtaining access token:', err.message);
    return null;
  }
}

/**
 * Publishes a URL notification (URL_UPDATED or URL_DELETED) to the Google Indexing API.
 * Never throws — always returns a safe result object.
 */
export async function publishIndexingNotification(
  url: string,
  type: 'URL_UPDATED' | 'URL_DELETED'
): Promise<IndexingNotificationResult> {
  const accessToken = await getGoogleIndexingAccessToken();

  if (!accessToken) {
    // Graceful skip in development or when credentials are not configured
    return {
      success: true,
      skipped: true,
      type,
      url,
    };
  }

  try {
    const res = await fetch(INDEXING_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        url,
        type,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[Google Indexing] API notification returned ${res.status}:`, errText);
      return {
        success: false,
        type,
        url,
        error: `HTTP ${res.status}: ${errText}`,
      };
    }

    return {
      success: true,
      type,
      url,
    };
  } catch (err: any) {
    console.warn('[Google Indexing] Request exception:', err.message);
    return {
      success: false,
      type,
      url,
      error: err.message,
    };
  }
}

/**
 * Semantic helper: Notify search engines that an eligible canonical job is newly published or updated.
 * Non-blocking, downstream fire-and-forget.
 */
export async function notifyJobUrlUpdated(
  jobId: string,
  slug?: string
): Promise<IndexingNotificationResult> {
  const url = getCanonicalJobUrl({ id: jobId, slug });
  return publishIndexingNotification(url, 'URL_UPDATED');
}

/**
 * Semantic helper: Notify search engines that a canonical job has closed or been removed.
 * Non-blocking, downstream fire-and-forget.
 */
export async function notifyJobUrlRemoved(
  jobId: string,
  slug?: string
): Promise<IndexingNotificationResult> {
  const url = getCanonicalJobUrl({ id: jobId, slug });
  return publishIndexingNotification(url, 'URL_DELETED');
}
