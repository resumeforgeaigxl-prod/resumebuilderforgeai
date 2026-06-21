'use client';
import { useState, useEffect, useRef } from 'react';
import { Bot, User, Rocket, MessageSquare, Code, GraduationCap, BrainCircuit, Terminal, ChevronRight, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/use-toast';
import { MentorForgeChatInput, MentorForgeTypingIndicator } from '@/components/ui/animated-ai-chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const CodeBlock = ({ className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const isInline = !match;
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isInline) {
    return <code className={className} {...props}>{children}</code>;
  }

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-[#EBEBEB] bg-[#1E1E1E] text-white">
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#252526] border-b border-[#333] text-xs font-mono text-[#8F8F8F]">
        <span>{match ? match[1] : 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto font-mono text-xs leading-relaxed bg-[#1E1E1E] text-[#D4D4D4] custom-scrollbar">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
};

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
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative" ref={scrollRef}>
        <div className="max-w-5xl mx-auto px-6 sm:px-8 pt-8 pb-[320px] space-y-8">
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
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: CodeBlock
                      }}
                    >
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

          {/* Agent Running Status Widget */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 p-5 rounded-xl border border-blue-100 bg-blue-50/20 max-w-xl shadow-sm my-4"
            >
              <div className="w-9 h-9 rounded-lg bg-[#171717] flex items-center justify-center shrink-0 shadow-md">
                <BrainCircuit className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-blue-700 tracking-wider font-mono uppercase">Agentic Intelligence Active</div>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest font-mono">Running</span>
                  </div>
                </div>
                <p className="text-xs text-[#4D4D4D] leading-relaxed">
                  MentorForge Central Brain is evaluating goals, inspecting ecosystem datasets, and routing instructions to specialist spoke subagents...
                </p>
                {/* Visual subagent activity bar */}
                <div className="h-1.5 w-full bg-blue-100/50 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ left: "-30%", width: "30%" }}
                    animate={{ left: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute top-0 h-full bg-blue-600 rounded-full"
                  />
                </div>
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
          <div className="max-w-5xl mx-auto space-y-4">
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
