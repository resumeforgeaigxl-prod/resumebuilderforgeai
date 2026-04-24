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
            <Card glass className="p-12 text-center border-rose-500/20 bg-rose-500/[0.02] rounded-[3rem]">
                <AlertCircle className="w-12 h-12 mx-auto mb-6 text-rose-500" />
                <h3 className="text-xl font-black text-white italic uppercase tracking-widest mb-2">Protocol Error</h3>
                <p className="font-medium text-slate-500 uppercase text-xs tracking-tight">Failed to load account details. Re-initialize session.</p>
            </Card>
        );
    }

    const isAdmin = user.role === 'admin';
    const planType = user.plan_type?.toUpperCase() || 'FREE';
    const isPlanActive = user.plan_end ? new Date(user.plan_end) > new Date() : false;
    const activePlan = isAdmin ? 'ADMIN' : ((planType !== 'FREE' && isPlanActive) ? planType : 'FREE');


    const planBadgeStyles: Record<string, string> = {
        FREE: 'bg-slate-800/10 text-slate-500 border-slate-700/30',
        PRO: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        PREMIUM: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        CAREER: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-xl shadow-amber-500/10',
        ADMIN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-xl shadow-emerald-500/10',
    };


    return (
        <div className="space-y-12 animate-fade-in max-w-6xl mx-auto py-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-[0.2em] text-[10px] uppercase mb-3">
                         <Settings className="w-3.5 h-3.5" /> SYSTEM_CONFIG
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight italic uppercase">
                        Account <span className="text-gradient">Registry</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium italic">Manage professional credentials and neural subscriptions.</p>
                </div>
                
                <Badge variant="outline" className="h-10 px-5 rounded-2xl bg-white/[0.02] border-white/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Encryption Active
                </Badge>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Profile Section */}
                <Card glass className="p-10 space-y-10 border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-2xl">
                            <User className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Identity Core</h2>
                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">Primary Authentication Profile</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1">Assigned Designation</label>
                            <div className="px-8 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-white font-black italic uppercase text-lg flex items-center gap-4">
                                <span className="text-indigo-500 font-black">#</span> {user.full_name || 'NOT_IDENTIFIED'}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1">Signal Communication</label>
                            <div className="px-8 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-slate-400 font-black text-lg truncate flex items-center gap-4 lowercase">
                                <Lock className="w-4 h-4 text-slate-800" /> {user.email}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Subscription Section */}
                <Card glass className="p-10 space-y-10 border-white/5 bg-white/[0.01]">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shadow-2xl">
                            <Crown className="w-8 h-8 text-amber-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Resource Access</h2>
                            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mt-1">Tier-Level Protocols</p>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-indigo-500/[0.02] border border-white/5 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                            <Crown className="w-24 h-24 text-indigo-500" />
                        </div>

                        <div className="flex items-center justify-between relative">
                            <Badge variant="outline" className={`h-10 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl ${planBadgeStyles[activePlan] || planBadgeStyles.FREE}`}>
                                {activePlan} PROTOCOL
                            </Badge>
                            <span className="text-[9px] uppercase font-black text-emerald-500 tracking-[0.2em] flex items-center gap-1.5 animate-pulse">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ONLINE
                            </span>
                        </div>

                        <div className="relative">
                            {activePlan === 'FREE' ? (
                                <p className="text-slate-500 font-medium italic">Standard resource access. Upgrade to unlock neural synthesis layers.</p>
                            ) : user.plan_end ? (
                                <div className="flex items-center gap-3 text-slate-300">
                                    <Calendar className="w-5 h-5 text-indigo-400" />
                                    <span className="font-black italic uppercase text-xs tracking-widest">Expiration_Cycle: {format(new Date(user.plan_end), 'dd MMM yyyy').toUpperCase()}</span>
                                </div>
                            ) : (
                                <p className="text-indigo-400 font-black italic uppercase text-xs tracking-[0.3em]">Perpetual Absolute Access Active</p>
                            )}
                        </div>

                        <Link href={`/${locale}/billing`} className="block relative">
                            <Button variant="premium" className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] group/btn">
                                {activePlan === 'FREE' ? 'ELEVATE ACCESS' : 'RE-INITIALIZE PLAN'}
                                <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-white/5">
                        <Link href={`/${locale}/dashboard/invoices`} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group/item">
                            <div className="flex items-center gap-4">
                                <CreditCard className="w-5 h-5 text-slate-600 group-hover/item:text-indigo-400 transition-colors" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover/item:text-white transition-colors italic">Protocol History / Invoices</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-800" />
                        </Link>

                        <form action="/api/auth/signout" method="post">
                            <button className="w-full flex items-center justify-between p-5 rounded-2xl hover:bg-rose-500/10 text-rose-500/50 hover:text-rose-500 transition-all group/exit">
                                <div className="flex items-center gap-4">
                                    <LogOut className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-widest italic group-exit:translate-x-1 transition-transform">De-authenticate Terminal</span>
                                </div>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover/exit:opacity-100 transition-opacity" />
                            </button>
                        </form>
                    </div>
                </Card>
            </div>

            {/* Support CTA */}
            <Card glass className="p-10 rounded-[4rem] border-white/5 bg-gradient-to-r from-indigo-500/[0.03] to-transparent flex flex-col lg:flex-row items-center justify-between gap-10">
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-500/5 flex items-center justify-center shrink-0 border border-white/5 shadow-2xl">
                        <Info className="w-10 h-10 text-indigo-900" />
                    </div>
                    <div>
                        <h4 className="text-2xl font-black text-white tracking-tighter uppercase italic">Neural Link failure?</h4>
                        <p className="text-slate-500 mt-1 font-medium italic">Access technical support for profile desynchronization or protocol anomalies.</p>
                    </div>
                </div>
                <Link href={`/${locale}/dashboard/support`} className="w-full lg:w-auto">
                    <Button variant="outline" className="w-full lg:w-72 h-16 rounded-[2rem] font-black uppercase tracking-widest text-[10px] border-white/10 hover:bg-white/5">
                        Request Pulse Support
                    </Button>
                </Link>
            </Card>
        </div>
    );
}
