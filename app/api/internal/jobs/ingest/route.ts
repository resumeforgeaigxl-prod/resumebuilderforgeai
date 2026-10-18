export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { ingestCanonicalJobs } from '@/lib/jobs/ingest';
import { adaptGrowxCrawlJobs, type GrowxCrawlRawJob } from '@/lib/jobs/adapters/growx-crawl';
import type { CanonicalJobInput, JobSourceType } from '@/lib/jobs/types';

const MAX_BATCH_SIZE = 100;

// Simple in-memory rate-limiter: 120 requests per minute per token
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string, limit: number = 120, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetAt) {
    requestCounts.set(identifier, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Timing-safe Bearer token authentication against GROWX_CRAWL_INGEST_KEY.
 */
function verifyAuthToken(authHeader: string | null): boolean {
  const configuredKey = process.env.GROWX_CRAWL_INGEST_KEY;

  // Server must have secret configured; fail closed if not set
  if (!configuredKey || configuredKey.trim().length === 0) {
    console.warn('[InternalJobIngest] GROWX_CRAWL_INGEST_KEY is not configured on server.');
    return false;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const providedToken = authHeader.substring(7).trim();
  try {
    const bufProvided = Buffer.from(providedToken, 'utf-8');
    const bufExpected = Buffer.from(configuredKey.trim(), 'utf-8');

    if (bufProvided.length !== bufExpected.length) {
      return false;
    }

    return crypto.timingSafeEqual(bufProvided, bufExpected);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // 1. Authenticate Request
    const authHeader = req.headers.get('authorization');
    if (!verifyAuthToken(authHeader)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or missing ingest token' },
        { status: 401 }
      );
    }

    // 2. Rate Limit Check
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'internal_caller';
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded: Please wait before submitting more ingestion batches' },
        { status: 429 }
      );
    }

    // 3. Parse JSON Body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Malformed payload: expected JSON object' },
        { status: 400 }
      );
    }

    // 4. Extract Jobs Array
    let rawJobsList: any[] = [];
    let declaredSource: JobSourceType = 'growx_crawl';

    if (Array.isArray(body)) {
      rawJobsList = body;
    } else if (Array.isArray(body.jobs)) {
      rawJobsList = body.jobs;
      if (body.source) declaredSource = body.source as JobSourceType;
    } else if (body.title && body.company) {
      // Single job submitted as root object
      rawJobsList = [body];
      if (body.source) declaredSource = body.source as JobSourceType;
    } else {
      return NextResponse.json(
        { error: 'Invalid request: payload must contain a "jobs" array or single job object' },
        { status: 400 }
      );
    }

    // 5. Batch Size Enforcement
    if (rawJobsList.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        {
          error: `Batch size (${rawJobsList.length}) exceeds maximum limit of ${MAX_BATCH_SIZE} jobs per request.`,
        },
        { status: 400 }
      );
    }

    if (rawJobsList.length === 0) {
      return NextResponse.json({
        success: true,
        received: 0,
        inserted: 0,
        updated: 0,
        duplicates: 0,
        rejected: 0,
        durationMs: 0,
      });
    }

    // 6. Adapt payloads to CanonicalJobInput
    let canonicalInputs: CanonicalJobInput[];

    if (declaredSource === 'growx_crawl') {
      canonicalInputs = adaptGrowxCrawlJobs(rawJobsList as GrowxCrawlRawJob[]);
    } else {
      // Direct canonical inputs or already-normalized objects
      canonicalInputs = rawJobsList.map((j) => ({
        ...j,
        source: (j.source as JobSourceType) || declaredSource,
      }));
    }

    // 7. Execute Ingestion Pipeline
    const ingestionResult = await ingestCanonicalJobs(canonicalInputs, {
      batchSource: declaredSource,
    });

    return NextResponse.json(ingestionResult, {
      status: ingestionResult.success ? 200 : 207, // 207 Multi-Status if partial issues
    });
  } catch (err: any) {
    console.error('[InternalJobIngest] Unhandled Error:', err);
    return NextResponse.json(
      { error: 'Internal server error during job ingestion' },
      { status: 500 }
    );
  }
}
