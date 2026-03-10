import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface TopicReference {
    id: string;
    title: string;
    slug: string;
    language_slug: string;
}

interface LanguageTopicJoinRow {
    id: string;
    title: string;
    slug: string;
    languages: {
        slug: string;
    } | Array<{
        slug: string;
    }>;
}

interface LegacyTopicJoinRow {
    id: string;
    title: string;
    slug: string;
    library_languages: {
        slug: string;
    } | Array<{
        slug: string;
    }>;
}

interface RoadmapSkillRow {
    id: string;
    title: string;
    topic_id: string | null;
    order_index: number;
    learning_topic?: TopicReference | null;
}

interface RoadmapStepRow {
    id: string;
    title: string;
    description: string;
    order_index: number;
    roadmap_skills: RoadmapSkillRow[];
}

interface DetailedRoadmapRow {
    id: string;
    title: string;
    slug: string;
    description: string;
    estimated_duration: string;
    roadmap_steps: RoadmapStepRow[];
}

async function attachLearningTopicLinks(
    supabase: ReturnType<typeof createClient>,
    roadmap: DetailedRoadmapRow
): Promise<DetailedRoadmapRow> {
    const topicIds = Array.from(
        new Set(
            roadmap.roadmap_steps
                .flatMap((step) => step.roadmap_skills)
                .map((skill) => skill.topic_id)
                .filter((topicId): topicId is string => typeof topicId === 'string' && topicId.length > 0)
        )
    );

    if (topicIds.length === 0) {
        return roadmap;
    }

    const topicById = new Map<string, TopicReference>();

    const { data: languageTopics, error: languageTopicError } = await supabase
        .from('language_topics')
        .select(`
            id,
            title,
            slug,
            languages!inner (
                slug
            )
        `)
        .in('id', topicIds);

    if (languageTopicError) {
        throw languageTopicError;
    }

    (languageTopics as LanguageTopicJoinRow[] | null)?.forEach((item) => {
        const languageSlug = Array.isArray(item.languages) ? item.languages[0]?.slug : item.languages?.slug;
        if (!languageSlug) {
            return;
        }

        topicById.set(item.id, {
            id: item.id,
            title: item.title,
            slug: item.slug,
            language_slug: languageSlug,
        });
    });

    // Backward compatibility: if roadmap skills still reference old library_topics rows.
    const missingTopicIds = topicIds.filter((topicId) => !topicById.has(topicId));
    if (missingTopicIds.length > 0) {
        const { data: legacyTopics, error: legacyTopicError } = await supabase
            .from('library_topics')
            .select(`
                id,
                title,
                slug,
                library_languages!inner (
                    slug
                )
            `)
            .in('id', missingTopicIds);

        if (!legacyTopicError) {
            (legacyTopics as LegacyTopicJoinRow[] | null)?.forEach((item) => {
                const languageSlug = Array.isArray(item.library_languages)
                    ? item.library_languages[0]?.slug
                    : item.library_languages?.slug;
                if (!languageSlug) {
                    return;
                }

                topicById.set(item.id, {
                    id: item.id,
                    title: item.title,
                    slug: item.slug,
                    language_slug: languageSlug,
                });
            });
        }
    }

    return {
        ...roadmap,
        roadmap_steps: roadmap.roadmap_steps.map((step) => ({
            ...step,
            roadmap_skills: step.roadmap_skills.map((skill) => ({
                ...skill,
                learning_topic: skill.topic_id ? topicById.get(skill.topic_id) || null : null,
            })),
        })),
    };
}

export async function GET(request: Request) {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const roadmapSlug = searchParams.get('slug');

    try {
        if (roadmapSlug) {
            // Fetch a specific roadmap with steps and skills.
            const { data: roadmap, error } = await supabase
                .from('career_roadmaps')
                .select(`
                    *,
                    roadmap_steps (
                        *,
                        roadmap_skills (*)
                    )
                `)
                .eq('slug', roadmapSlug)
                .single();

            if (error || !roadmap) {
                return NextResponse.json({ success: false, error: 'Roadmap not found' }, { status: 404 });
            }

            const enrichedRoadmap = await attachLearningTopicLinks(supabase, roadmap as DetailedRoadmapRow);

            // Sort steps and skills by order_index.
            enrichedRoadmap.roadmap_steps?.sort((a, b) => a.order_index - b.order_index);
            enrichedRoadmap.roadmap_steps?.forEach((step) => {
                step.roadmap_skills?.sort((a, b) => a.order_index - b.order_index);
            });

            return NextResponse.json({
                success: true,
                roadmap: enrichedRoadmap,
            });
        } else {
            // Fetch all roadmaps
            const { data: roadmaps, error } = await supabase
                .from('career_roadmaps')
                .select('*')
                .order('title', { ascending: true });

            if (error) throw error;

            return NextResponse.json({
                success: true,
                roadmaps
            });
        }
    } catch (error: unknown) {
        console.error('Error fetching roadmaps:', error);
        const message = error instanceof Error ? error.message : 'Unexpected error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
