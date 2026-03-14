"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Cpu,
    Sparkles,
    FileText,
    Zap,
    Github,
    BookOpen,
    MessageSquare,
    ClipboardList,
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
    Search
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

interface ExplainForgeAlgorithm {
    name: string;
    explanation: string;
}

interface ExplainForgeQuestion {
    question: string;
    answer: string;
}

type ExplainForgeReportValue =
    | string
    | number
    | boolean
    | null
    | Record<string, unknown>
    | unknown[];

interface ExplainForgeResult {
    humanExplanation: string;
    interviewExplanation: string;
    vivaExplanation: string;
    fullReport: Record<string, ExplainForgeReportValue>;
    diagrams: Record<string, string>;
    algorithms: ExplainForgeAlgorithm[];
    questions: ExplainForgeQuestion[];
}

interface ExplainForgeHistoryItem {
    id: string;
    input_type: string;
    created_at: string;
    input_content?: string | null;
    github_url?: string | null;
}

interface ExplainForgeStoredOutput {
    human_explanation: string;
    interview_explanation: string;
    viva_explanation: string;
    report_content: Record<string, ExplainForgeReportValue>;
    diagrams: Record<string, string>;
    algorithms: ExplainForgeAlgorithm[];
    questions: ExplainForgeQuestion[];
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

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
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
    };

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
                    humanExplanation: output.human_explanation,
                    interviewExplanation: output.interview_explanation,
                    vivaExplanation: output.viva_explanation,
                    fullReport: output.report_content,
                    diagrams: output.diagrams,
                    algorithms: output.algorithms,
                    questions: output.questions
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

        try {
            // 1. Upload files first if any
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
            
            // 2. Run analysis
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
            fetchHistory(); // Refresh history
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An error occurred during analysis';
            setError(message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const exportToPDF = () => {
        alert("Generating PDF project report...");
    };

    return (
        <div className="space-y-12 animate-fade-in py-8 max-w-7xl mx-auto px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <header className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold tracking-widest text-[10px] uppercase">
                        <Sparkles className="w-3.5 h-3.5" /> Human Explanation Engine
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic">
                        EXPLAIN<span className="text-emerald-500">FORGE</span> AI
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        The ultimate human-style explanation engine. Analyze projects, generate professional reports, and master your technical technicalities.
                    </p>
                </header>

                <Button 
                    variant="outline" 
                    onClick={() => setShowHistory(!showHistory)}
                    className={`rounded-2xl px-6 border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-widest h-14 flex items-center gap-3 transition-all ${showHistory ? 'bg-white/10 border-emerald-500/50 text-emerald-400' : 'text-slate-400'}`}
                >
                    <History className="w-4 h-4" />
                    {showHistory ? 'Close History' : 'View History'}
                </Button>
            </div>

            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card glass className="p-8 border-emerald-500/10 bg-emerald-500/[0.02]">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-sm font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                                    <History className="w-4 h-4 text-emerald-500" /> Previous Analyses
                                </h3>
                            </div>

                            {isLoadingHistory ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500/50" />
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
                                            className="p-6 border-white/5 hover:border-emerald-500/30 cursor-pointer group transition-all"
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
                                                {item.input_content || item.github_url || "Uploaded Files"}
                                            </p>
                                            <div className="flex items-center justify-between pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Reload Results</span>
                                                <ExternalLink className="w-3 h-3 text-emerald-500" />
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
                    <Card glass className="p-8 space-y-8 border-white/5 bg-[#0c0c1b]/50">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                <FileText className="w-3.5 h-3.5" /> Project Description
                            </label>
                            <textarea 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Paste your project details, features, and core logic here..."
                                className="w-full h-48 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all resize-none font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                    <Github className="w-3.5 h-3.5" /> GitHub Repository
                                </label>
                                <input 
                                    type="text"
                                    value={githubUrl}
                                    onChange={(e) => setGithubUrl(e.target.value)}
                                    placeholder="https://github.com/user/repo"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all text-sm"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                                    <FileUp className="w-3.5 h-3.5" /> Project Files
                                </label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full bg-white/5 border border-white/10 border-dashed rounded-2xl px-6 py-3.5 text-center cursor-pointer hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2"
                                >
                                    <FileUp className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs font-bold text-slate-400">
                                        {files.length > 0 ? `${files.length} Files Selected` : 'Upload docs/code'}
                                    </span>
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
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2"
                            >
                                <AlertCircle className="w-4 h-4" />
                                ERROR: {error}
                            </motion.div>
                        )}

                        <Button 
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className="w-full py-8 rounded-[2rem] bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group shadow-2xl shadow-emerald-500/20"
                        >
                            {isAnalyzing ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing Neural Logic...
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 fill-white" />
                                    Materialize Explanation
                                </div>
                            )}
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-10" />
                        </Button>
                    </Card>

                    {/* Features Preview */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { title: 'Human Style', icon: Languages, color: 'text-emerald-400' },
                                { title: 'Interview Ready', icon: Mic2, color: 'text-blue-400' },
                                { title: 'Full Documentation', icon: ClipboardList, color: 'text-purple-400' },
                                { title: 'System Diagrams', icon: Workflow, color: 'text-orange-400' }
                            ].map((f, i) => (
                                <Card glass key={i} className="p-6 border-white/5 space-y-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                        <f.icon className={`w-5 h-5 ${f.color}`} />
                                    </div>
                                    <h4 className="text-sm font-black text-white uppercase italic">{f.title}</h4>
                                </Card>
                            ))}
                        </div>
                        
                        <Card glass className="p-10 border-white/5 bg-gradient-to-br from-emerald-500/5 to-transparent flex flex-col justify-center text-center space-y-6">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto ring-8 ring-emerald-500/5">
                                <BookOpen className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">Advanced Project Intelligence</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Our AI goes beyond simple summarization. It understands complex architectures, data flows, and algorithmic complexity to provide meaningful narratives.
                                </p>
                            </div>
                            <div className="flex justify-center gap-3 pt-4">
                                <div className="h-1.5 w-12 rounded-full bg-emerald-500/20" />
                                <div className="h-1.5 w-12 rounded-full bg-indigo-500/20" />
                                <div className="h-1.5 w-12 rounded-full bg-blue-500/20" />
                            </div>
                        </Card>
                    </div>
                </div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Results Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 glass-card border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[2rem] bg-emerald-500/20 flex items-center justify-center ring-4 ring-emerald-500/10">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tight">Logic Extraction Complete</h2>
                                <p className="text-slate-400 text-sm font-medium">ExplainForge has successfully materialized your project intelligence.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" onClick={() => setResult(null)} className="rounded-2xl px-6 border-white/10 hover:bg-white/5 text-xs font-bold uppercase tracking-widest h-12">
                                New Analyze
                            </Button>
                            <Button onClick={exportToPDF} className="rounded-2xl px-6 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest h-12 flex items-center gap-2">
                                <Download className="w-4 h-4" /> PDF
                            </Button>
                            <Button variant="outline" className="rounded-2xl px-6 border-white/10 hover:bg-white/5 text-slate-300 text-xs font-bold uppercase tracking-widest h-12 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> DOCX
                            </Button>
                        </div>
                    </div>

                    {/* Results Tabs */}
                    <Tabs defaultValue="explanations" className="space-y-8">
                        <TabsList className="bg-white/5 p-2 rounded-3xl border border-white/5 w-full flex overflow-x-auto no-scrollbar justify-start md:justify-center">
                            <TabsTrigger value="explanations" className="rounded-2xl px-6 py-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-xs font-bold uppercase tracking-widest transition-all">Explanations</TabsTrigger>
                            <TabsTrigger value="report" className="rounded-2xl px-6 py-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-xs font-bold uppercase tracking-widest transition-all">Project Report</TabsTrigger>
                            <TabsTrigger value="technical" className="rounded-2xl px-6 py-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-xs font-bold uppercase tracking-widest transition-all">Tech & Algorithms</TabsTrigger>
                            <TabsTrigger value="prep" className="rounded-2xl px-6 py-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-xs font-bold uppercase tracking-widest transition-all">Interview Prep</TabsTrigger>
                        </TabsList>

                        <TabsContent value="explanations" className="space-y-8 animate-in slide-in-from-bottom-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <Card glass className="p-8 space-y-6 col-span-1 md:col-span-2 border-emerald-500/10">
                                    <div className="flex items-center gap-3 text-emerald-400">
                                        <Languages className="w-5 h-5" />
                                        <h3 className="text-lg font-black uppercase italic">Human Explanation</h3>
                                    </div>
                                    <div className="prose prose-invert prose-emerald max-w-none">
                                        <ReactMarkdown>{result.humanExplanation}</ReactMarkdown>
                                    </div>
                                </Card>

                                <div className="space-y-8">
                                    <Card glass className="p-8 space-y-6 border-blue-500/10 hover:border-blue-500/30 transition-all">
                                        <div className="flex items-center gap-3 text-blue-400">
                                            <Mic2 className="w-5 h-5" />
                                            <h3 className="text-sm font-black uppercase italic">Job Interview Pitch</h3>
                                        </div>
                                        <p className="text-slate-400 text-sm leading-relaxed italic border-l-2 border-blue-500/20 pl-4">{result.interviewExplanation}</p>
                                    </Card>

                                    <Card glass className="p-8 space-y-6 border-purple-500/10 hover:border-purple-500/30 transition-all">
                                        <div className="flex items-center gap-3 text-purple-400">
                                            <MessageSquare className="w-5 h-5" />
                                            <h3 className="text-sm font-black uppercase italic">Viva / Academic Pitch</h3>
                                        </div>
                                        <p className="text-slate-400 text-sm leading-relaxed italic border-l-2 border-purple-500/20 pl-4">{result.vivaExplanation}</p>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="report" className="space-y-8 animate-in slide-in-from-bottom-4">
                            <Card glass className="p-10 border-white/5 bg-[#0c0c1b]/30">
                                <div className="space-y-12 max-w-4xl mx-auto">
                                    {Object.entries(result.fullReport).map(([key, value], i) => (
                                        <section key={i} className="space-y-4">
                                            <h3 className="text-xl font-black text-white uppercase italic tracking-wider flex items-center gap-3">
                                                <span className="text-emerald-500 font-mono">0{i + 1}.</span> {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </h3>
                                            <div className="text-slate-400 leading-relaxed text-sm md:text-base border-l border-white/10 pl-8 ml-4">
                                                <ReactMarkdown>{typeof value === 'string' ? value : JSON.stringify(value)}</ReactMarkdown>
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="technical" className="space-y-8 animate-in slide-in-from-bottom-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <Card glass className="p-8 space-y-8">
                                    <div className="flex items-center gap-3 text-emerald-400">
                                        <Cpu className="w-5 h-5" />
                                        <h3 className="text-lg font-black uppercase italic">Algorithms & Logic</h3>
                                    </div>
                                    <div className="space-y-6">
                                        {result.algorithms.map((algo, i) => (
                                            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                                <h4 className="font-black text-white uppercase italic text-sm">{algo.name}</h4>
                                                <p className="text-slate-400 text-sm leading-relaxed">{algo.explanation}</p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                <Card glass className="p-8 space-y-8">
                                    <div className="flex items-center gap-3 text-orange-400">
                                        <Workflow className="w-5 h-5" />
                                        <h3 className="text-lg font-black uppercase italic">System Diagrams</h3>
                                    </div>
                                    <div className="space-y-6">
                                        {Object.entries(result.diagrams).map(([name, code], i) => (
                                            <div key={i} className="space-y-4">
                                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">{name.replace(/([A-Z])/g, ' $1')}</h4>
                                                <div className="p-6 rounded-2xl bg-black border border-white/5 font-mono text-[10px] text-emerald-400 whitespace-pre overflow-x-auto custom-scrollbar">
                                                    {code}
                                                </div>
                                                <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Render via Mermaid Engine</p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="prep" className="space-y-8 animate-in slide-in-from-bottom-4">
                            <div className="max-w-4xl mx-auto space-y-6">
                                {result.questions.map((q, i) => (
                                    <Card glass key={i} className="p-8 border-white/5 hover:bg-white/[0.03] transition-all group">
                                        <div className="flex gap-6">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
                                                <span className="font-mono text-sm font-black text-indigo-400">Q{i + 1}</span>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors uppercase italic">{q.question}</h4>
                                                <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                                        <span className="text-emerald-500 font-black uppercase text-[10px] block mb-2 tracking-widest">Suggested Answer</span>
                                                        {q.answer}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </motion.div>
            )}
        </div>
    );
}
