"use client"
export const dynamic = 'force-dynamic';
;

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
    FileText, 
    Activity, 
    CheckCircle2,
    ExternalLink,
    Search,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Database
, Lightbulb } from 'lucide-react';
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
                    <h1 className="text-3xl font-black text-[#171717] tracking-tight uppercase italic flex items-center gap-3">
                        <Lightbulb className="w-8 h-8 text-emerald-500" /> ExplainForge <span className="text-emerald-500">Monitor</span>
                    </h1>
                    <p className="text-[#8F8F8F] mt-1 font-medium">Analyze project explanation engine activity and AI orchestration usage.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button onClick={fetchAdminData} variant="outline" className="border-[#EBEBEB] bg-white text-xs font-bold uppercase tracking-widest px-6 rounded-xl hover:bg-neutral-100">
                        Refresh Engine
                    </Button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Analyses', value: stats.totalRequests, icon: <Activity className="w-5 h-5 text-emerald-600" />, color: 'emerald' },
                    { label: 'Documents Processed', value: stats.totalFiles, icon: <FileText className="w-5 h-5 text-blue-600" />, color: 'blue' },
                    { label: 'Recent Cycles', value: stats.recentActivity, icon: <Activity className="w-5 h-5 text-purple-600" />, color: 'purple' },
                    { label: 'Latency (Avg)', value: stats.averageAnalysisTime, icon: <Activity className="w-5 h-5 text-amber-600" />, color: 'amber' }
                ].map((stat, i) => (
                    <Card key={i} glass className="p-6 border-[#EBEBEB] bg-white/[0.02]">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10`}>{stat.icon}</div>
                            <Badge variant="outline" className="text-[9px] border-[#EBEBEB] text-[#8F8F8F] uppercase font-black tracking-widest">Global</Badge>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-black text-[#8F8F8F] tracking-widest mb-1">{stat.label}</div>
                            <div className="text-3xl font-black text-[#171717] italic">{stat.value}</div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Table Section */}
            <Card glass className="border-[#EBEBEB] overflow-hidden bg-white/[0.01]">
                <div className="p-8 border-b border-[#EBEBEB] flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h2 className="text-sm font-black text-[#171717] uppercase italic tracking-widest flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-500" /> Neural Activity Log
                    </h2>
                    
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F] group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Search by User or ID..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="w-full bg-white border border-[#EBEBEB] rounded-xl pl-11 pr-4 py-2.5 text-xs text-[#4D4D4D] placeholder:text-[#8F8F8F] focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[#EBEBEB] bg-white/[0.02]">
                                <th className="px-8 py-4 text-[10px] font-black text-[#8F8F8F] uppercase tracking-widest">Analyzed User</th>
                                <th className="px-8 py-4 text-[10px] font-black text-[#8F8F8F] uppercase tracking-widest">Input Method</th>
                                <th className="px-8 py-4 text-[10px] font-black text-[#8F8F8F] uppercase tracking-widest">Files</th>
                                <th className="px-8 py-4 text-[10px] font-black text-[#8F8F8F] uppercase tracking-widest">Timestamp</th>
                                <th className="px-8 py-4 text-[10px] font-black text-[#8F8F8F] uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black text-[#8F8F8F] uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500/50 mx-auto mb-4" />
                                        <p className="text-[10px] font-black text-[#8F8F8F] uppercase tracking-widest">Loading Neural Logs...</p>
                                    </td>
                                </tr>
                            ) : recentRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-6 h-6 text-[#8F8F8F]" />
                                        </div>
                                        <p className="text-[#8F8F8F] text-sm font-medium uppercase tracking-widest">No activity found yet</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req) => (
                                    <tr key={req.id} className="border-b border-[#EBEBEB] hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-[#171717] mb-0.5 truncate max-w-[200px]">
                                                    {Array.isArray(req.users) ? req.users[0]?.email || 'Anonymous' : req.users?.email || 'Anonymous'}
                                                </span>
                                                <span className="text-[9px] font-mono text-[#8F8F8F] uppercase tracking-tighter">{req.user_id}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge variant="outline" className={`px-2.5 py-0.5 rounded-full border-none font-black text-[9px] uppercase tracking-widest ${
                                                req.input_type === 'file' ? 'bg-blue-50 text-blue-600' :
                                                req.input_type === 'github' ? 'bg-purple-50 text-purple-600' :
                                                'bg-emerald-50 text-emerald-600'
                                            }`}>
                                                {req.input_type}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-3.5 h-3.5 text-[#8F8F8F]" />
                                                <span className="text-xs font-bold text-[#8F8F8F]">{req.explainforge_files?.length || 0} Docs</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-[#4D4D4D]">{new Date(req.created_at).toLocaleDateString()}</span>
                                                <span className="text-[10px] text-[#8F8F8F] font-medium">{new Date(req.created_at).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-emerald-500">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Stored</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Button variant="outline" className="h-9 w-9 p-0 rounded-lg border-[#EBEBEB] bg-white hover:bg-neutral-100 group-hover:border-emerald-500/30 transition-all">
                                                <ExternalLink className="w-4 h-4 text-[#8F8F8F] group-hover:text-emerald-500" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-white/[0.01] flex items-center justify-between">
                    <p className="text-[10px] font-black text-[#8F8F8F] uppercase tracking-widest italic">Showing 10 most recent neural cycles</p>
                    <div className="flex items-center gap-4">
                        <Button disabled variant="outline" className="h-9 px-4 rounded-lg border-[#EBEBEB] text-[#8F8F8F] opacity-50">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button disabled variant="outline" className="h-9 px-4 rounded-lg border-[#EBEBEB] text-[#8F8F8F] opacity-50">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
