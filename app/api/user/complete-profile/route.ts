export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession, createSession } from '@/lib/auth/jwt';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { fullName, college, skills, experience, phone, referralSource } = body;

        const supabase = createClient();

        // Update the user profile
        const { error: updateError } = await supabase
            .from('users')
            .update({
                full_name: fullName,
                phone_number: phone,
                college: college, 
                skills: Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim()).filter(Boolean),
                experience_level: experience,
                referral_source: referralSource,
                profile_completed: true,
                terms_accepted: true,
                terms_accepted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', session.userId);

        if (updateError) {
            console.error('[CompleteProfile] DB error:', updateError);
            // Some columns might be missing, so we'll try a fallback to only existing ones if it fails
            // But for now let's assume columns exist or will be added.
            return NextResponse.json({ success: false, message: 'Failed to update profile data.' }, { status: 500 });
        }

        // 2. Refresh the JWT Session and Cookie
        await createSession({
            ...session,
            profileCompleted: true,
            termsAccepted: true
        });

        return NextResponse.json({ 
            success: true, 
            message: 'Profile completed successfully!' 
        });

    } catch (err: unknown) {
        console.error('CompleteProfile error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Something went wrong.';
        return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
    }
}



