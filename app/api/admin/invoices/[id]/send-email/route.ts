export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';
import { sendPaymentSuccessEmail } from '@/lib/brevo';
import { format } from 'date-fns';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createClient();
        const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
        if (!adminUser || adminUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const admin = createAdminClient();
        const invoiceId = params.id;

        // Fetch invoice with user details
        const { data: invoice, error: invoiceError } = await admin
            .from('invoices')
            .select(`
                *,
                users ( email, full_name )
            `)
            .eq('id', invoiceId)
            .single();

        if (invoiceError || !invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        const userData = Array.isArray(invoice.users) ? invoice.users[0] : invoice.users;
        const userEmail = invoice.billing_email || userData?.email;
        if (!userEmail) {
            return NextResponse.json({ error: 'User email not found' }, { status: 400 });
        }

        const currencySymbol = invoice.currency === 'INR' ? '₹' : '$';
        const formattedAmount = `${currencySymbol}${(invoice.amount / 100).toFixed(invoice.currency === 'INR' ? 0 : 2)}`;

        // Attempt to fetch PDF if URL exists
        let attachmentBase64: string | undefined;
        if (invoice.invoice_url) {
            try {
                // Determine storage path from URL or re-construct it
                // Pattern: invoices/${userId}/${invoice_number}.pdf
                const storagePath = `invoices/${invoice.user_id}/${invoice.invoice_number}.pdf`;
                const { data: pdfData, error: downloadError } = await admin.storage
                    .from('invoices')
                    .download(storagePath);

                if (!downloadError && pdfData) {
                    const buffer = Buffer.from(await pdfData.arrayBuffer());
                    attachmentBase64 = buffer.toString('base64');
                }
            } catch (err) {
                console.error('[Admin Email] Failed to fetch PDF from storage:', err);
            }
        }

        // Send email
        await sendPaymentSuccessEmail({
            userEmail,
            userName: invoice.billing_name || userData?.full_name,
            plan: invoice.plan.toUpperCase(),
            amountINR: formattedAmount,
            paymentMethod: invoice.payment_method === 'razorpay' ? 'Razorpay' : (invoice.payment_method === 'paypal' ? 'PayPal' : 'Manual'),
            couponCode: invoice.coupon_code || undefined,
            invoiceNumber: invoice.invoice_number,
            invoiceId: invoice.id,
            date: format(new Date(invoice.created_at), 'dd MMM yyyy'),
            attachmentBase64,
        });

        // Log the action (optional: if you have an admin logs table)
        console.log(`[Admin Email] Manual invoice email sent for ${invoice.invoice_number} to ${userEmail}`);

        return NextResponse.json({ success: true, message: `Email sent to ${userEmail}` });

    } catch (err) {
        console.error('[Admin Email] Error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
