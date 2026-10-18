import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { BrowserApplicationAgentService } from '@/lib/browser-agent';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action = 'START', packageId, runId, answers, explicitUserConsent } = body;

    // ── 1. APPROVE AND SUBMIT ──
    if (action === 'APPROVE_AND_SUBMIT') {
      if (!runId || !packageId) {
        return NextResponse.json(
          { success: false, error: 'Missing runId or packageId parameter.' },
          { status: 400 }
        );
      }

      if (!explicitUserConsent) {
        return NextResponse.json(
          {
            success: false,
            error: 'POLICY_BLOCKED',
            message: 'Final employer application submission requires explicit user consent.',
          },
          { status: 403 }
        );
      }

      const run = await BrowserApplicationAgentService.approveAndSubmit({
        userId: session.userId,
        runId,
        packageId,
        explicitUserConsent: true,
      });

      return NextResponse.json({ success: true, run });
    }

    // ── 2. ANSWER HANDOFF QUESTION ──
    if (action === 'ANSWER_HANDOFF') {
      if (!runId || !answers) {
        return NextResponse.json(
          { success: false, error: 'Missing runId or answers payload.' },
          { status: 400 }
        );
      }

      const run = await BrowserApplicationAgentService.answerHandoff({
        userId: session.userId,
        runId,
        answers,
      });

      return NextResponse.json({ success: true, run });
    }

    // ── 3. START BROWSER APPLICATION RUN (APPROVAL MODE) ──
    if (!packageId) {
      return NextResponse.json(
        { success: false, error: 'Missing packageId parameter.' },
        { status: 400 }
      );
    }

    const run = await BrowserApplicationAgentService.startRun({
      userId: session.userId,
      packageId,
    });

    return NextResponse.json({ success: true, run });
  } catch (err: any) {
    console.error('[POST /api/applications/browser-run] Error:', err);

    if (err.message?.includes('INSUFFICIENT_CREDITS')) {
      return NextResponse.json(
        {
          success: false,
          error: 'INSUFFICIENT_CREDITS',
          message: 'Insufficient credits to reserve application submission (8 credits required).',
          required: 8,
        },
        { status: 402 }
      );
    }

    if (err.message?.includes('JOB_CLOSED')) {
      return NextResponse.json(
        {
          success: false,
          error: 'JOB_CLOSED',
          message: 'Target job opening has closed or is no longer active.',
        },
        { status: 409 }
      );
    }

    if (err.message?.includes('POLICY_BLOCKED')) {
      return NextResponse.json(
        {
          success: false,
          error: 'POLICY_BLOCKED',
          message: err.message,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to execute browser application agent.',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const runId = searchParams.get('runId');

    if (!runId) {
      return NextResponse.json({ success: false, error: 'runId is required' }, { status: 400 });
    }

    const run = await BrowserApplicationAgentService.getRunById(runId, session.userId);
    if (!run) {
      return NextResponse.json({ success: false, error: 'Application run not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, run });
  } catch (err: any) {
    console.error('[GET /api/applications/browser-run] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
