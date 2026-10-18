export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { matchCandidateToJob } from '@/lib/matching';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required for job matching' },
        { status: 401 }
      );
    }

    const { id: jobId } = await params;
    if (!jobId) {
      return NextResponse.json(
        { success: false, message: 'Job ID is required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const forceRecalculate = searchParams.get('forceRecalculate') === 'true';

    const match = await matchCandidateToJob({
      userId: session.userId,
      jobId,
      forceRecalculate,
    });

    return NextResponse.json({
      success: true,
      match,
    });
  } catch (error: any) {
    console.error('[API /api/jobs/match/[id]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to calculate candidate match',
      },
      { status: 500 }
    );
  }
}
