import { createClient } from './lib/supabase/server';

async function check() {
    const supabase = createClient();
    const { data, error } = await supabase.from('coding_test_cases').select('count', { count: 'exact', head: true });
    if (error) {
        console.error('Error checking coding_test_cases:', error.message);
    } else {
        console.log('coding_test_cases exists, count:', data);
    }

    const { data: qData, error: qError } = await supabase.from('coding_questions').select('slug').limit(5);
    if (qError) {
        console.error('Error checking coding_questions:', qError.message);
    } else {
        console.log('Available slugs:', qData.map(d => d.slug));
    }
}

check();
