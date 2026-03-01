import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(request: Request) {
    const requestUrl = new URL(request.url);
    const formData = await request.formData();
    const email = String(formData.get('email') ?? '').toLowerCase().trim();

    if (!email) {
        return NextResponse.redirect(`${requestUrl.origin}/forgot-password?error=${encodeURIComponent('Email is required.')}`);
    }

    const supabase = createClient();

    // 1. Check if user exists
    const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

    if (fetchError || !user) {
        // SECURITY: Don't leak whether account exists or not.
        return NextResponse.redirect(`${requestUrl.origin}/forgot-password?message=${encodeURIComponent('If an account exists for this email, you will receive a reset link.')}`);
    }

    // 2. Generate reset token (use crypto for security)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

    // 3. Save token in DB
    const { error: updateError } = await supabase
        .from('users')
        .update({
            reset_token: resetToken,
            reset_token_expires_at: resetExpiry
        })
        .eq('id', user.id);

    if (updateError) {
        console.error('[Forgot Password] DB update error:', updateError);
        return NextResponse.redirect(`${requestUrl.origin}/forgot-password?error=${encodeURIComponent('Failed to request reset. Please try again later.')}`);
    }

    // 4. Send email (mock for now as no email service is configured)
    const resetLink = `${requestUrl.origin}/reset-password?token=${resetToken}`;
    console.log(`[Forgot Password] Reset link for ${email}: ${resetLink}`);

    // If there were an email service:
    // await sendEmail(email, 'Reset your password', `Click here to reset: ${resetLink}`);

    return NextResponse.redirect(`${requestUrl.origin}/forgot-password?message=${encodeURIComponent('Reset link generated. In a production environment, this would be sent via email.')}`);
}
