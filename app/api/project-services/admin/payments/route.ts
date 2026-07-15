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

    let query = supabase.from('project_payments').select('*, project_requests(project_id, project_title, full_name)');
    if (requestId) {
      query = query.eq('request_id', requestId);
    }

    const { data: payments, error } = await query.order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, payments });
  } catch (err: any) {
    console.error('[Payments API GET Exception]', err);
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
    const { id, requestId, invoiceId, transactionId, razorpayOrderId, razorpayPaymentId, amount, status, paymentMethod, paymentDate } = body;

    if (!requestId || amount === undefined) {
      return NextResponse.json({ error: 'Request ID and Amount are required' }, { status: 400 });
    }

    const supabase = createClient();

    let paymentRecord;
    if (id) {
      // Update
      const { data, error } = await supabase
        .from('project_payments')
        .update({
          status: status || 'Pending',
          transaction_id: transactionId || null,
          razorpay_payment_id: razorpayPaymentId || null,
          payment_method: paymentMethod || null,
          payment_date: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      paymentRecord = data;
    } else {
      // Insert
      const transId = transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      const { data, error } = await supabase
        .from('project_payments')
        .insert({
          request_id: requestId,
          invoice_id: invoiceId || null,
          transaction_id: transId,
          razorpay_order_id: razorpayOrderId || null,
          razorpay_payment_id: razorpayPaymentId || null,
          amount,
          status: status || 'Pending',
          payment_method: paymentMethod || 'Manual Bank Transfer',
          payment_date: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString()
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      paymentRecord = data;
    }

    // If marked Paid, automatically update invoice and project status
    if (status === 'Paid') {
      if (invoiceId) {
        await supabase.from('project_invoices').update({ status: 'paid', paid_date: new Date().toISOString().split('T')[0] }).eq('id', invoiceId);
      }
      
      await supabase.from('project_requests').update({ status: 'In Progress' }).eq('id', requestId);
      
      await supabase.from('project_timeline').insert({
        request_id: requestId,
        title: 'Payment Received',
        description: `Payment of ₹${amount} received via ${paymentMethod || 'Manual'}. Reference ID: ${paymentRecord.transaction_id}. Development started.`,
        status: 'In Progress'
      });
    }

    return NextResponse.json({ success: true, payment: paymentRecord });
  } catch (err: any) {
    console.error('[Payments API POST Exception]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
