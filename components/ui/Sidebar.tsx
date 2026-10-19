"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { WalletModal } from "@/components/billing/WalletModal";

interface SidebarProps {
  locale: string;
}

const RAIL = [
  { name: "Overview", icon: "/rail/rail-overview.png?v=ice", href: "dashboard" },
  { name: "Omni", icon: "/rail/rail-omni.png?v=ice", href: "omni" },
  { name: "Resume", icon: "/rail/rail-resume.png?v=ice", href: "resumes" },
  { name: "Jobs", icon: "/rail/rail-jobs.png?v=ice", href: "jobs" },
  { name: "Apps", icon: "/rail/rail-apps.png?v=ice", href: "applications" },
] as const;

export function Sidebar({ locale }: SidebarProps) {
  const { mobileOpen, setMobileOpen, toggle } = useSidebar();
  const pathname = usePathname();
  const [credits, setCredits] = useState<number | null>(null);
  const [walletOpen, setWalletOpen] = useState(false);

  const loadCredits = useCallback(() => {
    fetch("/api/credits/balance")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const available = data?.balance?.available;
        if (data?.success && typeof available === "number") {
          setCredits(available);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadCredits();
  }, [loadCredits]);

  const safeLocale = locale.toLowerCase();
  const accountActive = pathname?.includes("/account");

  const isActive = (href: string, name: string) => {
    if (name === "Apps") return pathname?.includes("/applications");
    if (name === "Omni") return pathname?.includes("/omni") || pathname?.includes("/mentorforge");
    const path = `/${safeLocale}/${href}`;
    return pathname === path || pathname?.startsWith(path + "/");
  };

  return (
    <>
      {!mobileOpen && !pathname?.includes('/omni') && !pathname?.includes('/mentorforge') && (
        <button
          type="button"
          onClick={toggle}
          className="fixed left-3 top-3 z-30 inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#8b909a] md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-[80px] shrink-0 flex-col border-r border-[#161616] bg-[#050505]",
          "transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] md:translate-x-0",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col items-center justify-between px-2 py-4">
          <div className="flex w-full flex-col items-center">
            <Link
              href={`/${safeLocale}/dashboard`}
              title="ResumeForge"
              className="mb-5 flex h-9 w-9 items-center justify-center text-[13px] font-medium tracking-tight text-[#f4f5f7]"
            >
              RF
            </Link>

            <nav className="flex w-full flex-col gap-1" aria-label="Global navigation rail">
              {RAIL.map((item) => {
                const active = isActive(item.href, item.name);
                return (
                  <Link
                    key={item.name}
                    href={`/${safeLocale}/${item.href}`}
                    onClick={() => setMobileOpen(false)}
                    title={item.name}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-2xl px-1 py-2 transition-colors",
                      active ? "bg-[#141414] text-[#f4f5f7]" : "text-[#8b909a] hover:bg-[#101010] hover:text-[#f4f5f7]"
                    )}
                  >
                    <img
                      src={item.icon}
                      alt=""
                      width={32}
                      height={32}
                      draggable={false}
                      className={cn("h-8 w-8 object-contain", active ? "opacity-100" : "opacity-80")}
                    />
                    <span className="text-[10px] leading-none tracking-tight">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex w-full flex-col items-center gap-1 border-t border-[#161616] pt-3">
            <Link
              href={`/${safeLocale}/account`}
              onClick={() => setMobileOpen(false)}
              title="Account"
              className={cn(
                "flex w-full flex-col items-center gap-1 rounded-2xl px-1 py-2 transition-colors",
                accountActive ? "bg-[#141414] text-[#f4f5f7]" : "text-[#8b909a] hover:bg-[#101010] hover:text-[#f4f5f7]"
              )}
            >
              <img
                src="/rail/rail-account.png?v=ice"
                alt=""
                width={32}
                height={32}
                draggable={false}
                className={cn("h-8 w-8 object-contain", accountActive ? "opacity-100" : "opacity-80")}
              />
              <span className="text-[10px] leading-none tracking-tight">Account</span>
            </Link>
            <button
              type="button"
              onClick={() => setWalletOpen(true)}
              className="flex w-full flex-col items-center rounded-2xl px-1 py-2 text-[#8b909a] transition-colors hover:bg-[#101010] hover:text-[#f4f5f7]"
            >
              <span className="text-[13px] font-medium tabular-nums leading-none text-[#f4f5f7]">
                {credits !== null ? credits : "–"}
              </span>
              <span className="mt-1 text-[10px] leading-none tracking-tight">credits</span>
            </button>
          </div>
        </div>
      </aside>
      <WalletModal
        isOpen={walletOpen}
        onClose={() => {
          setWalletOpen(false);
          loadCredits();
        }}
      />
    </>
  );
}
