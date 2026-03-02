import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = String(body.email ?? '').toLowerCase().trim();

        if (!email) {
            return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
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
            return NextResponse.json({
                success: true,
                message: 'If an account exists for this email, you will receive a reset link.'
            });
        }

        // 2. Generate reset token
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
            return NextResponse.json({ error: 'Failed to request reset. Please try again later.' }, { status: 500 });
        }

        // 4. Send email (mock)
        const origin = new URL(request.url).origin;
        const resetLink = `${origin}/reset-password?token=${resetToken}`;
        console.log(`[Forgot Password] Reset link for ${email}: ${resetLink}`);

        return NextResponse.json({
            success: true,
            message: 'Reset link generated. In a production environment, this would be sent via email.'
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
    }
}
