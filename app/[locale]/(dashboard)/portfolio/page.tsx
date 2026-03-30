'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Sparkles, Globe, Eye, Copy, Check, Layout, ArrowLeft } from 'lucide-react';
import { FeatureGate } from '@/components/pricing/FeatureGate';
import { Portfolio, PORTFOLIO_THEMES } from '@/types/portfolio';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

function PortfolioContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const shouldAutoGenerate = searchParams?.get('generate') === 'true';

    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    async function generate() {
        setGenerating(true); setError('');
        try {
            const res = await fetch('/api/portfolio/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
            const data = await res.json();
            if (res.ok && data.success) {
                try {
                    const posthog = (await import('@/lib/posthog')).default;
                    posthog.capture('portfolio_generated');
                } catch (err) { console.error('[PostHog] Event error:', err); }
                router.push(`/preview/${data.previewToken}`);
            } else { setError(data.error || 'Generation failed'); setGenerating(false); }
        } catch { setError('Network error. Please try again.'); setGenerating(false); }
    }

    async function load() {
        setLoading(true);
        try {
            const res = await fetch('/api/portfolio');
            const data = await res.json();
            
            if (data.portfolio) {
                setPortfolio(data.portfolio);
                setLoading(false);
            } else if (shouldAutoGenerate) {
                // If no portfolio exists but we have the flag, start generating immediately
                setLoading(false);
                generate();
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { load(); }, []);

    async function copyLink(url: string) {
        await navigator.clipboard.writeText(url);
        setCopied(true); setTimeout(() => setCopied(false), 1500);
    }

    async function togglePublish() {
        if (!portfolio) return;
        const res = await fetch('/api/portfolio', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_public: !portfolio.is_public }),
        });
        const data = await res.json();
        if (data.success) setPortfolio(data.portfolio);
    }

    const publicUrl = typeof window !== 'undefined' && portfolio ? `${window.location.origin}/portfolio/${portfolio.username}` : '';
    const previewUrl = typeof window !== 'undefined' && portfolio?.preview_token ? `${window.location.origin}/preview/${portfolio.preview_token}` : '';

    if (loading || (generating && !portfolio)) return (
        <div className="min-h-screen bg-[#070710] flex flex-col items-center justify-center gap-6">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 relative z-10" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-white tracking-tight uppercase italic">{generating ? 'Architecting Portfolio...' : 'Loading Console...'}</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">{generating ? 'Synchronizing with Neural Core' : 'Connecting to Protocol'}</p>
            </div>
        </div>
    );

    return (
        <FeatureGate task="portfolio">
            <div className="min-h-screen bg-[#070710] text-slate-200 p-4 sm:p-0 pb-24">
                <div className="max-w-3xl mx-auto py-8">
                    <div className="mb-12 flex items-center justify-between">
                        <div>
                            <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-4 group">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                            </Link>
                            <h1 className="text-4xl font-black mb-2 flex items-center gap-4 tracking-tighter italic uppercase"><Layout className="w-10 h-10 text-indigo-500" />Portfolio_</h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Cloud Infrastructure & Neural Architecture Rendering</p>
                        </div>
                    </div>

                    {!portfolio ? (
                        /* No portfolio yet */
                        <div className="text-center py-24 bg-white/[0.02] border border-white/5 rounded-[4rem] backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                            <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-700">
                                <Sparkles className="w-12 h-12 text-indigo-400" />
                            </div>
                            <h2 className="text-3xl font-black mb-3 tracking-tight italic uppercase text-white">Initialize Signal</h2>
                            <p className="text-slate-500 mb-10 max-w-sm mx-auto text-xs font-black uppercase tracking-widest leading-relaxed">Our AI will analyze your latest resume and materialize a stunning high-performance portfolio in seconds.</p>
                            {error && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-8 bg-red-400/5 py-3 px-6 rounded-2xl border border-red-400/10 max-w-xs mx-auto italic">ERR: {error}</p>}
                            <button onClick={generate} disabled={generating}
                                className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-[2rem] transition-all flex items-center gap-4 mx-auto shadow-2xl shadow-indigo-600/40 uppercase tracking-[0.2em] text-xs">
                                {generating ? <><Loader2 className="w-5 h-5 animate-spin" />Assembling...</> : <><Sparkles className="w-5 h-5" />Construct Now</>}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Status Card */}
                            <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] backdrop-blur-xl relative overflow-hidden group">
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full group-hover:bg-indigo-600/20 transition-all duration-1000" />
                                <div className="flex items-center justify-between mb-10 relative">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-4 h-4 rounded-full ${portfolio.is_public ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-slate-700'}`} />
                                        <div>
                                            <span className="font-black text-2xl tracking-tighter italic uppercase text-white">{portfolio.is_public ? 'Signal Active' : 'Offline / Draft'}</span>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{portfolio.is_public ? 'Global Broadcast Protocol Active' : 'Local Sandbox Environment'}</p>
                                        </div>
                                    </div>
                                    <button onClick={togglePublish}
                                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${portfolio.is_public ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/10' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/10'}`}>
                                        {portfolio.is_public ? 'Kill Signal' : 'Go Live_'}
                                    </button>
                                </div>
                                
                                {portfolio.is_public && (
                                    <div className="flex items-center gap-4 p-5 bg-black/60 border border-white/5 rounded-3xl relative group/link hover:border-indigo-500/30 transition-all duration-500">
                                        <Globe className="w-6 h-6 text-indigo-500 shrink-0" />
                                        <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-black truncate flex-1 uppercase tracking-tight italic">{publicUrl}</a>
                                        <button onClick={() => copyLink(publicUrl)} className="p-3 hover:bg-white/5 rounded-2xl transition-colors shrink-0">
                                            {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-600" />}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Theme & Customization */}
                            <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3.5rem] backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-10">
                                    <h3 className="font-black text-[10px] text-slate-500 uppercase tracking-[0.3em]">Neural Interface Theme</h3>
                                    <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/5 text-indigo-400 font-black px-4 py-1.5 rounded-full text-[9px] uppercase tracking-widest animate-pulse">Enterprise v2</Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    {PORTFOLIO_THEMES.map(t => (
                                        <button key={t.id} onClick={async () => {
                                            const res = await fetch('/api/portfolio', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ theme: t.id }) });
                                            const d = await res.json(); if (d.success) setPortfolio(d.portfolio);
                                        }}
                                            className={`p-6 rounded-3xl border text-left transition-all group/theme ${portfolio.theme === t.id ? 'border-indigo-500 bg-indigo-500/10 shadow-2xl shadow-indigo-500/20' : 'border-white/5 bg-white/[0.02] hover:border-white/20'}`}>
                                            <p className="text-base font-black tracking-tight uppercase italic text-white group-hover/theme:text-indigo-400 transition-colors">{t.name}</p>
                                            <p className="text-[9px] text-slate-600 mt-2 uppercase font-black tracking-widest">{t.badge}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-5 pt-4">
                                <a href={portfolio.is_public ? publicUrl : previewUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex-1 py-5 bg-white/[0.02] hover:bg-white/5 border border-white/5 rounded-[2rem] text-[10px] font-black text-center flex items-center justify-center gap-4 transition-all uppercase tracking-[0.2em] group">
                                    <Eye className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" /> Preview Interface
                                </a>
                                <button onClick={() => { setPortfolio(null); generate(); }} disabled={generating}
                                    className="flex-1 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 rounded-[2rem] text-[10px] font-black flex items-center justify-center gap-4 transition-all shadow-2xl shadow-indigo-600/30 uppercase tracking-[0.2em]">
                                    {generating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
                                    Re-Materialize
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </FeatureGate>
    );
}

export default function PortfolioPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#070710] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        }>
            <PortfolioContent />
        </Suspense>
    );
}
