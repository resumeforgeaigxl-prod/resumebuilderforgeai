import { createClient } from '../lib/supabase/server';

async function check() {
    try {
        const supabase = createClient();
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error) {
            console.error('Error fetching users:', error);
        } else if (data && data.length > 0) {
            console.log('Users table columns:', Object.keys(data[0]));
            console.log('First user data sample:', data[0]);
        } else {
            console.log('No user records found to inspect.');
        }
    } catch (e: any) {
        console.error('Error executing query:', e);
    }
}

check();
