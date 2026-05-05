'use client';

import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Mail, 
    CheckCircle2, 
    Clock, 
    Search, 
    RefreshCcw, 
    ArrowRight,
    Rocket,
    Gift,
    ShieldCheck,
    Loader2,
    Phone,
    Ticket
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface WaitlistUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    college: string;
    position: number;
    is_approved: boolean;
    coupon_sent: boolean;
    coupon_code: string | null;
    created_at: string;
}

interface Coupon {
    id: string;
    code: string;
    type: string;
    value: number;
}

export default function AdminWaitlist() {
    const [users, setUsers] = useState<WaitlistUser[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [selectedCoupons, setSelectedCoupons] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    const fetchWaitlist = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/waitlist');
            const data = await res.json();
            if (data.users) setUsers(data.users);
        } catch (error) {
            console.error('Error fetching waitlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/admin/coupons'); // Assuming this exists or returns list
            const data = await res.json();
            if (data.coupons) setCoupons(data.coupons);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        }
    };

    const handleApprove = async (userId: string) => {
        setApprovingId(userId);
        const customCoupon = selectedCoupons[userId];

        try {
            const res = await fetch('/api/admin/waitlist/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, customCoupon })
            });
            const data = await res.json();
            if (data.success) {
                setUsers(prev => prev.map(u => 
                    u.id === userId 
                        ? { ...u, is_approved: true, coupon_sent: true, coupon_code: data.couponCode } 
                        : u
                ));
            } else {
                alert(data.error || 'Failed to approve user');
            }
        } catch {
            alert('Failed to connect to server');
        } finally {
            setApprovingId(null);
        }
    };

    useEffect(() => {
        fetchWaitlist();
        fetchCoupons();
    }, []);

    const first100Count = users.filter(u => u.position <= 100).length;
    const approvedCount = users.filter(u => u.is_approved).length;

    return (
        <div className="space-y-12 pb-20">
            {/* Header */}
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-[10px] uppercase mb-4">
                        <ShieldCheck className="w-3.5 h-3.5" /> Growth Governance
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white">
                        Waitlist <span className="text-indigo-500">Management</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">Manage early access invitations and launch offer distribution.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-2 px-4 h-fit">
                    <div className="flex flex-col items-end mr-3 border-r border-white/10 pr-4">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Leads</span>
                        <span className="text-white text-sm font-bold">{users.length}</span>
                    </div>
                    <button
                        onClick={fetchWaitlist}
                        className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all active:rotate-180 duration-500"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Strategy Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-8 group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-400">
                        <Gift className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{first100Count}/100</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Free Plan Eligibility</div>
                </div>
                <div className="glass-card p-8 group">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400">
                        <Rocket className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{Math.max(0, users.length - 100)}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Discount Candidates</div>
                </div>
                <div className="glass-card p-8 group">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{approvedCount}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Coupons Dispatched</div>
                </div>
            </div>

            {/* Main Table Section */}
            <div className="glass-card p-10">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <Users className="w-5 h-5 text-indigo-400" />
                        Waitlist Queue
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Search leads..." 
                            className="bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <th className="pb-4">Pos</th>
                                <th className="pb-4">User Details</th>
                                <th className="pb-4">Contact Info</th>
                                <th className="pb-4">Offer & Coupon</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [1,2,3,4,5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="py-6 text-center text-slate-600 text-xs font-mono uppercase tracking-widest">Syncing waitlist records...</td>
                                    </tr>
                                ))
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id} className="group hover:bg-white/[0.01]">
                                        <td className="py-4 font-mono text-slate-500 text-xs">#{user.position}</td>
                                        <td className="py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white text-sm">{user.name}</span>
                                                <span className="text-[11px] text-slate-400">{user.college}</span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-mono">
                                                    <Mail className="w-3 h-3" /> {user.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-mono">
                                                    <Phone className="w-3 h-3" /> {user.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            {user.coupon_sent ? (
                                                <div className="flex flex-col gap-1">
                                                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] w-fit">OFFER SENT</Badge>
                                                    <span className="text-[10px] text-indigo-400 font-mono font-bold">{user.coupon_code}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2">
                                                        {user.position <= 100 ? (
                                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">DEFAULT: FREE 2-MONTHS</Badge>
                                                        ) : (
                                                            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[9px]">DEFAULT: 50% OFF</Badge>
                                                        )}
                                                    </div>
                                                    <select 
                                                        value={selectedCoupons[user.id] || ''}
                                                        onChange={(e) => setSelectedCoupons({...selectedCoupons, [user.id]: e.target.value})}
                                                        className="bg-white/5 border border-white/10 rounded-lg py-1 px-2 text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500/50"
                                                    >
                                                        <option value="" className="bg-[#0f0f1a]">Use Default Offer</option>
                                                        {coupons.map(c => (
                                                            <option key={c.id} value={c.code} className="bg-[#0f0f1a]">
                                                                {c.code} ({c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`} OFF)
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4">
                                            {user.coupon_sent ? (
                                                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase">
                                                    <CheckCircle2 className="w-3 h-3" /> Sent
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase">
                                                    <Clock className="w-3 h-3" /> Pending
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 text-right">
                                            <button 
                                                onClick={() => handleApprove(user.id)}
                                                disabled={user.coupon_sent || approvingId === user.id}
                                                className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-2 ml-auto transition-all ${user.coupon_sent ? 'bg-white/5 text-slate-600 cursor-not-allowed' : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-white'}`}
                                            >
                                                {approvingId === user.id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Mail className="w-3 h-3" />
                                                )}
                                                {user.coupon_sent ? 'Sent' : 'Approve & Send'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-500 italic">No users joined the waitlist yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
