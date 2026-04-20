import React from 'react';

/**
 * Shared base components for all ATS-compliant templates.
 * These ensure single-column, semantic HTML, and accessibility.
 */

export const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mt-4 first:mt-0">
    <h2 className="text-[14px] font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-2">
      {title}
    </h2>
    {children}
  </section>
);

export const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="list-disc ml-5 mt-1 space-y-1">
    {items.filter(Boolean).map((item, i) => (
      <li key={i} className="text-[11px] leading-relaxed">
        {item}
      </li>
    ))}
  </ul>
);

export const EntryHeader: React.FC<{ 
  title: string; 
  subtitle?: string; 
  rightText?: string; 
  italicSubtitle?: boolean 
}> = ({ title, subtitle, rightText, italicSubtitle = false }) => (
  <div className="flex justify-between items-baseline gap-4 mb-0.5">
    <div className="flex flex-col">
      <span className="font-bold text-[12px]">{title}</span>
      {subtitle && (
        <span className={`${italicSubtitle ? 'italic' : ''} text-[11px]`}>
          {subtitle}
        </span>
      )}
    </div>
    {rightText && (
      <span className="text-[11px] font-medium whitespace-nowrap">
        {rightText}
      </span>
    )}
  </div>
);
