"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { ChevronDown, Check } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  className,
  icon,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);
  const isPlaceholder = !selectedOption || selectedOption.value === "unknown" || selectedOption.value === "";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "flex h-11 w-full cursor-pointer items-center justify-between rounded-xl border border-[#2a2c33] bg-[#121214] px-3.5 text-sm text-[#f4f5f7] outline-none transition-colors hover:border-[#3a3d46] focus:border-[#3a3d46] disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-[#3a3d46]",
            className
          )}
        >
          <div className="flex items-center gap-2.5 truncate">
            {icon && <span className="shrink-0 text-[#7E7E7E]">{icon}</span>}
            <span
              className={cn(
                "truncate text-left",
                isPlaceholder ? "text-[#7E7E7E]" : "text-[#F5F5F5]"
              )}
            >
              {isPlaceholder ? placeholder : selectedOption?.label}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-[#7E7E7E] shrink-0 ml-2 transition-transform duration-200",
              open && "rotate-180 text-[#d7e4f0]"
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="z-50 max-h-64 w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] overflow-y-auto rounded-xl border border-[#2a2c33] bg-[#0c0d10] p-1.5"
      >
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <DropdownMenuItem
              key={opt.value}
              onSelect={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg cursor-pointer transition-colors outline-none",
                isSelected
                  ? "bg-[#16171b] text-[#f4f5f7]"
                  : "text-[#b4b8c2] hover:bg-[#16171b] hover:text-[#f4f5f7] focus:bg-[#16171b] focus:text-[#f4f5f7]"
              )}
            >
              <div className="flex flex-col text-left">
                <span>{opt.label}</span>
                {opt.description && (
                  <span className="text-[10px] text-[#7E7E7E] font-normal">{opt.description}</span>
                )}
              </div>
              {isSelected && <Check className="ml-2 h-3.5 w-3.5 shrink-0 text-[#d7e4f0]" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
