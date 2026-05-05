"use client";

import React from "react";
import { Bell, Search, User, LogOut, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./DropdownMenu";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";

interface TopNavProps {
  userName?: string;
  pageTitle: string;
  locale?: string;
}

export function TopNav({ userName = "User", pageTitle, locale = "en" }: TopNavProps) {
  const pathname = usePathname();
  const { collapsed } = useSidebar();

  return (
    <header className={cn(
      "fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-[#1E2A42] bg-[#080B16]/80 px-8 backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
      collapsed ? "w-[calc(100%-72px)]" : "w-[calc(100%-256px)]"
    )}>
      {/* Breadcrumbs / Page Title */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[#7A8BA8] font-medium tracking-tight">Dashboard</span>
        <ChevronRight className="h-3 w-3 text-[#4A5568]" />
        <span className="text-[#EFF4FB] font-semibold tracking-tight">{pageTitle}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search anything..."
            className="h-9 w-64 rounded-full border border-[#1E2A42] bg-[#0D1220] pl-10 pr-4 text-sm text-[#EFF4FB] placeholder:text-[#4A5568] focus:border-[#00D4A0]/30 focus:outline-none focus:ring-1 focus:ring-[#00D4A0]/20 transition-all"
          />
        </div>

        {/* Notifications */}
        <Link href={`/${locale}/job-alerts`}>
          <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-white/5">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-[#00D4A0] shadow-[0_0_10px_rgba(0,212,160,0.8)]" />
          </Button>
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white leading-none whitespace-nowrap">{userName}</p>
            <p className="text-[10px] text-[#00D4A0] mt-1 uppercase tracking-widest font-black">Pro Member</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 w-9 rounded-full bg-gradient-to-br from-[#00D4A0] via-[#7C5CFC] to-[#00D4A0] p-[1.5px] group transition-all active:scale-95 shadow-lg shadow-[#00D4A0]/10 hover:shadow-[#00D4A0]/20">
                <div className="h-full w-full rounded-full bg-[#080B16] flex items-center justify-center overflow-hidden">
                  <User className="h-5 w-5 text-[#00D4A0] group-hover:text-white transition-colors" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href={`/${locale}/account`}>
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href={`/${locale}/job-alerts`}>
                <DropdownMenuItem className="cursor-pointer">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <form action="/api/auth/signout" method="post">
                <button type="submit" className="w-full">
                  <DropdownMenuItem className="text-rose-400 focus:text-rose-400 focus:bg-rose-400/10 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
