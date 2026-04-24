export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { getInvoiceById } from '@/lib/invoice';
import { generateInvoiceHtml } from '@/lib/invoice-template';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/invoices/[id]/download
 * Returns an HTML invoice styled to match the pixel-accurate reference image.
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

    // --- Fetch Original Price and Discount for Summary ---
    // Rule: Fetch from payment or order record
    let originalPricePaise = invoice.amount;
    let discountAmountPaise = 0;

    if (invoice.razorpay_payment_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: payment } = await (supabase as any)
        .from('payments')
        .select('original_price, discount_amount')
        .eq('razorpay_payment_id', invoice.razorpay_payment_id)
        .single();
      if (payment) {
        originalPricePaise = payment.original_price;
        discountAmountPaise = payment.discount_amount;
      }
    } else if (invoice.razorpay_order_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: order } = await (supabase as any)
        .from('orders')
        .select('original_price, discount_amount')
        .eq('razorpay_order_id', invoice.razorpay_order_id)
        .single();
      if (order) {
        originalPricePaise = order.original_price;
        discountAmountPaise = order.discount_amount;
      }
    }

    // Final check for coupon discount if not found above
    if (discountAmountPaise === 0 && invoice.coupon_code && invoice.amount === 0) {
      // Likely a 100% off coupon, use plan prices
      const planPrices: Record<string, number> = { 'PRO': 2900, 'PREMIUM': 19900, 'CAREER': 49900 };
      originalPricePaise = planPrices[invoice.plan.toUpperCase()] || 0;
      discountAmountPaise = originalPricePaise;
    }

    // --- Formatting ---
    const html = await generateInvoiceHtml(invoice, originalPricePaise, discountAmountPaise);

    return new NextResponse(html + `
  <script>
    if (window.location.search.includes('print=true')) {
        window.onload = () => window.print();
    }
  </script>
</body>
</html>`, {
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
