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
            const res = await fetch(`/api/jobs/fetch?source=${source}`);
            const data = await res.json();

            if (data.success) {
                const result = data.summary[source];
                setMessages(prev => ({ 
                    ...prev, 
                    [source]: `Success: ${result.inserted} new jobs inserted (${result.skipped} skipped)` 
                }));
                // Update stats
                setStats(prev => ({ ...prev, [source]: prev[source] + result.inserted }));
            } else {
                setMessages(prev => ({ ...prev, [source]: `Error: ${data.detail || 'Unknown error'}` }));
            }
        } catch {
            setMessages(prev => ({ ...prev, [source]: 'Failed to connect to API' }));
        } finally {
            setLoading(prev => ({ ...prev, [source]: false }));
        }
    };

    const sources = [
        { id: 'jsearch', name: 'JSearch API', icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { id: 'adzuna', name: 'Adzuna API', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { id: 'apify', name: 'Apify Scraper', icon: Globe, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        { id: 'jobforgecollector', name: 'JobForgeCollector AI', icon: Shield, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    ];

    return (
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
                            <div className="text-2xl font-bold text-white">{stats[source.id].toLocaleString()}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Total Jobs</div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between gap-4">
                        <div className="flex-1">
                            {messages[source.id] && (
                                <p className={`text-xs font-medium ${messages[source.id].includes('Error') ? 'text-red-400' : 'text-indigo-400'} animate-in fade-in slide-in-from-left-2`}>
                                    {messages[source.id]}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => runIngestion(source.id)}
                            disabled={loading[source.id]}
                            className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
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
    );
}
