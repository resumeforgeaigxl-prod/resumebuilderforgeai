import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { sendWaitlistApprovalEmail } from '@/lib/brevo';

export async function POST(request: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { userId, customCoupon } = await request.json();
        if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

        const supabase = createClient();
        
        // Check if admin
        const { data: adminUser } = await supabase.from('users').select('role').eq('id', session.userId).single();
        if (adminUser?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get waitlist user
        const { data: wlUser, error: fetchError } = await supabase
            .from('waitlist_users')
            .select('*')
            .eq('id', userId)
            .single();

        if (fetchError || !wlUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Determine coupon
        let couponCode = customCoupon;
        let offerLabel = 'Exclusive Launch Discount';

        if (!couponCode) {
            const isFirst100 = wlUser.position <= 100;
            couponCode = isFirst100 ? 'FREE100' : 'HALF50';
            offerLabel = isFirst100 ? '₹499 Plan FREE (2 Months)' : 'Flat 50% Early Bird Discount';
        } else {
            // If custom coupon is provided, we use it. We could fetch label from DB here if needed.
            offerLabel = 'Your Custom Early Access Reward';
        }

        // Send Email
        const emailSent = await sendWaitlistApprovalEmail(
            wlUser.email,
            wlUser.name,
            couponCode,
            offerLabel
        );

        if (!emailSent) {
            // Log it but still update DB if requested, or return error
            // The user said "email send fail", so let's return error but provide info
            return NextResponse.json({ 
                success: false, 
                error: 'Failed to send email via Brevo. Please check API Key or recipient email.',
                couponCode // Return code so admin can manually copy if they want
            }, { status: 500 });
        }

        // Update DB
        const { error: updateError } = await supabase
            .from('waitlist_users')
            .update({
                is_approved: true,
                coupon_sent: true,
                coupon_code: couponCode
            })
            .eq('id', userId);

        if (updateError) {
            console.error('[Waitlist Approve] DB Update Error:', updateError);
        }

        return NextResponse.json({ success: true, couponCode });

    } catch (error) {
        console.error('[Admin Waitlist Approve API] POST Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
