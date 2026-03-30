import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        success: true,
        message: 'Welcome to the ResumeForgeAI Engine API Gateway.',
        version: 'v1.2',
        endpoints: {
            v1: '/v1',
            status: '/status',
            docs: 'https://docs.resumeforgeai.in'
        },
        protocol: 'UniversalAI v1.2',
        status: 'Operational'
    });
}
