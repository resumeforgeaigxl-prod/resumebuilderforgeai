'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Send, Bot, User, AlertCircle, ShieldCheck, Copy, Share2, Check, Terminal, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n/I18nProvider';

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export default function JobForgeAIPage() {
    const { locale, region } = useTranslation();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');

    // Modals state
    const [showTerms, setShowTerms] = useState(false);
    const [showNameCapture, setShowNameCapture] = useState(false);
    const [tempName, setTempName] = useState('');

    // Chat state
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [input, setInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [blocked, setBlocked] = useState(false);
    const [blockedMessage, setBlockedMessage] = useState('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [sharing, setSharing] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const loadConversation = async () => {
        try {
            const res = await fetch('/api/ai/conversation');
            const data = await res.json();
            if (data.conversationId) {
                setConversationId(data.conversationId);
                if (data.messages && data.messages.length > 0) {
                    setMessages(data.messages);
                }
            }
        } catch (err) {
            console.error('Failed to load conversation', err);
        }
    };

    useEffect(() => {
        // Fetch user settings
        fetch('/api/ai/settings')
            .then(res => res.json())
            .then(data => {
                if (data.error === 'Unauthorized') {
                    router.push('/login');
                    return;
                }

                if (data.acceptedTerms) {
                    if (data.displayName) {
                        setUserName(data.displayName);
                        loadConversation();
                    } else {
                        setShowNameCapture(true);
                    }
                } else {
                    setShowTerms(true);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load settings', err);
                setLoading(false);
            });
    }, [router]);

    useEffect(() => {
        // Welcoming message if no history
        if (!loading && !showTerms && !showNameCapture && messages.length === 0 && !chatLoading) {
            const greeting = userName ? `Hello ${userName}! I am JobForgeAI. I assist with career and job preparation. How can I help you today?` : "Hello! I am JobForgeAI. I assist with career and job preparation. How can I help you today?";
            setMessages([{ role: 'assistant', content: greeting }]);
        }
    }, [loading, showTerms, showNameCapture, messages.length, chatLoading, userName]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleAcceptTerms = async () => {
        setLoading(true);
        await fetch('/api/ai/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'accept_terms' })
        });
        setShowTerms(false);
        setShowNameCapture(true);
        setLoading(false);
    };

    const handleSaveName = async () => {
        if (!tempName.trim()) return;
        setLoading(true);
        await fetch('/api/ai/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'set_name', name: tempName.trim() })
        });
        setUserName(tempName.trim());
        setShowNameCapture(false);
        loadConversation();
        setLoading(false);
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || chatLoading || blocked || !conversationId) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatLoading(true);

        try {
            const posthog = (await import('@/lib/posthog')).default;
            posthog.capture('jobforgeai_used');
        } catch (err) { console.error('[PostHog] Event error:', err); }

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    conversationId: conversationId
                })
            });
            const data = await res.json();

            if (!res.ok && data.blocked) {
                setBlocked(true);
                setBlockedMessage(data.message);
                return;
            }

            if (data.error) {
                setMessages(prev => [...prev, { role: 'system', content: `Error: ${data.error}` }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
            }
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => [...prev, { role: 'system', content: 'Network error. Please try again.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const shareConversation = () => {
        if (!conversationId) return;
        const shareUrl = `${window.location.origin}/${region}/${locale}/jobforgeai/share/${conversationId}`;
        navigator.clipboard.writeText(shareUrl);
        setSharing(true);
        setTimeout(() => setSharing(false), 2000);
    };

    if (loading && !showTerms && !showNameCapture) {
        return (
            <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-slate-500 font-medium font-mono animate-pulse">Initializing JobForgeAI Kernel...</p>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#020205] text-slate-200 flex flex-col selection:bg-indigo-500/30 overflow-hidden">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[#020205]/80 backdrop-blur-2xl border-b border-white/5 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href={`/${region}/${locale}/dashboard`} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 group">
                            <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-white" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                                <Terminal className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="font-black text-xl text-white tracking-tighter uppercase italic">JobForgeAI</h1>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Neural Network Online</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {conversationId && (
                        <button
                            onClick={shareConversation}
                            className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 group shadow-lg shadow-indigo-500/5"
                        >
                            {sharing ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />}
                            {sharing ? 'Link Copied!' : 'Share Session'}
                        </button>
                    )}
                </div>
            </header>

            {/* Modals */}
            <AnimatePresence>
                {showTerms && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0a0a0f] border border-white/10 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                            <div className="w-16 h-16 bg-indigo-500/10 rounded-[1.5rem] flex items-center justify-center mb-6 border border-indigo-500/20">
                                <ShieldCheck className="w-8 h-8 text-indigo-400" />
                            </div>
                            <h2 className="text-3xl font-black mb-4 text-white tracking-tight italic">Protocol Authorization</h2>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed">By entering this terminal, you agree to the following operational parameters:</p>
                            <ul className="text-sm text-slate-300 space-y-4 mb-10">
                                <li className="flex gap-3"><span className="text-indigo-400 font-bold">01.</span> Scope restricted to Career, Coding, and Interview architecture.</li>
                                <li className="flex gap-3"><span className="text-indigo-400 font-bold">02.</span> Malicious or unrelated transmissions are strictly filtered.</li>
                                <li className="flex gap-3"><span className="text-indigo-400 font-bold">03.</span> Neural activity is logged for compliance audits.</li>
                            </ul>
                            <button
                                onClick={handleAcceptTerms}
                                disabled={loading}
                                className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-50 transition-all disabled:opacity-50 flex justify-center items-center shadow-xl shadow-white/5"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Acknowledge & Sync'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {showNameCapture && !showTerms && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#0a0a0f] border border-white/10 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative text-center">
                            <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                                <User className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h2 className="text-2xl font-black mb-2 text-white italic tracking-tight uppercase">Identify Yourself</h2>
                            <p className="text-sm text-slate-500 mb-8 font-mono">Input candidate handle for personalization.</p>
                            <input
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName() }}
                                placeholder="E.g. Elon Musk"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-indigo-500/50 text-white mb-8 text-center text-lg font-bold placeholder:text-slate-700"
                                autoFocus
                            />
                            <button
                                onClick={handleSaveName}
                                disabled={loading || !tempName.trim()}
                                className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-500 transition-all disabled:opacity-50 flex justify-center items-center shadow-xl shadow-indigo-500/10"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Execute Sync'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Area */}
            <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 flex flex-col gap-10 overflow-y-auto mb-40 scroll-smooth custom-scrollbar">
                {blocked && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-4 shadow-2xl">
                        <AlertCircle className="w-8 h-8 shrink-0 animate-bounce" />
                        <div>
                            <p className="font-black uppercase tracking-widest text-xs mb-1">Security Alert</p>
                            <p className="font-bold text-sm tracking-tight">{blockedMessage || 'Terminal access permanently restricted for protocol violation.'}</p>
                        </div>
                    </motion.div>
                )}

                {/* Initial Suggestion Cards */}
                {messages.length === 1 && !chatLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {[
                            { title: 'Create Resume', desc: 'Build ATS-optimized resume', icon: SearchIcon, href: '/builder' },
                            { title: 'Start Mock Interview', desc: 'Practice with AI feedback', icon: Brain, href: '/mock-interview' },
                            { title: 'Check ATS Score', desc: 'Analyze resume compatibility', icon: SparklesAssistant, href: '/dashboard' },
                            { title: 'Coding Practice', desc: 'Solve DSA problems', icon: MapIconAssistant, prompt: 'Give me 5 easy-level DSA problems to practice' },
                            { title: 'Browse Jobs', desc: 'Curated job listings', icon: SearchIcon, href: '/jobs' },
                            { title: 'Career Roadmap', desc: 'Get your skill path', icon: MapIconAssistant, prompt: 'I want to become a senior backend engineer. What skills do I need?' }
                        ].map((card, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    if (card.href) router.push(`/${region}/${locale}${card.href}`);
                                    else if (card.prompt) { setInput(card.prompt); handleSendMessage(); }
                                }}
                                className="flex items-center gap-4 p-5 bg-white/[0.03] border border-white/5 rounded-[2rem] hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all text-left group"
                            >
                                <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                                    <card.icon className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{card.title}</h4>
                                    <p className="text-xs text-slate-500">{card.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex flex-col gap-10">
                    {messages.map((msg, i) => (
                        <motion.div
                            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            key={i}
                            className={`flex gap-6 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-4 max-w-[85%] group ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-indigo-600 border-indigo-400/30' :
                                    msg.role === 'system' ? 'bg-red-600 border-red-400/30' :
                                        'bg-slate-900 border-white/10 shadow-xl'
                                    }`}>
                                    {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-indigo-400" />}
                                </div>
                                <div className="space-y-2">
                                    <div className={`flex items-center gap-2 mb-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                            {msg.role === 'user' ? (userName || 'Candidate') : (msg.role === 'system' ? 'Terminal Error' : 'Senior Coach')}
                                        </span>
                                    </div>
                                    <div className={`p-6 rounded-[2rem] text-sm md:text-base ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none shadow-2xl shadow-indigo-500/5' :
                                        msg.role === 'system' ? 'bg-red-500/20 border border-red-500/30 text-red-200' :
                                            'bg-slate-900/40 border border-white/5 text-slate-200 rounded-tl-none whitespace-pre-wrap leading-relaxed shadow-lg ring-1 ring-white/5 relative group-hover:bg-slate-900/60 transition-all font-medium'
                                        }`}>
                                        {msg.content}
                                        {msg.role === 'assistant' && (
                                            <button
                                                onClick={() => copyToClipboard(msg.content, i)}
                                                className={`absolute -bottom-10 right-0 p-2 rounded-xl transition-all border border-white/5 hover:bg-white/5 ${copiedIndex === i ? 'text-emerald-400' : 'text-slate-500 hover:text-white'} opacity-0 group-hover:opacity-100`}
                                                title="Copy to clipboard"
                                            >
                                                {copiedIndex === i ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <AnimatePresence>
                        {chatLoading && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex gap-4 mr-auto max-w-[85%]">
                                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                                </div>
                                <div className="p-6 rounded-[2rem] rounded-tl-none bg-white/[0.03] border border-white/5 text-slate-500 italic text-sm font-mono flex items-center gap-3">
                                    Synthesizing strategic career intelligence...
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div ref={messagesEndRef} className="h-4" />
            </main>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#020205] via-[#020205] to-transparent pointer-events-auto pb-10 flex flex-col items-center z-40">

                {/* Scroll to Bottom hint or small suggestion chip */}
                {!chatLoading && messages.length > 2 && (
                    <div className="mb-4 flex gap-2 overflow-x-auto max-w-2xl px-4 scrollbar-hide">
                        <button onClick={() => { setInput("How do I improve my resume for ATS optimization?"); handleSendMessage(); }} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-slate-400 hover:bg-white/10 hover:text-white transition-all whitespace-nowrap">Improve Resume</button>
                        <button onClick={() => { setInput("Give me a backend developer roadmap with skills to learn."); handleSendMessage(); }} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-slate-400 hover:bg-white/10 hover:text-white transition-all whitespace-nowrap">Skill Roadmap</button>
                        <button onClick={() => { setInput("Ask me 5 technical interview questions for a senior role."); handleSendMessage(); }} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-slate-400 hover:bg-white/10 hover:text-white transition-all whitespace-nowrap">Interview Questions</button>
                        <button onClick={() => { setInput("Give me a coding problem to practice DSA."); handleSendMessage(); }} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-slate-400 hover:bg-white/10 hover:text-white transition-all whitespace-nowrap">Coding Practice</button>
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="max-w-5xl w-full relative group">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about resumes, ATS optimization, interview questions, coding practice, skill roadmaps, or job preparation."
                        disabled={chatLoading || blocked || showTerms || showNameCapture}
                        className="w-full bg-[#0a0a0f] border border-white/10 rounded-[2.5rem] pl-8 pr-16 py-6 outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-600 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all disabled:opacity-50 text-base font-medium group-hover:border-white/20"
                    />
                    <button
                        type="submit"
                        disabled={chatLoading || blocked || !input.trim() || showTerms || showNameCapture}
                        className="absolute right-4 top-4 bottom-4 aspect-square bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-xl shadow-indigo-500/20 active:scale-95"
                    >
                        {chatLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                    {blocked && <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-red-500 mt-4 animate-pulse italic">Access Denied: Protocol Violation Detected</p>}
                </form>
            </div>
        </div>
    );
}

// Micro icons for suggestion cards
function SearchIcon(props: React.SVGProps<SVGSVGElement>) { return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>; }
function Brain(props: React.SVGProps<SVGSVGElement>) { return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>; }
function SparklesAssistant(props: React.SVGProps<SVGSVGElement>) { return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>; }
function MapIconAssistant(props: React.SVGProps<SVGSVGElement>) { return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>; }
