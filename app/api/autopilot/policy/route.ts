import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { AutopilotPolicyManager, AutopilotExecutionEngine } from '@/lib/autopilot';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [policy, stats] = await Promise.all([
      AutopilotPolicyManager.getPolicy(session.userId),
      AutopilotExecutionEngine.getActivityStats(session.userId),
    ]);

    return NextResponse.json({
      success: true,
      policy,
      stats,
    });
  } catch (err: any) {
    console.error('[GET /api/autopilot/policy] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve Autopilot policy' },
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
    const { action, updates } = body;

    let updatedPolicy;
    if (action === 'PAUSE') {
      updatedPolicy = await AutopilotPolicyManager.pauseAutopilot(
        session.userId,
        body.reason || 'Paused by candidate'
      );
    } else if (action === 'RESUME') {
      updatedPolicy = await AutopilotPolicyManager.resumeAutopilot(session.userId);
    } else if (action === 'DISABLE') {
      updatedPolicy = await AutopilotPolicyManager.disableAutopilot(session.userId);
    } else {
      updatedPolicy = await AutopilotPolicyManager.updatePolicy(
        session.userId,
        updates || body
      );
    }

    const stats = await AutopilotExecutionEngine.getActivityStats(session.userId);

    return NextResponse.json({
      success: true,
      policy: updatedPolicy,
      stats,
    });
  } catch (err: any) {
    console.error('[POST /api/autopilot/policy] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update Autopilot policy' },
      { status: 500 }
    );
  }
}
