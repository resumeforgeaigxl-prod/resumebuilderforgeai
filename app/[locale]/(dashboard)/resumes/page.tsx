export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import { UnifiedResumeWorkspace } from '@/components/resume/UnifiedResumeWorkspace';
import { Loader2 } from '@/components/icons';

interface ResumeListItem {
    id: string;
    title: string;
    updated_at: string;
    version_name?: string | null;
}

export default async function ResumesPage({
    params,
    searchParams
}: {
    params: { locale: string };
    searchParams: { page?: string; tab?: string; q?: string; sort?: string };
}) {
    const { locale } = params;
    const session = await getSession();

    if (!session) {
        redirect(`/${locale}/login`);
    }

    const supabase = createClient();
    const page = Math.max(1, Math.floor(Number(searchParams.page) || 1));
    const query = (searchParams.q || '').trim().slice(0, 100);
    const sort = ['oldest', 'title'].includes(searchParams.sort || '') ? searchParams.sort : 'updated';
    const limit = 8;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let resumeItems: ResumeListItem[] = [];
    let count = 0;
    let error: string | null = null;
    let primaryResume: ResumeListItem | null = null;

    try {
        const primary = await supabase.from('resumes').select('*').eq('user_id', session.userId).order('updated_at', { ascending: false }).limit(1).maybeSingle();
        primaryResume = primary.data;
        let request = supabase
            .from('resumes')
            .select('*', { count: 'exact' })
            .eq('user_id', session.userId);
        if (query) {
            request = request.ilike('title', `%${query.replace(/[\\%_]/g, '\\$&')}%`);
        }
        const res = await request
            .order(sort === 'title' ? 'title' : 'updated_at', { ascending: sort !== 'updated' })
            .order('id', { ascending: true })
            .range(from, to);

        resumeItems = (res.data ?? []) as ResumeListItem[];
        count = res.count ?? 0;
        error = res.error?.message ?? null;
    } catch (err: unknown) {
        console.error('[ResumesPage] Data fetch error:', err);
        error = err instanceof Error ? err.message : 'Unable to load resumes';
    }

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 text-[#8B5CF6] animate-spin" />
                </div>
            }
        >
            <UnifiedResumeWorkspace
                resumes={resumeItems}
                primaryResume={primaryResume}
                totalCount={count}
                currentPage={page}
                totalPages={totalPages}
                locale={locale}
                initialTab={searchParams.tab}
                error={error}
            />
        </Suspense>
    );
}
