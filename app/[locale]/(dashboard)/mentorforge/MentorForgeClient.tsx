'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  User,
  Menu,
  History,
  Plus,
  Trash2,
  X,
  MessageSquare,
  ArrowRight,
  Loader2,
} from '@/components/icons';
import { useToast } from '@/components/ui/use-toast';
import { MentorForgeChatInput } from '@/components/ui/animated-ai-chat';
import {
  OmniBlockRenderer,
  convertMessageToBlocks,
  type OmniBlock,
  OmniEntity3D,
  type OmniAgentState,
} from '@/components/agent';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams, useParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/components/agent/OmniWorkspace.module.css';
import { useSidebar } from '@/hooks/use-sidebar';
import { useOmniHeader } from '@/hooks/use-omni-header';

function resolveOmniPresence(
  activities: AgentActivity[],
  isLoading: boolean
): { state: OmniAgentState; statusText: string } {
  if (!isLoading) {
    return { state: 'IDLE', statusText: '' };
  }

  // Find running activity first, or fallback to the most recent activity
  const running = [...activities].reverse().find(a => a.status === 'running');
  const latest = running || activities[activities.length - 1];

  if (!latest || latest.name === 'agent_reasoning') {
    return { state: 'THINKING', statusText: 'Thinking...' };
  }

  const name = latest.name.toLowerCase();

  // READING: reading resume/profile/job
  if (
    name.includes('resume') &&
    (name.includes('read') || name.includes('details') || name.includes('list'))
  ) {
    return { state: 'READING', statusText: 'Reading your resume...' };
  }
  if (name.includes('audit_resume_ats')) {
    return { state: 'READING', statusText: 'Auditing ATS readiness...' };
  }
  if (name.includes('candidate_profile') || name.includes('profile')) {
    return { state: 'READING', statusText: 'Reading verified profile...' };
  }
  if (
    name.includes('canonical_job') ||
    name.includes('job_details') ||
    name.includes('verify_job_freshness')
  ) {
    return { state: 'READING', statusText: 'Reading the job...' };
  }

  // EDITING: resume/application modification
  if (
    name.includes('tailor_resume') ||
    name.includes('generate_resume') ||
    name.includes('trigger_resume_generation')
  ) {
    return { state: 'EDITING', statusText: 'Editing your resume...' };
  }
  if (
    name.includes('update_candidate_application_answer') ||
    name.includes('upsertapplicationanswer')
  ) {
    return { state: 'EDITING', statusText: 'Updating your answers...' };
  }

  // WORKING: tool/capability execution
  if (name.includes('match') || name.includes('rank_jobs')) {
    return { state: 'WORKING', statusText: 'Comparing jobs...' };
  }
  if (name.includes('search_job')) {
    return { state: 'WORKING', statusText: 'Searching matching jobs...' };
  }
  if (name.includes('application_package') || name.includes('prepare_application')) {
    return { state: 'WORKING', statusText: 'Preparing your application...' };
  }
  if (name.includes('interview')) {
    return { state: 'WORKING', statusText: 'Simulating interview...' };
  }
  if (name.includes('coding') || name.includes('sandbox')) {
    return { state: 'WORKING', statusText: 'Running code environment...' };
  }
  if (name.includes('study') || name.includes('learning')) {
    return { state: 'WORKING', statusText: 'Generating learning roadmap...' };
  }

  if (latest.status === 'finished') {
    return { state: 'THINKING', statusText: 'Thinking...' };
  }

  return { state: 'WORKING', statusText: 'Working...' };
}

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedAction?: string;
  analysis?: Record<string, unknown>;
  artifacts?: any[];
  blocks?: OmniBlock[];
  created_at?: string;
}

interface AgentActivity {
  name: string;
  args?: Record<string, unknown>;
  status: 'running' | 'finished' | 'error';
}

interface ConversationSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messageCount: number;
  preview?: string;
}

function groupConversationsByDate(conversations: ConversationSummary[]) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const last7DaysStart = todayStart - 7 * 86400000;

  const groups: { label: string; items: ConversationSummary[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Previous 7 Days', items: [] },
    { label: 'Older', items: [] },
  ];

  for (const conv of conversations) {
    const timestamp = new Date(conv.updated_at || conv.created_at).getTime();
    if (timestamp >= todayStart) {
      groups[0].items.push(conv);
    } else if (timestamp >= yesterdayStart) {
      groups[1].items.push(conv);
    } else if (timestamp >= last7DaysStart) {
      groups[2].items.push(conv);
    } else {
      groups[3].items.push(conv);
    }
  }

  return groups.filter(g => g.items.length > 0);
}

const SUGGESTED_PROMPTS = [
  "Find jobs that match my profile",
  "Improve my resume for a job",
  "Prepare me for an interview",
  "Show which skills I'm missing",
];

export default function MentorForgeClient({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const urlConvId = searchParams?.get('c') || null;

  const [activeConversationId, setActiveConversationId] = useState<string | null>(urlConvId || null);
  const [conversationsList, setConversationsList] = useState<ConversationSummary[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const [, setActivityExpanded] = useState(true);

  const { toggleMobile } = useSidebar();
  const initialized = useRef(false);
  const followBottom = useRef(true);
  const [showBottom, setShowBottom] = useState(false);
  const [visibleMessages, setVisibleMessages] = useState(60);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  // Dynamically resolve active locale from route params, prop, or pathname
  const activeLocale = useMemo(() => {
    if (params?.locale && typeof params.locale === 'string') return params.locale;
    if (locale && typeof locale === 'string') return locale;
    if (pathname) {
      const seg = pathname.split('/').filter(Boolean)[0];
      if (seg) return seg;
    }
    return 'en-in';
  }, [params?.locale, locale, pathname]);

  // Helper to update the browser URL without full-page reload
  const updateUrlWithConversation = useCallback((convId: string | null) => {
    if (typeof window === 'undefined') return;
    const targetUrl = convId ? `/${activeLocale}/omni?c=${convId}` : `/${activeLocale}/omni`;
    window.history.replaceState(null, '', targetUrl);
  }, [activeLocale]);

  // Fetch updated list of conversations
  const refreshConversationsList = useCallback(async () => {
    try {
      const res = await fetch('/api/omni/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversationsList(data.conversations || []);
      }
    } catch {
      // silent fallback
    }
  }, []);

  // Load a specific conversation by ID
  const loadConversation = useCallback(async (convId: string) => {
    setIsLoadingThread(true);
    try {
      const res = await fetch(`/api/omni/conversations/${convId}`);
      if (res.ok) {
        const data = await res.json();
        followBottom.current = true;
        setVisibleMessages(60);
        setMessages(data.messages || []);
        setActiveConversationId(convId);
        updateUrlWithConversation(convId);
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Failed to load conversation:', err);
      return false;
    } finally {
      setIsLoadingThread(false);
    }
  }, [updateUrlWithConversation]);

  // Initial load logic:
  // 1. If ?c=<id> in URL, load that conversation.
  // 2. If no ?c, load most recent active conversation.
  // 3. If user has no conversations, render empty state (do NOT create DB record on mount).
  useEffect(() => {
    if (initialized.current) return;
    let isMounted = true;

    const initialize = async () => {
      try {
        const res = await fetch('/api/omni/conversations');
        const data = await res.json();
        const convs: ConversationSummary[] = data.conversations || [];
        if (!isMounted) return;

        initialized.current = true;
        setConversationsList(convs);

        if (urlConvId) {
          // Explicit conversation in URL requested
          const loaded = await loadConversation(urlConvId);
          if (!loaded && isMounted) {
            // Invalid or unauthorized conversation ID -> reset to empty state
            setActiveConversationId(null);
            setMessages([]);
            updateUrlWithConversation(null);
          }
        } else if (convs.length > 0) {
          // No URL query -> load most recent conversation
          const recentId = convs[0].id;
          await loadConversation(recentId);
        } else {
          // Fresh user -> empty state
          setActiveConversationId(null);
          setMessages([]);
        }
      } catch (err) {
        console.warn('Failed to initialize conversations:', err);
        if (isMounted) {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
    };
  }, [urlConvId, loadConversation, updateUrlWithConversation]);

  // Scroll to bottom on updates
  useEffect(() => {
    if (scrollRef.current && followBottom.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, agentActivities]);

  // Start fresh chat: resets active conversation view and URL without creating DB row
  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setInput('');
    setAgentActivities([]);
    setIsHistoryOpen(false);
    updateUrlWithConversation(null);
    followBottom.current = true;
    setVisibleMessages(60);
  }, [updateUrlWithConversation]);

  // Switch to selected conversation thread
  const selectConversation = async (convId: string) => {
    if (convId === activeConversationId) {
      setIsHistoryOpen(false);
      return;
    }
    setIsHistoryOpen(false);
    await loadConversation(convId);
  };

  // Delete a conversation thread
  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/omni/conversations/${convId}`, { method: 'DELETE' });
      if (res.ok) {
        setConversationsList(prev => prev.filter(c => c.id !== convId));
        if (activeConversationId === convId) {
          startNewChat();
        }
        toast({ title: 'Conversation deleted' });
      } else {
        toast({ variant: 'destructive', title: 'Failed to delete' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Failed to delete' });
    }
  };

  const sendMessage = async (customMsg?: string) => {
    const text = customMsg || input;
    if (!text.trim() || isLoading || isLoadingThread) return;

    // Immediately pre-append user message to local state
    followBottom.current = true;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setAgentActivities([]);
    setActivityExpanded(true);

    try {
      const response = await fetch('/api/omni/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationId: activeConversationId,
          history: messages.slice(-10),
          mode: 'General'
        })
      });

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No stream reader');

        const decoder = new TextDecoder();
        let buffer = '';
        let receivedResult = false;
        let eventType = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          // Keep SSE event names across network chunk boundaries.
          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ') && eventType) {
              try {
                const data = JSON.parse(line.slice(6));

                if (eventType === 'conversation') {
                  // Server assigned / confirmed active conversation ID
                  if (data.conversationId) {
                    setActiveConversationId(data.conversationId);
                    updateUrlWithConversation(data.conversationId);
                    refreshConversationsList();
                  }
                } else if (eventType === 'progress') {
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
                  receivedResult = true;
                  if (data.conversationId) {
                    setActiveConversationId(data.conversationId);
                    updateUrlWithConversation(data.conversationId);
                  }
                  if (data.reply || (data.blocks && data.blocks.length > 0)) {
                    setMessages(prev => [...prev, {
                      role: 'assistant',
                      content: data.reply || '',
                      suggestedAction: data.suggestedAction,
                      analysis: data.analysis,
                      artifacts: data.artifacts,
                      blocks: data.blocks,
                    }]);
                  }
                  refreshConversationsList();
                } else if (eventType === 'error') {
                  receivedResult = true;
                  if (data.conversationId) {
                    setActiveConversationId(data.conversationId);
                    updateUrlWithConversation(data.conversationId);
                  }
                  const errorMsg = "Omni couldn’t complete that request. Please try again.";
                  setInput(current => current || text);
                  toast({ variant: "destructive", title: "AI Error", description: errorMsg });
                  setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "I encountered an issue while generating the response.",
                    blocks: [{
                      type: 'error',
                      errorType: 'GENERAL',
                      title: 'Response Interrupted',
                      message: errorMsg,
                      actionLabel: data.retryable === false ? undefined : 'Try Again',
                      retryable: data.retryable !== false,
                    }]
                  }]);
                  refreshConversationsList();
                }
              } catch {
                // ignore parse errors for partial chunks
              }
              eventType = '';
            }
          }
        }

        if (!receivedResult) {
          setInput(current => current || text);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "I couldn't finish preparing that response. Please try asking again.",
            blocks: [{
              type: 'error',
              errorType: 'TOOL_FAILED',
              title: 'Generation Incomplete',
              message: 'The model connection closed before the response could be completed.',
              actionLabel: 'Try Again',
              retryable: true,
            }]
          }]);
        }
      } else {
        // Fallback: standard JSON response
        const data = await response.json();
        if (data.conversationId) {
          setActiveConversationId(data.conversationId);
          updateUrlWithConversation(data.conversationId);
        }
        if (data.error) {
          data.error = 'Omni couldn’t complete that request. Please try again.';
          setInput(current => current || text);
          toast({ variant: "destructive", title: "AI Error", description: data.error });
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "I encountered an issue while generating the response.",
            blocks: [{
              type: 'error',
              errorType: 'GENERAL',
              title: 'Response Interrupted',
              message: data.error,
              actionLabel: 'Try Again',
              retryable: true,
            }]
          }]);
        } else if (data.reply || (data.blocks && data.blocks.length > 0)) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: data.reply || '',
            suggestedAction: data.suggestedAction,
            analysis: data.analysis,
            artifacts: data.artifacts,
            blocks: data.blocks,
          }]);
        }
        refreshConversationsList();
      }
    } catch (err: any) {
      const errorMsg = 'Omni couldn’t complete that request. Please try again.';
      setInput(current => current || text);
      toast({ variant: "destructive", title: "AI Error", description: errorMsg });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting to the intelligence network right now.",
        blocks: [{
          type: 'error',
          errorType: 'GENERAL',
          title: 'Connection Issue',
          message: 'Unable to reach the assistant server. Please check your connection and try again.',
          actionLabel: 'Try Again',
          retryable: true,
        }]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockAction = (actionId: string, payload?: Record<string, any>) => {
    const act = (actionId || '').toLowerCase();

    // Explore Jobs or job-related actions: navigate to unified Jobs product, preferring Recommended view
    if (
      act === 'explore_jobs' ||
      act === 'jobforge' ||
      act === 'jobs' ||
      act === 'job_matches' ||
      act === 'recommended_jobs' ||
      (act.includes('job') && act !== 'view_job' && act !== 'tailor_resume' && act !== 'prepare_application')
    ) {
      const tab = payload?.tab || 'recommended';
      router.push(`/${activeLocale}/jobs?tab=${tab}`);
      return;
    }

    switch (actionId) {
      case 'view_job':
        if (payload?.jobId) {
          router.push(`/${activeLocale}/jobs?jobId=${payload.jobId}`);
        } else {
          router.push(`/${activeLocale}/jobs?tab=recommended`);
        }
        break;
      case 'tailor_resume':
        sendMessage(`Tailor my resume for the role of ${payload?.jobTitle || 'this job'}.`);
        break;
      case 'prepare_application':
        sendMessage(`Prepare my application package for job ID ${payload?.jobId}`);
        break;
      case 'review_application':
        if (payload?.packageId) {
          router.push(`/${activeLocale}/applications/${payload.packageId}`);
        } else {
          router.push(`/${activeLocale}/applications`);
        }
        break;
      case 'start_plan':
        if (payload?.id) { router.push(`/${activeLocale}/studyforge`); break; }
        sendMessage(`Start learning roadmap for ${payload?.topic || 'this syllabus'}`);
        break;
      case 'find_jobs':
        sendMessage('Find jobs that match my profile and resume.');
        break;
      case 'prep_interview':
        sendMessage('Prepare me for an interview simulation.');
        break;
      case 'practice_coding':
        sendMessage('Give me a coding challenge to practice.');
        break;
      case 'top_up':
      case 'topup_credits':
        router.push(`/${activeLocale}/pricing`);
        break;
      case 'open_resume':
        router.push(`/${activeLocale}/resumes`);
        break;
      case 'view_profile':
        router.push(`/${activeLocale}/account?tab=application-profile`);
        break;
      case 'view_applications':
        router.push(`/${activeLocale}/applications`);
        break;
      case 'retry': {
        const lastUser = [...messages].reverse().find(m => m.role === 'user');
        if (lastUser) sendMessage(lastUser.content);
        break;
      }
      default:
        if (payload?.href) {
          router.push(payload.href);
        } else if (payload?.action) {
          navigateToForge(payload.action);
        } else if (actionId) {
          navigateToForge(actionId);
        }
        break;
    }
  };

  const handleFormSubmit = (values: Record<string, any>) => {
    const lines = Object.entries(values)
      .filter(([_, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${v}`);
    if (lines.length > 0) {
      sendMessage(`Here are my verified answers:\n${lines.join('\n')}`);
    }
  };

  const navigateToForge = (forge: string) => {
    const cleanForge = forge.toLowerCase().replace(/[\s_-]/g, '');
    if (cleanForge.includes('job')) {
      router.push(`/${activeLocale}/jobs?tab=recommended`);
      return;
    }
    const routes: Record<string, string> = {
      'codingforge': `/${activeLocale}/codingforge`,
      'resumeforge': `/${activeLocale}/resumes`,
      'interviewforge': `/${activeLocale}/mock-interview`,
      'studyforge': `/${activeLocale}/studyforge`,
      'careerforge': `/${activeLocale}/careerforge`,
      'explainforge': `/${activeLocale}/explainforge`,
      'knowledgeforge': `/${activeLocale}/knowledgeforge`
    };
    router.push(routes[cleanForge] || `/${activeLocale}/dashboard`);
  };

  const hasMessages = messages.length > 0;
  const omniPresence = resolveOmniPresence(agentActivities, isLoading);

  // Derive active conversation title
  const activeTitle = useMemo(() => {
    if (!activeConversationId) return null;
    const found = conversationsList.find(c => c.id === activeConversationId);
    return found ? found.title : null;
  }, [activeConversationId, conversationsList]);

  const groupedConversations = useMemo(() => {
    return groupConversationsByDate(conversationsList);
  }, [conversationsList]);

  const { setOmniHeader, clearOmniHeader } = useOmniHeader();

  useEffect(() => {
    setOmniHeader({
      historyCount: conversationsList.length,
      activeTitle,
      onOpenHistory: () => setIsHistoryOpen(true),
      onNewChat: startNewChat,
    });
    return () => {
      clearOmniHeader();
    };
  }, [conversationsList.length, activeTitle, startNewChat, setOmniHeader, clearOmniHeader]);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <button type="button" className="md:!hidden" onClick={toggleMobile} aria-label="Open navigation"><Menu className="h-5 w-5" /></button>
        <strong>Omni</strong>
        <button type="button" disabled={isLoading} onClick={() => setIsHistoryOpen(true)} aria-label="Conversation history"><History className="h-5 w-5" /></button>
        <button type="button" disabled={isLoading} onClick={startNewChat} aria-label="New conversation"><Plus className="h-5 w-5" /></button>
      </header>
      {/* 2. Conversation History Drawer (Slide-out panel) */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsHistoryOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="fixed top-0 left-0 bottom-0 w-72 sm:w-80 bg-[#0A0A0A] border-r border-[#242424] z-50 flex flex-col shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="h-14 border-b border-[#242424] px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[#8B5CF6]" />
                  <span className="text-sm font-semibold text-[#F5F5F5]">Conversations</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1 rounded-md text-[#7E7E7E] hover:text-[#F5F5F5] hover:bg-[#151515] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* New chat action inside drawer */}
              <div className="p-3 border-b border-[#242424]">
                <button
                  type="button"
                  onClick={startNewChat}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#F5F5F5] bg-[#101010] hover:bg-[#151515] transition-colors border border-[#242424] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New chat</span>
                </button>
              </div>

              {/* Grouped conversations list */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
                {conversationsList.length === 0 ? (
                  <div className="text-center py-10 text-xs text-[#7E7E7E]">
                    No previous conversations yet.
                  </div>
                ) : (
                  groupedConversations.map(group => (
                    <div key={group.label} className="space-y-1">
                      <span className="text-[10px] font-semibold text-[#7E7E7E] uppercase tracking-wider px-2 block">
                        {group.label}
                      </span>
                      <div className="space-y-0.5">
                        {group.items.map(conv => {
                          const isActive = conv.id === activeConversationId;
                          return (
                            <div
                              key={conv.id}
                              onClick={() => selectConversation(conv.id)}
                              className={cn(
                                "group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors",
                                isActive
                                  ? "bg-[#151515] text-[#F5F5F5] font-medium border border-[#242424]"
                                  : "text-[#BDBDBD] hover:bg-[#101010] hover:text-[#F5F5F5]"
                              )}
                            >
                              <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                                <MessageSquare className={cn(
                                  "w-3.5 h-3.5 shrink-0",
                                  isActive ? "text-[#8B5CF6]" : "text-[#7E7E7E] group-hover:text-[#F5F5F5]"
                                )} />
                                <span className="truncate">{conv.title}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => deleteConversation(conv.id, e)}
                                title="Delete conversation"
                                className="opacity-0 group-hover:opacity-100 p-1 text-[#7E7E7E] hover:text-rose-400 rounded transition-opacity shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Main View Area */}
      {isLoadingThread ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <OmniEntity3D state="THINKING" size={44} />
            <span className="text-xs text-[#7E7E7E]">Loading conversation...</span>
          </div>
        </div>
      ) : !hasMessages ? (
        /* Empty State */
        <div className={styles.empty}>
          <div className={styles.emptyInner}>
            {/* Omni 3D entity introduction */}
            <div className="space-y-3">
              <div className="flex items-center gap-3.5 mb-1">
                <OmniEntity3D state={omniPresence.state} size={56} />
                <div className="flex flex-col">
                  <span className="text-base font-semibold text-[#F5F5F5] tracking-tight">Omni</span>
                  <span className="text-xs text-[#7E7E7E] font-normal transition-opacity duration-200">
                    {omniPresence.statusText || "Ready"}
                  </span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#F5F5F5] tracking-tight text-balance">
                What would you like to achieve today?
              </h1>
              <p className="text-sm text-[#BDBDBD] max-w-xl leading-relaxed">
                Jobs, your resume, and interview prep in one conversation.
              </p>
            </div>

            <div className={styles.emptyComposer}>
              <div className="hidden">
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-[#8b909a] hover:text-[#f4f5f7]"
                >
                  <History className="h-3.5 w-3.5" />
                  History
                  {conversationsList.length > 0 ? <span>{conversationsList.length}</span> : null}
                </button>
              </div>
              <MentorForgeChatInput
                value={input}
                onChange={setInput}
                onSend={() => sendMessage()}
                isLoading={isLoading}
                placeholder="Ask Omni..."
              />
            </div>

            {/* Lightweight starter suggestions */}
            <div className="space-y-0.5">
              <div className="flex flex-col gap-0.5">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="group inline-flex items-center gap-2.5 text-left py-1.5 px-2 rounded-lg text-xs text-[#8b909a] hover:text-[#F5F5F5] transition-colors cursor-pointer w-fit"
                  >
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active Conversation State */
        <>
          {/* Messages area */}
          <div className={styles.scroll} ref={scrollRef} onScroll={() => { const el = scrollRef.current; if (el) { followBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100; setShowBottom(!followBottom.current); } }}>
            {/* Smooth top fade gradient as messages scroll under the curved header */}

            <div className={styles.messages}>
              {messages.length > visibleMessages && (
                <button type="button" className={styles.jump} onClick={() => setVisibleMessages(value => value + 60)}>
                  Load earlier messages
                </button>
              )}
              {messages.slice(-visibleMessages).map((msg, i, arr) => {
                const isAssistant = msg.role === 'assistant';
                const isFirstInAssistantTurn =
                  isAssistant && (i === 0 || arr[i - 1]?.role !== 'assistant');

                return (
                  <motion.div
                    key={msg.id || i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.02 }}
                    className={cn(
                      styles.row,
                      msg.role === 'user' && styles.user,
                      isAssistant && !isFirstInAssistantTurn && 'pl-8 sm:pl-9'
                    )}
                  >
                    {/* Avatar: 24-28px, shown once per grouped assistant turn */}
                    {isAssistant && isFirstInAssistantTurn && (
                      <div className={styles.avatar}>
                        <OmniEntity3D state="IDLE" size={24} />
                      </div>
                    )}

                  {/* Message Content Container */}
                  <div className={msg.role === 'user' ? styles.userContent : styles.assistant}>
                    {msg.role === 'user' ? (
                      <div className={styles.bubble}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ) : (
                      <div className="min-w-0 w-full space-y-2">
                        {(() => {
                          const blocks = convertMessageToBlocks(msg);
                          return blocks.map((block, bIdx) => (
                            <OmniBlockRenderer
                              key={bIdx}
                              block={block}
                              locale={locale}
                              onAction={handleBlockAction}
                              onFormSubmit={handleFormSubmit}
                              onTailorResume={(jobTitle, jobId) =>
                                sendMessage(`Tailor my resume for the role of ${jobTitle}.${jobId ? ` Job ID: ${jobId}` : ""}`)
                              }
                              onPrepareApplication={(jobId) =>
                                sendMessage(`Prepare my application package for job ID ${jobId}`)
                              }
                              onPracticeTopic={(topic) =>
                                sendMessage(`Give me a coding challenge on ${topic} to practice for this roadmap milestone.`)
                              }
                              onRunCode={(code, lang) =>
                                sendMessage(`Run this ${lang} code in the sandbox:\n\`\`\`${lang}\n${code}\n\`\`\``)
                              }
                              onStartInterview={(role) =>
                                sendMessage(`Start mock interview for ${role || 'Software Engineer'}`)
                              }
                              onRetry={() => {
                                const lastUser = [...messages].reverse().find(m => m.role === 'user');
                                if (lastUser) sendMessage(lastUser.content);
                              }}
                              onAnswerQuestion={(key, val) =>
                                sendMessage(`My answer for "${key}" is: ${val}`)
                              }
                            />
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

              {/* Persistent 3D Omni Presence while Agent is Working */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 py-2 px-1"
                >
                  <OmniEntity3D state={omniPresence.state} size={28} />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-[#F5F5F5] tracking-tight">Omni</span>
                    <div className="flex items-center gap-1.5 text-xs text-[#7E7E7E] mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse shrink-0" />
                      <span className="transition-all duration-150">
                        {omniPresence.statusText || "Thinking..."}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Bottom composer bar */}
          <div className={styles.composer}>
            {showBottom && <button type="button" className={styles.jump} onClick={() => { followBottom.current = true; scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }}>Latest messages ↓</button>}
            <div className="max-w-3xl mx-auto">
              <div className="hidden">
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-[#8b909a] hover:text-[#f4f5f7]"
                >
                  <History className="h-3.5 w-3.5" />
                  History
                  {conversationsList.length > 0 ? <span>{conversationsList.length}</span> : null}
                </button>
                <button
                  type="button"
                  onClick={startNewChat}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-[#8b909a] hover:text-[#f4f5f7]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New chat
                </button>
              </div>
              <MentorForgeChatInput
                value={input}
                onChange={setInput}
                onSend={() => sendMessage()}
                isLoading={isLoading}
                placeholder="Ask Omni..."
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
