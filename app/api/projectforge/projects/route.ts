export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
    req: Request,
    { params }: { params: { projectId: string } }
) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: project, error } = await supabase
        .from('project_outputs')
        .select('*')
        .eq('id', params.projectId)
        .eq('user_id', user.id)
        .single();

    if (error || !project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
}


