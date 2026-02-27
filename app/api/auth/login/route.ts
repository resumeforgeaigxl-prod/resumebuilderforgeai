import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSession, clearSession } from '@/lib/auth/jwt';
import bcrypt from 'bcrypt';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    const requestUrl = new URL(request.url);
    const formData = await request.formData();
    const email = String(formData.get('email') ?? '').toLowerCase().trim();
    const password = String(formData.get('password') ?? '');
    const supabase = createClient();

    if (!email || !password) {
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('Email and password required.')}`);
    }

    // 1. Fetch user by email
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .single() as { data: any; error: any };

    if (error || !user) {
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('Invalid login credentials.')}`);
    }

    // 2. Check if locked out
    if (user.is_blocked) {
        clearSession();
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('Your account has been suspended. Contact support.')}`);
    }

    // 3. Check password
    if (!user.password_hash) {
        // This user signed up with OAuth, not credentials
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('Please login with your social provider.')}`);
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
        return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('Invalid login credentials.')}`);
    }

    // 4. Issue JWT Session
    await createSession({
        userId: user.id,
        role: user.role ?? 'user',
        isBlocked: user.is_blocked ?? false,
        termsAccepted: user.terms_accepted ?? false,
        profileCompleted: user.profile_completed ?? false,
        provider: 'credentials'
    });

    // 5. Check if profile needs completion
    if (!user.profile_completed) {
        return NextResponse.redirect(`${requestUrl.origin}/complete-profile`, { status: 302 });
    }

    return NextResponse.redirect(`${requestUrl.origin}/dashboard`, { status: 302 });
}
