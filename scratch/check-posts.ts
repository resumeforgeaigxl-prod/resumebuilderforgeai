import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createAdminClient } from '../lib/supabase/admin';

async function run() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('blog_posts').select('id, title, slug, content');
  if (error) {
    console.error(error);
  } else {
    for (const p of data || []) {
      console.log(`Title: ${p.title}\nSlug: ${p.slug}\nContent snippet: ${p.content.substring(0, 150)}\n`);
    }
  }
}

run();
