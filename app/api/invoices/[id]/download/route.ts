import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { getInvoiceById } from '@/lib/invoice';
import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

/**
 * GET /api/invoices/[id]/download
 * Returns an HTML invoice styled for print/PDF-save.
 * Uses content-type text/html — user prints to PDF via browser.
 * Secure: user can only access their own; admins can access all.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const supabase = createClient();
        const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
        const isAdmin = adminUser?.role === 'admin';

        const invoice = await getInvoiceById(params.id);
        if (!invoice) return new NextResponse('Invoice not found', { status: 404 });
        if (!isAdmin && invoice.user_id !== session.userId) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        const amountINR = invoice.amount > 0 ? `₹${(invoice.amount / 100).toFixed(0)}` : '₹0 (Free)';
        const dateStr = format(new Date(invoice.created_at), 'dd MMM yyyy');
        const planLabel = invoice.plan.charAt(0) + invoice.plan.slice(1).toLowerCase();

        const billingLines = [
            invoice.billing_name,
            invoice.billing_email,
            invoice.billing_phone,
            invoice.billing_address,
            [invoice.billing_city, invoice.billing_state, invoice.billing_zip].filter(Boolean).join(', '),
            invoice.billing_country,
        ].filter(Boolean);

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoice.invoice_number} — ResumeForgeAI</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #1e293b; font-size: 14px; }
    .page { max-width: 720px; margin: 0 auto; padding: 48px 40px; }
    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .brand { display: flex; flex-direction: column; gap: 2px; }
    .brand-name { font-size: 22px; font-weight: 800; color: #4f46e5; letter-spacing: -0.5px; }
    .brand-url  { font-size: 12px; color: #94a3b8; }
    .inv-meta { text-align: right; }
    .inv-meta .inv-num { font-size: 18px; font-weight: 700; color: #1e293b; }
    .inv-meta .inv-date { font-size: 12px; color: #64748b; margin-top: 4px; }
    /* Divider */
    .divider { height: 2px; background: linear-gradient(90deg, #4f46e5, #a855f7); border-radius: 2px; margin: 24px 0; }
    /* Two-col */
    .cols { display: flex; justify-content: space-between; gap: 32px; margin-bottom: 32px; }
    .col { flex: 1; }
    .col-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; }
    .col-val { line-height: 1.7; color: #334155; }
    /* Summary table */
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    thead th { padding: 10px 14px; background: #f8fafc; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #64748b; text-align: left; border-bottom: 2px solid #e2e8f0; }
    tbody td { padding: 14px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    .plan-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 700; background: #ede9fe; color: #6d28d9; }
    /* Total row */
    .total-row td { font-weight: 700; font-size: 16px; color: #1e293b; border-top: 2px solid #e2e8f0; border-bottom: none; padding-top: 18px; }
    /* Status */
    .paid-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700; background: #dcfce7; color: #16a34a; }
    .coupon-badge { background: #ede9fe; color: #6d28d9; }
    /* Footer */
    .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9; line-height: 1.8; }
    @media print {
      body { background: #fff; }
      .page { padding: 20px; }
      button { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="brand">
        <span class="brand-name">ResumeForgeAI</span>
        <span class="brand-url">resumeforgeai.in</span>
      </div>
      <div class="inv-meta">
        <div class="inv-num">${invoice.invoice_number}</div>
        <div class="inv-date">Date: ${dateStr}</div>
        <div class="inv-date" style="margin-top:6px"><span class="paid-badge ${invoice.payment_method === 'coupon' ? 'coupon-badge' : ''}">PAID</span></div>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Bill To + Payment Info -->
    <div class="cols">
      <div class="col">
        <div class="col-label">Billed To</div>
        <div class="col-val">
          ${billingLines.length > 0 ? billingLines.map(l => `<div>${l}</div>`).join('') : '<div style="color:#94a3b8">—</div>'}
        </div>
      </div>
      <div class="col">
        <div class="col-label">Payment Info</div>
        <div class="col-val">
          <div><strong>Method:</strong> ${invoice.payment_method === 'razorpay' ? 'Razorpay (Online)' : 'Coupon Code'}</div>
          ${invoice.coupon_code ? `<div><strong>Coupon:</strong> ${invoice.coupon_code}</div>` : ''}
          ${invoice.razorpay_payment_id ? `<div style="font-size:11px;color:#94a3b8;margin-top:4px">Payment ID: ${invoice.razorpay_payment_id}</div>` : ''}
        </div>
      </div>
    </div>

    <!-- Line items -->
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Description</th>
          <th style="text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="color:#94a3b8">1</td>
          <td>
            <div style="font-weight:600">${planLabel} Plan — ResumeForgeAI</div>
            <div style="font-size:12px;color:#64748b;margin-top:2px">
              ${invoice.plan === 'PRO' ? '24-hour unlimited access' : invoice.plan === 'PREMIUM' ? 'Monthly subscription (30 days)' : 'Career plan — Monthly subscription (30 days)'}
            </div>
          </td>
          <td style="text-align:right; font-weight:600">${amountINR}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="2" style="text-align:right;color:#64748b;font-size:13px;font-weight:500">Total Paid</td>
          <td style="text-align:right;color:#4f46e5;">${amountINR}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Footer -->
    <div class="footer">
      Thank you for using <strong>ResumeForgeAI</strong>.<br />
      For support, contact us at <strong>support@resumeforgeai.in</strong><br />
      <span style="font-size:11px">This is a system-generated invoice. No signature required.</span>
    </div>
  </div>

  <script>
    // Auto-trigger print dialog for PDF save
    window.onload = () => window.print();
  </script>
</body>
</html>`;

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Content-Disposition': `inline; filename="${invoice.invoice_number}.pdf"`,
            },
        });
    } catch (err) {
        console.error('[invoice-download]', err);
        return new NextResponse('Failed to generate invoice', { status: 500 });
    }
}
