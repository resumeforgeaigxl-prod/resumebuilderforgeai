import {
    PlusCircle, Brain, MessageSquareWarning, Crown,
    User as UserIcon, Sparkles, CheckCircle2, FileText,
    Briefcase, Zap, ArrowRight, Activity
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/jwt'
import Link from 'next/link'
import { PaymentSuccessBanner } from '@/components/dashboard/payment-success-banner'

export default async function DashboardPage() {
    const supabase = createClient()
    const session = await getSession()

    if (!session) return null;

    // Fetch user details for name and plan
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user } = await (supabase as any)
        .from('users')
        .select('full_name, email, plan_type, plan_end')
        .eq('id', session.userId)
        .single();

    // Fetch Summary Stats
    const [resumesRes, jobsRes, scoresRes] = await Promise.all([
        supabase.from('resumes').select('id', { count: 'exact', head: true }).eq('user_id', session.userId),
        supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('user_id', session.userId),
        supabase.from('resume_scores').select('id', { count: 'exact', head: true }).eq('user_id', session.userId),
    ]);

    const stats = {
        resumes: resumesRes.count || 0,
        jobs: jobsRes.count || 0,
        ats: scoresRes.count || 0
    };

    const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';
    const planType = user?.plan_type?.toUpperCase() || 'FREE';
    const isPlanActive = user?.plan_end ? new Date(user.plan_end) > new Date() : false;
    const activePlan = (planType !== 'FREE' && isPlanActive) ? planType : 'FREE';

    const planBadgeStyles: Record<string, string> = {
        FREE: 'bg-slate-800/50 text-slate-400 border-slate-700',
        PRO: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        PREMIUM: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        CAREER: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
            <PaymentSuccessBanner />

            {/* User Welcome & Plan Info */}
            <div className="relative overflow-hidden p-8 md:p-12 rounded-[3rem] bg-slate-900/40 border border-white/5 backdrop-blur-md group">
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-indigo-600/15 transition-all duration-700" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-8">
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/30 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-2xl">
                                {activePlan === 'FREE' ? (
                                    <UserIcon className="w-12 h-12 text-slate-400" />
                                ) : (
                                    <Crown className="w-12 h-12 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
                                )}
                            </div>
                            {activePlan !== 'FREE' && (
                                <div className="absolute -top-3 -right-3">
                                    <Sparkles className="w-8 h-8 text-amber-400 animate-bounce" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                Overview Dashboard
                            </p>
                            <div className="flex flex-col gap-2">
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter Otros">
                                    Welcome back, {displayName.split(' ')[0]}!
                                </h1>
                                <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest w-fit ${planBadgeStyles[activePlan] || planBadgeStyles.FREE}`}>
                                    {activePlan} Membership
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {activePlan === 'FREE' ? (
                            <Link href="/#pricing" className="px-8 py-4 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-600/30">
                                Unlock Premium Access
                            </Link>
                        ) : (
                            <div className="text-right p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Status</p>
                                <p className="text-sm text-emerald-400 font-black flex items-center gap-2 justify-end">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Account Active
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/15 relative overflow-hidden group hover:bg-indigo-500/10 transition-all">
                    <Activity className="absolute bottom-[-10px] right-[-10px] w-24 h-24 text-indigo-500/10 group-hover:scale-110 transition-transform" />
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><FileText className="w-6 h-6" /></div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Resumes Created</h3>
                    </div>
                    <div className="text-5xl font-black text-white tracking-tight">{stats.resumes}</div>
                    <p className="text-xs text-slate-500 mt-2 font-bold">Manage your profile builds</p>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/15 relative overflow-hidden group hover:bg-emerald-500/10 transition-all">
                    <Activity className="absolute bottom-[-10px] right-[-10px] w-24 h-24 text-emerald-500/10 group-hover:scale-110 transition-transform" />
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400"><Briefcase className="w-6 h-6" /></div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Jobs Applied</h3>
                    </div>
                    <div className="text-5xl font-black text-white tracking-tight">{stats.jobs}</div>
                    <p className="text-xs text-slate-500 mt-2 font-bold">Tracking your applications</p>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-purple-500/5 border border-purple-500/15 relative overflow-hidden group hover:bg-purple-500/10 transition-all">
                    <Activity className="absolute bottom-[-10px] right-[-10px] w-24 h-24 text-purple-500/10 group-hover:scale-110 transition-transform" />
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400"><Zap className="w-6 h-6" /></div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">ATS Checks</h3>
                    </div>
                    <div className="text-5xl font-black text-white tracking-tight">{stats.ats}</div>
                    <p className="text-xs text-slate-500 mt-2 font-bold">Optimization sessions</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
                <h2 className="text-2xl font-black text-white tracking-tight ml-2">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Link href="/resumes" className="group">
                        <div className="p-8 rounded-[3rem] bg-slate-900/40 border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <PlusCircle className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-black text-white mb-2 tracking-tight group-hover:text-indigo-400 transition-colors">Create Resume</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 px-4">Build an ATS-optimized resume in minutes with AI assistance.</p>
                            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-400 group-hover:translate-x-1 transition-transform">Get Started <ArrowRight className="w-3 h-3" /></span>
                        </div>
                    </Link>

                    <Link href="/jobs" className="group">
                        <div className="p-8 rounded-[3rem] bg-slate-900/40 border border-white/5 hover:border-blue-500/30 transition-all flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Briefcase className="w-8 h-8 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-black text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors">Browse Jobs</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 px-4">Find your next big break from 1000+ curated tech roles.</p>
                            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-400 group-hover:translate-x-1 transition-transform">Explore Board <ArrowRight className="w-3 h-3" /></span>
                        </div>
                    </Link>

                    <Link href="/tools" className="group">
                        <div className="p-8 rounded-[3rem] bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition-all flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Brain className="w-8 h-8 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-black text-white mb-2 tracking-tight group-hover:text-purple-400 transition-colors">AI Mock Test</h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 px-4">Prepare for interviews with our AI-powered mock testing system.</p>
                            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-400 group-hover:translate-x-1 transition-transform">Practice Now <ArrowRight className="w-3 h-3" /></span>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Support Card */}
            <div className="p-10 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <MessageSquareWarning className="w-7 h-7 text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-white tracking-tight">Need technical support?</h4>
                        <p className="text-slate-500 text-sm font-medium">Our team is here to help you solve any issues with your resumes or account.</p>
                    </div>
                </div>
                <Link href="/dashboard/support" className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all">
                    Open Ticket
                </Link>
            </div>
        </div>
    )
}
