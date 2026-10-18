export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { findReplacementJobs } from '@/lib/jobs/replacement';
import { getSession } from '@/lib/auth/jwt';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '3', 10);

    const session = await getSession();
    const userId = session?.userId || null;

    const result = await findReplacementJobs({
      jobId: id,
      userId,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('[JobReplacementsRoute] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to find replacements' },
      { status: 500 }
    );
  }
}
