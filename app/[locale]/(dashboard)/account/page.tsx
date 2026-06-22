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

            {/* Professional Profile Section */}
            <div className="bg-white border border-[#EBEBEB] rounded-xl p-8 space-y-8 shadow-sm text-[#171717]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center shadow-sm">
                            <Briefcase className="w-6 h-6 text-[#171717]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight text-[#171717]">Professional Profile</h2>
                            <p className="text-[#8F8F8F] text-[10px] font-semibold uppercase tracking-wider mt-0.5">Resume & ATS Builder Credentials</p>
                        </div>
                    </div>
                    <Link href={`/${locale}/complete-profile`}>
                        <button className="h-9 px-4 rounded-md border border-[#EBEBEB] hover:bg-[#FAFAFA] text-[#171717] font-semibold text-xs transition-all flex items-center gap-2 shadow-sm">
                            <Edit className="w-3.5 h-3.5" /> Edit Profile Details
                        </button>
                    </Link>
                </div>

                {/* Details layout: Grid of inputs / text blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Target Role & Preferred Work Mode */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8F8F8F] ml-0.5">Target Role & Work Mode</label>
                        <div className="px-4 py-3 bg-[#FAFAFA] border border-[#EBEBEB] rounded-md font-semibold text-sm flex items-center justify-between">
                            <span>{user.target_role || 'Not Configured'}</span>
                            <span className="text-xs text-[#8F8F8F] font-medium">{user.preferred_work_mode || 'Remote'}</span>
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8F8F8F] ml-0.5">Phone Number</label>
                        <div className="px-4 py-3 bg-[#FAFAFA] border border-[#EBEBEB] rounded-md font-semibold text-sm flex items-center gap-3">
                            <Phone className="w-4 h-4 text-[#8F8F8F]" /> {user.phone_number || 'Not Configured'}
                        </div>
                    </div>

                    {/* Experience Level & Referral */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8F8F8F] ml-0.5">Experience Level & Referral</label>
                        <div className="px-4 py-3 bg-[#FAFAFA] border border-[#EBEBEB] rounded-md font-semibold text-sm flex items-center justify-between">
                            <span>{user.experience_level || 'Beginner'}</span>
                            <span className="text-xs text-[#8F8F8F] font-medium">Ref: {user.referral_source || 'Direct'}</span>
                        </div>
                    </div>

                    {/* Social profiles & links */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8F8F8F] ml-0.5">Professional Networks & Portfolio</label>
                        <div className="flex gap-2">
                            {user.linkedin_url ? (
                                <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex-1 px-3 py-2 bg-[#FAFAFA] border border-[#EBEBEB] rounded-md hover:bg-[#F5F5F5] transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-[#4D4D4D] truncate">
                                    <Linkedin className="w-3.5 h-3.5 text-[#0077B5] shrink-0" /> LinkedIn
                                </a>
                            ) : (
                                <div className="flex-1 px-3 py-2 bg-[#FAFAFA] border border-[#EBEBEB] border-dashed rounded-md flex items-center justify-center gap-2 text-xs text-[#8F8F8F] font-semibold">
                                    <Linkedin className="w-3.5 h-3.5 opacity-40 shrink-0" /> No LinkedIn
                                </div>
                            )}

                            {user.github_url ? (
                                <a href={user.github_url} target="_blank" rel="noopener noreferrer" className="flex-1 px-3 py-2 bg-[#FAFAFA] border border-[#EBEBEB] rounded-md hover:bg-[#F5F5F5] transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-[#4D4D4D] truncate">
                                    <Github className="w-3.5 h-3.5 text-[#171717] shrink-0" /> GitHub
                                </a>
                            ) : (
                                <div className="flex-1 px-3 py-2 bg-[#FAFAFA] border border-[#EBEBEB] border-dashed rounded-md flex items-center justify-center gap-2 text-xs text-[#8F8F8F] font-semibold">
                                    <Github className="w-3.5 h-3.5 opacity-40 shrink-0" /> No GitHub
                                </div>
                            )}

                            {user.portfolio_url ? (
                                <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex-1 px-3 py-2 bg-[#FAFAFA] border border-[#EBEBEB] rounded-md hover:bg-[#F5F5F5] transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-[#4D4D4D] truncate">
                                    <Globe className="w-3.5 h-3.5 text-emerald-600" /> Portfolio
                                </a>
                            ) : (
                                <div className="flex-1 px-3 py-2 bg-[#FAFAFA] border border-[#EBEBEB] border-dashed rounded-md flex items-center justify-center gap-2 text-xs text-[#8F8F8F] font-semibold">
                                    <Globe className="w-3.5 h-3.5 opacity-40 animate-pulse shrink-0" /> No Website
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Professional Summary */}
                <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8F8F8F] ml-0.5">Professional Summary</label>
                    <div className="px-4 py-3 bg-[#FAFAFA] border border-[#EBEBEB] rounded-md text-[#4D4D4D] text-xs leading-relaxed font-medium">
                        {user.professional_summary || 'No professional summary set. Complete your profile details to fill this.'}
                    </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8F8F8F] ml-0.5">Skills Inventory</label>
                    <div className="flex flex-wrap gap-1.5 p-4 bg-[#FAFAFA] border border-[#EBEBEB] rounded-md min-h-[50px]">
                        {Array.isArray(user.skills) && user.skills.length > 0 ? (
                            user.skills.map((skill: string, index: number) => (
                                <Badge key={index} className="bg-white border border-[#EBEBEB] text-[#4D4D4D] text-[10px] font-semibold uppercase tracking-wider py-1 px-2.5 rounded shadow-sm hover:bg-[#FAFAFA]">
                                    {skill}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-[#8F8F8F] italic">No skills listed yet.</span>
                        )}
                    </div>
                </div>

                {/* Education Section */}
                {user.education && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8F8F8F] ml-0.5">Education Registry</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                            {/* Tenth */}
                            {user.education.tenth?.institution && (
                                <div className="p-4 bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg space-y-1 shadow-sm">
                                    <div className="text-[9px] font-bold uppercase tracking-wider text-[#8F8F8F]">Class 10th / Secondary</div>
                                    <div className="font-semibold text-xs text-[#171717] truncate">{user.education.tenth.institution}</div>
                                    <div className="text-[10px] text-[#4D4D4D] font-medium flex justify-between">
                                        <span>Year: {user.education.tenth.passingYear}</span>
                                        <span>Score: {user.education.tenth.score}</span>
                                    </div>
                                </div>
                            )}

                            {/* Twelfth / Diploma */}
                            {user.education.diploma?.enabled && user.education.diploma?.institution ? (
                                <div className="p-4 bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg space-y-1 shadow-sm">
                                    <div className="text-[9px] font-bold uppercase tracking-wider text-[#8F8F8F]">Diploma / Equivalent</div>
                                    <div className="font-semibold text-xs text-[#171717] truncate">{user.education.diploma.institution}</div>
                                    <div className="text-[10px] text-[#4D4D4D] font-medium flex justify-between">
                                        <span>Year: {user.education.diploma.passingYear}</span>
                                        <span>Score: {user.education.diploma.score}</span>
                                    </div>
                                </div>
                            ) : user.education.twelfth?.institution ? (
                                <div className="p-4 bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg space-y-1 shadow-sm">
                                    <div className="text-[9px] font-bold uppercase tracking-wider text-[#8F8F8F]">Class 12th / Senior Secondary</div>
                                    <div className="font-semibold text-xs text-[#171717] truncate">{user.education.twelfth.institution}</div>
                                    <div className="text-[10px] text-[#4D4D4D] font-medium flex justify-between">
                                        <span>Year: {user.education.twelfth.passingYear}</span>
                                        <span>Score: {user.education.twelfth.score}</span>
                                    </div>
                                </div>
                            ) : null}

                            {/* Undergraduate (B.Tech/BE/etc.) */}
                            {user.education.btech?.institution ? (
                                <div className="p-4 bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg space-y-1 shadow-sm">
                                    <div className="text-[9px] font-bold uppercase tracking-wider text-[#8F8F8F]">Undergraduate / B.Tech</div>
                                    <div className="font-semibold text-xs text-[#171717] truncate">{user.education.btech.institution}</div>
                                    <div className="text-[10px] text-[#4D4D4D] font-medium flex justify-between">
                                        <span>Year: {user.education.btech.passingYear}</span>
                                        <span>Score: {user.education.btech.score}</span>
                                    </div>
                                </div>
                            ) : (
                                user.college && (
                                    <div className="p-4 bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg space-y-1 shadow-sm">
                                        <div className="text-[9px] font-bold uppercase tracking-wider text-[#8F8F8F]">Undergraduate College</div>
                                        <div className="font-semibold text-xs text-[#171717] truncate">{user.college}</div>
                                        <div className="text-[10px] text-[#8F8F8F] italic font-medium">Details incomplete</div>
                                    </div>
                                )
                            )}

                            {/* Post Graduate (Masters) */}
                            {user.education.masters?.enabled && user.education.masters?.institution && (
                                <div className="p-4 bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg space-y-1 shadow-sm col-span-1 md:col-span-3">
                                    <div className="text-[9px] font-bold uppercase tracking-wider text-[#8F8F8F]">Postgraduate / Masters</div>
                                    <div className="font-semibold text-xs text-[#171717] truncate">{user.education.masters.institution}</div>
                                    <div className="text-[10px] text-[#4D4D4D] font-medium flex gap-6">
                                        <span>Year: {user.education.masters.passingYear}</span>
                                        <span>Score: {user.education.masters.score}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
