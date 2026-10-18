import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { ApplicationPreparationEngine } from '@/lib/application-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, userOverride = false, forceFresh = false, includeCoverLetter = false } = body;

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Missing jobId parameter' }, { status: 400 });
    }

    const packageResult = await ApplicationPreparationEngine.preparePackage({
      userId: session.userId,
      jobId,
      userOverride,
      forceFresh,
      includeCoverLetter,
    });

    return NextResponse.json({
      success: true,
      package: packageResult,
    });
  } catch (err: any) {
    console.error('[POST /api/applications/prepare] Error:', err);
    if (err.message?.includes('INSUFFICIENT_CREDITS')) {
      return NextResponse.json(
        {
          success: false,
          error: 'INSUFFICIENT_CREDITS',
          message: 'Insufficient credits to prepare application package. Please top up your wallet.',
          required: 4,
        },
        { status: 402 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to prepare application package',
      },
      { status: 500 }
    );
  }
}
