"use client"
export const dynamic = 'force-dynamic';

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
    Terminal
, Wand2 } from 'lucide-react';

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
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <Loader2 className="w-12 h-12 text-[#171717] animate-spin relative" />
                    </div>
                    <p className="text-[#171717] font-semibold uppercase tracking-wider text-xs">Assembling Your Vision...</p>
                </div>
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="h-screen bg-[#FAFAFA] text-[#171717] flex flex-col overflow-hidden">
            {/* Top Toolbar */}
            <header className="h-16 px-6 border-b border-[#EBEBEB] bg-[#FFFFFF] flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 mr-2 rounded-lg border border-[#EBEBEB] hover:bg-[#FAFAFA] text-[#4D4D4D] transition-all active:scale-95"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-base font-semibold text-[#171717] flex items-center gap-3">
                            {project.project_name}
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[10px] text-blue-700 font-semibold uppercase tracking-wider border border-blue-100">
                                Starter Template
                            </span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 mr-6 text-[10px] font-semibold uppercase tracking-wider text-[#8F8F8F] bg-[#FAFAFA] px-4 py-2 rounded-full border border-[#EBEBEB] font-mono">
                        <Terminal className="w-3.5 h-3.5 text-[#171717]" />
                        Forged with Gemini Flash
                    </div>
                    <button className="px-4 h-9 rounded-md bg-white border border-[#EBEBEB] hover:bg-[#FAFAFA] text-[#171717] text-xs font-semibold transition-all flex items-center gap-2 shadow-sm">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button className="px-4 h-9 rounded-md bg-[#171717] hover:bg-[#333333] text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-sm">
                        <Share2 className="w-4 h-4" />
                        Publish
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar: File Tree */}
                <aside className="w-72 border-r border-[#EBEBEB] flex flex-col bg-[#FFFFFF]">
                    <div className="flex-1 overflow-y-auto">
                        <FileTree
                            files={project.files}
                            onFileSelect={handleFileSelect}
                            activeFile={activeFilePath}
                        />
                    </div>

                    {/* Tech Stack Footer */}
                    <div className="p-6 border-t border-[#EBEBEB] bg-[#FAFAFA]">
                        <h3 className="text-[10px] uppercase font-semibold text-[#8F8F8F] tracking-wider mb-4 font-mono">Tech Stack</h3>
                        <div className="flex flex-wrap gap-2">
                            {project.tech_stack.map((tech, i) => (
                                <span key={i} className="px-3 py-1 rounded-md bg-white border border-[#EBEBEB] text-[10px] text-[#4D4D4D] font-semibold hover:bg-[#FAFAFA] transition-colors cursor-default shadow-sm">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main View Area */}
                <main className="flex-1 flex flex-col overflow-hidden bg-[#FAFAFA]">
                    {/* View Switcher Tabs */}
                    <div className="p-2 border-b border-[#EBEBEB] bg-[#FFFFFF] flex gap-2">
                        {[
                            { id: 'code', label: 'Code Explorer', icon: <Code className="w-4 h-4" /> },
                            { id: 'preview', label: 'UI Preview', icon: <Layout className="w-4 h-4" /> },
                            { id: 'explanation', label: 'Simple Tutorial', icon: <Info className="w-4 h-4" /> }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as 'code' | 'preview' | 'explanation')}
                                className={`px-5 py-2 rounded-md text-xs font-semibold uppercase tracking-wider flex items-center gap-2.5 transition-all ${activeTab === tab.id
                                    ? 'bg-[#171717] text-white shadow-sm'
                                    : 'text-[#4D4D4D] hover:bg-[#FAFAFA] hover:text-[#171717]'
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
                                    <div className="h-full flex items-center justify-center text-[#8F8F8F] flex-col gap-4">
                                        <Code className="w-12 h-12 opacity-20" />
                                        <p className="font-semibold tracking-wider uppercase text-xs font-mono">Select a file to view code</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'preview' && (
                            <PreviewFrame html={project.preview_html} />
                        )}

                        {activeTab === 'explanation' && (
                            <div className="h-full p-8 md:p-16 overflow-y-auto custom-scrollbar max-w-4xl mx-auto prose text-[#4D4D4D] font-normal leading-relaxed">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-semibold uppercase tracking-wider mb-8">
                                    <Wand2 className="w-3.5 h-3.5" />
                                    Beginner Friendly Explanation
                                </div>
                                <h1 className="text-3xl font-semibold text-[#171717] mb-8 tracking-tight">How This Project Works</h1>
                                <div className="text-base text-[#4D4D4D] space-y-6">
                                    {project.explanation.split('\n').map((para, i) => (
                                        <p key={i}>{para}</p>
                                    ))}
                                </div>

                                <div className="mt-16 p-8 rounded-xl bg-white border border-[#EBEBEB] shadow-sm">
                                    <h3 className="text-lg font-semibold text-[#171717] mb-6 tracking-tight flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-[#171717]" />
                                        Project Manifest
                                    </h3>
                                    <div className="bg-[#FAFAFA] p-6 rounded-lg border border-[#EBEBEB]">
                                        <pre className="text-xs font-mono text-[#171717] leading-relaxed overflow-x-auto whitespace-pre-wrap">
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
