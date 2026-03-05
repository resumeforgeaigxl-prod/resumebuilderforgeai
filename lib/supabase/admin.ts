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
        throw new Error('Missing Supabase admin environment variables');
    }

    return createClient(url, key, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
};
