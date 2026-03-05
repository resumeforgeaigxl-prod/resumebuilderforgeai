'use client';
import { useParams } from 'next/navigation';
import { Brain, Globe, MessageSquareWarning, Sparkles, Wrench, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const TOOLS = [
    {
        id: 'mock-interview',
        title: 'AI Mock Interview Test',
        description: 'Generate 50 role-specific questions from any job description. Practice Technical, Aptitude, Verbal, Logical & HR rounds.',
        icon: Brain,
        href: '/mock-interview',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        hoverBorder: 'hover:border-purple-400/40',
        gradient: 'from-purple-600/15 to-blue-600/15'
    },
    {
        id: 'portfolio',
        title: 'AI Portfolio Builder',
        description: 'Generate a professional, hosted portfolio website instantly from your resume. Personalize themes and share with recruiters.',
        icon: Globe,
        href: '/portfolio',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        hoverBorder: 'hover:border-emerald-400/40',
        gradient: 'from-emerald-600/15 to-teal-600/15'
    },
    {
        id: 'jobforge',
        title: 'JobForgeAI Assistant',
        description: 'Your strict AI coach for resume optimization, technical problem solving, and intensive interview preparation.',
        icon: MessageSquareWarning,
        href: '/jobforgeai',
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        hoverBorder: 'hover:border-orange-400/40',
        gradient: 'from-orange-600/15 to-red-600/15'
    }
];

export default function ToolsPage() {
    const params = useParams() as { region: string; lang: string };
    const { region, lang } = params;

    return (
        <div className="space-y-12 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <Wrench className="w-10 h-10 text-indigo-500" />
                        AI Tools
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium">Power up your career with AI-driven preparation and tools</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {TOOLS.map((tool) => (
                    <Link key={tool.id} href={`/${region}/${lang}${tool.href}`} className="group flex flex-col h-full bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 hover:bg-slate-900/60 transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                        {/* Background Glow */}
                        <div className={`absolute -bottom-12 -right-12 w-32 h-32 blur-[60px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-40 rounded-full bg-current ${tool.color}`} />

                        <div className={`w-16 h-16 rounded-3xl ${tool.bg} border ${tool.border} flex items-center justify-center mb-8 shrink-0 group-hover:scale-110 transition-transform duration-500`}>
                            <tool.icon className={`w-8 h-8 ${tool.color}`} />
                        </div>

                        <div className="flex-1 space-y-4">
                            <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight">{tool.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed pb-6 min-h-[5rem]">
                                {tool.description}
                            </p>
                        </div>

                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                            <span className={`text-xs font-black uppercase tracking-widest ${tool.color}`}>Open Tool</span>
                            <div className={`w-10 h-10 rounded-full ${tool.bg} border ${tool.border} flex items-center justify-center group-hover:translate-x-1 transition-transform`}>
                                <ArrowRight className={`w-5 h-5 ${tool.color}`} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Additional Info / Feature coming soon */}
            <div className="p-12 text-center rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 backdrop-blur-sm relative overflow-hidden group">
                <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4 animate-pulse" />
                <h4 className="text-xl font-bold text-white mb-2">More AI power on the way</h4>
                <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">We&apos;re constantly building new tools to help you land your dream job faster. Stay tuned!</p>

                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles className="w-32 h-32 text-indigo-400" />
                </div>
            </div>
        </div>
    );
}
