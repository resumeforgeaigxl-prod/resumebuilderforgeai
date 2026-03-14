import { createClient } from '@supabase/supabase-js';

const url = 'https://dobrcuiohslvoiklmevq.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYnJjdWlvaHNsdm9pa2xtZXZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE3MzQ0MCwiZXhwIjoyMDg3NzQ5NDQwfQ.LnsBEPdI0qWiFWiTDRp_tt231lMziUBenTWpitY1Ebw';

const supabase = createClient(url, key);

async function checkRecent() {
    console.log('--- Checking Recent Activity ---');
    const { data: requests, error: rError } = await supabase.from('explainforge_requests').select('id, created_at, input_content').order('created_at', { ascending: false }).limit(5);
    if (rError) console.log('Requests Error:', rError.message);
    else {
        console.log('Recent Requests:');
        requests.forEach(r => console.log(`Request ID: ${r.id}, Content: ${r.input_content?.substring(0, 20)}...`));
    }

    const { data: outputs, error: oError } = await supabase.from('explainforge_outputs').select('id, request_id').order('created_at', { ascending: false }).limit(5);
    if (oError) console.log('Outputs Error:', oError.message);
    else {
        console.log('Recent Outputs:');
        outputs.forEach(o => console.log(`Output ID: ${o.id}, Request ID: ${o.request_id}`));
    }
}

checkRecent();
