'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, Globe, Eye, Copy, Check, Layout } from 'lucide-react';
import { Portfolio, PORTFOLIO_THEMES } from '@/types/portfolio';

export default function PortfolioPage() {
    const router = useRouter();
    // Removed unused region/lang params to fix lint errors.

    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    async function load() {
        setLoading(true);
        const res = await fetch('/api/portfolio');
        const data = await res.json();
        setPortfolio(data.portfolio);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

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

    const publicUrl = portfolio ? `${window?.location?.origin}/portfolio/${portfolio.username}` : '';
    const previewUrl = portfolio?.preview_token ? `${window?.location?.origin}/preview/${portfolio.preview_token}` : '';

    if (loading) return (
        <div className="min-h-screen bg-[#070710] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#070710] text-slate-200 p-4 sm:p-0">
            <div className="max-w-3xl mx-auto py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-black mb-2 flex items-center gap-3 tracking-tight"><Layout className="w-8 h-8 text-indigo-400" />My Portfolio</h1>
                    <p className="text-slate-500 font-medium">AI-generated portfolio page hosted at your own unique URL.</p>
                </div>

                {!portfolio ? (
                    /* No portfolio yet */
                    <div className="text-center py-20 bg-white/[0.03] border border-white/10 rounded-[3rem] backdrop-blur-sm">
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-black mb-2 tracking-tight">Create Your Professional Portfolio</h2>
                        <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm font-medium">Our AI will analyze your latest resume and build a stunning portfolio in ~20 seconds.</p>
                        {error && <p className="text-red-400 text-sm mb-6 bg-red-400/10 py-2 rounded-xl border border-red-400/20 max-w-xs mx-auto">{error}</p>}
                        <button onClick={generate} disabled={generating}
                            className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all flex items-center gap-3 mx-auto shadow-2xl shadow-indigo-600/30">
                            {generating ? <><Loader2 className="w-5 h-5 animate-spin" />Building Portfolio…</> : <><Sparkles className="w-5 h-5" />Generate Portfolio Now</>}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Status Card */}
                        <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] backdrop-blur-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl rounded-full" />
                            <div className="flex items-center justify-between mb-6 relative">
                                <div className="flex items-center gap-4">
                                    <div className={`w-3 h-3 rounded-full ${portfolio.is_public ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)] animate-pulse' : 'bg-slate-600'}`} />
                                    <div>
                                        <span className="font-black text-lg tracking-tight">{portfolio.is_public ? 'Live on Web' : 'Draft Mode'}</span>
                                        <p className="text-xs text-slate-500 font-medium">{portfolio.is_public ? 'Anyone with the link can view' : 'Only you can see this'}</p>
                                    </div>
                                </div>
                                <button onClick={togglePublish}
                                    className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${portfolio.is_public ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'}`}>
                                    {portfolio.is_public ? 'Take Offline' : 'Go Live Now'}
                                </button>
                            </div>

                            {portfolio.is_public && (
                                <div className="flex items-center gap-3 p-4 bg-black/40 border border-white/5 rounded-2xl relative group/link">
                                    <Globe className="w-5 h-5 text-indigo-400 shrink-0" />
                                    <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-bold truncate flex-1">{publicUrl}</a>
                                    <button onClick={() => copyLink(publicUrl)} className="p-2 hover:bg-white/5 rounded-xl transition-colors shrink-0">
                                        {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-slate-500" />}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Theme & Customization */}
                        <div className="p-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-black text-sm text-slate-400 uppercase tracking-[0.2em]">Appearance</h3>
                                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-full border border-indigo-500/20 uppercase tracking-widest">Premium Themes</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {PORTFOLIO_THEMES.map(t => (
                                    <button key={t.id} onClick={async () => {
                                        const res = await fetch('/api/portfolio', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ theme: t.id }) });
                                        const d = await res.json(); if (d.success) setPortfolio(d.portfolio);
                                    }}
                                        className={`p-4 rounded-2xl border text-left transition-all ${portfolio.theme === t.id ? 'border-indigo-500 bg-indigo-600/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                                        <p className="text-sm font-black tracking-tight">{t.name}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">{t.badge}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <a href={portfolio.is_public ? publicUrl : previewUrl} target="_blank" rel="noopener noreferrer"
                                className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-black text-center flex items-center justify-center gap-3 transition-all">
                                <Eye className="w-5 h-5 text-slate-400" /> View Live Preview
                            </a>
                            <button onClick={() => { setPortfolio(null); generate(); }} disabled={generating}
                                className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 rounded-2xl text-sm font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20">
                                {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                Regenerate with AI
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
