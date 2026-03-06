import { ResumeCard } from '@/components/dashboard/resume-card'
import { PlusCircle, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CreateResumeButton } from '@/components/dashboard/create-resume-button'
import { getSession } from '@/lib/auth/jwt'
import Link from 'next/link'

export default async function ResumesPage({
    params,
    searchParams
}: {
    params: { region: string; lang: string };
    searchParams: { page?: string }
}) {
    const { region, lang } = params;
    const supabase = createClient()
    const session = await getSession()

    if (!session) return null;

    const page = parseInt(searchParams.page || '1');
    const limit = 8;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Fetch resumes with pagination
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: resumes, error, count } = await (supabase as any)
        .from('resumes')
        .select('*', { count: 'exact' })
        .eq('user_id', session.userId)
        .order('updated_at', { ascending: false })
        .range(from, to);

    const totalPages = count ? Math.ceil(count / limit) : 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <FileText className="w-10 h-10 text-indigo-500" />
                        My Resumes
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Manage and optimize your professional profiles ({count || 0})</p>
                </div>

                <CreateResumeButton />
            </div>

            {error ? (
                <div className="p-12 rounded-[2.5rem] bg-red-500/5 border border-red-500/10 text-red-400 text-center">
                    <p className="font-bold">Failed to load resumes. Please try again later.</p>
                </div>
            ) : resumes?.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-slate-900/40 backdrop-blur-md border border-white/5 border-dashed rounded-[3rem]">
                    <div className="w-20 h-20 mb-6 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <PlusCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">No resumes yet</h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                        Get started by creating your first resume. You can use our AI-powered templates or start from scratch.
                    </p>
                    <CreateResumeButton variant="secondary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(resumes ?? []).map((resume: any) => (
                        <ResumeCard
                            key={resume.id}
                            id={resume.id}
                            title={resume.title}
                            updatedAt={resume.updated_at}
                        />
                    ))}

                    {/* Support Card */}
                    <Link href={`/${region}/${lang}/dashboard/support`} className="group">
                        <div className="h-full bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 rounded-[2.5rem] p-8 transition-all duration-500 flex flex-col items-center justify-center text-center group-hover:bg-indigo-500/5">
                            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <PlusCircle className="w-7 h-7 text-indigo-400 rotate-45" />
                            </div>
                            <h3 className="font-bold text-white mb-2">Need Help?</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">Submit a support ticket and we&apos;ll get back to you.</p>
                        </div>
                    </Link>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-10">
                    <Link
                        href={`/${region}/${lang}/resumes?page=${page - 1}`}
                        className={`p-3 bg-white/5 border border-white/10 rounded-xl transition-all ${page <= 1 ? 'opacity-30 pointer-events-none' : 'hover:bg-white/10'}`}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <Link
                                key={p}
                                href={`/${region}/${lang}/resumes?page=${p}`}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black transition-all border
                                    ${page === p
                                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {p}
                            </Link>
                        ))}
                    </div>

                    <Link
                        href={`/${region}/${lang}/resumes?page=${page + 1}`}
                        className={`p-3 bg-white/5 border border-white/10 rounded-xl transition-all ${page >= totalPages ? 'opacity-30 pointer-events-none' : 'hover:bg-white/10'}`}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </Link>
                </div>
            )}
        </div>
    )
}
