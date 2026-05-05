'use client'
export const dynamic = 'force-dynamic';
;

import { useState, useEffect } from 'react';
import {
    Key,
    Plus,
    Trash2,
    Copy,
    Check,
    Shield,
    Terminal,
    ExternalLink,
    Loader2,
    Eye,
    EyeOff,
    Info,
    Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Badge } from '@/components/ui/Badge';

interface ApiKey {
    id: string;
    name: string;
    api_key: string;
    usage_count: number;
    usage_limit: number;
    status: 'active' | 'revoked';
    created_at: string;
}

export default function ApiKeysPage() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [keyName, setKeyName] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showKeyId, setShowKeyId] = useState<string | null>(null);

    useEffect(() => {
        fetchKeys();
    }, []);

    async function fetchKeys() {
        try {
            const res = await fetch('/api/v1/keys');
            const data = await res.json();
            if (data.success) {
                setKeys(data.data || []);
            }
        } catch {
            console.error('Failed to fetch keys');
            toast.error('Failed to load API keys');
        } finally {
            setLoading(false);
        }
    }

    async function createKey() {
        if (!keyName.trim()) {
            toast.error('Please enter a name for your key');
            return;
        }

        setCreating(true);
        try {
            const res = await fetch('/api/v1/keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: keyName })
            });
            const data = await res.json();
            if (data.success && data.data) {
                toast.success('API Key created successfully');
                setKeys([data.data, ...keys]);
                setKeyName('');
                setShowKeyId(data.data.id); // Show only the newly created key immediately
            } else {
                toast.error(data.error || 'Failed to create key');
            }
        } catch {
            toast.error('Network error');
        } finally {
            setCreating(false);
        }
    }

    async function revokeKey(id: string) {
        if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/v1/keys?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('API Key revoked');
                setKeys(keys.map(k => k.id === id ? { ...k, status: 'revoked' } : k));
            } else {
                toast.error(data.error || 'Failed to revoke key');
            }
        } catch {
            toast.error('Network error');
        }
    }

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E2A42] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#00D4A0] font-bold tracking-widest text-[10px] uppercase mb-4">
                        <Terminal className="w-3.5 h-3.5" /> Intelligence Core
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">ApiForge</h1>
                    <p className="text-slate-400 mt-2 text-lg">Manage secure access credentials and neural signal integration protocols.</p>
                </div>

                <div className="flex items-center gap-4">
                    <a href="https://docs.resumeforgeai.in" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D1220] border border-[#1E2A42] text-[10px] font-black text-[#00D4A0] hover:bg-[#00D4A0]/5 transition-all uppercase tracking-widest">
                        <Info className="w-4 h-4" /> Documentation
                    </a>
                    <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D1220] border border-[#1E2A42]">
                        <div className="text-[10px] text-[#4A5568] uppercase tracking-wider font-semibold">V1.2_ACTIVE</div>
                        <div className="w-2 h-2 rounded-full bg-[#00D4A0] animate-pulse" />
                    </div>
                </div>
            </header>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Key Card */}
                <div className="lg:col-span-1">
                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] sticky top-24 backdrop-blur-xl">
                        <h3 className="text-lg font-black text-white mb-6 uppercase italic tracking-tight">Generate Signal_</h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Key Description</label>
                                <input
                                    type="text"
                                    value={keyName}
                                    onChange={(e) => setKeyName(e.target.value)}
                                    placeholder="e.g. My Website Plugin"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                />
                            </div>

                            <button
                                onClick={createKey}
                                disabled={creating}
                                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                {creating ? 'Initialising...' : 'Create New Key'}
                            </button>

                            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-2">
                                <div className="flex items-center gap-2 text-amber-400">
                                    <Lock className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-500/80">Security Protocol</span>
                                </div>
                                <p className="text-[10px] text-amber-200/60 leading-relaxed font-bold uppercase tracking-tight">
                                    Your keys give full access to your account tools.
                                    Do not expose them on the frontend. Use a secure backend.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Keys List */}
                <div className="lg:col-span-2 space-y-6">
                    {keys.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.01]">
                            <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mb-6">
                                <Key className="w-8 h-8 text-slate-700" />
                            </div>
                            <h4 className="text-xl font-black text-slate-500 uppercase italic tracking-tighter">No Active Signals</h4>
                            <p className="text-[10px] text-slate-600 mt-2 font-black uppercase tracking-widest">Create a key to start integrating AI</p>
                        </div>
                    ) : (
                        keys.map((key) => (
                            <div
                                key={key.id}
                                className={`p-8 bg-white/[0.02] border transition-all duration-500 rounded-[2.5rem] group ${key.status === 'revoked' ? 'opacity-50 grayscale border-white/5' : 'hover:bg-white/[0.03] border-white/10 hover:border-indigo-500/30'}`}
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-xl font-black text-white italic uppercase tracking-tight">{key.name}</h4>
                                            <Badge className={key.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}>
                                                {key.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Created on {new Date(key.created_at).toLocaleDateString()}</p>
                                    </div>

                                    {key.status === 'active' && (
                                        <button
                                            onClick={() => revokeKey(key.id)}
                                            className="p-3 text-slate-600 hover:text-red-400 hover:bg-red-400/5 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                            title="Revoke Key"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 bg-black/60 border border-white/5 rounded-2xl relative overflow-hidden group/key">
                                        <Key className="w-4 h-4 text-indigo-500 shrink-0" />
                                        <div className="flex-1 overflow-hidden">
                                            <input
                                                type={showKeyId === key.id ? "text" : "password"}
                                                value={key.api_key}
                                                readOnly
                                                className="bg-transparent text-sm text-indigo-400 font-mono focus:outline-none w-full tracking-wider"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setShowKeyId(showKeyId === key.id ? null : key.id)}
                                                className="p-2 text-slate-600 hover:text-white transition-colors"
                                            >
                                                {showKeyId === key.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(key.api_key, key.id)}
                                                className="p-2 text-slate-600 hover:text-white transition-colors"
                                            >
                                                {copiedId === key.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Usage Today</span>
                                            <div className="flex items-end gap-2">
                                                <span className="text-xl font-black text-white italic tracking-tighter">{key.usage_count}</span>
                                                <span className="text-[10px] text-slate-600 font-black mb-1">/ {key.usage_limit}</span>
                                            </div>
                                            <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-500 transition-all duration-1000"
                                                    style={{ width: `${Math.min(100, (key.usage_count / key.usage_limit) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col justify-center">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Latency Peak</span>
                                            <div className="text-xl font-black text-indigo-400 italic tracking-tighter">142ms <span className="text-[10px] text-emerald-500 opacity-50 ml-1">Stable</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
