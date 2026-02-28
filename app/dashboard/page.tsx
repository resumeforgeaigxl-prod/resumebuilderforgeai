import { ResumeCard } from '@/components/dashboard/resume-card'
import { PlusCircle, Brain, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CreateResumeButton } from '@/components/dashboard/create-resume-button'
import { getSession } from '@/lib/auth/jwt'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = createClient()
    const session = await getSession()

    if (!session) {
        return null
    }

    // Fetch resumes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: resumes, error } = await (supabase as any)
        .from('resumes')
        .select('*')
        .eq('user_id', session.userId)
        .order('updated_at', { ascending: false })

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        My Resumes
                    </h1>
                    <p className="text-slate-400 mt-2">Manage and optimize your professional profiles</p>
                </div>

                <CreateResumeButton userId={session.userId} />
            </div>

            {/* Mock Test CTA */}
            <Link href="/mock-test" className="block">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-600/15 to-blue-600/15 border border-purple-500/20 hover:border-purple-400/40 transition-all cursor-pointer group">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="p-3 bg-purple-500/15 rounded-xl shrink-0">
                            <Brain className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors">AI Mock Interview Test</h3>
                            <p className="text-sm text-slate-400 mt-0.5">Generate 50 role-specific questions from any job description — Technical, Aptitude, Verbal, Logical &amp; HR.</p>
                        </div>
                        <span className="text-purple-400 text-sm font-medium group-hover:translate-x-1 transition-transform">Start →</span>
                    </div>
                </div>
            </Link>

            {/* Portfolio CTA */}
            <Link href="/portfolio" className="block">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-600/15 to-teal-600/15 border border-emerald-500/20 hover:border-emerald-400/40 transition-all cursor-pointer group">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="p-3 bg-emerald-500/15 rounded-xl shrink-0">
                            <Globe className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white group-hover:text-emerald-300 transition-colors">AI Portfolio Builder</h3>
                            <p className="text-sm text-slate-400 mt-0.5">Generate a professional, hosted portfolio website instantly from your resume. Share with recruiters.</p>
                        </div>
                        <span className="text-emerald-400 text-sm font-medium group-hover:translate-x-1 transition-transform">Start →</span>
                    </div>
                </div>
            </Link>

            {error ? (
                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-center">
                    <p>Failed to load resumes. Please try again later.</p>
                </div>
            ) : resumes?.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/50 backdrop-blur-sm border border-slate-800 border-dashed rounded-3xl">
                    <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
                        <PlusCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-300 mb-2">No resumes yet</h3>
                    <p className="text-slate-500 mb-6 max-w-md">
                        Get started by creating your first resume. You can upload an existing file or start from scratch.
                    </p>
                    <CreateResumeButton userId={session.userId} variant="secondary" />
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
                </div>
            )}
        </div>
    )
}
