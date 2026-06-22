'use client'
export const dynamic = 'force-dynamic';
;

import { useState, useEffect } from 'react';
import { Plus, Trash2, Video, Globe, BookOpen, ExternalLink, Loader2 , Brain } from 'lucide-react';

interface VideoRecord {
    id: string;
    video_type: 'technical' | 'professional';
    career_path: string | null;
    category: string | null;
    title: string;
    video_url: string;
    description: string;
    created_at: string;
}

export default function LearnForgeAdmin() {
    const [videos, setVideos] = useState<VideoRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newVideo, setNewVideo] = useState<Partial<VideoRecord>>({
        video_type: 'technical',
        career_path: '',
        category: '',
        title: '',
        video_url: '',
        description: ''
    });

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await fetch('/api/admin/learnforge');
            const data = await res.json();
            if (data.success) setVideos(data.videos);
        } catch (err) {
            console.error('Failed to fetch videos', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...newVideo,
            career_path: newVideo.career_path?.trim(),
            category: newVideo.category?.trim()
        };
        try {
            const res = await fetch('/api/admin/learnforge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setVideos([data.video, ...videos]);
                setIsAdding(false);
                setNewVideo({
                    video_type: 'technical',
                    career_path: '',
                    category: '',
                    title: '',
                    video_url: '',
                    description: ''
                });
            }
        } catch (err) {
            console.error('Failed to add video', err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this video?')) return;
        try {
            const res = await fetch(`/api/admin/learnforge?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                setVideos(videos.filter(v => v.id !== id));
            }
        } catch (err) {
            console.error('Failed to delete video', err);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-[#171717] uppercase tracking-tight flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-indigo-500" />
                        LearnForge <span className="text-indigo-500">Library</span>
                    </h1>
                    <p className="text-[#8F8F8F] text-sm font-medium">Manage technical roadmaps and professional development videos.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-[#171717] text-sm font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                >
                    <Plus className="w-4 h-4" />
                    Add New Video
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="p-8 rounded-3xl bg-[#0a0a0f] border border-indigo-500/20 space-y-6 animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#8F8F8F] uppercase tracking-widest px-1">Video Type</label>
                            <select
                                value={newVideo.video_type}
                                onChange={e => setNewVideo({ ...newVideo, video_type: e.target.value as VideoRecord['video_type'] })}
                                className="w-full bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 text-sm text-[#171717] focus:outline-none focus:border-indigo-500/50 transition-all"
                            >
                                <option value="technical">Technical Skill</option>
                                <option value="professional">Professional Development</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-[#8F8F8F] uppercase tracking-widest px-1">
                                {newVideo.video_type === 'technical' ? 'Career Path (Roadmap Name)' : 'Category (e.g. Communication)'}
                            </label>
                            <input
                                type="text"
                                placeholder={newVideo.video_type === 'technical' ? 'e.g. Backend Developer' : 'e.g. Public Speaking'}
                                value={(newVideo.video_type === 'technical' ? newVideo.career_path : newVideo.category) || ''}
                                onChange={e => newVideo.video_type === 'technical' ? setNewVideo({ ...newVideo, career_path: e.target.value }) : setNewVideo({ ...newVideo, category: e.target.value })}
                                className="w-full bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 text-sm text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none focus:border-indigo-500/50 transition-all"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-black text-[#8F8F8F] uppercase tracking-widest px-1">Video Title</label>
                            <input
                                type="text"
                                required
                                value={newVideo.title}
                                onChange={e => setNewVideo({ ...newVideo, title: e.target.value })}
                                className="w-full bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 text-sm text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none focus:border-indigo-500/50 transition-all"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-black text-[#8F8F8F] uppercase tracking-widest px-1">Video URL (YouTube Link)</label>
                            <input
                                type="url"
                                required
                                value={newVideo.video_url}
                                onChange={e => setNewVideo({ ...newVideo, video_url: e.target.value })}
                                className="w-full bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 text-sm text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none focus:border-indigo-500/50 transition-all"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-black text-[#8F8F8F] uppercase tracking-widest px-1">Description</label>
                            <textarea
                                value={newVideo.description}
                                onChange={e => setNewVideo({ ...newVideo, description: e.target.value })}
                                className="w-full bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 text-sm text-[#171717] placeholder:text-[#8F8F8F] focus:outline-none focus:border-indigo-500/50 transition-all min-h-[100px]"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-[#EBEBEB]">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2.5 rounded-xl text-[#8F8F8F] text-sm font-bold hover:text-[#171717] transition-all">Cancel</button>
                        <button type="submit" className="px-8 py-2.5 rounded-xl bg-indigo-600 text-[#171717] text-sm font-bold hover:bg-indigo-700 transition-all active:scale-95">Save Video</button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        <p className="text-[#8F8F8F] text-xs font-black uppercase tracking-widest">Loading Library...</p>
                    </div>
                ) : videos.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center gap-3 rounded-3xl bg-[#0a0a0f] border border-[#EBEBEB] border-dashed">
                        <Video className="w-10 h-10 text-[#8F8F8F]" />
                        <p className="text-[#8F8F8F] text-sm font-bold">No videos in the library yet.</p>
                    </div>
                ) : (
                    videos.map(video => (
                        <div key={video.id} className="group relative p-6 rounded-2xl bg-[#0a0a0f] border border-[#EBEBEB] hover:border-[#EBEBEB] transition-all flex items-center gap-6">
                            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center shrink-0">
                                {video.video_type === 'technical' ? (
                                    <Brain className="w-8 h-8 text-indigo-600" />
                                ) : (
                                    <Globe className="w-8 h-8 text-emerald-600" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${video.video_type === 'technical' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                        {video.video_type}
                                    </span>
                                    {video.career_path && (
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white text-[#8F8F8F] border border-[#EBEBEB]">
                                            {video.career_path}
                                        </span>
                                    )}
                                    {video.category && (
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white text-[#8F8F8F] border border-[#EBEBEB]">
                                            {video.category}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-[#171717] truncate">{video.title}</h3>
                                <p className="text-xs text-[#8F8F8F] truncate">{video.video_url}</p>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <a 
                                    href={video.video_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-xl bg-white text-[#8F8F8F] hover:text-[#171717] hover:bg-neutral-100 transition-all"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <button 
                                    onClick={() => handleDelete(video.id)}
                                    className="p-2.5 rounded-xl bg-red-500/5 text-red-500/50 hover:text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
