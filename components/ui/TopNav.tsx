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

interface TopNavProps {
  userName?: string;
  pageTitle: string;
}

export function TopNav({ userName = "User", pageTitle }: TopNavProps) {
  return (
    <header className="fixed top-0 right-0 z-30 flex h-16 w-[calc(100%-260px)] items-center justify-between border-b border-white/5 bg-[#070710]/50 px-8 backdrop-blur-md transition-all">
      {/* Breadcrumbs / Page Title */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-500 font-medium tracking-tight">Dashboard</span>
        <ChevronRight className="h-3 w-3 text-slate-600" />
        <span className="text-white font-semibold tracking-tight">{pageTitle}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search anything..."
            className="h-9 w-64 rounded-full border border-white/5 bg-white/5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-[inset_0_0_20px_rgba(255,255,255,0.01)]"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-white hover:bg-white/5">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" />
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/5">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white leading-none whitespace-nowrap">{userName}</p>
            <p className="text-[10px] text-indigo-400 mt-1 uppercase tracking-widest font-black">Pro Member</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] group transition-all active:scale-95 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20">
                <div className="h-full w-full rounded-full bg-[#070710] flex items-center justify-center overflow-hidden">
                  <User className="h-5 w-5 text-indigo-400 group-hover:text-white transition-colors" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-rose-400 focus:text-rose-400 focus:bg-rose-400/10">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
