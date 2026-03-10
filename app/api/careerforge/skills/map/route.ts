import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    ensureCareerForgeLibrarySeeded,
    fetchCareerForgeTopicCatalog,
} from '@/lib/careerforge-library-db';
import { mapSkillToTopic } from '@/lib/careerforge-skill-mapper';

interface StepInput {
    name: string;
    items: string[];
}

interface SkillMapBody {
    targetRole?: string;
    steps?: StepInput[];
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as SkillMapBody;
        const targetRole = (body.targetRole || '').trim();
        const steps = Array.isArray(body.steps) ? body.steps : [];

        if (steps.length === 0) {
            return NextResponse.json({ success: false, error: 'Steps are required' }, { status: 400 });
        }

        const supabase = createClient();

        await ensureCareerForgeLibrarySeeded(supabase).catch((seedError) => {
            console.error('[CareerForge Skill Mapping] Seed skipped:', seedError);
        });

        const topicCatalog = await fetchCareerForgeTopicCatalog(supabase);
        if (topicCatalog.length === 0) {
            return NextResponse.json({ success: false, error: 'Learning topic catalog is empty' }, { status: 500 });
        }

        const normalizedSteps = steps.map((step) => ({
            name: typeof step.name === 'string' ? step.name : '',
            items: Array.isArray(step.items) ? step.items.filter((item): item is string => typeof item === 'string') : [],
        }));

        const mapped_steps = normalizedSteps.map((step, stepIndex) => ({
            step_index: stepIndex,
            step_name: step.name,
            items: step.items.map((skill, itemIndex) => {
                const match = mapSkillToTopic({
                    targetRole,
                    stepName: step.name,
                    skill,
                }, topicCatalog);

                return {
                    item_index: itemIndex,
                    skill,
                    confidence: match.confidence,
                    topic: {
                        id: match.topic.id,
                        title: match.topic.title,
                        slug: match.topic.slug,
                        language_name: match.topic.language_name,
                        language_slug: match.topic.language_slug,
                    },
                };
            }),
        }));

        return NextResponse.json({
            success: true,
            mapped_steps,
        });
    } catch (error: unknown) {
        console.error('[CareerForge Skill Mapping] Error:', error);
        const message = error instanceof Error ? error.message : 'Unexpected error';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
