'use client';

import { useState } from 'react';
import { Play, Loader2, Database, Zap, Search, RefreshCcw } from 'lucide-react';

export default function JobCollectorClient() {
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [status, setStatus] = useState<string>('');

    const runAction = async (action: 'collector' | 'sync' | 'dedupe', label: string) => {
        setLoading(prev => ({ ...prev, [action]: true }));
        setStatus(`Running ${label}...`);

        try {
            let res;
            if (action === 'collector') {
                res = await fetch('/api/jobs/collector?limit=20');
            } else if (action === 'sync') {
                res = await fetch('/api/jobs/sync');
            } else {
                // For dedupe, we call a utility or just trigger sync which dedupes
                setStatus('Deduplication is handled automatically by the ingestion engine.');
                setLoading(prev => ({ ...prev, [action]: false }));
                return;
            }

            const data = await res.json();
            if (data.success) {
                setStatus(`Success: ${JSON.stringify(data.summary || data.stats || 'Action completed')}`);
            } else {
                setStatus(`Error: ${data.detail || data.error}`);
            }
        } catch {
            setStatus('Failed to connect to API');
        } finally {
            setLoading(prev => ({ ...prev, [action]: false }));
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-8 border-indigo-500/20 bg-indigo-500/5 group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Collector Run</h3>
                            <p className="text-sm text-slate-500">Run targeted AI discovery for top tiers.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => runAction('collector', 'Collector')}
                        disabled={loading.collector}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading.collector ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                        Start Collector
                    </button>
                </div>

                <div className="glass-card p-8 border-white/5 bg-white/2 group">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <RefreshCcw className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Full Global Sync</h3>
                            <p className="text-sm text-slate-500">Sync with JSearch, Adzuna, and Apify.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => runAction('sync', 'Full Sync')}
                        disabled={loading.sync}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading.sync ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                        Run Global Sync
                    </button>
                </div>
            </div>

            {status && (
                <div className="glass-card p-4 border-indigo-500/30 bg-indigo-500/5 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-sm font-mono text-indigo-200 break-all">{status}</span>
                    </div>
                </div>
            )}

            <div className="glass-card p-8 border-white/5 bg-slate-900/40">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-white">Stored Intelligence</h3>
                        <p className="text-sm text-slate-500">Search and audit jobs stored in the global vault.</p>
                    </div>
                    <div className="flex gap-4">
                         <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="text" 
                                placeholder="Filter by company or role..."
                                className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                         </div>
                    </div>
                </div>
                
                <div className="p-0">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-white/2 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Company</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4 text-right">Added</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr className="animate-pulse">
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-medium italic">
                                    Feature audit trail ready. Database is live-syncing.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="glass-card overflow-hidden border-white/5 bg-slate-900/40">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-bold text-white">Governance & Management</h3>
                    <div className="flex gap-2">
                         <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-slate-500 font-black uppercase tracking-widest">System Operational</div>
                    </div>
                </div>
                <div className="p-0">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-white/2 text-slate-400 uppercase text-[10px] font-black tracking-widest">
                                <th className="px-6 py-4">Tool</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr>
                                <td className="px-6 py-4 font-medium text-white">Automatic Deduplicator</td>
                                <td className="px-6 py-4 text-slate-400 font-medium">Title + Company + Location Hash</td>
                                <td className="px-6 py-4 text-emerald-400 font-bold text-right text-[10px] uppercase">Enforced</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-medium text-white">Gemini Extractors</td>
                                <td className="px-6 py-4 text-slate-400 font-medium">Desc Extraction & Normalization</td>
                                <td className="px-6 py-4 text-indigo-400 font-bold text-right text-[10px] uppercase">Active</td>
                            </tr>
                             <tr>
                                <td className="px-6 py-4 font-medium text-white">Search Discovery</td>
                                <td className="px-6 py-4 text-slate-400 font-medium">Combined Target Tiers</td>
                                <td className="px-6 py-4 text-blue-400 font-bold text-right text-[10px] uppercase">Ready</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
