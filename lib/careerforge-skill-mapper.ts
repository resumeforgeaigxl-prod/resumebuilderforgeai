import type { TopicCatalogRow } from '@/lib/careerforge-library-db';

const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'to', 'of', 'for', 'with', 'in', 'on', 'at', 'by', 'from',
    'using', 'use', 'build', 'building', 'development', 'developer', 'engineer', 'phase', 'step',
    'learn', 'learning', 'core', 'advanced', 'intermediate', 'basic', 'basics',
]);

const LANGUAGE_ALIASES: Record<string, string[]> = {
    java: ['java'],
    python: ['python', 'py'],
    javascript: ['javascript', 'js', 'ecmascript'],
    c: [' c ', 'language c', 'c language'],
    'c-plus-plus': ['c++', 'cpp', 'c plus plus'],
    react: ['react', 'reactjs'],
    nodejs: ['node', 'nodejs', 'node.js', 'express'],
    sql: ['sql', 'mysql', 'postgres', 'postgresql', 'database', 'db', 'query'],
};

export interface SkillInput {
    targetRole: string;
    stepName: string;
    skill: string;
}

export interface SkillTopicMatch {
    topic: TopicCatalogRow;
    confidence: number;
}

function normalize(text: string): string {
    return ` ${text.toLowerCase().replace(/[^a-z0-9+.#\s]/g, ' ').replace(/\s+/g, ' ').trim()} `;
}

function tokenize(text: string): string[] {
    return normalize(text)
        .trim()
        .split(' ')
        .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function overlapCount(a: string[], b: string[]): number {
    const setB = new Set(b);
    return a.reduce((score, token) => score + (setB.has(token) ? 1 : 0), 0);
}

function detectLanguages(text: string): string[] {
    const normalized = normalize(text);
    const matches: string[] = [];

    Object.entries(LANGUAGE_ALIASES).forEach(([slug, aliases]) => {
        if (aliases.some((alias) => normalized.includes(` ${alias} `))) {
            matches.push(slug);
        }
    });

    return matches;
}

function languagePriority(topics: TopicCatalogRow[]): string[] {
    return Array.from(new Set(topics.map((topic) => topic.language_slug)));
}

export function mapSkillToTopic(input: SkillInput, topics: TopicCatalogRow[]): SkillTopicMatch {
    const contextText = `${input.targetRole} ${input.stepName} ${input.skill}`;
    const skillTokens = tokenize(input.skill);
    const contextTokens = tokenize(contextText);
    const preferredLanguages = detectLanguages(contextText);
    const languageOrder = languagePriority(topics);

    let bestTopic: TopicCatalogRow | null = null;
    let bestScore = -1;

    topics.forEach((topic) => {
        const titleTokens = tokenize(topic.title);
        const topicTitle = normalize(topic.title);
        const normalizedSkill = normalize(input.skill);

        let score = 0;
        score += overlapCount(skillTokens, titleTokens) * 4;
        score += overlapCount(contextTokens, titleTokens) * 2;

        if (preferredLanguages.includes(topic.language_slug)) {
            score += 5;
        }

        if (normalizedSkill.includes(' api ') && topicTitle.includes(' api ')) {
            score += 4;
        }
        if (normalizedSkill.includes(' auth ') || normalizedSkill.includes(' authentication ')) {
            if (topicTitle.includes(' authentication ')) {
                score += 5;
            }
        }
        if (normalizedSkill.includes(' database ') && topic.language_slug === 'sql') {
            score += 4;
        }
        if ((normalizedSkill.includes(' basics ') || normalizedSkill.includes(' overview ')) && topic.order_index <= 2) {
            score += 3;
        }

        if (score > bestScore) {
            bestScore = score;
            bestTopic = topic;
        }
    });

    if (!bestTopic) {
        // Guaranteed fallback to a stable topic row.
        bestTopic = topics[0];
    }

    if (bestScore <= 0) {
        const preferredLanguage = preferredLanguages.find((slug) => languageOrder.includes(slug));
        const fallbackByLanguage = preferredLanguage
            ? topics.find((topic) => topic.language_slug === preferredLanguage && topic.order_index === 1)
                || topics.find((topic) => topic.language_slug === preferredLanguage)
            : null;

        bestTopic = fallbackByLanguage || topics.find((topic) => topic.order_index === 1) || topics[0];
        bestScore = 1;
    }

    return {
        topic: bestTopic,
        confidence: Math.min(1, bestScore / 12),
    };
}
