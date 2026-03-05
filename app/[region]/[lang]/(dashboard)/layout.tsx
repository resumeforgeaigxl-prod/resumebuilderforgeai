'use client';

import { Sidebar, MobileNav } from '@/components/dashboard/Sidebar';
import { useState } from 'react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col pt-20">
            <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
            <main className={`flex-1 transition-all duration-500 relative
                ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 w-full max-w-7xl">
                    {children}
                </div>
            </main>
            <MobileNav />
        </div>
    )
}
