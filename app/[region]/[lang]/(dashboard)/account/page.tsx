import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/jwt';
import {
    User, Crown, Calendar,
    ShieldCheck, CreditCard, ChevronRight,
    AlertCircle, Info, LogOut
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function AccountPage() {
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
            <div className="p-12 text-center text-rose-500 bg-rose-500/5 border border-rose-500/10 rounded-[3rem]">
                <AlertCircle className="w-10 h-10 mx-auto mb-4" />
                <p className="font-bold">Failed to load account details. Please try again later.</p>
            </div>
        );
    }

    const planType = user.plan_type?.toUpperCase() || 'FREE';
    const isPlanActive = user.plan_end ? new Date(user.plan_end) > new Date() : false;
    const activePlan = (planType !== 'FREE' && isPlanActive) ? planType : 'FREE';

    const planBadgeStyles: Record<string, string> = {
        FREE: 'bg-slate-800/50 text-slate-400 border-slate-700',
        PRO: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        PREMIUM: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        CAREER: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };

    return (
        <div className="space-y-12 max-w-5xl mx-auto">
            <header>
                <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                    <User className="w-10 h-10 text-indigo-500" />
                    Account Settings
                </h1>
                <p className="text-slate-400 mt-2 font-medium">Manage your professional profile and subscription</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Section */}
                <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 space-y-8 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                            <User className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Personal Details</h2>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Public profile info</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                            <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold tracking-tight">
                                {user.full_name || 'Not Set'}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                            <div className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400">
                                {user.email}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                            <p className="text-xs text-indigo-300 font-medium">Verified Account</p>
                        </div>
                    </div>
                </section>

                {/* Subscription Section */}
                <section className="bg-slate-900/40 border border-white/5 rounded-[3rem] p-10 space-y-8 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <Crown className="w-8 h-8 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Plan & Billing</h2>
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Manage your membership</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-widest ${planBadgeStyles[activePlan] || planBadgeStyles.FREE}`}>
                                {activePlan} Membership
                            </div>
                            <span className="text-[10px] uppercase font-black text-slate-600 tracking-tighter Otros">Status: Active</span>
                        </div>

                        {activePlan === 'FREE' ? (
                            <p className="text-sm text-slate-400 leading-relaxed">You are currently using the free plan. Unlock advanced features with a premium plan.</p>
                        ) : user.plan_end ? (
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <Calendar className="w-4 h-4 text-amber-500" />
                                <span>Expires on {format(new Date(user.plan_end), 'dd MMM, yyyy')}</span>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-300 font-bold">Lifetime Unlimited Access</p>
                        )}

                        <Link href="/billing" className="block">
                            <button className="w-full py-3 px-6 bg-white text-black text-sm font-bold rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
                                {activePlan === 'FREE' ? 'Upgrade Plan' : 'View Plans'}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <Link href="/dashboard/invoices" className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all text-slate-400 hover:text-white">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-5 h-5" />
                                <span className="text-sm font-bold">Invoices & Billing History</span>
                            </div>
                            <ChevronRight className="w-4 h-4" />
                        </Link>

                        <form action="/api/auth/signout" method="post">
                            <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-rose-500/10 text-rose-500 transition-all">
                                <div className="flex items-center gap-3">
                                    <LogOut className="w-5 h-5" />
                                    <span className="text-sm font-bold">Sign Out from Device</span>
                                </div>
                            </button>
                        </form>
                    </div>
                </section>
            </div>

            {/* Support CTA */}
            <div className="p-8 rounded-[3rem] bg-gradient-to-r from-indigo-600/10 to-transparent border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Info className="w-7 h-7 text-indigo-400" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-white tracking-tight">Need help with your account?</h4>
                        <p className="text-slate-500 text-sm">Reach out to our support team for assistance with payments or profile issues.</p>
                    </div>
                </div>
                <Link href="/dashboard/support">
                    <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-sm font-bold border border-white/10 transition-all">
                        Contact Support
                    </button>
                </Link>
            </div>
        </div>
    );
}
