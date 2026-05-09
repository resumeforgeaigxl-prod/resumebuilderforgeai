'use client'
export const dynamic = 'force-dynamic';
;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useState, useEffect, useCallback } from 'react';

import { useParams } from 'next/navigation';
import {
    ChevronLeft,
    FileText,
    Download,
    Loader2,
    Sparkles,
    HelpCircle,
    Lightbulb,
    BookOpen
} from 'lucide-react';
import NextDynamic from 'next/dynamic';
import Link from 'next/link';

/**
 * PDF Viewer - Dynamically imported
 */
const PDFViewer = NextDynamic(() => import('@/components/studyforge/PDFViewer'), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center p-20 gap-4 min-h-[400px]">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Loading PDF Engine</p>
        </div>
    )
});

/**
 * AI Sidebar - Dynamically imported
 */
const AISidebar = NextDynamic(() => import('@/components/studyforge/AISidebar'), {
    ssr: false,
    loading: () => <div className="w-80 border-l border-white/5 bg-[#070710]/50" />
});

/**
 * ReactMarkdown - Dynamically imported to prevent Object.defineProperty crash
 */
const Markdown = NextDynamic(() => import('react-markdown'), { ssr: false });

interface StudyDocument {
    id: string;
    name: string;
    file_type: string;
    file_path: string;
    file_url?: string | null;
    text_content: string;
    extracted_text?: string;
    created_at: string;
}

export default function DocumentDetailPage() {
    const params = useParams();
    const locale = (params?.locale as string) || 'en-in';
    const id = params?.id as string;

    const [document, setDocument] = useState<StudyDocument | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'preview' | 'text'>('preview');
    const [numPages, setNumPages] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const renderAIContent = (content: string) => {
        try {
            // Attempt to detect if it's a JSON string
            const trimmed = content.trim();
            if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
                const parsed = JSON.parse(trimmed);

                // Handle Quiz format [ {question, options, answer}, ... ]
                if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0].question || parsed[0].title)) {
                    return (
                        <div className="space-y-10">
                            <div className="flex items-center gap-3 text-rose-400 mb-8 px-2">
                                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Neural Quiz Engine</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Synthesized from Document Protocol</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {parsed.map((item: any, idx: number) => (
                                    <div key={idx} className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 space-y-8 hover:bg-white/[0.04] transition-all duration-500 group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                            <HelpCircle className="w-24 h-24" />
                                        </div>
                                        
                                        <h3 className="text-white text-xl font-bold leading-tight relative z-10">
                                            <span className="text-rose-500/40 font-black mr-4 text-2xl italic">Q{idx + 1}</span>
                                            {item.question || item.title}
                                        </h3>

                                        {item.options && Array.isArray(item.options) && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                                {item.options.map((opt: string, i: number) => (
                                                    <div key={i} className="p-5 rounded-2xl bg-black/40 border border-white/5 text-sm text-slate-400 font-medium group/opt hover:border-white/20 transition-all">
                                                        <span className="text-slate-600 mr-3 font-black group-hover/opt:text-rose-500 transition-colors">{String.fromCharCode(65 + i)}</span>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="pt-8 border-t border-white/5 flex flex-col gap-3 relative z-10">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Solution Protocol</p>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                                <p className="text-base text-slate-200 font-bold italic leading-relaxed">
                                                    {item.answer || item.correct_answer || item.solution}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }

                // Handle Summary format { "summary": [ { "point": "..." }, ... ] } or top-level [ { "point": "..." }, ... ]
                let summaryData = parsed.summary || parsed.points || parsed.notes;
                if (!summaryData && Array.isArray(parsed) && parsed.length > 0 && (parsed[0].point || parsed[0].text || parsed[0].content)) {
                    summaryData = parsed;
                }

                if (summaryData && Array.isArray(summaryData)) {
                    return (
                        <div className="space-y-10">
                            <div className="flex items-center gap-3 text-blue-400 mb-8 px-2">
                                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Intelligence Summary</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Neural Pattern Recognition Active</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-5">
                                {summaryData.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-8 p-10 rounded-[3.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-500 group relative overflow-hidden">
                                        <div className="absolute -left-4 -top-4 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full group-hover:bg-blue-500/10 transition-all" />
                                        
                                        <div className="w-14 h-14 rounded-[1.5rem] bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg font-black shrink-0 border border-blue-500/20 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                            {idx + 1}
                                        </div>
                                        
                                        <div className="prose prose-invert prose-indigo max-w-none text-slate-300 text-lg leading-relaxed font-medium">
                                            <Markdown>{item.point || item.content || item.text || (typeof item === 'string' ? item : JSON.stringify(item))}</Markdown>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }

                // Handle generic object { "response": "..." } or { "content": "..." }
                const directText = parsed.response || parsed.content || parsed.text || parsed.explanation || parsed.output;
                if (directText && typeof directText === 'string') {
                    const isLong = directText.length > 300;
                    return (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center gap-3 text-amber-400 mb-8 px-2">
                                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <Lightbulb className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Neural Insight</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Contextual Logic Extraction</p>
                                </div>
                            </div>
                            <div className={`prose prose-invert prose-indigo max-w-none text-slate-300 leading-relaxed font-medium bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] shadow-2xl ${isLong ? 'text-base' : 'text-lg'}`}>
                                <Markdown>{directText}</Markdown>
                            </div>
                        </div>
                    );
                }

                // Handle generic JSON object or array of objects by converting keys to headings (Removes {{}})
                if (!summaryData) {
                    const objectsToRender = Array.isArray(parsed) ? parsed : [parsed];
                    
                    return (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                             <div className="flex items-center gap-3 text-emerald-400 mb-8 px-2">
                                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em]">Neural Documentation</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Synthesized Protocol View</p>
                                </div>
                            </div>
                            <div className="grid gap-8">
                                {objectsToRender.map((obj: any, index: number) => (
                                    <div key={index} className="prose prose-invert prose-indigo max-w-none text-slate-300 leading-relaxed font-medium bg-white/[0.02] border border-white/5 p-12 rounded-[3.5rem] shadow-2xl overflow-hidden relative">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] blur-[100px] rounded-full" />
                                        {typeof obj === 'object' && obj !== null ? (
                                            Object.entries(obj).map(([key, value]: [string, any]) => (
                                                <div key={key} className="mb-10 last:mb-0 relative z-10">
                                                    <h3 className="text-white text-xl font-bold mb-6 uppercase tracking-tight border-l-4 border-emerald-500/30 pl-6">{key.replace(/_/g, ' ')}</h3>
                                                    {typeof value === 'object' && value !== null ? (
                                                         <div className="pl-6 space-y-6">
                                                             {Object.entries(value).map(([k, v]: [string, any]) => (
                                                                 <div key={k} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                                                                     <h4 className="text-emerald-400 text-xs font-black mb-3 uppercase tracking-widest italic">{k.replace(/_/g, ' ')}</h4>
                                                                     <div className="text-slate-400 text-sm leading-relaxed">
                                                                        {typeof v === 'string' ? <Markdown>{v}</Markdown> : JSON.stringify(v)}
                                                                     </div>
                                                                 </div>
                                                             ))}
                                                         </div>
                                                    ) : (
                                                        <div className="text-slate-300 text-base leading-relaxed pl-6">
                                                            <Markdown>{String(value)}</Markdown>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-slate-300 text-base leading-relaxed relative z-10">
                                                <Markdown>{String(obj)}</Markdown>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }
            }
        } catch (e) {
            // Not JSON, continue to markdown
        }

        // Fallback for raw text (e.g., from Notes action if it returns Markdown directly)
        const isLikelyNotes = content.includes('#') || content.includes('##') || content.length > 1000;
        
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 text-emerald-400 mb-8 px-2">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        {isLikelyNotes ? <BookOpen className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em]">{isLikelyNotes ? 'Research Notes' : 'AI Response'}</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{isLikelyNotes ? 'Structured Document Protocol' : 'Neural Signal Received'}</p>
                    </div>
                </div>
                <div className="prose prose-invert prose-indigo max-w-none text-slate-300 text-sm md:text-base leading-relaxed font-medium bg-white/[0.02] border border-white/5 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/[0.02] blur-[100px] rounded-full" />
                    <Markdown>{content}</Markdown>
                </div>
            </div>
        );
    };

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch(`/api/studyforge/documents/${id}`, { cache: 'no-store' });
            if (!res.ok) {
                setError(`Unable to load document (${res.status})`);
                return;
            }
            const data = await res.json();
            if (data.document) {
                setDocument(data.document);
            } else {
                setError('Document record not found');
            }
        } catch (err) {
            console.error('[StudyForge] Load error:', err);
            setError('Connection failed');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id, fetchData]);


    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-[#030308]">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Vault</p>
            </div>
        );
    }

    if (error || !document) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#030308] text-center p-8">
                <h1 className="text-2xl font-bold text-rose-500 mb-4">{error || '404: Not Found'}</h1>
                <Link href={`/${locale}/studyforge`} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-indigo-400 font-bold hover:bg-white/10 transition-all">
                    Return to Library
                </Link>
            </div>
        );
    }

    const fileUrl = document.file_url || `/api/studyforge/documents/${id}/file`;
    const isPdf = document.file_type === 'application/pdf' || document.name.toLowerCase().endsWith('.pdf');

    return (
        <div className="flex bg-[#030308] -m-8 h-[calc(100vh-5rem)] overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#070710]/80">
                    <div className="flex items-center gap-4">
                        <Link href={`/${locale}/studyforge`} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-indigo-400" />
                            <h1 className="text-sm font-bold text-white truncate max-w-[300px]">{document.name}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setViewMode('preview')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Preview
                            </button>
                            <button
                                onClick={() => setViewMode('text')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Text
                            </button>
                        </div>
                        <a href={fileUrl} target="_blank" download className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-all border border-white/5">
                            <Download className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Main Viewport */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {/* AI Response Bubble */}
                    {aiResponse && (
                        <div className="max-w-4xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-8 relative">
                                <button onClick={() => setAiResponse(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest">
                                    Close
                                </button>
                                <div className="animate-fade-in">
                                    {renderAIContent(aiResponse)}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="max-w-4xl mx-auto min-h-[600px] border border-white/5 rounded-[40px] bg-black/40 overflow-hidden relative shadow-2xl shadow-black/50">
                        {viewMode === 'preview' && isPdf ? (
                            <div className="w-full flex justify-center p-8 bg-[#050510]">
                                <PDFViewer fileUrl={fileUrl} onLoadSuccess={(n) => setNumPages(n)} numPages={numPages} />
                            </div>
                        ) : (
                            <div className="p-12 text-slate-300 font-medium leading-[2] text-lg whitespace-pre-wrap selection:bg-indigo-500/30">
                                {document.extracted_text || document.text_content || 'No text extracted. Please try re-uploading this document.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Assistant Sidebar */}
            <AISidebar documentId={id} onResponse={setAiResponse} />
        </div>
    );
}
