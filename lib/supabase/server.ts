import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

    // Prefer the service role key so writes bypass RLS.
    // Falls back to anon key (reads only unless RLS allows).
    const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseKey) {
        if (process.env.NODE_ENV === 'production' && !process.env.CI) {
            console.warn('[Supabase] Missing environment variables.');
        }
        return createSupabaseClient(supabaseUrl || 'http://localhost:54321', supabaseKey || 'dummy', {
            auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        });
    }

    // Do NOT use a singleton — cookies/headers change per request in Next.js
    return createSupabaseClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
        global: {
            fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' })
        }
    });
}
