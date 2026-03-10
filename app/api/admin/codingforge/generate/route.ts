import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { generateCodingQuestions } from '@/lib/coding-generator';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const count = body.count || 5;

        console.log(`[Admin] Manually triggered coding question generation: count=${count}`);
        const insertedCount = await generateCodingQuestions(count);

        return NextResponse.json({
            success: true,
            message: `Successfully generated and inserted ${insertedCount} new questions.`
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Generation failed';
        console.error('[Admin Coding Generator Error]', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
