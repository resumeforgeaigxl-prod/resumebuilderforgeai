'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight } from '@/components/icons';

interface GrowXLabsDashboardBannerProps {
  className?: string;
}

export default function GrowXLabsDashboardBanner({ className = '' }: GrowXLabsDashboardBannerProps) {
  const [dismissed, setDismissed] = useState(true); // default true to prevent SSR hydration flicker

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem('gx_dash_banner_dismissed');
      if (!isDismissed) {
        setDismissed(false);
      }
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem('gx_dash_banner_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  if (dismissed) return null;

  const careersUrl = 'https://careers.growxlabs.tech/';

  return (
    <aside
      aria-label="GrowXLabs Careers Announcement"
      className={`p-4 bg-gradient-to-r from-neutral-900 via-indigo-950 to-neutral-900 text-white border border-indigo-900/40 rounded-none shadow-md mb-6 relative overflow-hidden ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-none flex items-center justify-center text-[10px] font-mono font-bold text-white shrink-0 mt-0.5">
            GX
          </span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
                GROWXLABS TALENT NETWORK
              </span>
              <span className="text-neutral-500 text-[10px]">•</span>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">HIRING NOW</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
              GrowXLabs connects top engineering talent directly with funded startups and enterprise AI teams. Fast-track your resume and skip the recruiter queue.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          <a
            href={careersUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-bold font-mono uppercase tracking-wider rounded-none transition-all shadow-sm group"
          >
            <span>Explore Roles</span>
            <ArrowRight className="w-3 h-3 text-neutral-950 transition-transform group-hover:translate-x-0.5" />
          </a>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="text-neutral-400 hover:text-white text-xs px-2 py-1 font-mono transition-colors cursor-pointer"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </aside>
  );
}
