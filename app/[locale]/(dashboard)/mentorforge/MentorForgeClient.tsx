'use client';
import { useState, useEffect, useRef } from 'react';
import { Bot, User, Rocket, MessageSquare, Code, GraduationCap, BrainCircuit, Terminal, ChevronRight, Copy, Check, FileDown, CheckCircle2, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
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

interface AgentActivity {
  name: string;
  args?: Record<string, unknown>;
  status: 'running' | 'finished' | 'error';
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
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const [activityExpanded, setActivityExpanded] = useState(true);
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
  }, [messages, isLoading, agentActivities]);

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
    setAgentActivities([]);
    setActivityExpanded(true);

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

      // Check if SSE stream
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream')) {
        // SSE streaming response — read real agent activity
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No stream reader');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          let eventType = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ') && eventType) {
              try {
                const data = JSON.parse(line.slice(6));

                if (eventType === 'progress') {
                  if (data.type === 'tool_start') {
                    setAgentActivities(prev => [
                      ...prev,
                      { name: data.name, args: data.args, status: 'running' }
                    ]);
                  } else if (data.type === 'tool_end') {
                    setAgentActivities(prev =>
                      prev.map(a =>
                        a.name === data.name && a.status === 'running'
                          ? { ...a, status: data.status || 'finished' }
                          : a
                      )
                    );
                  }
                } else if (eventType === 'result') {
                  if (data.reply) {
                    setMessages(prev => [...prev, {
                      role: 'assistant',
                      content: data.reply,
                      suggestedAction: data.suggestedAction,
                      analysis: data.analysis
                    }]);
                  }
                } else if (eventType === 'error') {
                  toast({ variant: "destructive", title: "AI Error", description: data.error || "Agent failed." });
                }
              } catch {
                // ignore parse errors for partial data
              }
              eventType = '';
            }
          }
        }
      } else {
        // Fallback: standard JSON response (non-streaming)
        const data = await response.json();
        if (data.reply) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: data.reply,
            suggestedAction: data.suggestedAction,
            analysis: data.analysis
          }]);
        }
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
  const finishedCount = agentActivities.filter(a => a.status === 'finished').length;
  const runningCount = agentActivities.filter(a => a.status === 'running').length;

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] text-[#171717] overflow-hidden relative">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative" ref={scrollRef}>
        <div className="max-w-5xl mx-auto px-6 sm:px-8 pt-8 pb-12 space-y-8">
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
                    {(() => {
                      const downloadLinkMatch = msg.content.match(/\/api\/resume\/download\?id=([a-f0-9-]+)/i);
                      const resumeId = downloadLinkMatch ? downloadLinkMatch[1] : null;
                      return resumeId ? (
                        <Button
                          onClick={() => {
                            window.open(`/api/resume/download?id=${resumeId}`, '_blank');
                          }}
                          size="sm"
                          className="h-8 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-medium px-3.5 transition-all shadow-sm flex items-center gap-1.5"
                        >
                          <FileDown className="w-3.5 h-3.5" /> Download Resume PDF
                        </Button>
                      ) : null;
                    })()}
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

          {/* Real Agent Activity Widget */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl my-4"
            >
              <div className="flex gap-4 items-start">
                <div className="w-9 h-9 rounded-lg bg-[#171717] flex items-center justify-center shrink-0 shadow-md">
                  <BrainCircuit className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="flex-1 space-y-2">
                  {/* Real Agent Activity Panel */}
                  <div className="border border-[#EBEBEB] rounded-xl bg-white shadow-sm overflow-hidden">
                    {/* Collapsible Header */}
                    <button
                      onClick={() => setActivityExpanded(!activityExpanded)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#FAFAFA] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-[#171717]" />
                        <span className="text-xs font-bold text-[#171717] tracking-wide">Real Agent Activity</span>
                        {agentActivities.length > 0 && (
                          <span className="text-[10px] font-bold text-[#8F8F8F] bg-[#F5F5F5] px-1.5 py-0.5 rounded">
                            {agentActivities.length}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {runningCount > 0 && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                          </span>
                        )}
                        <ChevronDown className={cn("w-3.5 h-3.5 text-[#8F8F8F] transition-transform", activityExpanded && "rotate-180")} />
                      </div>
                    </button>

                    {/* Activity List */}
                    <AnimatePresence>
                      {activityExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-[#EBEBEB] px-4 py-3 space-y-2.5 bg-[#FAFAFA]/50 max-h-64 overflow-y-auto custom-scrollbar">
                            {agentActivities.length === 0 && (
                              <div className="flex items-center gap-2 text-xs text-[#8F8F8F]">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span className="font-mono">Agents are working...</span>
                              </div>
                            )}
                            {agentActivities.map((activity, idx) => (
                              <motion.div
                                key={`${activity.name}-${idx}`}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-1"
                              >
                                {/* Tool name + status */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {activity.status === 'finished' ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    ) : activity.status === 'error' ? (
                                      <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                    ) : (
                                      <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />
                                    )}
                                    <code className="text-[11px] font-mono font-bold text-[#171717]">{activity.name}</code>
                                  </div>
                                  <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider font-mono",
                                    activity.status === 'finished' ? "text-emerald-600" :
                                    activity.status === 'error' ? "text-red-500" :
                                    "text-blue-500"
                                  )}>
                                    {activity.status === 'finished' ? 'Finished' : activity.status === 'error' ? 'Error' : 'Running'}
                                  </span>
                                </div>
                                {/* Tool args preview */}
                                {activity.args && Object.keys(activity.args).length > 0 && (
                                  <pre className="text-[10px] font-mono text-[#8F8F8F] bg-white border border-[#EBEBEB] rounded-lg px-3 py-2 overflow-x-auto max-h-24 custom-scrollbar whitespace-pre-wrap break-all">
                                    {JSON.stringify(activity.args, null, 2)}
                                  </pre>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Bottom status line */}
                  <div className="flex items-center gap-2 px-1">
                    {runningCount > 0 ? (
                      <>
                        <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                        <span className="text-[10px] text-[#8F8F8F] font-mono">Agents are working...</span>
                      </>
                    ) : agentActivities.length > 0 ? (
                      <>
                        <Loader2 className="w-3 h-3 text-[#8F8F8F] animate-spin" />
                        <span className="text-[10px] text-[#8F8F8F] font-mono">Composing response...</span>
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                        <span className="text-[10px] text-[#8F8F8F] font-mono">Agents are working...</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom input area */}
      <div className="w-full bg-[#FAFAFA] border-t border-[#EBEBEB] pb-6 pt-4 px-6 sm:px-8">
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

      {/* Floating typing indicator */}
      <MentorForgeTypingIndicator isTyping={isLoading} />
    </div>
  );
}
