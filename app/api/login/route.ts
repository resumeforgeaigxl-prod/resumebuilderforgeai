export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSession } from '@/lib/auth/jwt';
import bcrypt from 'bcrypt';
import { sendLoginEmail } from '@/lib/brevo';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = String(body.email ?? '').toLowerCase().trim();
        const password = String(body.password ?? '');
        const supabase = createClient();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required.' }, { status: 400 });
        }

        // 1. Fetch user by email
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .single() as { data: any; error: any };

        if (error || !user) {
            return NextResponse.json({ error: 'Invalid login credentials.' }, { status: 401 });
        }

        // 2. Check if locked out
        if (user.is_blocked) {
            return NextResponse.json({ error: 'Your account has been suspended. Contact support.' }, { status: 403 });
        }

        // 3. Check password
        if (!user.password_hash) {
            // This user signed up with OAuth, not credentials
            return NextResponse.json({ error: 'Please login with your social provider.' }, { status: 400 });
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return NextResponse.json({ error: 'Invalid login credentials.' }, { status: 401 });
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

        // 5. Send login notification email (Awaited to ensure it doesn't get cut off)
        await sendLoginEmail(user.email, user.full_name || undefined)
            .catch(e => console.error('[Login] Email error:', e));

        // 6. Return JSON success
        return NextResponse.json({
            success: true,
            profileCompleted: user.profile_completed
        });
    } catch (err) {
        console.error('Login error:', err);
        return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
    }
}



