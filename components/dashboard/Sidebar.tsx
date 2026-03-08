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
    ShieldCheck
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const MENU_ITEMS = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Resumes', href: '/resumes', icon: FileText },
    { label: 'Career Roadmap', href: '/roadmap', icon: Compass },
    { label: 'Interview Data', href: '/interview-intelligence', icon: TrendingUp },
    { label: 'Job Alerts', href: '/job-alerts', icon: Bell },
    { label: 'Job Board', href: '/dashboard-jobs', icon: Briefcase },
    { label: 'AI Tools', href: '/tools', icon: Wrench },
    { label: 'Company Prep', href: '/company-prep-interview', icon: Building2 },
    { label: 'Mock Interview', href: '/mock-interview', icon: Mic },
    { label: 'My Portfolio', href: '/portfolio', icon: Globe },
    { label: 'Account', href: '/account', icon: User },
];

export function Sidebar({ isCollapsed, onToggle }: { isCollapsed: boolean, onToggle: () => void }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    const params = useParams() as { region: string; lang: string };
    const { region, lang } = params;
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

    const items = [...MENU_ITEMS];
    if (userRole === 'admin' || userRole === 'recruiter') {
        items.splice(1, 0, { label: 'Recruiter Hub', href: '/recruiter/dashboard', icon: ShieldCheck });
    }

    return (
        <aside
            className={`fixed left-0 top-20 h-[calc(100vh-5rem)] bg-[#070710]/80 backdrop-blur-xl border-r border-white/5 transition-all duration-500 z-40
                ${isCollapsed ? 'w-20' : 'w-64'} hidden md:flex flex-col`}
        >
            <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                {/* Improved Toggle at Top */}
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center p-3 mb-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group shadow-lg shadow-black/20"
                    title={isCollapsed ? "Expand View" : "Collapse View"}
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5 text-indigo-400" /> : <ChevronLeft className="w-5 h-5 text-indigo-400" />}
                    {!isCollapsed && <span className="ml-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Collapse Panel</span>}
                </button>

                {items.map((item) => {
                    const fullHref = item.href.startsWith('/recruiter') ? item.href : `/${region}/${lang}${item.href}`;
                    const isActive = pathname === fullHref;
                    return (
                        <Link
                            key={item.href}
                            href={fullHref}
                            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group
                                ${isActive
                                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 shrink-0 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                            {!isCollapsed && <span className="font-bold text-sm tracking-tight">{item.label}</span>}
                            {!isCollapsed && isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-white/5 space-y-2">
                <form action="/api/auth/signout" method="post">
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-rose-500/70 hover:text-rose-400 transition-colors group">
                        <LogOut className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                        {!isCollapsed && <span className="text-sm font-bold">Sign Out</span>}
                    </button>
                </form>
            </div>
        </aside>
    );
}

// Mobile Bottom Nav
export function MobileNav() {
    const pathname = usePathname();
    const params = useParams() as { region: string; lang: string };
    const { region, lang } = params;
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/user/profile')
            .then(r => r.json())
            .then(data => {
                if (data.success) setUserRole(data.user.role);
            })
            .catch(() => { });
    }, []);

    const items = [...MENU_ITEMS];
    if (userRole === 'admin' || userRole === 'recruiter') {
        items.splice(1, 0, { label: 'Recruit', href: '/recruiter/dashboard', icon: ShieldCheck });
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#070710]/90 backdrop-blur-xl border-t border-white/5 flex md:hidden items-center justify-around px-2 z-50">
            {items.slice(0, 5).map((item) => {
                const fullHref = item.href.startsWith('/recruiter') ? item.href : `/${region}/${lang}${item.href}`;
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
