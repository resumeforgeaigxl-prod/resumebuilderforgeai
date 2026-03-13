'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, FileText, ScrollText, LayoutDashboard, Ticket, Menu, X, Globe, BrainCircuit, Activity, CreditCard, MessageSquareWarning, Briefcase, FileHeart, Receipt, LifeBuoy, Mic, Compass, TrendingUp, Bell, BookOpen } from 'lucide-react';

export default function AdminLayoutClient({ children, profile, locale }: { children: ReactNode, profile: { email: string }, locale: string }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    // Close mobile sidebar if window resizes to desktop to prevent state mismatches
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        { href: `/${locale}/admin`, label: 'Dashboard', icon: LayoutDashboard },
        { href: `/${locale}/admin/users`, label: 'Users', icon: Users },
        { href: `/${locale}/admin/resumes`, label: 'Resumes', icon: FileText },
        { href: `/${locale}/admin/roadmaps`, label: 'AI Roadmaps', icon: Compass },
        { href: `/${locale}/admin/interview-intelligence`, label: 'Interview Intel', icon: TrendingUp },
        { href: `/${locale}/admin/job-alerts`, label: 'Job Alerts', icon: Bell },
        { href: `/${locale}/admin/interviews`, label: 'Mock Interviews', icon: Mic },
        { href: `/${locale}/admin/company-prep`, label: 'Company Prep', icon: Shield },
        { href: `/${locale}/admin/mock-tests`, label: 'Mock Tests', icon: BrainCircuit },
        { href: `/${locale}/admin/jobs`, label: 'Jobs Monitor', icon: Briefcase },
        { href: `/${locale}/admin/job-sources`, label: 'Job Sources', icon: Shield },
        { href: `/${locale}/admin/portfolios`, label: 'Portfolios', icon: Globe },
        { href: `/${locale}/admin/resume-scores`, label: 'Resume Scores', icon: Activity },
        { href: `/${locale}/admin/downloads`, label: 'PDF Downloads', icon: FileText },
        { href: `/${locale}/admin/cover-letters`, label: 'Cover Letters', icon: FileHeart },
        { href: `/${locale}/admin/subscriptions`, label: 'Subscriptions', icon: CreditCard },
        { href: `/${locale}/admin/invoices`, label: 'Invoices', icon: Receipt },
        { href: `/${locale}/admin/support`, label: 'Support Tickets', icon: LifeBuoy },
        { href: `/${locale}/admin/coupons`, label: 'Coupons', icon: Ticket },
        { href: `/${locale}/admin/codingforge`, label: 'CodingForge AI', icon: BrainCircuit },
        { href: `/${locale}/admin/studyforge`, label: 'StudyForge AI', icon: BookOpen },
        { href: `/${locale}/admin/ai-monitoring`, label: 'JobForgeAI Monitor', icon: MessageSquareWarning },
        { href: `/${locale}/admin/logs`, label: 'Audit Logs', icon: ScrollText },
    ];

    return (
        <div className="min-h-screen bg-[#050508] text-slate-200 font-sans selection:bg-indigo-500/30 flex relative">
            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] md:hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-[70] 
                    bg-[#0a0a0f] border-r border-white/5 
                    flex flex-col transition-all duration-300 ease-in-out
                    w-64 ${isCollapsed ? 'md:w-20' : 'md:w-64'}
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                {/* Sidebar Header */}
                <div className={`h-16 flex items-center border-b border-white/5 overflow-hidden shrink-0 ${isCollapsed ? 'md:px-0 md:justify-center px-6' : 'px-6'}`}>
                    <div className={`flex items-center ${isCollapsed ? 'md:gap-0' : 'gap-3'}`}>
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className={`font-bold text-white tracking-tight text-lg transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'md:w-0 md:opacity-0' : 'opacity-100'}`}>
                            ResumeForge
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className={`px-4 py-2 text-[10px] text-slate-500 uppercase font-bold tracking-widest transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'md:h-0 md:opacity-0 md:py-0' : 'h-auto opacity-100'}`}>
                        General
                    </p>
                    {navItems.map((item) => {
                        const isActive = item.href === '/admin' ? pathname === item.href : pathname?.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                title={isCollapsed ? item.label : ''}
                                className={`
                                    flex items-center py-2.5 rounded-xl text-sm transition-all duration-200 group relative
                                    ${isActive
                                        ? 'bg-indigo-600/10 text-white font-semibold border border-indigo-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}
                                    px-3.5 ${isCollapsed ? 'md:px-0 md:justify-center gap-3 md:gap-0' : 'gap-3'}
                                `}
                            >
                                <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100 w-auto'}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className={`transition-all duration-300 shrink-0 ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] ${isCollapsed ? 'md:hidden' : ''}`} />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className={`p-4 border-t border-white/5 shrink-0 transition-all duration-300 ${isCollapsed ? 'md:p-2' : 'p-4'}`}>
                    <Link
                        href={`/${locale}/dashboard`}
                        title={isCollapsed ? 'Exit Admin' : ''}
                        className={`flex items-center py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-red-500/5 transition-all group overflow-hidden px-3.5 ${isCollapsed ? 'md:px-0 md:justify-center gap-3 md:gap-0' : 'gap-3'}`}
                    >
                        <X className="w-5 h-5 shrink-0 group-hover:rotate-90 transition-transform text-slate-500 group-hover:text-red-400" />
                        <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100 w-auto'}`}>
                            Exit Admin
                        </span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                {/* Top Navigation */}
                <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-4 py-2 sm:px-6 bg-[#050508]/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                if (window.innerWidth < 768) {
                                    setIsSidebarOpen(true);
                                } else {
                                    setIsCollapsed(!isCollapsed);
                                }
                            }}
                            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 flex"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-400">Admin</span>
                            <span className="text-slate-700">/</span>
                            <span className="text-sm font-semibold text-white capitalize">
                                {pathname?.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-tight">Admin</p>
                            <p className="text-xs text-slate-300 font-medium max-w-[150px] truncate">{profile.email}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/10 shrink-0">
                            {profile.email.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {children}
                    </div>
                </main>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
