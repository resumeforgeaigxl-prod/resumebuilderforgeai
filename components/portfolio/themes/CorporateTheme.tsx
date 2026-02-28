'use client';
import { PortfolioData } from '@/types/portfolio';
import { Github, ExternalLink, Mail, Linkedin, Globe, Phone, Award, Download } from 'lucide-react';

interface Props { data: PortfolioData; watermark?: boolean; }

export default function CorporateTheme({ data, watermark = false }: Props) {
    const handleDownload = () => window.print();

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-slate-200" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
            {/* Hero */}
            <header className="relative overflow-hidden border-b border-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent pointer-events-none" />
                <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12 sm:py-20 relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Open to opportunities
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">{data.name}</h1>
                    <p className="text-base sm:text-xl text-blue-400 font-medium mb-5">{data.headline}</p>
                    <p className="text-slate-400 leading-relaxed max-w-2xl text-base">{data.about}</p>
                    <div className="flex flex-wrap gap-3 mt-8">
                        {data.email && <a href={`mailto:${data.email}`} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 transition-all"><Mail className="w-4 h-4 text-blue-400" />{data.email}</a>}
                        {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 transition-all"><Github className="w-4 h-4" />GitHub</a>}
                        {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 transition-all"><Linkedin className="w-4 h-4 text-blue-400" />LinkedIn</a>}
                        {data.website && <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 transition-all"><Globe className="w-4 h-4 text-purple-400" />Website</a>}
                        {data.phone && <a href={`tel:${data.phone}`} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 transition-all"><Phone className="w-4 h-4" />{data.phone}</a>}
                    </div>

                    <div className="flex flex-wrap gap-4 mt-8">
                        {data.email && (
                            <a href={`mailto:${data.email}`} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20">
                                <Mail className="w-4 h-4" /> Contact Me
                            </a>
                        )}
                        <button onClick={handleDownload} className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-xl text-sm font-medium transition-all">
                            <Download className="w-4 h-4" /> Download Resume
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-12 sm:space-y-16">
                {/* Skills */}
                {data.skills?.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Core Competencies</h2>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((s, i) => (
                                <span key={i} className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 text-sm rounded-xl hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-default">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {data.projects?.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Featured Projects</h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {data.projects.map((p, i) => (
                                <div key={i} className="group p-6 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-blue-500/30 hover:bg-blue-500/[0.03] transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-semibold text-white">{p.title}</h3>
                                        <div className="flex gap-2">
                                            {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" className="text-slate-600 group-hover:text-slate-400 transition-colors"><Github className="w-4 h-4" /></a>}
                                            {p.live && <a href={p.live} target="_blank" rel="noopener noreferrer" className="text-slate-600 group-hover:text-blue-400 transition-colors"><ExternalLink className="w-4 h-4" /></a>}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-4 leading-relaxed">{p.description}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {p.tech?.map((t, j) => <span key={j} className="text-xs px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full">{t}</span>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Experience */}
                {data.experience?.length > 0 && (
                    <section>
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Professional Experience</h2>
                        <div className="space-y-6">
                            {data.experience.map((exp, i) => (
                                <div key={i} className="p-6 bg-white/[0.03] border border-white/10 rounded-2xl">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-semibold text-white">{exp.role}</p>
                                            <p className="text-blue-400 text-sm">{exp.company}</p>
                                        </div>
                                        <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full shrink-0 ml-4">{exp.duration}</span>
                                    </div>
                                    <ul className="space-y-1.5">
                                        {exp.points?.map((pt, j) => (
                                            <li key={j} className="text-sm text-slate-400 flex gap-3">
                                                <span className="w-1 h-1 rounded-full bg-blue-500 mt-2 shrink-0" />
                                                {pt}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education + Certs */}
                <div className="grid sm:grid-cols-2 gap-8">
                    {data.education?.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Education</h2>
                            <div className="space-y-4">
                                {data.education.map((e, i) => (
                                    <div key={i} className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                                        <p className="font-semibold text-white text-sm">{e.degree}</p>
                                        <p className="text-blue-400 text-sm">{e.school}</p>
                                        <div className="flex justify-between mt-1">
                                            <span className="text-xs text-slate-500">{e.duration}</span>
                                            {e.cgpa && <span className="text-xs text-slate-500">CGPA: {e.cgpa}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                    {data.certifications?.length > 0 && (
                        <section>
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Certifications</h2>
                            <div className="space-y-3">
                                {data.certifications.map((c, i) => (
                                    <div key={i} className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                                        <Award className="w-5 h-5 text-yellow-400 shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-white">{c.title}</p>
                                            <p className="text-xs text-slate-500">{c.issuer} · {c.year}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            {watermark && (
                <footer className="py-5 text-center border-t border-white/5">
                    <p className="text-xs text-slate-600">
                        Powered by <a href="/" className="text-blue-500 hover:text-blue-400 transition-colors">ResumeForge AI</a> — <a href="/#upgrade" className="text-slate-500 hover:text-slate-300 transition-colors">Upgrade to remove watermark</a>
                    </p>
                </footer>
            )}
        </div>
    );
}
