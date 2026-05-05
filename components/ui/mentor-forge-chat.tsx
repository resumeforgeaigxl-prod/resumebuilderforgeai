"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  FileText,
  Code2,
  Mic,
  Briefcase,
  GraduationCap,
  ArrowUpIcon,
  Paperclip,
  PlusIcon,
} from "lucide-react";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;

      const newHeight = Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY
        )
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

export function MentorForgeChat() {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        setValue("");
        adjustHeight(true);
      }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 space-y-8">
      {/* Heading with gradient */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00D4A0]/15 bg-[#00D4A0]/8 text-[#00D4A0] text-xs font-semibold uppercase tracking-[0.15em]">
          <Sparkles className="w-3.5 h-3.5" />
          MentorForge AI
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-[#00D4A0] to-[#7C5CFC] bg-clip-text text-transparent">
            What career move
          </span>{" "}
          <span className="text-[#EFF4FB]">can I help you make?</span>
        </h1>
        <p className="text-[#7A8BA8] text-sm max-w-md mx-auto">
          Your AI career mentor across the entire Forge ecosystem
        </p>
      </div>

      {/* Chat Input */}
      <div className="w-full">
        <div className="relative rounded-2xl border border-[#1E2A42] bg-[#0D1220] shadow-[0_0_60px_-20px_rgba(0,212,160,0.1)] transition-all duration-300 focus-within:border-[#00D4A0]/30 focus-within:shadow-[0_0_60px_-10px_rgba(0,212,160,0.15)]">
          {/* Animated top edge */}
          <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#00D4A0]/30 to-transparent" />

          <div className="overflow-y-auto">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about resumes, coding prep, interviews, career roadmaps..."
              className={cn(
                "w-full px-5 py-4",
                "resize-none",
                "bg-transparent",
                "border-none",
                "text-[#EFF4FB] text-sm",
                "focus:outline-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-[#4A5568] placeholder:text-sm",
                "min-h-[60px]"
              )}
              style={{ overflow: "hidden" }}
            />
          </div>

          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="group p-2 hover:bg-[#121A2E] rounded-lg transition-all duration-200 flex items-center gap-1.5"
              >
                <Paperclip className="w-4 h-4 text-[#7A8BA8] group-hover:text-[#00D4A0] transition-colors" />
                <span className="text-xs text-[#4A5568] hidden group-hover:inline transition-opacity group-hover:text-[#7A8BA8]">
                  Attach
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-sm text-[#7A8BA8] transition-all duration-200 border border-dashed border-[#1E2A42] hover:border-[#00D4A0]/30 hover:bg-[#121A2E] hover:text-[#00D4A0] flex items-center justify-between gap-1.5"
              >
                <PlusIcon className="w-4 h-4" />
                Forge
              </button>
              <button
                type="button"
                className={cn(
                  "p-2 rounded-lg text-sm transition-all duration-300 flex items-center justify-between gap-1",
                  value.trim()
                    ? "bg-[#00D4A0] text-[#080B16] shadow-[0_4px_20px_rgba(0,212,160,0.3)] hover:shadow-[0_8px_30px_rgba(0,212,160,0.4)]"
                    : "text-[#4A5568] border border-[#1E2A42]"
                )}
              >
                <ArrowUpIcon
                  className={cn(
                    "w-4 h-4",
                    value.trim() ? "text-[#080B16]" : "text-[#4A5568]"
                  )}
                />
                <span className="sr-only">Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
          <ActionButton
            icon={<FileText className="w-4 h-4" />}
            label="Build Resume"
            accentColor="#00D4A0"
          />
          <ActionButton
            icon={<Code2 className="w-4 h-4" />}
            label="Coding Practice"
            accentColor="#7C5CFC"
          />
          <ActionButton
            icon={<Mic className="w-4 h-4" />}
            label="Mock Interview"
            accentColor="#F5A623"
          />
          <ActionButton
            icon={<Briefcase className="w-4 h-4" />}
            label="Job Search"
            accentColor="#00D4A0"
          />
          <ActionButton
            icon={<GraduationCap className="w-4 h-4" />}
            label="Career Roadmap"
            accentColor="#7C5CFC"
          />
        </div>
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  accentColor?: string;
}

function ActionButton({ icon, label, accentColor = "#00D4A0" }: ActionButtonProps) {
  return (
    <button
      type="button"
      className="group flex items-center gap-2 px-4 py-2.5 bg-[#0D1220] hover:bg-[#121A2E] rounded-full border border-[#1E2A42] hover:border-[#1E2A42]/80 text-[#7A8BA8] hover:text-[#EFF4FB] transition-all duration-300 hover:shadow-lg"
      style={{
        // @ts-ignore
        "--hover-glow": `0 0 24px ${accentColor}15`,
      }}
    >
      <span style={{ color: accentColor }} className="transition-transform group-hover:scale-110 duration-200">
        {icon}
      </span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
