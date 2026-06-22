import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;
    console.log(`[API] Fetching resume by ID: ${id}`);

    if (!id || id === 'undefined' || id === 'null') {
        console.error('[API] Invalid resume ID provided:', id);
        return NextResponse.json({ error: 'Invalid resume ID' }, { status: 400 });
    }

    try {
        const supabase = createClient();
        const session = await getSession();

        if (!session) {
            console.error('[API] Unauthorized access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: resume, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('[API] Supabase error fetching resume:', error);
            return NextResponse.json({ error: 'Resume not found', details: error.message }, { status: 404 });
        }

        if (!resume) {
            console.error('[API] No resume found for ID:', id);
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Temporary permission check fix (as requested)
        // In a real app, we should check if resume.user_id === session.userId
        console.log(`[API] Resume found: ${resume.title} (Owner: ${resume.user_id}, Current User: ${session.userId})`);
        
        // Log the response for debugging (point 5)
        // console.log('[API] Response data:', JSON.stringify(resume).slice(0, 200) + '...');

        return NextResponse.json({ success: true, data: resume });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('[API] Fatal error in resume fetch:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;
    if (!id || id === 'undefined' || id === 'null') {
        return NextResponse.json({ error: 'Invalid resume ID' }, { status: 400 });
    }

    try {
        const supabase = createClient();
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const updatePayload: any = {};

        if (body.resumeData !== undefined) updatePayload.resume_json = body.resumeData;
        if (body.title !== undefined) updatePayload.title = body.title;
        if (body.templateSelected !== undefined) updatePayload.template_selected = body.templateSelected;

        updatePayload.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('resumes')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[API Update] Supabase error:', error);
            return NextResponse.json({ error: 'Failed to update resume', details: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err: unknown) {
        const error = err as Error;
        console.error('[API Update] Fatal error:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}

