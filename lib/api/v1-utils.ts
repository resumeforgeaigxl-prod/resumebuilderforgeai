import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    status: number;
}

/**
 * Validates the API key from the Authorization header and checks usage limits.
 */
export async function validateApiKey(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { 
            isValid: false, 
            error: 'Missing or invalid Authorization header. Use "Bearer API_KEY".',
            status: 401 
        };
    }

    const apiKey = authHeader.split(' ')[1];
    if (!apiKey) {
        return { isValid: false, error: 'API key is required.', status: 401 };
    }

    const supabase = createAdminClient();
    
    // Check if the key exists and is active
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: keyData, error: keyError } = await (supabase as any)
        .from('api_keys')
        .select('id, user_id, usage_count, usage_limit, status')
        .eq('api_key', apiKey)
        .single();

    if (keyError || !keyData) {
        return { isValid: false, error: 'Invalid API key.', status: 403 };
    }

    if (keyData.status !== 'active') {
        return { isValid: false, error: 'API key has been revoked.', status: 403 };
    }

    if (keyData.usage_count >= keyData.usage_limit) {
        return { isValid: false, error: 'Usage limit exceeded. Please upgrade your plan.', status: 429 };
    }

    // Apply Rate Limiting (100 requests per minute by default for now)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { allowed, remaining } = rateLimit({
        key: `api_v1_${apiKey}_${ip}`,
        limit: 100,
        windowMs: 60 * 1000 // 1 minute
    });

    if (!allowed) {
        return { isValid: false, error: 'Rate limit exceeded. Try again in a minute.', status: 429 };
    }

    // Increment usage asynchronously (non-blocking for response)
    // In a real production app, you might want to batch this or use a more robust queue
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('increment_api_usage', { p_api_key: apiKey }).then(({ error }: { error: unknown }) => {
        if (error) console.error('[API v1] Failed to increment usage:', error);
    });

    return { 
        isValid: true, 
        userId: keyData.user_id, 
        keyId: keyData.id,
        remaining 
    };
}

/**
 * Helper to handle AI responses (parsed JSON from text)
 */
export function handleAiResponse(result: unknown) {
    // If it's the full AIResponse wrapper
    if (result && typeof result === 'object' && 'text' in result) {
        try {
            return JSON.parse((result as { text: string }).text);
        } catch {
            return { content: (result as { text: string }).text };
        }
    }
    // If it's already parsed
    return result;
}

/**
 * Helper to create standard JSON responses
 */
export function createApiResponse<T>(data: T, message: string = 'Success', status: number = 200) {
    return NextResponse.json({
        success: true,
        data: handleAiResponse(data),
        message
    }, { status });
}

/**
 * Helper to create error JSON responses
 */
export function createApiError(error: string, status: number = 400) {
    return NextResponse.json({
        success: false,
        error,
        message: error
    }, { status });
}
