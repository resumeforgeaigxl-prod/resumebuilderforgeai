import { createClient } from '@supabase/supabase-js';

const url = 'https://dobrcuiohslvoiklmevq.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYnJjdWlvaHNsdm9pa2xtZXZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE3MzQ0MCwiZXhwIjoyMDg3NzQ5NDQwfQ.LnsBEPdI0qWiFWiTDRp_tt231lMziUBenTWpitY1Ebw';

const supabase = createClient(url, key);

async function checkTables() {
    console.log('--- Checking Tables ---');
    const tables = ['explainforge_requests', 'explainforge_outputs', 'explainforge_files', 'users'];
    for (const table of tables) {
        try {
            const { error, data } = await supabase.from(table).select('*').limit(1);
            if (error) {
                console.log(`[${table}] ERROR: ${error.message}`);
            } else {
                console.log(`[${table}] SUCCESS: Found ${data.length} rows (or empty)`);
            }
        } catch (e: any) {
            console.log(`[${table}] EXCEPTION: ${e.message}`);
        }
    }
}

checkTables();
