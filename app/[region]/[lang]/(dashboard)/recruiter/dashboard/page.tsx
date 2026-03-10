'use client';

import { useState, useEffect, useCallback } from 'react';

import { useRouter } from 'next/navigation';
import {
    Search, Filter, User, MapPin,
    Calendar, Briefcase,
    Star, Download, ExternalLink, ShieldCheck,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecruiterHubPage() {
    const router = useRouter();
    const [candidates, setCandidates] = useState<any[]>([]); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [authorizing, setAuthorizing] = useState(true);
    const [stats, setStats] = useState({ total_candidates: 0, new_resumes: 0 });

    // Filter states
    const [expFilters, setExpFilters] = useState<string[]>([]);
    const [typeFilters, setTypeFilters] = useState<string[]>([]);

    useEffect(() => {
        // Protect the page: only admin and recruiter allowed
        fetch('/api/user/profile')
            .then(r => r.json())
            .then(data => {
                if (!data.success || (data.user.role !== 'admin' && data.user.role !== 'recruiter')) {
                    router.push('/dashboard');
                } else {
                    setAuthorizing(false);
                }
            })
            .catch(() => router.push('/dashboard'));
    }, [router]);

    const handleSearch = useCallback(async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/recruiter/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, filters: { experience: expFilters, jobType: typeFilters } })
            });
            const data = await res.json();
            if (data.success) {
                setCandidates(data.candidates);
                setStats({ total_candidates: data.candidates.length, new_resumes: 12 }); // Mock stats
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [query, expFilters, typeFilters]);

    useEffect(() => {
        if (!authorizing) {
            handleSearch();
        }
    }, [authorizing, handleSearch]); // Trigger search on filter change or authorization


    if (authorizing) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-slate-400 font-bold">Verifying Access...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-12">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3" /> Recruiter Access
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tight">Talent Forge</h1>
                    <p className="text-slate-500 max-w-sm">Search and source top-tier candidates optimized by AI.</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 text-center min-w-[140px]">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Database Size</p>
                        <p className="text-3xl font-black text-white">{stats.total_candidates}</p>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 text-center min-w-[140px]">
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">New This Week</p>
                        <p className="text-3xl font-black text-white">+{stats.new_resumes}</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative group">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by role, skill, or experience (e.g. Senior Frontend Developer)"
                    className="w-full px-10 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-2xl text-white placeholder-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none backdrop-blur-xl"
                />
                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400">
                    <Search className="w-8 h-8" />
                </div>
                <button
                    type="submit"
                    className="absolute right-4 top-1/2 -translate-y-1/2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
                >
                    Search Profiles
                </button>
            </form>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Filters Sidebar */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Filter className="w-4 h-4 text-indigo-400" /> Advanced Filters
                        </h3>
                        <button
                            type="button"
                            onClick={() => { setExpFilters([]); setTypeFilters([]); }}
                            className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Experience Level</label>
                            <div className="space-y-2">
                                {['Entry Level', 'Junior (1-3y)', 'Mid-Level (3-5y)', 'Senior (5y+)'].map(lvl => {
                                    const active = expFilters.includes(lvl);
                                    return (
                                        <label key={lvl} className="flex items-center gap-3 cursor-pointer group select-none">
                                            <div
                                                onClick={() => {
                                                    if (active) setExpFilters(f => f.filter(x => x !== lvl));
                                                    else setExpFilters(f => [...f, lvl]);
                                                }}
                                                className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${active ? 'bg-indigo-500 border-indigo-500' : 'border-white/10 bg-white/5 group-hover:border-indigo-500'}`}
                                            >
                                                {active && <ShieldCheck className="w-3 h-3 text-white" />}
                                            </div>
                                            <span
                                                className={`text-sm transition-colors ${active ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-200'}`}
                                                onClick={() => {
                                                    if (active) setExpFilters(f => f.filter(x => x !== lvl));
                                                    else setExpFilters(f => [...f, lvl]);
                                                }}
                                            >
                                                {lvl}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Job Type</label>
                            <div className="space-y-2">
                                {['Full-time', 'Contract', 'Remote', 'Internship'].map(t => {
                                    const active = typeFilters.includes(t);
                                    return (
                                        <label key={t} className="flex items-center gap-3 cursor-pointer group select-none">
                                            <div
                                                onClick={() => {
                                                    if (active) setTypeFilters(f => f.filter(x => x !== t));
                                                    else setTypeFilters(f => [...f, t]);
                                                }}
                                                className={`w-5 h-5 rounded border transition-colors flex items-center justify-center ${active ? 'bg-indigo-500 border-indigo-500' : 'border-white/10 bg-white/5 group-hover:border-indigo-500'}`}
                                            >
                                                {active && <ShieldCheck className="w-3 h-3 text-white" />}
                                            </div>
                                            <span
                                                className={`text-sm transition-colors ${active ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-200'}`}
                                                onClick={() => {
                                                    if (active) setTypeFilters(f => f.filter(x => x !== t));
                                                    else setTypeFilters(f => [...f, t]);
                                                }}
                                            >
                                                {t}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Grid */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-24 space-y-4">
                            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                            <p className="text-slate-500 font-bold animate-pulse">Scanning candidate database...</p>
                        </div>
                    ) : candidates.length === 0 ? (
                        <div className="p-20 bg-slate-900/30 border border-white/5 border-dashed rounded-[3rem] text-center">
                            <User className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No candidates found</h3>
                            <p className="text-slate-500 text-sm">Try adjusting your filters or search terms.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            <AnimatePresence>
                                {candidates.map((c, idx) => (
                                    <motion.div
                                        key={c.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group bg-slate-900/40 border border-white/5 hover:border-indigo-500/30 rounded-[2rem] p-8 backdrop-blur-sm transition-all flex flex-col md:flex-row gap-8 items-center"
                                    >
                                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex-shrink-0 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                            {c.users?.profile_image ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={c.users.profile_image} alt={c.users?.full_name || 'Candidate'} className="w-full h-full rounded-3xl object-cover" />
                                            ) : (


                                                <User className="w-10 h-10" />
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-4 text-center md:text-left">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{c.users?.full_name || 'Anonymous Candidate'}</h3>
                                                    <p className="text-slate-400 font-bold">{c.title}</p>
                                                </div>
                                                <div className="flex items-center justify-center md:justify-end gap-2">
                                                    <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase rounded-lg">Top 5% Match</span>
                                                    <div className="flex text-amber-500">
                                                        <Star className="w-4 h-4 fill-current" />
                                                        <Star className="w-4 h-4 fill-current" />
                                                        <Star className="w-4 h-4 fill-current" />
                                                        <Star className="w-4 h-4 fill-current" />
                                                        <Star className="w-4 h-4 text-slate-700" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <MapPin className="w-3.5 h-3.5" /> India, Remote
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Briefcase className="w-3.5 h-3.5" /> 5+ Years Exp
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Calendar className="w-3.5 h-3.5" /> Last Active: {new Date(c.updated_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex md:flex-col gap-3">
                                            <button className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all shadow-lg active:scale-95">
                                                <ExternalLink className="w-5 h-5" />
                                            </button>
                                            <button className="p-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl transition-all border border-white/5 active:scale-95">
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
