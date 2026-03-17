'use client';

import { useState } from 'react';
import { Play, Loader2, Database, Zap, Globe, Shield } from 'lucide-react';

export default function JobSourcesClient({ initialStats }: { initialStats: Record<string, number> }) {
    const [stats, setStats] = useState(initialStats);
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [messages, setMessages] = useState<Record<string, string>>({});

    const runIngestion = async (source: string) => {
        setLoading(prev => ({ ...prev, [source]: true }));
        setMessages(prev => ({ ...prev, [source]: 'Running pipeline...' }));

        try {
            const query = source === 'apify' && apifyUrl ? `&url=${encodeURIComponent(apifyUrl)}` : '';
            const res = await fetch(`/api/jobs/fetch?source=${source}${query}`);
            const data = await res.json();

            if (data.success) {
                const result = data.summary[source];
                const msg = `Fetched: ${result.total} | Inserted: ${result.inserted} | Skipped: ${result.skipped} | Failed: ${result.failed || 0}`;
                setMessages(prev => ({ ...prev, [source]: msg }));
                // Update stats
                setStats(prev => ({ ...prev, [source]: prev[source] + result.inserted }));
            } else {
                setMessages(prev => ({ ...prev, [source]: `Failed: ${data.detail || data.error || 'Server Error'}` }));
            }
        } catch {
            setMessages(prev => ({ ...prev, [source]: 'Connection Error: Check server status.' }));
        } finally {
            setLoading(prev => ({ ...prev, [source]: false }));
        }
    };

    const runGlobalSync = async () => {
        setLoading(prev => ({ ...prev, global: true }));
        try {
            const res = await fetch('/api/jobs/sync');
            const data = await res.json();
            if (data.success) {
                alert('Global Sync Completed successfully');
                window.location.reload();
            }
        } catch {
            alert('Global Sync Failed');
        } finally {
            setLoading(prev => ({ ...prev, global: false }));
        }
    };

    const runDeduplication = async () => {
        setLoading(prev => ({ ...prev, dedupe: true }));
        try {
            const res = await fetch('/api/jobs/deduplicate', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                alert(`Deduplication Success: ${data.count?.[0]?.deleted_count || 0} duplicate jobs removed.`);
                window.location.reload();
            } else {
                alert(`Deduplication Error: ${data.error}`);
            }
        } catch {
            alert('Failed to run deduplication');
        } finally {
            setLoading(prev => ({ ...prev, dedupe: false }));
        }
    };

    const sources = [
        { id: 'jsearch', name: 'JSearch API', icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { id: 'adzuna', name: 'Adzuna API', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { id: 'apify', name: 'Apify Scraper', icon: Globe, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        { id: 'jobforgecollector', name: 'JobForgeCollector AI', icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    ];

    const [apifyUrl, setApifyUrl] = useState('');

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap gap-4 items-center justify-between glass-card p-6">
                <div>
                    <h2 className="text-xl font-bold text-white">Advanced Controls</h2>
                    <p className="text-sm text-slate-500">Global orchestration operations for the JobForge pipeline.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={runDeduplication}
                        disabled={loading.dedupe}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-500/20 transition-all disabled:opacity-50"
                    >
                        {loading.dedupe ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                        Remove Duplicates
                    </button>
                    <button
                        onClick={runGlobalSync}
                        disabled={loading.global}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                    >
                        {loading.global ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                        Run Global Sync
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sources.map(source => (
                    <div key={source.id} className="glass-card p-8 group relative overflow-hidden">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-xl ${source.bg} flex items-center justify-center`}>
                                    <source.icon className={`w-6 h-6 ${source.color}`} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{source.name}</h3>
                                    <p className="text-sm text-slate-500">Manual trigger for legacy and AI sources.</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white">{(stats[source.id] || 0) .toLocaleString()}</div>
                                <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Total Jobs</div>
                            </div>
                        </div>

                        {source.id === 'apify' && (
                            <div className="mt-6">
                                <input 
                                    type="text" 
                                    placeholder="Scrape specific job URL (optional)..."
                                    value={apifyUrl}
                                    onChange={(e) => setApifyUrl(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-orange-500/50"
                                />
                                {!apifyUrl && (
                                    <p className="text-[10px] text-slate-500 mt-2 px-1 italic">
                                        Note: Requires APIFY_LINKEDIN_DATASET_ID in .env.local for full scraping.
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="mt-8 flex items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                {messages[source.id] && (
                                    <p className={`text-[10px] font-mono leading-tight truncate ${messages[source.id].includes('Failed') ? 'text-red-400' : 'text-indigo-400'} animate-in fade-in slide-in-from-left-2`}>
                                        {messages[source.id]}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => runIngestion(source.id)}
                                disabled={loading[source.id]}
                                className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50 flex-shrink-0"
                            >
                                {loading[source.id] ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Play className="w-4 h-4" />
                                )}
                                Run Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card p-6 flex items-center justify-between bg-emerald-500/5 border-emerald-500/10">
                <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <Database className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold">Total Job Base</h4>
                        <p className="text-xs text-slate-500">Unified database count across all sources.</p>
                    </div>
                </div>
                <div className="text-2xl font-black text-emerald-400">
                    {Object.values(stats).reduce((a, b) => a + b, 0).toLocaleString()}
                </div>
            </div>
        </div>
    );
}
