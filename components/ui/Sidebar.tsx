"use client";

import Link from "next/link";
import Image from "next/image";
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
          className="fixed inset-0 z-30 bg-[#080B16]/80 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-[#1E2A42] bg-[#0D1220]/95 backdrop-blur-xl flex flex-col",
          "ease-[cubic-bezier(0.4,0,0.2,1)]",
          isMounted ? "transition-all duration-300" : "",
          collapsed 
            ? "-translate-x-full md:translate-x-0 md:w-[72px]" 
            : "translate-x-0 w-64 md:w-64"
        )}
      >
        <div className="flex h-full flex-col p-3">
        {/* Logo + Collapse Toggle */}
        <div className="mb-6 flex items-center justify-between min-h-[48px] px-1">
          <div className={cn(
            "overflow-hidden ease-[cubic-bezier(0.4,0,0.2,1)]",
            isMounted ? "transition-all duration-300" : "",
            collapsed ? "w-0 opacity-0" : "w-[140px] opacity-100"
          )}>
            <Image
              src="/logo/resumeforge-logo-v2.svg"
              width={140}
              height={30}
              className="w-[140px] h-auto object-contain shrink-0"
              alt="ResumeForgeAI"
              priority
            />
          </div>

          {collapsed && (
            <Image
              src="/logo/resumeforge-icon-v2.svg"
              width={28}
              height={28}
              className="w-7 h-7 object-contain mx-auto shrink-0 animate-in fade-in duration-200"
              alt="RF"
              priority
            />
          )}

          <button
            onClick={toggle}
            className={cn(
              "p-1.5 rounded-lg transition-all duration-200 text-[#4A5568] hover:text-[#00D4A0] hover:bg-[#00D4A0]/8",
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
                  "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-[#00D4A0]/10 text-[#EFF4FB]"
                    : "text-[#7A8BA8] hover:bg-[#121A2E] hover:text-[#EFF4FB]"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#00D4A0] shadow-[0_0_8px_rgba(0,212,160,0.5)] transition-all duration-300" />
                )}

                <item.icon className={cn(
                  "h-[18px] w-[18px] shrink-0 transition-all duration-200",
                  isActive ? "text-[#00D4A0]" : "text-[#4A5568] group-hover:text-[#00D4A0]",
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
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00D4A0] shadow-[0_0_8px_rgba(0,212,160,0.6)]" />
                )}

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 rounded-lg bg-[#121A2E] border border-[#1E2A42] text-[#EFF4FB] text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 shadow-xl z-50">
                    {item.name}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 bg-[#121A2E] border-l border-b border-[#1E2A42]" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto space-y-0.5 pt-3 border-t border-[#1E2A42]">
          <Link
            href={`/${locale}/account`}
            title={collapsed ? "Settings" : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
              collapsed && "justify-center px-0",
              pathname?.includes("account")
                ? "bg-[#00D4A0]/10 text-[#EFF4FB]"
                : "text-[#7A8BA8] hover:bg-[#121A2E] hover:text-[#EFF4FB]"
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
              <div className="absolute left-full ml-2 px-3 py-1.5 rounded-lg bg-[#121A2E] border border-[#1E2A42] text-[#EFF4FB] text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 shadow-xl z-50">
                Settings
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 rotate-45 bg-[#121A2E] border-l border-b border-[#1E2A42]" />
              </div>
            )}
          </Link>

          <button
            onClick={toggle}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#7A8BA8] transition-all duration-200 hover:bg-[#121A2E] hover:text-[#EFF4FB]",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 text-[#00D4A0]" />
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
