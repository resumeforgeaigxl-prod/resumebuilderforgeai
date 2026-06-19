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
            <div className="space-y-8 max-w-5xl mx-auto text-[#171717]">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#EBEBEB]">
                    <div>
                        <div className="flex items-center gap-2 text-[#8F8F8F] font-mono text-xs uppercase tracking-wider mb-2">
                            <BookOpen className="w-3.5 h-3.5 text-[#171717]" /> Intelligence Core
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight text-[#171717]">
                            StudyForge
                        </h1>
                        <p className="text-[#4D4D4D] mt-1.5 text-base">AI-powered document synthesis and study assistance.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        <div className="relative w-full sm:w-72 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F] transition-colors" />
                            <Input
                                placeholder="Search documents..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 h-10 rounded-md bg-white border-[#EBEBEB] text-[#171717] placeholder:text-[#8F8F8F] focus:ring-1 focus:ring-[#171717] focus:border-[#171717] text-xs"
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
                                className="w-full sm:w-auto h-10 px-4 rounded-md bg-[#171717] hover:bg-[#171717]/90 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm"
                            >
                                <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2">
                                    {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
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
                    <div className="border border-red-100 bg-red-50 rounded-md p-4 flex items-center gap-3 text-red-600 text-xs font-medium">
                        <Badge variant="destructive" className="font-semibold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded">ERROR</Badge>
                        <span>{uploadError}</span>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-6 h-6 text-[#171717] animate-spin" />
                        <p className="text-[#8F8F8F] font-mono text-[10px] uppercase tracking-wider">Loading documents...</p>
                    </div>
                ) : filteredDocs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDocs.map((doc) => (
                            <Link
                                key={doc.id}
                                href={`/${locale}/studyforge/document/${doc.id}`}
                            >
                                <div className="group p-5 transition-all rounded-xl border border-[#EBEBEB] bg-white hover:border-[#171717] flex flex-col h-full hover:shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-9 h-9 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center text-[#171717] group-hover:scale-[1.02] transition-transform">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => handleDelete(doc.id, e)}
                                            className="h-8 w-8 text-[#8F8F8F] hover:text-[#EE0000] hover:bg-[#FAFAFA] rounded-md"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2 flex-1">
                                        <h3 className="text-sm font-semibold text-[#171717] line-clamp-2 transition-colors">
                                            {doc.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[9px] font-semibold border-[#EBEBEB] bg-[#FAFAFA] text-[#4D4D4D] uppercase tracking-wider px-2 py-0.5 rounded">
                                                {doc.file_type.split('/').pop()}
                                            </Badge>
                                            <div className="flex items-center gap-1 text-[#8F8F8F]">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[10px] font-mono">
                                                    {new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-[#EBEBEB] flex items-center justify-between">
                                        <span className="text-[9px] font-semibold text-[#0070F3] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all">
                                            Open Document
                                        </span>
                                        <div className="w-6 h-6 rounded-md bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center group-hover:bg-[#171717] group-hover:border-[#171717] group-hover:text-white transition-all text-[#171717]">
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 rounded-xl border border-dashed border-[#EBEBEB] bg-white">
                        <div className="w-12 h-12 bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-5 h-5 text-[#8F8F8F]" />
                        </div>
                        <h2 className="text-sm font-semibold text-[#171717] uppercase tracking-wider">No Documents Yet</h2>
                        <p className="text-xs text-[#8F8F8F] mt-1.5 max-w-xs mx-auto">Upload your first document to start AI-powered study synthesis.</p>
                    </div>
                )}
            </div>
        </FeatureGate>
    );
}
