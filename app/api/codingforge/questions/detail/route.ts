import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');
    const slug = searchParams.get('slug');

    if (!questionId && !slug) {
        return NextResponse.json({ error: 'Question ID or Slug is required' }, { status: 400 });
    }

    const supabase = createClient();

    try {
        let query = supabase
            .from('coding_questions')
            .select(`
                *,
                coding_solutions (*),
                coding_tasks (*),
                coding_companies (*)
            `);

        if (questionId) {
            query = query.eq('id', questionId);
        } else {
            query = query.eq('slug', slug);
        }

        const { data, error } = await query.single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (e) {
        console.error('Fetch Question Detail Error:', e);
        return NextResponse.json({ error: 'Failed to fetch question details' }, { status: 500 });
    }
}
