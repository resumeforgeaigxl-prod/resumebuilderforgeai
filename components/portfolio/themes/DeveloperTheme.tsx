'use client';
import { PortfolioData } from '@/types/portfolio';
import { Github, ExternalLink, Mail, Terminal, Cpu, Database, Globe, Linkedin, Download } from 'lucide-react';

interface Props { data: PortfolioData; watermark?: boolean; }

export default function DeveloperTheme({ data, watermark = false }: Props) {
    const handleDownload = () => window.print();

    return (
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-['JetBrains_Mono',monospace]">
            <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

            {/* Terminal-style header */}
            <header className="border-b border-[#30363d] bg-[#161b22]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                        <span className="ml-2 text-xs text-[#8b949e]">portfolio.sh</span>
                    </div>
                    <div className="space-y-1 font-[monospace]">
                        <p className="text-[#8b949e] text-sm"><span className="text-[#58a6ff]">$</span> whoami</p>
                        <h1 className="text-3xl font-bold text-[#e6edf3]">{data.name}</h1>
                        <p className="text-sm"><span className="text-[#8b949e]">// </span><span className="text-[#3fb950]">{data.headline}</span></p>
                    </div>
                    <p className="mt-4 text-[#8b949e] text-sm leading-relaxed max-w-2xl font-['Inter',sans-serif]">{data.about}</p>
                    <div className="flex flex-wrap gap-4 mt-6">
                        {data.email && <a href={`mailto:${data.email}`} className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#58a6ff] transition-colors"><Mail className="w-3.5 h-3.5" />{data.email}</a>}
                        {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#e6edf3] transition-colors"><Github className="w-3.5 h-3.5" />GitHub</a>}
                        {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#58a6ff] transition-colors"><Linkedin className="w-3.5 h-3.5" />LinkedIn</a>}
                        {data.website && <a href={data.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-[#3fb950] transition-colors"><Globe className="w-3.5 h-3.5" />Website</a>}
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">
                        {data.email && (
                            <a href={`mailto:${data.email}`} className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md text-sm font-semibold transition-colors border border-[#rgba(240,246,252,0.1)]">
                                <Mail className="w-4 h-4" /> Contact Me
                            </a>
                        )}
                        <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded-md text-sm font-semibold transition-colors border border-[#rgba(240,246,252,0.1)]">
                            <Download className="w-4 h-4" /> Download Resume
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 sm:space-y-14">
                {/* Skills */}
                {data.skills?.length > 0 && (
                    <section>
                        <p className="text-[#8b949e] text-xs mb-4"><span className="text-[#58a6ff]">const</span> <span className="text-[#e6edf3]">skills</span> <span className="text-[#8b949e]">=</span> <span className="text-[#3fb950]">[</span></p>
                        <div className="flex flex-wrap gap-2 pl-4">
                            {data.skills.map((s, i) => (
                                <span key={i} className="px-3 py-1 bg-[#1f2937] border border-[#30363d] text-[#58a6ff] text-xs rounded font-mono cursor-default hover:border-[#58a6ff] transition-colors">
                                    {`'${s}'`}
                                </span>
                            ))}
                        </div>
                        <p className="text-[#3fb950] text-xs mt-2">]</p>
                    </section>
                )}

                {/* Projects */}
                {data.projects?.length > 0 && (
                    <section>
                        <p className="text-[#8b949e] text-xs mb-6"><span className="text-[#ff7b72]">function</span> <span className="text-[#d2a8ff]">projects</span>() {'{'}</p>
                        <div className="grid sm:grid-cols-2 gap-4 pl-4">
                            {data.projects.map((p, i) => (
                                <div key={i} className="p-5 bg-[#161b22] border border-[#30363d] rounded-xl hover:border-[#58a6ff]/50 transition-all group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2"><Database className="w-3.5 h-3.5 text-[#3fb950]" /><h3 className="font-bold text-[#e6edf3]">{p.title}</h3></div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" className="text-[#8b949e] hover:text-[#e6edf3]"><Github className="w-3.5 h-3.5" /></a>}
                                            {p.live && <a href={p.live} target="_blank" rel="noopener noreferrer" className="text-[#8b949e] hover:text-[#58a6ff]"><ExternalLink className="w-3.5 h-3.5" /></a>}
                                        </div>
                                    </div>
                                    <p className="text-xs text-[#8b949e] mb-3 font-['Inter',sans-serif]">{p.description}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {p.tech?.map((t, j) => <span key={j} className="text-xs px-2 py-0.5 bg-[#388bfd1a] border border-[#388bfd33] text-[#58a6ff] rounded">{t}</span>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-[#8b949e] text-xs mt-4">{'}'}</p>
                    </section>
                )}

                {/* Experience */}
                {data.experience?.length > 0 && (
                    <section>
                        <p className="text-[#8b949e] text-xs mb-6"><span className="text-[#ff7b72]">class</span> <span className="text-[#d2a8ff]">Experience</span> {'{'}</p>
                        <div className="space-y-6 pl-4">
                            {data.experience.map((exp, i) => (
                                <div key={i} className="border-l-2 border-[#30363d] pl-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-bold text-[#e6edf3]">{exp.role}</p>
                                            <p className="text-[#3fb950] text-sm">{exp.company}</p>
                                        </div>
                                        <span className="text-xs text-[#8b949e] font-mono shrink-0 ml-4">{exp.duration}</span>
                                    </div>
                                    <ul className="mt-2 space-y-1">
                                        {exp.points?.map((pt, j) => <li key={j} className="text-sm text-[#8b949e] font-['Inter',sans-serif] flex gap-2"><span className="text-[#3fb950] shrink-0">›</span>{pt}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <p className="text-[#8b949e] text-xs mt-4">{'}'}</p>
                    </section>
                )}

                {/* Education */}
                {data.education?.length > 0 && (
                    <section>
                        <p className="text-xs text-[#8b949e] mb-4"><span className="text-[#ff7b72]">import</span> <span className="text-[#58a6ff]">Education</span> <span className="text-[#8b949e]">from</span> <span className="text-[#a5d6ff]">&ldquo;university&rdquo;</span></p>
                        <div className="space-y-4 pl-4">
                            {data.education.map((e, i) => (
                                <div key={i} className="flex justify-between items-start py-3 border-b border-[#21262d]">
                                    <div>
                                        <p className="font-bold text-[#e6edf3]">{e.degree}</p>
                                        <p className="text-[#58a6ff] text-sm">{e.school}</p>
                                        {e.cgpa && <p className="text-xs text-[#8b949e]">{e.cgpa} CGPA</p>}
                                    </div>
                                    <span className="text-xs text-[#8b949e] font-mono">{e.duration}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Certs */}
                {data.certifications?.length > 0 && (
                    <section>
                        <p className="text-xs text-[#8b949e] mb-4"><span className="text-[#ff7b72]">const</span> <span className="text-[#e6edf3]">certifications</span> <span className="text-[#8b949e]">:</span> <span className="text-[#d2a8ff]">Badge[]</span> <span className="text-[#8b949e]">=</span></p>
                        <div className="grid sm:grid-cols-2 gap-3 pl-4">
                            {data.certifications.map((c, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-[#161b22] border border-[#30363d] rounded-lg">
                                    <Cpu className="w-4 h-4 text-[#3fb950] shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-[#e6edf3]">{c.title}</p>
                                        <p className="text-xs text-[#8b949e]">{c.issuer} · {c.year}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {watermark && (
                <footer className="py-4 text-center text-xs text-[#8b949e] border-t border-[#30363d] font-mono">
                    <span className="text-[#8b949e]">// Built with </span><a href="/" className="text-[#58a6ff] hover:underline">ResumeForge AI</a><span className="text-[#8b949e]"> — upgrade to remove watermark</span>
                </footer>
            )}
        </div>
    );
}
