import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();

    // 1. Fetch tracked applications with joined job details and package details
    const { data: apps, error } = await supabase
      .from('job_applications')
      .select(`
        id,
        user_id,
        job_id,
        status,
        preparation_status,
        application_package_id,
        application_method,
        applied_at,
        jobs:job_id (
          id,
          title,
          company,
          location,
          employment_type,
          status,
          apply_url,
          last_verified_at,
          source_platform
        )
      `)
      .eq('user_id', session.userId)
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('[GET /api/applications/list] Query error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // 2. Fetch all packages for the user to join match score, missing questions, and readiness
    const { data: packages } = await supabase
      .from('application_packages')
      .select('id, job_id, status, readiness_score, unknown_questions, tailored_resume_id, updated_at, match_snapshot')
      .eq('user_id', session.userId);

    const packageMap = new Map<string, any>();
    if (packages) {
      for (const pkg of packages) {
        packageMap.set(pkg.job_id, pkg);
      }
    }

    // 3. Partition applications by category
    const partitioned = {
      saved: [] as any[],
      preparing: [] as any[],
      needs_input: [] as any[],
      ready: [] as any[],
      applied: [] as any[],
      interviewing: [] as any[],
      offered: [] as any[],
      rejected: [] as any[],
      all: [] as any[],
    };

    for (const app of apps || []) {
      const pkg = packageMap.get(app.job_id);
      const appRecord = {
        id: app.id,
        jobId: app.job_id,
        job: app.jobs,
        status: app.status,
        preparationStatus: pkg ? pkg.status : app.preparation_status || 'DRAFT',
        packageId: pkg?.id || app.application_package_id,
        readinessScore: pkg?.readiness_score ?? 0,
        missingQuestionsCount: pkg?.unknown_questions?.filter((q: any) => q.required)?.length ?? 0,
        matchScore: pkg?.match_snapshot?.score ?? null,
        applicationMethod: app.application_method || 'MANUAL',
        appliedAt: app.applied_at,
      };

      partitioned.all.push(appRecord);

      const statusLower = (app.status || '').toLowerCase();
      const prepStatus = pkg?.status || app.preparation_status || '';

      if (prepStatus === 'NEEDS_USER') {
        partitioned.needs_input.push(appRecord);
      } else if (prepStatus === 'READY' && statusLower !== 'applied' && statusLower !== 'interview' && statusLower !== 'offer' && statusLower !== 'rejected') {
        partitioned.ready.push(appRecord);
      } else if (prepStatus === 'PREPARING') {
        partitioned.preparing.push(appRecord);
      } else if (statusLower === 'saved') {
        partitioned.saved.push(appRecord);
      } else if (statusLower === 'applied') {
        partitioned.applied.push(appRecord);
      } else if (statusLower === 'interview' || statusLower === 'interviewing') {
        partitioned.interviewing.push(appRecord);
      } else if (statusLower === 'offer' || statusLower === 'offered') {
        partitioned.offered.push(appRecord);
      } else if (statusLower === 'rejected') {
        partitioned.rejected.push(appRecord);
      } else {
        partitioned.saved.push(appRecord);
      }
    }

    return NextResponse.json({
      success: true,
      applications: partitioned.all,
      counts: {
        all: partitioned.all.length,
        ready: partitioned.ready.length,
        needs_input: partitioned.needs_input.length,
        preparing: partitioned.preparing.length,
        saved: partitioned.saved.length,
        applied: partitioned.applied.length,
        interviewing: partitioned.interviewing.length,
        offered: partitioned.offered.length,
        rejected: partitioned.rejected.length,
      },
      groups: partitioned,
    });
  } catch (err: any) {
    console.error('[GET /api/applications/list] Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to list applications' },
      { status: 500 }
    );
  }
}
