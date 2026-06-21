export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import {
    User, Crown, Calendar,
    ShieldCheck, CreditCard, ChevronRight,
    AlertCircle, Info, LogOut,
    Lock,
    Settings
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
