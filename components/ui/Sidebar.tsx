"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Code,
  Projector,
  MessageSquare,
  BookOpen,
  Briefcase,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  Zap,
  Sparkles,
  PlayCircle,
  Bot,
  GraduationCap,
  Brain,
  Terminal,
  PanelLeftClose,
  PanelLeft,
  Wallet,
  Network
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";

interface SidebarProps {
  locale: string;
}

export function Sidebar({ locale }: SidebarProps) {
  const { collapsed, toggle, setCollapsed, isMounted } = useSidebar();
  const pathname = usePathname();

  const safeLocale = locale.toLowerCase();
  const navItems = [
    { name: "Overview", icon: LayoutDashboard, href: `/${safeLocale}/dashboard` },
    { name: "ResumeForge", icon: FileText, href: `/${safeLocale}/resumes` },
    { name: "CodingForge", icon: Code, href: `/${safeLocale}/codingforge` },
    { name: "PrepForge", icon: Brain, href: `/${safeLocale}/prepforge` },
    { name: "ProjectForge", icon: Projector, href: `/${safeLocale}/projectforge` },
    { name: "InterviewForge", icon: MessageSquare, href: `/${safeLocale}/mock-interview` },
    { name: "LearnForge", icon: PlayCircle, href: `/${safeLocale}/learnforge` },
    { name: "KnowledgeForge", icon: GraduationCap, href: `/${safeLocale}/knowledgeforge` },
    { name: "ExplainForge", icon: Sparkles, href: `/${safeLocale}/explainforge` },
    { name: "StudyForge", icon: BookOpen, href: `/${safeLocale}/studyforge` },
    { name: "CareerForge", icon: Briefcase, href: `/${safeLocale}/careerforge` },
    { name: "MentorForge", icon: Bot, href: `/${safeLocale}/mentorforge` },
    { name: "JobForge", icon: Search, href: `/${safeLocale}/jobs` },
    { name: "Company Prep", icon: Building2, href: `/${safeLocale}/company-prep-interview` },
    { name: "API Platform", icon: Terminal, href: `/${safeLocale}/api-keys` },
    { name: "SalaryForge", icon: Wallet, href: `/${safeLocale}/salaryforge` },
    { name: "NetworkForge", icon: Network, href: `/${safeLocale}/networkforge` },
    { name: "AtsLive", icon: Zap, href: `/${safeLocale}/ats-live` },
    { name: "AI Tools", icon: Zap, href: `/${safeLocale}/tools` },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div 
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px] md:hidden animate-in fade-in duration-300"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-[#EBEBEB] bg-[#FAFAFA] flex flex-col",
          "ease-[cubic-bezier(0.4,0,0.2,1)]",
          isMounted ? "transition-all duration-300" : "",
          collapsed 
            ? "-translate-x-full md:translate-x-0 md:w-[72px]" 
            : "translate-x-0 w-64 md:w-64"
        )}
      >
        <div className="flex h-full flex-col p-3">
          {/* Logo + Collapse Toggle */}
          <div className="mb-6 flex items-center justify-between min-h-[48px] px-1 select-none">
            {/* Expanded Brand Mark */}
            <div className={cn(
              "flex items-center gap-2 overflow-hidden ease-[cubic-bezier(0.4,0,0.2,1)]",
              isMounted ? "transition-all duration-300" : "",
              collapsed ? "w-0 opacity-0" : "opacity-100"
            )}>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#171717] shrink-0 shadow-sm">
                <span className="text-white text-[10px] font-bold tracking-tight">RF</span>
              </div>
              <span className="text-[#171717] font-semibold text-sm tracking-tight shrink-0 font-sans">
                ResumeForge AI
              </span>
            </div>

            {/* Collapsed Brand Mark */}
            {collapsed && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#171717] mx-auto shrink-0 shadow-sm animate-in fade-in duration-200">
                <span className="text-white text-[10px] font-bold tracking-tight">RF</span>
              </div>
            )}

            <button
              onClick={toggle}
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200 text-[#4D4D4D] hover:text-[#171717] hover:bg-[#171717]/5",
                collapsed && "absolute right-2 top-4"
              )}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeft className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden scrollbar-none">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group font-sans",
                    collapsed && "justify-center px-0",
                    isActive
                      ? "bg-[#171717]/5 text-[#171717] font-semibold"
                      : "text-[#4D4D4D] hover:bg-[#171717]/5 hover:text-[#171717]"
                  )}
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#171717] transition-all duration-300" />
                  )}

                  <item.icon className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-all duration-200",
                    isActive ? "text-[#171717]" : "text-[#4D4D4D] group-hover:text-[#171717]",
                    collapsed && "h-5 w-5"
                  )} />

                  {/* Label with smooth slide */}
                  <span className={cn(
                    "whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
                  )}>
                    {item.name}
                  </span>

                  {/* Active dot */}
                  {isActive && !collapsed && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#171717]" />
                  )}

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-3 py-1.5 rounded-lg bg-white border border-[#EBEBEB] text-[#171717] text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 shadow-[0_8px_16px_rgba(0,0,0,0.06)] z-50">
                      {item.name}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 bg-white border-l border-b border-[#EBEBEB]" />
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-auto space-y-0.5 pt-3 border-t border-[#EBEBEB]">
            <Link
              href={`/${locale}/account`}
              title={collapsed ? "Settings" : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group font-sans",
                collapsed && "justify-center px-0",
                pathname?.includes("account")
                  ? "bg-[#171717]/5 text-[#171717] font-semibold"
                  : "text-[#4D4D4D] hover:bg-[#171717]/5 hover:text-[#171717]"
              )}
            >
              <Settings className={cn("h-[18px] w-[18px] shrink-0", collapsed && "h-5 w-5")} />
              <span className={cn(
                "whitespace-nowrap transition-all duration-300",
                collapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
              )}>
                Settings
              </span>

              {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-1.5 rounded-lg bg-white border border-[#EBEBEB] text-[#171717] text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 shadow-[0_8px_16px_rgba(0,0,0,0.06)] z-50">
                  Settings
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 bg-white border-l border-b border-[#EBEBEB]" />
                </div>
              )}
            </Link>

            <button
              onClick={toggle}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#4D4D4D] transition-all duration-200 hover:bg-[#171717]/5 hover:text-[#171717]",
                collapsed && "justify-center px-0"
              )}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5 text-[#171717]" />
              ) : (
                <>
                  <ChevronLeft className="h-[18px] w-[18px]" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
