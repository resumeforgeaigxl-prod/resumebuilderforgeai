"use client";
import React, { useState, useEffect } from "react";
import { Bell, Search, User, LogOut, ChevronRight, Menu, Zap, History, Plus } from "@/components/icons";
import { Button } from "./Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./DropdownMenu";
import { WalletModal } from "@/components/billing/WalletModal";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { useOmniHeader } from "@/hooks/use-omni-header";

interface TopNavProps {
  userName?: string;
  pageTitle: string;
  locale?: string;
}

let cachedUserProfile: { fullName: string; planType: string } | null = null;
let cachedCreditBalance: number | null = null;

export function TopNav({ userName = "User", pageTitle, locale = "en" }: TopNavProps) {
  const pathname = usePathname();
  const { collapsed, toggle, isMounted } = useSidebar();
  const [profile, setProfile] = useState<{ fullName: string; planType: string } | null>(cachedUserProfile);
  const [credits, setCredits] = useState<number | null>(cachedCreditBalance);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

  useEffect(() => {
    if (cachedUserProfile) {
      setProfile(cachedUserProfile);
    }

    async function fetchUserData() {
      try {
        const [profRes, credRes] = await Promise.all([
          !cachedUserProfile ? fetch("/api/user/profile") : null,
          fetch("/api/credits/balance"),
        ]);

        if (profRes && profRes.ok) {
          const data = await profRes.json();
          if (data.success && data.user) {
            const userObj = {
              fullName: data.user.full_name || data.user.email?.split("@")[0] || "User",
              planType: data.user.plan_type || "FREE",
            };
            cachedUserProfile = userObj;
            setProfile(userObj);
          }
        }

        if (credRes && credRes.ok) {
          const credData = await credRes.json();
          if (credData.success && credData.balance) {
            cachedCreditBalance = credData.balance.available_balance;
            setCredits(credData.balance.available_balance);
          }
        }
      } catch (err) {
        console.error("[TopNav] Error fetching user data:", err);
      }
    }
    fetchUserData();
  }, []);

  const displayName = profile?.fullName || userName;
  const planType = (profile?.planType || "FREE").toUpperCase();
  const isPro = ["DAILY", "WEEKLY", "MONTHLY", "PROFESSIONAL", "PRO"].includes(planType);
  const planName = planType === "FREE" ? "Free Member" : `${profile?.planType || "Pro"} Member`;

  const isOmni = (pathname ?? "").includes("/omni") || (pathname ?? "").includes("/mentorforge");
  const { historyCount, activeTitle, onOpenHistory, onNewChat } = useOmniHeader();

  return (
    <header className="fixed top-0 right-0 z-30 flex h-14 md:h-16 items-center justify-between border-b border-[#242424] bg-[#0A0A0A] px-4 md:px-6 backdrop-blur-md left-0 md:left-[80px]">
      {/* Breadcrumbs / Page Title / Omni Header */}
      <div className="flex items-center gap-2 text-sm min-w-0">
        <button 
          onClick={toggle}
          className="md:hidden mr-2 p-1.5 rounded-lg text-[#7E7E7E] hover:text-[#F5F5F5] hover:bg-[#151515] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-[#7E7E7E] font-medium tracking-tight hidden sm:inline-block">Dashboard</span>
        <ChevronRight className="h-3 w-3 text-[#565656] hidden sm:block" />
        <span className="text-[#F5F5F5] font-semibold tracking-tight truncate">{pageTitle}</span>

        {/* Omni Header Actions (History, New chat, Active thread title) */}
        {isOmni && (
          <div className="flex items-center gap-2 ml-1 sm:ml-2 pl-2 sm:pl-3 border-l border-[#242424] min-w-0">
            <button
              type="button"
              onClick={onOpenHistory}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#BDBDBD] hover:text-[#F5F5F5] hover:bg-[#151515] transition-colors cursor-pointer shrink-0"
              title="View chat history"
            >
              <History className="w-3.5 h-3.5 text-[#7E7E7E]" />
              <span className="hidden sm:inline">History</span>
              {historyCount > 0 && (
                <span className="text-[10px] bg-[#151515] border border-[#242424] text-[#BDBDBD] px-1.5 py-0.2 rounded-full font-mono">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onNewChat}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#F5F5F5] bg-[#151515] border border-[#242424] hover:bg-[#202020] hover:border-[#2D2D2D] shadow-xs transition-colors cursor-pointer shrink-0"
              title="Start new chat"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New chat</span>
            </button>

            {activeTitle && (
              <div className="flex items-center gap-1.5 text-xs text-[#7E7E7E] truncate px-1 sm:px-2 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-[200px] md:max-w-[280px] font-medium text-[#BDBDBD]">
                  {activeTitle}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7E7E7E]" />
          <input
            type="text"
            placeholder="Search anything..."
            className="h-9 w-64 rounded-full border border-[#242424] bg-[#101010] pl-10 pr-4 text-sm text-[#F5F5F5] placeholder:text-[#7E7E7E] focus:border-[#8B5CF6]/40 focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/20 transition-all"
          />
        </div>

        {/* Credit Wallet Pill */}
        <button
          onClick={() => setIsWalletOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#242424] bg-[#101010] text-xs font-semibold text-[#F5F5F5] hover:border-[#2D2D2D] hover:bg-[#151515] transition-all shadow-xs group cursor-pointer"
          title="Credit Wallet & Balance"
        >
          <Zap className="w-3.5 h-3.5 text-[#8B5CF6] fill-[#8B5CF6]/20 group-hover:scale-110 transition-transform" />
          <span>{credits !== null ? credits : '...'}</span>
          <span className="text-[10px] text-[#7E7E7E] font-normal hidden sm:inline">credits</span>
        </button>

        {/* Notifications */}
        <Link href={`/${locale}/job-alerts`}>
          <Button variant="ghost" size="icon" className="relative text-[#BDBDBD] hover:text-[#F5F5F5] hover:bg-[#151515]">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-[#8B5CF6]" />
          </Button>
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-[#242424]">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[#F5F5F5] leading-none whitespace-nowrap">{displayName}</p>
            <p className={`text-[10px] mt-1 uppercase tracking-widest font-semibold ${isPro ? 'text-[#8B5CF6]' : 'text-[#7E7E7E]'}`}>
              {planName}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-9 w-9 rounded-full border border-[#242424] bg-[#101010] flex items-center justify-center text-[#BDBDBD] hover:text-[#F5F5F5] hover:border-[#2D2D2D] transition-all active:scale-95 shadow-sm">
                <User className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#151515] border border-[#242424] text-[#F5F5F5] shadow-2xl">
              <DropdownMenuLabel className="text-[#7E7E7E] font-semibold text-[11px] tracking-wide">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#242424]" />
              <Link href={`/${locale}/account`}>
                <DropdownMenuItem className="cursor-pointer hover:bg-[#202020] text-[#F5F5F5] focus:bg-[#202020] focus:text-[#F5F5F5]">
                  <User className="mr-2 h-4 w-4 text-[#BDBDBD]" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={() => setIsWalletOpen(true)}
                className="cursor-pointer hover:bg-[#202020] text-[#F5F5F5] focus:bg-[#202020] focus:text-[#F5F5F5]"
              >
                <Zap className="mr-2 h-4 w-4 text-[#8B5CF6]" />
                <span>Wallet & Credits</span>
              </DropdownMenuItem>
              <Link href={`/${locale}/job-alerts`}>
                <DropdownMenuItem className="cursor-pointer hover:bg-[#202020] text-[#F5F5F5] focus:bg-[#202020] focus:text-[#F5F5F5]">
                  <Bell className="mr-2 h-4 w-4 text-[#BDBDBD]" />
                  <span>Notifications</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator className="bg-[#242424]" />
              <form action="/api/auth/signout" method="post">
                <button type="submit" className="w-full">
                  <DropdownMenuItem className="text-rose-400 focus:text-rose-400 focus:bg-rose-950/30 cursor-pointer hover:bg-rose-950/30">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </button>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onTopUpSuccess={() => {
          fetch('/api/credits/balance')
            .then((r) => r.json())
            .then((d) => {
              if (d.success && d.balance) {
                cachedCreditBalance = d.balance.available_balance;
                setCredits(d.balance.available_balance);
              }
            })
            .catch(() => {});
        }}
      />
    </header>
  );
}

