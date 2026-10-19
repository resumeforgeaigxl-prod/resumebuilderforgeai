"use client";

import { Sidebar } from "@/components/ui/Sidebar";
import { usePathname } from "next/navigation";
import { SidebarProvider, useSidebar } from "@/hooks/use-sidebar";
import { OmniHeaderProvider } from "@/hooks/use-omni-header";
import { cn } from "@/lib/utils";

function DashboardContent({
    children,
    locale
}: {
    children: React.ReactNode;
    locale: string;
}) {
    const pathname = usePathname();
    const { isMounted } = useSidebar();

    const isOmni = (pathname ?? '').includes('/omni') || (pathname ?? '').includes('/mentorforge');

    return (
        <div className={cn("bg-[#050505] text-[#F5F5F5] flex overflow-hidden relative product-dark", isOmni ? "h-[100dvh] min-h-0" : "min-h-screen")}>
            <Sidebar locale={locale} />

            <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[80px] relative">
                <main className={cn(
                    "flex-1 w-full",
                    isMounted ? "transition-all duration-300" : "",
                    isOmni
                        ? "omni-shell h-full min-h-0 bg-[#050505] overflow-hidden flex flex-col"
                        : "h-screen bg-[#050505] overflow-y-auto overflow-x-hidden custom-scrollbar p-4 md:p-8"
                )}>
                    {children}
                </main>
            </div>
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
            <OmniHeaderProvider>
                <DashboardContent locale={locale}>
                    {children}
                </DashboardContent>
            </OmniHeaderProvider>
        </SidebarProvider>
    );
}
