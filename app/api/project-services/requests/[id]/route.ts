export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();

    // Fetch project request
    const { data: projectRequest, error } = await supabase
      .from('project_requests')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !projectRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Access control: must be owner or admin
    const isAdmin = session.role === 'admin';
    const isOwner = projectRequest.user_id === session.userId;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch related records
    const [filesRes, timelineRes, messagesRes, deliverablesRes, invoicesRes] = await Promise.all([
      supabase.from('project_files').select('*').eq('request_id', params.id),
      supabase.from('project_timeline').select('*').eq('request_id', params.id).order('created_at', { ascending: true }),
      supabase.from('project_messages').select('*').eq('request_id', params.id).order('created_at', { ascending: true }),
      supabase.from('project_deliverables').select('*').eq('request_id', params.id).order('created_at', { ascending: true }),
      supabase.from('project_invoices').select('*').eq('request_id', params.id).order('created_at', { ascending: true })
    ]);

    return NextResponse.json({
      success: true,
      request: projectRequest,
      files: filesRes.data || [],
      timeline: timelineRes.data || [],
      messages: messagesRes.data || [],
      deliverables: deliverablesRes.data || [],
      invoices: invoicesRes.data || []
    });
  } catch (err: any) {
    console.error('[Project Details API GET Exception]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    const body = await request.json();

    // Fetch original request to check ownership
    const { data: projectRequest, error: fetchErr } = await supabase
      .from('project_requests')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (fetchErr || !projectRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const isAdmin = session.role === 'admin';
    const isOwner = projectRequest.user_id === session.userId;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build update object
    const updates: any = { updated_at: new Date().toISOString() };

    // Owners can update personal/project details if status is pending
    const fieldsAllowed = [
      'full_name',
      'email',
      'phone',
      'whatsapp',
      'college',
      'university',
      'branch',
      'year',
      'semester',
      'project_title',
      'project_description',
      'existing_abstract',
      'requirements',
      'additional_requirements',
      'tech_frontend',
      'tech_backend',
      'tech_database',
      'tech_language',
      'tech_ai_framework',
      'tech_hosting',
      'submission_date',
      'urgency',
      'budget_range',
      'project_mode',
      'team_size'
    ];

    for (const f of fieldsAllowed) {
      if (body[f] !== undefined) {
        updates[f] = body[f];
      }
    }

    // Perform update
    const { data: updatedRequest, error: updateErr } = await supabase
      .from('project_requests')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();

    if (updateErr) {
      console.error('[Project Details API PATCH Error]', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, request: updatedRequest });
  } catch (err: any) {
    console.error('[Project Details API PATCH Exception]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
