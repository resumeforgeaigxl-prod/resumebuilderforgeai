'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Play, Trash2, FileText, GraduationCap, Search, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/use-toast';

interface Topic {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export default function KnowledgeRunnerClient() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState({ name: '', description: '' });
  const [isRunning, setIsRunning] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    const response = await fetch('/api/admin/knowledge-runner/topics');
    const data = await response.json();
    setTopics(data.topics || []);
  };

  const addTopic = async () => {
    if (!newTopic.name) return;
    try {
      const response = await fetch('/api/admin/knowledge-runner/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTopic)
      });
      if (response.ok) {
        setNewTopic({ name: '', description: '' });
        fetchTopics();
        toast({ title: "Topic Added", description: "You can now run the knowledge runner for this topic." });
      }
    } catch {
      toast({ variant: "destructive", title: "Failed to add topic" });
    }
  };

  const runKnowledgeRunner = async (topicId: string) => {
    setIsRunning(topicId);
    try {
      const response = await fetch(`/api/admin/knowledge-runner/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast({ title: "Knowledge Runner Complete", description: "AI has successfully generated learning material for this topic." });
      } else {
        toast({ variant: "destructive", title: "Partial Failure", description: data.error || "The AI response was malformed. Some content may be missing." });
      }
    } catch {
      toast({ variant: "destructive", title: "Failed to run knowledge runner" });
    } finally {
      setIsRunning(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header>
        <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-widest text-[10px] uppercase mb-4">
          <BookOpen className="w-3.5 h-3.5" /> AI Knowledge Base
        </div>
        <h1 className="text-4xl font-bold tracking-tighter text-[#171717]">Knowledge Runner</h1>
        <p className="text-[#8F8F8F] mt-2 text-lg">Build a trusted knowledge base for ResumeForgeAI AI agents.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-6 bg-white/[0.02] border-[#EBEBEB] space-y-4 lg:col-span-1 h-fit">
          <h2 className="text-xl font-bold text-[#171717] flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" /> Add New Topic
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-widest">Topic Name</label>
              <Input 
                value={newTopic.name}
                onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                placeholder="e.g. React hooks, SQL Joins"
                className="bg-white border-[#EBEBEB] text-[#171717]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#8F8F8F] uppercase tracking-widest">Description</label>
              <Input 
                value={newTopic.description}
                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                placeholder="Brief description of the topic"
                className="bg-white border-[#EBEBEB] text-[#171717]"
              />
            </div>
            <Button onClick={addTopic} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Create Topic
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6 bg-white/[0.02] border-[#EBEBEB] space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#171717] flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" /> Managed Topics
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8F8F]" />
              <Input placeholder="Search topics..." className="bg-white border-[#EBEBEB] text-[#171717] pl-10 h-9 w-64 text-xs" />
            </div>
          </div>

          <div className="space-y-4">
            {topics.map((topic) => (
              <div key={topic.id} className="p-4 rounded-2xl bg-white/[0.01] border border-[#EBEBEB] flex items-center justify-between group hover:border-[#EBEBEB] transition-all">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#EBEBEB] flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#8F8F8F]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#171717]">{topic.name}</h3>
                    <p className="text-xs text-[#8F8F8F]">{topic.description || "No description"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => runKnowledgeRunner(topic.id)}
                    disabled={isRunning === topic.id}
                    className={`h-9 px-4 ${isRunning === topic.id ? 'bg-white' : 'bg-white hover:bg-neutral-100 border border-[#EBEBEB] text-[#4D4D4D] hover:text-[#171717]'}`}
                  >
                    {isRunning === topic.id ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {isRunning === topic.id ? 'Running' : 'Run AI'}
                  </Button>
                  <Button variant="ghost" className="h-9 w-9 p-0 text-[#8F8F8F] hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {topics.length === 0 && (
              <div className="h-40 border-2 border-dashed border-[#EBEBEB] rounded-3xl flex flex-col items-center justify-center gap-3">
                <p className="text-[#8F8F8F] italic">No topics found. Start by adding one.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
