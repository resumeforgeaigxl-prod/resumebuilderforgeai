import { NextRequest } from 'next/server';
import { validateApiKey, createApiResponse, createApiError } from '@/lib/api/v1-utils';
import { InterviewForge } from '@/lib/ai/forges/interview';

/**
 * @api {post} /v1/prep/question Get a single prep question
 * @apiDescription Generates a specific interview question for a role/topic.
 */
export async function POST(req: NextRequest) {
    const auth = await validateApiKey(req);
    if (!auth.isValid) {
        return createApiError(auth.error!, auth.status!);
    }

    try {
        const body = await req.json();
        const { topic, difficulty } = body;

        if (!topic) {
            return createApiError('Topic is required.', 400);
        }

        const result = await InterviewForge.generateSingleQuestion(topic, difficulty || 'intermediate', auth.userId);
        return createApiResponse(result, 'Prep question generated successfully');
    } catch (error: unknown) {
        console.error('[API v1] Prep Question Error:', error);
        const err = error as Error;
        return createApiError(err.message || 'Internal server error', 500);
    }
}
