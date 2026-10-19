import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { AutopilotExecutionEngine } from '@/lib/autopilot';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const run = await AutopilotExecutionEngine.executeCycle(session.userId, {
      force: true,
      idempotencyKey: body.idempotencyKey,
    });

    return NextResponse.json({
      success: true,
      run,
    });
  } catch (err: any) {
    console.error('[POST /api/autopilot/run] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to execute Autopilot cycle' },
      { status: 500 }
    );
  }
}
