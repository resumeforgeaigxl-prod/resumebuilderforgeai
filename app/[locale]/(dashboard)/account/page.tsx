export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import {
    User, Crown, Calendar,
    ShieldCheck, CreditCard, ChevronRight,
    AlertCircle, Info, LogOut,
    Lock,
    Settings,
    Briefcase, Edit, Phone, Linkedin, Github, Globe
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default async function AccountPage({ params }: { params: { locale: string } }) {
    const locale = params.locale || 'en-IN';
    const supabase = createClient();
    const session = await getSession();

    if (!session) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: user, error } = await (supabase as any)
        .from('users')
        .select('*')
        .eq('id', session.userId)
        .single();

    if (error || !user) {
        return (
            <div className="p-8 text-center border border-red-200 bg-red-50/50 rounded-xl max-w-xl mx-auto">
                <AlertCircle className="w-10 h-10 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold text-[#171717] mb-1">Protocol Error</h3>
                <p className="text-xs text-[#8F8F8F]">Failed to load account details. Please refresh or sign in again.</p>
            </div>
        );
    }

    const isAdmin = user.role === 'admin';
    const planType = user.plan_type?.toUpperCase() || 'FREE';
    const isPlanActive = user.plan_end ? new Date(user.plan_end) > new Date() : false;
    const activePlan = isAdmin ? 'ADMIN' : ((planType !== 'FREE' && isPlanActive) ? planType : 'FREE');

    const profileFields = [
        user.full_name,
        user.phone_number,
        user.linkedin_url,
        user.github_url,
        user.portfolio_url,
        user.college || user.education?.btech?.institution,
        user.skills && user.skills.length > 0,
        user.experience_level,
        user.target_role,
        user.preferred_work_mode,
        user.professional_summary
    ];
    const filledCount = profileFields.filter(Boolean).length;
    const completenessPercentage = Math.round((filledCount / profileFields.length) * 100);

    const planBadgeStyles: Record<string, string> = {
        FREE: 'bg-[#FAFAFA] text-[#4D4D4D] border-[#EBEBEB]',
        PRO: 'bg-[#EFF6FF] text-[#1E40AF] border-[#DBEAFE]',
        PREMIUM: 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]',
        CAREER: 'bg-[#FFFBEB] text-[#92400E] border-[#FEF3C7] shadow-sm',
        ADMIN: 'bg-[#ECFDF5] text-[#065F46] border-[#D1FAE5] shadow-sm',
    };

    return (
        <div className="space-y-12 max-w-6xl mx-auto py-6 text-[#171717]">
            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#EBEBEB]">
                <div>
                    <div className="flex items-center gap-2 text-[#8F8F8F] font-medium tracking-normal text-xs uppercase mb-3 font-mono">
                         <Settings className="w-3.5 h-3.5" /> Account Registry
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-[#171717]">
                        Settings
                    </h1>
                    <p className="text-[#4D4D4D] mt-2 text-sm max-w-2xl">Manage professional credentials and subscriptions.</p>
                </div>
                
                <div className="h-9 px-4 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] text-[#4D4D4D] text-xs font-semibold flex items-center gap-2 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Secure Encryption Active
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Section */}
                <div className="bg-white border border-[#EBEBEB] rounded-xl p-8 space-y-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center shadow-sm">
                            <User className="w-6 h-6 text-[#171717]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight text-[#171717]">Identity Core</h2>
                            <p className="text-[#8F8F8F] text-[10px] font-semibold uppercase tracking-wider mt-0.5">Primary Authentication Profile</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8F8F8F] ml-0.5">Full Name</label>
                            <div className="px-4 py-3 bg-[#FAFAFA] border border-[#EBEBEB] rounded-md text-[#171717] font-semibold text-sm flex items-center gap-3">
                                <span className="text-[#8F8F8F] font-semibold">#</span> {user.full_name || 'Not Configured'}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8F8F8F] ml-0.5">Email Address</label>
                            <div className="px-4 py-3 bg-[#FAFAFA] border border-[#EBEBEB] rounded-md text-[#171717] font-medium text-sm flex items-center gap-3">
                                <Lock className="w-4 h-4 text-[#8F8F8F]" /> {user.email}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Section */}
                <div className="bg-white border border-[#EBEBEB] rounded-xl p-8 space-y-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center shadow-sm">
                            <Crown className="w-6 h-6 text-[#171717]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight text-[#171717]">Resource Access</h2>
                            <p className="text-[#8F8F8F] text-[10px] font-semibold uppercase tracking-wider mt-0.5">Tier-Level Protocols</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-xl bg-[#FAFAFA] border border-[#EBEBEB] space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-105 transition-transform duration-700">
                            <Crown className="w-16 h-16 text-[#171717]" />
                        </div>

                        <div className="flex items-center justify-between relative">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${planBadgeStyles[activePlan] || planBadgeStyles.FREE}`}>
                                {activePlan} PLAN
                            </span>
                            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ONLINE
                            </span>
                        </div>

                        <div className="relative">
                            {activePlan === 'FREE' ? (
                                <p className="text-[#8F8F8F] text-xs italic">Standard resource access. Upgrade to unlock advanced AI models and templates.</p>
                            ) : user.plan_end ? (
                                <div className="flex items-center gap-2 text-[#4D4D4D]">
                                    <Calendar className="w-4 h-4 text-[#8F8F8F]" />
                                    <span className="font-semibold text-xs tracking-wider">Expires: {format(new Date(user.plan_end), 'dd MMM yyyy').toUpperCase()}</span>
                                </div>
                            ) : (
                                <p className="text-emerald-700 font-bold text-xs tracking-wider uppercase">Lifetime Access Active</p>
                            )}
                        </div>

                        <Link href={`/${locale}/dashboard/billing`} className="block relative">
                            <button className="w-full h-11 bg-[#171717] hover:bg-[#333333] text-white font-semibold text-xs rounded-md transition-all flex items-center justify-center gap-1 group/btn shadow-sm">
                                {activePlan === 'FREE' ? 'Upgrade Plan' : 'Manage Subscription'}
                                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                            </button>
                        </Link>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-[#EBEBEB]">
                        <Link href={`/${locale}/dashboard/invoices`} className="flex items-center justify-between p-4 rounded-lg bg-white border border-[#EBEBEB] hover:bg-[#FAFAFA] transition-all group/item shadow-sm">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-4 h-4 text-[#8F8F8F] group-hover/item:text-[#171717] transition-colors" />
                                <span className="text-xs font-semibold text-[#4D4D4D] group-hover/item:text-[#171717] transition-colors">Payment History & Invoices</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#8F8F8F]" />
                        </Link>

                        <form action="/api/auth/signout" method="post">
                            <button className="w-full flex items-center justify-between p-4 rounded-lg border border-red-100 hover:bg-red-50/50 text-red-500 hover:text-red-600 transition-all group/exit">
                                <div className="flex items-center gap-3">
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-xs font-semibold">Sign Out from Device</span>
                                </div>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover/exit:opacity-100 transition-opacity" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Premium ResumeForge Professional Identity Hub */}
            <div className="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/60 backdrop-blur-xl p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-[#171717] group">
                {/* Visual Glow Mesh */}
                <div className="absolute -right-24 -top-24 w-64 h-64 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-gradient-to-tr from-emerald-500/5 via-teal-500/5 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />

                {/* Header block with Profile Strength Meter */}
                <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-neutral-100">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#171717] to-[#333333] flex items-center justify-center shadow-md relative overflow-hidden">
                            <Briefcase className="w-6 h-6 text-white relative z-10" />
                            <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                        <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/50">
                                Professional Passport
                            </span>
                            <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-[#171717] mt-1.5">
                                Career Identity Registry
                            </h2>
                            <p className="text-[#8F8F8F] text-xs mt-0.5 font-medium">Verified credentials powering your AI resume builder models.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 self-stretch md:self-auto bg-neutral-50/50 border border-neutral-100 p-4 rounded-xl backdrop-blur-sm">
                        {/* Circular Progress Gauge */}
                        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="24" cy="24" r="20" className="stroke-neutral-200/50 fill-none" strokeWidth="3" />
                                <circle cx="24" cy="24" r="20" className="stroke-indigo-600 fill-none transition-all duration-1000 ease-out" strokeWidth="3" 
                                    strokeDasharray={`${2 * Math.PI * 20}`} 
                                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - completenessPercentage / 100)}`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute text-[10px] font-black font-mono">{completenessPercentage}%</span>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Profile Completeness</div>
                            <div className="text-[11px] text-[#4D4D4D] font-semibold mt-0.5">
                                {completenessPercentage === 100 ? 'All Credentials Verified' : 'Complete details for high-ATS scores'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
                    {/* Left Pane - Career Cards & Links (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Interactive Identity Passport Card */}
                        <div className="p-6 rounded-xl border border-neutral-100 bg-[#FAFAFA]/70 backdrop-blur-sm space-y-4 hover:border-neutral-200 hover:bg-white transition-all duration-300 shadow-sm relative overflow-hidden group/passport">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl opacity-0 group-hover/passport:opacity-100 transition-opacity duration-500" />
                            
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-[9px] font-bold text-[#8F8F8F] uppercase tracking-wider">Candidate Registry</div>
                                    <h3 className="font-semibold text-base text-[#171717] mt-0.5">{user.full_name || 'Anonymous User'}</h3>
                                </div>
                                <div className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[8px] font-black uppercase tracking-wider border border-emerald-100 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Active Candidate
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                {/* Role & Experience */}
                                <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-100">
                                    <span className="text-[#8F8F8F] font-medium">Target Role</span>
                                    <span className="font-bold text-[#171717]">{user.target_role || 'Not Configured'}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-100">
                                    <span className="text-[#8F8F8F] font-medium">Experience Level</span>
                                    <span className="font-bold text-[#171717]">{user.experience_level || 'Beginner'}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-100">
                                    <span className="text-[#8F8F8F] font-medium">Work Mode Preference</span>
                                    <span className="font-bold text-[#171717]">{user.preferred_work_mode || 'Remote'}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs py-1">
                                    <span className="text-[#8F8F8F] font-medium">Contact Phone</span>
                                    <span className="font-bold text-[#171717]">{user.phone_number || 'Not Configured'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Social Passport Bar */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-[#8F8F8F] ml-0.5">Social Credentials</label>
                            <div className="grid grid-cols-3 gap-2">
                                {user.linkedin_url ? (
                                    <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="px-3 py-2.5 bg-[#FAFAFA] border border-neutral-200 hover:border-indigo-400 rounded-lg hover:bg-indigo-50/20 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#4D4D4D] hover:text-indigo-600 shadow-sm">
                                        <Linkedin className="w-3.5 h-3.5 text-[#0077B5] shrink-0" /> Link
                                    </a>
                                ) : (
                                    <div className="px-3 py-2.5 bg-neutral-50 border border-neutral-100 border-dashed rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-neutral-300 cursor-not-allowed">
                                        <Linkedin className="w-3.5 h-3.5 opacity-30 shrink-0" /> Link
                                    </div>
                                )}

                                {user.github_url ? (
                                    <a href={user.github_url} target="_blank" rel="noopener noreferrer" className="px-3 py-2.5 bg-[#FAFAFA] border border-neutral-200 hover:border-black rounded-lg hover:bg-neutral-50 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#4D4D4D] hover:text-black shadow-sm">
                                        <Github className="w-3.5 h-3.5 text-[#171717] shrink-0" /> Git
                                    </a>
                                ) : (
                                    <div className="px-3 py-2.5 bg-neutral-50 border border-neutral-100 border-dashed rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-neutral-300 cursor-not-allowed">
                                        <Github className="w-3.5 h-3.5 opacity-30 shrink-0" /> Git
                                    </div>
                                )}

                                {user.portfolio_url ? (
                                    <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer" className="px-3 py-2.5 bg-[#FAFAFA] border border-neutral-200 hover:border-emerald-400 rounded-lg hover:bg-emerald-50/20 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#4D4D4D] hover:text-emerald-600 shadow-sm">
                                        <Globe className="w-3.5 h-3.5 text-emerald-600" /> Web
                                    </a>
                                ) : (
                                    <div className="px-3 py-2.5 bg-neutral-50 border border-neutral-100 border-dashed rounded-lg flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-wider text-neutral-300 cursor-not-allowed">
                                        <Globe className="w-3.5 h-3.5 opacity-30" /> Web
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Professional Summary */}
                        <div className="p-5 rounded-xl border border-neutral-100 bg-[#FAFAFA]/70 backdrop-blur-sm space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-[#8F8F8F] ml-0.5">Professional Abstract</label>
                            <p className="text-[#4D4D4D] text-xs leading-relaxed font-medium italic">
                                "{user.professional_summary || 'No professional summary set yet. Complete your profile details to fill this.'}"
                            </p>
                        </div>
                    </div>

                    {/* Right Pane - Skills & Education Timeline (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Interactive Skill Radar Cloud */}
                        <div className="p-6 rounded-xl border border-neutral-100 bg-[#FAFAFA]/70 backdrop-blur-sm space-y-3.5">
                            <div className="flex justify-between items-center">
                                <label className="text-[9px] font-black uppercase tracking-widest text-[#8F8F8F] ml-0.5">Skills Radar Cloud</label>
                                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/50">
                                    {Array.isArray(user.skills) ? user.skills.length : 0} Tech Tokens
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[60px]">
                                {Array.isArray(user.skills) && user.skills.length > 0 ? (
                                    user.skills.map((skill: string, index: number) => {
                                        const gradients = [
                                            'hover:border-indigo-200 hover:bg-indigo-50/20 hover:text-indigo-600',
                                            'hover:border-purple-200 hover:bg-purple-50/20 hover:text-purple-600',
                                            'hover:border-pink-200 hover:bg-pink-50/20 hover:text-pink-600',
                                            'hover:border-blue-200 hover:bg-blue-50/20 hover:text-blue-600',
                                            'hover:border-emerald-200 hover:bg-emerald-50/20 hover:text-emerald-600'
                                        ];
                                        const hoverGradient = gradients[index % gradients.length];
                                        return (
                                            <Badge key={index} className={`bg-white border border-neutral-200 text-[#4D4D4D] text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg shadow-sm cursor-default transition-all duration-300 ${hoverGradient} hover:-translate-y-0.5`}>
                                                {skill}
                                            </Badge>
                                        );
                                    })
                                ) : (
                                    <span className="text-xs text-[#8F8F8F] italic">No skills listed yet.</span>
                                )}
                            </div>
                        </div>

                        {/* Interactive Education Timeline */}
                        {user.education && (
                            <div className="p-6 rounded-xl border border-neutral-100 bg-[#FAFAFA]/70 backdrop-blur-sm space-y-4">
                                <label className="text-[9px] font-black uppercase tracking-widest text-[#8F8F8F] ml-0.5">Education History Path</label>
                                
                                <div className="relative pl-6 border-l border-neutral-200 space-y-6">
                                    {/* Postgraduate / Masters */}
                                    {user.education.masters?.enabled && user.education.masters?.institution && (
                                        <div className="relative group/timeline-item">
                                            {/* Node indicator */}
                                            <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-purple-500 flex items-center justify-center shadow-sm group-hover/timeline-item:scale-125 transition-transform duration-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[9px] font-bold text-purple-600 uppercase tracking-wider">Postgraduate / Masters</div>
                                                <h4 className="font-semibold text-xs text-[#171717]">{user.education.masters.institution}</h4>
                                                <div className="text-[10px] text-[#8F8F8F] font-semibold flex gap-4">
                                                    <span>Year: {user.education.masters.passingYear}</span>
                                                    <span>Score: {user.education.masters.score}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Undergraduate / College */}
                                    {user.education.btech?.institution ? (
                                        <div className="relative group/timeline-item">
                                            <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center shadow-sm group-hover/timeline-item:scale-125 transition-transform duration-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">Undergraduate / Degree</div>
                                                <h4 className="font-semibold text-xs text-[#171717]">{user.education.btech.institution}</h4>
                                                <div className="text-[10px] text-[#8F8F8F] font-semibold flex gap-4">
                                                    <span>Year: {user.education.btech.passingYear}</span>
                                                    <span>Score: {user.education.btech.score}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        user.college && (
                                            <div className="relative group/timeline-item">
                                                <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-neutral-400 flex items-center justify-center shadow-sm group-hover/timeline-item:scale-125 transition-transform duration-300">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[9px] font-bold text-[#8F8F8F] uppercase tracking-wider">Undergraduate College</div>
                                                    <h4 className="font-semibold text-xs text-[#171717]">{user.college}</h4>
                                                    <div className="text-[10px] text-[#8F8F8F] italic font-semibold">Details incomplete. Re-run onboarding wizard.</div>
                                                </div>
                                            </div>
                                        )
                                    )}

                                    {/* Diploma or Twelfth */}
                                    {user.education.diploma?.enabled && user.education.diploma?.institution ? (
                                        <div className="relative group/timeline-item">
                                            <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center shadow-sm group-hover/timeline-item:scale-125 transition-transform duration-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Diploma / Equivalent</div>
                                                <h4 className="font-semibold text-xs text-[#171717]">{user.education.diploma.institution}</h4>
                                                <div className="text-[10px] text-[#8F8F8F] font-semibold flex gap-4">
                                                    <span>Year: {user.education.diploma.passingYear}</span>
                                                    <span>Score: {user.education.diploma.score}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : user.education.twelfth?.institution ? (
                                        <div className="relative group/timeline-item">
                                            <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center shadow-sm group-hover/timeline-item:scale-125 transition-transform duration-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Class 12th / Senior Secondary</div>
                                                <h4 className="font-semibold text-xs text-[#171717]">{user.education.twelfth.institution}</h4>
                                                <div className="text-[10px] text-[#8F8F8F] font-semibold flex gap-4">
                                                    <span>Year: {user.education.twelfth.passingYear}</span>
                                                    <span>Score: {user.education.twelfth.score}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Class 10th */}
                                    {user.education.tenth?.institution && (
                                        <div className="relative group/timeline-item">
                                            <div className="absolute -left-[30px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shadow-sm group-hover/timeline-item:scale-125 transition-transform duration-300">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Class 10th / Secondary</div>
                                                <h4 className="font-semibold text-xs text-[#171717]">{user.education.tenth.institution}</h4>
                                                <div className="text-[10px] text-[#8F8F8F] font-semibold flex gap-4">
                                                    <span>Year: {user.education.tenth.passingYear}</span>
                                                    <span>Score: {user.education.tenth.score}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Edit details footer banner */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-dashed border-neutral-200 bg-[#FAFAFA]/70 pt-4 mt-6">
                    <span className="text-[11px] text-[#8F8F8F] font-semibold">To update your professional resume details, run the onboarding setup.</span>
                    <Link href={`/${locale}/complete-profile`}>
                        <button className="h-9 px-4 rounded-md border border-[#EBEBEB] bg-white hover:bg-neutral-100 text-[#171717] font-semibold text-xs transition-all flex items-center gap-2 shadow-sm">
                            <Edit className="w-3.5 h-3.5" /> Re-Run Onboarding Setup
                        </button>
                    </Link>
                </div>
            </div>

            {/* Support CTA */}
            <div className="p-8 rounded-xl border border-[#EBEBEB] bg-[#FAFAFA] flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-white border border-[#EBEBEB] flex items-center justify-center shrink-0 shadow-sm">
                        <Info className="w-6 h-6 text-[#171717]" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-[#171717]">Need assistance?</h4>
                        <p className="text-[#8F8F8F] text-xs mt-0.5">Contact technical support for any account query or feedback.</p>
                    </div>
                </div>
                <Link href={`/${locale}/dashboard/support`} className="w-full lg:w-auto">
                    <button className="w-full lg:w-48 h-10 rounded-md border border-[#EBEBEB] bg-white hover:bg-[#FAFAFA] text-[#171717] font-semibold text-xs shadow-sm transition-all">
                        Contact Support
                    </button>
                </Link>
            </div>
        </div>
    );
}
