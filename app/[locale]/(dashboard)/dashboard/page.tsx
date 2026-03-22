import {
    Sparkles, FileText,
    Briefcase, Zap, ArrowRight, Activity, Calendar,
    Layout, BrainCircuit, TrendingUp, Compass, Clock, ShieldCheck, Crown, GraduationCap, Bot
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/jwt'
import Link from 'next/link'
import { PaymentSuccessBanner } from '@/components/dashboard/payment-success-banner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import StreakCard from '@/components/dashboard/StreakCard'

export default async function DashboardPage({ params }: { params: { locale: string } }) {
    const { locale } = params;
    const supabase = createClient()
    const session = await getSession()

    if (!session) return null;

    try {
        const { data: user } = await supabase
            .from('users')
            .select('full_name, email, role, plan_type, plan_end')
            .eq('id', session.userId)
            .single();

        const [resumesRes, scoreRes, interviewRes] = await Promise.all([
            supabase.from('resumes').select('id', { count: 'exact', head: true }).eq('user_id', session.userId).then(r => r, () => ({ count: 0 })),
            supabase.from('resume_scores').select('id', { count: 'exact', head: true }).eq('user_id', session.userId).then(r => r, () => ({ count: 0 })),
            supabase.from('interview_calendar').select('id', { count: 'exact', head: true }).eq('user_id', session.userId).then(r => r, () => ({ count: 0 }))
        ]);

        const displayName = user?.full_name || user?.email?.split('@')[0] || 'Member';
        const isAdmin = user?.role === 'admin';
        const plan = isAdmin ? 'ADMIN' : (user?.plan_type?.toUpperCase() || 'FREE');

        return (
            <div className="space-y-10 animate-fade-in">
                <PaymentSuccessBanner />

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-[10px] uppercase mb-2">
                             <Activity className="w-3.5 h-3.5" /> Intelligence Center
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-white">
                            Welcome, {displayName}
                        </h1>
                        <p className="text-slate-400 mt-1">Manage your professional evolution across the ecosystem.</p>
                    </div>
                    {isAdmin ? (
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                            <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest leading-none">System Admin</span>
                        </div>
                    ) : plan === 'FREE' ? (
                       <Button asChild variant="premium" size="lg" className="rounded-xl group shadow-indigo-500/20 shadow-lg">
                          <Link href={`/${locale}/dashboard/billing?plan=monthly`}>
                            Upgrade to Pro <Sparkles className="ml-2 w-4 h-4 group-hover:rotate-12 transition-transform" />
                          </Link>
                       </Button>
                    ) : (
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                            <Crown className="w-5 h-5 text-amber-400" />
                            <span className="text-sm font-bold text-amber-400 uppercase tracking-widest leading-none">{plan} Member</span>
                        </div>
                    )}
                </div>


                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard 
                        label="Total Resumes" 
                        value={resumesRes.count || 0} 
                        icon={<FileText className="text-indigo-400" />} 
                        trend="+1 this month"
                    />
                    <MetricCard 
                        label="AI Optimization" 
                        value={`${scoreRes.count ? '98%' : '0'}`} 
                        icon={<Zap className="text-yellow-400" />} 
                        trend="Top 2% Globally"
                    />
                    <MetricCard 
                        label="Scheduled Events" 
                        value={interviewRes.count || 0} 
                        icon={<Calendar className="text-emerald-400" />} 
                        trend="Upcoming activities"
                    />
                </div>

                {/* Primary Hub */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Module Grid */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h2 className="text-xl font-bold text-white tracking-tight">Forge Ecosystem</h2>
                            <Badge variant="secondary" className="bg-white/5 text-slate-400 px-3 py-1 font-bold">10 ACTIVE MODULES</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ModuleCard 
                                title="ResumeForge" 
                                desc="ATS-optimized generation with AI semantic layering." 
                                href={`/${locale}/resumes`} 
                                icon={<FileText />} 
                                color="indigo"
                            />
                            <ModuleCard 
                                title="LearnForge" 
                                desc="AI-powered video learning and roadmap insights." 
                                href={`/${locale}/learnforge`} 
                                icon={<BrainCircuit />} 
                                color="blue"
                            />
                            <ModuleCard 
                                title="CodingForge" 
                                desc="AI-driven IDE with precision problem sets." 
                                href={`/${locale}/codingforge`} 
                                icon={<Zap />} 
                                color="pink"
                            />
                            <ModuleCard 
                                title="ProjectForge" 
                                desc="Architecture blueprints and cloud deployment." 
                                href={`/${locale}/projectforge`} 
                                icon={<Layout />} 
                                color="orange"
                            />
                            <ModuleCard 
                                title="KnowledgeForge" 
                                desc="Structured technical encyclopedia for masters." 
                                href={`/${locale}/knowledgeforge`} 
                                icon={<GraduationCap />} 
                                color="emerald"
                            />
                            <ModuleCard 
                                title="MentorForge" 
                                desc="AI career coaching and strategic guidance." 
                                href={`/${locale}/mentorforge`} 
                                icon={<Bot />} 
                                color="purple"
                            />
                        </div>
                    </div>

                    {/* Secondary Panel */}
                    <div className="space-y-6">
                         <StreakCard />
                         <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <h2 className="text-xl font-bold text-white tracking-tight">System Intel</h2>
                        </div>
                        <Card glass className="bg-white/[0.01]">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-emerald-400" />
                                    Operational Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <StatusItem label="Intelligence Engine" status="Active" color="emerald" />
                                <StatusItem label="Market Signal Sync" status="Synced" color="blue" />
                                <StatusItem label="Global CDN" status="Verified" color="indigo" />
                                <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div className="text-[10px] text-slate-500 uppercase font-black leading-tight tracking-wider">
                                            Enterprise Security Enabled
                                        </div>
                                    </div>
                                    <Button asChild variant="outline" size="sm" className="w-full text-xs font-bold border-white/5 bg-white/5">
                                        <Link href={`/${locale}/tools`}>Access Advanced Tools</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Recent Intelligence Feed */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-white tracking-tight">Recent Activity Intelligence</h3>
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white font-bold">
                            Advanced Analytics Tracking
                        </Button>
                    </div>
                    <Card glass className="bg-white/[0.01] overflow-hidden border-white/5">
                        <div className="divide-y divide-white/5">
                           {[
                              { title: 'Resume Intelligence Calibration', date: '2h ago', status: 'Enhanced', icon: <TrendingUp className="text-indigo-400" /> },
                              { title: 'Coding Protocol Completion', date: 'Yesterday', status: 'Verified', icon: <Briefcase className="text-emerald-400" /> },
                              { title: 'Cloud Infrastructure Design', date: 'Feb 12', status: 'Live', icon: <Compass className="text-purple-400" /> }
                           ].map((item, i) => (
                              <div key={i} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-all group cursor-default">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                       <div className="w-5 h-5 opacity-60 group-hover:opacity-100 transition-opacity">{item.icon}</div>
                                    </div>
                                    <div>
                                       <h4 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                                       <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                                          <Clock className="w-3 h-3" />
                                          {item.date}
                                       </div>
                                    </div>
                                 </div>
                                 <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-white/5 bg-white/[0.05] text-slate-400 py-1">
                                    {item.status}
                                 </Badge>
                              </div>
                           ))}
                        </div>
                    </Card>
                </section>
            </div>
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return <div className="p-10 text-rose-500 font-bold glass-card">Ecosystem Linkage Error: {message}</div>;
    }
}

function MetricCard({ label, value, icon, trend }: { label: string, value: string | number, icon: React.ReactNode, trend: string }) {
    return (
        <Card glass className="p-8 border-white/5 hover:border-white/10 transition-all group overflow-hidden relative">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl group-hover:bg-white/[0.04] transition-colors" />
            <div className="flex items-start justify-between mb-6">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">{icon}</div>
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{trend}</div>
            </div>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-black mb-1">{label}</p>
            <p className="text-4xl font-black text-white tracking-tighter leading-none">{value}</p>
        </Card>
    );
}

function ModuleCard({ title, desc, href, icon, color }: { title: string, desc: string, href: string, icon: React.ReactNode, color: string }) {
    const colorStyles: Record<string, string> = {
        indigo: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20 shadow-indigo-500/10',
        blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20 shadow-blue-500/10',
        pink: 'text-pink-400 bg-pink-400/10 border-pink-400/20 shadow-pink-500/10',
        orange: 'text-orange-400 bg-orange-400/10 border-orange-400/20 shadow-orange-500/10',
        emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20 shadow-emerald-500/10',
        purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20 shadow-purple-500/10',
    };

    return (
        <Link href={href}>
            <Card glass className="p-6 group border-white/5 hover:border-white/10 hover:bg-white/[0.03] transition-all h-full">
                <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl border ${colorStyles[color]} group-hover:scale-110 transition-transform shadow-lg`}>
                        <div className="w-5 h-5">{icon}</div>
                    </div>
                </div>
                <h3 className="font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight text-sm mb-2">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6">{desc}</p>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-700 group-hover:text-indigo-400 uppercase tracking-widest transition-colors mt-auto">
                    Initialize Protocol <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
            </Card>
        </Link>
    );
}

function StatusItem({ label, status, color }: { label: string, status: string, color: string }) {
    const colors: Record<string, string> = {
        emerald: 'text-emerald-400 bg-emerald-400/10',
        blue: 'text-blue-400 bg-blue-400/10',
        indigo: 'text-indigo-400 bg-indigo-400/10',
    };
    
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-xs text-slate-400 font-medium">{label}</span>
            <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${colors[color]} flex items-center gap-1.5`}>
                <div className={`w-1 h-1 rounded-full bg-current ${status === 'Active' ? 'animate-pulse' : ''}`} />
                {status}
            </div>
        </div>
    );
}
