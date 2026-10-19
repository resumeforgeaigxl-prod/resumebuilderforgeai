"use client";

import * as React from "react";
import { ChevronDown } from "@/components/icons";
import { cn } from "@/lib/utils";

interface AccordionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
  tone?: "light" | "dark";
}

export function Accordion({ title, icon, children, className, defaultOpen = false, tone = "light" }: AccordionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const dark = tone === "dark";

  return (
    <div className={cn(dark ? "border border-[#2a2c33] rounded-xl overflow-hidden bg-[#16171b] transition-all" : "border border-[#EBEBEB] rounded-xl overflow-hidden bg-white transition-all", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn("w-full h-12 px-6 flex items-center justify-between text-left transition-colors", dark ? "hover:bg-[#1c1d22]" : "hover:bg-[#FAFAFA]")}
      >
        <div className="flex items-center gap-3">
          {icon && <div className={dark ? "text-[#8b909a]" : "text-[#8F8F8F]"}>{icon}</div>}
          <span className={cn("text-xs font-semibold uppercase tracking-wider", dark ? "text-[#f4f5f7]" : "text-[#171717]")}>{title}</span>
        </div>
        <ChevronDown 
          className={cn(
            "w-4 h-4 transition-transform duration-300",
            dark ? "text-[#8b909a]" : "text-[#8F8F8F]",
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
        <div className={cn("pt-4 border-t", dark ? "border-[#2a2c33] text-[#b4b8c2]" : "border-[#EBEBEB] text-[#4D4D4D]")}>
          {children}
        </div>
      </div>
    </div>
  );
}
