import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { grantMentorPermission } from '@/lib/ai/governance-service';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { forgeName } = await req.json();
        if (!forgeName) return NextResponse.json({ error: 'Forge name missing' }, { status: 400 });

        await grantMentorPermission(session.userId, forgeName);

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
         const msg = error instanceof Error ? error.message : 'Unknown error';
         return NextResponse.json({ error: msg }, { status: 500 });
    }
}
