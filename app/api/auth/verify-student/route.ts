import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { sendVerificationOTPEmail } from '@/lib/brevo';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { email, otp, action } = await req.json();
        const supabase = createClient();

        if (action === 'send_otp') {
            if (!email || !email.includes('.')) {
                return NextResponse.json({ error: 'Invalid university email' }, { status: 400 });
            }

            // Generate 6-digit OTP
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

            // Upsert verification record
            const { error } = await supabase
                .from('user_verification')
                .upsert({
                    user_id: session.userId,
                    email,
                    otp_code: code,
                    otp_expires_at: expiresAt,
                    otp_attempts: 0
                });

            if (error) throw error;

            // Send Email
            await sendVerificationOTPEmail(email, code);

            return NextResponse.json({ success: true, message: 'OTP sent to your university email.' });
        }

        if (action === 'verify_otp') {
            if (!otp) return NextResponse.json({ error: 'OTP required' }, { status: 400 });

            const { data: verification } = await supabase
                .from('user_verification')
                .select('*')
                .eq('user_id', session.userId)
                .single();

            if (!verification) return NextResponse.json({ error: 'No verification in progress' }, { status: 400 });

            if (verification.otp_attempts >= 3) {
                return NextResponse.json({ error: 'Maximum attempts reached. Please request a new OTP.' }, { status: 400 });
            }

            if (new Date(verification.otp_expires_at) < new Date()) {
                return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
            }

            if (verification.otp_code !== otp) {
                await supabase
                    .from('user_verification')
                    .update({ otp_attempts: (verification.otp_attempts || 0) + 1 })
                    .eq('user_id', session.userId);
                
                return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
            }

            // Success
            await supabase
                .from('user_verification')
                .update({
                    is_verified: true,
                    verified_at: new Date().toISOString(),
                    otp_code: null,
                    otp_expires_at: null
                })
                .eq('user_id', session.userId);

            // Unlock Verified Badge
            const { unlockBadge } = await import('@/lib/badge-service');
            await unlockBadge(session.userId, 'Verified Student');

            return NextResponse.json({ success: true, message: 'Email verified successfully!' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Verification API] Error:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
