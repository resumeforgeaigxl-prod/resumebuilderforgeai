export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const token = String(body.token ?? '').trim();
        const password = String(body.password ?? '');
        const confirmPassword = String(body.confirm_password ?? '');

        if (!token) {
            return NextResponse.json({ error: 'Invalid reset link.' }, { status: 400 });
        }

        if (!password || !confirmPassword) {
            return NextResponse.json({ error: 'Passwords are required.' }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: 'Passwords do not match.' }, { status: 400 });
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
            return NextResponse.json({ error: 'Your reset link has expired or is invalid.' }, { status: 400 });
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
            return NextResponse.json({ error: 'Failed to update password. Please try again.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Your password has been successfully updated. Please log in.'
        });
    } catch (err) {
        console.error('Reset password error:', err);
        return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
    }
}



