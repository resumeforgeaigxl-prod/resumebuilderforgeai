'use client';

import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2 } from 'lucide-react';

// Import CSS
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFViewerProps {
    fileUrl: string;
    onLoadSuccess: (numPages: number) => void;
    numPages: number | null;
}

export default function PDFViewer({ fileUrl, onLoadSuccess, numPages }: PDFViewerProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        // Safe worker initialization inside useEffect
        if (typeof window !== 'undefined') {
            pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs-worker/pdf.worker.min.mjs';
        }
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <Document
            file={fileUrl}
            onLoadSuccess={({ numPages }) => {
                setLoadError(null);
                onLoadSuccess(numPages);
            }}
            onLoadError={(error) => {
                console.error('[StudyForge] PDF load error:', error);
                setLoadError(error instanceof Error ? error.message : 'Failed to load PDF. Authentication session may have expired.');
            }}
            loading={
                <div className="flex flex-col items-center justify-center p-20 gap-4 min-w-[300px]">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Initializing PDF Engine</p>
                </div>
            }
            error={
                <div className="p-10 text-center border border-dashed border-rose-500/20 rounded-3xl bg-rose-500/5">
                    <p className="text-rose-400 font-bold mb-2">Failed to load PDF</p>
                    <p className="text-slate-500 text-xs text-balance leading-relaxed">
                        {loadError || 'This could be due to a corrupted file or network issue.'}
                    </p>
                </div>
            }
        >
            {Array.from(new Array(numPages || 0), (el, index) => (
                <Page
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    scale={1.2}
                    className="mb-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden border border-white/5"
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                />
            ))}
        </Document>
    );
}
