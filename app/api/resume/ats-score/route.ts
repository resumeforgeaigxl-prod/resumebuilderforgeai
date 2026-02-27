import { NextResponse } from 'next/server';
import { calculateATSScore } from '@/lib/ats-score';
import { rateLimit } from '@/lib/rate-limit';

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

        return NextResponse.json({ success: true, scoreResult: result }, {
            headers: { 'X-RateLimit-Remaining': String(remaining) },
        });

    } catch (error) {
        console.error('[ATS]', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
