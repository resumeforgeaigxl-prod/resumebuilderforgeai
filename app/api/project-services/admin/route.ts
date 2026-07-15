export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

// Check if user is system admin
function isAdminUser(session: any): boolean {
  return session.role === 'admin' || session.email === 'saivarshith8284@gmail.com';
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdminUser(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const supabase = createClient();

    if (action === 'get_experts') {
      const { data: experts, error } = await supabase
        .from('project_experts')
        .select('*')
        .order('name', { ascending: true });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, experts });
    }

    // Default: GET all project requests
    const { data: requests, error } = await supabase
      .from('project_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Admin Project Services GET Error]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, requests });
  } catch (err: any) {
    console.error('[Admin Project Services GET Exception]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdminUser(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, requestId } = body;
    const supabase = createClient();

    if (!action) {
      return NextResponse.json({ error: 'Action required' }, { status: 400 });
    }

    // Action 1: Add new project expert
    if (action === 'add_expert') {
      const { name, email, specialization } = body;
      if (!name || !email) {
        return NextResponse.json({ error: 'Name and Email are required for expert creation' }, { status: 400 });
      }

      const { data: expert, error } = await supabase
        .from('project_experts')
        .insert({ name, email, specialization })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, expert });
    }

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    // Action 2: Update status and add timeline event
    if (action === 'update_status') {
      const { status, title, description } = body;
      if (!status) return NextResponse.json({ error: 'Status is required' }, { status: 400 });

      // Update project request status
      const { data: updatedReq, error: reqErr } = await supabase
        .from('project_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single();

      if (reqErr) return NextResponse.json({ error: reqErr.message }, { status: 500 });

      // Insert timeline event
      await supabase.from('project_timeline').insert({
        request_id: requestId,
        title: title || `Status Updated: ${status}`,
        description: description || `Project status updated to ${status} by system administrator.`,
        status: status
      });

      return NextResponse.json({ success: true, request: updatedReq });
    }

    // Action 3: Assign expert
    if (action === 'assign_expert') {
      const { expertId } = body;
      const { data: updatedReq, error } = await supabase
        .from('project_requests')
        .update({ expert_id: expertId || null, updated_at: new Date().toISOString() })
        .eq('id', requestId)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // If expert assigned, add to timeline
      if (expertId) {
        const { data: expert } = await supabase.from('project_experts').select('name').eq('id', expertId).single();
        await supabase.from('project_timeline').insert({
          request_id: requestId,
          title: 'Expert Assigned',
          description: `Project has been assigned to expert developer: ${expert?.name || 'Assigned Expert'}.`,
          status: updatedReq.status
        });
      }

      return NextResponse.json({ success: true, request: updatedReq });
    }

    // Action 4: Create Invoice
    if (action === 'create_invoice') {
      const { amount, due_date, payment_link } = body;
      if (!amount) return NextResponse.json({ error: 'Amount is required' }, { status: 400 });

      const invoiceNum = `INV-PRJ-${Math.floor(100000 + Math.random() * 900000)}`;

      const { data: invoice, error } = await supabase
        .from('project_invoices')
        .insert({
          request_id: requestId,
          invoice_number: invoiceNum,
          amount,
          due_date: due_date || null,
          payment_link: payment_link || null,
          status: 'unpaid'
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Add to timeline
      await supabase.from('project_timeline').insert({
        request_id: requestId,
        title: 'Invoice Issued',
        description: `An invoice (${invoiceNum}) for ₹${amount} has been issued by admin.`,
        status: 'Pending'
      });

      return NextResponse.json({ success: true, invoice });
    }

    // Action 5: Upload Deliverable
    if (action === 'upload_deliverable') {
      const { title, description, file_url, file_name, version } = body;
      if (!title || !file_url || !file_name) {
        return NextResponse.json({ error: 'Missing required deliverable fields' }, { status: 400 });
      }

      const { data: deliverable, error } = await supabase
        .from('project_deliverables')
        .insert({
          request_id: requestId,
          title,
          description: description || null,
          file_url,
          file_name,
          version: version || '1.0',
          uploaded_by: session.userId
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // Add to timeline
      await supabase.from('project_timeline').insert({
        request_id: requestId,
        title: `Deliverable Uploaded: ${title}`,
        description: `New project deliverables (${file_name}) have been uploaded under version ${version || '1.0'}.`,
        status: 'In Progress'
      });

      return NextResponse.json({ success: true, deliverable });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error('[Admin Project Services POST Exception]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
