'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Clock, Sparkles, Loader2, MessageSquare, Zap, Target, Globe } from 'lucide-react';
import { FeatureGate } from '@/components/pricing/FeatureGate';

interface VideoRecord {
    id: string;
    video_type: 'technical' | 'professional';
    career_path: string | null;
    category: string | null;
    title: string;
    video_url: string;
    description: string;
}

interface NoteRecord {
    id: string;
    video_id: string;
    transcript: string;
    ai_explanation: Array<{
        time: string;
        topic: string;
        explanation: string;
    }>;
}

export default function LearnForge() {
    const [roadmapName, setRoadmapName] = useState('');
    const [technicalVideos, setTechnicalVideos] = useState<VideoRecord[]>([]);
    const [professionalVideos, setProfessionalVideos] = useState<VideoRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<VideoRecord | null>(null);
    const [notes, setNotes] = useState<NoteRecord | null>(null);
    const [explaining, setExplaining] = useState(false);
    const videoRef = useRef<HTMLIFrameElement>(null);


    const fetchExplanation = useCallback(async (video: VideoRecord) => {
        setExplaining(true);
        setNotes(null);
        try {
            const res = await fetch('/api/learnforge/video/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId: video.id, videoUrl: video.video_url })
            });
            const data = await res.json();
            if (data.success) {
                setNotes(data.notes);
            }
        } catch (err) {
            console.error('Failed to fetch notes', err);
        } finally {
            setExplaining(false);
        }
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/learnforge/videos');
            const data = await res.json();
            if (data.success) {
                setRoadmapName(data.roadmapName);
                setTechnicalVideos(data.technicalVideos);
                setProfessionalVideos(data.professionalVideos);
                if (data.technicalVideos.length > 0) {
                    setSelectedVideo(data.technicalVideos[0]);
                    fetchExplanation(data.technicalVideos[0]);
                } else if (data.professionalVideos.length > 0) {
                    setSelectedVideo(data.professionalVideos[0]);
                    fetchExplanation(data.professionalVideos[0]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch videos', err);
        } finally {
            setLoading(false);
        }
    }, [fetchExplanation]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleVideoSelect = (video: VideoRecord) => {
        setSelectedVideo(video);
        fetchExplanation(video);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getEmbedUrl = (url: string) => {
        const id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
        return `https://www.youtube.com/embed/${id}`;
    };

    const seekTo = (timeStr: string) => {
        // This requires programmatic control of the iframe, which is limited for cross-domain.
        // For a true implementation, we'd use the YouTube IFrame Player API.
        // For now, we'll just log or show a tooltip.
        console.log('Seeking to:', timeStr);
        // If we had the API: player.seekTo(parsedSeconds);
    };

    if (loading) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Forging your workspace...</p>
            </div>
        );
    }

    return (
        <FeatureGate task="learn">
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        <Zap className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Learning Hub</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
                        Learn<span className="text-indigo-500">Forge</span>
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Master skills with AI-powered video explanations and interactive notes.
                    </p>
                </div>
                {roadmapName && (
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                        <Target className="w-8 h-8 text-indigo-400" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Roadmap</p>
                            <p className="text-lg font-black text-white uppercase leading-none">{roadmapName}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="xl:col-span-2 space-y-8">
                    {selectedVideo ? (
                        <>
                            {/* Video Player Box */}
                            <div className="aspect-video w-full rounded-[2.5rem] bg-black border border-white/5 overflow-hidden shadow-2xl relative group">
                                <iframe
                                    ref={videoRef}
                                    src={getEmbedUrl(selectedVideo.video_url)}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>

                            {/* Info & AI Notes Section */}
                            <div className="p-10 rounded-[2.5rem] bg-[#0a0a16] border border-white/5 space-y-8">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">{selectedVideo.title}</h2>
                                        <p className="text-slate-400 font-medium leading-relaxed">{selectedVideo.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedVideo.video_type === 'technical' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                            {selectedVideo.video_type}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                                        <Sparkles className="w-6 h-6 text-indigo-400" />
                                        <h3 className="text-xl font-black text-white uppercase tracking-widest">AI Learning Notes</h3>
                                    </div>

                                    {explaining ? (
                                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse rounded-full"></div>
                                                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin relative" />
                                            </div>
                                            <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Gemini is analyzing the transcript...</p>
                                        </div>
                                    ) : notes && notes.ai_explanation ? (
                                        <div className="space-y-4">
                                            {notes.ai_explanation.map((item, idx) => (
                                                <div 
                                                    key={idx} 
                                                    onClick={() => seekTo(item.time.split(' - ')[0])}
                                                    className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="px-3 py-1 rounded-lg bg-indigo-500 text-white text-[10px] font-black">
                                                                {item.time}
                                                            </div>
                                                            <span className="text-lg font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                                                                {item.topic}
                                                            </span>
                                                        </div>
                                                        <Play className="w-4 h-4 text-slate-600 group-hover:text-white transition-all group-hover:scale-110" />
                                                    </div>
                                                    <p className="text-slate-400 text-sm font-medium leading-relaxed pl-16">
                                                        {item.explanation}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-600 text-sm font-bold py-10 text-center uppercase tracking-widest">Unable to generate notes for this video.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="aspect-video w-full rounded-[2.5rem] bg-[#0a0a16] border border-white/5 flex flex-col items-center justify-center gap-4 text-center p-12">
                            <VideoIcon className="w-16 h-16 text-slate-800" />
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Select a video to start learning</h3>
                            <p className="text-slate-500 font-medium max-w-sm">Explore your roadmap or professional skills from the library on the right.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar - Library */}
                <div className="space-y-8">
                    {/* Technical Skills Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                            <Target className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">Roadmap Skills</h4>
                        </div>
                        <div className="space-y-3">
                            {technicalVideos.length === 0 ? (
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 border-dashed text-center">
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest pt-2">
                                        No learning videos available for this roadmap yet.
                                    </p>
                                </div>
                            ) : (
                                technicalVideos.map(video => (
                                    <div key={video.id} className="group relative">
                                        <button
                                            onClick={() => handleVideoSelect(video)}
                                            className={`w-full p-4 rounded-2xl border transition-all text-left flex items-start gap-4 ${selectedVideo?.id === video.id ? 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-600/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                        >
                                            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${selectedVideo?.id === video.id ? 'bg-white/20' : 'bg-indigo-500/10'}`}>
                                                <Play className={`w-4 h-4 ${selectedVideo?.id === video.id ? 'text-white' : 'text-indigo-400'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-xs font-black uppercase tracking-tight truncate ${selectedVideo?.id === video.id ? 'text-white' : 'text-slate-200 group-hover:text-indigo-400 transition-colors'}`}>
                                                        {video.title}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${selectedVideo?.id === video.id ? 'bg-white/10 border-white/20 text-white/80' : 'bg-indigo-500/5 border-indigo-500/10 text-indigo-400/70'}`}>
                                                        {video.career_path}
                                                    </span>
                                                    <div className="w-1 h-1 rounded-full bg-slate-700" />
                                                    <Clock className={`w-3 h-3 ${selectedVideo?.id === video.id ? 'text-white/60' : 'text-slate-500'}`} />
                                                    <span className={`text-[10px] font-bold ${selectedVideo?.id === video.id ? 'text-white/60' : 'text-slate-500'}`}>10:24</span>
                                                </div>
                                            </div>
                                        </button>
                                        <a 
                                            href={video.video_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${selectedVideo?.id === video.id ? 'hover:bg-white/20 text-white' : 'hover:bg-white/10 text-slate-500 hover:text-white'}`}
                                            title="View on YouTube"
                                        >
                                            <Globe className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Professional Skills Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                            <Globe className="w-5 h-5 text-emerald-400" />
                            <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">Professional Pro</h4>
                        </div>
                        <div className="space-y-3">
                            {professionalVideos.map(video => (
                                <div key={video.id} className="group relative">
                                    <button
                                        onClick={() => handleVideoSelect(video)}
                                        className={`w-full p-4 rounded-2xl border transition-all text-left flex items-start gap-4 ${selectedVideo?.id === video.id ? 'bg-emerald-600 border-emerald-500 shadow-xl shadow-emerald-600/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                    >
                                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${selectedVideo?.id === video.id ? 'bg-white/20' : 'bg-emerald-500/10'}`}>
                                            <Play className={`w-4 h-4 ${selectedVideo?.id === video.id ? 'text-white' : 'text-emerald-400'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <p className={`text-xs font-black uppercase tracking-tight truncate ${selectedVideo?.id === video.id ? 'text-white' : 'text-slate-200 group-hover:text-emerald-400 transition-colors'}`}>
                                                {video.title}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${selectedVideo?.id === video.id ? 'bg-white/10 border-white/20 text-white/80' : 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400/70'}`}>
                                                    {video.category}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                    <a 
                                        href={video.video_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${selectedVideo?.id === video.id ? 'hover:bg-white/20 text-white' : 'hover:bg-white/10 text-slate-500 hover:text-white'}`}
                                        title="View on YouTube"
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Assistant Quick Access */}
                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/10 space-y-4 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <MessageSquare className="w-32 h-32 text-white" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="text-xl font-black text-white uppercase tracking-tight shadow-sm">Need Help?</h4>
                            <p className="text-white/80 text-xs font-medium leading-relaxed">
                                Ask Forge AI about this video, tricky concepts, or navigate to other modules.
                            </p>
                            <button className="w-full py-3 rounded-xl bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl active:scale-95">
                                Launch Forge Assistant
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </FeatureGate>
    );
}

function VideoIcon({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
        </svg>
    );
}
