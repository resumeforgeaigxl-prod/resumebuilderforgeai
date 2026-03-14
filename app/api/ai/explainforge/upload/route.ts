import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';

export const runtime = 'nodejs'; // Use nodejs for easier multipart handling if needed, but standard Request works too

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

        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${session.userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error } = await supabase.storage
            .from('explainforge-files')
            .upload(filePath, file);

        if (error) {
            console.error('[ExplainForge Upload] Storage error:', error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('explainforge-files')
            .getPublicUrl(filePath);

        return NextResponse.json({ 
            success: true, 
            url: publicUrl,
            fileName: file.name 
        });
    } catch (err) {
        console.error('[ExplainForge Upload] Error:', err);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
