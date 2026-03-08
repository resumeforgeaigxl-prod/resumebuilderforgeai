import {
    PlusCircle, MessageSquareWarning, Crown,
    User as UserIcon, Sparkles, CheckCircle2, FileText,
    Briefcase, Zap, ArrowRight, Activity, Calendar, ShieldCheck,
    Compass, TrendingUp, Bell, Building2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/jwt'
import Link from 'next/link'
import { PaymentSuccessBanner } from '@/components/dashboard/payment-success-banner'

type UpcomingInterview = {
    company_name: string;
    role_name: string;
    interview_date: string;
}

export default async function DashboardPage({ params }: { params: { region: string, lang: string } }) {
    const { region, lang } = params;
    const supabase = createClient()
    const session = await getSession()

    try {
        if (!session) return null;

        // Fetch user details for name, role and plan
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: user } = await (supabase as any)
            .from('users')
            .select('full_name, email, role, plan_type, plan_end')
            .eq('id', session.userId)
            .single();

        // Fetch Summary Stats with robust error handling
        const [resumesRes, jobsRes, scoresRes, upcomingRes] = await Promise.all([
            supabase.from('resumes').select('id', { count: 'exact', head: true }).eq('user_id', session.userId).then(r => r, e => ({ count: 0, error: e })),
            supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('user_id', session.userId).then(r => r, e => ({ count: 0, error: e })),
            supabase.from('resume_scores').select('id', { count: 'exact', head: true }).eq('user_id', session.userId).then(r => r, e => ({ count: 0, error: e })),
            supabase.from('interview_calendar')
                .select('*')
                .eq('user_id', session.userId)
                .gte('interview_date', new Date().toISOString())
                .order('interview_date', { ascending: true })
                .limit(1)
                .then(r => r, e => ({ data: [], error: e }))
        ]);

        const upcomingInterviews: UpcomingInterview[] = Array.isArray(upcomingRes.data)
            ? (upcomingRes.data as UpcomingInterview[])
            : [];

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
                                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
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
                                <Link href={`/${region}/${lang}/#pricing`} className="px-8 py-4 rounded-[2rem] bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-black transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-600/30">
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

                {/* Upcoming Interview HUD */}
                {upcomingInterviews.length > 0 && (
                    <div className="p-10 rounded-[3rem] bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -z-10 group-hover:scale-110 transition-transform duration-700" />

                        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                            <div className="flex-1 text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">
                                    <Calendar className="w-4 h-4" /> Next Interview Encounter
                                </div>
                                <h2 className="text-4xl font-black text-white italic tracking-tighter mb-4">
                                    Prepare for {upcomingInterviews[0].company_name}
                                </h2>
                                <p className="text-slate-400 font-medium text-lg leading-relaxed">
                                    Target Role: <span className="text-white font-bold">{upcomingInterviews[0].role_name}</span> &bull;
                                    Interview is on <span className="text-indigo-400 font-black">{new Date(upcomingInterviews[0].interview_date).toLocaleDateString()}</span>
                                </p>
                            </div>

                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href={`/${region}/${lang}/dashboard/interview-prep/${upcomingInterviews[0].company_name.toLowerCase()}`} className="px-8 py-4 bg-white text-slate-950 font-black rounded-2xl transition-all shadow-xl hover:shadow-indigo-500/20 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5" /> View Questions
                                </Link>
                                <Link href={`/${region}/${lang}/dashboard/interview-prep/${upcomingInterviews[0].company_name.toLowerCase()}`} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all flex items-center gap-2">
                                    <PlusCircle className="w-5 h-5" /> Start Practice
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

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

                {/* New components moved to separate sidebar pages */}

                {/* Quick Actions & AI Features */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white tracking-tight ml-2">Smart Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <Link href={`/${region}/${lang}/resumes`} className="group">
                            <div className="h-full p-8 rounded-[3rem] bg-slate-900/40 border border-white/5 hover:border-indigo-500/30 transition-all flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <PlusCircle className="w-8 h-8 text-indigo-400" />
                                </div>
                                <h3 className="text-lg font-black text-white mb-2 tracking-tight group-hover:text-indigo-400 transition-colors">Resume AI</h3>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-6 px-4 uppercase tracking-widest">Build Optimized Resumes</p>
                                <span className="mt-auto inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-indigo-400 group-hover:translate-x-1 transition-transform">Open <ArrowRight className="w-3 h-3" /></span>
                            </div>
                        </Link>

                        <Link href={`/${region}/${lang}/roadmap`} className="group">
                            <div className="h-full p-8 rounded-[3rem] bg-slate-900/40 border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Compass className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-black text-white mb-2 tracking-tight group-hover:text-emerald-400 transition-colors">Career Path</h3>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-6 px-4 uppercase tracking-widest">AI Roadmaps & Goals</p>
                                <span className="mt-auto inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400 group-hover:translate-x-1 transition-transform">Route <ArrowRight className="w-3 h-3" /></span>
                            </div>
                        </Link>

                        <Link href={`/${region}/${lang}/interview-intelligence`} className="group">
                            <div className="h-full p-8 rounded-[3rem] bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition-all flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-8 h-8 text-purple-400" />
                                </div>
                                <h3 className="text-lg font-black text-white mb-2 tracking-tight group-hover:text-purple-400 transition-colors">Skill Hub</h3>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-6 px-4 uppercase tracking-widest">Weakness & Scores</p>
                                <span className="mt-auto inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-purple-400 group-hover:translate-x-1 transition-transform">Track <ArrowRight className="w-3 h-3" /></span>
                            </div>
                        </Link>

                        <Link href={`/${region}/${lang}/company-prep-interview`} className="group">
                            <div className="h-full p-8 rounded-[3rem] bg-slate-900/40 border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Building2 className="w-8 h-8 text-cyan-400" />
                                </div>
                                <h3 className="text-lg font-black text-white mb-2 tracking-tight group-hover:text-cyan-400 transition-colors">Company Prep</h3>
                                <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-6 px-4 uppercase tracking-widest">Role-Based Interview Plans</p>
                                <span className="mt-auto inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-400 group-hover:translate-x-1 transition-transform">Prepare <ArrowRight className="w-3 h-3" /></span>
                            </div>
                        </Link>

                        {(user?.role === 'recruiter' || user?.role === 'admin') ? (
                            <Link href={`/${region}/${lang}/recruiter/dashboard`} className="group">
                                <div className="h-full p-8 rounded-[3rem] bg-indigo-600 border border-white/10 hover:bg-indigo-500 transition-all flex flex-col items-center text-center shadow-2xl shadow-indigo-600/30">
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform">
                                        <ShieldCheck className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-black text-white mb-2 tracking-tight">Recruiter Hub</h3>
                                    <p className="text-[10px] text-indigo-100 font-black mb-6 px-4 uppercase tracking-[0.2em]">Sourcing & Talent</p>
                                    <span className="mt-auto inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white group-hover:translate-x-1 transition-transform">Enter Hub <ArrowRight className="w-3 h-3" /></span>
                                </div>
                            </Link>
                        ) : (
                            <Link href={`/${region}/${lang}/job-alerts`} className="group">
                                <div className="h-full p-8 rounded-[3rem] bg-slate-900/40 border border-white/5 hover:border-amber-500/30 transition-all flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Bell className="w-8 h-8 text-amber-400" />
                                    </div>
                                    <h3 className="text-lg font-black text-white mb-2 tracking-tight group-hover:text-amber-400 transition-colors">Alerts</h3>
                                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-6 px-4 uppercase tracking-widest">New Role Notifications</p>
                                    <span className="mt-auto inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400 group-hover:translate-x-1 transition-transform">Manage <ArrowRight className="w-3 h-3" /></span>
                                </div>
                            </Link>
                        )}
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
                    <Link href={`/${region}/${lang}/dashboard/support`} className="px-10 py-4 bg-white/10 hover:bg-white/20 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all">
                        Open Ticket
                    </Link>
                </div>
            </div>
        );
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown dashboard error';
        const errorStack = err instanceof Error ? err.stack : undefined;
        return (
            <div className="p-10 bg-slate-900 text-rose-500 border border-rose-500/20 rounded-3xl selection:bg-rose-500/20">
                <h2 className="text-2xl font-black mb-4 flex items-center gap-3">
                    <MessageSquareWarning className="w-8 h-8" />
                    Critical Dashboard Error
                </h2>
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl mb-6">
                    <p className="font-bold text-lg">{errorMessage}</p>
                </div>
                <pre className="text-[10px] font-mono bg-black/50 p-6 rounded-2xl overflow-auto whitespace-pre-wrap text-slate-400 border border-white/5">
                    {errorStack}
                </pre>
                <div className="mt-8">
                    <Link href={`/${region}/${lang}/dashboard`} className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all inline-block">
                        Reload Dashboard
                    </Link>
                </div>
            </div>
        );
    }
}
