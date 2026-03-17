const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
    const { count: companies } = await supabase.from('target_companies').select('*', { count: 'exact', head: true });
    const { count: roles } = await supabase.from('target_roles').select('*', { count: 'exact', head: true });
    
    console.log('--- COMPONENT STATUS ---');
    console.log('Target Companies:', companies || 0);
    console.log('Target Roles:', roles || 0);
    console.log('--- ENV CHECK ---');
    console.log('RAPIDAPI_KEY:', !!process.env.RAPIDAPI_KEY);
    console.log('ADZUNA_API_KEY:', !!process.env.ADZUNA_API_KEY);
    console.log('APIFY_API_TOKEN:', !!process.env.APIFY_API_TOKEN);
    console.log('SERPER_API_KEY:', !!process.env.SERPER_API_KEY);
}

check();
