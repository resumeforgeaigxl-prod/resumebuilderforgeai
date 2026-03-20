import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { getCodeExecutionCredits } from '@/lib/code-execution-credits';

export async function GET() {
    const session = await getSession();
    if (!session || !session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const credits = await getCodeExecutionCredits(session.userId);
        return NextResponse.json({
            credits: credits.runs_remaining,
            dailyLimit: 30,
            thisMinute: credits.runs_this_minute,
            rateLimit: 5
        });
    } catch (err) {
        console.error('[CreditsAPI] Error:', err);
        return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
    }
}
