export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const RESERVED_USERNAMES = ['admin', 'root', 'login', 'api', 'support', 'dashboard', 'pricing', 'jobs', 'forges'];

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { username } = await req.json();

    if (!username || username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: 'Username must be 3-20 characters' }, { status: 400 });
    }

    if (!/^[a-z0-9_-]+$/.test(username)) {
      return NextResponse.json({ error: 'Only lowercase a-z, 0-9, _, - allowed' }, { status: 400 });
    }

    if (RESERVED_USERNAMES.includes(username)) {
      return NextResponse.json({ error: 'This username is reserved' }, { status: 400 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check availability
    const { data: existing } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    // Update user
    const { error } = await supabase
      .from('users')
      .update({ username })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}


