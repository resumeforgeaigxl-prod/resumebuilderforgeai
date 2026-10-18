export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import {
  getCandidateApplicationProfile,
  updateCandidateIdentity,
  updateCandidateCareer,
  updateCandidatePreferences,
  upsertApplicationAnswer,
} from '@/lib/capabilities/profile';

/**
 * GET /api/candidate-profile
 * Returns the authenticated user's canonical Candidate Application Profile,
 * including completeness %, readiness state, identity, career, preferences, and verified answers.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getCandidateApplicationProfile(session.userId);
    return NextResponse.json({ success: true, profile });
  } catch (err: any) {
    console.error('[GET /api/candidate-profile] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to retrieve candidate profile' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/candidate-profile
 * Updates candidate identity, career, preferences, or reusable application answers.
 * Protected by user session authentication (no cross-user writes).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.userId;
    const body = await req.json();

    const { identity, career, preferences, answers, singleAnswer } = body;

    // 1. Update Identity if provided
    if (identity && typeof identity === 'object') {
      await updateCandidateIdentity(userId, identity);
    }

    // 2. Update Career if provided
    if (career && typeof career === 'object') {
      await updateCandidateCareer(userId, career);
    }

    // 3. Update Preferences if provided
    if (preferences && typeof preferences === 'object') {
      await updateCandidatePreferences(userId, preferences);
    }

    // 4. Batch update answers if provided
    if (answers && typeof answers === 'object') {
      for (const [key, val] of Object.entries(answers)) {
        const item = val as any;
        await upsertApplicationAnswer(userId, key, item.value, {
          status: item.status || 'VERIFIED',
          verified: item.status === 'VERIFIED',
          source: item.source || 'user',
          valueType: item.valueType,
        });
      }
    }

    // 5. Update single answer if provided
    if (singleAnswer && typeof singleAnswer === 'object' && singleAnswer.key) {
      await upsertApplicationAnswer(userId, singleAnswer.key, singleAnswer.value, {
        status: singleAnswer.status || 'VERIFIED',
        verified: singleAnswer.status === 'VERIFIED',
        source: singleAnswer.source || 'user',
        valueType: singleAnswer.valueType,
      });
    }

    // Return the fresh recalculated profile
    const updatedProfile = await getCandidateApplicationProfile(userId);
    return NextResponse.json({
      success: true,
      message: 'Candidate application profile updated successfully',
      profile: updatedProfile,
    });
  } catch (err: any) {
    console.error('[POST /api/candidate-profile] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update candidate profile' },
      { status: 500 }
    );
  }
}
