const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkDB() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: posts, error } = await supabase.from('blog_posts').select('*');
    if (error) {
        console.error(error);
    } else {
        console.log("Total posts in DB:", posts.length);
        posts.forEach(p => {
           console.log(`- Title: "${p.title}", Status: "${p.status}", Locale: "${p.locale}", PublishedAt: "${p.published_at}"`);
        });
    }
}

checkDB();
