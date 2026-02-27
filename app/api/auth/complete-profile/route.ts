import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession, createSession } from '@/lib/auth/jwt';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    const url = new URL(request.url);

    try {
        const formData = await request.formData();
        const phone = String(formData.get('phone_number') ?? '').trim();
        const tcAccepted = formData.get('tc_accepted') === 'on';

        if (!phone) {
            return NextResponse.redirect(`${url.origin}/complete-profile?error=PhoneRequired`, { status: 302 });
        }
        if (!tcAccepted) {
            return NextResponse.redirect(`${url.origin}/complete-profile?error=TermsRequired`, { status: 302 });
        }

        // Read JWT session from cookie
        const session = await getSession();
        if (!session || !session.userId) {
            console.error('[CompleteProfile] No valid session found');
            return NextResponse.redirect(`${url.origin}/login`, { status: 302 });
        }

        console.log('[CompleteProfile] Updating user:', session.userId);

        const supabase = createClient();

        // Update user record
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any)
            .from('users')
            .update({
                phone_number: phone,
                terms_accepted: true,
                profile_completed: true,
            })
            .eq('id', session.userId)
            .select()
            .single();

        if (error) {
            console.error('[CompleteProfile] DB Update Error:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                userId: session.userId,
            });
            return NextResponse.redirect(`${url.origin}/complete-profile?error=SaveFailed`, { status: 302 });
        }

        console.log('[CompleteProfile] User updated successfully:', data?.id);

        // Reissue JWT with updated claims
        await createSession({
            ...session,
            termsAccepted: true,
            profileCompleted: true,
        });

        return NextResponse.redirect(`${url.origin}/dashboard`, { status: 302 });

    } catch (e) {
        console.error('[CompleteProfile] Unexpected Error:', e);
        return NextResponse.redirect(`${url.origin}/complete-profile?error=ServerError`, { status: 302 });
    }
}
