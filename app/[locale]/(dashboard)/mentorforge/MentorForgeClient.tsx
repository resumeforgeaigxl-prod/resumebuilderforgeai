'use client';
import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Rocket, MessageSquare, Sparkles, Code, GraduationCap, BrainCircuit, Terminal, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { useToast } from '@/components/ui/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  suggestedAction?: string;
  analysis?: Record<string, unknown>;
}

const SUGGESTIONS = [
  { text: "Learn DevOps Linux commands", icon: Terminal, mode: 'Learning' },
  { text: "Prepare for Amazon SDE interview", icon: MessageSquare, mode: 'Interview' },
  { text: "Explain System Design patterns", icon: BrainCircuit, mode: 'Coding' },
  { text: "How to improve my career growth?", icon: Rocket, mode: 'Career' },
];

const MODES = [
  { id: 'General', icon: Sparkles, color: 'text-indigo-400' },
  { id: 'Career', icon: Rocket, color: 'text-orange-400' },
  { id: 'Coding', icon: Code, color: 'text-emerald-400' },
  { id: 'Interview', icon: MessageSquare, color: 'text-purple-400' },
  { id: 'Learning', icon: GraduationCap, color: 'text-blue-400' },
];

export default function MentorForgeClient({ locale }: { locale: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState('General');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/mentorforge/history');
      const data: { history: Message[] } = await res.json();
      if (data.history?.length > 0) {
        setMessages(data.history);
      } else {
        setMessages([
          {
            role: 'assistant',
            content: "👋 **Welcome back.** I am your elite AI Mentor. I can teach you any technology, prepare you for any interview, or help you build a system-wide career strategy.\n\nWhat would you like to master today?"
          }
        ]);
      }
    } catch {
      setMessages([
        {
          role: 'assistant',
          content: "👋 **Welcome back.** I am your elite AI Mentor. I can teach you any technology, prepare you for any interview, or help you build a system-wide career strategy.\n\nWhat would you like to master today?"
        }
      ]);
    }
  };

  const sendMessage = async (customMsg?: string, mode?: string) => {
    const text = customMsg || input;
    if (!text.trim() || isLoading) return;
    
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/mentorforge/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text, 
          history: messages.slice(-10),
          mode: mode || activeMode 
        })
      });
      const data = await response.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: data.reply, 
            suggestedAction: data.suggestedAction,
            analysis: data.analysis
        }]);
      }
    } catch {
      toast({ variant: "destructive", title: "AI Error", description: "Failed to connect to MentorForge." });
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToForge = (forge: string) => {
      const routes: Record<string, string> = {
          'codingforge': `/${locale}/codingforge`,
          'resumeforge': `/${locale}/resumes`,
          'interviewforge': `/${locale}/mock-interview`,
          'jobforge': `/${locale}/jobs`,
          'studyforge': `/${locale}/studyforge`,
          'careerforge': `/${locale}/careerforge`,
          'explainforge': `/${locale}/explainforge`,
          'knowledgeforge': `/${locale}/knowledgeforge`
      };
      const path = forge.toLowerCase().replace(' ', '');
      router.push(routes[path] || `/${locale}/dashboard`);
  };

  return (
    <div className="flex flex-col h-full bg-[#050510] text-slate-200 overflow-hidden">
      <div className="flex-1 relative flex flex-col h-full">
          <ScrollArea className="flex-1 w-full" ref={scrollRef}>
            <div className="max-w-3xl mx-auto px-4 py-20 space-y-10 pb-80">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                    "flex gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-500",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border transition-all duration-500",
                    msg.role === 'user' 
                        ? "bg-indigo-600 border-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.3)]" 
                        : "bg-white/5 border-white/10"
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-400" />}
                  </div>

                  <div className={cn("flex flex-col gap-3 max-w-[85%] sm:max-w-[80%]", msg.role === 'user' && "items-end")}>
                    <div className={cn(
                      "p-5 rounded-2xl text-sm leading-relaxed shadow-xl transition-all relative group",
                      msg.role === 'user' 
                        ? "bg-indigo-600/10 text-indigo-50 border border-indigo-500/20" 
                        : "bg-white/[0.03] text-slate-300 border border-white/5"
                    )}>
                      <article className="prose prose-sm prose-invert max-w-none prose-headings:text-white prose-strong:text-indigo-300 prose-code:text-emerald-400 prose-pre:bg-[#0a0a1a] prose-pre:border prose-pre:border-white/5 prose-li:text-slate-400 prose-p:my-2">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </article>
                    </div>

                    {msg.role === 'assistant' && (
                        <div className="flex flex-wrap gap-2 mt-1">
                            {msg.suggestedAction && (
                                <Button 
                                    onClick={() => navigateToForge(msg.suggestedAction!)}
                                    size="sm" 
                                    className="h-8 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 text-[11px] font-bold px-3 transition-all"
                                >
                                    Try in {msg.suggestedAction}
                                </Button>
                            )}
                            <Button 
                                onClick={() => router.push(`/${locale}/studyforge`)}
                                size="sm" 
                                className="h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 text-[11px] font-bold px-3 transition-all"
                            >
                                Open StudyForge
                            </Button>
                        </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
               <div className="flex gap-4">
                <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <BrainCircuit className="w-4 h-4 text-indigo-400 animate-pulse" />
                 </div>
                 <div className="space-y-3 w-full max-w-lg">
                    <div className="w-2/3 h-4 rounded bg-white/5 animate-pulse" />
                    <div className="w-full h-32 rounded-xl bg-white/5 animate-pulse" />
                 </div>
               </div>
              )}
            </div>
          </ScrollArea>

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 bg-gradient-to-t from-[#050510] via-[#050510]/95 to-transparent pointer-events-none">
              <div className="max-w-3xl mx-auto space-y-6 pointer-events-auto">
                  
                  {messages.length < 2 && !isLoading && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        {SUGGESTIONS.map(s => (
                            <button 
                                key={s.text}
                                onClick={() => sendMessage(s.text, s.mode)}
                                className="group flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] text-xs text-slate-400 hover:text-white hover:bg-white/5 hover:border-indigo-500/30 transition-all text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20">
                                        <s.icon className="w-3.5 h-3.5 text-indigo-400" />
                                    </div>
                                    <span className="font-semibold line-clamp-1">{s.text}</span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ))}
                      </div>
                  )}

                  <div className="flex items-center justify-center flex-wrap gap-1.5 px-2">
                      {MODES.map(mode => (
                          <button
                            key={mode.id}
                            onClick={() => setActiveMode(mode.id)}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border",
                                activeMode === mode.id 
                                    ? "bg-indigo-500/20 border-indigo-500/50 text-white" 
                                    : "bg-white/[0.02] border-white/5 text-slate-500 hover:border-white/20"
                            )}
                          >
                            <mode.icon className={cn("w-3 h-3", mode.color)} />
                            {mode.id}
                          </button>
                      ))}
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-[1.5rem] blur opacity-10 group-hover:opacity-25 transition duration-1000 animate-gradient-x"></div>
                    <div className="relative flex items-center bg-[#0a0a1a]/90 backdrop-blur-md border border-white/10 rounded-[1.5rem] p-1.5 pl-6 shadow-2xl">
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder={`Message ${activeMode} AI Assistant...`}
                            className="flex-1 bg-transparent border-none text-white focus:outline-none h-12 text-sm placeholder:text-slate-600"
                        />
                        <button 
                            onClick={() => sendMessage()}
                            disabled={isLoading || !input.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white w-10 h-10 flex items-center justify-center rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20 ml-2"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 py-2">
                    <div className="h-px bg-white/5 flex-1" />
                    <p className="text-[8px] text-slate-800 font-bold uppercase tracking-[0.4em] flex items-center gap-2">
                        <Sparkles className="w-2.5 h-2.5" />
                        MentorForge Pro v3.1
                    </p>
                    <div className="h-px bg-white/5 flex-1" />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
