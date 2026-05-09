'use client'
export const dynamic = 'force-dynamic';

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
                <Loader2 className="w-10 h-10 text-[#00D4A0] animate-spin" />
                <p className="text-[#4A5568] font-semibold text-xs">Loading workspace...</p>
            </div>
        );
    }

    return (
        <FeatureGate task="learn">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Standardized Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1E2A42] pb-8 mb-12">
                    <div>
                        <div className="flex items-center gap-2 text-[#00D4A0] font-bold tracking-widest text-[10px] uppercase mb-4">
                            <Zap className="w-3.5 h-3.5" /> Intelligence Core
                        </div>
                        <h1 className="text-4xl font-bold tracking-tighter text-white uppercase">LearnForge</h1>
                        <p className="text-slate-400 mt-2 text-lg">Master skills with AI-powered video explanations and interactive neural notes.</p>
                    </div>

                    {roadmapName && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0D1220] border border-[#1E2A42]">
                            <Target className="w-6 h-6 text-[#00D4A0]" />
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#4A5568]">Active Trajectory</p>
                                <p className="text-sm font-bold text-white">{roadmapName.toUpperCase()}</p>
                            </div>
                        </div>
                    )}
                </header>


                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="xl:col-span-2 space-y-8">
                        {selectedVideo ? (
                            <>
                                {/* Video Player Box */}
                                <div className="aspect-video w-full rounded-2xl bg-black border border-[#1E2A42] overflow-hidden relative group">
                                    <iframe
                                        ref={videoRef}
                                        src={getEmbedUrl(selectedVideo.video_url)}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>

                                {/* Info & AI Notes Section */}
                                <div className="p-6 rounded-2xl bg-[#0D1220]/60 border border-[#1E2A42] space-y-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <h2 className="text-xl font-bold text-white">{selectedVideo.title}</h2>
                                            <p className="text-sm text-[#7A8BA8] leading-relaxed">{selectedVideo.description}</p>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${selectedVideo.video_type === 'technical' ? 'bg-[#7C5CFC]/10 text-[#7C5CFC] border-[#7C5CFC]/20' : 'bg-[#00D4A0]/10 text-[#00D4A0] border-[#00D4A0]/20'}`}>
                                                {selectedVideo.video_type}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 pb-3 border-b border-[#1E2A42]">
                                            <Sparkles className="w-5 h-5 text-[#7C5CFC]" />
                                            <h3 className="text-base font-bold text-white">AI Learning Notes</h3>
                                        </div>

                                        {explaining ? (
                                            <div className="py-12 flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="w-8 h-8 text-[#7C5CFC] animate-spin" />
                                                <p className="text-[#4A5568] font-semibold text-xs">Analyzing transcript...</p>
                                            </div>
                                        ) : notes && notes.ai_explanation ? (
                                            <div className="space-y-4">
                                                {notes.ai_explanation.map((item, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => seekTo(item.time.split(' - ')[0])}
                                                        className="group p-4 rounded-xl bg-[#080B16] border border-[#1E2A42] hover:border-[#7C5CFC]/30 transition-all cursor-pointer"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-3">
                                                                 <div className="px-2.5 py-1 rounded-lg bg-[#7C5CFC] text-white text-[10px] font-bold">
                                                                    {item.time}
                                                                </div>
                                                                <span className="text-sm font-bold text-white group-hover:text-[#7C5CFC] transition-colors">
                                                                    {item.topic}
                                                                </span>
                                                            </div>
                                                            <Play className="w-4 h-4 text-slate-600 group-hover:text-white transition-all group-hover:scale-110" />
                                                        </div>
                                                        <p className="text-[#7A8BA8] text-sm leading-relaxed pl-16">
                                                            {item.explanation}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[#4A5568] text-sm py-8 text-center">Unable to generate notes for this video.</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="aspect-video w-full rounded-2xl bg-[#0D1220]/60 border border-[#1E2A42] flex flex-col items-center justify-center gap-3 text-center p-8">
                                <VideoIcon className="w-12 h-12 text-[#1E2A42]" />
                                <h3 className="text-lg font-bold text-white">Select a video to start learning</h3>
                                <p className="text-sm text-[#7A8BA8] max-w-sm">Explore your roadmap or professional skills from the library.</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Library */}
                    <div className="space-y-8">
                        {/* Technical Skills Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 px-2">
                                <Target className="w-4 h-4 text-[#00D4A0]" />
                                <h4 className="text-xs font-bold text-[#7A8BA8] uppercase tracking-wider">Roadmap Skills</h4>
                            </div>
                            <div className="space-y-3">
                                {technicalVideos.length === 0 ? (
                                    <div className="p-4 rounded-xl bg-[#0D1220]/60 border border-[#1E2A42] border-dashed text-center">
                                        <p className="text-xs text-[#4A5568] pt-1">
                                            No learning videos available for this roadmap yet.
                                        </p>
                                    </div>
                                ) : (
                                    technicalVideos.map(video => (
                                        <div key={video.id} className="group relative">
                                            <button
                                                onClick={() => handleVideoSelect(video)}
                                                className={`w-full p-4 rounded-xl border transition-all text-left flex items-start gap-3 ${selectedVideo?.id === video.id ? 'bg-[#00D4A0]/10 border-[#00D4A0]/30' : 'bg-[#0D1220]/60 border-[#1E2A42] hover:border-[#00D4A0]/20'}`}
                                            >
                                                <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${selectedVideo?.id === video.id ? 'bg-[#00D4A0]/20' : 'bg-white/5'}`}>
                                                    <Play className={`w-3.5 h-3.5 ${selectedVideo?.id === video.id ? 'text-[#00D4A0]' : 'text-[#4A5568]'}`} />
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`text-xs font-bold truncate ${selectedVideo?.id === video.id ? 'text-[#00D4A0]' : 'text-[#EFF4FB] group-hover:text-[#00D4A0] transition-colors'}`}>
                                                            {video.title}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${selectedVideo?.id === video.id ? 'bg-white/10 border-white/20 text-white/80' : 'bg-[#7C5CFC]/5 border-[#7C5CFC]/10 text-[#7C5CFC]/70'}`}>
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
                            <div className="flex items-center gap-2 px-2">
                                <Globe className="w-4 h-4 text-[#00D4A0]" />
                                <h4 className="text-xs font-bold text-[#7A8BA8] uppercase tracking-wider">Professional</h4>
                            </div>
                            <div className="space-y-3">
                                {professionalVideos.map(video => (
                                    <div key={video.id} className="group relative">
                                        <button
                                            onClick={() => handleVideoSelect(video)}
                                            className={`w-full p-4 rounded-xl border transition-all text-left flex items-start gap-3 ${selectedVideo?.id === video.id ? 'bg-[#00D4A0]/10 border-[#00D4A0]/30' : 'bg-[#0D1220]/60 border-[#1E2A42] hover:border-[#00D4A0]/20'}`}
                                        >
                                            <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${selectedVideo?.id === video.id ? 'bg-[#00D4A0]/20' : 'bg-white/5'}`}>
                                                <Play className={`w-3.5 h-3.5 ${selectedVideo?.id === video.id ? 'text-[#00D4A0]' : 'text-[#4A5568]'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <p className={`text-xs font-bold truncate ${selectedVideo?.id === video.id ? 'text-[#00D4A0]' : 'text-[#EFF4FB] group-hover:text-[#00D4A0] transition-colors'}`}>
                                                    {video.title}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${selectedVideo?.id === video.id ? 'bg-white/10 border-white/20 text-white/80' : 'bg-[#00D4A0]/5 border-[#00D4A0]/10 text-[#00D4A0]/70'}`}>
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
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#7C5CFC] to-[#00D4A0] border border-white/10 space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <MessageSquare className="w-24 h-24 text-white" />
                            </div>
                            <div className="relative z-10 space-y-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="text-base font-bold text-white">Need Help?</h4>
                                <p className="text-white/80 text-xs leading-relaxed">
                                    Ask Forge AI about this video or tricky concepts.
                                </p>
                                <button className="w-full py-2.5 rounded-xl bg-white text-[#080B16] text-xs font-bold hover:bg-white/90 transition-all active:scale-95">
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
            <path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
        </svg>
    );
}
