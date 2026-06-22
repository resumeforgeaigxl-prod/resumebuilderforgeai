'use client'
export const dynamic = 'force-dynamic';
;
import { useState, useEffect } from 'react';
import { ScrollText, Loader2, Search, Calendar, Shield } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface AdminLog {
    id: string; action: string; target_id: string; metadata: Record<string, unknown> | null;
    created_at: string; admin_email: string;
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    async function loadLogs() {
        setLoading(true);
        const res = await fetch('/api/admin/logs');
        const data = await res.json();
        if (data.success) setLogs(data.logs);
        setLoading(false);
    }

    useEffect(() => { loadLogs(); }, []);

    const filtered = logs.filter(l =>
        l.action?.toLowerCase().includes(search.toLowerCase()) ||
        l.admin_email?.toLowerCase().includes(search.toLowerCase()) ||
        l.target_id?.toLowerCase().includes(search.toLowerCase())
    );

    function formatAction(action: string) {
        return action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    return (
        <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><ScrollText className="w-6 h-6 text-indigo-600" />Audit Logs</h1>
                    <p className="text-[#8F8F8F] text-sm mt-1">Recent {logs.length} administrative actions</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8F8F]" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search action or admin…"
                        className="pl-9 pr-4 py-2 bg-white border border-[#EBEBEB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-full sm:w-64" />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
            ) : (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px]">
                        <thead className="border-b border-[#EBEBEB] bg-white">
                            <tr className="text-left text-xs text-[#8F8F8F] uppercase tracking-wider">
                                <th className="px-5 py-3">Timestamp / Log ID</th>
                                <th className="px-5 py-3">Administrator</th>
                                <th className="px-5 py-3">Action Type</th>
                                <th className="px-5 py-3">Target ID</th>
                                <th className="px-5 py-3">Metadata</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBEBEB]">
                            {filtered.map(l => (
                                <tr key={l.id} className="hover:bg-white transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5 font-medium text-[#171717] mb-1">
                                            <Calendar className="w-4 h-4 text-[#8F8F8F]" />
                                            {format(new Date(l.created_at), 'MMM dd, yyyy HH:mm:ss')}
                                        </div>
                                        <div className="text-xs text-[#8F8F8F] font-mono">
                                            {formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-[#8F8F8F]" />
                                            <span className="font-semibold text-[#4D4D4D]">{l.admin_email}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${l.action.includes('delete') || l.action.includes('block')
                                            ? 'bg-red-50 border border-red-100 text-red-600'
                                            : l.action.includes('upgrade') || l.action.includes('extend')
                                                ? 'bg-emerald-50 border border-emerald-100 text-emerald-600'
                                                : 'bg-indigo-50 border border-indigo-100 text-indigo-600'
                                            }`}>
                                            {formatAction(l.action)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 font-mono text-xs text-[#8F8F8F]">
                                        {l.target_id || <span className="text-[#8F8F8F]">—</span>}
                                    </td>
                                    <td className="px-5 py-4">
                                        {l.metadata && Object.keys(l.metadata).length > 0 ? (
                                            <pre className="text-[10px] font-mono bg-black/40 p-2 rounded-lg border border-[#EBEBEB] text-[#4D4D4D] max-w-[200px] overflow-auto">
                                                {JSON.stringify(l.metadata, null, 2)}
                                            </pre>
                                        ) : (
                                            <span className="text-[#8F8F8F]">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div className="text-center py-12 text-[#8F8F8F]">No logs found matching your search.</div>}
                </div>
            )}
        </div>
    );
}
