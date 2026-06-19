'use client';

import { useState, useEffect } from 'react';
import { BookOpen, MessageSquare, Code, Download, ChevronRight, GraduationCap, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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
          {/* Standardized Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EBEBEB] pb-8 mb-12">
            <div>
              <div className="flex items-center gap-2 text-[#8F8F8F] font-medium tracking-normal text-xs uppercase mb-3 font-mono">
                <GraduationCap className="w-3.5 h-3.5" /> Intelligence Core
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tighter text-[#171717]">KnowledgeForge</h1>
              <p className="text-[#4D4D4D] mt-2 text-base">Master technical concepts with structured, AI-curated knowledge and architectural patterns.</p>
            </div>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#EBEBEB] shadow-sm">
              <div className="text-[10px] text-[#8F8F8F] uppercase tracking-wider font-mono">ENCYCLOPEDIA_SIGNAL</div>
              <Badge variant="outline" className="border-[#EBEBEB] bg-[#FAFAFA] text-[#4D4D4D] text-[9px] font-semibold uppercase">SECURE</Badge>
            </div>
          </header>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic: Topic) => (
              <Card
                key={topic.id}
                className="p-6 bg-[#FFFFFF] border border-[#EBEBEB] hover:border-[#171717] hover:shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_16px_rgba(0,0,0,0.04)] transition-all cursor-pointer group shadow-sm"
                onClick={() => fetchLesson(topic.id)}
              >
                <div className="h-12 w-12 rounded-lg bg-[#FAFAFA] border border-[#EBEBEB] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-[#171717]" />
                </div>
                <h3 className="text-xl font-semibold text-[#171717] mb-2">{topic.name}</h3>
                <p className="text-sm text-[#4D4D4D] line-clamp-2">{topic.description}</p>
                <div className="mt-6 flex items-center text-[#171717] text-xs font-semibold uppercase tracking-wider">
                  Start Reading <ChevronRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setSelectedTopic(null)} className="text-[#8F8F8F] hover:text-[#171717] hover:bg-[#FAFAFA]">
            ← Back to Knowledge Base
          </Button>

          {lesson ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-8">
                <Card className="p-10 bg-[#FFFFFF] border border-[#EBEBEB] prose max-w-none shadow-sm">
                  <div className="flex justify-between items-start mb-8 not-prose">
                    <h1 className="text-4xl font-semibold text-[#171717] m-0">{lesson.title}</h1>
                    <Button onClick={downloadPDF} className="bg-[#171717] hover:bg-[#333333] text-white text-sm font-medium rounded-md transition-all shadow-sm">
                      <Download className="w-4 h-4 mr-2" /> Download Knowledge PDF
                    </Button>
                  </div>
                  <div className="text-[#4D4D4D] leading-relaxed markdown-content max-w-none">
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
                              customStyle={{ margin: 0, background: '#FAFAFA', padding: '1.5rem', borderRadius: '6px', border: '1px solid #EBEBEB' }}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className="bg-[#FAFAFA] border border-[#EBEBEB] rounded px-1 text-sm font-mono text-[#171717]" {...cleanProps}>
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
                  <TabsList className="bg-[#FAFAFA] border border-[#EBEBEB] p-1 rounded-lg">
                    <TabsTrigger value="examples" className="rounded-md">Code Examples</TabsTrigger>
                    <TabsTrigger value="questions" className="rounded-md">Interview Q&A</TabsTrigger>
                  </TabsList>
                  <TabsContent value="examples" className="mt-6 space-y-6">
                    {lesson.examples?.map((ex, i) => (
                      <Card key={ex.id || i} className="bg-[#FAFAFA] border border-[#EBEBEB] overflow-hidden rounded-lg shadow-sm">
                        <div className="p-4 border-b border-[#EBEBEB] bg-[#FFFFFF] flex justify-between items-center text-[10px] font-mono text-[#8F8F8F] uppercase tracking-wider">
                          {ex.language}
                        </div>
                        <pre className="p-6 text-sm font-mono text-[#171717] overflow-x-auto">
                          <code>{ex.code_snippet}</code>
                        </pre>
                      </Card>
                    ))}
                  </TabsContent>
                  <TabsContent value="questions" className="mt-6 space-y-4">
                    {lesson.questions?.map((q, i) => (
                      <Card key={q.id || i} className="p-6 bg-[#FFFFFF] border border-[#EBEBEB] space-y-4 rounded-lg shadow-sm">
                        <div className="flex gap-4">
                          <div className="w-6 h-6 rounded bg-[#ECFDF5] border border-[#D1FAE5] text-[#065F46] flex items-center justify-center text-xs font-semibold shrink-0">Q</div>
                          <p className="font-semibold text-[#171717] text-sm">{q.question}</p>
                        </div>
                        <div className="flex gap-4">
                          <div className="w-6 h-6 rounded bg-[#EFF6FF] border border-[#DBEAFE] text-[#1E40AF] flex items-center justify-center text-xs font-semibold shrink-0">A</div>
                          <p className="text-[#4D4D4D] text-sm leading-relaxed">{q.answer}</p>
                        </div>
                      </Card>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="space-y-6">
                <Card className="p-6 bg-[#FFFFFF] border border-[#EBEBEB] space-y-4 rounded-lg shadow-sm">
                  <h4 className="text-[10px] font-mono text-[#8F8F8F] uppercase tracking-wider border-b border-[#EBEBEB] pb-2">Central Intelligence</h4>
                  <Button onClick={explainTopic} className="w-full justify-start bg-[#FAFAFA] hover:bg-[#F2F2F2] border border-[#EBEBEB] text-[#171717] h-10 px-4 rounded-md">
                    <Sparkles className="w-4 h-4 mr-3 text-[#171717]" /> Explain this Topic
                  </Button>
                  <Button onClick={() => router.push(`/${locale}/codingforge`)} className="w-full justify-start bg-[#FAFAFA] hover:bg-[#F2F2F2] border border-[#EBEBEB] text-[#171717] h-10 px-4 rounded-md">
                    <Code className="w-4 h-4 mr-3 text-[#171717]" /> Practice Coding
                  </Button>
                  <Button onClick={() => router.push(`/${locale}/mock-interview`)} className="w-full justify-start bg-[#FAFAFA] hover:bg-[#F2F2F2] border border-[#EBEBEB] text-[#171717] h-10 px-4 rounded-md">
                    <MessageSquare className="w-4 h-4 mr-3 text-[#171717]" /> Start Interview
                  </Button>
                </Card>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              {loading ? (
                <>
                  <div className="w-12 h-12 border-4 border-[#EBEBEB] border-t-[#171717] rounded-full animate-spin" />
                  <div className="animate-pulse text-[#8F8F8F] font-semibold tracking-wider uppercase text-xs font-mono">Synthesizing Knowledge...</div>
                </>
              ) : (
                <>
                  <div className="text-[#8F8F8F] italic text-sm">No content found for this topic.</div>
                  <Button variant="outline" onClick={() => setSelectedTopic(null)} className="border-[#EBEBEB] text-[#4D4D4D]">
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
