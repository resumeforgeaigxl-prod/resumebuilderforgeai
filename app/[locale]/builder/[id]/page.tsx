'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ResumeData, ResumeExperience, ResumeProject, ResumeEducation, Certification, SkillCategory, TEMPLATE_LIST } from '@/types/resume';
import {
    Save, Sparkles, ArrowLeft, Plus, Trash2, Loader2,
    Building2, GraduationCap, Lightbulb, Wand2, Zap,
    AlertCircle, CheckCircle, X, Download, ExternalLink,
    Github, Layout, ChevronRight, Award
} from 'lucide-react';
import Link from 'next/link';
import { ResumeUpload } from '@/components/dashboard/resume-upload';
import { HealthScorePanel } from '@/components/builder/HealthScore';
import { JdMatcher } from '@/components/builder/JdMatcher';
import { VersionHistory } from '@/components/builder/VersionHistory';
import { BulletEnhancer } from '@/components/builder/BulletEnhancer';
import { ATSScoreResult } from '@/lib/ats-score';

const SKILL_CATEGORIES: string[] = ['Languages', 'Frontend', 'Backend', 'Databases', 'Cloud & DevOps', 'System Design', 'AI & Automation'];

import posthog from '@/lib/posthog';
import { CoverLetterModal } from '@/components/builder/cover-letter-modal';
import { ResumeIntelligence } from '@/components/builder/ResumeIntelligence';

type Step = 'edit' | 'template' | 'optimize' | 'download';

export default function BuilderPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const supabase = createClient();

    const [step, setStep] = useState<Step>('edit');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [optimizing, setOptimizing] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [originalResumeData, setOriginalResumeData] = useState<ResumeData | null>(null);
    const [optimizedResumeData, setOptimizedResumeData] = useState<ResumeData | null>(null);
    const [isReviewing, setIsReviewing] = useState(false);
    const [optimizationSuccess, setOptimizationSuccess] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [initialData, setInitialData] = useState('');
    const [title, setTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [showOptimizer, setShowOptimizer] = useState(false);
    const [atsResult, setAtsResult] = useState<ATSScoreResult | null>(null);
    const [isAtsLoading, setIsAtsLoading] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('harvard');
    const [couponCode, setCouponCode] = useState('');
    const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponApplied, setCouponApplied] = useState(false);
    const [faangMode, setFaangMode] = useState(false);
    const [userAccess, setUserAccess] = useState<boolean | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [isNotFound, setIsNotFound] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [showCoverLetter, setShowCoverLetter] = useState(false);

    useEffect(() => {
        fetch('/api/user/access').then(res => res.json()).then(data => {
            if (data.reason === 'unauthorized') {
                router.push('/login');
            } else {
                if (data.hasAccess !== undefined) setUserAccess(data.hasAccess);
                if (data.userId) setCurrentUserId(data.userId);
                setAuthLoading(false);
            }
        }).catch((err) => {
            console.error('[Builder] Access check failed:', err);
            setAuthLoading(false);
        });
    }, [router]);

    const fetchResume = useCallback(async (isRetry = false) => {
        if (authLoading || !id || !currentUserId) return;
        try {
            const { data, error } = await supabase.from('resumes').select('*').eq('id', id).single();
            if (error || !data) {
                console.error('[Builder] Resume fetch error:', error);
                if (!isRetry) {
                    setTimeout(() => fetchResume(true), 300);
                    return;
                }
                setIsNotFound(true);
                setLoading(false);
                return;
            }
            console.log('[Builder] Resume fetched:', {
                id: data.id,
                owner: data.user_id,
                currentUser: currentUserId
            });
            if (currentUserId && data.user_id !== currentUserId) {
                console.warn('[Builder] Access denied - Redirecting to dashboard', {
                    resumeOwner: data.user_id,
                    currentUser: currentUserId
                });
                router.push('/dashboard');
                return;
            }
            let rData = data.resume_json;
            if (typeof rData === 'string') { try { rData = JSON.parse(rData); } catch { /* ok */ } }
            setResumeData(rData as ResumeData);
            setInitialData(JSON.stringify(rData));
            setTitle(data.title);
            setSelectedTemplate(data.template_selected || 'harvard');
            setIsNotFound(false);
        } catch {
            if (!isRetry) setTimeout(() => fetchResume(true), 300);
            else setIsNotFound(true);
        } finally {
            setLoading(false);
        }
    }, [id, supabase, authLoading, currentUserId, router]);

    useEffect(() => { fetchResume(); }, [fetchResume]);

    const fetchATSScore = useCallback(async () => {
        if (!resumeData) return;
        setIsAtsLoading(true);
        try {
            const res = await fetch('/api/resume/ats-score', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData, jobDescription }),
            });
            const result = (await res.json()) as { success: boolean; scoreResult: ATSScoreResult };
            if (result.success) setAtsResult(result.scoreResult);
        } finally { setIsAtsLoading(false); }
    }, [resumeData, jobDescription]);

    useEffect(() => {
        const t = setTimeout(fetchATSScore, 1200);
        return () => clearTimeout(t);
    }, [fetchATSScore]);

    async function handleSave() {
        if (!resumeData) return;
        setSaving(true);
        await supabase.from('resumes').update({ resume_json: resumeData, title, updated_at: new Date().toISOString() }).eq('id', id);
        setInitialData(JSON.stringify(resumeData));
        setSaving(false);
    }

    async function handleSelectTemplate(tId: string) {
        setSelectedTemplate(tId);
        await supabase.from('resumes').update({ template_selected: tId }).eq('id', id);
        setStep('optimize');
    }

    async function handleGenerateSummary() {
        if (!resumeData) return;
        setIsGeneratingSummary(true);
        try {
            const res = await fetch('/api/resume/generate-summary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role: resumeData.experience?.[0]?.role || '',
                    skills: resumeData.skills?.join(', ') || '',
                    experienceText: resumeData.experience?.map(e => `${e.role} at ${e.company} (${e.duration})`).join('\n') || '',
                    educationText: resumeData.education?.map(e => `${e.degree} from ${e.school}`).join(', ') || '',
                    projectsText: resumeData.projects?.map(p => p.title).join(', ') || '',
                    jobDescription: jobDescription
                }),
            });
            const result = (await res.json()) as { success: boolean; summary: string };
            if (result.success) {
                setResumeData({ ...resumeData, summary: result.summary });
            }
        } finally {
            setIsGeneratingSummary(false);
        }
    }

    async function handleOptimize() {
        if (!resumeData || !jobDescription) return;
        setOptimizing(true);
        setOptimizationSuccess(false);
        try {
            posthog.capture('resume_optimized_with_ai', { resume_id: id });
        } catch (e) { console.error('[PostHog] Event error:', e); }

        try {
            const res = await fetch('/api/resume/optimize', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeData, jobDescription, template: selectedTemplate }),
            });
            const result = (await res.json()) as { success: boolean; optimizedData: Partial<ResumeData>; error?: string };
            if (result.success && result.optimizedData) {
                const raw = result.optimizedData;
                const normalized: ResumeData = {
                    ...resumeData,
                    ...raw,
                    experience: Array.isArray(raw.experience) ? raw.experience : (resumeData.experience || []),
                    projects: Array.isArray(raw.projects) ? raw.projects : (resumeData.projects || []),
                    education: Array.isArray(raw.education) ? raw.education : (resumeData.education || []),
                    skills: Array.isArray(raw.skills) ? raw.skills : (resumeData.skills || []),
                    skillCategories: Array.isArray(raw.skillCategories) ? raw.skillCategories : (resumeData.skillCategories || []),
                };
                setOriginalResumeData(JSON.parse(JSON.stringify(resumeData)));
                setOptimizedResumeData(normalized);
                setOptimizationSuccess(true);
            } else {
                alert('Optimization failed: ' + (result.error || 'Unknown error'));
            }
        } catch (e) {
            console.error('[Optimize] Catch:', e);
            alert('Error during optimization.');
        } finally { setOptimizing(false); }
    }

    function handleEditOptimized() {
        if (optimizedResumeData) {
            setResumeData(optimizedResumeData);
            setIsReviewing(true);
            setShowOptimizer(false);
            setStep('edit');
        }
    }

    async function handleAcceptOptimized() {
        // If modal is open, use the fresh AI data. If in review mode (banner), use current editor state.
        const finalData = showOptimizer ? optimizedResumeData : resumeData;
        if (finalData) {
            setSaving(true);
            setResumeData(finalData);
            await supabase.from('resumes').update({ 
                resume_json: finalData, 
                title, 
                updated_at: new Date().toISOString() 
            }).eq('id', id);
            setInitialData(JSON.stringify(finalData));
            setOptimizedResumeData(null);
            setOriginalResumeData(null);
            setIsReviewing(false);
            setOptimizationSuccess(false);
            setShowOptimizer(false);
            setSaving(false);
            setStep('download');
        }
    }

    function handleRevertToOriginal() {
        if (originalResumeData) {
            setResumeData(originalResumeData);
            setOptimizedResumeData(null);
            setOriginalResumeData(null);
            setIsReviewing(false);
            setOptimizationSuccess(false);
            setShowOptimizer(false);
        }
    }

    async function redeemCoupon() {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponMsg(null);
        try {
            const res = await fetch('/api/coupon/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode }),
            });
            const data = (await res.json()) as { valid: boolean; message: string; unlock_all?: boolean; error?: string };
            if (res.ok && data.valid) {
                try {
                    posthog.capture('coupon_applied', { coupon_code: couponCode });
                } catch (e) { console.error('[PostHog] Event error:', e); }
                setCouponMsg({ text: data.message, ok: true });
                if (data.unlock_all) {
                    setCouponApplied(true);
                    setUserAccess(true); // Immediate unlock
                }
            } else {
                setCouponMsg({ text: data.error || 'Invalid coupon', ok: false });
            }
        } catch {
            setCouponMsg({ text: 'Network error. Please try again.', ok: false });
        } finally {
            setCouponLoading(false);
        }
    }

    async function handleDownload() {
        if (!resumeData) return;
        setDownloading(true);
        try {
            posthog.capture('resume_downloaded', { resume_id: id, template: selectedTemplate });
        } catch (e) { console.error('[PostHog] Event error:', e); }

        try {
            const res = await fetch('/api/resume/download', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeId: id, resumeData, template: selectedTemplate }),
            });
            if (res.ok) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `${title || 'resume'}.pdf`; a.click();
                URL.revokeObjectURL(url);
            } else {
                const data = await res.json().catch(() => ({ error: 'Download failed' }));
                alert(`Download error: ${data.error || 'Unknown error'}${data.details ? ` (${data.details})` : ''}`);
            }
        } catch (err: unknown) {
            console.error('[Download] Error:', err);
            alert('Download error: Network failure or timeout.');
        } finally { setDownloading(false); }
    }

    const hasChanges = initialData !== JSON.stringify(resumeData);
    const isResumeEmpty = !resumeData?.name?.trim() && !resumeData?.experience?.length;

    if (authLoading || loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
    if (isNotFound) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#070710] text-center p-4">
                <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
                <h1 className="text-3xl font-bold text-white mb-2">Resume Not Found</h1>
                <p className="text-slate-400 mb-8 max-w-md">The resume you are looking for does not exist or you do not have permission to view it.</p>
                <Link href="/dashboard" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-medium">
                    Return to Dashboard
                </Link>
            </div>
        );
    }
    if (!resumeData) return null;

    const rd = resumeData;

    return (
        <div className="min-h-screen bg-[#070710] text-slate-200 pt-20">
            {/* ── Header ── */}
            <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-3">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
                        <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-xl transition-colors shrink-0"><ArrowLeft className="w-5 h-5" /></Link>
                        <input value={title} onChange={e => setTitle(e.target.value)}
                            className="bg-transparent border-none text-base sm:text-lg font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 w-full sm:w-64" />
                    </div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
                        <ResumeIntelligence resumeId={id} resumeData={resumeData} />
                        <button onClick={() => setShowOptimizer(true)} disabled={isResumeEmpty}
                            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-700 to-blue-700 hover:from-purple-600 hover:to-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                            <Sparkles className="w-4 h-4" /> AI Optimize
                        </button>
                        <button onClick={handleSave} disabled={saving || !hasChanges}
                            className="flex items-center gap-2 px-3 py-2 bg-white text-black hover:bg-gray-100 rounded-lg text-sm font-medium disabled:opacity-50">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {hasChanges ? 'Save' : 'Saved'}
                        </button>
                        {step === 'download'
                            ? (
                                <div className="relative group">
                                    <button onClick={handleDownload} disabled={downloading}
                                        className={`flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium transition-all ${(userAccess === false && !couponApplied) ? 'blur-[3px] opacity-70 cursor-not-allowed group-hover:blur-sm' : 'hover:bg-emerald-500 disabled:opacity-50'}`}>
                                        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download PDF
                                    </button>

                                    {(userAccess === false && !couponApplied) && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 rounded-lg pointer-events-none">
                                            <span className="text-xs font-bold text-emerald-400">Upgrade to Pro</span>
                                            <span className="text-[10px] text-slate-300 leading-tight">For Clean PDF</span>
                                        </div>
                                    )}
                                </div>
                            )
                            : <button onClick={() => setStep('template')} disabled={isResumeEmpty}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                                <Layout className="w-4 h-4" /> Choose Template
                            </button>
                        }
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="max-w-7xl mx-auto mt-2 flex items-center gap-1.5 text-xs overflow-x-auto">
                    {(['edit', 'template', 'optimize', 'download'] as Step[]).map((s, i) => {
                        const labels = ['1. Fill Resume', '2. Template', '3. AI Optimize', '4. Download'];
                        const idx = ['edit', 'template', 'optimize', 'download'].indexOf(step);
                        const isActive = s === step, isDone = idx > i;
                        return (
                            <button 
                                key={s} 
                                onClick={() => setStep(s)}
                                className="flex items-center gap-1.5 shrink-0 hover:bg-white/5 rounded-full transition-all px-1 py-0.5"
                            >
                                <span className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${isActive ? 'bg-blue-600 text-white' : isDone ? 'bg-emerald-700/40 text-emerald-400' : 'text-slate-600'}`}>
                                    {isDone ? '✓ ' : ''}{labels[i]}
                                </span>
                                {i < 3 && <ChevronRight className="w-3 h-3 text-slate-700" />}
                            </button>
                        );
                    })}
                </div>
            </header>

            {/* ── Template Selection ── */}
            {step === 'template' && (
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
                    <h2 className="text-3xl font-bold text-center mb-2">Choose Your ATS Template</h2>
                    <p className="text-slate-400 text-center mb-10 text-sm">All templates are single-column, black & white, print-optimised documents</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {TEMPLATE_LIST.map(t => (
                            <button key={t.id} onClick={() => handleSelectTemplate(t.id)}
                                className={`group p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] ${selectedTemplate === t.id ? 'border-blue-500 bg-blue-600/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}>
                                <div className="w-full h-24 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 mb-4 flex items-center justify-center border border-white/5">
                                    <Layout className="w-8 h-8 text-white/30" />
                                </div>
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{t.badge}</span>
                                <p className="font-semibold mt-2 text-sm">{t.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
                            </button>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <button onClick={() => setStep('edit')} className="text-slate-500 hover:text-slate-300 text-sm">← Back to editing</button>
                    </div>
                </div>
            )}

            {/* ── Main Editor ── */}
            {step !== 'template' && (
                <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6 pb-24 w-full overflow-hidden">
                        {isReviewing && (
                            <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Reviewing AI Changes</p>
                                        <p className="text-xs text-blue-300">Manually edit the optimized content or apply it to save.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button onClick={handleRevertToOriginal} className="flex-1 sm:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl border border-white/10 transition-all">
                                        Revert
                                    </button>
                                    <button onClick={handleAcceptOptimized} className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20">
                                        Accept & Save
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Upload */}
                        <ResumeUpload
                            onUploadSuccess={parsed => {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const mappedData: ResumeData = {
                                    ...parsed,
                                    // Inject IDs for local state management (Builder needs these for keys/deletion)
                                    experience: (parsed.experience || []).map((exp: ResumeExperience) => ({ ...exp, id: uid() })),
                                    projects: (parsed.projects || []).map((proj: ResumeProject) => ({ ...proj, id: uid() })),
                                    education: (parsed.education || []).map((edu: ResumeEducation) => ({ ...edu, id: uid() })),
                                    certifications: (parsed.certifications || []).map((cert: Certification) => ({ ...cert, id: uid() }))
                                };

                                setResumeData(mappedData);
                                alert('Resume parsed and mapped successfully!');
                            }}
                            onUploadError={err => alert(err)}
                        />

                        {/* Versions */}
                        {typeof id === 'string' && <VersionHistory resumeId={id} onRestore={(d) => setResumeData(d as unknown as ResumeData)} />}

                        {/* Personal Info */}
                        <Section title="Personal Information" icon={<Building2 className="w-5 h-5" />}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FInput label="Full Name" value={rd.name} onChange={v => setResumeData({ ...rd, name: v })} />
                                <FInput label="Email" value={rd.email} onChange={v => setResumeData({ ...rd, email: v })} />
                                <FInput label="Phone" value={rd.phone} onChange={v => setResumeData({ ...rd, phone: v })} />
                                <FInput label="Location (City, State)" value={rd.location ?? ''} onChange={v => setResumeData({ ...rd, location: v })} />
                                <FInput label="Country" value={rd.country ?? ''} onChange={v => setResumeData({ ...rd, country: v })} />
                                <FInput label="LinkedIn URL" value={rd.linkedin} onChange={v => setResumeData({ ...rd, linkedin: v })} />
                                <FInput label="GitHub URL" value={rd.github} onChange={v => setResumeData({ ...rd, github: v })} />
                            </div>
                        </Section>

                        <Section title="Professional Summary" icon={<Lightbulb className="w-5 h-5" />}
                            onAction={
                                <button
                                    onClick={handleGenerateSummary}
                                    disabled={isGeneratingSummary || !rd.experience?.length}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                >
                                    {isGeneratingSummary ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                    AI Generate
                                </button>
                            }
                        >
                            <textarea value={rd.summary} onChange={e => setResumeData({ ...rd, summary: e.target.value })}
                                className="w-full h-28 bg-white/5 border border-white/10 rounded-xl p-4 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none text-sm" placeholder="Brief professional summary..." />
                        </Section>

                        {/* Experience */}
                        <Section title="Work Experience" icon={<Building2 className="w-5 h-5" />}
                            onAdd={() => setResumeData({ ...rd, experience: [...(rd.experience || []), { id: uid(), company: '', role: '', duration: '', points: [''] } as ResumeExperience] })}>
                            {(rd.experience || []).map((exp, idx) => (
                                <ListCard key={exp.id} onDelete={() => setResumeData({ ...rd, experience: rd.experience.filter((_, i) => i !== idx) })}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                        <FInput label="Company" value={exp.company} onChange={v => { const l = [...rd.experience]; l[idx].company = v; setResumeData({ ...rd, experience: l }); }} />
                                        <FInput label="Role / Title" value={exp.role} onChange={v => { const l = [...rd.experience]; l[idx].role = v; setResumeData({ ...rd, experience: l }); }} />
                                        <FInput label="Duration" value={exp.duration} onChange={v => { const l = [...rd.experience]; l[idx].duration = v; setResumeData({ ...rd, experience: l }); }} />
                                    </div>
                                    <Bullets points={exp.points} faangMode={faangMode} jobDescription={jobDescription} onChange={p => { const l = [...rd.experience]; l[idx].points = p; setResumeData({ ...rd, experience: l }); }} />
                                </ListCard>
                            ))}
                        </Section>

                        {/* Education */}
                        <Section title="Education" icon={<GraduationCap className="w-5 h-5" />}
                            onAdd={() => setResumeData({ ...rd, education: [...(rd.education || []), { id: uid(), school: '', degree: '', duration: '', cgpa: '' } as ResumeEducation] })}>
                            {(rd.education || []).map((edu, idx) => (
                                <ListCard key={edu.id} onDelete={() => setResumeData({ ...rd, education: rd.education.filter((_, i) => i !== idx) })}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <FInput label="School / University" value={edu.school} onChange={v => { const l = [...rd.education]; l[idx].school = v; setResumeData({ ...rd, education: l }); }} />
                                        <FInput label="Degree" value={edu.degree} onChange={v => { const l = [...rd.education]; l[idx].degree = v; setResumeData({ ...rd, education: l }); }} />
                                        <FInput label="Duration" value={edu.duration} onChange={v => { const l = [...rd.education]; l[idx].duration = v; setResumeData({ ...rd, education: l }); }} />
                                        <FInput label="CGPA / GPA" value={edu.cgpa ?? ''} onChange={v => { const l = [...rd.education]; l[idx].cgpa = v; setResumeData({ ...rd, education: l }); }} />
                                    </div>
                                </ListCard>
                            ))}
                        </Section>

                        {/* Certifications */}
                        <Section title="Certifications" icon={<Award className="w-5 h-5" />}
                            onAdd={() => setResumeData({ ...rd, certifications: [...(rd.certifications ?? []), { id: uid(), title: '', issuer: '', year: '' } as Certification] })}>
                            {(rd.certifications ?? []).map((cert, idx) => (
                                <ListCard key={cert.id} onDelete={() => setResumeData({ ...rd, certifications: (rd.certifications ?? []).filter((_, i) => i !== idx) })}>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <FInput label="Certification Title" value={cert.title} onChange={v => { const l = [...(rd.certifications ?? [])]; l[idx].title = v; setResumeData({ ...rd, certifications: l }); }} />
                                        <FInput label="Issuer (AWS, Google…)" value={cert.issuer} onChange={v => { const l = [...(rd.certifications ?? [])]; l[idx].issuer = v; setResumeData({ ...rd, certifications: l }); }} />
                                        <FInput label="Year" value={cert.year} onChange={v => { const l = [...(rd.certifications ?? [])]; l[idx].year = v; setResumeData({ ...rd, certifications: l }); }} />
                                    </div>
                                </ListCard>
                            ))}
                        </Section>

                        {/* Projects */}
                        <Section title="Projects" icon={<Lightbulb className="w-5 h-5" />}
                            onAdd={() => setResumeData({ ...rd, projects: [...(rd.projects || []), { id: uid(), title: '', tech: [], description: [''], liveLink: '', githubLink: '' } as ResumeProject] })}>
                            {(rd.projects || []).map((proj, idx) => (
                                <ListCard key={proj.id} onDelete={() => setResumeData({ ...rd, projects: rd.projects.filter((_, i) => i !== idx) })}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        <FInput label="Project Title" value={proj.title} onChange={v => { const l = [...rd.projects]; l[idx].title = v; setResumeData({ ...rd, projects: l }); }} />
                                        <FInput label="Technologies (comma-separated)" value={proj.tech.join(', ')} onChange={v => { const l = [...rd.projects]; l[idx].tech = v.split(',').map(s => s.trim()).filter(Boolean); setResumeData({ ...rd, projects: l }); }} />
                                        <div className="flex items-center gap-2"><ExternalLink className="w-4 h-4 text-slate-500 shrink-0" /><FInput label="Live URL" value={proj.liveLink ?? ''} onChange={v => { const l = [...rd.projects]; l[idx].liveLink = v; setResumeData({ ...rd, projects: l }); }} /></div>
                                        <div className="flex items-center gap-2"><Github className="w-4 h-4 text-slate-500 shrink-0" /><FInput label="GitHub URL" value={proj.githubLink ?? ''} onChange={v => { const l = [...rd.projects]; l[idx].githubLink = v; setResumeData({ ...rd, projects: l }); }} /></div>
                                    </div>
                                    <Bullets points={proj.description} faangMode={faangMode} jobDescription={jobDescription} onChange={p => { const l = [...rd.projects]; l[idx].description = p; setResumeData({ ...rd, projects: l }); }} />
                                </ListCard>
                            ))}
                        </Section>

                        {/* Skills */}
                        <Section title="Technical Skills" icon={<Zap className="w-5 h-5" />}>
                            <p className="text-xs text-slate-500 mb-4">Comma-separated values per category. Rendered as plain text in PDF.</p>
                            <div className="space-y-3">
                                {SKILL_CATEGORIES.map(cat => {
                                    const cats: SkillCategory[] = rd.skillCategories ?? SKILL_CATEGORIES.map(c => ({ category: c, skills: [] }));
                                    const entry = cats.find(c => c.category === cat) ?? { category: cat, skills: [] };
                                    return (
                                        <div key={cat} className="flex items-center gap-3">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide w-28 shrink-0">{cat}</label>
                                            <input value={entry.skills.join(', ')} placeholder="e.g. Python, TypeScript"
                                                onChange={e => {
                                                    const newSkills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                                    const newCats: SkillCategory[] = SKILL_CATEGORIES.map(c =>
                                                        c === cat ? { category: c, skills: newSkills } : (cats.find(x => x.category === c) ?? { category: c, skills: [] })
                                                    );
                                                    setResumeData({ ...rd, skillCategories: newCats, skills: newCats.flatMap(c => c.skills) });
                                                }}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </Section>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="lg:col-span-4 sticky top-24 h-fit space-y-5">
                        {/* Selected Template */}
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-slate-500 mb-0.5">TEMPLATE</p>
                                <p className="font-semibold text-sm">{TEMPLATE_LIST.find(t => t.id === selectedTemplate)?.name ?? 'Harvard Classic'}</p>
                            </div>
                            <button onClick={() => setStep('template')} className="text-xs text-blue-400 border border-blue-400/20 px-3 py-1 rounded-full hover:bg-blue-400/10 transition-all">Change</button>
                        </div>

                        {/* Coupon Box — shown on download step */}
                        {step === 'download' && (
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                                <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
                                    <span>🎟️</span> Have a Coupon?
                                </h3>
                                {couponApplied ? (
                                    <p className="text-xs text-emerald-400 font-medium">✓ Full access active — no watermark!</p>
                                ) : (
                                    <>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                value={couponCode}
                                                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="ENTER CODE"
                                                className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-sm font-mono uppercase focus:ring-2 focus:ring-purple-500/50 outline-none"
                                            />
                                            <button
                                                onClick={redeemCoupon}
                                                disabled={couponLoading || !couponCode.trim()}
                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm rounded-xl font-medium transition-all flex items-center gap-1">
                                                {couponLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
                                            </button>
                                        </div>
                                        {couponMsg && (
                                            <p className={`text-xs mt-1 ${couponMsg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {couponMsg.text}
                                            </p>
                                        )}
                                        <p className="text-xs text-slate-600 mt-2">Without a plan, PDF will include a watermark.</p>
                                    </>
                                )}
                            </div>
                        )}

                        {/* AI Tips */}
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="font-bold mb-3 flex items-center gap-2 text-sm"><Sparkles className="w-4 h-4 text-purple-400" />AI Optimization</h3>

                            {optimizationSuccess && !isReviewing ? (
                                <div className="space-y-3 mb-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <p className="text-xs text-emerald-400 font-medium bg-emerald-400/10 p-2 rounded-lg border border-emerald-400/20">✓ AI Optimization Ready!</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={handleEditOptimized} className="py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold rounded-xl transition-all border border-blue-500/30 text-xs">Edit & Review</button>
                                        <button onClick={handleAcceptOptimized} className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all text-xs">Accept All</button>
                                    </div>
                                    <button onClick={handleRevertToOriginal} className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-400 font-medium rounded-xl transition-all border border-white/10 text-[10px] uppercase tracking-wider">Discard Changes</button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5 mb-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-200">FAANG Mode</p>
                                            <p className="text-xs text-slate-400">Optimize bullets for top tech</p>
                                        </div>
                                        <button
                                            onClick={() => setFaangMode(!faangMode)}
                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none ${faangMode ? 'bg-purple-600' : 'bg-white/10'}`}
                                        >
                                            <span className="sr-only">Use setting</span>
                                            <span className={`pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${faangMode ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </button>
                                    </div>

                                    <p className="text-xs text-slate-400 mb-3">{step === 'download' ? 'Retweak your resume for this JD anytime.' : 'Or use the legacy full resume optimizer.'}</p>
                                    <button onClick={() => setShowOptimizer(true)} className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-sm mb-3">
                                        {optimizationSuccess ? 'Open Results' : 'Open Optimizer'}
                                    </button>
                                </>
                            )}
                            
                            <button onClick={() => setShowCoverLetter(true)} className="w-full py-2 bg-purple-600 hover:bg-purple-500 rounded-xl transition-all text-sm font-bold shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2">
                                <Sparkles className="w-3.5 h-3.5" /> Generate Cover Letter
                            </button>
                            {step === 'download' && (
                                <button onClick={() => setStep('edit')} className="w-full py-2 mt-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-xs text-slate-500 font-medium">
                                    ← Edit Resume Details
                                </button>
                            )}
                        </div>

                        {/* Health & JD */}
                        {typeof id === 'string' && <HealthScorePanel resumeId={id} resumeData={rd} />}
                        {typeof id === 'string' && <JdMatcher resumeId={id} resumeData={rd} />}

                        {/* ATS Score */}
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 relative overflow-hidden">
                            {isAtsLoading && <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-blue-400" /></div>}
                            {!atsResult ? (
                                <div className="text-center py-3"><AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" /><p className="text-xs text-slate-500">Provide a Job Description to see JD Match score.</p></div>
                            ) : !atsResult.isValid ? (
                                <div className="text-center py-3">
                                    <AlertCircle className="w-8 h-8 text-red-500/50 mx-auto mb-2" />
                                    <p className="text-xs text-red-400 font-medium">Resume content appears invalid or incomplete.</p>
                                    <p className="text-[10px] text-slate-500 mt-1 px-4">Ensure you are using real words and technical terms.</p>
                                </div>
                            ) : (<>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {atsResult.score >= 70 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-yellow-400" />}
                                        <span className="font-medium text-sm">{atsResult.isMatch ? 'JD Match' : 'ATS Score'}</span>
                                    </div>
                                    <span className="text-2xl font-bold">{atsResult.score}%</span>
                                </div>
                                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                                    <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-700" style={{ width: `${atsResult.score}%` }} />
                                </div>
                                <div className="text-[10px] text-slate-500 mb-3 italic">Improve your resume to increase ATS score.</div>
                                <div className="space-y-1.5 mb-3">
                                    {([
                                        { label: 'JD Match', val: atsResult.details.keywords, max: 35 },
                                        { label: 'Skill Depth', val: atsResult.details.completeness, max: 25 },
                                        { label: 'Action Verbs', val: atsResult.details.skills, max: 20 },
                                        { label: 'Metrics', val: atsResult.details.metrics, max: 10 },
                                        { label: 'Structure', val: atsResult.details.projectLinks, max: 10 },
                                    ] as const).map(item => (
                                        <div key={item.label} className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500 w-20 shrink-0">{item.label}</span>
                                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500/60 rounded-full" style={{ width: `${(item.val / item.max) * 100}%` }} />
                                            </div>
                                            <span className="text-xs text-slate-500 w-10 text-right">{item.val}/{item.max}</span>
                                        </div>
                                    ))}
                                </div>
                                {(atsResult.feedback || []).map((f, i) => (
                                    <div key={i} className="flex gap-2 text-xs text-slate-400 italic mb-1">
                                        <div className="mt-1 w-1 h-1 rounded-full bg-blue-400 shrink-0" />{f}
                                    </div>
                                ))}
                            </>)}
                        </div>
                    </div>
                </main>
            )}

            {/* ── Optimizer Modal ── */}
            {showOptimizer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
                    <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowOptimizer(false)} className="absolute top-5 right-5 p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>

                        {!optimizationSuccess ? (
                            <>
                                <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><Sparkles className="w-5 h-5 text-blue-400" />AI Job Optimizer</h2>
                                <p className="text-slate-400 mb-5 text-sm">Paste the Job Description to align your resume experience and projects.</p>
                                <textarea
                                    value={jobDescription}
                                    onChange={e => setJobDescription(e.target.value)}
                                    className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none mb-5 text-sm"
                                    placeholder="Paste Job Description here..."
                                />
                                <button
                                    onClick={handleOptimize}
                                    disabled={optimizing || !jobDescription}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {optimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                    {optimizing ? 'Optimizing...' : 'Optimize My Resume'}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-1 text-white">AI optimization complete.</h2>
                                    <p className="text-slate-400 text-sm">Review and edit before applying.</p>
                                </div>

                                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 mb-6">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Optimization Preview</h3>
                                    <div className="space-y-4">
                                        {optimizedResumeData?.summary && (
                                            <div>
                                                <p className="text-[10px] font-bold text-blue-400 mb-1">REWRITTEN SUMMARY</p>
                                                <p className="text-xs text-slate-300 line-clamp-3 italic">&quot;{optimizedResumeData.summary}&quot;</p>
                                            </div>
                                        )}
                                        <p className="text-[10px] text-slate-500">All experience bullets and project descriptions have been optimized for ATS compatibility with the provided JD.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button
                                        onClick={handleRevertToOriginal}
                                        className="py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-2xl transition-all border border-white/10 text-sm order-3 sm:order-1"
                                    >
                                        Revert to Original
                                    </button>
                                    <button
                                        onClick={handleEditOptimized}
                                        className="py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold rounded-2xl transition-all border border-blue-500/30 text-sm order-1 sm:order-2"
                                    >
                                        Edit Resume
                                    </button>
                                    <button
                                        onClick={handleAcceptOptimized}
                                        className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 text-sm order-2 sm:order-3"
                                    >
                                        Accept Changes
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {showCoverLetter && id && resumeData && (
                <CoverLetterModal
                    resumeId={id}
                    resumeData={resumeData}
                    onClose={() => setShowCoverLetter(false)}
                />
            )}
        </div>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).substr(2, 9);

function Section({ title, icon, onAdd, onAction, children }: { title: string; icon: React.ReactNode; onAdd?: () => void; onAction?: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm">
            <div className="px-7 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3"><div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">{icon}</div><h2 className="text-lg font-bold">{title}</h2></div>
                <div className="flex items-center gap-2">
                    {onAction}
                    {onAdd && <button onClick={onAdd} className="p-2 hover:bg-white/10 rounded-lg transition-all text-slate-400 hover:text-white"><Plus className="w-4 h-4" /></button>}
                </div>
            </div>
            <div className="p-7">{children}</div>
        </section>
    );
}

function FInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-1.5 flex-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
            <input value={value} onChange={e => onChange(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all" />
        </div>
    );
}

function ListCard({ onDelete, children }: { onDelete: () => void; children: React.ReactNode }) {
    return (
        <div className="relative p-5 bg-black/20 border border-white/5 rounded-2xl mb-4 group/card">
            <button onClick={onDelete} className="absolute top-3 right-3 p-1.5 text-slate-700 hover:text-red-400 transition-all opacity-0 group-hover/card:opacity-100"><Trash2 className="w-4 h-4" /></button>
            {children}
        </div>
    );
}

function Bullets({ points, onChange, faangMode = false, jobDescription = '' }: { points: string[]; onChange: (p: string[]) => void; faangMode?: boolean; jobDescription?: string }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bullet Points</label>
            {points.map((p, idx) => (
                <div key={idx} className="flex gap-2 group/pt items-start">
                    <textarea value={p} onChange={e => { const l = [...points]; l[idx] = e.target.value; onChange(l); }}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500/50 min-h-[44px] resize-none text-sm" />

                    <div className="flex flex-col gap-1 items-center justify-start pt-1 opacity-100 sm:opacity-0 group-hover/pt:opacity-100 transition-all">
                        <BulletEnhancer
                            bullet={p}
                            faangMode={faangMode}
                            jobDescription={jobDescription}
                            onEnhanced={(newText) => { const l = [...points]; l[idx] = newText; onChange(l); }}
                        />
                        <button onClick={() => onChange(points.filter((_, i) => i !== idx))} className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            ))}
            <button onClick={() => onChange([...points, ''])} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-400/10 transition-all">
                <Plus className="w-3.5 h-3.5" /> Add Bullet
            </button>
        </div>
    );
}

