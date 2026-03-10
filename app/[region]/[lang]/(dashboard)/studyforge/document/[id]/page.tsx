'use client';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    ChevronLeft,
    FileText,
    Download,
    Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import AISidebar from '@/components/studyforge/AISidebar';

// Dynamically import the PDF viewer component to avoid SSR issues
const PDFViewer = dynamic(() => import('@/components/studyforge/PDFViewer'), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center p-20 gap-4 min-h-[500px]">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Warming Engine</p>
        </div>
    )
});

interface StudyDocument {
    id: string;
    name: string;
    file_type: string;
    file_path: string;
    file_url?: string | null;
    text_content: string;
    created_at: string;
}

export default function DocumentDetailPage() {
    const params = useParams() as { region: string; lang: string; id: string };
    const { region, lang, id } = params;
    const [document, setDocument] = useState<StudyDocument | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'preview' | 'text'>('preview');
    const [numPages, setNumPages] = useState<number | null>(null);

    function onDocumentLoadSuccess(count: number) {
        setNumPages(count);
    }

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/studyforge/documents/${id}`);
            const data = await res.json();
            if (data.document) {
                setDocument(data.document);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Preparing Workspace</p>
            </div>
        );
    }

    if (!document) {
        return (
            <div className="text-center py-20">
                <h1 className="text-2xl font-bold text-white">Document not found</h1>
                <Link href={`/${region}/${lang}/studyforge`} className="text-indigo-400 mt-4 block hover:underline">
                    Back to Library
                </Link>
            </div>
        );
    }

    const fileUrl =
        document.file_url ||
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/study-documents/${document.file_path}`;

    return (
        <div className="flex bg-[#030308] -m-8 h-[calc(100vh-5rem)] overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Navbar */}
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-[#070710]/80">
                    <div className="flex items-center gap-4 min-w-0">
                        <Link
                            href={`/${region}/${lang}/studyforge`}
                            className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-all active:scale-95"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3 truncate">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                                <FileText className="w-4 h-4" />
                            </div>
                            <h1 className="text-sm font-bold text-white truncate">{document.name}</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 mr-2">
                            <button
                                onClick={() => setViewMode('preview')}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Preview
                            </button>
                            <button
                                onClick={() => setViewMode('text')}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Text
                            </button>
                        </div>
                        <a
                            href={fileUrl}
                            target="_blank"
                            download
                            className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                            title="Download Original"
                        >
                            <Download className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {aiResponse ? (
                            <div className="max-w-4xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-[32px] p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4">
                                        <button
                                            onClick={() => setAiResponse(null)}
                                            className="text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:text-white"
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="p-2 bg-indigo-500 rounded-xl">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="text-white font-black uppercase tracking-widest text-[10px]">AI Insight</span>
                                    </div>
                                    <div className="prose prose-invert prose-indigo max-w-none text-slate-300 font-medium leading-relaxed prose-headings:text-indigo-400 prose-strong:text-white text-xs">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {aiResponse}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <div className="max-w-4xl mx-auto h-full min-h-[500px] border border-white/5 rounded-[40px] overflow-hidden bg-black/40 backdrop-blur-sm relative shadow-2xl">
                            {viewMode === 'preview' && document.file_type === 'application/pdf' ? (
                                <div className="w-full h-full overflow-y-auto custom-scrollbar flex flex-col items-center bg-[#050510] p-8">
                                    <PDFViewer
                                        fileUrl={fileUrl}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        numPages={numPages}
                                    />
                                </div>
                            ) : (
                                <div className="p-12 text-slate-400 font-medium leading-loose text-lg whitespace-pre-wrap">
                                    {document.text_content || 'No text extracted from this document.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <AISidebar
                documentId={id}
                onResponse={(res) => {
                    setAiResponse(res);
                }}
            />
        </div>
    );
}

function Sparkles({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24" height="24"
            viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
        </svg>
    );
}
