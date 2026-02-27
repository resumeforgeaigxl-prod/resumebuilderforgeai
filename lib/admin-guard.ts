import { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';

/** Fetches the current user's DB profile. Returns null if unauthenticated. */
export async function getProfile(supabase: SupabaseClient) {
    const session = await getSession();
    if (!session) return null;

    const { data } = await supabase
        .from('users')
        .select('id, role, is_blocked, phone_number, terms_accepted')
        .eq('id', session.userId)
        .single();

    return data ?? null;
}

/**
 * Ensure the caller is an admin based on DB truth.
 * Returns a 403 NextResponse if not — caller must return it immediately.
 * Returns null if authorised.
 */
export async function requireAdmin(supabase: SupabaseClient): Promise<NextResponse | null> {
    const profile = await getProfile(supabase);
    if (!profile) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (profile.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 });
    }
    return null;
}

/**
 * Ensure the current user is not blocked.
 * Returns a 403 NextResponse if blocked — caller must return it immediately.
 */
export async function requireNotBlocked(supabase: SupabaseClient): Promise<NextResponse | null> {
    const profile = await getProfile(supabase);
    if (profile?.is_blocked) {
        return NextResponse.json({ error: 'Your account has been suspended.' }, { status: 403 });
    }
    return null;
}

/** Write an entry to admin_logs */
export async function logAdminAction(
    supabase: SupabaseClient,
    adminId: string,
    action: string,
    targetId?: string,
    metadata?: Record<string, unknown>
) {
    await supabase.from('admin_logs').insert({
        admin_id: adminId,
        action,
        target_id: targetId ?? null,
        metadata: metadata ?? {},
    });
}
