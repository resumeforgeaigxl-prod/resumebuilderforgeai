export const dynamic = 'force-dynamic';
import { ResumeCard } from '@/components/dashboard/resume-card'
import { FileText, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CreateResumeButton } from '@/components/dashboard/create-resume-button'
import { getSession } from '@/lib/auth/jwt'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

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
        <div className="space-y-10 animate-fade-in text-[#171717]">
            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EBEBEB] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#8F8F8F] font-mono text-[11px] uppercase tracking-wider mb-2 font-medium">
                        <FileText className="w-3.5 h-3.5 text-[#171717]" /> Intelligence Core
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#171717]">ResumeForge</h1>
                    <p className="text-[#4D4D4D] mt-2 text-sm md:text-base">Protocol-ready professional identifiers and neural document optimization ({count || 0} active).</p>
                </div>

                <div className="flex items-center gap-4">
                    <CreateResumeButton />
                    <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-[#EBEBEB] shadow-sm">
                        <div className="text-[10px] text-[#8F8F8F] font-mono uppercase tracking-normal">Vault Signal</div>
                        <span className="border border-[#EBEBEB] bg-[#FAFAFA] text-[#0070F3] text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full">Encrypted</span>
                    </div>
                </div>
            </header>


            {error ? (
                <div className="p-8 text-center border border-red-100 bg-red-50 text-red-600 rounded-xl">
                    <p className="font-semibold text-sm">Protocol Failure: Failed to sync resumes.</p>
                </div>
            ) : resumeItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-white border border-[#EBEBEB] rounded-xl shadow-sm">
                    <div className="w-16 h-16 mb-6 rounded-xl bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center text-[#171717] shadow-sm">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#171717] mb-2 tracking-tight">Empty Repository</h3>
                    <p className="text-[#8F8F8F] mb-8 max-w-sm mx-auto text-sm leading-relaxed font-normal">
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
                        <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 hover:shadow-[0_2px_2px_rgba(0,0,0,0.04),0_8px_16px_-4px_rgba(0,0,0,0.06)] hover:border-[#171717]/25 transition-all h-full flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center mb-5 group-hover:border-[#171717] transition-all">
                                <HelpCircle className="w-6 h-6 text-[#8F8F8F] group-hover:text-[#171717] transition-colors" />
                            </div>
                            <h3 className="font-semibold text-[#171717] mb-1 tracking-tight text-sm">Need Intel?</h3>
                            <p className="text-[11px] text-[#8F8F8F] font-medium transition-colors group-hover:text-[#0070F3]">Connect with ecosystem support</p>
                        </div>
                    </Link>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-12 border-t border-[#EBEBEB]">
                    <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className={`rounded-lg border border-[#EBEBEB] bg-white text-[#4D4D4D] ${page <= 1 ? 'opacity-30 pointer-events-none' : 'hover:bg-[#FAFAFA] hover:text-[#171717]'}`}
                    >
                        <Link href={`/${locale}/resumes?page=${page - 1}`}>
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                    </Button>

                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <Link
                                key={p}
                                href={`/${locale}/resumes?page=${p}`}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium transition-all border
                                    ${page === p
                                        ? 'bg-[#171717] border-[#171717] text-white font-semibold'
                                        : 'bg-white border-[#EBEBEB] text-[#4D4D4D] hover:bg-[#FAFAFA] hover:text-[#171717]'
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
                        className={`rounded-lg border border-[#EBEBEB] bg-white text-[#4D4D4D] ${page >= totalPages ? 'opacity-30 pointer-events-none' : 'hover:bg-[#FAFAFA] hover:text-[#171717]'}`}
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
