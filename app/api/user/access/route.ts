import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/jwt';
import { checkUserAccess } from '@/lib/access';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ hasAccess: false, reason: 'unauthorized' });

        const access = await checkUserAccess(session.userId);
        return NextResponse.json(access);
    } catch {
        return NextResponse.json({ hasAccess: false, reason: 'error' });
    }
}
