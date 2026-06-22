import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createAdminClient } from '../lib/supabase/admin';

async function run() {
  const supabase = createAdminClient();
  const slugsToDelete = [
    'prepforge-for-tcs-nqt-prep',
    'how-codingforge-helps-interview-prep'
  ];

  console.log("Attempting to delete posts with slugs:", slugsToDelete);

  const { data, error } = await supabase
    .from('blog_posts')
    .delete()
    .in('slug', slugsToDelete)
    .select('id, title, slug');

  if (error) {
    console.error("Error deleting posts:", error);
  } else {
    console.log("Successfully deleted posts:", data);
  }
}

run();
