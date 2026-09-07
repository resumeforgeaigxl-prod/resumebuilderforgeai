'use client';

import React, { useState } from 'react';
import { ArrowRight, X } from '@/components/icons';

export default function GrowXLabsTopBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="GrowXLabs Talent Announcement"
      className="relative z-50 w-full overflow-hidden border-b border-white/[0.08] bg-[#0A0A0C] text-white py-2.5 px-4 select-none"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 80% 100% at 50% -20%, rgba(120, 119, 198, 0.25), rgba(255, 255, 255, 0))',
      }}
    >
      {/* Top subtle highlight line */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="max-w-[1200px] mx-auto flex items-center justify-center relative">
        {/* Centered High-Level Announcement Island */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-center">
          {/* Micro Brand Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.07] border border-white/[0.12] backdrop-blur-sm text-[10px] font-mono tracking-wider font-semibold text-neutral-200 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-300 bg-clip-text text-transparent font-bold">
              GROWXLABS
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-300 uppercase tracking-widest text-[9px]">HIRING</span>
          </div>

          {/* Announcement Copy */}
          <span className="text-xs text-neutral-300 font-normal tracking-tight">
            Connecting top engineering &amp; AI builders directly to global teams.
          </span>

          {/* Luxury Pill CTA Button */}
          <a
            href="https://careers.growxlabs.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-neutral-100 text-neutral-950 text-[11px] font-semibold tracking-tight transition-all duration-150 shadow-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-95 group ml-1 cursor-pointer"
          >
            <span>Explore Roles</span>
            <ArrowRight className="w-3 h-3 text-neutral-950 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Dismiss Button (Pinned cleanly to the right) */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss announcement"
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-neutral-300 hover:bg-white/5 rounded-full transition-all cursor-pointer"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
