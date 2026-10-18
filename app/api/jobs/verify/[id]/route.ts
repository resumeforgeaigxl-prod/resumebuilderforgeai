export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { verifyCanonicalJob } from '@/lib/jobs/freshness';
import { findReplacementJobs } from '@/lib/jobs/replacement';
import { getSession } from '@/lib/auth/jwt';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';

    const session = await getSession();
    const userId = session?.userId || null;

    // Verify vacancy live status
    const verification = await verifyCanonicalJob(id, { force });

    let replacements: any[] = [];
    if (verification.status === 'CLOSED') {
      const repResult = await findReplacementJobs({
        jobId: id,
        userId,
        limit: 3,
      });
      replacements = repResult.replacements;
    }

    return NextResponse.json({
      success: true,
      verification,
      isClosed: verification.status === 'CLOSED',
      replacements,
    });
  } catch (err: any) {
    console.error('[JobVerifyRoute] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to verify job status' },
      { status: 500 }
    );
  }
}
