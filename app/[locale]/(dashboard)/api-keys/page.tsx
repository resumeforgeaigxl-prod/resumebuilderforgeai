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
    Terminal,
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
                <Loader2 className="w-8 h-8 animate-spin text-[#171717]" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-premium-in pb-20 text-[#171717]">
            {/* Standardized Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EBEBEB] pb-8 mb-12">
                <div>
                    <div className="flex items-center gap-2 text-[#8F8F8F] font-bold tracking-wider text-[10px] uppercase mb-3 font-mono">
                        <Terminal className="w-3.5 h-3.5 text-[#171717]" /> Intelligence Core
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#171717]">ApiForge</h1>
                    <p className="text-[#4D4D4D] mt-2 text-sm md:text-base">Manage secure access credentials and neural signal integration protocols.</p>
                </div>

                <div className="flex items-center gap-4">
                    <a href="https://docs.resumeforgeai.in" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#FFFFFF] border border-[#EBEBEB] text-xs font-semibold text-[#171717] hover:bg-[#FAFAFA] transition-all shadow-sm">
                        <Info className="w-4 h-4" /> Documentation
                    </a>
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#EBEBEB] shadow-sm">
                        <div className="text-[10px] text-[#8F8F8F] font-mono uppercase tracking-normal">V1.2 Active</div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                </div>
            </header>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Create Key Card */}
                <div className="lg:col-span-1">
                    <div className="p-6 bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl sticky top-24 shadow-sm">
                        <h3 className="text-base font-semibold text-[#171717] mb-6 uppercase tracking-wider font-mono">Generate Signal</h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-wider ml-1">Key Description</label>
                                <input
                                    type="text"
                                    value={keyName}
                                    onChange={(e) => setKeyName(e.target.value)}
                                    placeholder="e.g. My Website Plugin"
                                    className="w-full bg-[#FFFFFF] border border-[#EBEBEB] rounded-md px-4 py-2.5 text-sm text-[#171717] placeholder-[#8F8F8F] focus:border-[#171717] outline-none transition-all"
                                />
                            </div>

                            <button
                                onClick={createKey}
                                disabled={creating}
                                className="w-full py-2.5 bg-[#171717] hover:bg-[#333333] disabled:opacity-50 text-white font-semibold rounded-md transition-all shadow-sm flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Plus className="w-4 h-4" />}
                                {creating ? 'Initialising...' : 'Create New Key'}
                            </button>

                            <div className="p-4 bg-[#FFEFCF]/30 border border-[#FFE0B2] rounded-lg space-y-2">
                                <div className="flex items-center gap-2 text-[#AB570A]">
                                    <Lock className="w-3.5 h-3.5" />
                                    <span className="text-[9px] font-bold uppercase tracking-wider">Security Protocol</span>
                                </div>
                                <p className="text-[10px] text-[#AB570A] leading-relaxed font-semibold">
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
                        <div className="flex flex-col items-center justify-center p-20 border border-dashed border-[#EBEBEB] rounded-xl bg-[#FAFAFA]">
                            <div className="w-12 h-12 bg-[#FFFFFF] border border-[#EBEBEB] rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <Key className="w-6 h-6 text-[#8F8F8F]" />
                            </div>
                            <h4 className="text-base font-semibold text-[#8F8F8F] uppercase tracking-wider font-mono">No Active Signals</h4>
                            <p className="text-[10px] text-[#8F8F8F] mt-2 font-bold uppercase tracking-wider font-mono">Create a key to start integrating AI</p>
                        </div>
                    ) : (
                        keys.map((key) => (
                            <div
                                key={key.id}
                                className={`p-8 bg-[#FFFFFF] border border-[#EBEBEB] transition-all duration-500 rounded-xl shadow-sm group ${key.status === 'revoked' ? 'opacity-50 grayscale' : 'hover:border-[#171717]/30'}`}
                            >
                                <div className="flex items-start justify-between mb-8">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-lg font-semibold text-[#171717] tracking-tight">{key.name}</h4>
                                            <Badge className={key.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>
                                                {key.status.toUpperCase()}
                                            </Badge>
                                        </div>
                                        <p className="text-[10px] text-[#8F8F8F] font-bold uppercase tracking-wider mt-1 font-mono">Created on {new Date(key.created_at).toLocaleDateString()}</p>
                                    </div>

                                    {key.status === 'active' && (
                                        <button
                                            onClick={() => revokeKey(key.id)}
                                            className="p-2 hover:bg-[#FAFAFA] rounded-md border border-transparent hover:border-[#EBEBEB] text-[#8F8F8F] hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                            title="Revoke Key"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 p-4 bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg relative overflow-hidden group/key">
                                        <Key className="w-4 h-4 text-[#171717] shrink-0" />
                                        <div className="flex-1 overflow-hidden">
                                            <input
                                                type={showKeyId === key.id ? "text" : "password"}
                                                value={key.api_key}
                                                readOnly
                                                className="bg-transparent text-sm text-[#171717] font-mono focus:outline-none w-full tracking-wider"
                                            />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setShowKeyId(showKeyId === key.id ? null : key.id)}
                                                className="p-1.5 hover:bg-[#FFFFFF] border border-transparent hover:border-[#EBEBEB] rounded text-[#8F8F8F] hover:text-[#171717] transition-all"
                                            >
                                                {showKeyId === key.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(key.api_key, key.id)}
                                                className="p-1.5 hover:bg-[#FFFFFF] border border-transparent hover:border-[#EBEBEB] rounded text-[#8F8F8F] hover:text-[#171717] transition-all"
                                            >
                                                {copiedId === key.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-[#FAFAFA] rounded-lg border border-[#EBEBEB]">
                                            <span className="text-[9px] font-bold text-[#8F8F8F] uppercase tracking-wider block mb-1 font-mono">Usage Today</span>
                                            <div className="flex items-end gap-2 mt-1">
                                                <span className="text-xl font-bold text-[#171717] tracking-tight leading-none">{key.usage_count}</span>
                                                <span className="text-[10px] text-[#8F8F8F] font-semibold mb-0.5 leading-none">/ {key.usage_limit}</span>
                                            </div>
                                            <div className="w-full h-1 bg-[#FFFFFF] border border-[#EBEBEB] rounded-full mt-3 overflow-hidden">
                                                <div
                                                    className="h-full bg-[#171717] transition-all duration-1000"
                                                    style={{ width: `${Math.min(100, (key.usage_count / key.usage_limit) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="p-4 bg-[#FAFAFA] rounded-lg border border-[#EBEBEB] flex flex-col justify-center">
                                            <span className="text-[9px] font-bold text-[#8F8F8F] uppercase tracking-wider block mb-1 font-mono">Latency Peak</span>
                                            <div className="text-xl font-bold text-[#0070F3] tracking-tight mt-1 leading-none">142ms <span className="text-[10px] text-emerald-600 font-semibold ml-1">Stable</span></div>
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
