'use client';

import { 
    Terminal, 
    Book, 
    Code, 
    Shield, 
    Zap, 
    MessageSquare, 
    Cpu, 
    Key,
    ArrowRight,
    ExternalLink,
    ChevronRight,
    Copy,
    Check
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function DocsPage() {
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        toast.success('Copied to clipboard');
        setTimeout(() => setCopied(null), 2000);
    };

    const endpoints = [
        {
            name: 'Generate Resume',
            method: 'POST',
            path: '/v1/resume/generate',
            desc: 'Align a resume to a job description using AI.',
            params: ['resumeData', 'jobDescription', 'template?']
        },
        {
            name: 'ATS Score',
            method: 'POST',
            path: '/v1/resume/ats-score',
            desc: 'Check ATS compatibility score for a resume.',
            params: ['resumeData', 'jobDescription']
        }
    ];

    return (
        <div className="min-h-screen bg-[#070710] text-slate-300 font-sans selection:bg-indigo-500/30">
            {/* Header / Nav */}
            <nav className="border-b border-white/5 bg-[#0a0a15]/80 backdrop-blur-xl sticky top-0 z-50 px-8 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl">
                            <Terminal className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">Forge_Docs</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <a href="https://resumeforgeai.in" className="text-sm font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Platform</a>
                        <a href="https://api.resumeforgeai.in" className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 text-xs font-black text-white transition-all uppercase tracking-widest">Connect API</a>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 p-8 pt-16">
                {/* Sidebar */}
                <aside className="md:col-span-3 space-y-8">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Introduction</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-indigo-400 font-bold border-l-2 border-indigo-500 pl-4 py-1 text-sm bg-indigo-500/5 rounded-r-lg">Overview</li>
                            <li className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors pl-4 py-1 text-sm cursor-pointer font-bold">Quickstart</li>
                            <li className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors pl-4 py-1 text-sm cursor-pointer font-bold">Authentication</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Core API v1</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center justify-between text-sm text-slate-500 hover:text-white border-l-2 border-transparent pl-4 py-1 transition-colors group cursor-pointer font-bold">
                                <span>Resume</span>
                                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-indigo-500" />
                            </li>
                            <li className="flex items-center justify-between text-sm text-slate-500 hover:text-white border-l-2 border-transparent pl-4 py-1 transition-colors group cursor-pointer font-bold">
                                <span>Interview</span>
                                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-indigo-500" />
                            </li>
                            <li className="flex items-center justify-between text-sm text-slate-500 hover:text-white border-l-2 border-transparent pl-4 py-1 transition-colors group cursor-pointer font-bold">
                                <span>Knowledge</span>
                                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-indigo-500" />
                            </li>
                        </ul>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="md:col-span-9 space-y-12 pb-24">
                    <section className="space-y-4">
                        <Badge>Universal v1.2</Badge>
                        <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-tight">Elite API<br/>Documentation_</h2>
                        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                            Integrate the world's most powerful AI resume engine into your existing workflow. 
                            Built for developers who demand performance, precision, and low-latency response cycles.
                        </p>
                    </section>

                    <hr className="border-white/5" />

                    <section className="space-y-8">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-indigo-500" />
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Authentication_</h3>
                        </div>
                        <p className="text-slate-400">All API requests must include your high-entropy API key in the Authorization header.</p>
                        
                        <div className="bg-black/60 border border-white/5 rounded-2xl p-6 font-mono text-sm relative group">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Request Header</span>
                                <button onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'api-header')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                    {copied === 'api-header' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-600" />}
                                </button>
                            </div>
                            <code className="text-indigo-400">Authorization: <span className="text-slate-300 italic">Bearer YOUR_API_KEY</span></code>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div className="flex items-center gap-3">
                            <Code className="w-6 h-6 text-indigo-500" />
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tight">Core Endpoints_</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {endpoints.map((ep, i) => (
                                <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.03] transition-all group relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
                                     
                                     <div className="flex items-start justify-between relative z-10 mb-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                 <span className="px-2 py-1 bg-indigo-500 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">{ep.method}</span>
                                                 <h4 className="text-xl font-black text-white italic uppercase">{ep.name}</h4>
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium">{ep.path}</p>
                                        </div>
                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-700 group-hover:text-indigo-500 transition-colors">
                                            <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                                        </div>
                                     </div>

                                     <p className="text-slate-400 text-sm mb-6 max-w-lg">{ep.desc}</p>

                                     <div className="flex flex-wrap gap-2">
                                         {ep.params.map((p, j) => (
                                             <span key={j} className="px-3 py-1 bg-black/40 border border-white/5 rounded-full text-[10px] font-mono text-indigo-400">{p}</span>
                                         ))}
                                     </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="p-12 bg-gradient-to-br from-indigo-600/20 to-purple-600/10 border border-indigo-500/20 rounded-[3rem] text-center space-y-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black text-white italic uppercase tracking-tight">Need dedicated help?</h3>
                            <p className="text-slate-400 max-w-lg mx-auto">Join our developer discord or contact enterprise support for high-volume custom integrations.</p>
                            <div className="pt-6 flex justify-center gap-4">
                                <button className="px-8 py-4 bg-white text-black font-black rounded-2xl flex items-center gap-3 text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Support Console</button>
                                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black rounded-2xl text-xs uppercase tracking-widest backdrop-blur-xl transition-all">Developer Docs</button>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] animate-pulse">
            {children}
        </span>
    );
}
