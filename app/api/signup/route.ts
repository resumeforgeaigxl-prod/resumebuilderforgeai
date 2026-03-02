import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = String(body.email ?? '').toLowerCase().trim();
        const password = String(body.password ?? '');
        const phone = String(body.phone_number ?? '').trim();
        const tcAccepted = body.tc_accepted === true;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });
        }

        if (!tcAccepted) {
            return NextResponse.json({ error: 'You must accept the Terms & Conditions.' }, { status: 400 });
        }

        const supabase = createClient();

        // 1. Check if email exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json({ error: 'Account with this email already exists.' }, { status: 400 });
        }

        // 2. Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3. Create UUID manually
        const userId = crypto.randomUUID();

        // 4. Insert into database
        const { error: insertError } = await supabase.from('users').insert({
            id: userId,
            email,
            password_hash: passwordHash,
            phone_number: phone || null,
            provider: 'credentials',
            role: 'user',
            is_blocked: false,
            terms_accepted: tcAccepted,
            profile_completed: false, // Force them to complete profile after login
        });

        if (insertError) {
            console.error('[Signup] Database insert error:', insertError);
            return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Account created! Please log in.'
        });
    } catch (err) {
        console.error('Signup error:', err);
        return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
    }
}
