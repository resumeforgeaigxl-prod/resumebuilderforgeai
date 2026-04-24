'use client'
export const dynamic = 'force-dynamic';
;
import { useParams } from 'next/navigation';
import { Brain, Globe, MessageSquareWarning, Sparkles, Wrench, ArrowRight, Code2, Building2 } from 'lucide-react';
import Link from 'next/link';

const TOOLS = [
    {
        id: 'mock-interview',
        title: 'InterviewForge Mock Test',
        description: 'Practice high-stakes technical and behavioral interviews with real-time AI feedback.',
        icon: Brain,
        href: '/mock-interview',
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        hoverBorder: 'hover:border-purple-400/40',
        gradient: 'from-purple-600/15 to-blue-600/15'
    },
    {
        id: 'mock-test',
        title: 'InterviewForge JD-Based Test',
        description: 'Generate 50+ role-specific MCQs and aptitude questions from any job description.',
        icon: Sparkles,
        href: '/mock-test',
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        hoverBorder: 'hover:border-blue-400/40',
        gradient: 'from-blue-600/15 to-indigo-600/15'
    },
    {
        id: 'portfolio',
        title: 'PortfolioForge Builder',
        description: 'Instantly convert your resume into a premium, hosted web portfolio with custom themes.',
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
        title: 'JobForge AI Assistant',
        description: 'Your strict AI career coach for optimization, problem solving, and preparation.',
        icon: MessageSquareWarning,
        href: '/jobforgeai',
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/20',
        hoverBorder: 'hover:border-orange-400/40',
        gradient: 'from-orange-600/15 to-red-600/15'
    },
    {
        id: 'codingforge',
        title: 'CodingForge Integrated IDE',
        description: 'Master data structures and algorithms in an integrated Monaco-powered environment.',
        icon: Code2,
        href: '/codingforge',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
        hoverBorder: 'hover:border-blue-400/40',
        gradient: 'from-blue-600/15 to-cyan-600/15'
    },
    {
        id: 'companyprep',
        title: 'AI Company Prep Interview',
        description: 'Generate intelligence reports for target companies and practice realistic mock interviews.',
        icon: Building2,
        href: '/company-prep-interview',
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/20',
        hoverBorder: 'hover:border-indigo-400/40',
        gradient: 'from-indigo-600/15 to-blue-600/15'
    },
    {
        id: 'explainforge',
        title: 'ExplainForge AI',
        description: 'Human-style project explanation engine & professional documentation generator.',
        icon: Sparkles,
        href: '/explainforge',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        hoverBorder: 'hover:border-emerald-400/40',
        gradient: 'from-emerald-600/15 to-teal-600/15'
    }
];

export default function ToolsPage() {
    const params = useParams() as { locale: string };
    const { locale } = params;

    return (
        <div className="space-y-12 max-w-7xl mx-auto pb-20">
            <header>
                <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-[10px] uppercase mb-4">
                    <Wrench className="w-3.5 h-3.5" /> Platform Utilities
                </div>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
                    Power Up Tools
                </h1>
                <p className="text-slate-400 mt-2 text-lg">Specialized modules to accelerate your career trajectory.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {TOOLS.map((tool) => (
                    <Link 
                        key={tool.id} 
                        href={`/${locale}${tool.href}`} 
                        className="glass-card p-10 group flex flex-col h-full hover:-translate-y-2"
                    >
                        <div className={`w-16 h-16 rounded-2xl ${tool.bg} border ${tool.border} flex items-center justify-center mb-8 shrink-0 group-hover:scale-110 transition-transform`}>
                            <tool.icon className={`w-8 h-8 ${tool.color}`} />
                        </div>

                        <div className="flex-1 space-y-4">
                            <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors tracking-tight">
                                {tool.title}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {tool.description}
                            </p>
                        </div>

                        <div className="pt-8 mt-8 border-t border-white/5 flex items-center justify-between">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${tool.color}`}>Initialize Module</span>
                            <ArrowRight className={`w-5 h-5 ${tool.color} group-hover:translate-x-1 transition-transform`} />
                        </div>
                    </Link>
                ))}
            </div>

            <div className="p-16 text-center glass-card border-none bg-indigo-500/[0.02] relative overflow-hidden">
                <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-6 animate-pulse" />
                <h4 className="text-2xl font-bold text-white mb-2">Expanding the Forge</h4>
                <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                    We&apos;re constantly engineering new modules to give you an unfair advantage in the market. 
                    Upcoming: AI Salary Negotiator & System Design Forge.
                </p>
            </div>
        </div>
    );
}
