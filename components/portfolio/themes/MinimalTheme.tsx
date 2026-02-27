'use client';
import { useState } from 'react';
import { PortfolioData } from '@/types/portfolio';
import { Github, ExternalLink, Mail, Phone, Linkedin, Download, Moon, Sun } from 'lucide-react';

interface Props { data: PortfolioData; watermark?: boolean; }

export default function MinimalTheme({ data, watermark = false }: Props) {
    const [isDark, setIsDark] = useState(false);

    const handleDownload = () => {
        window.print();
    };

    return (
        <div className={`min-h-screen font-[Inter,system-ui,sans-serif] transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>

            {/* Theme Toggle */}
            <button
                onClick={() => setIsDark(!isDark)}
                className={`fixed top-6 right-6 p-2 rounded-full backdrop-blur-md z-50 transition-colors ${isDark ? 'bg-white/10 hover:bg-white/20 text-yellow-400' : 'bg-black/5 hover:bg-black/10 text-gray-600'}`}
            >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Hero */}
            <header className={`border-b ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50'}`}>
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                    <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{data.name}</h1>
                    <p className={`text-lg sm:text-xl font-medium mb-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{data.headline}</p>
                    <p className={`leading-relaxed max-w-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{data.about}</p>

                    <div className="flex flex-wrap gap-4 mt-8">
                        {data.email && (
                            <a href={`mailto:${data.email}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
                                <Mail className="w-4 h-4" /> Contact Me
                            </a>
                        )}
                        <button onClick={handleDownload} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors border ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-200' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'}`}>
                            <Download className="w-4 h-4" /> Download Resume
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-6 mt-8">
                        {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}><Github className="w-4 h-4" />GitHub</a>}
                        {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-1.5 text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'}`}><Linkedin className="w-4 h-4" />LinkedIn</a>}
                        {data.phone && <a href={`tel:${data.phone}`} className={`flex items-center gap-1.5 text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}><Phone className="w-4 h-4" />{data.phone}</a>}
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 sm:space-y-14">
                {/* Skills */}
                {data.skills?.length > 0 && (
                    <section>
                        <h2 className={`text-sm font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Skills</h2>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.map((s, i) => (
                                <span key={i} className={`px-3 py-1 text-sm rounded-full ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{s}</span>
                            ))}
                        </div>
                    </section>
                )}
                {/* Experience */}
                {data.experience?.length > 0 && (
                    <section>
                        <h2 className={`text-sm font-bold uppercase tracking-widest mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Experience</h2>
                        <div className="space-y-8">
                            {data.experience.map((exp, i) => (
                                <div key={i} className={`border-l-2 pl-5 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                                    <div className="flex items-start justify-between mb-1">
                                        <div>
                                            <p className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{exp.role}</p>
                                            <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{exp.company}</p>
                                        </div>
                                        <span className={`text-xs shrink-0 ml-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{exp.duration}</span>
                                    </div>
                                    <ul className="mt-2 space-y-1">
                                        {exp.points?.map((p, j) => <li key={j} className={`text-sm flex gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}><span className={`${isDark ? 'text-gray-600' : 'text-gray-300'} mt-1`}>–</span>{p}</li>)}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                {/* Projects */}
                {data.projects?.length > 0 && (
                    <section>
                        <h2 className={`text-sm font-bold uppercase tracking-widest mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Projects</h2>
                        <div className="grid sm:grid-cols-2 gap-5">
                            {data.projects.map((p, i) => (
                                <div key={i} className={`p-5 border rounded-xl transition-all ${isDark ? 'border-gray-800 hover:border-gray-700 hover:bg-gray-800/50' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{p.title}</h3>
                                        <div className="flex gap-2">
                                            {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" className={`hover:text-gray-700 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400'}`}><Github className="w-4 h-4" /></a>}
                                            {p.live && <a href={p.live} target="_blank" rel="noopener noreferrer" className={`hover:text-blue-600 ${isDark ? 'text-gray-500 hover:text-blue-400' : 'text-gray-400'}`}><ExternalLink className="w-4 h-4" /></a>}
                                        </div>
                                    </div>
                                    <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{p.description}</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {p.tech?.map((t, j) => <span key={j} className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>{t}</span>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                {/* Education */}
                {data.education?.length > 0 && (
                    <section>
                        <h2 className={`text-sm font-bold uppercase tracking-widest mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Education</h2>
                        <div className="space-y-4">
                            {data.education.map((e, i) => (
                                <div key={i} className="flex items-start justify-between">
                                    <div>
                                        <p className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{e.degree}</p>
                                        <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{e.school}</p>
                                        {e.cgpa && <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>CGPA: {e.cgpa}</p>}
                                    </div>
                                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{e.duration}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                {/* Certifications */}
                {data.certifications?.length > 0 && (
                    <section>
                        <h2 className={`text-sm font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Certifications</h2>
                        <div className="space-y-2">
                            {data.certifications.map((c, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0" />
                                    <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{c.title}</span>
                                    <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>· {c.issuer} · {c.year}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* Watermark footer */}
            {watermark && (
                <footer className={`py-8 text-center text-xs border-t ${isDark ? 'text-gray-500 border-gray-800' : 'text-gray-400 border-gray-100'}`}>
                    <p className="opacity-60 mb-1">Built with ResumeForge AI</p>
                    <a href="/" className="text-blue-500 font-medium hover:underline">Upgrade to Pro to remove this watermark</a>
                </footer>
            )}
            {!watermark && (
                <footer className={`py-4 text-center text-xs border-t ${isDark ? 'text-gray-700 border-gray-800' : 'text-gray-300 border-gray-50'}`}>
                    Built with <a href="/" className={`transition-colors ${isDark ? 'hover:text-blue-400' : 'hover:text-blue-400'}`}>ResumeForge AI</a>
                </footer>
            )}
        </div>
    );
}
