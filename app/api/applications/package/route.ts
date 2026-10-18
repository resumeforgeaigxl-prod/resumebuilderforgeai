import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { ApplicationPreparationEngine } from '@/lib/application-engine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get('id') || undefined;
    const jobId = searchParams.get('jobId') || undefined;

    if (!packageId && !jobId) {
      return NextResponse.json(
        { success: false, error: 'Must provide either id or jobId parameter' },
        { status: 400 }
      );
    }

    const pkg = await ApplicationPreparationEngine.getPackage({
      userId: session.userId,
      packageId,
      jobId,
    });

    if (!pkg) {
      return NextResponse.json(
        { success: false, message: 'Application package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      package: pkg,
    });
  } catch (err: any) {
    console.error('[GET /api/applications/package] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch application package' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const packageId = searchParams.get('id');

    if (!packageId) {
      return NextResponse.json({ success: false, error: 'Missing package id parameter' }, { status: 400 });
    }

    const success = await ApplicationPreparationEngine.discardPackage(packageId, session.userId);

    return NextResponse.json({
      success,
      message: success ? 'Package discarded safely.' : 'Could not discard package.',
    });
  } catch (err: any) {
    console.error('[DELETE /api/applications/package] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete package' },
      { status: 500 }
    );
  }
}
