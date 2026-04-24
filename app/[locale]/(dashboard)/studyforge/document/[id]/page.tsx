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
    Loader2
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
                                <div className="prose prose-invert prose-indigo max-w-none text-slate-300 text-sm leading-relaxed">
                                    <Markdown>{aiResponse}</Markdown>
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
