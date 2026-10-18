export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyStaleJobsBatch } from '@/lib/jobs/freshness';

function verifyAuthToken(authHeader: string | null): boolean {
  const allowedKeys = [
    process.env.GROWX_CRAWL_INGEST_KEY,
    process.env.CRON_SECRET,
  ].filter(Boolean) as string[];

  if (allowedKeys.length === 0) {
    console.warn('[VerifyBatchRoute] Neither GROWX_CRAWL_INGEST_KEY nor CRON_SECRET is configured.');
    return false;
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7).trim();
  const tokenBuf = Buffer.from(token, 'utf-8');

  for (const key of allowedKeys) {
    const keyBuf = Buffer.from(key.trim(), 'utf-8');
    if (tokenBuf.length === keyBuf.length && crypto.timingSafeEqual(tokenBuf, keyBuf)) {
      return true;
    }
  }

  return false;
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!verifyAuthToken(authHeader)) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or missing bearer token' }, { status: 401 });
    }

    let batchSize = 50;
    try {
      const body = await req.json();
      if (typeof body?.batchSize === 'number') {
        batchSize = body.batchSize;
      }
    } catch {
      // Body is optional, default batchSize 50 is fine
    }

    const result = await verifyStaleJobsBatch(batchSize);

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[VerifyBatchRoute] Error:', err);
    return NextResponse.json({ error: 'Internal server error during freshness verification' }, { status: 500 });
  }
}

// Allow GET for cron triggers with Authorization header
export async function GET(req: Request) {
  return POST(req);
}
