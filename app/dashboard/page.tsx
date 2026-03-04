import { ResumeCard } from '@/components/dashboard/resume-card'
import { PlusCircle, Brain, Globe, MessageSquareWarning, Crown, User as UserIcon, Sparkles, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CreateResumeButton } from '@/components/dashboard/create-resume-button'
import { getSession } from '@/lib/auth/jwt'
import Link from 'next/link'
import { JobBoard } from '@/components/jobs/job-board'
import { PaymentSuccessBanner } from '@/components/dashboard/payment-success-banner'

export default async function DashboardPage() {
    const supabase = createClient()
    const session = await getSession()

    if (!session) {
        return null
    }

    // Fetch user details for name and plan
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user } = await (supabase as any)
        .from('users')
        .select('full_name, email, plan_type, plan_end')
        .eq('id', session.userId)
        .single();

    // Fetch resumes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: resumes, error } = await (supabase as any)
        .from('resumes')
        .select('*')
        .eq('user_id', session.userId)
        .order('updated_at', { ascending: false })

    const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';
    const planType = user?.plan_type?.toUpperCase() || 'FREE';

    // Check if plan is active
    const isPlanActive = user?.plan_end ? new Date(user.plan_end) > new Date() : false;
    const activePlan = (planType !== 'FREE' && isPlanActive) ? planType : 'FREE';

    const planBadgeStyles: Record<string, string> = {
        FREE: 'bg-slate-800/50 text-slate-400 border-slate-700',
        PRO: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        PREMIUM: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        CAREER: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };

    return (
        <div className="space-y-8">
            <PaymentSuccessBanner />

            {/* User Welcome & Plan Info */}
            <div className="relative overflow-hidden p-8 rounded-[2rem] bg-slate-900/40 border border-slate-800/60 backdrop-blur-md group">
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-indigo-600/20 transition-all duration-700" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/5 shadow-inner">
                                {activePlan === 'FREE' ? (
                                    <UserIcon className="w-8 h-8 text-slate-400" />
                                ) : (
                                    <Crown className="w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                                )}
                            </div>
                            {activePlan !== 'FREE' && (
                                <div className="absolute -top-2 -right-2">
                                    <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                Active Dashboard
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <h1 className="text-3xl font-black text-white tracking-tight">
                                    {displayName}
                                </h1>
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${planBadgeStyles[activePlan] || planBadgeStyles.FREE}`}>
                                    {activePlan} Membership
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {activePlan === 'FREE' ? (
                            <Link href="/#pricing" className="px-6 py-3 rounded-2xl bg-white text-black text-sm font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5">
                                Upgrade to Pro
                            </Link>
                        ) : (
                            <div className="text-right hidden sm:block">
                                <p className="text-xs text-slate-500 font-medium">Subscription Status</p>
                                <p className="text-sm text-emerald-400 font-bold flex items-center gap-1 justify-end">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Active Account
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        My Resumes
                    </h2>
                    <p className="text-slate-400 mt-1 text-sm">Manage and optimize your professional profiles</p>
                </div>

                <CreateResumeButton />
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

            {/* JobForgeAI CTA */}
            <Link href="/jobforgeai" className="block">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-600/15 to-red-600/15 border border-orange-500/20 hover:border-orange-400/40 transition-all cursor-pointer group">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="p-3 bg-orange-500/15 rounded-xl shrink-0">
                            <MessageSquareWarning className="w-6 h-6 text-orange-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-white group-hover:text-orange-300 transition-colors">JobForgeAI Assistant</h3>
                            <p className="text-sm text-slate-400 mt-0.5">Your strict AI coach for resume optimization, technical problem solving, and interview prep.</p>
                        </div>
                        <span className="text-orange-400 text-sm font-medium group-hover:translate-x-1 transition-transform">Start →</span>
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
                    <Link href="/dashboard/support" className="group">
                        <div className="h-full bg-indigo-500/5 border border-indigo-500/10 hover:border-indigo-500/30 rounded-2xl p-6 transition-all flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <PlusCircle className="w-6 h-6 text-indigo-400 rotate-45" />
                            </div>
                            <h3 className="font-bold text-white mb-1">Need Help?</h3>
                            <p className="text-xs text-slate-500">Submit a support ticket and we&apos;ll get back to you.</p>
                        </div>
                    </Link>
                </div>
            )}

            <div className="pt-10 border-t border-white/5">
                <JobBoard />
            </div>
        </div>
    )
}
