'use client';

import { useState, useEffect } from 'react';
import {
    Search, Building2, Zap, Star, ShieldCheck,
    Trophy, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CompanyOverview {
    id: string;
    name: string;
    industry: string;
    logo_url: string;
    role_count: number;
    question_count: number;
}

export default function InterviewPrepLanding() {
    const [search, setSearch] = useState('');
    const [companies, setCompanies] = useState<CompanyOverview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch companies with counts
        fetch('/api/interview-prep/companies')
            .then(r => r.json())
            .then(d => { if (d.success) setCompanies(d.data); })
            .finally(() => setLoading(false));
    }, []);

    const filtered = companies.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.industry?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
            {/* Hero Section */}
            <div className="relative pt-32 pb-24 px-4 sm:px-8 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full -z-10" />

                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8"
                    >
                        <ShieldCheck className="w-4 h-4" /> Real-World Interview Data
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl sm:text-8xl font-black text-white tracking-tighter mb-8 italic leading-[0.9]"
                    >
                        Prepare with <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-200 to-slate-500">
                            Actual Questions
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 text-lg sm:text-2xl max-w-3xl mx-auto leading-relaxed mb-12 font-medium"
                    >
                        Don&apos;t practice with random AI prompts. Access a verified bank of real interview questions asked by top tech giants, shared by successful candidates.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-2xl mx-auto relative group"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Find your target company (e.g. Amazon, Zomato, Google)..."
                            className="w-full pl-16 pr-8 py-7 bg-white/5 border border-white/10 group-focus-within:border-indigo-500/50 rounded-[2rem] text-xl font-medium outline-none transition-all placeholder:text-slate-600 backdrop-blur-xl"
                        />
                    </motion.div>

                    {/* Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap justify-center gap-12 mt-16 text-xs font-black uppercase tracking-widest text-slate-500"
                    >
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-400" /> 10k+ Verified Questions
                        </div>
                        <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-indigo-400" /> 500+ Top Companies
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-emerald-400" /> Updated Daily
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map((company, i) => (
                        <motion.button
                            key={company.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => window.location.href = `/interview-prep/${company.name.toLowerCase()}`}
                            className="group text-left"
                        >
                            <div className="relative h-full p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-indigo-500/30 hover:bg-white/10 transition-all duration-500 overflow-hidden">
                                <div className="absolute -top-8 -right-8 w-24 h-24 bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all" />

                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500">
                                        {company.logo_url ? (
                                            <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Building2 className="w-8 h-8 text-indigo-400" />
                                        )}
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all text-slate-600">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-white italic tracking-tight mb-2">
                                    {company.name}
                                </h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-6">
                                    {company.industry || 'Technology'}
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Roles</div>
                                        <div className="text-white font-black text-xl">{company.role_count || 0}</div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Questions</div>
                                        <div className="text-indigo-400 font-black text-xl">{company.question_count || 0}</div>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                    <Zap className="w-4 h-4" /> See Interview Insights
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {filtered.length === 0 && !loading && (
                    <div className="py-24 text-center">
                        <Trophy className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-white italic">Expansion in Progress</h3>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">
                            We haven&apos;t verified an interview for this company yet. <br />
                            <button onClick={() => window.location.href = '/dashboard/interview-prep/share'} className="text-indigo-400 hover:underline mt-4">Be the first to share your experience &rarr;</button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
