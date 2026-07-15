export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { createClient } from '@/lib/supabase/server';

function isAdminUser(session: any): boolean {
  return session?.role === 'admin' || session?.email === 'saivarshith8284@gmail.com';
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isAdminUser(session)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    const supabase = createClient();

    let query = supabase.from('project_quotations').select('*, project_requests(project_id, project_title)');
    if (requestId) {
      query = query.eq('request_id', requestId);
    }

    const { data: quotations, error } = await query.order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, quotations });
  } catch (err: any) {
    console.error('[Quotations API GET Exception]', err);
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
    const { id, requestId, basePrice, discount, additionalCharges, tax, finalAmount, currency, dueDate, status, notes } = body;

    if (!requestId || basePrice === undefined) {
      return NextResponse.json({ error: 'Request ID and Base Price are required' }, { status: 400 });
    }

    const supabase = createClient();

    let quotationRecord;
    if (id) {
      // Update
      const { data, error } = await supabase
        .from('project_quotations')
        .update({
          base_price: basePrice,
          discount: discount || 0,
          additional_charges: additionalCharges || 0,
          tax: tax || 0,
          final_amount: finalAmount || basePrice,
          currency: currency || 'INR',
          due_date: dueDate || null,
          status: status || 'Draft',
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      quotationRecord = data;
    } else {
      // Insert
      const quoteNum = `QTN-PRJ-${Math.floor(100000 + Math.random() * 900000)}`;
      const { data, error } = await supabase
        .from('project_quotations')
        .insert({
          quotation_number: quoteNum,
          request_id: requestId,
          base_price: basePrice,
          discount: discount || 0,
          additional_charges: additionalCharges || 0,
          tax: tax || 0,
          final_amount: finalAmount || basePrice,
          currency: currency || 'INR',
          due_date: dueDate || null,
          status: status || 'Draft',
          notes: notes || null
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      quotationRecord = data;
    }

    // Add timeline entries based on status changes
    if (status === 'Sent') {
      await supabase.from('project_timeline').insert({
        request_id: requestId,
        title: 'Quotation Sent',
        description: `Project quotation (${quotationRecord.quotation_number}) for ₹${quotationRecord.final_amount} has been issued and emailed.`,
        status: 'Under Review'
      });
      await supabase.from('project_requests').update({ status: 'Under Review' }).eq('id', requestId);
    } else if (status === 'Approved') {
      await supabase.from('project_timeline').insert({
        request_id: requestId,
        title: 'Quotation Accepted',
        description: `Student accepted quotation (${quotationRecord.quotation_number}). Transitioning to invoicing.`,
        status: 'Awaiting Payment'
      });
      await supabase.from('project_requests').update({ status: 'Awaiting Payment' }).eq('id', requestId);

      // Automatically generate invoice
      const invoiceNum = `INV-PRJ-${Math.floor(100000 + Math.random() * 900000)}`;
      await supabase.from('project_invoices').insert({
        request_id: requestId,
        invoice_number: invoiceNum,
        amount: quotationRecord.final_amount,
        status: 'unpaid',
        due_date: quotationRecord.due_date || null
      });
    }

    return NextResponse.json({ success: true, quotation: quotationRecord });
  } catch (err: any) {
    console.error('[Quotations API POST Exception]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
