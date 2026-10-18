'use client';

import React, { useState } from 'react';
import { ArrowRight, X } from '@/components/icons';

export default function GrowXLabsTopBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside
      aria-label="GrowXLabs Talent Announcement"
      className="relative z-50 w-full border-b border-[#2a2c33] bg-[#0c0d10] text-[#b4b8c2] select-none"
    >
      <div className="mx-auto flex h-9 max-w-[1120px] items-center justify-center px-8 relative">
        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-center text-[12px] leading-none">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8b909a]">
            GrowXLabs · Hiring
          </span>
          <span className="hidden text-[#2e3138] sm:inline" aria-hidden="true">/</span>
          <span className="hidden text-[#b4b8c2] sm:inline">
            Connecting top engineering and AI builders to global teams.
          </span>
          <a
            href="https://careers.growxlabs.tech/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-[#f4f5f7] underline decoration-[#2e3138] underline-offset-4 hover:decoration-[#f4f5f7]"
          >
            Explore roles
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </a>
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss announcement"
          className="absolute right-4 top-1/2 hidden -translate-y-1/2 p-1 text-[#8b909a] hover:text-[#f4f5f7] sm:flex"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  );
}
