'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, ShieldCheck, Target, Users, FileText, ScrollText, LayoutDashboard, Ticket, Menu, X, Globe, BrainCircuit, Activity, CreditCard, MessageSquareWarning, Briefcase, FileHeart, Receipt, LifeBuoy, Mic, Compass, TrendingUp, Bell, BookOpen, Video, BookOpenCheck, Bot, GraduationCap , Wand2 } from 'lucide-react';

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
        { href: `/${locale}/admin/analytics`, label: 'User Analytics', icon: Activity },
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
        { href: `/${locale}/admin/job-collector`, label: 'Job Collector', icon: Target },
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
        { href: `/${locale}/admin/explainforge`, label: 'ExplainForge AI', icon: Wand2 },
        { href: `/${locale}/admin/ai-monitoring`, label: 'AI Neural Monitor', icon: MessageSquareWarning },
        { href: `/${locale}/admin/learnforge`, label: 'LearnForge Library', icon: BookOpen },
        { href: `/${locale}/admin/demo-studio`, label: 'Demo Studio', icon: Video },
        { href: `/${locale}/admin/mentorforge`, label: 'MentorForge AI', icon: Bot },
        { href: `/${locale}/admin/knowledge-runner`, label: 'KnowledgeForge AI', icon: GraduationCap },
        { href: `/${locale}/admin/posts`, label: 'Platform Posts', icon: LayoutDashboard },
        { href: `/${locale}/admin/knowledge`, label: 'Knowledge SEO', icon: BookOpenCheck },
        { href: `/${locale}/admin/waitlist`, label: 'Launch Waitlist', icon: Users },
        { href: `/${locale}/admin/forges`, label: 'Forge Hub', icon: ShieldCheck },
        { href: `/${locale}/admin/logs`, label: 'Audit Logs', icon: ScrollText },
    ];

    return (
        <div className="admin-container min-h-screen bg-[#FAFAFA] text-[#171717] font-sans selection:bg-indigo-100 selection:text-indigo-900 flex relative">
            {/* Mobile Sidebar Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-[70] 
                    bg-white border-r border-[#EBEBEB] 
                    flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
                    w-72 ${isCollapsed ? 'md:w-20' : 'md:w-72'}
                    ${isSidebarOpen ? 'translate-x-0 shadow-[20px_0_100px_rgba(0,0,0,0.05)]' : '-translate-x-full md:translate-x-0'}
                `}
            >
                {/* Sidebar Header */}
                <div className={`h-16 flex items-center border-b border-[#EBEBEB] overflow-hidden shrink-0 ${isCollapsed ? 'md:px-0 md:justify-center px-4' : 'px-6'}`}>
                    {!isCollapsed ? (
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded-full bg-[#171717] flex items-center justify-center text-[#171717] font-semibold text-xs shrink-0">
                                RF
                            </div>
                            <span className="font-semibold text-sm tracking-tight text-[#171717] whitespace-nowrap">
                                ResumeForge AI <span className="text-[10px] text-[#4D4D4D] bg-[#F2F2F2] border border-[#EBEBEB] rounded-[4px] px-1.5 py-0.5 ml-1.5 font-mono font-medium uppercase tracking-wider">Admin</span>
                            </span>
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-[#171717] flex items-center justify-center text-[#171717] font-semibold text-xs">
                            RF
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar">
                    <p className={`px-4 py-2 text-[10px] text-[#8F8F8F] uppercase font-medium tracking-normal font-mono transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'md:h-0 md:opacity-0 md:py-0' : 'h-auto opacity-100'}`}>
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
                                    flex items-center py-2 rounded-[6px] text-sm transition-all duration-200 group relative
                                    ${isActive
                                        ? 'bg-neutral-100 text-[#171717] font-medium tracking-[-0.28px]'
                                        : 'text-[#4D4D4D] hover:text-[#171717] hover:bg-neutral-100/50'}
                                    px-4 ${isCollapsed ? 'md:px-0 md:justify-center gap-3 md:gap-0' : 'gap-3'}
                                `}
                            >
                                <item.icon className={`w-4 h-4 shrink-0 transition-colors duration-200 ${isActive ? 'text-[#171717]' : 'text-[#8F8F8F] group-hover:text-[#4D4D4D]'}`} />
                                <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100 w-auto'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className={`p-4 border-t border-[#EBEBEB] shrink-0 transition-all duration-300 ${isCollapsed ? 'md:p-2' : 'p-4'}`}>
                    <Link
                        href={`/${locale}/dashboard`}
                        title={isCollapsed ? 'Exit Admin' : ''}
                        className={`flex items-center py-2 rounded-[6px] text-sm text-[#4D4D4D] hover:text-[#EE0000] hover:bg-red-50/50 transition-all group overflow-hidden px-3.5 ${isCollapsed ? 'md:px-0 md:justify-center gap-3 md:gap-0' : 'gap-3'}`}
                    >
                        <X className="w-4 h-4 shrink-0 group-hover:rotate-90 transition-transform text-[#8F8F8F] group-hover:text-[#EE0000]" />
                        <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'md:opacity-0 md:w-0' : 'opacity-100 w-auto'}`}>
                            Exit Admin
                        </span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isCollapsed ? 'md:ml-20' : 'md:ml-72'}`}>
                {/* Top Navigation */}
                <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-4 py-2 sm:px-8 bg-white/80 backdrop-blur-md border-b border-[#EBEBEB] transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                if (window.innerWidth < 768) {
                                    setIsSidebarOpen(true);
                                } else {
                                    setIsCollapsed(!isCollapsed);
                                }
                            }}
                            className="p-2 rounded-[6px] bg-white text-[#4D4D4D] hover:text-[#171717] hover:bg-neutral-50 border border-[#EBEBEB] transition-all active:scale-95 flex"
                        >
                            <Menu className="w-4 h-4" />
                        </button>
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="text-xs font-medium tracking-normal text-[#8F8F8F] font-mono">Admin</span>
                            <span className="text-[#EBEBEB]">/</span>
                            <span className="text-xs font-medium tracking-normal text-[#171717] font-mono capitalize">
                                {pathname?.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <p className="text-[9px] text-[#8F8F8F] uppercase font-bold tracking-widest leading-tight font-mono">Governing Authority</p>
                            <p className="text-xs text-[#666666] font-medium max-w-[150px] truncate">{profile?.email || 'Admin'}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-neutral-100 border border-[#EBEBEB] flex items-center justify-center text-[#171717] font-bold text-xs shrink-0">
                            {profile?.email?.charAt(0).toUpperCase() || 'A'}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-5 md:p-8 max-w-[1600px] w-full mx-auto">
                    <div className="animate-premium-in">
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
                    background: #EBEBEB;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #D8D8D8;
                }

                /* ==========================================================================
                   Vercel light theme (Geist System) global overrides for inside admin pages
                   ========================================================================== */

                /* Main table and card containers */
                .admin-container .bg-white\/5,
                .admin-container .bg-white\/\[0\.02\],
                .admin-container .bg-white\/\[0\.01\],
                .admin-container .bg-white\/2,
                .admin-container .glass-card {
                    background-color: #ffffff !important;
                    border-color: #ebebeb !important;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.02) !important;
                }

                .admin-container .thead,
                .admin-container thead {
                    background-color: #fafafa !important;
                    border-bottom-color: #ebebeb !important;
                }

                .admin-container tr {
                    border-bottom-color: #ebebeb !important;
                }

                .admin-container tr:hover,
                .admin-container .hover\:bg-white\/5:hover,
                .admin-container .hover\:bg-white\/2:hover {
                    background-color: #fafafa !important;
                }

                /* Borders & dividers */
                .admin-container .border-white\/10,
                .admin-container .border-white\/5,
                .admin-container .border-white\/20,
                .admin-container .border-slate-800,
                .admin-container .border-slate-700,
                .admin-container .border-gray-800,
                .admin-container .border-gray-700 {
                    border-color: #ebebeb !important;
                }

                .admin-container .divide-white\/5 > * + *,
                .admin-container .divide-y > * + * {
                    border-color: #ebebeb !important;
                }

                /* Text Colors */
                .admin-container .text-[#171717],
                .admin-container .text-[#171717],
                .admin-container .text-[#171717],
                .admin-container .text-[#4D4D4D],
                .admin-container .text-gray-100,
                .admin-container .text-gray-250,
                .admin-container .text-gray-300 {
                    color: #171717 !important;
                }

                .admin-container .text-[#8F8F8F],
                .admin-container .text-[#8F8F8F],
                .admin-container .text-gray-400,
                .admin-container .text-gray-500 {
                    color: #4d4d4d !important; /* Vercel body grey */
                }

                .admin-container .text-[#8F8F8F],
                .admin-container .text-[#8F8F8F],
                .admin-container .text-gray-600,
                .admin-container .text-gray-700 {
                    color: #8f8f8f !important; /* Vercel mute copy */
                }

                /* User list avatar blocks */
                .admin-container .bg-white {
                    background-color: #fafafa !important;
                    border: 1px solid #ebebeb !important;
                    color: #171717 !important;
                }

                /* Inputs & search bars */
                .admin-container input,
                .admin-container select,
                .admin-container textarea {
                    background-color: #ffffff !important;
                    color: #171717 !important;
                    border-color: #ebebeb !important;
                }

                .admin-container input::placeholder,
                .admin-container textarea::placeholder {
                    color: #a1a1a1 !important; /* Vercel faint text */
                }

                /* Badges / Category Pills */
                .admin-container .bg-white\/5 {
                    background-color: #fafafa !important;
                    border-color: #ebebeb !important;
                    color: #4d4d4d !important;
                }

                /* Semantic color mappings: Success / Emerald */
                .admin-container .bg-emerald-500\/10,
                .admin-container .bg-emerald-500\/20,
                .admin-container .bg-emerald-500\/5 {
                    background-color: #ecfdf5 !important;
                    border-color: #a7f3d0 !important;
                    color: #047857 !important;
                }

                .admin-container .text-emerald-600,
                .admin-container .text-emerald-500 {
                    color: #047857 !important;
                }

                /* Semantic color mappings: Error / Rose */
                .admin-container .bg-rose-500\/10,
                .admin-container .bg-rose-500\/20,
                .admin-container .bg-rose-500\/5 {
                    background-color: #fef2f2 !important;
                    border-color: #fecaca !important;
                    color: #b91c1c !important;
                }

                .admin-container .text-rose-400,
                .admin-container .text-rose-500 {
                    color: #b91c1c !important;
                }

                /* Accent color mappings: Purple / Indigo */
                .admin-container .text-purple-600,
                .admin-container .text-indigo-600,
                .admin-container .text-purple-500,
                .admin-container .text-indigo-500 {
                    color: #4f46e5 !important;
                }

                .admin-container .bg-indigo-500\/20,
                .admin-container .bg-indigo-500\/10,
                .admin-container .bg-purple-500\/10 {
                    background-color: #eef2ff !important;
                    border-color: #c7d2fe !important;
                    color: #4f46e5 !important;
                }

                /* Opacity transitions for hover buttons */
                .admin-container .group:hover .group-hover\:opacity-100 {
                    opacity: 100 !important;
                }
            `}</style>
        </div>
    );
}
