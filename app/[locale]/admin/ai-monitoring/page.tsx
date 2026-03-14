'use client';

import { useState, useEffect } from 'react';
import { 
    Users, MessageSquare, Eye, RefreshCw, X, Coins, 
    Search, Copy, ArrowUpRight, Box, 
    Terminal, Zap, Sparkles
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIUserStats {
    user_id: string;
    email: string;
    name: string;
    calls: number;
    tokens: number;
    lastActive: string;
}

interface AIChat {
    id: string;
    role: 'user' | 'assistant';
    message: string;
    created_at: string;
}

interface LiveSession {
    id: string;
    user_id: string;
    started_at: string;
    last_active: string;
    status: string;
    users: { email: string; display_name: string };
}

export default function AIMonitoringPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCallsToday: 0,
        activeUsersToday: 0,
        totalTokensToday: 0,
        newSessionsToday: 0
    });
    const [usersList, setUsersList] = useState<AIUserStats[]>([]);
    const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'users' | 'sessions'>('users');

    // Chat Viewer Modal
    const [viewingUser, setViewingUser] = useState<AIUserStats | null>(null);
    const [chatHistory, setChatHistory] = useState<AIChat[]>([]);
    const [chatLoading, setChatLoading] = useState(false);

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const [mainRes, liveRes] = await Promise.all([
                fetch('/api/admin/ai-monitoring'),
                fetch('/api/admin/ai-monitoring?action=live-sessions')
            ]);
            
            const mainData = await mainRes.json();
            const liveData = await liveRes.json();

            if (mainData.stats) {
                setStats(mainData.stats);
                setUsersList(mainData.usersList || []);
            }
            if (liveData.sessions) {
                setLiveSessions(liveData.sessions);
            }
        } catch (e) {
            console.error('Failed to load AI stats', e);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
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

    const filteredUsers = usersList.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && !stats.totalCallsToday) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                    <Sparkles className="w-6 h-6 text-purple-500 absolute -top-2 -right-2 animate-bounce" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing AI Neural Logs...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-600/20">
                            <Terminal className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight">AI Neural Monitor</h1>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Global intelligence tracking & session forensics.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search users/sessions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-72 transition-all"
                        />
                    </div>
                    <button
                        onClick={() => fetchData()}
                        className="p-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl transition-all group border border-blue-500/20"
                    >
                        <RefreshCw className="w-5 h-5 group-active:rotate-180 transition-transform duration-500" />
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Neural Demands', val: stats.totalCallsToday, icon: Zap, color: 'blue' },
                    { label: 'Live Core Users', val: stats.activeUsersToday, icon: Users, color: 'purple' },
                    { label: 'Token Throughput', val: stats.totalTokensToday.toLocaleString(), icon: Coins, color: 'amber' },
                    { label: 'Active Sessions', val: stats.newSessionsToday, icon: MessageSquare, color: 'emerald' }
                ].map((m, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={m.label}
                        className="bg-[#0a0a0f] border border-white/5 rounded-[2rem] p-6 relative group overflow-hidden"
                    >
                        <div className={`p-3 bg-${m.color}-500/10 rounded-2xl w-fit mb-4 border border-${m.color}-500/20`}>
                            <m.icon className={`w-6 h-6 text-${m.color}-400`} />
                        </div>
                        <p className="text-slate-500 text-[10px] font-black tracking-widest uppercase">{m.label}</p>
                        <h3 className="text-3xl font-black text-white mt-1 font-mono tracking-tighter">
                            {loading ? '...' : m.val}
                        </h3>
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-${m.color}-500/5 blur-3xl`} />
                    </motion.div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl w-fit border border-white/10">
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> Usage Logs
                    </div>
                </button>
                <button 
                    onClick={() => setActiveTab('sessions')}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'sessions' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Live Sessions
                    </div>
                </button>
            </div>

            {/* Content Table */}
            <div className="bg-[#0a0a0f] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <AnimatePresence mode="wait">
                    {activeTab === 'users' ? (
                        <motion.div 
                            key="users"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="overflow-x-auto"
                        >
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-white/[0.03] text-xs uppercase text-slate-500 font-black tracking-widest border-b border-white/5">
                                    <tr>
                                        <th className="px-8 py-5">Intelligence Source</th>
                                        <th className="px-6 py-5">Load</th>
                                        <th className="px-6 py-5 text-center">Consumption</th>
                                        <th className="px-6 py-5 text-center">Last Pulse</th>
                                        <th className="px-8 py-5 text-right">Ops</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.user_id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center font-black text-blue-400 uppercase text-lg">
                                                        {user.name?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                                                            {user.name || 'Anonymous User'}
                                                            <ArrowUpRight className="w-3 h-3 text-slate-700" />
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 font-mono">{user.email || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-white">{user.calls} demands</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg inline-block">
                                                    <span className="text-amber-500 font-mono text-xs font-black">{user.tokens.toLocaleString()} TKN</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="text-xs text-slate-500 font-medium">{new Date(user.lastActive).toLocaleTimeString()}</span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button
                                                    onClick={() => viewChatHistory(user)}
                                                    className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/5"
                                                    title="View Full Logs"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="sessions"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="overflow-x-auto"
                        >
                             <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-white/[0.03] text-xs uppercase text-slate-500 font-black tracking-widest border-b border-white/5">
                                    <tr>
                                        <th className="px-8 py-5">Session Identifier</th>
                                        <th className="px-6 py-5">Initiator</th>
                                        <th className="px-6 py-5 text-center">Status</th>
                                        <th className="px-6 py-5 text-right">Last Signal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {liveSessions.map((session) => (
                                        <tr key={session.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-5 font-mono text-xs text-blue-400 font-bold">
                                                {session.id}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white">{session.users?.display_name || 'User'}</span>
                                                    <span className="text-[10px] text-slate-500">{session.users?.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${session.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border border-white/5'}`}>
                                                    {session.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right font-mono text-[10px] text-slate-500">
                                                {new Date(session.last_active).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Chat Viewer Modal */}
            <AnimatePresence>
                {viewingUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-2xl"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-[#0f0f13] border border-white/10 w-full max-w-5xl h-[90vh] rounded-[3.5rem] shadow-2xl relative flex flex-col overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-8 border-b border-white/5 bg-[#0a0a0f]">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-3xl bg-blue-600 flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-blue-600/20">
                                        {viewingUser.name?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white text-3xl tracking-tighter italic uppercase">Neural Archive: {viewingUser.name}</h3>
                                        <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">{viewingUser.email}</p>
                                    </div>
                                </div>
                                <button onClick={() => setViewingUser(null)} className="p-3 hover:bg-white/5 rounded-2xl transition-all text-slate-400 hover:text-white border border-white/5 hover:scale-110 active:scale-90">
                                    <X className="w-7 h-7" />
                                </button>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar bg-[#0d0d14]">
                                {chatLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                                        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                                        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Materializing History...</p>
                                    </div>
                                ) : chatHistory.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                                        <div className="p-6 bg-white/5 rounded-full">
                                            <Box className="w-16 h-16 text-slate-700" />
                                        </div>
                                        <p className="text-slate-400 text-lg font-black uppercase tracking-tighter">Archive is Empty</p>
                                    </div>
                                ) : (
                                    chatHistory.map((msg, i) => (
                                        <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-center gap-3 mb-3 px-4">
                                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${msg.role === 'user' ? 'text-blue-500' : 'text-purple-500'}`}>
                                                    {msg.role === 'user' ? 'User Intent' : 'Neural Output'}
                                                </span>
                                                <div className="w-1 h-1 rounded-full bg-slate-800" />
                                                <span className="text-[10px] text-slate-600 font-mono">{new Date(msg.created_at).toLocaleTimeString()}</span>
                                            </div>
                                            <div className={`p-8 rounded-[2.5rem] text-[15px] max-w-[85%] leading-relaxed shadow-2xl relative group border ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-tr-sm border-blue-400/20'
                                                : 'bg-white/[0.03] border-white/10 text-slate-200 rounded-tl-sm'
                                                }`}>
                                                {msg.role === 'assistant' ? (
                                                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed">
                                                        {msg.message}
                                                    </div>
                                                ) : msg.message}
                                                <button className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all hover:scale-125">
                                                    <Copy className="w-4 h-4 text-white/40" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 bg-[#0a0a0f] border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Live Sync Enabled</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Log Count: {chatHistory.length}</div>
                                </div>
                                <div className="text-[9px] text-slate-700 font-mono tracking-tighter font-black">NEURAL_DECRYPT_ORCHESTRATOR_V3_SECURE</div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
