
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const getEnv = (key) => env.split('\n').find(l => l.startsWith(key + '=')).split('=')[1].trim().replace(/['\u0022]/g, '');

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

const admin = createClient(supabaseUrl, supabaseKey);

async function testLog() {
    const { data: user } = await admin.from('users').select('id').limit(1).single();

    if (!user) {
        console.error('No user found to test with');
        return;
    }

    console.log('Logging for user:', user.id);

    const { error } = await admin.from('pdf_downloads').insert({
        user_id: user.id,
        resume_name: 'TEST RESUME',
        template: 'test-template',
        watermarked: false
    });

    if (error) {
        console.error('Log failed:', error);
    } else {
        console.log('Log success!');
    }
}

testLog();
