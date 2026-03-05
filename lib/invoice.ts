import { createClient } from '@/lib/supabase/server';

export interface InvoiceInput {
    userId: string;
    plan: string;
    amount: number;               // paise (2900 = ₹29). 0 for coupon.
    currency?: string;            // 'INR' or 'USD'
    paymentMethod: 'razorpay' | 'coupon';
    couponCode?: string | null;
    razorpayPaymentId?: string | null;
    razorpayOrderId?: string | null;
    billing?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
        zip?: string;
    } | null;
}

export interface InvoiceRecord {
    id: string;
    invoice_number: string;
    user_id: string;
    plan: string;
    amount: number;
    currency: string;
    payment_method: string;
    coupon_code: string | null;
    razorpay_payment_id: string | null;
    razorpay_order_id: string | null;
    billing_name: string | null;
    billing_email: string | null;
    billing_phone: string | null;
    billing_address: string | null;
    billing_city: string | null;
    billing_state: string | null;
    billing_country: string | null;
    billing_zip: string | null;
    created_at: string;
}

/**
 * Creates a new invoice record and returns it.
 * invoice_number is generated server-side via the generate_invoice_number() SQL function.
 */
export async function createInvoice(input: InvoiceInput): Promise<InvoiceRecord | null> {
    try {
        const supabase = createClient();

        // Get next invoice number from DB function
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: numData } = await (supabase as any)
            .rpc('generate_invoice_number') as { data: string | null };

        const invoiceNumber = numData ?? `INV-${Date.now()}`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('invoices')
            .insert({
                invoice_number: invoiceNumber,
                user_id: input.userId,
                plan: input.plan,
                amount: input.amount,
                currency: input.currency || 'INR',
                payment_method: input.paymentMethod,
                coupon_code: input.couponCode ?? null,
                razorpay_payment_id: input.razorpayPaymentId ?? null,
                razorpay_order_id: input.razorpayOrderId ?? null,
                billing_name: input.billing?.name ?? null,
                billing_email: input.billing?.email ?? null,
                billing_phone: input.billing?.phone ?? null,
                billing_address: input.billing?.address ?? null,
                billing_city: input.billing?.city ?? null,
                billing_state: input.billing?.state ?? null,
                billing_country: input.billing?.country ?? null,
                billing_zip: input.billing?.zip ?? null,
            })
            .select()
            .single() as { data: InvoiceRecord | null; error: unknown };

        if (error) {
            console.error('[createInvoice] DB error:', error);
            return null;
        }
        return data;
    } catch (err) {
        console.error('[createInvoice] Unexpected error:', err);
        return null;
    }
}

/**
 * Fetches a single invoice by ID, scoped to a specific user (or unrestricted for admin).
 */
export async function getInvoiceById(invoiceId: string): Promise<InvoiceRecord | null> {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single() as { data: InvoiceRecord | null };
    return data;
}
