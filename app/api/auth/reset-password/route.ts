import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
    const requestUrl = new URL(request.url);
    const formData = await request.formData();
    const token = String(formData.get('token') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const confirmPassword = String(formData.get('confirm_password') ?? '');

    if (!token) {
        return NextResponse.redirect(`${requestUrl.origin}/reset-password?error=${encodeURIComponent('Invalid reset link.')}`);
    }

    if (!password || !confirmPassword) {
        return NextResponse.redirect(`${requestUrl.origin}/reset-password?token=${token}&error=${encodeURIComponent('Passwords are required.')}`);
    }

    if (password !== confirmPassword) {
        return NextResponse.redirect(`${requestUrl.origin}/reset-password?token=${token}&error=${encodeURIComponent('Passwords do not match.')}`);
    }

    const supabase = createClient();

    // 1. Check if token exists and is valid (not expired)
    const now = new Date().toISOString();
    const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('id, email')
        .eq('reset_token', token)
        .gt('reset_token_expires_at', now)
        .single();

    if (fetchError || !user) {
        return NextResponse.redirect(`${requestUrl.origin}/forgot-password?error=${encodeURIComponent('Your reset link has expired or is invalid.')}`);
    }

    // 2. Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Update DB and clear tokens
    const { error: updateError } = await supabase
        .from('users')
        .update({
            password_hash: passwordHash,
            reset_token: null,
            reset_token_expires_at: null,
        })
        .eq('id', user.id);

    if (updateError) {
        console.error('[Reset Password] DB Update Error:', updateError);
        return NextResponse.redirect(`${requestUrl.origin}/reset-password?token=${token}&error=${encodeURIComponent('Failed to update password. Please try again.')}`);
    }

    // 4. Success! Redirect to login
    return NextResponse.redirect(`${requestUrl.origin}/login?message=${encodeURIComponent('Your password has been successfully updated. Please log in.')}`);
}
