'use client'
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    FileUp,
    FileText,
    ChevronRight,
    Loader2,
    Clock,
    Trash2,
    Search,
    BookOpen,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { FeatureGate } from '@/components/pricing/FeatureGate';

interface Document {
    id: string;
    name: string;
    file_type: string;
    created_at: string;
    file_path: string;
}

export default function StudyForgePage() {
    const params = useParams() as { locale: string };
    const searchParams = useSearchParams();
    const locale = params.locale || 'en-IN';
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStage, setUploadStage] = useState<'idle' | 'uploading' | 'extracting' | 'preparing'>('idle');
    const [searchTerm, setSearchTerm] = useState('');
    const [uploadError, setUploadError] = useState<string | null>(null);

    const fetchDocuments = useCallback(async () => {
        try {
            const res = await fetch('/api/studyforge/documents', { cache: 'no-store' });
            const data = await res.json();
            if (data.documents) {
                setDocuments(data.documents);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleVirtualUpload = useCallback(async (topic: string, content: string) => {
        setIsUploading(true);
        setUploadStage('preparing');
        try {
            const res = await fetch('/api/studyforge/upload/virtual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: topic, content }),
            });
            const data = await res.json();
            if (data.success && data.document?.id) {
                router.push(`/${locale}/studyforge/document/${data.document.id}`);
            } else {
                fetchDocuments(); // Fallback if virtual upload fails
            }
        } catch (error) {
            console.error('Virtual upload error:', error);
            fetchDocuments();
        } finally {
            setIsUploading(false);
            setUploadStage('idle');
        }
    }, [locale, router, fetchDocuments]);

    useEffect(() => {
        if (!searchParams) return;
        const source = searchParams.get('source');
        const topic = searchParams.get('topic');
        const content = searchParams.get('content');

        if (source === 'knowledge' && topic && content) {
            handleVirtualUpload(topic, content);
        } else {
            fetchDocuments();
        }
    }, [searchParams, handleVirtualUpload, fetchDocuments]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadError(null);

        const allowedTypes = new Set([
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
        ]);
        const lowerName = file.name.toLowerCase();

        const maxBytes = 4 * 1024 * 1024;
        if (!allowedTypes.has(file.type) && !lowerName.endsWith('.docx') && !lowerName.endsWith('.txt') && !lowerName.endsWith('.pdf')) {
            setUploadError('Unsupported signal. Please transmit PDF, DOCX, or TXT.');
            e.target.value = '';
            return;
        }

        if (file.size > maxBytes) {
            setUploadError('Signal overflow. Limit is 4MB.');
            e.target.value = '';
            return;
        }

        setIsUploading(true);
        setUploadStage('uploading');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/studyforge/upload', {
                method: 'POST',
                body: formData,
            });

            if (file.type === 'application/pdf') {
                setUploadStage('extracting');
            }

            const contentType = res.headers.get('content-type') || '';
            let data: { success?: boolean; document?: { id: string }; error?: string } = {};

            if (contentType.includes('application/json')) {
                data = await res.json();
            } else {
                const raw = await res.text();
                data.error = raw?.trim() || `Transmission failure (HTTP ${res.status})`;
            }

            if (res.ok && data.success && data.document?.id) {
                setUploadStage('preparing');
                fetchDocuments();
                router.push(`/${locale}/studyforge/document/${data.document.id}`);
            } else {
                setUploadError(data.error || `Protocol Failure (HTTP ${res.status})`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadError('Neural linkage failed. Re-initialize transmission.');
        } finally {
            setIsUploading(false);
            setUploadStage('idle');
            e.target.value = '';
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Command Confirmation: Decommission this document?')) return;

        try {
            const res = await fetch(`/api/studyforge/documents/${id}`, { method: 'DELETE' });
            if (res.ok) fetchDocuments();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const filteredDocs = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <FeatureGate task="study">
            <div className="space-y-10 max-w-5xl mx-auto">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#1E2A42]">
                    <div>
                        <div className="flex items-center gap-2 text-[#00D4A0] font-bold tracking-[0.2em] text-[10px] uppercase mb-2">
                            <BookOpen className="w-3.5 h-3.5" /> Intelligence Core
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-white">
                            StudyForge
                        </h1>
                        <p className="text-slate-400 mt-2">AI-powered document synthesis and study assistance.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        <div className="relative w-full sm:w-72 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5568] group-focus-within:text-[#00D4A0] transition-colors" />
                            <Input
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-11 rounded-xl bg-[#0D1220] border-[#1E2A42] focus:border-[#00D4A0]/30"
                            />
                        </div>

                        <div className="relative w-full sm:w-auto">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept=".pdf,.docx,.txt"
                                onChange={handleUpload}
                                disabled={isUploading}
                            />
                            <Button
                                asChild
                                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#00D4A0] hover:bg-[#00D4A0]/90 text-[#080B16] font-bold text-sm"
                            >
                                <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2">
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
                                    {uploadStage === 'uploading' ? 'Uploading...' :
                                        uploadStage === 'extracting' ? 'Extracting...' :
                                            uploadStage === 'preparing' ? 'Preparing...' :
                                                'Upload Document'}
                                </label>
                            </Button>
                        </div>
                    </div>
                </div>

                {uploadError && (
                    <div className="border border-rose-500/20 bg-rose-500/5 rounded-xl p-4 flex items-center gap-3">
                        <Badge variant="destructive" className="font-bold">ERROR</Badge>
                        <span className="text-sm font-bold text-rose-400">{uploadError}</span>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-8 h-8 text-[#00D4A0] animate-spin" />
                        <p className="text-[#4A5568] font-semibold text-xs">Loading documents...</p>
                    </div>
                ) : filteredDocs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDocs.map((doc) => (
                            <Link
                                key={doc.id}
                                href={`/${locale}/studyforge/document/${doc.id}`}
                            >
                                <div className="group p-6 transition-all rounded-xl border border-[#1E2A42] bg-[#0D1220]/60 hover:border-[#00D4A0]/20 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#00D4A0]/10 flex items-center justify-center text-[#00D4A0] group-hover:scale-105 transition-transform">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => handleDelete(doc.id, e)}
                                            className="h-8 w-8 text-[#4A5568] hover:text-rose-400 hover:bg-rose-400/10 rounded-lg"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2 flex-1">
                                        <h3 className="text-base font-bold text-white line-clamp-2 group-hover:text-[#00D4A0] transition-colors">
                                            {doc.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[9px] font-semibold border-[#1E2A42] bg-[#080B16] text-[#4A5568] uppercase tracking-wider px-2 py-0.5">
                                                {doc.file_type.split('/').pop()}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-[#4A5568]">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[10px] font-semibold">
                                                    {new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-[#1E2A42] flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-[#00D4A0] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all">
                                            Open Document
                                        </span>
                                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-[#00D4A0] group-hover:text-[#080B16] transition-all">
                                            <ChevronRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 rounded-2xl border border-dashed border-[#1E2A42] bg-[#0D1220]/60">
                        <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-7 h-7 text-[#1E2A42]" />
                        </div>
                        <h2 className="text-lg font-bold text-white">No Documents Yet</h2>
                        <p className="text-sm text-[#7A8BA8] mt-2 max-w-sm mx-auto">Upload your first document to start AI-powered study synthesis.</p>
                    </div>
                )}
            </div>
        </FeatureGate>
    );
}
