import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    const requestUrl = new URL(request.url);
    const formData = await request.formData();
    const email = String(formData.get('email') ?? '').toLowerCase().trim();
    const password = String(formData.get('password') ?? '');
    const phone = String(formData.get('phone_number') ?? '').trim();
    const tcAccepted = formData.get('tc_accepted') === 'on';

    if (!email || !password) {
        return NextResponse.redirect(`${requestUrl.origin}/signup?error=${encodeURIComponent('Email and password required.')}`);
    }

    if (!tcAccepted) {
        return NextResponse.redirect(`${requestUrl.origin}/signup?error=${encodeURIComponent('You must accept the Terms & Conditions.')}`);
    }

    const supabase = createClient();

    // 1. Check if email exists
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .single() as { data: any };

    if (existingUser) {
        return NextResponse.redirect(`${requestUrl.origin}/signup?error=${encodeURIComponent('Account with this email already exists.')}`);
    }

    // 2. Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Create UUID manually since we aren't using Supabase Auth which usually generates it
    const userId = crypto.randomUUID();

    // 4. Insert into database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await supabase.from('users').insert({
        id: userId,
        email,
        password_hash: passwordHash,
        phone_number: phone || null,
        provider: 'credentials',
        role: 'user',
        is_blocked: false,
        terms_accepted: tcAccepted,
        profile_completed: tcAccepted && !!phone, // complete only if phone + terms provided
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    if (insertError) {
        console.error('[Signup] Database insert error:', insertError);
        return NextResponse.redirect(`${requestUrl.origin}/signup?error=${encodeURIComponent('Failed to create account. Please try again.')}`);
    }

    // 5. Redirect to login.
    return NextResponse.redirect(
        `${requestUrl.origin}/login?message=${encodeURIComponent('Account created! Please log in.')}`,
        { status: 301 }
    );
}
