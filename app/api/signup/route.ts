import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendWelcomeEmail } from '@/lib/brevo';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = String(body.email ?? '').toLowerCase().trim();
        const password = String(body.password ?? '');
        const phone = String(body.phone_number ?? '').trim();
        const tcAccepted = body.tc_accepted === true;

        if (!email || !password) {
            return NextResponse.json({ success: false, message: 'Email and password required.' }, { status: 400 });
        }
        if (!tcAccepted) {
            return NextResponse.json({ success: false, message: 'You must accept the Terms & Conditions.' }, { status: 400 });
        }

        const supabase = createClient();

        const { data: existingUser } = await supabase
            .from('users').select('id').eq('email', email).single();

        if (existingUser) {
            return NextResponse.json({ success: false, message: 'Account with this email already exists.' }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userId = crypto.randomUUID();

        const { error: insertError } = await supabase.from('users').insert({
            id: userId,
            email,
            password_hash: passwordHash,
            phone_number: phone || null,
            provider: 'credentials',
            role: 'user',
            is_blocked: false,
            terms_accepted: tcAccepted,
            profile_completed: false,
        });

        if (insertError) {
            console.error('[Signup] DB error:', insertError);
            return NextResponse.json({ success: false, message: 'Signup failed' }, { status: 500 });
        }

        // Send welcome email (Awaited for reliability)
        await sendWelcomeEmail(email).catch(e => console.error('[Signup] Welcome email error:', e));

        return NextResponse.json({ success: true, message: 'Account created! Please log in.' });
    } catch (err: unknown) {
        console.error('Signup error:', err);
        return NextResponse.json({ success: false, message: 'Signup failed' }, { status: 500 });
    }
}
