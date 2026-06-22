'use client'
export const dynamic = 'force-dynamic';
;

import { useState, useEffect } from 'react';
import {
    CheckCircle2, XCircle, Edit3, Loader2,
    Search, ShieldCheck, Building2, Briefcase,
    Layers, HelpCircle, MessageSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { InterviewSubmission } from '@/types/interview-prep';

export default function InterviewModerationPage() {
    const [submissions, setSubmissions] = useState<InterviewSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/interview-moderation');
            const result = await res.json();
            if (result.success) setSubmissions(result.data);
        } catch {
            console.error('Failed to fetch submissions');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (submissionId: string, action: 'approve' | 'reject') => {
        setProcessingId(submissionId);
        try {
            const res = await fetch('/api/admin/interview-moderation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ submissionId, action })
            });
            const result = await res.json();
            if (result.success) {
                setSubmissions(s => s.filter(item => item.id !== submissionId));
            } else {
                alert(result.error || 'Action failed');
            }
        } catch {
            alert('Request failed');
        } finally {
            setProcessingId(null);
        }
    };

    const filtered = submissions.filter(s =>
        s.company_name.toLowerCase().includes(filter.toLowerCase()) ||
        s.role_name.toLowerCase().includes(filter.toLowerCase()) ||
        s.question_text.toLowerCase().includes(filter.toLowerCase())
    );

    const pendingCount = submissions.filter(s => s.status === 'pending').length;

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-[#FAFAFA] text-[#171717]">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3 italic">
                        <ShieldCheck className="w-10 h-10 text-indigo-600" />
                        Intelligence Moderation
                    </h1>
                    <p className="text-[#8F8F8F] font-bold mt-2 uppercase tracking-widest text-xs">
                        Review and verify crowdsourced interview data ({pendingCount} pending)
                    </p>
                </div>

                <div className="relative group min-w-[320px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8F8F8F] group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        placeholder="Search company, role or content..."
                        className="w-full pl-12 pr-6 py-4 bg-white border border-[#EBEBEB] rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <p className="text-[#8F8F8F] font-black animate-pulse uppercase tracking-widest text-xs">Syncing Submissions...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {filtered.map(sub => (
                        <div key={sub.id} className="relative group bg-white border border-[#EBEBEB] hover:border-indigo-500/30 rounded-[2rem] overflow-hidden transition-all duration-500">
                            {/* Card Top Section: Context Tags */}
                            <div className="p-8 border-b border-[#EBEBEB]">
                                <div className="flex flex-wrap items-center gap-3 mb-6">
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest">
                                        <Building2 className="w-3.5 h-3.5" /> {sub.company_name}
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-500/20 text-[10px] font-black uppercase tracking-widest">
                                        <Briefcase className="w-3.5 h-3.5" /> {sub.role_name}
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-500/10 text-[#8F8F8F] border border-slate-500/20 text-[10px] font-black uppercase tracking-widest">
                                        <Layers className="w-3.5 h-3.5" /> {sub.round_type}
                                    </div>
                                    <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${sub.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20' : sub.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                        {sub.difficulty}
                                    </div>
                                </div>

                                {/* The Content */}
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0">
                                            <HelpCircle className="w-5 h-5 text-[#8F8F8F]" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-[#8F8F8F] uppercase tracking-widest block mb-2">Question Text</label>
                                            <p className="text-xl font-medium leading-relaxed text-[#171717]">
                                                {sub.question_text}
                                            </p>
                                        </div>
                                    </div>

                                    {sub.notes && (
                                        <div className="flex gap-4 p-5 rounded-2xl bg-white border border-[#EBEBEB]">
                                            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shrink-0">
                                                <MessageSquare className="w-4 h-4 text-[#8F8F8F]" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-[#8F8F8F] uppercase tracking-widest block mb-1">Additional Notes</label>
                                                <p className="text-xs text-[#8F8F8F] italic font-medium leading-relaxed">
                                                    &quot;{sub.notes}&quot;
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Bottom: Metadata & Actions */}
                            <div className="px-8 py-6 bg-white/[0.02] flex items-center justify-between">
                                <div className="text-[10px] text-[#8F8F8F] font-bold uppercase tracking-widest flex items-center gap-2">
                                    Submitted {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleAction(sub.id, 'reject')}
                                        disabled={processingId === sub.id}
                                        className="p-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-[#171717] transition-all border border-rose-500/20 disabled:opacity-50"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                    <button className="p-3 rounded-xl bg-slate-500/10 text-emerald-600 hover:bg-slate-700 transition-all border border-[#EBEBEB]">
                                        <Edit3 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleAction(sub.id, 'approve')}
                                        disabled={processingId === sub.id}
                                        className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#171717] font-black rounded-2xl transition-all shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
                                    >
                                        {processingId === sub.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="col-span-full py-24 text-center">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck className="w-10 h-10 text-[#8F8F8F]" />
                            </div>
                            <h3 className="text-xl font-black text-[#171717] italic">Queue is Clean</h3>
                            <p className="text-[#8F8F8F] text-sm mt-2 font-bold uppercase tracking-widest">No pending submissions found matching your search.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
