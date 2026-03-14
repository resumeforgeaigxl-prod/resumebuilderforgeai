"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
    Sparkles, 
    FileText, 
    Activity, 
    CheckCircle2,
    ExternalLink,
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Database
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ExplainForgeAdminRequest {
    id: string;
    user_id: string;
    input_type: string;
    created_at: string;
    users?: { email?: string | null } | Array<{ email?: string | null }> | null;
    explainforge_files?: unknown[] | null;
}

export default function ExplainForgeAdmin() {
    const [stats, setStats] = useState({
        totalRequests: 0,
        recentActivity: 0,
        totalFiles: 0,
        averageAnalysisTime: '12s'
    });
    const [recentRequests, setRecentRequests] = useState<ExplainForgeAdminRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        const supabase = createClient();

        try {
            // Fetch total requests
            const { count: requestsCount } = await supabase
                .from('explainforge_requests')
                .select('*', { count: 'exact', head: true });

            // Fetch total files
            const { count: filesCount } = await supabase
                .from('explainforge_files')
                .select('*', { count: 'exact', head: true });

            // Fetch recent requests with user emails
            const { data: requests } = await supabase
                .from('explainforge_requests')
                .select('*, explainforge_outputs(id), explainforge_files(count), users(email)')
                .order('created_at', { ascending: false })
                .limit(10);

            setRecentRequests((requests || []) as ExplainForgeAdminRequest[]);
            setStats({
                totalRequests: requestsCount || 0,
                recentActivity: requests?.length || 0,
                totalFiles: filesCount || 0,
                averageAnalysisTime: '12s' // Mock for now
            });
        } catch (err) {
            console.error("Admin Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = recentRequests.filter((request) => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
            return true;
        }

        const email = Array.isArray(request.users)
            ? request.users[0]?.email || ''
            : request.users?.email || '';

        return (
            email.toLowerCase().includes(query) ||
            request.user_id.toLowerCase().includes(query) ||
            request.input_type.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-emerald-500" /> ExplainForge <span className="text-emerald-500">Monitor</span>
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">Analyze project explanation engine activity and AI orchestration usage.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button onClick={fetchAdminData} variant="outline" className="border-white/5 bg-white/5 text-xs font-bold uppercase tracking-widest px-6 rounded-xl hover:bg-white/10">
                        Refresh Engine
                    </Button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Analyses', value: stats.totalRequests, icon: <Activity className="w-5 h-5 text-emerald-400" />, color: 'emerald' },
                    { label: 'Documents Processed', value: stats.totalFiles, icon: <FileText className="w-5 h-5 text-blue-400" />, color: 'blue' },
                    { label: 'Recent Cycles', value: stats.recentActivity, icon: <Activity className="w-5 h-5 text-purple-400" />, color: 'purple' },
                    { label: 'Latency (Avg)', value: stats.averageAnalysisTime, icon: <Activity className="w-5 h-5 text-amber-400" />, color: 'amber' }
                ].map((stat, i) => (
                    <Card key={i} glass className="p-6 border-white/5 bg-white/[0.02]">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10`}>{stat.icon}</div>
                            <Badge variant="outline" className="text-[9px] border-white/5 text-slate-500 uppercase font-black tracking-widest">Global</Badge>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-1">{stat.label}</div>
                            <div className="text-3xl font-black text-white italic">{stat.value}</div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Table Section */}
            <Card glass className="border-white/5 overflow-hidden bg-white/[0.01]">
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h2 className="text-sm font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-500" /> Neural Activity Log
                    </h2>
                    
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search by User or ID..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Analyzed User</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Input Method</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Files</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500/50 mx-auto mb-4" />
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Loading Neural Logs...</p>
                                    </td>
                                </tr>
                            ) : recentRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-6 h-6 text-slate-700" />
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">No activity found yet</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => (
                                    <tr key={req.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white mb-0.5 truncate max-w-[200px]">
                                                    {Array.isArray(req.users) ? req.users[0]?.email || 'Anonymous' : req.users?.email || 'Anonymous'}
                                                </span>
                                                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter">{req.user_id}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge variant="outline" className={`px-2.5 py-0.5 rounded-full border-none font-black text-[9px] uppercase tracking-widest ${
                                                req.input_type === 'file' ? 'bg-blue-500/10 text-blue-400' :
                                                req.input_type === 'github' ? 'bg-purple-500/10 text-purple-400' :
                                                'bg-emerald-500/10 text-emerald-400'
                                            }`}>
                                                {req.input_type}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-3.5 h-3.5 text-slate-600" />
                                                <span className="text-xs font-bold text-slate-400">{req.explainforge_files?.length || 0} Docs</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-slate-300">{new Date(req.created_at).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-slate-500 font-medium">{new Date(req.created_at).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-emerald-500">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Stored</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Button variant="outline" className="h-9 w-9 p-0 rounded-lg border-white/5 bg-white/5 hover:bg-white/10 group-hover:border-emerald-500/30 transition-all">
                                                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-500" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-white/[0.01] flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Showing 10 most recent neural cycles</p>
                    <div className="flex items-center gap-4">
                        <Button disabled variant="outline" className="h-9 px-4 rounded-lg border-white/5 text-slate-600 opacity-50">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button disabled variant="outline" className="h-9 px-4 rounded-lg border-white/5 text-slate-600 opacity-50">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
