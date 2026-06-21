'use client';
import { useState, useEffect, useRef } from 'react';
import { Bot, User, Rocket, MessageSquare, Code, GraduationCap, BrainCircuit, Terminal, ChevronRight } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-[#FAFAFA] text-[#171717] overflow-hidden relative">
      {/* Standardized Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EBEBEB] p-8 bg-white/80 backdrop-blur-md z-20 sticky top-16 shadow-sm">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#171717] uppercase">MentorForge</h1>
          <p className="text-[#4D4D4D] mt-1.5 text-base">Neural career guidance and technical mentorship via high-fidelity AI protocols.</p>
        </div>

        <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-[#EBEBEB]">
          <div className="text-[10px] text-[#8F8F8F] uppercase tracking-wider font-semibold">SIGNAL_LOCK</div>
          <Badge variant="outline" className="border-none bg-[#FAFAFA] text-[#171717] text-[9px] font-bold uppercase">LIVE</Badge>
        </div>
      </header>

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
                "w-9 h-9 rounded-lg shrink-0 flex items-center justify-center border transition-all",
                msg.role === 'user'
                  ? "bg-[#FAFAFA] border-[#EBEBEB] shadow-sm"
                  : "bg-[#171717] border-[#171717]"
              )}>
                {msg.role === 'user'
                  ? <User className="w-4 h-4 text-[#171717]" />
                  : <Bot className="w-4 h-4 text-white" />
                }
              </div>

              {/* Bubble */}
              <div className={cn("flex flex-col gap-2.5 max-w-[82%]", msg.role === 'user' && "items-end")}>
                <div className={cn(
                  "px-5 py-4 rounded-xl text-sm leading-relaxed transition-all relative border",
                  msg.role === 'user'
                    ? "bg-[#FAFAFA] text-[#171717] border-[#EBEBEB]"
                    : "bg-white text-[#171717] border-[#EBEBEB] shadow-sm"
                )}>
                  <article className="prose prose-sm max-w-none text-[#171717] prose-headings:text-[#171717] prose-strong:text-[#171717] prose-code:text-[#171717] prose-code:bg-[#FAFAFA] prose-code:border prose-code:border-[#EBEBEB] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#FAFAFA] prose-pre:border prose-pre:border-[#EBEBEB] prose-pre:rounded-lg prose-p:my-1.5 prose-a:text-[#0070F3] hover:prose-a:underline">
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
                        className="h-8 rounded bg-[#171717] hover:bg-[#171717]/90 text-white text-[10px] font-medium px-3.5 transition-all shadow-sm"
                      >
                        Try in {msg.suggestedAction}
                      </Button>
                    )}
                    <Button
                      onClick={() => router.push(`/${locale}/studyforge`)}
                      size="sm"
                      className="h-8 rounded bg-white hover:bg-[#FAFAFA] text-[#171717] border border-[#EBEBEB] text-[10px] font-medium px-3.5 transition-all shadow-sm"
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
              <div className="w-9 h-9 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-[#8F8F8F] animate-pulse" />
              </div>
              <div className="space-y-3 flex-1 max-w-md">
                <div className="w-2/3 h-4 rounded bg-[#EBEBEB] animate-pulse" />
                <div className="w-full h-24 rounded-lg bg-[#EBEBEB] animate-pulse" />
                <div className="w-1/2 h-4 rounded bg-[#EBEBEB] animate-pulse" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom input area */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        {/* Gradient fade */}
        <div className="h-32 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA]/95 to-transparent" />

        <div className="bg-[#FAFAFA] pb-6 px-6 sm:px-8 pointer-events-auto">
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
                      className="group flex items-center justify-between p-4 rounded-xl border border-[#EBEBEB] bg-white text-xs text-[#4D4D4D] hover:text-[#171717] hover:bg-[#FAFAFA] hover:border-[#171717] transition-all duration-200 text-left shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center group-hover:bg-white transition-colors">
                          <s.icon className="w-3.5 h-3.5 text-[#171717]" />
                        </div>
                        <span className="font-semibold line-clamp-1">{s.text}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-[#8F8F8F] group-hover:translate-x-0.5 group-hover:text-[#171717] transition-all" />
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
