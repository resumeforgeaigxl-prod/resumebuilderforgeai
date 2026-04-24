export const dynamic = 'force-dynamic';
import { NextRequest } from 'next/server';
import { validateApiKey, createApiResponse, createApiError } from '@/lib/api/v1-utils';
import { ResumeForge } from '@/lib/ai/forges/resume';

/**
 * @api {post} /v1/resume/generate Generate or Optimize a Resume
 * @apiDescription Aligns a base resume with a specific job description using AI.
 */
export async function POST(req: NextRequest) {
    const auth = await validateApiKey(req);
    if (!auth.isValid) {
        return createApiError(auth.error!, auth.status!);
    }

    try {
        const body = await req.json();
        const { resume_data, job_description } = body;

        if (!resume_data || !job_description) {
            return createApiError('Both resume_data and job_description are required.', 400);
        }

        const result = await ResumeForge.optimize(resume_data, job_description, auth.userId);

        return createApiResponse(result, 'Resume generated successfully');
    } catch (error: unknown) {
        console.error('[API v1] Generate PDF Error:', error);
        const err = error as Error;
        return createApiError(err.message || 'Internal server error', 500);
    }
}


