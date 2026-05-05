'use client';
import { useState, useEffect, useRef } from 'react';
import { Bot, User, Rocket, MessageSquare, Sparkles, Code, GraduationCap, BrainCircuit, Terminal, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/use-toast';
import { MentorForgeChatInput, MentorForgeTypingIndicator } from '@/components/ui/animated-ai-chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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

  const showWelcome = messages.length < 2 && !isLoading;

  return (
    <div className="flex flex-col h-full bg-[#080B16] text-[#EFF4FB] overflow-hidden relative">
      {/* Standardized Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E2A42] p-8 bg-[#080B16]/80 backdrop-blur-md z-20 sticky top-0">
        <div>
          <div className="flex items-center gap-2 text-[#00D4A0] font-bold tracking-widest text-[10px] uppercase mb-4">
            <Bot className="w-3.5 h-3.5" /> Intelligence Core
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">MentorForge</h1>
          <p className="text-slate-400 mt-2 text-lg">Neural career guidance and technical mentorship via high-fidelity AI protocols.</p>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D1220] border border-[#1E2A42]">
          <div className="text-[10px] text-[#4A5568] uppercase tracking-wider font-semibold">SIGNAL_LOCK</div>
          <Badge variant="outline" className="border-[#00D4A0]/20 bg-[#00D4A0]/5 text-[#00D4A0] text-[9px] font-bold uppercase">LIVE</Badge>
        </div>
      </header>

      {/* Ambient background glows (static, no animation) */}


      {/* Messages area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative" ref={scrollRef}>
        <div className="max-w-3xl mx-auto px-6 sm:px-8 pt-8 pb-[320px] space-y-8">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className={cn(
                "flex gap-4 w-full",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border transition-all",
                msg.role === 'user'
                  ? "bg-[#00D4A0]/15 border-[#00D4A0]/30 shadow-[0_0_16px_rgba(0,212,160,0.15)]"
                  : "bg-[#0D1220] border-[#1E2A42]"
              )}>
                {msg.role === 'user'
                  ? <User className="w-4 h-4 text-[#00D4A0]" />
                  : <Bot className="w-4 h-4 text-[#7C5CFC]" />
                }
              </div>

              {/* Bubble */}
              <div className={cn("flex flex-col gap-2.5 max-w-[82%]", msg.role === 'user' && "items-end")}>
                <div className={cn(
                  "px-5 py-4 rounded-2xl text-sm leading-relaxed transition-all relative",
                  msg.role === 'user'
                    ? "bg-[#00D4A0]/8 text-[#EFF4FB] border border-[#00D4A0]/12"
                    : "bg-[#0D1220]/80 text-[#C0C9D6] border border-[#1E2A42] backdrop-blur-sm"
                )}>
                  <article className="prose prose-sm prose-invert max-w-none prose-headings:text-[#EFF4FB] prose-strong:text-[#00D4A0] prose-code:text-[#00D4A0] prose-code:bg-[#121A2E] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#080B16] prose-pre:border prose-pre:border-[#1E2A42] prose-pre:rounded-xl prose-li:text-[#7A8BA8] prose-p:my-2 prose-a:text-[#00D4A0] prose-a:no-underline hover:prose-a:underline">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </article>
                </div>

                {/* Action buttons */}
                {msg.role === 'assistant' && (
                  <div className="flex flex-wrap gap-2">
                    {msg.suggestedAction && (
                      <Button
                        onClick={() => navigateToForge(msg.suggestedAction!)}
                        size="sm"
                        className="h-8 rounded-lg bg-[#00D4A0]/12 hover:bg-[#00D4A0] text-[#00D4A0] hover:text-[#080B16] border border-[#00D4A0]/20 text-[11px] font-bold px-3.5 transition-all duration-300"
                      >
                        Try in {msg.suggestedAction}
                      </Button>
                    )}
                    <Button
                      onClick={() => router.push(`/${locale}/studyforge`)}
                      size="sm"
                      className="h-8 rounded-lg bg-[#0D1220] hover:bg-[#121A2E] text-[#7A8BA8] hover:text-[#EFF4FB] border border-[#1E2A42] text-[11px] font-bold px-3.5 transition-all duration-300"
                    >
                      Open StudyForge
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Loading skeleton */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-9 h-9 rounded-xl bg-[#0D1220] border border-[#1E2A42] flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-[#7C5CFC] animate-pulse" />
              </div>
              <div className="space-y-3 flex-1 max-w-md">
                <div className="w-2/3 h-4 rounded-lg bg-[#121A2E] animate-pulse" />
                <div className="w-full h-24 rounded-xl bg-[#121A2E] animate-pulse" />
                <div className="w-1/2 h-4 rounded-lg bg-[#121A2E] animate-pulse" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom input area */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        {/* Gradient fade */}
        <div className="h-32 bg-gradient-to-t from-[#080B16] via-[#080B16]/95 to-transparent" />

        <div className="bg-[#080B16] pb-6 px-6 sm:px-8 pointer-events-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Suggestion cards — only on initial state */}
            <AnimatePresence>
              {showWelcome && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.text}
                      onClick={() => sendMessage(s.text, s.mode)}
                      className="group flex items-center justify-between p-4 rounded-xl border border-[#1E2A42] bg-[#0D1220]/80 backdrop-blur-sm text-xs text-[#7A8BA8] hover:text-[#EFF4FB] hover:bg-[#121A2E] hover:border-[#00D4A0]/20 transition-all duration-300 text-left hover:shadow-[0_0_30px_rgba(0,212,160,0.04)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#00D4A0]/8 flex items-center justify-center group-hover:bg-[#00D4A0]/15 transition-colors">
                          <s.icon className="w-3.5 h-3.5 text-[#00D4A0]" />
                        </div>
                        <span className="font-semibold line-clamp-1">{s.text}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#4A5568] group-hover:translate-x-1 group-hover:text-[#00D4A0] transition-all" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animated chat input */}
            <MentorForgeChatInput
              value={input}
              onChange={setInput}
              onSend={() => sendMessage()}
              isLoading={isLoading}
              activeMode={activeMode}
              onModeChange={setActiveMode}
            />
          </div>
        </div>
      </div>

      {/* Floating typing indicator */}
      <MentorForgeTypingIndicator isTyping={isLoading} />
    </div>
  );
}
