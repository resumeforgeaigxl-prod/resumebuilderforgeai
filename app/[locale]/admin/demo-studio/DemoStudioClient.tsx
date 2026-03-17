'use client';

import { useState, useRef, useEffect } from 'react';
import { Video, Camera, Sparkles, Play, Download, Trash2, Plus, GripVertical, Save, Upload, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/use-toast';

interface Scene {
  image: string;
  title: string;
  subtitle: string;
  duration: number;
  audio?: string;
}

interface RenderedVideo {
  id: string;
  name: string;
  status: string;
  video_url?: string;
  created_at: string;
}

export default function DemoStudioClient() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [projectName, setProjectName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [generatingVoiceIndex, setGeneratingVoiceIndex] = useState<number | null>(null);
  const [recentRenders, setRecentRenders] = useState<RenderedVideo[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecentRenders();
  }, []);

  const fetchRecentRenders = async () => {
    try {
      const response = await fetch('/api/admin/demo-studio/projects');
      const data = await response.json();
      if (Array.isArray(data)) {
        setRecentRenders(data);
      }
    } catch (err) {
      console.error('Failed to fetch recent renders:', err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'monitor' },
        audio: true
      });
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideo(url);
        toast({ title: "Recording saved!", description: "You can now use this for your demo." });
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      toast({ variant: "destructive", title: "Recording failed", description: "Make sure you granted permissions." });
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    setIsRecording(false);
  };

  const generateAIScript = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/admin/demo-studio/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: 'ResumeForgeAI' })
      });
      const data = await response.json();
      if (data.scenes) {
        setScenes(data.scenes);
        toast({ title: "AI Script Generated!", description: "Review and edit the scenes below." });
      }
    } catch {
      toast({ variant: "destructive", title: "AI Generation failed" });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveProject = async () => {
    if (scenes.length === 0) {
      toast({ variant: "destructive", title: "Nothing to save", description: "Add some scenes first." });
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/demo-studio/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes, projectName: projectName || 'Untitled Demo' })
      });
      const data = await response.json();
      if (data.projectId) {
        toast({ title: "Project Saved", description: "Your demo configuration has been recorded." });
        fetchRecentRenders();
      }
    } catch {
      toast({ variant: "destructive", title: "Save failed" });
    } finally {
      setIsSaving(false);
    }
  };

  const exportVideo = async () => {
    if (scenes.length === 0) {
      toast({ variant: "destructive", title: "Nothing to export", description: "Add some scenes first." });
      return;
    }
    setIsExporting(true);
    try {
      const response = await fetch('/api/admin/demo-studio/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes, projectName: projectName || 'Untitled Demo', triggerRender: true })
      });
      const data = await response.json();
      if (data.projectId) {
        toast({ title: "Export Started", description: "Rendering complex video. We'll notify you on completion." });
        fetchRecentRenders();
      }
    } catch {
      toast({ variant: "destructive", title: "Export failed" });
    } finally {
      setIsExporting(false);
    }
  };

  const generateSceneVoiceover = async (index: number) => {
    const scene = scenes[index];
    if (!scene.title && !scene.subtitle) {
      toast({ variant: "destructive", title: "Missing text", description: "Add a title or subtitle first." });
      return;
    }

    setGeneratingVoiceIndex(index);
    try {
      const textToSpeak = `${scene.title}. ${scene.subtitle}`;
      const response = await fetch('/api/admin/demo-studio/voiceover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: textToSpeak, 
          sceneIndex: index,
          projectId: projectName || 'draft'
        })
      });

      const data = await response.json();
      if (data.audioUrl) {
        updateScene(index, 'audio', data.audioUrl);
        toast({ title: "Voiceover Generated!", description: "You can now preview it in the scene." });
      } else {
        throw new Error(data.error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ variant: "destructive", title: "Voiceover failed", description: msg });
    } finally {
      setGeneratingVoiceIndex(null);
    }
  };

  const addScene = () => {
    setScenes([...scenes, { image: '', title: '', subtitle: '', duration: 4 }]);
  };

  const removeScene = (index: number) => {
    setScenes(scenes.filter((_, i) => i !== index));
  };

  const updateScene = <K extends keyof Scene>(index: number, field: K, value: Scene[K]) => {
    const newScenes = [...scenes];
    newScenes[index] = { ...newScenes[index], [field]: value };
    setScenes(newScenes);
  };
  
  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateScene(index, 'image', reader.result as string);
        toast({ title: "Image Uploaded", description: "The scene image has been updated locally." });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-[10px] uppercase mb-4">
            <Video className="w-3.5 h-3.5" /> Marketing tools
          </div>
          <h1 className="text-4xl font-bold tracking-tighter text-white">Demo Studio</h1>
          <p className="text-slate-400 mt-2 text-lg">Create AI-powered product demo videos.</p>
        </div>
        <div className="w-64">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Project Name</label>
          <Input 
            value={projectName} 
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="E.g. LinkedIn Demo"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6 bg-white/[0.02] border-white/5 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-400" /> Record Demo
          </h2>
          <div className="aspect-video bg-black rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden">
            {recordedVideo ? (
              <video src={recordedVideo} controls className="w-full h-full object-contain" />
            ) : (
              <p className="text-slate-600 text-sm italic">No recording yet</p>
            )}
            {isRecording && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/50 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Recording</span>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            {!isRecording ? (
              <Button onClick={startRecording} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                <Video className="w-4 h-4 mr-2" /> Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" /> Stop Recording
              </Button>
            )}
            {recordedVideo && (
              <Button asChild variant="outline" className="border-white/10 hover:bg-white/5">
                <a href={recordedVideo} download="demo_recording.webm">
                  <Download className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-white/[0.02] border-white/5 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" /> AI Script Generator
          </h2>
          <p className="text-sm text-slate-500">Generate a high-converting demo script using Gemini Flash.</p>
          <Button 
            onClick={generateAIScript} 
            disabled={isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isGenerating ? "Generating..." : "Generate AI Script"}
          </Button>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Scene Editor</h2>
          <Button onClick={addScene} variant="outline" size="sm" className="border-white/10 hover:bg-white/5">
            <Plus className="w-4 h-4 mr-2" /> Add Scene
          </Button>
        </div>

        <div className="space-y-4">
          {scenes.map((scene, index) => (
            <Card key={index} className="p-4 bg-white/[0.01] border-white/5 flex gap-6 items-start">
              <div className="pt-2 text-slate-600 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Image URL</label>
                  <div className="flex gap-2">
                    <Input 
                      value={scene.image} 
                      onChange={(e) => updateScene(index, 'image', e.target.value)}
                      placeholder="Enter URL or upload"
                      className="bg-white/5 border-white/10 text-white h-9 text-xs"
                    />
                    <label className="shrink-0 h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(index, e)}
                      />
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Title</label>
                  <Input 
                    value={scene.title} 
                    onChange={(e) => updateScene(index, 'title', e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-9"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subtitle</label>
                  <Input 
                    value={scene.subtitle} 
                    onChange={(e) => updateScene(index, 'subtitle', e.target.value)}
                    className="bg-white/5 border-white/10 text-white h-9"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Scene Duration (s)</p>
                  <Input 
                    type="number"
                    value={scene.duration} 
                    onChange={(e) => updateScene(index, 'duration', parseInt(e.target.value))}
                    className="bg-white/5 border-white/10 text-white h-9"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2 pt-6">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 hover:bg-white/10 text-purple-400"
                  onClick={() => generateSceneVoiceover(index)}
                  disabled={generatingVoiceIndex === index}
                >
                  {generatingVoiceIndex === index ? (
                    <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </Button>
                {scene.audio && (
                  <div className="flex items-center gap-2">
                    <audio src={scene.audio} className="hidden" id={`audio-${index}`} />
                    <button 
                      onClick={() => (document.getElementById(`audio-${index}`) as HTMLAudioElement).play()}
                      className="h-8 w-8 flex items-center justify-center bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500/30 transition-colors"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => removeScene(index)}
                  className="h-8 w-8 flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
          {scenes.length === 0 && (
            <div className="h-32 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center">
              <p className="text-slate-600 italic">No scenes defined. Generate with AI or add manually.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button 
          onClick={saveProject} 
          disabled={isSaving || isExporting} 
          variant="outline" 
          className="border-white/10 hover:bg-white/5"
        >
          <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Project'}
        </Button>
        <Button 
          onClick={exportVideo} 
          disabled={isExporting || isSaving} 
          className="bg-indigo-600 hover:bg-indigo-700 px-8"
        >
          <Play className="w-4 h-4 mr-2" /> {isExporting ? 'Starting Export...' : 'Preview & Export Video'}
        </Button>
      </div>

      <div className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Recent Renders</h3>
          <Button 
            onClick={fetchRecentRenders} 
            variant="ghost" 
            size="sm" 
            className="text-slate-500 hover:text-white"
          >
            <RefreshCcw className="w-3.5 h-3.5 mr-2" /> Refresh
          </Button>
        </div>
        
        {recentRenders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentRenders.map((render) => (
              <Card key={render.id} className="p-4 bg-white/[0.02] border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white truncate max-w-[150px]">{render.name}</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      render.status === 'completed' ? 'bg-green-500' : 
                      render.status === 'processing' ? 'bg-blue-500 animate-pulse' : 
                      'bg-slate-500'
                    }`} />
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{render.status}</p>
                  </div>
                </div>
                {render.video_url && (
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" asChild>
                    <a href={render.video_url} download>
                      <Download className="w-4 h-4 text-indigo-400" />
                    </a>
                  </Button>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="h-24 border border-dashed border-white/5 rounded-xl flex items-center justify-center text-slate-600 italic text-sm">
            No recent renders found. Save a project or export to see history.
          </div>
        )}
      </div>
    </div>
  );
}
