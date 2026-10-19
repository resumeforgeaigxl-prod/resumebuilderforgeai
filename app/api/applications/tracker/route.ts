import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { ApplicationTrackerService } from '@/lib/application-tracker';
import type { ApplicationStatus, SubmissionMethod } from '@/lib/application-tracker/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get('id');

    if (applicationId) {
      const detail = await ApplicationTrackerService.getApplicationDetail(
        session.userId,
        applicationId
      );
      if (!detail) {
        return NextResponse.json(
          { success: false, error: 'Application not found or unauthorized' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, application: detail });
    }

    // List applications
    const statusParam = searchParams.get('status') as ApplicationStatus | 'ACTIVE' | 'ARCHIVED' | null;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const result = await ApplicationTrackerService.listUserApplications(session.userId, {
      status: statusParam || undefined,
      search,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      applications: result.applications,
      stats: result.stats,
    });
  } catch (err: any) {
    console.error('[GET /api/applications/tracker] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve application tracking data' },
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
    const { action } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: 'Missing action parameter' }, { status: 400 });
    }

    switch (action) {
      case 'CREATE_OR_GET': {
        const { jobId, companyName, roleTitle, applicationPackageId, resumeVersionId, submissionMethod, jobSnapshot, notes } = body;
        if (!jobId || !companyName || !roleTitle) {
          return NextResponse.json({ success: false, error: 'Missing required application fields' }, { status: 400 });
        }
        const app = await ApplicationTrackerService.createOrGetApplication({
          userId: session.userId,
          jobId,
          companyName,
          roleTitle,
          applicationPackageId,
          resumeVersionId,
          submissionMethod: submissionMethod as SubmissionMethod,
          jobSnapshot,
          notes,
        });
        return NextResponse.json({ success: true, application: app });
      }

      case 'USER_REPORTED_STATUS': {
        const { applicationId, nextStatus, notes, attestationText, metadata } = body;
        if (!applicationId || !nextStatus) {
          return NextResponse.json({ success: false, error: 'Missing applicationId or nextStatus' }, { status: 400 });
        }
        const result = await ApplicationTrackerService.updateUserReportedStatus({
          userId: session.userId,
          applicationId,
          nextStatus: nextStatus as ApplicationStatus,
          notes,
          attestationText,
          metadata,
        });
        return NextResponse.json({
          success: true,
          application: result.application,
          event: result.event,
          evidence: result.evidence,
        });
      }

      case 'RECORD_EVENT': {
        const { applicationId, nextStatus, source, evidenceId, notes, metadata, idempotencyKey } = body;
        if (!applicationId || !nextStatus || !source) {
          return NextResponse.json({ success: false, error: 'Missing required event fields' }, { status: 400 });
        }
        const result = await ApplicationTrackerService.recordStatusEvent({
          userId: session.userId,
          applicationId,
          nextStatus: nextStatus as ApplicationStatus,
          source,
          evidenceId,
          notes,
          metadata,
          idempotencyKey,
        });
        return NextResponse.json({
          success: true,
          application: result.application,
          event: result.event,
        });
      }

      case 'CONFIRM_SUBMISSION': {
        const {
          applicationId,
          browserRunId,
          jobTitle,
          companyName,
          jobUrl,
          resumeVersionId,
          resumeTitle,
          answersSummary,
          atsProvider,
          confirmationCode,
          confirmationMessage,
          screenshotRef,
          submittedAt,
        } = body;

        if (!applicationId || !jobTitle || !companyName) {
          return NextResponse.json({ success: false, error: 'Missing required submission confirmation fields' }, { status: 400 });
        }

        const result = await ApplicationTrackerService.recordSubmissionConfirmed({
          userId: session.userId,
          applicationId,
          browserRunId,
          jobTitle,
          companyName,
          jobUrl,
          resumeVersionId,
          resumeTitle,
          answersSummary,
          atsProvider,
          confirmationCode,
          confirmationMessage,
          screenshotRef,
          submittedAt,
        });

        return NextResponse.json({
          success: true,
          application: result.application,
          receipt: result.receipt,
          evidence: result.evidence,
        });
      }

      default:
        return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    console.error('[POST /api/applications/tracker] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process tracking action' },
      { status: 500 }
    );
  }
}
