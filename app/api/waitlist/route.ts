import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, college } = body;

        if (!name || !email || !phone || !college) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = createClient();

        // Check if already exists
        const { data: existing } = await supabase
            .from('waitlist_users')
            .select('id')
            .eq('email', email)
            .single();

        if (existing) {
            return NextResponse.json({ success: false, error: 'You are already on the waitlist!' }, { status: 400 });
        }

        // Insert user
        const { error } = await supabase
            .from('waitlist_users')
            .insert({
                name,
                email,
                phone,
                college
            });

        if (error) {
            console.error('[Waitlist API] Insert error:', error);
            return NextResponse.json({ success: false, error: 'Failed to join waitlist. Please try again later.' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Waitlist API] Internal Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
