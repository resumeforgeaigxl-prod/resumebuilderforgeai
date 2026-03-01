'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Users, MessageSquareWarning, Eye, RefreshCw, X, Coins, Activity, Search, Copy, ArrowUpRight } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface AIUserStats {
    user_id: string;
    email: string;
    name: string;
    calls: number;
    tokens: number;
    violations: number;
    lastActive: string;
}

interface AIChat {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string;
}

export default function AIMonitoringPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCallsToday: 0,
        activeUsersToday: 0,
        totalTokensToday: 0,
        totalViolations: 0
    });
    const [usersList, setUsersList] = useState<AIUserStats[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Chat Viewer Modal
    const [viewingUser, setViewingUser] = useState<AIUserStats | null>(null);
    const [chatHistory, setChatHistory] = useState<AIChat[]>([]);
    const [chatLoading, setChatLoading] = useState(false);

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await fetch('/api/admin/ai-monitoring');
            const data = await res.json();
            if (data.stats) {
                setStats(data.stats);
                setUsersList(data.usersList || []);
            }
        } catch (e) {
            console.error('Failed to load AI stats', e);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Supabase Realtime Subscription
        const supabase = createClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const usageSub = (supabase.channel('ai-production-logs') as any)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_usage_logs' }, () => fetchData(true))
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ai_violations' }, () => fetchData(true))
            .subscribe();

        return () => {
            supabase.removeChannel(usageSub);
        };
    }, []);

    const viewChatHistory = async (user: AIUserStats) => {
        setViewingUser(user);
        setChatLoading(true);
        try {
            const res = await fetch(`/api/admin/ai-monitoring?action=chat-history&userId=${user.user_id}`);
            const data = await res.json();
            setChatHistory(data.chats || []);
        } catch (e) {
            console.error('Failed to load chat history', e);
        } finally {
            setChatLoading(false);
        }
    };

    const handleResetViolations = async (userId: string) => {
        if (!confirm('Are you sure you want to reset and unblock this user?')) return;

        try {
            await fetch('/api/admin/ai-monitoring', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reset_violations', userId })
            });
            fetchData();
        } catch (e) {
            console.error('Reset failed', e);
        }
    };

    const filteredUsers = usersList.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && !stats.totalCallsToday) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-slate-400 font-medium">Loading Production AI Logs...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Command Center</h1>
                    </div>
                    <p className="text-slate-400 text-sm">Realtime production monitoring for JobForgeAI.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => fetchData()}
                        className="p-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl transition-all group"
                        title="Refresh Data"
                    >
                        <RefreshCw className="w-5 h-5 group-active:rotate-180 transition-transform duration-500" />
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'AI Calls Today', val: stats.totalCallsToday, icon: Activity, color: 'indigo' },
                    { label: 'Active Users Today', val: stats.activeUsersToday, icon: Users, color: 'emerald' },
                    { label: 'Tokens Today', val: stats.totalTokensToday.toLocaleString(), icon: Coins, color: 'blue' },
                    { label: 'Total Violations', val: stats.totalViolations, icon: ShieldAlert, color: 'red' }
                ].map((m, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={m.label}
                        className={`bg-[#0a0a0f] border border-white/5 rounded-3xl p-6 relative group overflow-hidden hover:border-${m.color}-500/30 transition-all`}
                    >
                        <div className={`p-3 bg-${m.color}-500/10 rounded-2xl w-fit mb-4`}>
                            <m.icon className={`w-6 h-6 text-${m.color}-400`} />
                        </div>
                        <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase">{m.label}</p>
                        <h3 className="text-3xl font-black text-white mt-2 font-mono">
                            {loading ? '...' : m.val}
                        </h3>
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${m.color}-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </motion.div>
                ))}
            </div>

            {/* Users Table */}
            <div className="bg-[#0a0a0f] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Production Usage Log</h2>
                        <p className="text-slate-500 text-xs mt-0.5">Aggregated user activity and compliance stats.</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-white/[0.03] text-xs uppercase text-slate-400 font-bold border-b border-white/5">
                            <tr>
                                <th className="px-8 py-5">User</th>
                                <th className="px-6 py-5">Activity</th>
                                <th className="px-6 py-5 text-center">Consumption</th>
                                <th className="px-6 py-5 text-center">Trust Score</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <Activity className="w-12 h-12 text-slate-700 mb-3" />
                                            <p className="text-lg font-medium">No activity data found</p>
                                            <p className="text-sm text-slate-600">Usage logs will appear here as users interact with AI.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.user_id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center font-bold text-indigo-400 uppercase">
                                                    {user.name?.[0] || 'U'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white flex items-center gap-2">
                                                        {user.name || 'Anonymous User'}
                                                        <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                                                    </div>
                                                    <div className="text-xs text-slate-500">{user.email || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-indigo-400 font-bold">{user.calls} calls</span>
                                                <span className="text-[10px] text-slate-500">Last: {new Date(user.lastActive).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg inline-block">
                                                <span className="text-blue-400 font-mono text-xs font-bold">{user.tokens.toLocaleString()} tokens</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.violations >= 3 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : user.violations > 0 ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                                    {user.violations >= 3 ? 'Blocked' : user.violations > 0 ? `${user.violations} Strike` : 'Clean'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => viewChatHistory(user)}
                                                    className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5"
                                                    title="View Conversation"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                {user.violations > 0 && (
                                                    <button
                                                        onClick={() => handleResetViolations(user.user_id)}
                                                        className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-all border border-emerald-500/20"
                                                        title="Reset Violations"
                                                    >
                                                        <RefreshCw className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Chat Viewer Modal */}
            <AnimatePresence>
                {viewingUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#0f0f13] border border-white/10 w-full max-w-4xl h-[85vh] rounded-[3rem] shadow-2xl relative flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-8 border-b border-white/5 bg-[#0a0a0f]">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-bold text-white text-xl">
                                        {viewingUser.name?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white text-2xl tracking-tight">Viewing Logs: {viewingUser.name}</h3>
                                        <p className="text-sm text-slate-500 font-mono">{viewingUser.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setViewingUser(null)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-slate-400 hover:text-white border border-white/5">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-[#0f0f13]">
                                {chatLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                                        <p className="text-slate-500 animate-pulse">Decrypting conversation logs...</p>
                                    </div>
                                ) : chatHistory.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                                        <MessageSquareWarning className="w-16 h-16 text-slate-700" />
                                        <p className="text-slate-500 text-lg font-medium">No encrypted messages found in this bucket.</p>
                                    </div>
                                ) : (
                                    chatHistory.map((msg, i) => (
                                        <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-2 mb-2 px-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                    {msg.role === 'user' ? 'Transmission from User' : 'AI Output'}
                                                </span>
                                                <span className="text-[10px] text-slate-700">{new Date(msg.created_at).toLocaleTimeString()}</span>
                                            </div>
                                            <div className={`p-6 rounded-3xl text-sm max-w-[80%] leading-relaxed shadow-2xl relative group ${msg.role === 'user'
                                                ? 'bg-indigo-600 text-white rounded-tr-sm'
                                                : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'
                                                }`}>
                                                {msg.content}
                                                <div className={`absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer`}>
                                                    <Copy className="w-3.5 h-3.5 text-white/50" />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-[#0a0a0f] border-t border-white/5 flex items-center justify-between text-slate-500 text-xs font-mono">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Live Log Stream
                                    </div>
                                    <div>Total Messages: {chatHistory.length}</div>
                                </div>
                                <div className="text-[10px] text-slate-600">PRODUCTION_MONITOR_V2.0_SECURE</div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
