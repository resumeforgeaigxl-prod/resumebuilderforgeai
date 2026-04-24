'use client'
export const dynamic = 'force-dynamic';
;

import { useState, useEffect } from 'react';
import { Bell, Loader2, Search, User, MapPin, Briefcase, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface AlertRow {
    user_id: string;
    user_email: string;
    skills: string[];
    locations: string[];
    frequency: string;
    created_at: string;
}

export default function AdminJobAlertsPage() {
    const [alerts, setAlerts] = useState<AlertRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/admin/job-alerts')
            .then(r => r.json())
            .then(d => { if (d.success) setAlerts(d.alerts); })
            .finally(() => setLoading(false));
    }, []);

    const filtered = alerts.filter(a =>
        a.user_email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="w-6 h-6 text-indigo-400" /> Job Alert Subscriptions
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">{alerts.length} active monitors</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search user email…"
                        className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-72"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map(alert => (
                        <div key={alert.user_id} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col gap-6">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-bold truncate">{alert.user_email}</p>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3" /> Since {format(new Date(alert.created_at), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase rounded-lg">
                                    {alert.frequency}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1.5">
                                        <Briefcase className="w-3 h-3" /> Target Skills
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {alert.skills.map(s => (
                                            <span key={s} className="px-2 py-1 bg-white/5 border border-white/5 rounded-md text-[10px] text-slate-400">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest flex items-center gap-1.5">
                                        <MapPin className="w-3 h-3" /> Locations
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {alert.locations.map(l => (
                                            <span key={l} className="px-2 py-1 bg-white/5 border border-white/5 rounded-md text-[10px] text-slate-400">{l}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-full py-20 text-center text-slate-500 bg-white/5 border border-dashed border-white/10 rounded-[3rem]">
                            No alert subscriptions found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
