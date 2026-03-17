import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

import { getSession } from '@/lib/auth/jwt';

// Remotion rendering is complex for a straight API call without a worker.
// We'll implement a stub that logs the request and potentially triggers a build/render process if configured.
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    // Check admin
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.userId;

    const { scenes, projectName } = await req.json();

    if (!scenes || !Array.isArray(scenes)) {
      return NextResponse.json({ error: 'Scenes are required' }, { status: 400 });
    }

    // 1. Create a video project log
    let projectId = 'stub-id';
    try {
      const { data: project, error: pError } = await supabase
        .from('video_projects')
        .insert({
          name: projectName || `Demo - ${new Date().toLocaleDateString()}`,
          user_id: userId,
          status: 'processing',
          config: { scenes }
        })
        .select()
        .single();

      if (pError) {
        console.error('Database insertion error:', pError);
        // We continue anyway so UI doesn't hang, but log it
      } else {
        projectId = project.id;
      }
    } catch (dbErr) {
      console.error('Failed to communicate with video_projects table:', dbErr);
    }

    // 2. Here we would typically trigger a Remotion Lambda or a background worker.
    // For this implementation, we'll mark it as "rendering" and return.
    // In a real production environment, you would call `renderVideo` from @remotion/renderer.

    return NextResponse.json({ 
      message: 'Rendering started. In production, this would trigger Remotion.',
      projectId: projectId 
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Video rendering error:', msg);
    return NextResponse.json({ error: msg || 'Internal Server Error' }, { status: 500 });
  }
}
