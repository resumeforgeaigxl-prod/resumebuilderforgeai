import dotenv from 'dotenv';
import path from 'path';
// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { createClient } from '../lib/supabase/server';

async function check() {
    try {
        const supabase = createClient();
        const { data: resumes, error } = await supabase
            .from('resumes')
            .select('id, title, user_id, template_selected, created_at, updated_at, resume_json')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching resumes:', error);
            return;
        }

        console.log(`Total resumes found: ${resumes?.length || 0}`);
        resumes?.forEach((r, idx) => {
            let jsonContent = r.resume_json;
            if (typeof jsonContent === 'string') {
                try { jsonContent = JSON.parse(jsonContent); } catch {}
            }
            console.log(`\n--- Resume #${idx + 1} ---`);
            console.log(`ID: ${r.id}`);
            console.log(`Title: ${r.title}`);
            console.log(`User ID: ${r.user_id}`);
            console.log(`Template: ${r.template_selected}`);
            console.log(`Created: ${r.created_at}`);
            console.log(`Updated: ${r.updated_at}`);
            console.log(`Summary length: ${jsonContent?.summary?.length || 0}`);
            console.log(`Experience count: ${jsonContent?.experience?.length || 0}`);
            console.log(`Projects count: ${jsonContent?.projects?.length || 0}`);
            console.log(`Skills (other) count: ${jsonContent?.skills?.other?.length || 0}`);
        });
    } catch (e: any) {
        console.error('Error executing query:', e);
    }
}

check();
