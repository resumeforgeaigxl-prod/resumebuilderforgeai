'use client';

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
            <div className="space-y-12 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-white/5">
                <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-[0.2em] text-[10px] uppercase mb-3">
                         <BookOpen className="w-3.5 h-3.5" /> Intelligence Core
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                        Study<span className="text-gradient">Forge</span>
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium italic">Neural document synthesis and cognitive assistance.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                        <Input
                            placeholder="Identify Document..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-14 rounded-2xl bg-white/[0.02] border-white/5 focus:border-indigo-500/30"
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
                            variant="premium"
                            className="w-full sm:w-auto h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs relative overflow-hidden group shadow-xl shadow-indigo-500/20"
                        >
                            <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-3">
                                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5" />}
                                {uploadStage === 'uploading' ? 'Transmitting...' :
                                    uploadStage === 'extracting' ? 'Extracting Logic...' :
                                        uploadStage === 'preparing' ? 'Synthesizing...' :
                                            'Initialize Signal'}
                            </label>
                        </Button>
                    </div>
                </div>
            </div>

            {uploadError && (
                <Card glass className="border-rose-500/20 bg-rose-500/[0.02] p-4 flex items-center gap-3 animate-shake">
                    <Badge variant="destructive" className="font-black">CRITICAL</Badge>
                    <span className="text-sm font-bold text-rose-400 uppercase tracking-tight">{uploadError}</span>
                </Card>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-6">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                        <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-indigo-400 animate-pulse" />
                    </div>
                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Synchronizing Document Repository</p>
                </div>
            ) : filteredDocs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocs.map((doc) => (
                        <Link
                            key={doc.id}
                            href={`/${locale}/studyforge/document/${doc.id}`}
                        >
                            <Card glass className="group p-8 transition-all hover:border-indigo-500/30 flex flex-col h-full bg-white/[0.01] hover:bg-white/[0.03]">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all shadow-xl">
                                        <FileText className="w-7 h-7" />
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => handleDelete(doc.id, e)}
                                        className="h-9 w-9 text-slate-600 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>

                                <div className="space-y-3 flex-1">
                                    <h3 className="text-xl font-black text-white line-clamp-2 tracking-tight italic uppercase group-hover:text-indigo-400 transition-colors">
                                        {doc.name}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="text-[9px] font-black border-white/5 bg-white/5 text-slate-500 uppercase tracking-widest px-2 py-0.5">
                                            {doc.file_type.split('/').pop()}
                                        </Badge>
                                        <div className="flex items-center gap-1.5 text-slate-600">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                                {new Date(doc.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                                        Commence Synthesis
                                    </span>
                                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 rounded-[4rem] border-2 border-dashed border-white/5 bg-white/[0.01]">
                    <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl">
                        <FileText className="w-10 h-10 text-slate-700" />
                    </div>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Repository Empty</h2>
                    <p className="text-slate-500 mt-4 max-w-sm mx-auto font-medium">Transmit your first document protocol to initialize AI study synthesis.</p>
                </div>
            )}
        </div>
        </FeatureGate>
    );
}
