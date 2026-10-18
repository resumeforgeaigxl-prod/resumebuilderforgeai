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
    const { packageId, answers } = body;

    if (!packageId || !answers || typeof answers !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Missing packageId or answers object' },
        { status: 400 }
      );
    }

    const updatedPackage = await ApplicationPreparationEngine.answerMissingQuestions({
      packageId,
      userId: session.userId,
      answers,
    });

    return NextResponse.json({
      success: true,
      package: updatedPackage,
      status: updatedPackage.status,
      readinessScore: updatedPackage.readinessScore,
      remainingMissingCount: updatedPackage.unknownQuestions.filter((q) => q.required).length,
    });
  } catch (err: any) {
    console.error('[POST /api/applications/package/answer] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update answers' },
      { status: 500 }
    );
  }
}
