import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { getUserCredits } from '@/lib/projectforge-credits';

export async function GET() {
    const session = await getSession();

    if (!session || !session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { credits } = await getUserCredits(session.userId);
        return NextResponse.json({ credits });
    } catch (error) {
        console.error('Credits API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
    }
}
