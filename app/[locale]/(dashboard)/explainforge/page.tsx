"use client"
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import {
    Sparkles,
    FileText,
    Zap,
    Github,
    BookOpen,
    MessageSquare,
    Workflow,
    AlertCircle,
    Loader2,
    FileUp,
    Download,
    CheckCircle2,
    Languages,
    Mic2,
    History,
    Calendar,
    ExternalLink,
    Search,
    Play,
    Code,
    Settings,
    FileJson,
    FolderOpen,
    FileLineChart,
    FileCode2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Accordion } from '@/components/ui/Accordion';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureGate } from '@/components/pricing/FeatureGate';

interface ExplainForgeFileResult {
    summary: string;
    logicSteps: string[];
    keyLines: { line: number; explanation: string }[];
    suggestions: string[];
    interviewExplanation: string;
}

interface FileObject {
    name: string;
    content: string;
}

interface ExplainForgeResult {
    summary: string;
    flowSteps: string[];
    interviewExplanation: string;
    questions: string[];
    answers: string[];
    insights: string;
    fileObjects: FileObject[];
    humanExplanation?: string;
    fullReport?: Record<string, unknown>;
    diagrams?: Record<string, string>;
    is_fallback?: boolean;
}

interface ExplainForgeHistoryItem {
    id: string;
    input_type: string;
    created_at: string;
    input_content?: string | null;
    github_url?: string | null;
}

interface ExplainForgeStoredOutput {
    human_explanation?: string;
    interview_explanation?: string;
    viva_explanation?: string;
    report_content?: Record<string, unknown>;
    diagrams?: Record<string, string>;
    algorithms?: Array<{ name: string; explanation: string }>;
    questions?: Array<{ question: string; answer: string }>;
    file_objects?: FileObject[];
}

interface ExplainForgeHistoryDetail extends ExplainForgeHistoryItem {
    explainforge_outputs: ExplainForgeStoredOutput[];
}

export default function ExplainForgePage() {
    const [input, setInput] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ExplainForgeResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<ExplainForgeHistoryItem[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    // Code Review State
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [isAnalyzingFile, setIsAnalyzingFile] = useState(false);
    const [fileReviews, setFileReviews] = useState<Record<string, ExplainForgeFileResult>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchHistory = React.useCallback(async () => {
        setIsLoadingHistory(true);
        try {
            const res = await fetch('/api/ai/explainforge');
            const data = await res.json();
            if (res.ok) {
                setHistory(data.history || []);
            }
        } catch (err) {
            console.error("Failed to fetch history", err);
        } finally {
            setIsLoadingHistory(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const loadFromHistory = async (id: string) => {
        setIsAnalyzing(true);
        setError(null);
        setShowHistory(false);
        try {
            const res = await fetch(`/api/ai/explainforge?id=${id}`);
            const data = await res.json();
            if (res.ok && data.data) {
                const detail = data.data as ExplainForgeHistoryDetail;
                const output = detail.explainforge_outputs?.[0];
                if (!output) {
                    throw new Error('Stored analysis output not found.');
                }

                setResult({
                    summary: output.human_explanation || "",
                    flowSteps: (output.report_content?.flow as string[]) || ["Historical record - Flow not captured."],
                    interviewExplanation: output.interview_explanation || "",
                    questions: (output.questions || []).map(q => q.question),
                    answers: (output.questions || []).map(q => q.answer),
                    insights: output.viva_explanation || "",
                    fileObjects: output.file_objects || [],
                    humanExplanation: output.human_explanation,
                    fullReport: output.report_content,
                    diagrams: output.diagrams
                });
            }
        } catch {
            setError("Failed to load previous analysis.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleAnalyze = async () => {
        if (!input.trim() && files.length === 0 && !githubUrl.trim()) {
            setError("Please provide a project description, files, or a GitHub link.");
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setResult(null);
        setFileReviews({});
        setSelectedFile(null);

        try {
            const uploadedFileUrls: string[] = [];
            const uploadedFileNames: string[] = [];

            if (files.length > 0) {
                for (const file of files) {
                    const formData = new FormData();
                    formData.append('file', file);
                    const uploadRes = await fetch('/api/ai/explainforge/upload', {
                        method: 'POST',
                        body: formData
                    });
                    const uploadData = await uploadRes.json();
                    if (uploadRes.ok) {
                        uploadedFileUrls.push(uploadData.url);
                        uploadedFileNames.push(uploadData.fileName);
                    }
                }
            }

            const res = await fetch('/api/ai/explainforge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: input,
                    githubUrl: githubUrl,
                    fileCount: files.length,
                    fileNames: uploadedFileNames,
                    fileUrls: uploadedFileUrls
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Analysis failed');
            }

            setResult(data.data);
            fetchHistory();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred during analysis';
            setError(message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const exportToPDF = async () => {
        if (!result) return;

        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);
            let y = 20;

            // Header
            doc.setFillColor(16, 185, 129); // Emerald-500
            doc.rect(0, 0, pageWidth, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("EXPLAINFORGE AI REPORT", margin, 25);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 32);

            y = 50;
            doc.setTextColor(30, 41, 59); // Slate-800

            // Project Summary
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Project Summary", margin, y);
            y += 10;
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            const summaryLines = doc.splitTextToSize(result.summary || "", contentWidth);
            doc.text(summaryLines, margin, y);
            y += (summaryLines.length * 5) + 15;

            // System Flow
            if (result.flowSteps && result.flowSteps.length > 0) {
                if (y > 250) { doc.addPage(); y = 20; }
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("System Flow", margin, y);
                y += 10;
                doc.setFontSize(11);
                doc.setFont("helvetica", "normal");
                result.flowSteps.forEach((step, i) => {
                    const stepText = `${i + 1}. ${step}`;
                    const stepLines = doc.splitTextToSize(stepText, contentWidth);
                    doc.text(stepLines, margin, y);
                    y += (stepLines.length * 5) + 5;
                    if (y > 270) { doc.addPage(); y = 20; }
                });
                y += 10;
            }

            // Interview Pitch
            if (y > 250) { doc.addPage(); y = 20; }
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Interview Pitch", margin, y);
            y += 10;
            doc.setFontSize(11);
            doc.setFont("helvetica", "italic");
            const pitchLines = doc.splitTextToSize(`"${result.interviewExplanation}"`, contentWidth);
            doc.text(pitchLines, margin, y);
            y += (pitchLines.length * 5) + 15;

            // Q&A
            if (result.questions && result.questions.length > 0) {
                if (y > 250) { doc.addPage(); y = 20; }
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("Interview Q&A", margin, y);
                y += 12;

                result.questions.forEach((q, i) => {
                    if (y > 250) { doc.addPage(); y = 20; }
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "bold");
                    const qLines = doc.splitTextToSize(`Q: ${q}`, contentWidth);
                    doc.text(qLines, margin, y);
                    y += (qLines.length * 5) + 2;

                    doc.setFontSize(10);
                    doc.setFont("helvetica", "normal");
                    const aLines = doc.splitTextToSize(`A: ${result.answers[i] || ""}`, contentWidth);
                    doc.text(aLines, margin, y);
                    y += (aLines.length * 5) + 10;
                });
            }

            doc.save(`ExplainForge_Report_${Date.now()}.pdf`);
        } catch (err) {
            console.error("PDF Export failed:", err);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    const handleFileReview = async (fileName: string) => {
        if (fileReviews[fileName] || isAnalyzingFile) return;

        const file = result?.fileObjects?.find(f => f.name === fileName);
        if (!file) return;

        setIsAnalyzingFile(true);
        setSelectedFile(fileName);

        try {
            const res = await fetch('/api/ai/explainforge/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName, content: file.content }),
            });
            const data = await res.json();
            if (res.ok) {
                setFileReviews(prev => ({ ...prev, [fileName]: data.data }));
            }
        } catch (err) {
            console.error("Failed to review file", err);
        } finally {
            setIsAnalyzingFile(false);
        }
    };

    const getFileIcon = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase();
        if (['ts', 'tsx', 'js', 'jsx'].includes(ext || '')) return <FileCode2 className="w-4 h-4 text-blue-400" />;
        if (['json'].includes(ext || '')) return <FileJson className="w-4 h-4 text-yellow-400" />;
        if (['md', 'txt'].includes(ext || '')) return <FileText className="w-4 h-4 text-slate-400" />;
        return <FileText className="w-4 h-4 text-slate-500" />;
    };

    return (
        <FeatureGate task="explain">
            <div className="space-y-12 animate-fade-in py-8 max-w-7xl mx-auto px-4">
                {/* Standardized Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E2A42] pb-8 mb-12">
                    <div>
                        <div className="flex items-center gap-2 text-[#00D4A0] font-bold tracking-widest text-[10px] uppercase mb-4">
                            <Sparkles className="w-3.5 h-3.5" /> Intelligence Core
                        </div>
                        <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">ExplainForge</h1>
                        <p className="text-slate-400 mt-2 text-lg">Transform source code into professional interview-ready narratives and logic flows.</p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setShowHistory(!showHistory)}
                        className={`rounded-2xl px-6 border-white/10 hover:bg-white/5 text-[9px] font-black uppercase tracking-widest h-14 flex items-center gap-3 transition-all ${showHistory ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'text-slate-400'}`}
                    >
                        <History className="w-4 h-4" />
                        {showHistory ? 'Close History' : 'View History'}
                    </Button>
                </header>


                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <Card glass className="p-8 border-indigo-500/10 bg-indigo-500/[0.02]">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-sm font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                                        <History className="w-4 h-4 text-indigo-500" /> Recent Logic Materializations
                                    </h3>
                                </div>

                                {isLoadingHistory ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500/50" />
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="text-center py-12 space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                                            <Search className="w-6 h-6 text-slate-600" />
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">No history found</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {history.map((item) => (
                                            <Card
                                                key={item.id}
                                                glass
                                                onClick={() => loadFromHistory(item.id)}
                                                className="p-6 border-white/5 hover:border-indigo-500/30 cursor-pointer group transition-all"
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                    <Badge className="bg-white/5 text-slate-400 text-[9px] uppercase font-black tracking-widest border-none">
                                                        {item.input_type === 'file' ? <FileUp className="w-3 h-3 mr-1.5" /> : item.input_type === 'github' ? <Github className="w-3 h-3 mr-1.5" /> : <FileText className="w-3 h-3 mr-1.5" />}
                                                        {item.input_type}
                                                    </Badge>
                                                    <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-slate-300 font-bold line-clamp-2 mb-4 group-hover:text-white transition-colors">
                                                    {item.input_content || item.github_url || "System Analysis"}
                                                </p>
                                                <div className="flex items-center justify-between pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic">Reload Results</span>
                                                    <ExternalLink className="w-3 h-3 text-indigo-500" />
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!result ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Input Section */}
                        <Card glass className="p-10 space-y-10 border-white/5 bg-[#0c0c1b]/80 backdrop-blur-3xl rounded-[3rem]">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5" /> Project Context
                                </label>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="The more context you provide, the better the interview prep. Paste your description or features here..."
                                    className="w-full h-56 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none font-medium leading-relaxed"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-4">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <Github className="w-3 h-3" /> Repository Link
                                    </label>
                                    <input
                                        type="text"
                                        value={githubUrl}
                                        onChange={(e) => setGithubUrl(e.target.value)}
                                        placeholder="Paste URL..."
                                        className="w-full bg-transparent border-none p-0 text-slate-300 placeholder:text-slate-700 focus:outline-none text-sm font-bold"
                                    />
                                </div>

                                <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 space-y-4 group cursor-pointer hover:bg-emerald-500/10 transition-all" onClick={() => fileInputRef.current?.click()}>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-emerald-500/70 flex items-center gap-2">
                                        <FileUp className="w-3 h-3" /> Source Code / Docs
                                    </label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-400">
                                            {files.length > 0 ? `${files.length} Files Ready` : 'Upload ZIP/Files'}
                                        </span>
                                        <FileUp className="w-4 h-4 text-emerald-500 group-hover:translate-y-[-2px] transition-transform" />
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-bold uppercase tracking-wider flex items-center gap-3 italic"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    SYSTEM_ERROR: {error}
                                </motion.div>
                            )}

                            <Button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="w-full py-10 rounded-[2.5rem] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.01] active:scale-[0.99] transition-all relative overflow-hidden group shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)]"
                            >
                                {isAnalyzing ? (
                                    <div className="flex items-center gap-4">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Synthesizing Knowledge...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-4 px-8">
                                        <Zap className="w-5 h-5 fill-slate-950" />
                                        Generate Interview Material
                                    </div>
                                )}
                            </Button>
                        </Card>

                        {/* Features Preview */}
                        <div className="flex flex-col justify-center space-y-8">
                            <header className="space-y-4">
                                <h3 className="text-3xl font-black text-white italic leading-none">MASTER YOUR INTERVIEW</h3>
                                <p className="text-slate-500 font-medium">ExplainForge transforms raw complexity into speech-ready interview answers.</p>
                            </header>

                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { title: 'Human Summary', desc: 'A clean, step-by-step breakdown of your project logic.', icon: BookOpen, color: 'text-emerald-400' },
                                    { title: 'Interview Pitch', desc: 'A natural 30-second speech to explain your project as an impact-oriented story.', icon: Mic2, color: 'text-blue-400' },
                                    { title: 'Code Review', desc: 'Deep dive into individual files with AI-powered line explanations.', icon: Code, color: 'text-purple-400' }
                                ].map((f, i) => (
                                    <Card glass key={i} className="p-8 border-white/5 flex gap-6 items-start hover:bg-white/[0.03] transition-all">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                                            <f.icon className={`w-5 h-5 ${f.color}`} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black text-white uppercase italic tracking-wider">{f.title}</h4>
                                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{f.desc}</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-10 pb-20"
                    >
                        {/* Results Nav */}
                        <div className="flex items-center justify-between gap-8 p-6 glass-card border-white/5 bg-white/[0.02] rounded-[2rem]">
                            <Tabs defaultValue="interview" className="w-full">
                                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                                    <TabsList className="bg-black/50 p-1.5 rounded-2xl border border-white/10">
                                        <TabsTrigger value="interview" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-slate-950 rounded-xl px-8 py-2.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Mic2 className="w-3.5 h-3.5" /> Interview Prep
                                        </TabsTrigger>
                                        <TabsTrigger value="review" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-xl px-8 py-2.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            <Code className="w-3.5 h-3.5" /> Code Review
                                        </TabsTrigger>
                                    </TabsList>

                                    <div className="flex items-center gap-4">
                                        <Button variant="outline" onClick={() => setResult(null)} className="rounded-xl px-6 border-white/10 hover:bg-white/5 text-[9px] font-black uppercase tracking-widest h-12">
                                            Start Over
                                        </Button>
                                        <Button onClick={exportToPDF} className="rounded-xl px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[9px] font-black uppercase tracking-widest h-12 flex items-center gap-3">
                                            <Download className="w-3.5 h-3.5" /> Export Report
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-12">
                                    <TabsContent value="interview" className="space-y-10">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            <div className="lg:col-span-2 space-y-8">
                                                <Card glass className="p-10 border-white/5 space-y-8 rounded-[3rem]">
                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3 text-emerald-400">
                                                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                                                    <Languages className="w-5 h-5" />
                                                                </div>
                                                                <h3 className="text-lg font-black uppercase italic tracking-tight">Project Summary</h3>
                                                            </div>
                                                            <Badge className="bg-emerald-500 text-slate-950 font-black">CAREER READY</Badge>
                                                        </div>
                                                        <div className="prose prose-invert prose-emerald max-w-none text-slate-300 leading-relaxed font-medium">
                                                            <ReactMarkdown>{result.summary}</ReactMarkdown>
                                                        </div>
                                                    </div>

                                                    <div className="pt-10 border-t border-white/5 space-y-8">
                                                        <div className="flex items-center gap-3 text-indigo-400">
                                                            <div className="p-2 rounded-lg bg-indigo-500/10">
                                                                <Workflow className="w-5 h-5" />
                                                            </div>
                                                            <h3 className="text-lg font-black uppercase italic tracking-tight">System Flow</h3>
                                                        </div>
                                                        <div className="space-y-4">
                                                            {(result.flowSteps || []).map((step, i) => (
                                                                <div key={i} className="flex gap-6 group">
                                                                    <div className="flex flex-col items-center">
                                                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg">
                                                                            {i + 1}
                                                                        </div>
                                                                        {i !== (result.flowSteps?.length || 0) - 1 && (
                                                                            <div className="w-px h-full bg-gradient-to-b from-indigo-500/30 to-transparent my-2" />
                                                                        )}
                                                                    </div>
                                                                    <div className="pb-8">
                                                                        <p className="text-slate-300 font-bold text-sm tracking-tight">{step}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </Card>

                                                {/* Q&A Section */}
                                                <div className="space-y-8">
                                                    <div className="flex items-center gap-3 text-white px-2">
                                                        <MessageSquare className="w-5 h-5 text-purple-400" />
                                                        <h3 className="text-xl font-black uppercase italic tracking-wider">Project Q&A</h3>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-6">
                                                        {(result.questions || []).map((q, i) => (
                                                            <Card glass key={i} className="p-8 border-white/5 hover:bg-white/[0.02] transition-all rounded-[2rem]">
                                                                <div className="space-y-6">
                                                                    <div className="flex items-start gap-4">
                                                                        <Badge className="bg-purple-500/10 text-purple-400 border-none shrink-0 font-mono">Q{i + 1}</Badge>
                                                                        <h4 className="text-base font-bold text-white uppercase italic tracking-tight">{q}</h4>
                                                                    </div>
                                                                    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 border-l-purple-500 border-l-4">
                                                                        <p className="text-sm text-slate-400 leading-relaxed font-medium italic">
                                                                            <span className="text-[10px] font-black text-purple-500 uppercase block mb-3 tracking-widest">Expert Answer</span>
                                                                            {result.answers?.[i] || "Answer not generated."}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-8">
                                                <Card glass className="p-8 space-y-6 border-blue-500/20 bg-blue-500/[0.02] rounded-[2.5rem] sticky top-8">
                                                    <div className="flex items-center gap-3 text-blue-400">
                                                        <Mic2 className="w-5 h-5" />
                                                        <h3 className="text-sm font-black uppercase italic tracking-widest">Interview Pitch</h3>
                                                    </div>
                                                    <div className="space-y-6">
                                                        <div className="p-6 rounded-2xl bg-black border border-white/5 italic text-slate-400 text-sm leading-relaxed relative font-serif">
                                                            <span className="text-blue-500/40 text-2xl mr-1">&ldquo;</span>
                                                            {result.interviewExplanation}
                                                            <span className="text-blue-500/40 text-2xl ml-1">&rdquo;</span>
                                                        </div>
                                                        <Button className="w-full bg-blue-500 hover:bg-blue-400 text-slate-950 font-black uppercase text-[11px] tracking-widest h-14 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center gap-3 italic">
                                                            <Play className="w-4 h-4 fill-slate-950" /> Speak Practice
                                                        </Button>
                                                    </div>
                                                </Card>

                                                <Card glass className="p-8 space-y-6 border-orange-500/10 rounded-[2.5rem]">
                                                    <div className="flex items-center gap-3 text-orange-400">
                                                        <Zap className="w-5 h-5" />
                                                        <h3 className="text-sm font-black uppercase italic tracking-widest">Core Insights</h3>
                                                    </div>
                                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-slate-400 text-xs leading-relaxed font-semibold">
                                                        {result.insights || "Deep logic insights materialized successfully."}
                                                    </div>
                                                </Card>

                                                <Accordion title="Visual System Diagrams" icon={<Workflow className="w-4 h-4" />}>
                                                    <div className="space-y-8 mt-6">
                                                        {result.diagrams && Object.entries(result.diagrams).map(([name, code], i) => (
                                                            <div key={i} className="space-y-3">
                                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{name.replace(/([A-Z])/g, ' $1')}</h4>
                                                                <div className="p-6 rounded-2xl bg-black border border-white/5 font-mono text-[9px] text-emerald-500 overflow-x-auto custom-scrollbar">
                                                                    {code}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Accordion>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="review" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[750px] overflow-hidden">
                                            {/* File Explorer */}
                                            <Card glass className="lg:col-span-1 p-6 border-white/5 overflow-y-auto custom-scrollbar rounded-[2.5rem] bg-black/40">
                                                <div className="space-y-6">
                                                    <div className="flex items-center gap-3 px-2">
                                                        <FolderOpen className="w-4 h-4 text-purple-400" />
                                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-white italic">Project Files</h3>
                                                    </div>

                                                    <div className="space-y-1">
                                                        {result.fileObjects && result.fileObjects.length > 0 ? (
                                                            result.fileObjects.map((file) => (
                                                                <button
                                                                    key={file.name}
                                                                    onClick={() => handleFileReview(file.name)}
                                                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group ${selectedFile === file.name ? 'bg-purple-500/20 border-purple-500/30' : 'hover:bg-white/5 border border-transparent'}`}
                                                                >
                                                                    {getFileIcon(file.name)}
                                                                    <span className={`text-xs font-medium truncate ${selectedFile === file.name ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                                        {file.name}
                                                                    </span>
                                                                    {fileReviews[file.name] && <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-auto shrink-0" />}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="p-10 text-center space-y-4 opacity-50">
                                                                <FileText className="w-8 h-8 mx-auto text-slate-600" />
                                                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">No source files detected</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>

                                            {/* Analysis Panel */}
                                            <Card glass className="lg:col-span-3 p-10 border-white/5 overflow-y-auto custom-scrollbar rounded-[2.5rem] bg-black/20">
                                                {!selectedFile ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                                        <div className="w-24 h-24 rounded-[2rem] bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                                                            <Search className="w-10 h-10 text-purple-400" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h3 className="text-xl font-black text-white italic uppercase tracking-wider">Select a file to review</h3>
                                                            <p className="text-slate-500 font-medium max-w-sm">Get line-by-line logic explanations and interview-ready context for individual files.</p>
                                                        </div>
                                                    </div>
                                                ) : isAnalyzingFile ? (
                                                    <div className="h-full flex flex-col items-center justify-center space-y-6">
                                                        <div className="relative">
                                                            <Loader2 className="w-16 h-16 animate-spin text-purple-500" />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Code className="w-6 h-6 text-purple-400" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2 text-center">
                                                            <p className="text-sm font-black text-white uppercase tracking-[0.2em] italic animate-pulse">Analyzing logic flows...</p>
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gemini is reviewing {selectedFile}</p>
                                                        </div>
                                                    </div>
                                                ) : fileReviews[selectedFile] ? (
                                                    <div className="space-y-10 animate-fade-in">
                                                        <header className="flex items-start justify-between gap-6 pb-8 border-b border-white/5">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-3">
                                                                    {getFileIcon(selectedFile)}
                                                                    <h2 className="text-2xl font-black text-white italic uppercase">{selectedFile}</h2>
                                                                </div>
                                                                <p className="text-slate-400 font-medium italic">{fileReviews[selectedFile].summary}</p>
                                                            </div>
                                                            <Badge className="bg-purple-500 text-white font-black uppercase tracking-widest text-[9px] px-3 py-1">CODE REVIEWED</Badge>
                                                        </header>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            {/* Logic Steps */}
                                                            <div className="space-y-6">
                                                                <div className="flex items-center gap-3 text-purple-400">
                                                                    <FileLineChart className="w-4 h-4" />
                                                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Logic Progression</h4>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    {fileReviews[selectedFile].logicSteps.map((step, i) => (
                                                                        <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors">
                                                                            <span className="text-[9px] font-black text-purple-500 font-mono mt-1 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                                                                            <p className="text-xs text-slate-300 font-medium leading-relaxed">{step}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Key Lines */}
                                                            <div className="space-y-6">
                                                                <div className="flex items-center gap-3 text-blue-400">
                                                                    <Settings className="w-4 h-4" />
                                                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Critical Code Segments</h4>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    {fileReviews[selectedFile].keyLines && fileReviews[selectedFile].keyLines.length > 0 ? (
                                                                        fileReviews[selectedFile].keyLines.map((line, i) => (
                                                                            <div key={i} className="space-y-2 group">
                                                                                <div className="flex items-center justify-between px-2">
                                                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic group-hover:text-blue-400 transition-colors">Line {line.line}</span>
                                                                                    <span className="text-[9px] font-black text-blue-500 italic opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Logic Explanation</span>
                                                                                </div>
                                                                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 border-l-blue-500 border-l-2">
                                                                                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed italic">{line.explanation}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                                                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">No complex code blocks identified</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="pt-8 border-t border-white/5">
                                                            <div className="flex items-center gap-3 text-emerald-400 mb-6">
                                                                <Sparkles className="w-4 h-4" />
                                                                <h4 className="text-[10px] font-black uppercase tracking-widest">Interview Material for this Module</h4>
                                                            </div>
                                                            <div className="p-8 rounded-[2rem] bg-emerald-500/[0.02] border border-emerald-500/10 italic text-slate-300 text-sm leading-relaxed font-medium">
                                                                &ldquo;{fileReviews[selectedFile].interviewExplanation}&rdquo;
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </Card>
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </motion.div>
                )}
            </div>
        </FeatureGate>
    );
}
