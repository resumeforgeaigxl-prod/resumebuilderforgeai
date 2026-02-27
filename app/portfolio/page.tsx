'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, Globe, Eye, Edit2, Copy, Check, AlertCircle, Layout } from 'lucide-react';
import { Portfolio, PORTFOLIO_THEMES } from '@/types/portfolio';

export default function PortfolioPage() {
    const router = useRouter();
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
        <div className="min-h-screen bg-[#070710] text-slate-200 max-w-3xl mx-auto px-6 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3"><Layout className="w-7 h-7 text-blue-400" />My Portfolio</h1>
                <p className="text-slate-500">AI-generated portfolio page hosted at your own URL.</p>
            </div>

            {!portfolio ? (
                /* No portfolio yet */
                <div className="text-center py-16 bg-white/[0.03] border border-white/10 rounded-3xl">
                    <Sparkles className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Create Your Portfolio</h2>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto text-sm">AI will generate a professional portfolio from your resume data. Takes ~20 seconds.</p>
                    {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
                    <button onClick={generate} disabled={generating}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all flex items-center gap-2 mx-auto">
                        {generating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</> : <><Sparkles className="w-4 h-4" />Generate My Portfolio</>}
                    </button>
                </div>
            ) : (
                <div className="space-y-5">
                    {/* Status card */}
                    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-2.5 h-2.5 rounded-full ${portfolio.is_public ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                                <span className="font-semibold">{portfolio.is_public ? 'Published' : 'Draft (not public)'}</span>
                            </div>
                            <button onClick={togglePublish}
                                className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${portfolio.is_public ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25' : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'}`}>
                                {portfolio.is_public ? 'Unpublish' : 'Publish'}
                            </button>
                        </div>
                        {portfolio.is_public && (
                            <div className="flex items-center gap-2 p-3 bg-black/30 rounded-xl">
                                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                                <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline truncate flex-1">{publicUrl}</a>
                                <button onClick={() => copyLink(publicUrl)} className="text-slate-500 hover:text-slate-300 shrink-0">
                                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    {previewUrl && (
                        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-3">
                            <Eye className="w-4 h-4 text-amber-400 shrink-0" />
                            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-400 hover:underline flex-1 truncate">{previewUrl}</a>
                            <span className="text-xs text-amber-600 shrink-0">Private preview</span>
                        </div>
                    )}

                    {/* Theme */}
                    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
                        <h3 className="font-semibold mb-4 text-sm text-slate-400 uppercase tracking-wider">Theme</h3>
                        <p className="text-xs text-slate-600 mb-4">Free users: Minimal only. Pro users: all themes.</p>
                        <div className="grid grid-cols-3 gap-3">
                            {PORTFOLIO_THEMES.map(t => (
                                <button key={t.id} onClick={async () => {
                                    const res = await fetch('/api/portfolio', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ theme: t.id }) });
                                    const d = await res.json(); if (d.success) setPortfolio(d.portfolio);
                                }}
                                    className={`p-3 rounded-xl border text-left transition-all ${portfolio.theme === t.id ? 'border-blue-500 bg-blue-600/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                                    <p className="text-xs font-bold">{t.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{t.badge}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Username */}
                    <div className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
                        <h3 className="font-semibold mb-1 text-sm text-slate-400 uppercase tracking-wider">Portfolio URL Slug</h3>
                        <p className="text-xs text-slate-600 mb-3">Pro users can edit their username.</p>
                        <div className="flex items-center gap-2 p-3 bg-black/30 rounded-xl">
                            <span className="text-slate-500 text-sm">/portfolio/</span>
                            <span className="text-white font-mono text-sm">{portfolio.username}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">Custom usernames coming for Pro users.</p>
                    </div>

                    {/* Actions */}
                    {error && <div className="flex items-center gap-2 text-red-400 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
                    <div className="flex gap-3">
                        <a href={portfolio.is_public ? publicUrl : previewUrl} target="_blank" rel="noopener noreferrer"
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-medium text-center flex items-center justify-center gap-2 transition-all">
                            <Eye className="w-4 h-4" /> View Portfolio
                        </a>
                        <button onClick={() => { setPortfolio(null); generate(); }} disabled={generating}
                            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
                            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Regenerate
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
