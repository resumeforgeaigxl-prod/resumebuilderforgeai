'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
    FileText, Sparkles, Loader2, CheckCircle, AlertCircle,
    Download, Edit, Briefcase, Zap, Target,
    X, ChevronRight, PlusCircle
} from 'lucide-react';
import Link from 'next/link';
import { ResumeData, ResumeRecord } from '@/types/resume';

type OptimizationStep = 'SELECT' | 'OPTIMIZING' | 'RESULT';

interface AnalysisData {
    match_score: number;
    matched_keywords: string[];
    missing_keywords: string[];
    improvements: string[];
}

export default function ResumeOptimizePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const params = useParams() as { region?: string; lang?: string } | null;
    const region = params?.region ?? 'in';
    const lang = params?.lang ?? 'en';
    const jobId = searchParams?.get('jobId');
    const supabase = createClient();

    const [step, setStep] = useState<OptimizationStep>('SELECT');
    const [loading, setLoading] = useState(true);
    const [resumes, setResumes] = useState<ResumeRecord[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
    const [job, setJob] = useState<{ title: string; company: string; description: string; apply_url?: string } | null>(null);
    const [optimizingStatus, setOptimizingStatus] = useState(0);
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
    const [optimizedResume, setOptimizedResume] = useState<ResumeData | null>(null);
    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const steps = [
        "Analyzing job description",
        "Matching keywords",
        "Improving bullet points",
        "Generating optimized resume"
    ];

    useEffect(() => {
        if (!jobId) {
            router.push(`/${region}/${lang}/jobs`);
            return;
        }

        async function init() {
            setLoading(true);
            const [jobRes, resumeRes] = await Promise.all([
                supabase.from('jobs').select('*').eq('id', jobId).single(),
                supabase.from('resumes').select('*').order('updated_at', { ascending: false })
            ]);

            if (jobRes.data) setJob(jobRes.data);
            if (resumeRes.data) setResumes(resumeRes.data);
            setLoading(false);
        }

        init();
    }, [jobId, supabase, router, region, lang]);

    async function handleOptimize() {
        if (!selectedResumeId || !job) return;

        const selectedResume = resumes.find(r => r.id === selectedResumeId);
        if (!selectedResume) return;

        // Content check
        const rJson = selectedResume.resume_json as ResumeData;
        const hasContent = (rJson.experience?.length || 0) > 0 || (rJson.projects?.length || 0) > 0;

        if (!hasContent) {
            const proceed = window.confirm(
                "Your resume appears to be empty (no experience or projects). " +
                "Optimization works best on existing content. Do you want to continue anyway?"
            );
            if (!proceed) return;
        }

        setStep('OPTIMIZING');

        // Progress simulation
        const interval = setInterval(() => {
            setOptimizingStatus(prev => {
                if (prev >= steps.length - 1) return prev;
                return prev + 1;
            });
        }, 1500);

        try {
            const res = await fetch('/api/resume/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData: selectedResume.resume_json,
                    jobDescription: job.description
                })
            });

            const data = await res.json();
            clearInterval(interval);

            if (data.success) {
                setAnalysis(data.analysis);
                setOptimizedResume(data.optimizedData);
                setStep('RESULT');
            } else {
                alert('Optimization failed: ' + (data.error || 'Unknown error'));
                setStep('SELECT');
            }
        } catch (err) {
            console.error(err);
            clearInterval(interval);
            alert('Error during optimization');
            setStep('SELECT');
        }
    }

    async function handleSaveAndApply() {
        if (!jobId || !optimizedResume || !analysis) return;
        setSaving(true);
        try {
            const res = await fetch('/api/resume/save-optimized', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jobId: jobId,
                    originalResumeId: selectedResumeId,
                    optimizedResume: optimizedResume,
                    matchScore: analysis.match_score,
                    analysis: analysis
                })
            });

            const data = await res.json();
            if (data.success) {
                // For now, redirect to job's apply URL or dashboard
                if (job?.apply_url) {
                    window.open(job.apply_url, '_blank');
                }
                router.push(`/${region}/${lang}/dashboard`);
            }
        } finally {
            setSaving(false);
        }
    }

    async function handleDownload() {
        if (!optimizedResume) return;
        setDownloading(true);
        try {
            const res = await fetch('/api/resume/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData: optimizedResume,
                    template: resumes.find(r => r.id === selectedResumeId)?.template_selected || 'harvard'
                })
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Optimized_${job?.title || 'Resume'}.pdf`;
                a.click();
            }
        } finally {
            setDownloading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#070710] flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-[#070710] flex items-center justify-center text-white">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold">Job not found</h2>
                    <p className="text-slate-400 mt-2">The job you are looking for does not exist or has been removed.</p>
                    <Link href={`/${region}/${lang}/jobs`} className="mt-6 inline-block text-indigo-400 font-bold hover:underline">
                        Back to jobs
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#070710] py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">

                {/* ── SELECT RESUME STEP ── */}
                {step === 'SELECT' && (
                    <div className="space-y-8">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/20">
                                <Zap className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Optimize Your Resume</h1>
                            <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
                                Select a resume to tailor specifically for the <span className="text-indigo-400 font-bold">{job?.title}</span> role at <span className="text-indigo-400 font-bold">{job?.company}</span>.
                            </p>
                        </div>

                        {resumes.length === 0 ? (
                            <div className="bg-slate-900/40 border border-white/5 border-dashed rounded-[3rem] p-16 text-center">
                                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-white mb-2">You need a resume first</h3>
                                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Create a base resume before we can optimize it for this specific job.</p>
                                <Link
                                    href={`/${region}/${lang}/dashboard`}
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    <PlusCircle className="w-5 h-5" /> Create Resume
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {resumes.map(r => (
                                    <button
                                        key={r.id}
                                        onClick={() => setSelectedResumeId(r.id)}
                                        className={`p-6 rounded-3xl border text-left transition-all relative group ${selectedResumeId === r.id
                                            ? 'bg-indigo-500/10 border-indigo-500'
                                            : 'bg-slate-900/40 border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedResumeId === r.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                                                }`}>
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{r.title}</h3>
                                                <p className="text-xs text-slate-500">Updated {new Date(r.updated_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {selectedResumeId === r.id && (
                                            <div className="absolute top-4 right-4 text-indigo-500">
                                                <CheckCircle className="w-6 h-6 fill-indigo-500 text-slate-900" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {resumes.length > 0 && (
                            <div className="pt-8 flex justify-center">
                                <button
                                    onClick={handleOptimize}
                                    disabled={!selectedResumeId}
                                    className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-[0.2em] rounded-3xl flex items-center gap-3 transition-all active:scale-95 shadow-2xl shadow-indigo-500/20"
                                >
                                    <Sparkles className="w-5 h-5" /> Start Optimization
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── OPTIMIZING STEP (LOADING) ── */}
                {step === 'OPTIMIZING' && (
                    <div className="text-center space-y-12 py-12">
                        <div className="relative w-32 h-32 mx-auto">
                            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10" />
                            <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-10 h-10 text-indigo-500 animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl font-black text-white">Optimizing your resume...</h2>
                            <p className="text-slate-400">Tailoring your experience for the {job?.title} role.</p>
                        </div>

                        <div className="max-w-sm mx-auto space-y-4">
                            {steps.map((s, i) => (
                                <div key={i} className="flex items-center gap-4 text-left transition-all duration-500">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${i < optimizingStatus
                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500'
                                        : i === optimizingStatus
                                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-500 animate-pulse'
                                            : 'bg-slate-900 border-white/5 text-slate-700'
                                        }`}>
                                        {i < optimizingStatus ? <CheckCircle className="w-5 h-5" /> : <span className="text-xs font-bold">{i + 1}</span>}
                                    </div>
                                    <span className={`text-sm font-bold ${i < optimizingStatus ? 'text-slate-300' : i === optimizingStatus ? 'text-white' : 'text-slate-700'
                                        }`}>
                                        {s}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── RESULT STEP ── */}
                {step === 'RESULT' && analysis && (
                    <div className="space-y-8">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20">
                                <CheckCircle className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Optimization Complete!</h1>
                            <p className="text-slate-400 leading-relaxed">Your resume is now tailored and ready for submission.</p>
                        </div>

                        {/* Match Score Card */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem] text-center flex flex-col items-center justify-center">
                                <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Job Match Score</div>
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - analysis.match_score / 100)} className="text-indigo-500 transition-all duration-1000 ease-out" />
                                    </svg>
                                    <span className="absolute text-3xl font-black text-white">{analysis.match_score}%</span>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem]">
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Target className="w-4 h-4 text-indigo-400" /> Matched Keywords
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.matched_keywords.map((kw, i) => (
                                            <span key={i} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold">
                                                {kw}
                                            </span>
                                        ))}
                                        {analysis.matched_keywords.length === 0 && <p className="text-slate-500 text-xs mt-2 italic">None identified.</p>}
                                    </div>
                                </div>

                                <div className="bg-slate-900/40 border border-white/5 p-8 rounded-[3rem]">
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <X className="w-4 h-4 text-red-500" /> Missing Keywords
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.missing_keywords.map((kw, i) => (
                                            <span key={i} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold">
                                                {kw}
                                            </span>
                                        ))}
                                        {analysis.missing_keywords.length === 0 && <p className="text-slate-500 text-xs mt-2 italic">Your resume covers all key requirements!</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bullet Improvements */}
                        <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[3rem]">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-indigo-400" /> Key Improvements Made
                            </h3>
                            <div className="space-y-4">
                                {analysis.improvements.map((imp, i) => (
                                    <div key={i} className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-white/[0.07] transition-all">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                        <p className="text-sm text-slate-300 leading-relaxed font-medium">{imp}</p>
                                    </div>
                                ))}
                                {analysis.improvements.length === 0 && (
                                    <p className="text-slate-500 text-sm italic">Optimization applied throughout the professional experience and projects.</p>
                                )}
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="flex items-center justify-center gap-2 p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-white font-bold transition-all active:scale-95 disabled:opacity-50"
                            >
                                {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                Download PDF
                            </button>
                            <Link
                                href={`/${region}/${lang}/builder/${selectedResumeId}`}
                                className="flex items-center justify-center gap-2 p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-white font-bold transition-all active:scale-95"
                            >
                                <Edit className="w-5 h-5" />
                                Custom Edit
                            </Link>
                            <button
                                onClick={handleSaveAndApply}
                                disabled={saving}
                                className="flex items-center justify-center gap-2 p-6 bg-indigo-600 hover:bg-indigo-500 rounded-3xl text-white font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-indigo-600/30"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                                {job?.apply_url ? 'Apply Now' : 'Save & Exit'}
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
