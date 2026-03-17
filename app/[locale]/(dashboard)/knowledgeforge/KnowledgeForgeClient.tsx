'use client';

import { useState, useEffect } from 'react';
import { BookOpen, MessageSquare, Code, Download, ChevronRight, GraduationCap, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Topic {
  id: string;
  name: string;
  description: string;
}

interface Lesson {
  title: string;
  content: string;
  examples?: { language: string; code_snippet: string; id?: string }[];
  questions?: { question: string; answer: string; id?: string }[];
}

export default function KnowledgeForgeClient({ locale }: { locale: string }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    const response = await fetch('/api/knowledgeforge/topics');
    const data = await response.json();
    setTopics(data.topics || []);
  };

  const fetchLesson = async (topicId: string) => {
    setSelectedTopic(topicId);
    setLoading(true);
    setLesson(null);
    try {
      const response = await fetch(`/api/knowledgeforge/topics/${topicId}/lesson`);
      if (!response.ok) throw new Error('Failed to load lesson');
      const data = await response.json();
      if (!data.lesson) {
        toast({ variant: "destructive", title: "No content found", description: "The AI is still generating content for this topic. Please try again in a moment." });
      }
      setLesson(data.lesson);
    } catch {
      toast({ variant: "destructive", title: "Loading Error", description: "Could not fetch topic content." });
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!selectedTopic) return;
    toast({ title: "Generating PDF...", description: "Adding your custom watermark." });
    window.open(`/api/knowledgeforge/generate-pdf?topicId=${selectedTopic}`, '_blank');
  };

  const explainTopic = () => {
    if (!lesson) return;
    const topicName = topics.find((t: Topic) => t.id === selectedTopic)?.name || "Technical Topic";
    toast({ title: "Sending to StudyForge", description: "Preparing your explanation." });
    router.push(`/${locale}/studyforge?source=knowledge&topic=${encodeURIComponent(topicName)}&content=${encodeURIComponent(lesson.content.substring(0, 1000))}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {!selectedTopic ? (
        <>
          <header>
            <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-[10px] uppercase mb-4">
              <GraduationCap className="w-3.5 h-3.5" /> Encyclopedia
            </div>
            <h1 className="text-4xl font-bold tracking-tighter text-white">KnowledgeForge</h1>
            <p className="text-slate-400 mt-2 text-lg">Master technical concepts with structured, AI-curated knowledge.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic: Topic) => (
              <Card 
                key={topic.id} 
                className="p-6 bg-white/[0.02] border-white/5 hover:border-indigo-500/50 hover:bg-white/[0.04] transition-all cursor-pointer group"
                onClick={() => fetchLesson(topic.id)}
              >
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{topic.name}</h3>
                <p className="text-sm text-slate-500 line-clamp-2">{topic.description}</p>
                <div className="mt-6 flex items-center text-indigo-400 text-xs font-bold uppercase tracking-widest">
                  Start Reading <ChevronRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setSelectedTopic(null)} className="text-slate-400 hover:text-white">
            ← Back to Knowledge Base
          </Button>

          {lesson ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-8">
                <Card className="p-10 bg-white/[0.01] border-white/5 prose prose-invert max-w-none">
                  <div className="flex justify-between items-start mb-8 not-prose">
                    <h1 className="text-4xl font-bold text-white m-0">{lesson.title}</h1>
                    <Button onClick={downloadPDF} className="bg-indigo-600 hover:bg-indigo-700">
                      <Download className="w-4 h-4 mr-2" /> Download Knowledge PDF
                    </Button>
                  </div>
                  <div className="text-slate-300 leading-relaxed markdown-content prose prose-invert max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
                          const { node: _node, ref: _ref, ...cleanProps } = props as any;
                          
                          return match ? (
                            <SyntaxHighlighter
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              style={atomDark as any}
                              language={match[1]}
                              PreTag="div"
                              {...cleanProps}
                              customStyle={{ margin: 0, background: 'transparent', padding: '1.5rem' }}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...cleanProps}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {lesson.content.trim().startsWith('[') || lesson.content.trim().startsWith('{') 
                        ? "Educational content is still being processed. Please refresh in a moment."
                        : lesson.content}
                    </ReactMarkdown>
                  </div>
                </Card>

                <Tabs defaultValue="examples" className="w-full">
                  <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
                    <TabsTrigger value="examples" className="rounded-lg">Code Examples</TabsTrigger>
                    <TabsTrigger value="questions" className="rounded-lg">Interview Q&A</TabsTrigger>
                  </TabsList>
                  <TabsContent value="examples" className="mt-6 space-y-6">
                    {lesson.examples?.map((ex, i) => (
                      <Card key={ex.id || i} className="bg-black border-white/5 overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {ex.language}
                        </div>
                        <pre className="p-6 text-sm font-mono text-indigo-300 overflow-x-auto">
                          <code>{ex.code_snippet}</code>
                        </pre>
                      </Card>
                    ))}
                  </TabsContent>
                  <TabsContent value="questions" className="mt-6 space-y-4">
                    {lesson.questions?.map((q, i) => (
                      <Card key={q.id || i} className="p-6 bg-white/[0.01] border-white/5 space-y-4">
                        <div className="flex gap-4">
                          <div className="w-6 h-6 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">Q</div>
                          <p className="font-bold text-white text-sm">{q.question}</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">A</div>
                          <p className="text-slate-400 text-sm leading-relaxed">{q.answer}</p>
                        </div>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-6">
                <Card className="p-6 bg-white/[0.02] border-white/5 space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Central Intelligence</h4>
                  <Button onClick={explainTopic} className="w-full justify-start bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 h-10 px-4">
                    <Sparkles className="w-4 h-4 mr-3 text-indigo-400" /> Explain this Topic
                  </Button>
                  <Button onClick={() => router.push(`/${locale}/codingforge`)} className="w-full justify-start bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 h-10 px-4">
                    <Code className="w-4 h-4 mr-3 text-emerald-400" /> Practice Coding
                  </Button>
                  <Button onClick={() => router.push(`/${locale}/mock-interview`)} className="w-full justify-start bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 h-10 px-4">
                    <MessageSquare className="w-4 h-4 mr-3 text-purple-400" /> Start Interview
                  </Button>
                </Card>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              {loading ? (
                <>
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <div className="animate-pulse text-slate-600 font-bold tracking-widest uppercase text-xs">Synthesizing Knowledge...</div>
                </>
              ) : (
                <>
                   <div className="text-slate-500 italic">No content found for this topic.</div>
                   <Button variant="outline" onClick={() => setSelectedTopic(null)} className="border-white/5 text-slate-400">
                     Explore other topics
                   </Button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
