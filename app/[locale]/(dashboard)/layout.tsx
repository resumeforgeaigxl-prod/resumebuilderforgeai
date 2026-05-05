"use client";

import { Sidebar } from "@/components/ui/Sidebar";
import { TopNav } from "@/components/ui/TopNav";
import { usePathname } from "next/navigation";
import { ForgeAssistant } from "@/components/shared/ForgeAssistant";
import { SidebarProvider, useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

function DashboardContent({
    children,
    locale
}: {
    children: React.ReactNode;
    locale: string;
}) {
    const pathname = usePathname();
    const { collapsed } = useSidebar();

    const isMentorForge = (pathname ?? '').includes('/mentorforge');

    // Extract page title from pathname
    const pageTitle = (pathname ?? '').split('/').pop()?.replace(/-/g, ' ') || 'Overview';
    const formattedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

    return (
        <div className="min-h-screen bg-[#080B16] flex overflow-hidden relative">
            <Sidebar locale={locale} />

            <div className={cn(
                "flex-1 flex flex-col min-w-0 transition-[margin] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                collapsed ? "ml-[72px]" : "ml-64"
            )}>
                <TopNav pageTitle={formattedTitle} locale={locale} />

                <main className={cn(
                    "flex-1 transition-all duration-300",
                    isMentorForge ? "h-[calc(100vh-64px)] mt-16 overflow-hidden" : "pt-24 pb-12 px-8 overflow-y-auto overflow-x-hidden custom-scrollbar"
                )}>
                    {children}
                </main>
            </div>

            <ForgeAssistant locale={locale} />
        </div>
    );
}

export default function DashboardLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const { locale } = params;

    return (
        <SidebarProvider>
            <DashboardContent locale={locale}>
                {children}
            </DashboardContent>
        </SidebarProvider>
    );
}
