export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { enrichProfileFromResume, getCandidateApplicationProfile } from '@/lib/capabilities/profile';

/**
 * POST /api/candidate-profile/enrich
 * Safely enriches missing Candidate Application Profile attributes using the candidate's latest Resume.
 * RULE: Only populates empty/unspecified fields.
 * RULE: Never overwrites user-confirmed profile values.
 * RULE: Never infers work authorization or sensitive questions.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let resumeId: string | undefined;
    try {
      const body = await req.json();
      resumeId = body.resumeId;
    } catch {
      // Body may be empty if enriching from default latest resume
    }

    const enrichmentResult = await enrichProfileFromResume(session.userId, resumeId);
    const updatedProfile = await getCandidateApplicationProfile(session.userId);

    return NextResponse.json({
      success: true,
      result: enrichmentResult,
      profile: updatedProfile,
    });
  } catch (err: any) {
    console.error('[POST /api/candidate-profile/enrich] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to enrich candidate profile from resume' },
      { status: 500 }
    );
  }
}
