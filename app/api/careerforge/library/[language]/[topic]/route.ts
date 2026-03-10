import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAIResponse, extractJson } from '@/lib/ai-provider';
import {
    getCareerForgeLanguageCards,
    getCareerForgeTopicsByLanguage,
} from '@/lib/careerforge-library';
import { ensureCareerForgeLibrarySeeded } from '@/lib/careerforge-library-db';

interface TopicRow {
    id: string;
    title: string;
    slug: string;
    order_index: number;
    languages: {
        id: string;
        name: string;
        slug: string;
    };
}

function extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message?: unknown }).message;
        if (typeof message === 'string' && message.trim().length > 0) {
            return message;
        }
    }

    return 'Unexpected error';
}

function isDuplicateError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
        return false;
    }

    const code = 'code' in error ? (error as { code?: unknown }).code : null;
    return code === '23505';
}

function isSchemaIssueError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
        return false;
    }

    const maybeError = error as { code?: unknown; message?: unknown; details?: unknown };
    const code = typeof maybeError.code === 'string' ? maybeError.code : '';
    const text = `${String(maybeError.message || '')} ${String(maybeError.details || '')}`.toLowerCase();

    return code === '42P01' ||
        code === 'PGRST205' ||
        text.includes('relation') && text.includes('does not exist') ||
        text.includes('could not find the table') ||
        text.includes('column') && text.includes('does not exist');
}

interface CodeExample {
    title: string;
    code: string;
    language: string;
}

interface PracticeQuestion {
    question: string;
    answer: string;
    hint: string;
}

interface TopicContentShape {
    overview: string;
    explanation: string;
    code_examples: CodeExample[];
    key_points: string[];
    practice_questions: PracticeQuestion[];
}

async function findTopicRow(
    supabase: ReturnType<typeof createClient>,
    languageSlug: string,
    topicSlug: string
): Promise<TopicRow | null> {
    const { data, error } = await supabase
        .from('language_topics')
        .select(`
            id,
            title,
            slug,
            order_index,
            languages!inner(id, name, slug)
        `)
        .eq('slug', topicSlug)
        .eq('languages.slug', languageSlug)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return (data as TopicRow | null) || null;
}

async function findOrCreateTopicRow(
    supabase: ReturnType<typeof createClient>,
    languageSlug: string,
    topicSlug: string
): Promise<TopicRow | null> {
    // First attempt: read direct.
    const existing = await findTopicRow(supabase, languageSlug, topicSlug);
    if (existing) {
        return existing;
    }

    // Best effort: seed missing language/topic rows.
    await ensureCareerForgeLibrarySeeded(supabase).catch((seedError) => {
        console.error('[Library] Seed skipped in topic route:', seedError);
    });

    const seeded = await findTopicRow(supabase, languageSlug, topicSlug);
    if (seeded) {
        return seeded;
    }

    // If topic is not in configured topic list, it's genuinely unknown.
    const knownTopics = getCareerForgeTopicsByLanguage(languageSlug);
    const knownTopic = knownTopics.find((item) => item.slug === topicSlug);
    if (!knownTopic) {
        return null;
    }

    // Language row might be missing in inconsistent DB states; create it from known cards.
    const { data: currentLanguage, error: languageReadError } = await supabase
        .from('languages')
        .select('id, name, slug, description')
        .eq('slug', languageSlug)
        .maybeSingle();

    if (languageReadError) {
        throw languageReadError;
    }

    let languageId = currentLanguage?.id || null;

    if (!languageId) {
        const languageCard = getCareerForgeLanguageCards().find((item) => item.slug === languageSlug);
        if (!languageCard) {
            return null;
        }

        const { error: languageInsertError } = await supabase
            .from('languages')
            .insert({
                name: languageCard.name,
                slug: languageCard.slug,
                description: languageCard.description,
            });

        if (languageInsertError && !isDuplicateError(languageInsertError)) {
            throw languageInsertError;
        }

        const { data: insertedLanguage, error: insertedLanguageError } = await supabase
            .from('languages')
            .select('id')
            .eq('slug', languageSlug)
            .single();

        if (insertedLanguageError) {
            throw insertedLanguageError;
        }

        languageId = insertedLanguage.id;
    }

    const { error: topicInsertError } = await supabase
        .from('language_topics')
        .insert({
            language_id: languageId,
            title: knownTopic.title,
            slug: knownTopic.slug,
            order_index: knownTopic.order_index,
        });

    if (topicInsertError && !isDuplicateError(topicInsertError)) {
        throw topicInsertError;
    }

    return await findTopicRow(supabase, languageSlug, topicSlug);
}

function normalizeTopicContent(
    raw: unknown,
    topicTitle: string,
    languageName: string,
    languageSlug: string
): TopicContentShape {
    const source = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {};

    const overview = typeof source.overview === 'string' && source.overview.trim().length > 0
        ? source.overview.trim()
        : `${topicTitle} is a core ${languageName} concept used in real-world development.`;

    const explanation = typeof source.explanation === 'string' && source.explanation.trim().length > 0
        ? source.explanation.trim()
        : `${topicTitle} builds foundational understanding in ${languageName}. Focus on syntax, behavior, and practical usage.`;

    const parsedCodeExamples = Array.isArray(source.code_examples)
        ? source.code_examples
            .map((item) => {
                if (!item || typeof item !== 'object') {
                    return null;
                }

                const example = item as Record<string, unknown>;
                return {
                    title: typeof example.title === 'string' && example.title.trim().length > 0
                        ? example.title.trim()
                        : `${topicTitle} Example`,
                    code: typeof example.code === 'string' && example.code.trim().length > 0
                        ? example.code
                        : `// Add your ${topicTitle} example here`,
                    language: typeof example.language === 'string' && example.language.trim().length > 0
                        ? example.language.trim()
                        : languageSlug,
                } as CodeExample;
            })
            .filter((item): item is CodeExample => item !== null)
        : [];

    const code_examples = parsedCodeExamples.length > 0
        ? parsedCodeExamples
        : [{
            title: `${topicTitle} Basics`,
            code: `// ${languageName}: ${topicTitle}\n// Replace this placeholder with a practical snippet.`,
            language: languageSlug,
        }];

    const key_points = Array.isArray(source.key_points)
        ? source.key_points
            .filter((item): item is string => typeof item === 'string')
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
        : [];

    const fallbackKeyPoints = [
        `Understand what ${topicTitle} does and where it is used.`,
        `Practice writing small ${languageName} snippets for ${topicTitle}.`,
        `Review edge cases and common mistakes.`,
    ];

    const questionSource = Array.isArray(source.practice_questions)
        ? source.practice_questions
        : Array.isArray(source.exercises)
            ? source.exercises
            : [];

    const parsedPracticeQuestions = questionSource
        .map((item) => {
            if (!item || typeof item !== 'object') {
                return null;
            }

            const question = item as Record<string, unknown>;
            return {
                question: typeof question.question === 'string' && question.question.trim().length > 0
                    ? question.question.trim()
                    : `Explain how ${topicTitle} works in ${languageName}.`,
                answer: typeof question.answer === 'string' && question.answer.trim().length > 0
                    ? question.answer.trim()
                    : `Describe the concept clearly and include one concrete ${languageName} example.`,
                hint: typeof question.hint === 'string' && question.hint.trim().length > 0
                    ? question.hint.trim()
                    : `Start with definition, then show syntax.`,
            } as PracticeQuestion;
        })
        .filter((item): item is PracticeQuestion => item !== null);

    const practice_questions = parsedPracticeQuestions.length > 0
        ? parsedPracticeQuestions
        : [
            {
                question: `What problem does ${topicTitle} solve in ${languageName}?`,
                answer: `${topicTitle} helps organize logic and build reliable ${languageName} programs for common real-world tasks.`,
                hint: `Think about maintainability and correctness.`,
            },
            {
                question: `Write a small ${languageName} snippet that demonstrates ${topicTitle}.`,
                answer: `A valid example should use correct ${languageName} syntax and show the concept in action.`,
                hint: `Keep the example minimal but complete.`,
            },
            {
                question: `Name one mistake beginners make with ${topicTitle}.`,
                answer: `A common mistake is using ${topicTitle} without understanding input/output behavior or edge cases.`,
                hint: `Think about assumptions and invalid inputs.`,
            },
        ];

    return {
        overview,
        explanation,
        code_examples,
        key_points: key_points.length > 0 ? key_points : fallbackKeyPoints,
        practice_questions,
    };
}

async function generateTopicContent(
    topicTitle: string,
    languageName: string,
    languageSlug: string
): Promise<TopicContentShape> {
    const prompt = `
Generate comprehensive, structured learning content for the programming topic "${topicTitle}" in the context of "${languageName}".

Return the content in the following JSON format:
{
  "overview": "A short, engaging high-level summary of the topic.",
  "explanation": "A detailed, technical explanation of the concept, breaking down how it works and why it matters.",
  "code_examples": [
    { "title": "A descriptive title for the example", "code": "The actual code snippet", "language": "${languageSlug}" }
  ],
  "key_points": ["Point 1", "Point 2", "Point 3"],
  "practice_questions": [
    { "question": "A challenge or question for the user", "answer": "The correct solution", "hint": "A small tip to help them" }
  ]
}

Rules:
- Ensure the code examples are practical and well-commented.
- The explanation should be professional but accessible.
- Return ONLY the JSON object.
`;

    try {
        const aiResult = await generateAIResponse(prompt, 'google/gemini-1.5-flash');
        const jsonString = extractJson(aiResult.text);
        return normalizeTopicContent(
            JSON.parse(jsonString),
            topicTitle,
            languageName,
            languageSlug
        );
    } catch (generationError) {
        console.error('[Library] Content generation fallback:', generationError);
        return normalizeTopicContent({}, topicTitle, languageName, languageSlug);
    }
}

async function tryPersistGeneratedContent(
    supabase: ReturnType<typeof createClient>,
    languageSlug: string,
    topicSlug: string,
    contentJson: TopicContentShape
): Promise<void> {
    // Primary schema persistence: languages/language_topics/topic_content.
    try {
        const topic = await findOrCreateTopicRow(supabase, languageSlug, topicSlug);
        if (topic) {
            await supabase
                .from('topic_content')
                .upsert({
                    topic_id: topic.id,
                    content_json: contentJson,
                    last_generated_at: new Date().toISOString(),
                }, { onConflict: 'topic_id' });
            return;
        }
    } catch (error) {
        console.error('[Library] Primary persistence skipped:', error);
    }

    // Legacy schema persistence: library_topics.content_json.
    try {
        const knownTopic = getCareerForgeTopicsByLanguage(languageSlug).find((item) => item.slug === topicSlug);
        const languageCard = getCareerForgeLanguageCards().find((item) => item.slug === languageSlug);
        if (!knownTopic || !languageCard) {
            return;
        }

        const { data: legacyLanguage, error: legacyLanguageError } = await supabase
            .from('library_languages')
            .select('id')
            .eq('slug', languageSlug)
            .maybeSingle();

        if (legacyLanguageError && !isSchemaIssueError(legacyLanguageError)) {
            throw legacyLanguageError;
        }

        let legacyLanguageId = legacyLanguage?.id || null;
        if (!legacyLanguageId) {
            const { error: legacyLanguageInsertError } = await supabase
                .from('library_languages')
                .insert({
                    name: languageCard.name,
                    slug: languageCard.slug,
                    description: languageCard.description,
                });

            if (legacyLanguageInsertError && !isDuplicateError(legacyLanguageInsertError)) {
                throw legacyLanguageInsertError;
            }

            const { data: insertedLegacyLanguage, error: insertedLegacyLanguageError } = await supabase
                .from('library_languages')
                .select('id')
                .eq('slug', languageSlug)
                .maybeSingle();

            if (insertedLegacyLanguageError) {
                throw insertedLegacyLanguageError;
            }

            legacyLanguageId = insertedLegacyLanguage?.id || null;
        }

        if (!legacyLanguageId) {
            return;
        }

        const { error: legacyTopicInsertError } = await supabase
            .from('library_topics')
            .insert({
                language_id: legacyLanguageId,
                title: knownTopic.title,
                slug: knownTopic.slug,
                order_index: knownTopic.order_index,
                content_json: contentJson,
            });

        if (legacyTopicInsertError && !isDuplicateError(legacyTopicInsertError)) {
            throw legacyTopicInsertError;
        }

        await supabase
            .from('library_topics')
            .update({ content_json: contentJson })
            .eq('language_id', legacyLanguageId)
            .eq('slug', knownTopic.slug);
    } catch (error) {
        console.error('[Library] Legacy persistence skipped:', error);
    }
}

export async function GET(
    request: Request,
    { params }: { params: { language: string; topic: string } }
) {
    const supabase = createClient();
    const { language, topic: topicSlug } = params;
    const knownTopicSlugs = new Set(getCareerForgeTopicsByLanguage(language).map((item) => item.slug));

    try {
        const topic = await findOrCreateTopicRow(supabase, language, topicSlug);

        if (!topic && !knownTopicSlugs.has(topicSlug)) {
            return NextResponse.json({ success: false, error: 'Topic not found' }, { status: 404 });
        }

        if (!topic && knownTopicSlugs.has(topicSlug)) {
            // Known topic fallback: generate content and return instead of showing "Topic not found".
            const languageCard = getCareerForgeLanguageCards().find((item) => item.slug === language);
            const knownTopic = getCareerForgeTopicsByLanguage(language).find((item) => item.slug === topicSlug);
            const topicTitle = knownTopic?.title || topicSlug;
            const languageName = languageCard?.name || language;

            const fallbackContent = await generateTopicContent(topicTitle, languageName, language);
            await tryPersistGeneratedContent(supabase, language, topicSlug, fallbackContent);

            return NextResponse.json({
                success: true,
                topic: {
                    id: `fallback-${language}-${topicSlug}`,
                    title: topicTitle,
                    slug: topicSlug,
                    order_index: knownTopic?.order_index || 1,
                    languages: {
                        id: 'fallback-language',
                        name: languageName,
                        slug: language,
                    },
                    content_json: fallbackContent,
                },
            });
        }

        if (!topic) {
            return NextResponse.json({ success: false, error: 'Topic not found' }, { status: 404 });
        }

        // Reuse existing generated content whenever available.
        const { data: existingContent, error: contentError } = await supabase
            .from('topic_content')
            .select('*')
            .eq('topic_id', topic.id)
            .maybeSingle();

        if (contentError) {
            throw contentError;
        }

        if (existingContent && existingContent.content_json) {
            const normalizedContent = normalizeTopicContent(
                existingContent.content_json,
                topic.title,
                topic.languages.name,
                topic.languages.slug
            );

            return NextResponse.json({
                success: true,
                topic: {
                    ...topic,
                    content_json: normalizedContent,
                },
            });
        }

        // Generate once using AI when content does not exist yet.
        console.log(`[Library] Generating content for ${language}/${topicSlug}...`);

        const languageName = topic.languages.name;
        const topicTitle = topic.title;

        const contentJson = await generateTopicContent(
            topicTitle,
            languageName,
            topic.languages.slug
        );

        const { error: insertError } = await supabase
            .from('topic_content')
            .upsert({
                topic_id: topic.id,
                content_json: contentJson,
                last_generated_at: new Date().toISOString(),
            }, { onConflict: 'topic_id' });

        if (insertError) {
            throw insertError;
        }

        return NextResponse.json({
            success: true,
            topic: {
                ...topic,
                content_json: contentJson,
            },
        });
    } catch (error: unknown) {
        console.error('Error fetching/generating topic content:', error);

        // If this is a known topic slug, avoid showing "Topic not found" and return generated fallback content.
        if (knownTopicSlugs.has(topicSlug)) {
            const languageCard = getCareerForgeLanguageCards().find((item) => item.slug === language);
            const knownTopic = getCareerForgeTopicsByLanguage(language).find((item) => item.slug === topicSlug);
            const topicTitle = knownTopic?.title || topicSlug;
            const languageName = languageCard?.name || language;

            const fallbackContent = await generateTopicContent(topicTitle, languageName, language);
            await tryPersistGeneratedContent(supabase, language, topicSlug, fallbackContent);

            return NextResponse.json({
                success: true,
                topic: {
                    id: `rescue-${language}-${topicSlug}`,
                    title: topicTitle,
                    slug: topicSlug,
                    order_index: knownTopic?.order_index || 1,
                    languages: {
                        id: 'rescue-language',
                        name: languageName,
                        slug: language,
                    },
                    content_json: fallbackContent,
                },
            });
        }

        const message = extractErrorMessage(error);
        const status = isSchemaIssueError(error) ? 500 : 500;
        return NextResponse.json({ success: false, error: message }, { status });
    }
}
