import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client using the SERVICE_ROLE_KEY.
 * Use this only in server-side code (API routes, Server Actions, Server Components)
 * to bypass Row Level Security (RLS).
 * 
 * IMPORTANT: NEVER use this on the client-side.
 */
export const createAdminClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        if (process.env.NODE_ENV === 'production' && !process.env.CI) {
            console.warn('[Supabase Admin] Missing environment variables. This might cause runtime errors.');
        }
        // Return a dummy client or null to prevent crash during build
        return createClient(url || 'http://localhost:54321', key || 'dummy', {
            auth: { autoRefreshToken: false, persistSession: false }
        });
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        },
        global: {
            fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' })
        }
    });
};
