'use client';

import { useState } from 'react';
import {
    Sparkles,
    FileText,
    Lightbulb,
    BookOpen,
    HelpCircle,
    Loader2,
    Send
} from 'lucide-react';

interface AISidebarProps {
    documentId: string;
    onResponse: (response: string) => void;
}

export default function AISidebar({ documentId, onResponse }: AISidebarProps) {
    const [loadingType, setLoadingType] = useState<string | null>(null);
    const [query, setQuery] = useState('');

    const handleAction = async (type: string, customQuery?: string) => {
        setLoadingType(type);
        try {
            const res = await fetch('/api/studyforge/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId, type, query: customQuery }),
            });
            const data = await res.json();
            if (data.success) {
                onResponse(data.response);
                if (type === 'Ask') setQuery('');
            } else {
                alert(data.error || 'AI Error');
            }
        } catch (error) {
            console.error('AI error:', error);
        } finally {
            setLoadingType(null);
        }
    };

    const actions = [
        { id: 'Summary', label: 'Summarize', icon: FileText, color: 'text-blue-400' },
        { id: 'Explain', label: 'Explain Concept', icon: Lightbulb, color: 'text-amber-400' },
        { id: 'Notes', label: 'Generate Notes', icon: BookOpen, color: 'text-emerald-400' },
        { id: 'Quiz', label: 'Generate Quiz', icon: HelpCircle, color: 'text-rose-400' },
    ];

    return (
        <div className="h-full flex flex-col bg-[#070710]/50 backdrop-blur-xl border-l border-white/5 w-80 shrink-0">
            <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                    </div>
                    <h2 className="text-white font-black uppercase tracking-widest text-xs">AI Assistant</h2>
                </div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Your personal tutor</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {actions.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => handleAction(action.id)}
                        disabled={!!loadingType}
                        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-left group active:scale-[0.98]"
                    >
                        <div className={`p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors ${loadingType === action.id ? 'animate-pulse' : ''}`}>
                            {loadingType === action.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                            ) : (
                                <action.icon className={`w-4 h-4 ${action.color}`} />
                            )}
                        </div>
                        <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{action.label}</span>
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="relative">
                    <textarea
                        placeholder="Ask anything about the document..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 pr-12 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all resize-none h-24"
                    />
                    <button
                        onClick={() => handleAction('Ask', query)}
                        disabled={!query.trim() || !!loadingType}
                        className="absolute right-3 bottom-3 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
                    >
                        {loadingType === 'Ask' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
                <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.2em] text-center mt-3">Powered by ForgeAI Gemini</p>
            </div>
        </div>
    );
}
