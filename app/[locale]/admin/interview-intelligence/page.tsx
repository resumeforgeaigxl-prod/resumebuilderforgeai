'use client'
export const dynamic = 'force-dynamic';
;

import { useState, useEffect } from 'react';
import { TrendingUp, Loader2, Search, User } from 'lucide-react';
import { format } from 'date-fns';

interface ScoreRow {
    id: string;
    user_id: string;
    user_email: string;
    technical_score: number;
    communication_score: number;
    confidence_score: number;
    problem_solving_score: number;
    overall_readiness: number;
    suggestions: string[];
    created_at: string;
}

export default function AdminInterviewIntelPage() {
    const [scores, setScores] = useState<ScoreRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/admin/interview-intel')
            .then(r => r.json())
            .then(d => { if (d.success) setScores(d.scores); })
            .finally(() => setLoading(false));
    }, []);

    const filtered = scores.filter(s =>
        s.user_email.toLowerCase().includes(search.toLowerCase())
    );

    const avgReadiness = scores.length > 0
        ? (scores.reduce((sum, s) => sum + s.overall_readiness, 0) / scores.length).toFixed(1)
        : 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-indigo-600" /> Interview Intelligence
                    </h1>
                    <p className="text-[#8F8F8F] text-sm mt-1">Global platform performance: {avgReadiness}% Avg Readiness</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8F8F]" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search user email…"
                        className="pl-9 pr-4 py-2 bg-white border border-[#EBEBEB] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-full sm:w-72"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
            ) : (
                <div className="bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm min-w-[1000px]">
                        <thead className="border-b border-[#EBEBEB] bg-white">
                            <tr className="text-left text-xs text-[#8F8F8F] uppercase tracking-wider">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Readiness</th>
                                <th className="px-6 py-4">Technical</th>
                                <th className="px-6 py-4">Comm.</th>
                                <th className="px-6 py-4">Confidence</th>
                                <th className="px-6 py-4">Problem Solv.</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBEBEB]">
                            {filtered.map(score => (
                                <tr key={score.id} className="hover:bg-white transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                                                <User className="w-4 h-4 text-[#8F8F8F]" />
                                            </div>
                                            <span className="text-[#171717] font-medium">{score.user_email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 font-black">
                                            {score.overall_readiness}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-[#4D4D4D] font-mono">{score.technical_score}/10</td>
                                    <td className="px-6 py-4 text-[#4D4D4D] font-mono">{score.communication_score}</td>
                                    <td className="px-6 py-4 text-[#4D4D4D] font-mono">{score.confidence_score}</td>
                                    <td className="px-6 py-4 text-[#4D4D4D] font-mono">{score.problem_solving_score}</td>
                                    <td className="px-6 py-4 text-[#8F8F8F] text-xs">
                                        {format(new Date(score.created_at), 'MMM dd, HH:mm')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-indigo-600 hover:text-indigo-300 font-bold text-xs uppercase tracking-widest">
                                            Report
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="py-20 text-center text-[#8F8F8F]">No session data found.</div>
                    )}
                </div>
            )}
        </div>
    );
}
