'use client';

import { useState, useEffect } from 'react';
import { Compass, Loader2, Search, User, Calendar, ExternalLink, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface RoadmapRow {
    id: string;
    user_id: string;
    user_email: string;
    user_name: string;
    target_role: string;
    experience_level: string;
    time_available: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    roadmap_json: any;
    created_at: string;
}

export default function AdminRoadmapsPage() {
    const [roadmaps, setRoadmaps] = useState<RoadmapRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/admin/roadmaps')
            .then(r => r.json())
            .then(d => { if (d.success) setRoadmaps(d.roadmaps); })
            .finally(() => setLoading(false));
    }, []);

    const filtered = roadmaps.filter(r =>
        r.user_email.toLowerCase().includes(search.toLowerCase()) ||
        r.target_role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Compass className="w-6 h-6 text-indigo-400" /> AI Career Roadmaps
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">{roadmaps.length} total generated roadmaps</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search email or role…"
                        className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-72"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map(roadmap => (
                        <div key={roadmap.id} className="p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                                    <Compass className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-white truncate">{roadmap.target_role}</h3>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{roadmap.experience_level} &bull; {roadmap.time_available}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <User className="w-3.5 h-3.5" />
                                    <span className="truncate">{roadmap.user_email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{format(new Date(roadmap.created_at), 'MMM dd, yyyy')}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                                <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all flex items-center gap-2">
                                    <ExternalLink className="w-3.5 h-3.5" /> View JSON
                                </button>
                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{roadmap.roadmap_json?.steps?.length || 0} Steps</span>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 bg-white/5 border border-dashed border-white/10 rounded-[2rem]">
                            No roadmaps found matching your search.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
