import { NextResponse } from 'next/server';
import { calculateATSScore } from '@/lib/ats-score';
import { rateLimit } from '@/lib/rate-limit';
import { getSession } from '@/lib/auth/jwt';
import { logATSScore } from '@/lib/admin-logger';

export async function POST(request: Request) {
    try {
        // Rate limit: 10 requests per minute per IP
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
        const { allowed, remaining } = rateLimit({ key: `ats:${ip}`, limit: 10, windowMs: 60_000 });

        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please wait a moment.' },
                {
                    status: 429,
                    headers: { 'X-RateLimit-Remaining': '0', 'Retry-After': '60' },
                }
            );
        }

        const { resumeData, jobDescription } = await request.json();
        if (!resumeData) return NextResponse.json({ error: 'Resume data required' }, { status: 400 });

        const result = calculateATSScore(resumeData, jobDescription);

        // Fire-and-forget admin logging
        getSession().then(session => {
            if (session?.userId && result) {
                logATSScore({
                    userId: session.userId,
                    resumeId: (resumeData?.id as string) || null,
                    score: result.score ?? 0,
                    keywordMatch: result.details?.keywords ?? 0,
                    skillMatch: result.details?.skills ?? 0,
                    experienceMatch: result.details?.metrics ?? 0,
                    completeness: result.details?.completeness ?? 0,
                    jobDescription: jobDescription
                });
            }
        }).catch(() => { });

        return NextResponse.json({ success: true, scoreResult: result }, {
            headers: { 'X-RateLimit-Remaining': String(remaining) },
        });

    } catch (error) {
        console.error('[ATS]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
