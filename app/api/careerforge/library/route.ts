import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    getCareerForgeLanguageCards,
    getCareerForgeTopicsByLanguage,
} from '@/lib/careerforge-library';
import { ensureCareerForgeLibrarySeeded } from '@/lib/careerforge-library-db';

interface DbLanguage {
    id: string;
    name: string;
    slug: string;
    description: string | null;
}

interface DbTopicCountRow {
    language_id: string;
}

export async function GET(request: Request) {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const languageSlug = searchParams.get('language');
    const fallbackCards = getCareerForgeLanguageCards();

    try {
        // Seed core language/topic rows so the library is never empty.
        await ensureCareerForgeLibrarySeeded(supabase).catch((seedError) => {
            // Continue with read + fallback behavior even if write policies are restricted.
            console.error('[CareerForge Library] Seed skipped:', seedError);
        });

        if (languageSlug) {
            const fallbackLanguage = fallbackCards.find((item) => item.slug === languageSlug) || null;

            // Fetch topics for a specific language from finalized tables.
            const { data: language, error: langError } = await supabase
                .from('languages')
                .select('id, name, description')
                .eq('slug', languageSlug)
                .single();

            if ((langError || !language) && !fallbackLanguage) {
                return NextResponse.json({ success: false, error: 'Language not found' }, { status: 404 });
            }

            let topics: Array<{ id: string; title: string; slug: string; order_index: number }> = [];
            if (language?.id) {
                const { data: topicRows, error: topicsError } = await supabase
                    .from('language_topics')
                    .select('id, title, slug, order_index')
                    .eq('language_id', language.id)
                    .order('order_index', { ascending: true });

                if (topicsError) {
                    throw topicsError;
                }

                topics = topicRows || [];
            }

            const fallbackTopics = getCareerForgeTopicsByLanguage(languageSlug).map((topic) => ({
                id: `fallback-${languageSlug}-${topic.slug}`,
                title: topic.title,
                slug: topic.slug,
                order_index: topic.order_index,
            }));

            const resolvedTopics = topics.length > 0 ? topics : fallbackTopics;

            return NextResponse.json({
                success: true,
                language: language || {
                    id: null,
                    name: fallbackLanguage?.name || languageSlug,
                    description: fallbackLanguage?.description || '',
                },
                topics: resolvedTopics,
            });
        } else {
            // Fetch all languages with topic counts from finalized tables.
            const { data: languages, error } = await supabase
                .from('languages')
                .select('id, name, slug, description')
                .in('slug', fallbackCards.map((item) => item.slug));

            if (error) throw error;

            const { data: topicRows, error: topicCountError } = await supabase
                .from('language_topics')
                .select('language_id');

            if (topicCountError) throw topicCountError;

            const topicCountByLanguageId = new Map<string, number>();
            (topicRows as DbTopicCountRow[] | null)?.forEach((row) => {
                topicCountByLanguageId.set(
                    row.language_id,
                    (topicCountByLanguageId.get(row.language_id) || 0) + 1
                );
            });

            const languageBySlug = new Map((languages as DbLanguage[] | null)?.map((item) => [item.slug, item]));

            const mergedLanguages = fallbackCards.map((fallback) => {
                const dbLanguage = languageBySlug.get(fallback.slug);
                const topicCount = dbLanguage
                    ? topicCountByLanguageId.get(dbLanguage.id) || fallback.topicCount
                    : fallback.topicCount;

                return {
                    id: dbLanguage?.id || null,
                    name: dbLanguage?.name || fallback.name,
                    slug: fallback.slug,
                    description: dbLanguage?.description || fallback.description,
                    topicCount,
                };
            });

            return NextResponse.json({
                success: true,
                languages: mergedLanguages,
            });
        }
    } catch (error: unknown) {
        console.error('Error fetching library data:', error);
        const message = error instanceof Error ? error.message : 'Unexpected error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
