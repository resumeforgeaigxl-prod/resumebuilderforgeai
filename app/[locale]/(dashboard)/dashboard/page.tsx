export const dynamic = 'force-dynamic';
import {
    FileText,
    Briefcase, Zap, ArrowRight, Activity, Calendar,
    Layout, BrainCircuit, TrendingUp, Compass, Clock, ShieldCheck, Crown, GraduationCap, Bot
, Wand2 } from 'lucide-react'
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
            <div className="space-y-10 animate-fade-in text-[#171717]">
                <PaymentSuccessBanner />

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-[#8F8F8F] font-mono text-[11px] uppercase tracking-wider mb-2 font-medium">
                             <Activity className="w-3.5 h-3.5 text-[#171717]" /> Intelligence Center
                        </div>
                        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#171717]">
                            Welcome, {displayName}
                        </h1>
                        <p className="text-[#4D4D4D] mt-1 text-sm md:text-base">Manage your professional evolution across the ecosystem.</p>
                    </div>
                    {isAdmin ? (
                        <div className="flex items-center gap-2.5 bg-white border border-[#EBEBEB] px-3.5 py-1.5 rounded-full shadow-sm">
                            <ShieldCheck className="w-4 h-4 text-[#171717]" />
                            <span className="text-xs font-semibold text-[#171717] uppercase tracking-wider leading-none">System Admin</span>
                        </div>
                    ) : plan === 'FREE' ? (
                        <Link 
                           href={`/${locale}/dashboard/billing?plan=monthly`}
                           className="inline-flex items-center justify-center gap-2 px-6 h-10 rounded-full bg-[#171717] hover:bg-[#2e2e2e] text-white text-sm font-medium transition-colors border border-[#171717] shadow-sm shrink-0"
                        >
                          Upgrade to Pro <Wand2 className="w-4 h-4 text-white" />
                        </Link>
                    ) : (
                        <div className="flex items-center gap-2.5 bg-white border border-[#EBEBEB] px-3.5 py-1.5 rounded-full shadow-sm">
                            <Crown className="w-4 h-4 text-[#0070F3]" />
                            <span className="text-xs font-semibold text-[#171717] uppercase tracking-wider leading-none">{plan} Member</span>
                        </div>
                    )}
                </div>


                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard 
                        label="Total Resumes" 
                        value={resumesRes.count || 0} 
                        icon={<FileText className="text-[#171717] w-5 h-5" />} 
                        trend="+1 this month"
                    />
                    <MetricCard 
                        label="AI Optimization" 
                        value={`${scoreRes.count ? '98%' : '0'}`} 
                        icon={<Zap className="text-[#171717] w-5 h-5" />} 
                        trend="Top 2% Globally"
                    />
                    <MetricCard 
                        label="Scheduled Events" 
                        value={interviewRes.count || 0} 
                        icon={<Calendar className="text-[#171717] w-5 h-5" />} 
                        trend="Upcoming activities"
                    />
                </div>

                {/* Primary Hub */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Module Grid */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-4">
                            <h2 className="text-xl font-semibold text-[#171717] tracking-tight">Forge Ecosystem</h2>
                            <span className="bg-white border border-[#EBEBEB] text-[#4D4D4D] px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">10 ACTIVE MODULES</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ModuleCard 
                                title="ResumeForge" 
                                desc="ATS-optimized generation with AI semantic layering." 
                                href={`/${locale}/resumes`} 
                                icon={<FileText className="w-5 h-5" />} 
                                color="indigo"
                            />
                            <ModuleCard 
                                title="LearnForge" 
                                desc="AI-powered video learning and roadmap insights." 
                                href={`/${locale}/learnforge`} 
                                icon={<BrainCircuit className="w-5 h-5" />} 
                                color="blue"
                            />
                            <ModuleCard 
                                title="CodingForge" 
                                desc="AI-driven IDE with precision problem sets." 
                                href={`/${locale}/codingforge`} 
                                icon={<Zap className="w-5 h-5" />} 
                                color="pink"
                            />
                            <ModuleCard 
                                title="ProjectForge" 
                                desc="Architecture blueprints and cloud deployment." 
                                href={`/${locale}/projectforge`} 
                                icon={<Layout className="w-5 h-5" />} 
                                color="orange"
                            />
                            <ModuleCard 
                                title="KnowledgeForge" 
                                desc="Structured technical encyclopedia for masters." 
                                href={`/${locale}/knowledgeforge`} 
                                icon={<GraduationCap className="w-5 h-5" />} 
                                color="emerald"
                            />
                            <ModuleCard 
                                title="MentorForge" 
                                desc="AI career coaching and strategic guidance." 
                                href={`/${locale}/mentorforge`} 
                                icon={<Bot className="w-5 h-5" />} 
                                color="purple"
                            />
                        </div>
                    </div>

                    {/* Secondary Panel */}
                    <div className="space-y-6">
                         <StreakCard />
                         <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-4">
                            <h2 className="text-xl font-semibold text-[#171717] tracking-tight">System Intel</h2>
                        </div>
                        <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 hover:shadow-[0_2px_2px_rgba(0,0,0,0.04),0_8px_16px_-4px_rgba(0,0,0,0.06)] transition-all">
                            <div className="flex items-center gap-2 font-semibold text-sm text-[#171717] mb-6">
                                <Activity className="w-4 h-4 text-[#0070F3]" />
                                Operational Status
                            </div>
                            <div className="space-y-4">
                                <StatusItem label="Intelligence Engine" status="Active" color="emerald" />
                                <StatusItem label="Market Signal Sync" status="Synced" color="blue" />
                                <StatusItem label="Global CDN" status="Verified" color="indigo" />
                                <div className="pt-4 border-t border-[#EBEBEB] flex flex-col gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center">
                                            <ShieldCheck className="w-5 h-5 text-[#171717]" />
                                        </div>
                                        <div className="text-[11px] font-mono text-[#8F8F8F] uppercase tracking-normal leading-tight">
                                            Enterprise Security Enabled
                                        </div>
                                    </div>
                                    <Link 
                                        href={`/${locale}/tools`}
                                        className="inline-flex items-center justify-center h-9 px-4 rounded-md border border-[#EBEBEB] bg-white hover:bg-[#FAFAFA] text-[#171717] text-xs font-medium transition-colors w-full"
                                    >
                                        Access Advanced Tools
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Intelligence Feed */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-[#171717] tracking-tight">Recent Activity Intelligence</h3>
                        <button className="text-xs font-mono text-[#8F8F8F] hover:text-[#171717] transition-colors uppercase tracking-normal">
                            Advanced Analytics Tracking
                        </button>
                    </div>
                    <div className="bg-white border border-[#EBEBEB] rounded-xl overflow-hidden shadow-sm">
                        <div className="divide-y divide-[#EBEBEB]">
                           {[
                              { title: 'Resume Intelligence Calibration', date: '2h ago', status: 'Enhanced', icon: <TrendingUp className="text-[#171717]" /> },
                              { title: 'Coding Protocol Completion', date: 'Yesterday', status: 'Verified', icon: <Briefcase className="text-[#171717]" /> },
                              { title: 'Cloud Infrastructure Design', date: 'Feb 12', status: 'Live', icon: <Compass className="text-[#171717]" /> }
                           ].map((item, i) => (
                              <div key={i} className="p-5 flex items-center justify-between hover:bg-[#FAFAFA] transition-all group cursor-default">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center group-hover:border-[#171717] transition-colors">
                                       <div className="w-5 h-5 flex items-center justify-center">{item.icon}</div>
                                    </div>
                                    <div>
                                       <h4 className="font-semibold text-sm text-[#171717] group-hover:text-[#0070F3] transition-colors">{item.title}</h4>
                                       <div className="flex items-center gap-2 text-xs text-[#8F8F8F] mt-1">
                                          <Clock className="w-3 h-3" />
                                          {item.date}
                                       </div>
                                    </div>
                                 </div>
                                 <span className="text-[10px] font-bold uppercase tracking-wider border border-[#EBEBEB] bg-white text-[#4D4D4D] px-2.5 py-0.5 rounded-full">
                                    {item.status}
                                 </span>
                              </div>
                           ))}
                        </div>
                    </div>
                </section>
            </div>
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return <div className="p-10 text-rose-600 font-medium bg-white border border-[#EBEBEB] rounded-xl shadow-sm">Ecosystem Linkage Error: {message}</div>;
    }
}

function MetricCard({ label, value, icon, trend }: { label: string, value: string | number, icon: React.ReactNode, trend: string }) {
    return (
        <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 hover:shadow-[0_2px_2px_rgba(0,0,0,0.04),0_8px_16px_-4px_rgba(0,0,0,0.06)] transition-all group relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center">{icon}</div>
                <div className="text-[11px] text-[#8F8F8F] font-mono uppercase tracking-normal">{trend}</div>
            </div>
            <p className="text-xs text-[#8F8F8F] uppercase tracking-wider font-semibold mb-1">{label}</p>
            <p className="text-3xl md:text-4xl font-semibold text-[#171717] tracking-tight leading-none">{value}</p>
        </div>
    );
}

function ModuleCard({ title, desc, href, icon, color }: { title: string, desc: string, href: string, icon: React.ReactNode, color: string }) {
    const colorStyles: Record<string, string> = {
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        pink: 'text-pink-600 bg-pink-50 border-pink-100',
        orange: 'text-orange-600 bg-orange-50 border-orange-100',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        purple: 'text-purple-600 bg-purple-50 border-purple-100',
    };

    return (
        <Link href={href} className="block h-full">
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-6 group hover:shadow-[0_2px_2px_rgba(0,0,0,0.04),0_8px_16px_-4px_rgba(0,0,0,0.06)] hover:border-[#171717]/25 transition-all h-full flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-lg border ${colorStyles[color]} transition-colors`}>
                        <div className="w-5 h-5">{icon}</div>
                    </div>
                </div>
                <h3 className="font-semibold text-[#171717] group-hover:text-[#0070F3] transition-colors tracking-tight text-base mb-1">{title}</h3>
                <p className="text-sm text-[#4D4D4D] leading-relaxed font-normal mb-5">{desc}</p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8F8F8F] group-hover:text-[#0070F3] transition-colors mt-auto">
                    Initialize Module <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </Link>
    );
}

function StatusItem({ label, status, color }: { label: string, status: string, color: string }) {
    const colors: Record<string, string> = {
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    };
    
    return (
        <div className="flex items-center justify-between py-1.5">
            <span className="text-sm text-[#4D4D4D] font-normal">{label}</span>
            <div className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors[color]} flex items-center gap-1.5`}>
                <div className={`w-1 h-1 rounded-full bg-current ${status === 'Active' ? 'animate-pulse' : ''}`} />
                {status}
            </div>
        </div>
    );
}
