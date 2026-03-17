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
        <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-[10px] uppercase mb-4">
          <BookOpen className="w-3.5 h-3.5" /> AI Knowledge Base
        </div>
        <h1 className="text-4xl font-bold tracking-tighter text-white">Knowledge Runner</h1>
        <p className="text-slate-400 mt-2 text-lg">Build a trusted knowledge base for ResumeForgeAI AI agents.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-6 bg-white/[0.02] border-white/5 space-y-4 lg:col-span-1 h-fit">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" /> Add New Topic
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Topic Name</label>
              <Input 
                value={newTopic.name}
                onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                placeholder="e.g. React hooks, SQL Joins"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
              <Input 
                value={newTopic.description}
                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                placeholder="Brief description of the topic"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <Button onClick={addTopic} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Create Topic
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-6 bg-white/[0.02] border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-400" /> Managed Topics
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input placeholder="Search topics..." className="bg-white/5 border-white/10 text-white pl-10 h-9 w-64 text-xs" />
            </div>
          </div>

          <div className="space-y-4">
            {topics.map((topic) => (
              <div key={topic.id} className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{topic.name}</h3>
                    <p className="text-xs text-slate-500">{topic.description || "No description"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => runKnowledgeRunner(topic.id)}
                    disabled={isRunning === topic.id}
                    className={`h-9 px-4 ${isRunning === topic.id ? 'bg-slate-800' : 'bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white'}`}
                  >
                    {isRunning === topic.id ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    {isRunning === topic.id ? 'Running' : 'Run AI'}
                  </Button>
                  <Button variant="ghost" className="h-9 w-9 p-0 text-slate-600 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {topics.length === 0 && (
              <div className="h-40 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center gap-3">
                <p className="text-slate-600 italic">No topics found. Start by adding one.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
