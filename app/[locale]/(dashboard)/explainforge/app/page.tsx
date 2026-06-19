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
            doc.setFillColor(23, 23, 23); // Primary Ink
            doc.rect(0, 0, pageWidth, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("EXPLAINFORGE AI REPORT", margin, 25);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 32);

            y = 50;
            doc.setTextColor(23, 23, 23);

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
        if (['ts', 'tsx', 'js', 'jsx'].includes(ext || '')) return <FileCode2 className="w-4 h-4 text-blue-500" />;
        if (['json'].includes(ext || '')) return <FileJson className="w-4 h-4 text-amber-500" />;
        if (['md', 'txt'].includes(ext || '')) return <FileText className="w-4 h-4 text-neutral-500" />;
        return <FileText className="w-4 h-4 text-neutral-500" />;
    };

    return (
        <FeatureGate task="explain">
            <div className="space-y-8 animate-fade-in py-6 max-w-7xl mx-auto px-4 text-[#171717]">
                {/* Standardized Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EBEBEB] pb-6 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-[#8F8F8F] font-mono text-xs uppercase tracking-wider mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#171717]" /> Intelligence Core
                        </div>
                        <h1 className="text-3xl font-semibold tracking-tight text-[#171717] uppercase">ExplainForge</h1>
                        <p className="text-[#4D4D4D] mt-1.5 text-base">Transform source code into professional interview-ready narratives and logic flows.</p>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setShowHistory(!showHistory)}
                        className={`rounded-md px-4 h-10 border-[#EBEBEB] hover:bg-[#FAFAFA] text-xs font-medium flex items-center gap-2.5 transition-all bg-white text-[#171717] ${showHistory ? 'bg-[#FAFAFA] border-[#171717]' : ''}`}
                    >
                        <History className="w-4 h-4 text-[#4D4D4D]" />
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
                            <Card className="p-6 border-[#EBEBEB] bg-white shadow-sm mb-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xs font-semibold text-[#171717] uppercase tracking-wider flex items-center gap-2">
                                        <History className="w-4 h-4 text-[#4D4D4D]" /> Recent Logic Materializations
                                    </h3>
                                </div>

                                {isLoadingHistory ? (
                                    <div className="flex justify-center py-10">
                                        <Loader2 className="w-6 h-6 animate-spin text-[#8F8F8F]" />
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="text-center py-10 space-y-3">
                                        <div className="w-12 h-12 rounded-full bg-[#FAFAFA] flex items-center justify-center mx-auto border border-[#EBEBEB]">
                                            <Search className="w-5 h-5 text-[#8F8F8F]" />
                                        </div>
                                        <p className="text-[#8F8F8F] text-xs uppercase tracking-wider">No history found</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {history.map((item) => (
                                            <Card
                                                key={item.id}
                                                onClick={() => loadFromHistory(item.id)}
                                                className="p-5 border-[#EBEBEB] hover:border-[#171717] cursor-pointer group transition-all bg-white hover:shadow-sm"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <Badge className="bg-[#FAFAFA] text-[#4D4D4D] text-[9px] uppercase tracking-wider border border-[#EBEBEB]">
                                                        {item.input_type === 'file' ? <FileUp className="w-2.5 h-2.5 mr-1" /> : item.input_type === 'github' ? <Github className="w-2.5 h-2.5 mr-1" /> : <FileText className="w-2.5 h-2.5 mr-1" />}
                                                        {item.input_type}
                                                    </Badge>
                                                    <div className="text-[10px] text-[#8F8F8F] font-mono flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-[#4D4D4D] font-medium line-clamp-2 mb-3 group-hover:text-[#171717] transition-colors">
                                                    {item.input_content || item.github_url || "System Analysis"}
                                                </p>
                                                <div className="flex items-center justify-between pt-3 border-t border-[#EBEBEB] opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[9px] font-semibold text-[#0070F3] uppercase tracking-wider">Reload Results</span>
                                                    <ExternalLink className="w-3 h-3 text-[#0070F3]" />
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Input Section */}
                        <Card className="p-8 space-y-6 border-[#EBEBEB] bg-white rounded-xl shadow-sm">
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#8F8F8F] flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5 text-[#171717]" /> Project Context
                                </label>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Paste your description or features here. The more context you provide, the better the interview prep..."
                                    className="w-full h-48 bg-white border border-[#EBEBEB] rounded-lg p-4 text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none focus:ring-1 focus:ring-[#171717] focus:border-[#171717] transition-all resize-none text-sm font-normal leading-relaxed"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] space-y-2">
                                    <label className="text-[9px] font-semibold uppercase tracking-wider text-[#8F8F8F] flex items-center gap-1.5">
                                        <Github className="w-3 h-3 text-[#171717]" /> Repository Link
                                    </label>
                                    <input
                                        type="text"
                                        value={githubUrl}
                                        onChange={(e) => setGithubUrl(e.target.value)}
                                        placeholder="Paste URL..."
                                        className="w-full bg-transparent border-none p-0 text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none text-xs font-medium"
                                    />
                                </div>

                                <div className="p-4 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] space-y-2 group cursor-pointer hover:bg-white transition-all" onClick={() => fileInputRef.current?.click()}>
                                    <label className="text-[9px] font-semibold uppercase tracking-wider text-[#8F8F8F] flex items-center gap-1.5">
                                        <FileUp className="w-3 h-3 text-[#171717]" /> Source Code / Docs
                                    </label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-[#4D4D4D]">
                                            {files.length > 0 ? `${files.length} Files Ready` : 'Upload ZIP/Files'}
                                        </span>
                                        <FileUp className="w-4 h-4 text-[#4D4D4D] group-hover:translate-y-[-1px] transition-transform" />
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
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-medium flex items-center gap-2.5"
                                >
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    Error: {error}
                                </motion.div>
                            )}

                            <Button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="w-full py-6 rounded-md bg-[#171717] hover:bg-[#171717]/90 text-white font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2.5"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Synthesizing Knowledge...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" />
                                        Generate Interview Material
                                    </>
                                )}
                            </Button>
                        </Card>

                        {/* Features Preview */}
                        <div className="flex flex-col justify-center space-y-6">
                            <header className="space-y-2">
                                <h3 className="text-2xl font-semibold text-[#171717] tracking-tight">Master Your Technical Interview</h3>
                                <p className="text-[#4D4D4D] text-sm">ExplainForge transforms raw codebase complexity into speech-ready interview answers.</p>
                            </header>

                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { title: 'Human Summary', desc: 'A clean, step-by-step breakdown of your project logic.', icon: BookOpen },
                                    { title: 'Interview Pitch', desc: 'A natural 30-second speech to explain your project as an impact-oriented story.', icon: Mic2 },
                                    { title: 'Code Review', desc: 'Deep dive into individual files with AI-powered line explanations.', icon: Code }
                                ].map((f, i) => (
                                    <Card key={i} className="p-5 border-[#EBEBEB] bg-white flex gap-4 items-start hover:shadow-md transition-shadow">
                                        <div className="w-10 h-10 rounded-lg bg-[#FAFAFA] flex items-center justify-center shrink-0 border border-[#EBEBEB]">
                                            <f.icon className="w-4 h-4 text-[#171717]" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <h4 className="text-sm font-semibold text-[#171717]">{f.title}</h4>
                                            <p className="text-xs text-[#8F8F8F] leading-normal">{f.desc}</p>
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
                        className="space-y-6 pb-20"
                    >
                        {/* Results Nav */}
                        <div className="flex items-center justify-between gap-6 p-4 bg-white border border-[#EBEBEB] rounded-xl shadow-sm">
                            <Tabs defaultValue="interview" className="w-full">
                                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                                    <TabsList className="bg-[#F2F2F2] p-1 rounded-lg flex">
                                        <TabsTrigger value="interview" className="data-[state=active]:bg-white data-[state=active]:text-[#171717] data-[state=active]:shadow-sm text-[#4D4D4D] hover:text-[#171717] rounded-md px-6 py-1.5 text-xs font-medium flex items-center gap-2 transition-all">
                                            <Mic2 className="w-3.5 h-3.5 text-[#4D4D4D]" /> Interview Prep
                                        </TabsTrigger>
                                        <TabsTrigger value="review" className="data-[state=active]:bg-white data-[state=active]:text-[#171717] data-[state=active]:shadow-sm text-[#4D4D4D] hover:text-[#171717] rounded-md px-6 py-1.5 text-xs font-medium flex items-center gap-2 transition-all">
                                            <Code className="w-3.5 h-3.5 text-[#4D4D4D]" /> Code Review
                                        </TabsTrigger>
                                    </TabsList>

                                    <div className="flex items-center gap-3">
                                        <Button variant="outline" onClick={() => setResult(null)} className="rounded-md px-4 h-10 border-[#EBEBEB] hover:bg-[#FAFAFA] text-xs font-medium bg-white text-[#171717]">
                                            Start Over
                                        </Button>
                                        <Button onClick={exportToPDF} className="rounded-md px-4 h-10 bg-[#171717] hover:bg-[#171717]/90 text-white text-xs font-medium flex items-center gap-2">
                                            <Download className="w-3.5 h-3.5" /> Export Report
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <TabsContent value="interview" className="space-y-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            <div className="lg:col-span-2 space-y-6">
                                                <Card className="p-8 border-[#EBEBEB] space-y-6 rounded-xl bg-white shadow-sm">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2.5 text-[#171717]">
                                                                <div className="p-1.5 rounded bg-[#FAFAFA] border border-[#EBEBEB]">
                                                                    <Languages className="w-4 h-4 text-[#171717]" />
                                                                </div>
                                                                <h3 className="text-base font-semibold">Project Summary</h3>
                                                            </div>
                                                            <Badge className="bg-[#EBEBEB] text-[#171717] font-semibold border-none rounded px-2.5 py-0.5 text-[10px]">CAREER READY</Badge>
                                                        </div>
                                                        <div className="prose max-w-none text-[#171717] leading-relaxed font-normal text-sm">
                                                            <ReactMarkdown>{result.summary}</ReactMarkdown>
                                                        </div>
                                                    </div>

                                                    <div className="pt-6 border-t border-[#EBEBEB] space-y-6">
                                                        <div className="flex items-center gap-2.5 text-[#171717]">
                                                            <div className="p-1.5 rounded bg-[#FAFAFA] border border-[#EBEBEB]">
                                                                    <Workflow className="w-4 h-4 text-[#171717]" />
                                                            </div>
                                                            <h3 className="text-base font-semibold">System Flow</h3>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {(result.flowSteps || []).map((step, i) => (
                                                                <div key={i} className="flex gap-4 group">
                                                                    <div className="flex flex-col items-center">
                                                                        <div className="w-7 h-7 rounded-full bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center text-xs font-mono text-[#171717] group-hover:bg-[#171717] group-hover:text-white transition-all shadow-sm">
                                                                            {i + 1}
                                                                        </div>
                                                                        {i !== (result.flowSteps?.length || 0) - 1 && (
                                                                            <div className="w-px h-full bg-[#EBEBEB] my-1" />
                                                                        )}
                                                                    </div>
                                                                    <div className="pb-4">
                                                                        <p className="text-[#4D4D4D] font-medium text-xs tracking-normal pt-1.5">{step}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </Card>

                                                {/* Q&A Section */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2.5 text-[#171717] px-1">
                                                        <MessageSquare className="w-4 h-4 text-[#4D4D4D]" />
                                                        <h3 className="text-base font-semibold">Project Q&A</h3>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-4">
                                                        {(result.questions || []).map((q, i) => (
                                                            <Card key={i} className="p-6 border-[#EBEBEB] hover:shadow-md transition-shadow bg-white rounded-xl">
                                                                <div className="space-y-4">
                                                                    <div className="flex items-start gap-3">
                                                                        <Badge className="bg-[#FAFAFA] text-[#171717] border border-[#EBEBEB] shrink-0 font-mono text-[10px] rounded px-2">Q{i + 1}</Badge>
                                                                        <h4 className="text-sm font-semibold text-[#171717] tracking-tight">{q}</h4>
                                                                    </div>
                                                                    <div className="p-4 rounded bg-[#FAFAFA] border border-[#EBEBEB] border-l-[#171717] border-l-4">
                                                                        <p className="text-xs text-[#4D4D4D] leading-relaxed font-normal">
                                                                            <span className="text-[9px] font-semibold text-[#8F8F8F] uppercase block mb-1.5 tracking-wider">Expert Answer</span>
                                                                            {result.answers?.[i] || "Answer not generated."}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <Card className="p-6 space-y-4 border-[#EBEBEB] bg-[#FAFAFA] rounded-xl sticky top-8">
                                                    <div className="flex items-center gap-2 text-[#171717]">
                                                        <Mic2 className="w-4 h-4 text-[#4D4D4D]" />
                                                        <h3 className="text-xs font-semibold uppercase tracking-wider">Interview Pitch</h3>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="p-4 rounded border border-[#EBEBEB] bg-white italic text-[#4D4D4D] text-xs leading-relaxed font-sans">
                                                            &ldquo;{result.interviewExplanation}&rdquo;
                                                        </div>
                                                        <Button className="w-full bg-[#171717] hover:bg-[#171717]/90 text-white font-medium text-xs h-10 rounded shadow-sm flex items-center justify-center gap-2">
                                                            <Play className="w-3.5 h-3.5 fill-white" /> Speak Practice
                                                        </Button>
                                                    </div>
                                                </Card>

                                                <Card className="p-6 space-y-4 border-[#EBEBEB] bg-[#FAFAFA] rounded-xl">
                                                    <div className="flex items-center gap-2 text-[#171717]">
                                                        <Zap className="w-4 h-4 text-[#4D4D4D]" />
                                                        <h3 className="text-xs font-semibold uppercase tracking-wider">Core Insights</h3>
                                                    </div>
                                                    <div className="p-4 rounded border border-[#EBEBEB] bg-white text-[#4D4D4D] text-xs leading-normal font-medium">
                                                        {result.insights || "Deep logic insights materialized successfully."}
                                                    </div>
                                                </Card>

                                                <Accordion title="Visual System Diagrams" icon={<Workflow className="w-4 h-4" />}>
                                                    <div className="space-y-4 mt-4">
                                                        {result.diagrams && Object.entries(result.diagrams).map(([name, code], i) => (
                                                            <div key={i} className="space-y-2">
                                                                <h4 className="text-[9px] font-semibold text-[#8F8F8F] uppercase tracking-wider">{name.replace(/([A-Z])/g, ' $1')}</h4>
                                                                <div className="p-4 rounded bg-[#FAFAFA] border border-[#EBEBEB] font-mono text-[10px] text-[#171717] overflow-x-auto">
                                                                    {code}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Accordion>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="review">
                                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[750px] overflow-hidden">
                                            {/* File Explorer */}
                                            <Card className="lg:col-span-1 p-5 border-[#EBEBEB] overflow-y-auto rounded-xl bg-[#FAFAFA] shadow-sm">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-2 px-1">
                                                        <FolderOpen className="w-4 h-4 text-[#171717]" />
                                                        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#171717] italic">Project Files</h3>
                                                    </div>

                                                    <div className="space-y-1">
                                                        {result.fileObjects && result.fileObjects.length > 0 ? (
                                                            result.fileObjects.map((file) => (
                                                                <button
                                                                    key={file.name}
                                                                    onClick={() => handleFileReview(file.name)}
                                                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-left transition-all group border ${selectedFile === file.name ? 'bg-white border-[#EBEBEB] text-[#171717] shadow-sm font-semibold' : 'hover:bg-white hover:border-[#EBEBEB] border-transparent text-[#4D4D4D]'}`}
                                                                >
                                                                    {getFileIcon(file.name)}
                                                                    <span className="text-xs truncate flex-1">
                                                                        {file.name}
                                                                    </span>
                                                                    {fileReviews[file.name] && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="p-6 text-center space-y-2 opacity-50">
                                                                <FileText className="w-6 h-6 mx-auto text-[#8F8F8F]" />
                                                                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#8F8F8F]">No files detected</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>

                                            {/* Analysis Panel */}
                                            <Card className="lg:col-span-3 p-8 border-[#EBEBEB] overflow-y-auto rounded-xl bg-white shadow-sm">
                                                {!selectedFile ? (
                                                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                                        <div className="w-16 h-16 rounded-full bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center">
                                                            <Search className="w-6 h-6 text-[#8F8F8F]" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h3 className="text-base font-semibold text-[#171717] uppercase tracking-wide">Select a file to review</h3>
                                                            <p className="text-[#8F8F8F] text-xs max-w-xs mx-auto">Get line-by-line logic explanations and interview-ready context for individual files.</p>
                                                        </div>
                                                    </div>
                                                ) : isAnalyzingFile ? (
                                                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                                                        <div className="relative">
                                                            <Loader2 className="w-12 h-12 animate-spin text-[#171717]" />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Code className="w-4 h-4 text-[#8F8F8F]" />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1 text-center">
                                                            <p className="text-xs font-semibold text-[#171717] uppercase tracking-wider animate-pulse">Analyzing logic flows...</p>
                                                            <p className="text-[9px] text-[#8F8F8F] uppercase tracking-wider">Reviewing {selectedFile}</p>
                                                        </div>
                                                    </div>
                                                ) : fileReviews[selectedFile] ? (
                                                    <div className="space-y-8 animate-fade-in text-[#171717]">
                                                        <header className="flex items-start justify-between gap-6 pb-6 border-b border-[#EBEBEB]">
                                                            <div className="space-y-1.5">
                                                                <div className="flex items-center gap-2">
                                                                    {getFileIcon(selectedFile)}
                                                                    <h2 className="text-xl font-semibold text-[#171717]">{selectedFile}</h2>
                                                                </div>
                                                                <p className="text-xs text-[#4D4D4D] italic">{fileReviews[selectedFile].summary}</p>
                                                            </div>
                                                            <Badge className="bg-[#EBEBEB] text-[#171717] font-semibold uppercase tracking-wider text-[9px] px-2.5 py-0.5 rounded">CODE REVIEWED</Badge>
                                                        </header>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                            {/* Logic Steps */}
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-2 text-[#171717]">
                                                                    <FileLineChart className="w-4 h-4 text-[#4D4D4D]" />
                                                                    <h4 className="text-xs font-semibold uppercase tracking-wider">Logic Progression</h4>
                                                                </div>
                                                                <div className="space-y-2.5">
                                                                    {fileReviews[selectedFile].logicSteps.map((step, i) => (
                                                                        <div key={i} className="flex gap-3 p-3.5 rounded border border-[#EBEBEB] bg-[#FAFAFA] hover:bg-white transition-colors">
                                                                            <span className="text-[9px] font-semibold text-[#0070F3] font-mono mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                                                                            <p className="text-xs text-[#4D4D4D] font-medium leading-relaxed">{step}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Key Lines */}
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-2 text-[#171717]">
                                                                    <Settings className="w-4 h-4 text-[#4D4D4D]" />
                                                                    <h4 className="text-xs font-semibold uppercase tracking-wider">Critical Code Segments</h4>
                                                                </div>
                                                                <div className="space-y-2.5">
                                                                    {fileReviews[selectedFile].keyLines && fileReviews[selectedFile].keyLines.length > 0 ? (
                                                                        fileReviews[selectedFile].keyLines.map((line, i) => (
                                                                            <div key={i} className="space-y-1.5 group">
                                                                                <div className="flex items-center justify-between px-1">
                                                                                    <span className="text-[9px] font-semibold text-[#8F8F8F] uppercase tracking-wider">Line {line.line}</span>
                                                                                </div>
                                                                                <div className="p-3.5 rounded border border-[#EBEBEB] bg-[#FAFAFA] border-l-[#0070F3] border-l-2">
                                                                                    <p className="text-xs text-[#4D4D4D] font-normal leading-relaxed">{line.explanation}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="p-6 text-center bg-[#FAFAFA] rounded border border-dashed border-[#EBEBEB]">
                                                                            <p className="text-[10px] font-semibold text-[#8F8F8F] uppercase tracking-wider">No complex code blocks identified</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="pt-6 border-t border-[#EBEBEB]">
                                                            <div className="flex items-center gap-2 text-[#171717] mb-4">
                                                                <Sparkles className="w-4 h-4 text-[#4D4D4D]" />
                                                                <h4 className="text-xs font-semibold uppercase tracking-wider">Interview Material for this Module</h4>
                                                            </div>
                                                            <div className="p-6 rounded border border-[#EBEBEB] bg-[#FAFAFA] italic text-[#4D4D4D] text-xs leading-relaxed">
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
