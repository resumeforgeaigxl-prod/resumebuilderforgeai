'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    MessageSquare, X, Send, User, Bot, 
    ArrowRight, Rocket, Code, Laptop, Briefcase, 
    LifeBuoy, Loader2, History, RotateCcw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface Message {
    role: 'user' | 'assistant';
    message: string;
    actions?: { label: string; path: string }[];
    created_at?: string;
}

interface ChatSession {
    id: string;
    last_active: string;
    status: string;
}

const QUICK_ACTIONS = [
    { label: 'Improve Resume', icon: Rocket, message: 'I want to improve my resume' },
    { label: 'Practice Coding', icon: Code, message: 'I want to practice coding questions' },
    { label: 'Prepare Interview', icon: Laptop, message: 'I want to prepare for an interview' },
    { label: 'Find Jobs', icon: Briefcase, message: 'Help me find some jobs' },
    { label: 'Support Ticket', icon: LifeBuoy, message: 'I want to create a support ticket' },
];

export function ForgeAssistant({ locale }: { locale: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { 
            role: 'assistant', 
            message: "👋 Hello! I'm **ResumeForgeAI Assistant**. I'm here to help you master your career journey.\n\nHow can I assist you today?" 
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [sessionHistory, setSessionHistory] = useState<ChatSession[]>([]);
    
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial session load
    useEffect(() => {
        const savedSession = localStorage.getItem('forge_ai_session');
        if (savedSession) {
            setSessionId(savedSession);
            loadSessionMessages(savedSession);
        }
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const loadSessionMessages = async (id: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/ai/assistant?sessionId=${id}`);
            const data = await res.json();
            if (data.success && data.messages.length > 0) {
                setMessages(data.messages);
            }
        } catch (err) {
            console.error("Failed to load messages", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSessions = async () => {
        try {
            const res = await fetch('/api/ai/assistant');
            const data = await res.json();
            if (data.success) {
                setSessionHistory(data.sessions || []);
            }
        } catch (err) {
            console.error("Failed to fetch sessions", err);
        }
    };

    const startNewSession = () => {
        setSessionId(null);
        localStorage.removeItem('forge_ai_session');
        setMessages([
            { 
                role: 'assistant', 
                message: "👋 Fresh start! How can I assist you in this new session?" 
            }
        ]);
        setShowHistory(false);
    };

    const handleSelectSession = (id: string) => {
        setSessionId(id);
        localStorage.setItem('forge_ai_session', id);
        loadSessionMessages(id);
        setShowHistory(false);
    };

    const handleSend = async (text: string) => {
        if (!text.trim() || loading) return;

        const userMsg = text.trim();
        setInput('');
        
        // Optimistic update
        const newMessages = [...messages, { role: 'user' as const, message: userMsg }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const res = await fetch('/api/ai/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userMsg,
                    sessionId: sessionId,
                    history: messages.map(m => ({ role: m.role, content: m.message }))
                })
            });

            const result = await res.json();
            if (result.success && result.data) {
                if (result.sessionId) {
                    setSessionId(result.sessionId);
                    localStorage.setItem('forge_ai_session', result.sessionId);
                }
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    message: result.data.message,
                    actions: result.data.actions
                }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', message: "I'm sorry, I'm having trouble thinking right now. Could you try again?" }]);
            }
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', message: "My connection seems a bit weak. Please try again in a moment." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-20 right-0 w-[400px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-120px)] bg-[#0f111a]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-blue-600/10 to-purple-600/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white leading-tight">ResumeForgeAI Assistant</h3>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live: Career Copilot</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => { setShowHistory(!showHistory); if(!showHistory) fetchSessions(); }}
                                    className={`p-2 rounded-xl transition-all ${showHistory ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-slate-400'}`}
                                    title="Chat History"
                                >
                                    <History className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Session History Overlay */}
                        <AnimatePresence>
                            {showHistory && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="absolute inset-0 top-[89px] bg-[#0c0d16] z-50 p-6 flex flex-col"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest italic">Previous Sessions</h4>
                                        <button 
                                            onClick={startNewSession}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase text-blue-400 transition-all"
                                        >
                                            <RotateCcw className="w-3 h-3" /> New Chat
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                                        {sessionHistory.length === 0 ? (
                                            <div className="text-center py-12">
                                                <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">No history found</p>
                                            </div>
                                        ) : (
                                            sessionHistory.map((s) => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => handleSelectSession(s.id)}
                                                    className={`w-full text-left p-4 rounded-2xl border transition-all ${sessionId === s.id ? 'bg-blue-600/10 border-blue-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Session {s.id.substring(0, 8)}</span>
                                                        <span className="text-[9px] text-slate-600">{new Date(s.last_active).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 line-clamp-1">{s.status === 'active' ? 'Active Conversation' : 'Archived Chat'}</p>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Messages Area */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth"
                        >
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${
                                            msg.role === 'user' ? 'bg-white/10' : 'bg-blue-600/20'
                                        }`}>
                                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-400" />}
                                        </div>
                                        <div className="space-y-3">
                                            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                                                msg.role === 'user' 
                                                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/20' 
                                                    : 'bg-white/5 text-slate-300 border border-white/5 rounded-tl-none'
                                            }`}>
                                                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-li:my-1">
                                                    <ReactMarkdown>
                                                        {msg.message}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>

                                            {msg.actions && msg.actions.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {msg.actions.map((action, ai) => (
                                                        <Link 
                                                            key={ai} 
                                                            href={`/${locale}${action.path}`}
                                                            onClick={() => setIsOpen(false)}
                                                            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-xs font-bold hover:scale-[1.05] transition-all shadow-lg shadow-blue-600/10"
                                                        >
                                                            {action.label}
                                                            <ArrowRight className="w-3 h-3" />
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[85%]">
                                        <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-600/20 flex items-center justify-center">
                                            <Bot className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none">
                                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions (Sticky above input) */}
                        {messages.length < 4 && !loading && !showHistory && (
                            <div className="px-6 pb-2 overflow-x-auto no-scrollbar scroll-smooth flex gap-2">
                                {QUICK_ACTIONS.map((action, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(action.message)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[11px] text-slate-400 hover:text-white transition-all whitespace-nowrap"
                                    >
                                        <action.icon className="w-3 h-3" />
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-6 border-t border-white/5 bg-black/20">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                                className="relative"
                            >
                                <input 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your question..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading || showHistory}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl disabled:opacity-50 transition-all shadow-lg"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                            <p className="text-center text-[9px] text-slate-600 mt-3 uppercase font-black tracking-widest">Powered by ResumeForgeAI Neural Engine</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all relative overflow-hidden
                    ${isOpen ? 'bg-white text-black' : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:shadow-blue-500/25'}`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-7 h-7" />}
                {!isOpen && (
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#070710] rounded-full"
                    />
                )}
            </motion.button>
        </div>
    );
}
