export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const supabase = createClient();

    // Verify ownership or admin role
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

    const senderRole = isAdmin ? 'admin' : 'student';

    // Insert message
    const { data: msgRecord, error: insertErr } = await supabase
      .from('project_messages')
      .insert({
        request_id: params.id,
        sender_id: session.userId,
        sender_role: senderRole,
        message: message.trim()
      })
      .select()
      .single();

    if (insertErr) {
      console.error('[Project Messages API Error]', insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: msgRecord });
  } catch (err: any) {
    console.error('[Project Messages API Exception]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
