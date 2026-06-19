"use client";

import React from "react";
import { Bell, Search, User, LogOut, ChevronRight, Menu } from "lucide-react";
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
  const { collapsed, toggle, isMounted } = useSidebar();

  return (
    <header className={cn(
      "fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-[#EBEBEB] bg-[#FAFAFA]/80 px-4 md:px-8 backdrop-blur-md ease-[cubic-bezier(0.4,0,0.2,1)]",
      isMounted ? "transition-all duration-300" : "",
      collapsed ? "left-0 md:left-[72px]" : "left-0 md:left-64"
    )}>
      {/* Breadcrumbs / Page Title */}
      <div className="flex items-center gap-2 text-sm">
        <button 
          onClick={toggle}
          className="md:hidden mr-2 p-1.5 rounded-lg text-[#4D4D4D] hover:text-[#171717] hover:bg-[#171717]/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-[#8F8F8F] font-medium tracking-tight hidden sm:inline-block">Dashboard</span>
        <ChevronRight className="h-3 w-3 text-[#8F8F8F]/55 hidden sm:block" />
        <span className="text-[#171717] font-semibold tracking-tight truncate max-w-[150px] sm:max-w-none">{pageTitle}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F8F8F]" />
          <input
            type="text"
            placeholder="Search anything..."
            className="h-9 w-64 rounded-full border border-[#EBEBEB] bg-white pl-10 pr-4 text-sm text-[#171717] placeholder:text-[#8F8F8F] focus:border-[#171717]/30 focus:outline-none focus:ring-1 focus:ring-[#171717]/20 transition-all"
          />
        </div>

        {/* Notifications */}
        <Link href={`/${locale}/job-alerts`}>
          <Button variant="ghost" size="icon" className="relative text-[#4D4D4D] hover:text-[#171717] hover:bg-[#171717]/5">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-[#0070F3]" />
          </Button>
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#EBEBEB]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[#171717] leading-none whitespace-nowrap">{userName}</p>
            <p className="text-[10px] text-[#0070F3] mt-1 uppercase tracking-widest font-semibold">Pro Member</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 w-9 rounded-full border border-[#EBEBEB] bg-white flex items-center justify-center text-[#4D4D4D] hover:text-[#171717] hover:border-[#171717] transition-all active:scale-95 shadow-sm">
                <User className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-[#EBEBEB] text-[#171717] shadow-xl">
              <DropdownMenuLabel className="text-[#8F8F8F] font-semibold text-[11px] tracking-wide">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#EBEBEB]" />
              <Link href={`/${locale}/account`}>
                <DropdownMenuItem className="cursor-pointer hover:bg-[#FAFAFA] text-[#171717] focus:bg-[#FAFAFA] focus:text-[#171717]">
                  <User className="mr-2 h-4 w-4 text-[#4D4D4D]" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href={`/${locale}/job-alerts`}>
                <DropdownMenuItem className="cursor-pointer hover:bg-[#FAFAFA] text-[#171717] focus:bg-[#FAFAFA] focus:text-[#171717]">
                  <Bell className="mr-2 h-4 w-4 text-[#4D4D4D]" />
                  <span>Notifications</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator className="bg-[#EBEBEB]" />
              <form action="/api/auth/signout" method="post">
                <button type="submit" className="w-full">
                  <DropdownMenuItem className="text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer hover:bg-rose-50">
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

