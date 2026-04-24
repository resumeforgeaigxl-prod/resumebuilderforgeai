export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin'; 
import { getSession } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
    console.log('[ExplainForge] Upload started');
    
    try {
        const session = await getSession();
        if (!session?.userId) {
            console.error('[ExplainForge] Unauthorized access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.error('[ExplainForge] No file found in form data');
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Use Admin client to ensure bucket exists and bypass RLS for user folder creation
        const supabase = createAdminClient();
        const bucketName = 'explainforge';
        
        // Ensure bucket exists
        const { data: bucket, error: bucketError } = await supabase.storage.getBucket(bucketName);
        if (bucketError || !bucket) {
            console.warn(`[ExplainForge] Supabase bucket '${bucketName}' not found. Attempting to create...`);
            const { error: createError } = await supabase.storage.createBucket(bucketName, {
                public: true, // Make public so AI can access via URL if needed
                fileSizeLimit: 10485760 // 10MB
            });
            
            if (createError) {
                console.error(`[ExplainForge] Failed to create bucket: ${createError.message}`);
                return NextResponse.json({ 
                    success: false, 
                    error: `Supabase bucket '${bucketName}' not found. Please create it manually in Storage.` 
                }, { status: 500 });
            }
        }

        const fileName = `${session.userId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const filePath = `uploads/${fileName}`;

        console.log(`[ExplainForge] Uploading ${file.name} to ${filePath}...`);

        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('[ExplainForge] Storage Upload Error:', uploadError.message);
            return NextResponse.json({ 
                success: false, 
                error: uploadError.message 
            }, { status: 500 });
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        console.log('[ExplainForge] Upload success:', publicUrl);

        return NextResponse.json({ 
            success: true, 
            url: publicUrl,
            fileName: file.name 
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[ExplainForge] Fatal Upload Error:', message);
        return NextResponse.json({ 
            success: false, 
            error: `Failed to upload file: ${message}` 
        }, { status: 500 });
    }
}



