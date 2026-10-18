'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from '@/components/icons';
import { cn } from '@/lib/utils';

export interface ContextualNavItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconSrc?: string;
  description?: string;
  badge?: string | number;
}

export interface ContextualWorkspaceLayoutProps<T extends string = string> {
  title: string;
  description?: string;
  navItems: ContextualNavItem<T>[];
  activeId: T;
  onNavChange: (id: T) => void;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  navLabel?: string;
  className?: string;
}

export function ContextualWorkspaceLayout<T extends string = string>({
  title,
  description,
  navItems,
  activeId,
  onNavChange,
  children,
  headerAction,
  className,
}: ContextualWorkspaceLayoutProps<T>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close mobile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const activeItem = navItems.find((item) => item.id === activeId) || navItems[0];

  const NavMark = ({ item, active }: { item: ContextualNavItem<T>; active?: boolean }) => {
    if (item.iconSrc) {
      return (
        <img
          src={item.iconSrc}
          alt=""
          width={22}
          height={22}
          className={cn('h-[22px] w-[22px] shrink-0 object-contain', active ? 'opacity-100' : 'opacity-60')}
        />
      );
    }
    const Icon = item.icon;
    return Icon ? <Icon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-[#f4f5f7]' : 'text-[#8b909a]')} /> : null;
  };

  return (
    <div className={cn("space-y-6 text-[#F5F5F5]", className)}>
      {/* 1. Page Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#8b909a]">Workspace</p>
          <h1
            className="mt-2 !text-[40px] font-normal leading-none tracking-tight text-[#f4f5f7]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#8b909a]">
              {description}
            </p>
          )}
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </header>

      {/* 2. Mobile Contextual Section Selector */}
      <div className="md:hidden relative" ref={mobileMenuRef}>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[#2a2c33] bg-[#0c0d10] px-3.5 py-2.5 text-sm text-[#f4f5f7]"
          aria-expanded={mobileMenuOpen}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {activeItem && <NavMark item={activeItem} active />}
            <span className="truncate">{activeItem?.label}</span>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-[#7E7E7E] transition-transform duration-200 shrink-0",
              mobileMenuOpen && "rotate-180"
            )}
          />
        </button>

        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full z-30 mt-1.5 space-y-0.5 rounded-xl border border-[#2a2c33] bg-[#0c0d10] py-1.5">
            {navItems.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-sm",
                    isActive
                      ? "bg-[#16171b] text-[#f4f5f7]"
                      : "text-[#8b909a] hover:bg-[#121214] hover:text-[#f4f5f7]"
                  )}
                >
                  <NavMark item={item} active={isActive} />
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-[#101010] border border-[#242424] text-[#BDBDBD] font-mono">
                      {item.badge}
                    </span>
                  )}
                  {isActive && item.badge === undefined && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d7e4f0]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Lightweight Two-Column Layout */}
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
        {/* Lightweight Section Menu (No heavy sidebar rail, no boxed panel) */}
        <aside className="hidden md:block w-44 lg:w-48 shrink-0">
          <nav className="sticky top-28 space-y-1" aria-label="Section navigation">
            {navItems.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavChange(item.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm",
                    isActive
                      ? "bg-[#16171b] text-[#f4f5f7]"
                      : "text-[#8b909a] hover:bg-[#121214] hover:text-[#f4f5f7]"
                  )}
                >
                  <NavMark item={item} active={isActive} />
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full bg-[#101010] border border-[#242424] text-[#BDBDBD] font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Dominant Main Content Workspace */}
        <main className="flex-1 min-w-0 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
