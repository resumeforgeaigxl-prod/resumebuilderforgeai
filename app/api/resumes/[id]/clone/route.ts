import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resumeId = params.id;
        const body = await req.json();
        const { version_name } = body;

        const supabase = createClient();

        // 1. Fetch original resume
        const { data: original, error: fetchError } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', resumeId)
            .eq('user_id', session.userId)
            .single();

        if (fetchError || !original) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // 2. Prepare new resume data
        const rest = Object.fromEntries(
            Object.entries(original).filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key))
        );
        const newResume = {
            ...rest,
            title: `${original.title} (${version_name || 'New Version'})`,
            version_name: version_name || 'New Version',
            parent_resume_id: original.id,
            user_id: session.userId
        };

        // 3. Insert new resume
        const { data: cloned, error: cloneError } = await supabase
            .from('resumes')
            .insert(newResume)
            .select()
            .single();

        if (cloneError) {
            console.error('[Clone API] Error:', cloneError);
            return NextResponse.json({ error: 'Failed to clone resume' }, { status: 500 });
        }

        return NextResponse.json({ success: true, resume: cloned });

    } catch (err) {
        console.error('[Clone API] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
