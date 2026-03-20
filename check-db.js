const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dobrcuiohslvoiklmevq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYnJjdWlvaHNsdm9pa2xtZXZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNzM0NDAsImV4cCI6MjA4Nzc0OTQ0MH0.riCAzxMZPC2ze6lARG-e7CpN9ygniVAfJIyB_oZBVkw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('---START---');
    const { data: q } = await supabase.from('coding_questions').select('slug').limit(1);
    console.log('Q:', JSON.stringify(q));
    const { data: tc, error: tcErr } = await supabase.from('coding_test_cases').select('id').limit(1);
    if (tcErr) console.log('TC_ERROR:', tcErr.message);
    else console.log('TC_DATA:', JSON.stringify(tc));
    console.log('---END---');
}

check();
