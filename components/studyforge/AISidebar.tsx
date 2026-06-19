'use client';

import { useEffect, useRef, useState } from 'react';
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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
    const ocrHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (ocrHintTimerRef.current) clearTimeout(ocrHintTimerRef.current);
        };
    }, []);

    const handleAction = async (type: string, customQuery?: string) => {
        setLoadingType(type);
        setErrorMessage(null);
        setLoadingMessage('Analyzing document...');
        if (ocrHintTimerRef.current) clearTimeout(ocrHintTimerRef.current);
        ocrHintTimerRef.current = setTimeout(() => {
            setLoadingMessage('Running OCR extraction...');
        }, 4500);
        try {
            const res = await fetch('/api/studyforge/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentId, type, query: customQuery }),
            });

            const contentType = res.headers.get('content-type') || '';
            let data: { success?: boolean; response?: string; error?: string } = {};

            if (contentType.includes('application/json')) {
                data = await res.json();
            } else {
                const raw = await res.text();
                data.error = raw?.trim() || `AI request failed (HTTP ${res.status})`;
            }

            if (data.success && typeof data.response === 'string') {
                onResponse(data.response);
                if (type === 'Ask') setQuery('');
            } else {
                setErrorMessage(data.error || `AI request failed (HTTP ${res.status})`);
            }
        } catch (error) {
            console.error('AI error:', error);
            setErrorMessage('Unable to connect to AI service. Please try again.');
        } finally {
            if (ocrHintTimerRef.current) {
                clearTimeout(ocrHintTimerRef.current);
                ocrHintTimerRef.current = null;
            }
            setLoadingMessage(null);
            setLoadingType(null);
        }
    };

    const actions = [
        { id: 'Summary', label: 'Summarize', icon: FileText, color: 'text-blue-600' },
        { id: 'Explain', label: 'Explain Concept', icon: Lightbulb, color: 'text-[#B76E00]' },
        { id: 'Notes', label: 'Generate Notes', icon: BookOpen, color: 'text-emerald-600' },
        { id: 'Quiz', label: 'Generate Quiz', icon: HelpCircle, color: 'text-rose-600' },
    ];

    return (
        <div className="h-full flex flex-col bg-[#FFFFFF] border-l border-[#EBEBEB] w-80 shrink-0 text-[#171717]">
            <div className="p-6 border-b border-[#EBEBEB]">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-100 text-[#0070F3]">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <h2 className="text-[#171717] font-semibold uppercase tracking-wider text-xs">AI Assistant</h2>
                </div>
                <p className="text-[#8F8F8F] text-[10px] font-semibold uppercase tracking-wider">Your personal tutor</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {actions.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => handleAction(action.id)}
                        disabled={!!loadingType}
                        className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#FFFFFF] border border-[#EBEBEB] hover:bg-[#FAFAFA] hover:border-[#171717]/25 hover:shadow-sm transition-all text-left group active:scale-[0.98]"
                    >
                        <div className={`p-2 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] transition-colors ${loadingType === action.id ? 'animate-pulse' : ''}`}>
                            {loadingType === action.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-[#171717]" />
                            ) : (
                                <action.icon className={`w-4 h-4 ${action.color}`} />
                            )}
                        </div>
                        <span className="text-sm font-semibold text-[#4D4D4D] group-hover:text-[#171717] transition-colors">{action.label}</span>
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-[#EBEBEB] bg-[#FAFAFA]">
                <div className="relative">
                    <textarea
                        placeholder="Ask anything about the document..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-white border border-[#EBEBEB] rounded-xl p-4 pr-12 text-sm text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none focus:ring-1 focus:ring-[#171717] focus:border-[#171717] transition-all resize-none h-24"
                    />
                    <button
                        onClick={() => handleAction('Ask', query)}
                        disabled={!query.trim() || !!loadingType}
                        className="absolute right-3 bottom-3 p-2 bg-[#171717] text-white rounded-lg hover:bg-[#333333] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {loadingType === 'Ask' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
                {loadingType && loadingMessage && (
                    <p className="mt-3 text-[10px] font-semibold text-[#0070F3] uppercase tracking-wider">
                        {loadingMessage}
                    </p>
                )}
                {errorMessage && (
                    <p className="mt-3 text-[10px] font-semibold text-rose-600 uppercase tracking-wider">
                        {errorMessage}
                    </p>
                )}
                <p className="text-[9px] text-[#8F8F8F] font-semibold uppercase tracking-wider text-center mt-3 font-mono">Powered by ForgeAI Gemini</p>
            </div>
        </div>
    );
}
