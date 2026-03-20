'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    Briefcase,
    Building2,
    Wrench,
    User,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Mic,
    Globe,
    Compass,
    TrendingUp,
    Bell,
    ShieldCheck,
    HelpCircle,
    BookOpen,
    Code2,
    Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const MODULES = [
    {
        name: 'CareerForge',
        items: [
            { label: 'Career Roadmaps', href: '/careerforge/roadmaps', icon: Compass },
            { label: 'Learning Library', href: '/careerforge/library', icon: BookOpen },
        ]
    },
    {
        name: 'ResumeForge',
        items: [
            { label: 'Resume Builder', href: '/resumes', icon: FileText },
            { label: 'Templates', href: '/resumes', icon: LayoutDashboard },
        ]
    },
    {
        name: 'InterviewForge',
        items: [
            { label: 'Mock Interview', href: '/mock-interview', icon: Mic },
            { label: 'Interview Data', href: '/interview-intelligence', icon: TrendingUp },
        ]
    },
    {
        name: 'CompanyForge',
        items: [
            { label: 'Company Prep', href: '/company-prep-interview', icon: Building2 },
        ]
    },
    {
        name: 'CodingForge',
        items: [
            { label: 'Coding Practice', href: '/codingforge/app', icon: Code2 },
        ]
    },
    {
        name: 'ProjectForge',
        items: [
            { label: 'Project Generator', href: '/projectforge/app', icon: Zap },
        ]
    },
    {
        name: 'StudyForge',
        items: [
            { label: 'Study Assistant', href: '/studyforge/app', icon: BookOpen },
        ]
    },
    {
        name: 'JobForge',
        items: [
            { label: 'Job Board', href: '/dashboard-jobs', icon: Briefcase },
            { label: 'Job Alerts', href: '/job-alerts', icon: Bell },
        ]
    },
    {
        name: 'AI Tools',
        items: [
            { label: 'AI Tools', href: '/tools', icon: Wrench },
        ]
    },
    {
        name: 'Portfolio',
        items: [
            { label: 'My Portfolio', href: '/portfolio', icon: Globe },
        ]
    },
    {
        name: 'Account',
        items: [
            { label: 'Account', href: '/account', icon: User },
        ]
    }
];

export function Sidebar({ isCollapsed, onToggle }: { isCollapsed: boolean, onToggle: () => void }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    const params = useParams() as { locale: string };
    const { locale } = params;
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        // Fetch role to determine recruiter access
        fetch('/api/user/profile')
            .then(r => r.json())
            .then(data => {
                if (data.success) setUserRole(data.user.role);
            })
            .catch(() => { });
    }, []);

    if (!mounted) return null;

    const modules = [...MODULES];
    if (userRole === 'admin' || userRole === 'recruiter') {
        modules.splice(5, 0, {
            name: 'TalentForge',
            items: [{ label: 'Recruiter Hub', href: '/recruiter/dashboard', icon: ShieldCheck }]
        });
    }

    return (
        <aside
            className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-[#070710]/80 backdrop-blur-xl border-r border-white/5 transition-all duration-500 z-40
                ${isCollapsed ? 'w-20' : 'w-64'} hidden md:flex flex-col`}
        >
            <div className="flex-1 py-6 px-4 space-y-6 overflow-y-auto custom-scrollbar">
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group shadow-lg shadow-black/20"
                    title={isCollapsed ? "Expand View" : "Collapse View"}
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5 text-indigo-400" /> : <ChevronLeft className="w-5 h-5 text-indigo-400" />}
                    {!isCollapsed && <span className="ml-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Collapse</span>}
                </button>

                {modules.map((module) => (
                    <div key={module.name} className="space-y-1">
                        {!isCollapsed && (
                            <h3 className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">
                                {module.name}
                            </h3>
                        )}
                        <div className="space-y-1">
                            {module.items.map((item) => {
                                const fullHref = item.href.startsWith('/recruiter') ? item.href : `/${locale || 'en-in'}${item.href}`;
                                const isActive = pathname === fullHref;
                                return (
                                    <Link
                                        key={item.label}
                                        href={fullHref}
                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group
                                            ${isActive
                                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                                            }`}
                                    >
                                        <item.icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                        {!isCollapsed && <span className="font-bold text-xs tracking-tight">{item.label}</span>}
                                        {!isCollapsed && isActive && (
                                            <div className="ml-auto w-1 h-1 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-white/5 space-y-2 pb-6">
                {!isCollapsed && (
                    <div className="px-4 py-2 space-y-4 mb-4">
                        <div className="h-px w-full bg-white/5" />
                        <div className="space-y-3">
                            <Link href={`/${locale}/dashboard/support`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors">
                                <HelpCircle className="w-3.5 h-3.5" /> Help & Support
                            </Link>
                            <div className="flex gap-4">
                                <Link href={`/${locale}/privacy-policy`} className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-300 transition-colors">
                                    Privacy
                                </Link>
                                <Link href={`/${locale}/terms-of-service`} className="text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-300 transition-colors">
                                    Terms
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                <form action="/api/auth/signout" method="post">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl transition-all group">
                        <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.1em]">Sign Out</span>}
                    </button>
                </form>

                {!isCollapsed && (
                    <p className="px-4 pt-2 text-[8px] font-black text-slate-700 uppercase tracking-widest leading-tight">
                        Forge-v2.1.0 • Built for Pros
                    </p>
                )}
            </div>
        </aside>
    );
}

// Mobile Bottom Nav
export function MobileNav() {
    const pathname = usePathname();
    const params = useParams() as { locale: string };
    const { locale } = params;
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/user/profile')
            .then(r => r.json())
            .then(data => {
                if (data.success) setUserRole(data.user.role);
            })
            .catch(() => { });
    }, []);

    const flatItems = MODULES.flatMap(m => m.items);
    if (userRole === 'admin' || userRole === 'recruiter') {
        flatItems.splice(1, 0, { label: 'Recruit', href: '/recruiter/dashboard', icon: ShieldCheck });
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#070710]/90 backdrop-blur-xl border-t border-white/5 flex md:hidden items-center justify-around px-2 z-50">
            {flatItems.slice(0, 7).map((item) => {
                const fullHref = item.href.startsWith('/recruiter') ? item.href : `/${locale || 'en-in'}${item.href}`;
                const isActive = pathname === fullHref;
                return (
                    <Link
                        key={item.href}
                        href={fullHref}
                        className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}
                    >
                        <item.icon className={`w-5 h-5 ${isActive ? 'scale-110 shadow-indigo-500/50' : ''}`} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter Otros">{item.label.split(' ').pop()}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
