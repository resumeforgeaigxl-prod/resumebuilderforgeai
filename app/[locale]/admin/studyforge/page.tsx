'use client'
export const dynamic = 'force-dynamic';
;

import React, { useState, useEffect } from 'react';
import {
    BookOpen,
    Search,
    Download,
    FileText,
    User,
    Calendar,
    Loader2,
    ExternalLink,
    RefreshCcw
} from 'lucide-react';

interface StudyDoc {
    id: string;
    name: string;
    file_type: string;
    file_path: string;
    created_at: string;
    user_id: string;
    users: {
        email: string;
        full_name: string;
    };
}

export default function AdminStudyForge() {
    const [docs, setDocs] = useState<StudyDoc[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchDocs = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/studyforge/documents');
            const data = await res.json();
            if (data.documents) {
                setDocs(data.documents);
            }
        } catch (err) {
            console.error('Error fetching admin study docs:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, []);

    const filteredDocs = docs.filter(doc =>
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.users?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getDownloadUrl = (path: string) => {
        // Construct public URL from Supabase storage
        // Assuming public bucket or handled by API
        return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/study-documents/${path}`;
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#171717] tracking-tight flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-indigo-500" />
                        StudyForge <span className="text-indigo-500">Document Monitor</span>
                    </h1>
                    <p className="text-[#8F8F8F] mt-1 font-medium">Review and download all user-uploaded study materials.</p>
                </div>

                <button
                    onClick={fetchDocs}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-[#EBEBEB] rounded-xl text-[#8F8F8F] hover:text-[#171717] transition-all"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8F8F8F]" />
                <input
                    type="text"
                    placeholder="Search by document name or user email..."
                    className="w-full bg-[#0a0a1f] border border-[#EBEBEB] rounded-2xl py-4 pl-12 pr-6 text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-[#0a0a1a] border border-[#EBEBEB] rounded-[40px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#EBEBEB] bg-white/[0.02]">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#8F8F8F]">Document</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#8F8F8F]">Student</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#8F8F8F]">Date Uploaded</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-[#8F8F8F] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EBEBEB]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                            <span className="text-xs font-bold text-[#8F8F8F] uppercase tracking-widest">Scanning Repository...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredDocs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <span className="text-xs font-bold text-[#8F8F8F] uppercase tracking-widest">No documents found matching search criteria.</span>
                                    </td>
                                </tr>
                            ) : (
                                filteredDocs.map((doc) => (
                                    <tr key={doc.id} className="group hover:bg-white/[0.01] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                                    <FileText className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h4 className="text-[#171717] font-bold text-sm truncate max-w-[200px]">{doc.name}</h4>
                                                    <p className="text-[10px] text-[#8F8F8F] uppercase font-black tracking-widest">{doc.file_type.split('/')[1] || 'DOC'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#8F8F8F]">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#171717]">{doc.users?.full_name || 'Anonymous'}</p>
                                                    <p className="text-xs text-[#8F8F8F]">{doc.users?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-[#8F8F8F]">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-xs font-medium">{new Date(doc.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-end gap-2">
                                                <a
                                                    href={getDownloadUrl(doc.file_path)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 rounded-2xl bg-white border border-[#EBEBEB] text-[#8F8F8F] hover:text-[#171717] hover:bg-indigo-600 hover:border-indigo-500 transition-all active:scale-95"
                                                    title="Download Document"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </a>
                                                <button
                                                    onClick={() => window.open(`/en-in/studyforge/document/${doc.id}`, '_blank')}
                                                    className="p-3 rounded-2xl bg-white border border-[#EBEBEB] text-[#8F8F8F] hover:text-[#171717] hover:bg-blue-600 hover:border-blue-500 transition-all active:scale-95"
                                                    title="View in StudyForge"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
