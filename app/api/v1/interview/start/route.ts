export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { validateApiKey, createApiResponse, createApiError } from '@/lib/api/v1-utils';
import { InterviewForge } from '@/lib/ai/forges/interview';

/**
 * @api {post} /v1/interview/start Start an Interview Session
 * @apiDescription Generates initial questions for a given role and level.
 */
export async function POST(req: NextRequest) {
    const auth = await validateApiKey(req);
    if (!auth.isValid) {
        return createApiError(auth.error!, auth.status!);
    }

    try {
        const body = await req.json();
        const { role, level } = body;

        if (!role || !level) {
            return createApiError('Role and Level are required.', 400);
        }

        const result = await InterviewForge.generateMockQuestions(role, level, auth.userId);
        return createApiResponse(result, 'Interview session started successfully');
    } catch (error: unknown) {
        console.error('[API v1] Interview Start Error:', error);
        const err = error as Error;
        return createApiError(err.message || 'Internal server error', 500);
    }
}


