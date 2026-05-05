'use client';

import { useState, useEffect } from 'react';
import { BookOpen, MessageSquare, Code, Download, ChevronRight, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

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

export default function LearnForgeClient() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    const response = await fetch('/api/learnforge/topics');
    const data = await response.json();
    setTopics(data.topics || []);
  };

  const fetchLesson = async (topicId: string) => {
    setSelectedTopic(topicId);
    const response = await fetch(`/api/learnforge/topics/${topicId}/lesson`);
    const data = await response.json();
    setLesson(data.lesson);
  };

  const downloadPDF = async () => {
    if (!selectedTopic) return;
    toast({ title: "Generating PDF...", description: "Adding your custom watermark." });
    window.open(`/api/learnforge/generate-pdf?topicId=${selectedTopic}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {!selectedTopic ? (
        <>
          <header>
            <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-[10px] uppercase mb-4">
              <GraduationCap className="w-3.5 h-3.5" /> Encyclopedia
            </div>
            <h1 className="text-4xl font-bold tracking-tighter text-white">LearnForge Library</h1>
            <p className="text-slate-400 mt-2 text-lg">Master technical concepts with original, AI-curated lessons.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
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
                  Start Learning <ChevronRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => setSelectedTopic(null)} className="text-slate-400 hover:text-white">
            ← Back to Library
          </Button>

          {lesson ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-8">
                <Card className="p-10 bg-white/[0.01] border-white/5 prose prose-invert max-w-none">
                  <div className="flex justify-between items-start mb-8 not-prose">
                    <h1 className="text-4xl font-bold text-white m-0">{lesson.title}</h1>
                    <Button onClick={downloadPDF} className="bg-indigo-600 hover:bg-indigo-700">
                      <Download className="w-4 h-4 mr-2" /> Download PDF
                    </Button>
                  </div>
                  <div className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {lesson.content}
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
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Actions</h4>
                  <Button className="w-full justify-start bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 h-10 px-4">
                    <Code className="w-4 h-4 mr-3 text-indigo-400" /> Open CodingForge
                  </Button>
                  <Button className="w-full justify-start bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 h-10 px-4">
                    <MessageSquare className="w-4 h-4 mr-3 text-purple-400" /> Take Mock Test
                  </Button>
                </Card>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-pulse text-slate-600">Loading lesson...</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
