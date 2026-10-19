import { NextRequest, NextResponse } from 'next/server';
import { AutopilotSchedulerService } from '@/lib/autopilot';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return handleCron(req);
}

export async function POST(req: NextRequest) {
  return handleCron(req);
}

async function handleCron(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const cronSecret = process.env.CRON_SECRET;

    // Verify Authorization: Bearer <CRON_SECRET> if set in environment
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized cron trigger' }, { status: 401 });
    }

    const batchResult = await AutopilotSchedulerService.runScheduledBatch();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...batchResult,
    });
  } catch (err: any) {
    console.error('[CRON /api/autopilot/cron] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Cron scheduler failed' },
      { status: 500 }
    );
  }
}
