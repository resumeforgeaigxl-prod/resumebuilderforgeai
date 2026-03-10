import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json({
        error: 'Code execution is currently disabled in favor of the Learning System.',
        message: 'CodingForge has been updated to a technical interview learning platform. Please use the interactive learning modules instead.'
    }, { status: 503 });
}

