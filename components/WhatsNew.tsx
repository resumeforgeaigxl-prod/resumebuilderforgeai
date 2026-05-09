'use client';

import { motion } from 'framer-motion';
import { fadeInUp, fadeInScale } from '@/lib/constants';
import { ArrowRight, Sparkles, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/lib/seo-service';

export default function WhatsNew({ locale = 'en', posts = [] }: { locale: string, posts?: BlogPost[] }) {
    if (posts.length === 0) return null;

    return (
        <section className="relative px-6 py-28 sm:py-32 overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <motion.div {...fadeInUp()} className="max-w-2xl">
                        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] w-fit mb-5 shadow-lg shadow-blue-500/5">
                            <Sparkles size={12} className="animate-pulse" /> Platform Pulse
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-4">
                            🚀 What’s New
                        </h2>
                        <p className="text-xl text-slate-400/80 font-medium tracking-tight">
                            Latest features and improvements in ResumeForgeAI
                        </p>
                    </motion.div>
                    
                    <motion.div {...fadeInUp(0.1)}>
                        <Link 
                            href={`/${locale}/posts`} 
                            className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest"
                        >
                            View All Engineering Logs <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                {/* Horizontal Scroll Interface */}
                <div className="relative group/carousel">
                    <div 
                        className="flex gap-8 overflow-x-auto pb-12 scrollbar-none snap-x snap-mandatory perspective-1000"
                    >
                        {posts.map((post, index) => (
                            <motion.article
                                key={post.slug}
                                {...fadeInScale(index * 0.1)}
                                className="min-w-[85vw] md:min-w-[420px] snap-center"
                            >
                                <div className="glass-card group relative h-[500px] flex flex-col rounded-[32px] overflow-hidden border border-white/5 bg-[#0f111a]/40 backdrop-blur-3xl hover:border-white/20 transition-all duration-700 shadow-[0_20px_100px_-40px_rgba(8,15,30,1)] hover:shadow-[0_40px_120px_-30px_rgba(59,130,246,0.15)]">
                                    {/* Cover Media (Image or Video) */}
                                    {post.cover_image && (
                                        <div className="h-60 overflow-hidden relative">
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] to-transparent z-10" />
                                            {post.cover_image.endsWith('.mp4') ? (
                                                <video 
                                                    src={post.cover_image}
                                                    autoPlay
                                                    muted
                                                    loop
                                                    playsInline
                                                    aria-label="Platform feature demonstration"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                                                />
                                            ) : (
                                                <Image
                                                    src={post.cover_image} 
                                                    alt={post.title}
                                                    fill
                                                    sizes="(max-width: 768px) 85vw, 420px"
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out grayscale-[20%] group-hover:grayscale-0"
                                                />
                                            )}
                                        </div>
                                    )}

                                    <div className="p-10 flex-1 flex flex-col">
                                        <div className="flex items-center gap-3 text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-6">
                                            <Calendar size={14} className="text-blue-500/50" />
                                            {new Date(post.published_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </div>

                                        <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors mb-4 tracking-tighter leading-tight">
                                            {post.title}
                                        </h3>

                                        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 font-medium mb-10">
                                            {post.seo_description}
                                        </p>

                                        <div className="mt-auto">
                                            <Link 
                                                href={`/${locale}/posts/${post.slug}`}
                                                aria-label={`Learn more about ${post.title}`}
                                                className="inline-flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white font-bold py-4 px-8 rounded-2xl border border-white/5 transition-all w-full md:w-fit group/btn"
                                            >
                                                <span aria-hidden="true">Learn More</span> <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform text-blue-500" aria-hidden="true" />
                                            </Link>
                                        </div>
                                    </div>
                                    
                                    {/* Glow effect on hover */}
                                    <div className="absolute -inset-[2px] bg-gradient-to-br from-blue-500/20 via-transparent to-indigo-500/20 rounded-[32px] opacity-0 group-hover:opacity-100 blur-sm -z-10 transition-opacity duration-700" />
                                </div>
                            </motion.article>
                        ))}
                    </div>

                    {/* Navigation gradient shadows */}
                    <div className="absolute top-0 right-0 h-full w-32 bg-gradient-to-l from-slate-950 via-transparent to-transparent pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity" />
                    <div className="absolute top-0 left-0 h-full w-32 bg-gradient-to-r from-slate-950 via-transparent to-transparent pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity" />
                </div>
            </div>

            <style jsx global>{`
                .scrollbar-none::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-none {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
            `}</style>
        </section>
    );
}
