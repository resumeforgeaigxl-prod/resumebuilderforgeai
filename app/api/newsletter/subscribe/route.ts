export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendNewsletterWelcomeEmail } from '@/lib/brevo';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if the user is already subscribed in waitlist_users
    const { data: existingUser } = await supabase
      .from('waitlist_users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      // User is already on the list
      return NextResponse.json({
        success: true,
        alreadySubscribed: true,
        message: "You're already subscribed to the newsletter! We'll keep you updated."
      });
    }

    // Insert new subscriber record
    const { error: insertError } = await supabase
      .from('waitlist_users')
      .insert({
        name: email.split('@')[0],
        email: email,
        phone: 'N/A',
        college: 'Blog Newsletter',
        is_approved: true
      });

    if (insertError) {
      console.error('[Newsletter Subscribe] Database insert error:', insertError);
    }

    // Attempt to dispatch branded confirmation email via Brevo
    try {
      await sendNewsletterWelcomeEmail(email);
    } catch (emailErr) {
      console.error('[Newsletter Subscribe] Brevo email send error:', emailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing! Check your inbox for our latest issues and updates.'
    });

  } catch (error: unknown) {
    console.error('[Newsletter Subscribe] Unhandled error:', error);
    return NextResponse.json(
      { success: false, error: 'Unable to process subscription right now. Please try again later.' },
      { status: 500 }
    );
  }
}
