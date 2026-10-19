'use client';

import React from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import type { ActionBlock, ActionButton } from '../types';
import { Button } from '@/components/ui/Button';
import {
  Briefcase,
  FileText,
  Code,
  MessageSquare,
  User,
  Zap,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from '@/components/icons';

interface ActionRendererProps {
  block: ActionBlock;
  locale: string;
  onAction?: (actionId: string, payload?: Record<string, any>) => void;
}

export function ActionRenderer({ block, locale, onAction }: ActionRendererProps) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  // Dynamically resolve active locale without hardcoding
  const activeLocale =
    (params?.locale as string | undefined) ||
    locale ||
    pathname?.split('/').filter(Boolean)[0] ||
    'en-in';

  const rawActions = block.actions || [];

  // Filter out any action button with missing, null, or undefined labels or actions
  const actions = rawActions.filter((btn) => {
    if (!btn) return false;
    const label = String(btn.label || '').trim();
    const act = String(btn.action || btn.id || '').trim();
    if (!label || !act) return false;
    const lowerLabel = label.toLowerCase();
    const lowerAct = act.toLowerCase();
    if (
      lowerLabel === 'null' ||
      lowerLabel === 'undefined' ||
      lowerLabel.includes('open null') ||
      lowerLabel.includes('open undefined') ||
      lowerAct === 'null' ||
      lowerAct === 'undefined'
    ) {
      return false;
    }
    return true;
  });

  if (actions.length === 0) return null;

  const handleClick = (btn: ActionButton) => {
    if (onAction) {
      onAction(btn.action || btn.id, btn.payload);
      return;
    }

    // Default route mappings preserving active locale
    const act = (btn.action || btn.id).toLowerCase();
    if (act.includes('resume')) router.push(`/${activeLocale}/resumes`);
    else if (act.includes('job') || act === 'explore_jobs') {
      const tab = btn.payload?.tab || 'recommended';
      router.push(`/${activeLocale}/jobs?tab=${tab}`);
    }
    else if (act.includes('application')) router.push(`/${activeLocale}/applications`);
    else if (act.includes('coding')) router.push(`/${activeLocale}/codingforge`);
    else if (act.includes('interview')) router.push(`/${activeLocale}/mock-interview`);
    else if (act.includes('profile')) router.push(`/${activeLocale}/account?tab=application-profile`);
    else if (act.includes('credit') || act.includes('topup') || act.includes('pricing')) router.push(`/${activeLocale}/pricing`);
    else if (act.includes('study') || act.includes('learn')) router.push(`/${activeLocale}/studyforge`);
  };

  const renderIcon = (iconName?: string, actionName?: string) => {
    const key = (iconName || actionName || '').toLowerCase();
    if (key.includes('job') || key.includes('apply')) return <Briefcase className="w-3.5 h-3.5" />;
    if (key.includes('resume')) return <FileText className="w-3.5 h-3.5" />;
    if (key.includes('coding') || key.includes('code')) return <Code className="w-3.5 h-3.5" />;
    if (key.includes('interview')) return <MessageSquare className="w-3.5 h-3.5" />;
    if (key.includes('profile')) return <User className="w-3.5 h-3.5" />;
    if (key.includes('credit') || key.includes('zap')) return <Zap className="w-3.5 h-3.5 text-amber-400" />;
    return <Sparkles className="w-3.5 h-3.5" />;
  };

  return (
    <div className="my-2 flex flex-wrap gap-2 items-center">
      {block.title && (
        <span className="w-full text-[10px] font-mono text-[#7E7E7E] uppercase tracking-wider block mb-0.5">
          {block.title}
        </span>
      )}
      {actions.map((btn, idx) => (
        <Button
          key={idx}
          size="sm"
          variant={btn.variant === 'outline' ? 'outline' : btn.variant === 'ghost' ? 'ghost' : 'default'}
          className={`h-8 text-xs rounded-lg gap-1.5 font-medium transition-all cursor-pointer ${
            btn.variant === 'primary'
              ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white'
              : !btn.variant
              ? 'bg-[#1A1A1A] border border-[#2E2E2E] text-[#F5F5F5] hover:bg-[#222222]'
              : 'border border-[#242424] text-[#BDBDBD] hover:text-[#F5F5F5] hover:bg-[#151515]'
          }`}
          onClick={() => handleClick(btn)}
        >
          {renderIcon(btn.icon, btn.action)}
          <span>{btn.label}</span>
        </Button>
      ))}
    </div>
  );
}
