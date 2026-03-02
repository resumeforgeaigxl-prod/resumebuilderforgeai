import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession, createSession } from '@/lib/auth/jwt';

export const runtime = 'nodejs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const phone = String(body.phone_number ?? '').trim();
        const tcAccepted = body.tc_accepted === true;

        if (!phone) {
            return NextResponse.json({ error: 'Please enter your phone number.' }, { status: 400 });
        }
        if (!tcAccepted) {
            return NextResponse.json({ error: 'You must accept the Terms & Conditions to continue.' }, { status: 400 });
        }

        // Read JWT session from cookie
        const session = await getSession();
        if (!session || !session.userId) {
            return NextResponse.json({ error: 'No valid session found. Please log in again.' }, { status: 401 });
        }

        const supabase = createClient();

        // Update user record
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
            .from('users')
            .update({
                phone_number: phone,
                terms_accepted: true,
                profile_completed: true,
            })
            .eq('id', session.userId);

        if (error) {
            console.error('[CompleteProfile] DB Update Error:', error);
            return NextResponse.json({ error: 'Failed to save your profile. Please try again.' }, { status: 500 });
        }

        // Reissue JWT with updated claims
        await createSession({
            ...session,
            termsAccepted: true,
            profileCompleted: true,
        });

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error('[CompleteProfile] Unexpected Error:', err);
        return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
    }
}
