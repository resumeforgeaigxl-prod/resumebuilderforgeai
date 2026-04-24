"use client"
export const dynamic = 'force-dynamic';
;

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Download,
    Share2,
    Layout,
    FileText,
    Code,
    Info,
    Loader2,
    Terminal,
    Sparkles
} from 'lucide-react';

import FileTree from '@/components/projectforge/FileTree';
import CodeViewer from '@/components/projectforge/CodeViewer';
import PreviewFrame from '@/components/projectforge/PreviewFrame';

interface Project {
    id: string;
    project_name: string;
    tech_stack: string[];
    folder_structure: string;
    files: Array<{ path: string; code: string }>;
    preview_html: string;
    explanation: string;
}

export default function ProjectViewer() {
    const params = useParams() as { locale: string; projectId: string };
    const { locale, projectId } = params;
    const router = useRouter();

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeFilePath, setActiveFilePath] = useState<string>('');
    const [activeFileCode, setActiveFileCode] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'explanation'>('code');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/projectforge/projects/${projectId}`);
                if (!res.ok) throw new Error("Failed to load project");
                const data = await res.json();
                setProject(data);

                // Set first file as default active
                if (data.files && data.files.length > 0) {
                    setActiveFilePath(data.files[0].path);
                    setActiveFileCode(data.files[0].code);
                }
            } catch (err) {
                console.error(err);
                router.push(`/${locale}/projectforge`);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [projectId, locale, router]);

    const handleFileSelect = (path: string) => {
        const file = project?.files.find(f => f.path === path);
        if (file) {
            setActiveFilePath(path);
            setActiveFileCode(file.code);
            setActiveTab('code'); // Switch to code tab when a file is selected
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#070710] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-150 animate-pulse"></div>
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin relative" />
                    </div>
                    <p className="text-blue-400 font-black uppercase tracking-[0.2em] text-xs">Assembling Your Vision...</p>
                </div>
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="h-screen bg-[#070710] text-slate-200 flex flex-col overflow-hidden">
            {/* Top Toolbar */}
            <header className="h-16 px-6 border-b border-white/5 bg-[#0a0a15] flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 mr-2 rounded-xl border border-white/5 hover:bg-white/5 text-slate-400 transition-all active:scale-90"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-white flex items-center gap-3">
                            {project.project_name}
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-[10px] text-blue-400 font-black uppercase tracking-widest border border-blue-500/20">
                                Starter Template
                            </span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 mr-6 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                        <Terminal className="w-3.5 h-3.5" />
                        Forged with Gemini Flash
                    </div>
                    <button className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-black transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Publish
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar: File Tree */}
                <aside className="w-72 border-r border-white/5 flex flex-col bg-[#0a0a15]">
                    <div className="flex-1">
                        <FileTree
                            files={project.files}
                            onFileSelect={handleFileSelect}
                            activeFile={activeFilePath}
                        />
                    </div>

                    {/* Tech Stack Footer */}
                    <div className="p-6 border-t border-white/5 bg-[#070710]">
                        <h3 className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-4">Tech Stack</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.tech_stack.map((tech, i) => (
                                <span key={i} className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-300 font-bold hover:bg-white/10 transition-colors cursor-default">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main View Area */}
                <main className="flex-1 flex flex-col overflow-hidden bg-[#0d0d1a]">
                    {/* View Switcher Tabs */}
                    <div className="p-2 border-b border-white/5 bg-[#0a0a15] flex gap-2">
                        {[
                            { id: 'code', label: 'Code Explorer', icon: <Code className="w-4 h-4" /> },
                            { id: 'preview', label: 'UI Preview', icon: <Layout className="w-4 h-4" /> },
                            { id: 'explanation', label: 'Simple Tutorial', icon: <Info className="w-4 h-4" /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'code' | 'preview' | 'explanation')}
                                className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {activeTab === 'code' && (
                            <div className="h-full">
                                {activeFilePath ? (
                                    <CodeViewer code={activeFileCode} path={activeFilePath} />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-slate-500 flex-col gap-4">
                                        <Code className="w-12 h-12 opacity-20" />
                                        <p className="font-bold tracking-widest uppercase text-xs">Select a file to view code</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'preview' && (
                            <PreviewFrame html={project.preview_html} />
                        )}

                        {activeTab === 'explanation' && (
                            <div className="h-full p-8 md:p-16 overflow-y-auto custom-scrollbar prose prose-invert prose-blue max-w-4xl mx-auto">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-8">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Beginner Friendly Explanation
                                </div>
                                <h1 className="text-4xl font-black text-white mb-8 tracking-tighter">How This Project Works</h1>
                                <div className="text-lg text-slate-400 leading-relaxed font-medium space-y-6">
                                    {project.explanation.split('\n').map((para, i) => (
                                        <p key={i}>{para}</p>
                                    ))}
                                </div>

                                <div className="mt-16 p-8 rounded-[40px] bg-white/5 border border-white/5">
                                    <h3 className="text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-blue-500" />
                                        Project Manifest
                                    </h3>
                                    <div className="bg-[#070710] p-6 rounded-2xl border border-white/5">
                                        <pre className="text-sm font-mono text-blue-400/80 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                                            {project.folder_structure}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
