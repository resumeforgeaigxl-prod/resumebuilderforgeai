import { ResumeCard } from '@/components/dashboard/resume-card'
import { FileText, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CreateResumeButton } from '@/components/dashboard/create-resume-button'
import { getSession } from '@/lib/auth/jwt'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ResumeListItem {
    id: string
    title: string
    updated_at: string
    version_name?: string | null
}

export default async function ResumesPage({
    params,
    searchParams
}: {
    params: { locale: string };
    searchParams: { page?: string }
}) {
    const { locale } = params;
    const supabase = createClient()
    const session = await getSession()

    if (!session) return null;

    const page = parseInt(searchParams.page || '1');
    const limit = 8;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Fetch resumes with pagination
    const { data: resumes, error, count } = await supabase
        .from('resumes')
        .select('*', { count: 'exact' })
        .eq('user_id', session.userId)
        .order('updated_at', { ascending: false })
        .range(from, to);

    const resumeItems = (resumes ?? []) as ResumeListItem[];
    const totalPages = count ? Math.ceil(count / limit) : 0;

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-[10px] uppercase mb-2">
                         <FileText className="w-3.5 h-3.5" /> Resume Modules
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">
                        My Resumes
                    </h1>
                    <p className="text-slate-400 mt-1 font-medium italic">Protocol-ready professional identifies ({count || 0} total)</p>
                </div>

                <CreateResumeButton />
            </div>

            {error ? (
                <Card glass className="p-12 text-center border-red-500/10 bg-red-500/[0.02]">
                    <p className="font-bold text-red-400 uppercase tracking-widest text-xs">Protocol Failure: Failed to sync resumes.</p>
                </Card>
            ) : resumeItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-24 text-center glass-card border-dashed border-white/5 rounded-[3rem]">
                    <div className="w-20 h-20 mb-8 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-2xl">
                        <FileText className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Empty Repository</h3>
                    <p className="text-slate-500 mb-10 max-w-sm mx-auto text-sm leading-relaxed font-medium">
                        No resume protocols detected. Initialize your professional profile to begin the optimization cycle.
                    </p>
                    <CreateResumeButton variant="secondary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {resumeItems.map((resume) => (
                        <ResumeCard
                            key={resume.id}
                            id={resume.id}
                            title={resume.title}
                            updatedAt={resume.updated_at}
                            versionName={resume.version_name ?? undefined}
                        />
                    ))}

                    {/* Support Card */}
                    <Link href={`/${locale}/support`} className="group h-full">
                        <Card glass className="h-full border-dashed border-white/5 hover:border-indigo-500/30 p-8 transition-all flex flex-col items-center justify-center text-center group-hover:bg-indigo-500/[0.02]">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all">
                                <HelpCircle className="w-7 h-7 text-slate-500 group-hover:text-indigo-400" />
                            </div>
                            <h3 className="font-black text-white mb-2 uppercase tracking-tight text-sm">Need Intel?</h3>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest">Connect with ecosystem support</p>
                        </Card>
                    </Link>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-12 border-t border-white/5">
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className={`rounded-xl border border-white/5 bg-white/5 ${page <= 1 ? 'opacity-30 pointer-events-none' : 'hover:bg-white/10'}`}
                    >
                        <Link href={`/${locale}/resumes?page=${page - 1}`}>
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                    </Button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <Link
                                key={p}
                                href={`/${locale}/resumes?page=${p}`}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black tracking-widest transition-all border
                                    ${page === p
                                        ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {p}
                            </Link>
                        ))}
                    </div>

                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className={`rounded-xl border border-white/5 bg-white/5 ${page >= totalPages ? 'opacity-30 pointer-events-none' : 'hover:bg-white/10'}`}
                    >
                        <Link href={`/${locale}/resumes?page=${page + 1}`}>
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    )
}
