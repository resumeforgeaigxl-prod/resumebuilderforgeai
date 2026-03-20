"use client";

import { useState } from "react";
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
  GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  locale: string;
}

export function Sidebar({ locale }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", icon: LayoutDashboard, href: `/${locale}/dashboard` },
    { name: "ResumeForge", icon: FileText, href: `/${locale}/resumes` },
    { name: "CodingForge", icon: Code, href: `/${locale}/codingforge` },
    { name: "ProjectForge", icon: Projector, href: `/${locale}/projectforge` },
    { name: "InterviewForge", icon: MessageSquare, href: `/${locale}/mock-interview` },
    { name: "LearnForge", icon: PlayCircle, href: `/${locale}/learnforge` },
    { name: "KnowledgeForge", icon: GraduationCap, href: `/${locale}/knowledgeforge` },
    { name: "ExplainForge", icon: Sparkles, href: `/${locale}/explainforge` },
    { name: "StudyForge", icon: BookOpen, href: `/${locale}/studyforge` },
    { name: "CareerForge", icon: Briefcase, href: `/${locale}/careerforge` },
    { name: "MentorForge", icon: Bot, href: `/${locale}/mentorforge` },
    { name: "JobForge", icon: Search, href: `/${locale}/jobs` },
    { name: "Company Prep", icon: Building2, href: `/${locale}/company-prep-interview` },
    { name: "AI Tools", icon: Zap, href: `/${locale}/tools` },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-white/5 bg-[#050510]/80 backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col p-4">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center min-h-[48px] px-2">
          {!collapsed ? (
            <Image 
              src="/logo/resumeforge-logo-v2.svg" 
              width={160}
              height={34}
              className="w-[160px] h-auto object-contain transition-all" 
              alt="ResumeForgeAI" 
              priority
            />
          ) : (
            <Image 
              src="/logo/resumeforge-icon-v2.svg" 
              width={32}
              height={32}
              className="w-8 h-8 object-contain transition-all" 
              alt="RF" 
              priority
            />
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group",
                  isActive 
                    ? "bg-white/10 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive ? "text-indigo-400" : "group-hover:text-indigo-300"
                )} />
                {!collapsed && <span>{item.name}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto space-y-1 pt-4 border-t border-white/5">
          <Link
            href={`/${locale}/account`}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              pathname?.includes("account") ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Settings className="h-5 w-5" />
            {!collapsed && <span>Settings</span>}
          </Link>
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-all hover:bg-white/5 hover:text-white"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
