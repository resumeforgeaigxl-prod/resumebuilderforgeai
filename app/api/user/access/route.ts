import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { checkUserAccess } from '@/lib/access';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const session = await getSession();
        console.log('[API] User Access - Session:', session);
        if (!session) return NextResponse.json({ hasAccess: false, reason: 'unauthorized' });

        const access = await checkUserAccess(session.userId);
        console.log('[API] User Access - Result:', access);
        return NextResponse.json({
            ...access,
            userId: session.userId
        });
    } catch {
        return NextResponse.json({ hasAccess: false, reason: 'error' });
    }
}
