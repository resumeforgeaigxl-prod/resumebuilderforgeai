import { NextResponse } from 'next/server';
import { manualDeduplicate } from '@/lib/jobs/ingestion-service';

export const dynamic = 'force-dynamic';

export async function POST() {
    try {
        const result = await manualDeduplicate();
        
        if (!result.success) {
            return NextResponse.json({ 
                success: false, 
                error: result.error 
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            count: result.count
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: 'Internal server error', detail: message }, { status: 500 });
    }
}
