"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AccordionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

export function Accordion({ title, icon, children, className, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={cn("border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02] transition-all", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-14 px-6 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-slate-400">{icon}</div>}
          <span className="text-[10px] font-black uppercase tracking-widest text-white italic">{title}</span>
        </div>
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-slate-500 transition-transform duration-300",
            isOpen && "rotate-180"
          )} 
        />
      </button>
      
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out px-6 pb-6",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <div className="pt-4 border-t border-white/5">
          {children}
        </div>
      </div>
    </div>
  );
}
