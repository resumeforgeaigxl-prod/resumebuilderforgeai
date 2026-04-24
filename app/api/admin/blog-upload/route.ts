export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth/jwt';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const supabase = createAdminClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        // Ensure bucket exists (This is a safety check, though best to create via SQL)
        const { data: bucket, error: bucketError } = await supabase.storage.getBucket('blog-media');
        if (bucketError || !bucket) {
            await supabase.storage.createBucket('blog-media', {
                public: true,
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/quicktime'],
                fileSizeLimit: 52428800 // 50MB
            });
        }

        const { error: uploadError } = await supabase.storage
            .from('blog-media')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('[Blog Media Upload] Storage error:', uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('blog-media')
            .getPublicUrl(filePath);

        return NextResponse.json({ 
            success: true, 
            url: publicUrl,
            fileName: file.name 
        });
    } catch (err: unknown) {
        console.error('[Blog Media Upload] Error:', err);
        return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 });
    }
}



