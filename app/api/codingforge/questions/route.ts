export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const topic = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty');

    const supabase = createClient();

    try {
        let query = supabase
            .from('coding_questions')
            .select(`
                *,
                coding_companies (company_name)
            `);

        if (type) query = query.eq('type', type);
        if (topic) query = query.eq('topic', topic);
        if (difficulty) query = query.eq('difficulty', difficulty);

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e) {
        console.error('Fetch Questions Error:', e);
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
}


