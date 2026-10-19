import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { AutopilotReviewQueue } from '@/lib/autopilot';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const items = await AutopilotReviewQueue.getReviewQueue(session.userId);
    return NextResponse.json({
      success: true,
      reviewQueue: items,
      count: items.length,
    });
  } catch (err: any) {
    console.error('[GET /api/autopilot/review] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch review queue' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, applicationId, reason } = body;

    if (!applicationId) {
      return NextResponse.json({ success: false, error: 'applicationId is required' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      const result = await AutopilotReviewQueue.approveApplication(session.userId, applicationId);
      return NextResponse.json(result);
    } else if (action === 'SKIP') {
      const result = await AutopilotReviewQueue.skipApplication(session.userId, applicationId, reason);
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    console.error('[POST /api/autopilot/review] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process review queue action' },
      { status: 500 }
    );
  }
}
