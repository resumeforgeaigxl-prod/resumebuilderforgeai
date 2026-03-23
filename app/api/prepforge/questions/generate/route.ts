import { NextRequest, NextResponse } from 'next/server';
import { generatePrepForgeQuestion, generateDailyPrepBundle } from '@/lib/prepforge/generator';
import { getSession } from '@/lib/auth/jwt';
import { createAdminClient } from '@/lib/supabase/admin';

const slugify = (text: string) => text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { type, topic, dailyMode } = body;
        const supabase = createAdminClient();

        console.log(`[PrepForge] Request for: Type=${type}, Topic=${topic}, Daily=${dailyMode}`);

        if (dailyMode) {
            const bundle = await generateDailyPrepBundle();
            // Store bundle in DB for persistence
            for (const q of bundle) {
                await supabase.from('prep_forge_questions').upsert({
                    type: q.type,
                    topic: q.topic,
                    title: q.title,
                    slug: slugify(q.title),
                    problem: q.problem,
                    input_output: q.input_output,
                    approach: q.approach,
                    code: q.code,
                    line_explanation: q.line_explanation,
                    variations: q.variations
                }, { onConflict: 'slug' });
            }
            return NextResponse.json({ success: true, bundle });
        }

        // Check cache first for single question
        if (topic) {
            const { data: existing } = await supabase
                .from('prep_forge_questions')
                .select('*')
                .eq('type', type)
                .eq('topic', topic)
                .limit(1)
                .single();

            if (existing) {
                console.log(`[PrepForge] Cache hit for ${topic}`);
                return NextResponse.json({ success: true, question: existing });
            }
        }

        const question = await generatePrepForgeQuestion(type || 'coding', topic);
        const questionSlug = slugify(question.title);

        // Store in DB
        const { data: stored, error: dbError } = await supabase
            .from('prep_forge_questions')
            .upsert({
                type: question.type,
                topic: question.topic,
                title: question.title,
                slug: questionSlug,
                problem: question.problem,
                input_output: question.input_output,
                approach: question.approach,
                code: question.code,
                line_explanation: question.line_explanation,
                variations: question.variations
            }, { onConflict: 'slug' })
            .select()
            .single();

        if (dbError) console.error('[PrepForge DB Error]', dbError);

        return NextResponse.json({ success: true, question: stored || { ...question, slug: questionSlug } });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Generation failed';
        console.error('[PrepForge Generator Error]', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
