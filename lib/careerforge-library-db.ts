import type { SupabaseClient } from '@supabase/supabase-js';
import {
    getCareerForgeLanguageSeedRows,
    getCareerForgeTopicSeedRows,
} from '@/lib/careerforge-library';

interface LanguageRow {
    id: string;
    slug: string;
}

interface TopicJoinRow {
    id: string;
    title: string;
    slug: string;
    order_index: number;
    languages: {
        name: string;
        slug: string;
    } | Array<{
        name: string;
        slug: string;
    }>;
}

export interface TopicCatalogRow {
    id: string;
    title: string;
    slug: string;
    order_index: number;
    language_name: string;
    language_slug: string;
}

export async function ensureCareerForgeLibrarySeeded(supabase: SupabaseClient): Promise<void> {
    const languageRows = getCareerForgeLanguageSeedRows();
    const topicRows = getCareerForgeTopicSeedRows();

    const { error: languageSeedError } = await supabase
        .from('languages')
        .upsert(languageRows, { onConflict: 'slug' });

    if (languageSeedError) {
        throw languageSeedError;
    }

    const { data: dbLanguages, error: languageReadError } = await supabase
        .from('languages')
        .select('id, slug')
        .in('slug', languageRows.map((item) => item.slug));

    if (languageReadError) {
        throw languageReadError;
    }

    const languageIdBySlug = new Map(
        ((dbLanguages || []) as LanguageRow[]).map((item) => [item.slug, item.id])
    );

    const topicSeedRows = topicRows
        .map((item) => {
            const languageId = languageIdBySlug.get(item.languageSlug);
            if (!languageId) {
                return null;
            }

            return {
                language_id: languageId,
                title: item.title,
                slug: item.slug,
                order_index: item.order_index,
            };
        })
        .filter((item): item is { language_id: string; title: string; slug: string; order_index: number } => item !== null);

    if (topicSeedRows.length === 0) {
        return;
    }

    const { error: topicSeedError } = await supabase
        .from('language_topics')
        .upsert(topicSeedRows, { onConflict: 'language_id,slug' });

    if (topicSeedError) {
        throw topicSeedError;
    }
}

export async function fetchCareerForgeTopicCatalog(supabase: SupabaseClient): Promise<TopicCatalogRow[]> {
    const { data, error } = await supabase
        .from('language_topics')
        .select(`
            id,
            title,
            slug,
            order_index,
            languages!inner (
                name,
                slug
            )
        `)
        .order('order_index', { ascending: true });

    if (error) {
        throw error;
    }

    return ((data || []) as TopicJoinRow[])
        .map((row) => {
            const language = Array.isArray(row.languages) ? row.languages[0] : row.languages;
            if (!language) {
                return null;
            }

            return {
                id: row.id,
                title: row.title,
                slug: row.slug,
                order_index: row.order_index,
                language_name: language.name,
                language_slug: language.slug,
            };
        })
        .filter((row): row is TopicCatalogRow => row !== null);
}
