export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';

export async function GET(
    req: Request,
    { params }: { params: { projectId: string } }
) {
    const supabase = createClient();
    const session = await getSession();

    if (!session || !session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    const { data: project, error } = await supabase
        .from('project_outputs')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', session.userId)
        .single();

    if (error || !project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
}


