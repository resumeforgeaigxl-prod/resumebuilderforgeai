'use client';
import { useState, useEffect } from 'react';
import { CopyCheck, Loader2, Search, Calendar, User, Building, Briefcase } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface MockTestRow {
    id: string; company_name: string; job_title: string; total_questions: number;
    created_at: string; user_email: string;
}

export default function AdminMockTestsPage() {
    const [tests, setTests] = useState<MockTestRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    async function loadTests() {
        setLoading(true);
        const res = await fetch('/api/admin/mock-tests');
        const data = await res.json();
        if (data.success) setTests(data.tests);
        setLoading(false);
    }

    useEffect(() => { loadTests(); }, []);

    const filtered = tests.filter(t =>
        t.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        t.job_title?.toLowerCase().includes(search.toLowerCase()) ||
        t.user_email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><CopyCheck className="w-6 h-6 text-orange-400" />Mock Test Monitoring</h1>
                    <p className="text-slate-500 text-sm mt-1">{tests.length} tests generated</p>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search company, role or email…"
                        className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 w-full sm:w-64" />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-orange-400" /></div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px]">
                        <thead className="border-b border-white/10 bg-white/5">
                            <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                                <th className="px-5 py-3">Test ID / User</th>
                                <th className="px-5 py-3">Target Company</th>
                                <th className="px-5 py-3">Target Role</th>
                                <th className="px-5 py-3 text-center">Questions</th>
                                <th className="px-5 py-3">Generated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(t => (
                                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2 text-white font-medium mb-1">
                                            <Link href={`/mock-test/${t.id}`} target="_blank" className="hover:text-orange-400 transition-colors">
                                                {t.id.split('-')[0]}...
                                            </Link>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400 text-xs text-slate-400">
                                            <User className="w-3.5 h-3.5 text-slate-500" />
                                            {t.user_email}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5 text-white font-semibold">
                                            <Building className="w-4 h-4 text-slate-500" />
                                            {t.company_name}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-slate-300">
                                        <div className="flex items-center gap-1.5">
                                            <Briefcase className="w-4 h-4 text-slate-500" />
                                            {t.job_title}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 font-medium">
                                            {t.total_questions}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-slate-500" />
                                            {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <div className="text-center py-12 text-slate-500">No mock tests found matching your search.</div>}
                </div>
            )}
        </div>
    );
}
