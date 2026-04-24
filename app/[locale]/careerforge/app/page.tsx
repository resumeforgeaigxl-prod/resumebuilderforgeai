export const dynamic = 'force-dynamic';
import { Compass, BookOpen, GraduationCap, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CareerForgeHub({ params }: { params: { locale: string } }) {
    const { locale } = params;

    const sections = [
        {
            id: 'roadmaps',
            title: 'Career Roadmaps',
            description: "Professionally curated and AI-generated roadmap timelines tailored for the world's most in-demand technical roles.",
            icon: Compass,
            color: 'from-indigo-500 to-blue-600',
            href: `/${locale}/careerforge/roadmaps`,
            badge: 'Structured Guidance',
            features: ['Industry-Curated Paths', 'AI Roadmap Access', 'Skill-to-Topic Links']
        },
        {
            id: 'library',
            title: 'Learning Library',
            description: 'A documentation-style programming library with AI-generated topic content and structured learning sequences.',
            icon: BookOpen,
            color: 'from-purple-500 to-indigo-600',
            href: `/${locale}/careerforge/library`,
            badge: 'Deep Learning',
            features: ['8 Core Languages', 'Ordered Topic Paths', 'Reusable AI Topic Content']
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-16 py-12 px-6 pt-32 pb-32">
            {/* Hub Hero */}
            <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Career Acceleration Hub</span>
                </div>
                <h1 className="text-7xl font-black text-white leading-none uppercase tracking-tighter">
                    Career<span className="text-indigo-500">Forge</span>
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                    Two focused systems: structured <span className="text-white">Career Roadmaps</span> and a deep <span className="text-white">Learning Library</span> for programming mastery.
                </p>
            </div>

            {/* Hub Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {sections.map((section) => (
                    <Link
                        key={section.id}
                        href={section.href}
                        className="group relative p-12 rounded-[3.5rem] bg-[#0a0a16] border border-white/5 hover:border-indigo-500/30 transition-all duration-700 overflow-hidden flex flex-col h-full hover:translate-y-[-8px] hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)]"
                    >
                        {/* Interactive Background Elements */}
                        <div className={`absolute -bottom-24 -right-24 w-80 h-80 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-10 rounded-full blur-[100px] transition-opacity duration-1000`}></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-12">
                                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${section.color} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-700`}>
                                    <section.icon className="w-10 h-10 text-white" />
                                </div>
                                <div className="px-5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">
                                    {section.badge}
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter group-hover:text-indigo-400 transition-colors leading-none">
                                    {section.title}
                                </h3>
                                <p className="text-lg text-slate-500 font-medium mb-12 leading-relaxed h-20 group-hover:text-slate-400 transition-colors">
                                    {section.description}
                                </p>

                                <ul className="space-y-4 mb-12">
                                    {section.features.map(f => (
                                        <li key={f} className="flex items-center gap-3 text-sm font-bold text-slate-600 transition-all group-hover:translate-x-1 group-hover:text-slate-300">
                                            <Zap className="w-4 h-4 text-indigo-500/50 group-hover:text-indigo-400" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                <span className="text-[12px] font-black text-indigo-400 uppercase tracking-[0.3em] group-hover:tracking-[0.4em] transition-all">Launch Module</span>
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-300 shadow-lg">
                                    <ArrowRight className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Trust Footer */}
            <div className="flex flex-col items-center gap-8 pt-12 border-t border-white/5">
                <div className="flex items-center gap-3 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    <GraduationCap className="w-4 h-4" /> Trusted by Professional Engineers Worldwide
                </div>
            </div>
        </div>
    );
}
