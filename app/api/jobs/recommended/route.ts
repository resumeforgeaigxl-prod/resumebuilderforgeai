export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { rankJobsForCandidate } from '@/lib/matching';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required for job recommendations' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const minScore = parseInt(searchParams.get('minScore') || '0', 10);
    const excludeBlocked = searchParams.get('excludeBlocked') !== 'false';

    const recommendations = await rankJobsForCandidate({
      userId: session.userId,
      limit,
      minScore,
      excludeBlocked,
    });

    return NextResponse.json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error: any) {
    console.error('[API /api/jobs/recommended] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to fetch candidate job recommendations',
      },
      { status: 500 }
    );
  }
}
