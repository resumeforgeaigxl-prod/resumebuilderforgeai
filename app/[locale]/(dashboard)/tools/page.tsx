'use client'
export const dynamic = 'force-dynamic';

import { useParams } from 'next/navigation';
import { Brain, Globe, MessageSquareWarning, Wrench, ArrowRight, Code2, Building2 , Wand2 } from 'lucide-react';
import Link from 'next/link';

const TOOLS = [
    {
        id: 'mock-interview',
        title: 'InterviewForge Mock Test',
        description: 'Practice high-stakes technical and behavioral interviews with real-time AI feedback.',
        icon: Brain,
        href: '/mock-interview',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-100',
        hoverBorder: 'hover:border-purple-300'
    },
    {
        id: 'mock-test',
        title: 'InterviewForge JD-Based Test',
        description: 'Generate 50+ role-specific MCQs and aptitude questions from any job description.',
        icon: Wand2,
        href: '/mock-test',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        hoverBorder: 'hover:border-blue-300'
    },
    {
        id: 'portfolio',
        title: 'PortfolioForge Builder',
        description: 'Instantly convert your resume into a premium, hosted web portfolio with custom themes.',
        icon: Globe,
        href: '/portfolio',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        hoverBorder: 'hover:border-emerald-300'
    },
    {
        id: 'jobforge',
        title: 'JobForge AI Assistant',
        description: 'Your strict AI career coach for optimization, problem solving, and preparation.',
        icon: MessageSquareWarning,
        href: '/jobforgeai',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-100',
        hoverBorder: 'hover:border-orange-300'
    },
    {
        id: 'codingforge',
        title: 'CodingForge Integrated IDE',
        description: 'Master data structures and algorithms in an integrated Monaco-powered environment.',
        icon: Code2,
        href: '/codingforge',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        hoverBorder: 'hover:border-blue-300'
    },
    {
        id: 'companyprep',
        title: 'AI Company Prep Interview',
        description: 'Generate intelligence reports for target companies and practice realistic mock interviews.',
        icon: Building2,
        href: '/company-prep-interview',
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-100',
        hoverBorder: 'hover:border-indigo-300'
    },
    {
        id: 'explainforge',
        title: 'ExplainForge AI',
        description: 'Human-style project explanation engine & professional documentation generator.',
        icon: Wand2,
        href: '/explainforge',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        hoverBorder: 'hover:border-emerald-300'
    }
];

export default function ToolsPage() {
    const params = useParams() as { locale: string };
    const { locale } = params;

    return (
        <div className="space-y-12 max-w-7xl mx-auto pb-20 text-[#171717] animate-premium-in">
            <header className="border-b border-[#EBEBEB] pb-8 mb-12">
                <div className="flex items-center gap-2 text-[#8F8F8F] font-bold tracking-wider text-[10px] uppercase mb-3 font-mono">
                    <Wrench className="w-3.5 h-3.5 text-[#171717]" /> Platform Utilities
                </div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#171717]">
                    Power Up Tools
                </h1>
                <p className="text-[#4D4D4D] mt-2 text-sm md:text-base">Specialized modules to accelerate your career trajectory.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {TOOLS.map((tool) => (
                    <Link 
                        key={tool.id} 
                        href={`/${locale}${tool.href}`} 
                        className="bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl p-8 group flex flex-col h-full hover:border-[#171717]/25 transition-all shadow-sm"
                    >
                        <div className={`w-14 h-14 rounded-xl ${tool.bg} border ${tool.border} flex items-center justify-center mb-6 shrink-0 group-hover:scale-105 transition-transform`}>
                            <tool.icon className={`w-6 h-6 ${tool.color}`} />
                        </div>

                        <div className="flex-1 space-y-2">
                            <h3 className="text-base font-semibold text-[#171717] transition-colors tracking-tight">
                                {tool.title}
                            </h3>
                            <p className="text-[#4D4D4D] text-xs leading-relaxed">
                                {tool.description}
                            </p>
                        </div>

                        <div className="pt-6 mt-6 border-t border-[#EBEBEB] flex items-center justify-between">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${tool.color}`}>Initialize Module</span>
                            <ArrowRight className={`w-4 h-4 ${tool.color} group-hover:translate-x-1 transition-transform`} />
                        </div>
                    </Link>
                ))}
            </div>

            <div className="p-12 text-center bg-[#FFFFFF] border border-[#EBEBEB] rounded-xl shadow-sm relative overflow-hidden">
                <Wand2 className="w-10 h-10 text-[#171717] mx-auto mb-4" />
                <h4 className="text-base font-semibold text-[#171717] mb-2">Expanding the Forge</h4>
                <p className="text-[#4D4D4D] text-xs max-w-sm mx-auto leading-relaxed">
                    We&apos;re constantly engineering new modules to give you an unfair advantage in the market. 
                    Upcoming: AI Salary Negotiator & System Design Forge.
                </p>
            </div>
        </div>
    );
}
