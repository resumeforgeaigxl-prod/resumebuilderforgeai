import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    
    const { data: projects, error } = await supabase
      .from('video_projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching video projects:', error);
      return NextResponse.json([], { status: 200 }); // Return empty array on error to prevent UI crash
    }

    return NextResponse.json(projects || []);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Fetch video projects error:', msg);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
