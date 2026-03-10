'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    FileUp,
    FileText,
    ChevronRight,
    Loader2,
    Clock,
    Trash2,
    Search
} from 'lucide-react';
import Link from 'next/link';

interface Document {
    id: string;
    name: string;
    file_type: string;
    created_at: string;
    file_path: string;
}

export default function StudyForgePage() {
    const params = useParams() as { region: string; lang: string };
    const { region, lang } = params;
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await fetch('/api/studyforge/documents');
            const data = await res.json();
            if (data.documents) {
                setDocuments(data.documents);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/studyforge/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                fetchDocuments();
                router.push(`/${region}/${lang}/studyforge/document/${data.document.id}`);
            } else {
                alert(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this document?')) return;

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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Study<span className="text-indigo-500">Forge</span>
                    </h1>
                    <p className="text-slate-400 mt-1 font-medium">Intelligent document assistant for your studies.</p>
                </div>

                <div className="relative group">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".pdf,.docx,.txt"
                        onChange={handleUpload}
                        disabled={isUploading}
                    />
                    <label
                        htmlFor="file-upload"
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all cursor-pointer shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5" />}
                        {isUploading ? 'Uploading...' : 'Upload Document'}
                    </label>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                />
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Documents</p>
                </div>
            ) : filteredDocs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDocs.map((doc) => (
                        <Link
                            key={doc.id}
                            href={`/${region}/${lang}/studyforge/document/${doc.id}`}
                            className="group relative bg-[#0a0a1a] border border-white/5 rounded-3xl p-6 transition-all hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => handleDelete(doc.id, e)}
                                    className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold truncate group-hover:text-indigo-400 transition-colors">
                                        {doc.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-2 text-slate-500 text-xs">
                                        <Clock className="w-3 h-3" />
                                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                        <span className="uppercase text-[10px] font-black tracking-widest">
                                            {doc.file_type.split('/').pop()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                    Open Document
                                </span>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-900/20 rounded-[40px] border border-dashed border-white/5">
                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-slate-600" />
                    </div>
                    <h2 className="text-xl font-bold text-white">No documents found</h2>
                    <p className="text-slate-500 mt-2">Upload your first document to get started with AI study assistance.</p>
                </div>
            )}
        </div>
    );
}
