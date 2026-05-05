"use client"

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Zap, Loader2, Sparkles, Filter, ChevronRight, Building2 } from 'lucide-react';
import { searchEngine } from '@/lib/search/mock-engine';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function JobSearchApp() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const handleSearch = async () => {
            setIsSearching(true);
            const data = await searchEngine.searchJobs(query);
            setResults(data);
            setIsSearching(false);
        };

        const timeoutId = setTimeout(handleSearch, 150); // Debounce
        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <div className="space-y-12 max-w-5xl mx-auto pb-24">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E2A42] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#00D4A0] font-bold tracking-widest text-[10px] uppercase mb-4">
                        <Zap className="w-3.5 h-3.5" /> High-Ticket Discovery
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">JobForge</h1>
                    <p className="text-slate-400 mt-2 text-lg">Instant discovery of career protocols filtered for high-authority alignment.</p>
                </div>
            </header>

            {/* Instant Search Bar */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00D4A0]/20 to-[#7C5CFC]/20 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-all duration-500" />
                <div className="relative flex items-center bg-[#0D1220] border border-[#1E2A42] rounded-2xl px-6 py-4 shadow-2xl">
                    <Search className="w-6 h-6 text-[#4A5568] mr-4" />
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by role, company, or tech stack (e.g. Staff Engineer, React, Google)..."
                        className="flex-1 bg-transparent border-none text-white text-lg focus:outline-none placeholder:text-[#4A5568]"
                    />
                    {isSearching ? (
                        <Loader2 className="w-5 h-5 text-[#00D4A0] animate-spin" />
                    ) : (
                        <Badge variant="outline" className="border-[#1E2A42] text-[#4A5568] text-[9px]">INSTANT_SEARCH</Badge>
                    )}
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-bold text-[#7A8BA8] uppercase tracking-widest flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        {results.length} Matching Opportunities
                    </h2>
                    <div className="text-[10px] text-[#4A5568] font-bold">LATEST UPDATES: JUST NOW</div>
                </div>

                {results.map((job) => (
                    <div key={job.id} className="p-6 rounded-2xl border border-[#1E2A42] bg-[#0D1220]/60 hover:border-[#00D4A0]/30 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[#00D4A0] group-hover:scale-110 transition-transform">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-[#00D4A0] transition-colors">{job.title}</h3>
                                        <p className="text-sm text-[#7A8BA8] font-semibold">{job.company}</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4 text-xs text-[#4A5568] font-medium">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" /> {job.location}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Briefcase className="w-3.5 h-3.5" /> Full-time
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[#00D4A0]">
                                        <DollarSign className="w-3.5 h-3.5" /> {job.salary}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex gap-2">
                                    {job.tags.map((tag: string) => (
                                        <Badge key={tag} className="bg-white/5 text-[#7A8BA8] border-white/10 hover:border-[#00D4A0]/30 transition-all font-bold text-[10px]">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                                <Button className="h-10 rounded-xl bg-[#00D4A0]/10 hover:bg-[#00D4A0]/20 text-[#00D4A0] border border-[#00D4A0]/20 px-4 font-bold text-xs uppercase tracking-wider group-hover:translate-x-1 transition-all">
                                    Apply <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                {results.length === 0 && !isSearching && (
                    <div className="p-12 text-center rounded-2xl border border-dashed border-[#1E2A42] bg-transparent">
                        <Sparkles className="w-8 h-8 text-[#4A5568] mx-auto mb-4" />
                        <h3 className="text-base font-bold text-[#7A8BA8] mb-1">No matches found</h3>
                        <p className="text-sm text-[#4A5568]">Try broadening your search query or adjusting your filters.</p>
                    </div>
                )}
            </div>

            {/* Career Insights Section */}
            <section className="p-8 rounded-2xl bg-[#0D1220]/60 border border-[#1E2A42]">
                <div className="max-w-3xl">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[#F5A623]" />
                        Market Pulse
                    </h2>
                    <p className="text-[#7A8BA8] text-sm leading-relaxed mb-6">
                        The current demand for <span className="text-[#00D4A0] font-bold">AI Engineering</span> and <span className="text-[#7C5CFC] font-bold">Distributed Systems</span> has increased by 42% this quarter. Companies are prioritizing candidates with demonstrated impact in scalable architectures.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-5 rounded-xl border border-[#1E2A42] bg-[#080B16]">
                            <div className="text-[10px] text-[#4A5568] uppercase tracking-wider font-semibold mb-1">New Listings Today</div>
                            <div className="text-xl font-bold text-white">1,248</div>
                        </div>
                        <div className="p-5 rounded-xl border border-[#1E2A42] bg-[#080B16]">
                            <div className="text-[10px] text-[#4A5568] uppercase tracking-wider font-semibold mb-1">Avg. Response Time</div>
                            <div className="text-xl font-bold text-[#00D4A0]">48 Hours</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
