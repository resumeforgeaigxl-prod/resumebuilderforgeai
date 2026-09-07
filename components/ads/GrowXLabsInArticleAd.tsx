'use client';

import React from 'react';
import { GROWXLABS_CAMPAIGNS } from '@/lib/ads/growxlabs-ads';
import { ArrowRight } from '@/components/icons';

interface GrowXLabsInArticleAdProps {
  campaignKey?: keyof typeof GROWXLABS_CAMPAIGNS;
  className?: string;
}

export default function GrowXLabsInArticleAd({
  campaignKey = 'ai_engineering',
  className = '',
}: GrowXLabsInArticleAdProps) {
  const campaign = GROWXLABS_CAMPAIGNS[campaignKey] || GROWXLABS_CAMPAIGNS.ai_engineering;

  return (
    <aside
      aria-label="Sponsored by GrowXLabs"
      className={`not-prose my-10 p-6 md:p-8 bg-neutral-950 text-white border border-neutral-800 rounded-none shadow-2xl relative overflow-hidden group ${className}`}
    >
      {/* Subtle background glow effect */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Header Pill & Brand Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-none flex items-center justify-center text-[10px] font-mono font-bold text-white tracking-tighter">
              GX
            </span>
            <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase">
              {campaign.badge}
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            {campaign.tagline}
          </span>
        </div>

        {/* Content */}
        <div className="md:flex items-center justify-between gap-6">
          <div className="flex-1 mb-4 md:mb-0">
            <h3 className="text-lg md:text-xl font-bold tracking-tight text-white mb-2 leading-snug">
              {campaign.title}
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed max-w-2xl">
              {campaign.description}
            </p>
          </div>

          {/* CTA Button */}
          <div className="shrink-0">
            <a
              href={campaign.ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-neutral-950 hover:bg-neutral-100 text-xs font-bold font-mono uppercase tracking-wider rounded-sm transition-all duration-150 shadow-md hover:shadow-lg group-hover:translate-x-0.5"
            >
              <span>{campaign.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5 text-neutral-950 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
