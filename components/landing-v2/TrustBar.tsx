"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Brain,
  Code2,
  Target,
  FolderKanban,
  BriefcaseBusiness,
  Compass,
  FileText
} from "lucide-react";

interface Capability {
  icon: any;
  label: string;
  accentColor: string;
}

const capabilities: Capability[] = [
  { icon: Shield, label: "ATS Optimization", accentColor: "#0070F3" },
  { icon: Brain, label: "AI Mock Interviews", accentColor: "#7928CA" },
  { icon: Code2, label: "LeetCode Practice", accentColor: "#10B981" },
  { icon: Target, label: "Company Study Decks", accentColor: "#F59E0B" },
  { icon: FolderKanban, label: "GitHub Portfolios", accentColor: "#D97706" },
  { icon: BriefcaseBusiness, label: "Job Discovery", accentColor: "#F43F5E" },
  { icon: Compass, label: "Skill Gap Analysis", accentColor: "#EC4899" },
  { icon: FileText, label: "PDF Resume Export", accentColor: "#06B6D4" }
];

// Duplicate list for infinite scroll animation loop
const duplicatedCapabilities = [...capabilities, ...capabilities, ...capabilities];

export default function TrustBar() {
  return (
    <section className="w-full border-y border-[#EBEBEB] bg-[#FAFAFA]/50 py-7 overflow-hidden relative select-none">
      
      {/* Ambient Left/Right blurred gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-20 md:w-36 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 md:w-36 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

      {/* Infinite Horizontal Ticker Row */}
      <div className="flex items-center w-full max-w-[1400px] mx-auto overflow-hidden">
        <motion.div
          className="flex gap-8 whitespace-nowrap pr-8"
          animate={{ x: ["0%", "-33.33%"] }}
          transition={{
            repeat: Infinity,
            duration: 25,
            ease: "linear"
          }}
        >
          {duplicatedCapabilities.map(({ icon: Icon, label, accentColor }, index) => (
            <div
              key={`${label}-${index}`}
              className="inline-flex items-center gap-2.5 border border-[#EBEBEB] bg-white px-5 py-2.5 rounded-full text-xs font-semibold text-[#171717] shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:border-neutral-300 transition-colors cursor-pointer group"
            >
              <Icon
                className="w-4 h-4 text-[#8F8F8F] group-hover:scale-105 transition-all duration-300"
                style={{ color: "#8F8F8F" }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.color = accentColor;
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.color = "#8F8F8F";
                }}
              />
              <span style={{ fontFamily: "var(--font-geist-sans)" }}>
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

    </section>
  );
}
