const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'jobs' });
    if (error) {
        // If RPC doesn't exist, try a simple select
        console.log('RPC failed, trying select * limit 0');
        const { data: cols, error: err } = await supabase.from('jobs').select('*').limit(1);
        if (err) {
            console.error('Error fetching jobs:', err);
            return;
        }
        if (cols && cols.length > 0) {
            console.log('Columns found:', Object.keys(cols[0]));
        } else {
            // Table might be empty, try to get info from information_schema if allowed
            const { data: info, error: infoErr } = await supabase.from('jobs').select('*').limit(0);
            if (infoErr) console.error(infoErr);
            console.log('Table exists but empty or select * limit 0 failed to show keys.');
        }
    } else {
        console.log('Columns:', data);
    }
}

checkSchema();
