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
        const stats = await generateCodingQuestions(count);

        return NextResponse.json({
            success: true,
            stats,
            message: `Process complete: Requested ${stats.requested}, Generated ${stats.generated}, Inserted ${stats.inserted}, Skipped ${stats.skipped} duplicates.`
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Generation failed';
        console.error('[Admin Coding Generator Error]', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
