"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  Code2,
  Brain,
  Target,
  BookOpen,
  FolderKanban,
  Compass,
  BriefcaseBusiness,
  ArrowRight,
  User,
  Check
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

interface ForgeItem {
  id: number;
  title: string;
  description: string;
  icon: any;
  accentColor: string;
  bgTint: string;
  borderTint: string;
  textAccent: string;
  path: string;
  statusText: string;
  metric: string;
  x: number;
  y: number;
  relations: number[];
  inputModule: string;
  outputModule: string;
  outcomes: string[];
}

const forges: ForgeItem[] = [
  {
    id: 0,
    title: "ResumeForge",
    description: "AI-powered resume builder specializing in ATS-optimized developer resumes, ensuring you clear recruiter screening filters.",
    icon: FileText,
    accentColor: "#0070F3",
    bgTint: "bg-[#0070F3]/5",
    borderTint: "border-[#0070F3]/10",
    textAccent: "text-[#0070F3]",
    path: "ai-resume-builder",
    statusText: "ATS Sync Active",
    metric: "92% Score",
    x: 410,
    y: 250,
    relations: [5, 7], // ProjectForge, JobForge
    inputModule: "ProjectForge",
    outputModule: "JobForge",
    outcomes: [
      "92%+ average ATS compatibility compliance",
      "Type-safe resume syntax structure checks",
      "Action verb enhancements & bullet optimizer"
    ]
  },
  {
    id: 1,
    title: "CodingForge",
    description: "AI coding practice platform focused on real technical interview problems and data structures to prepare you for tech rounds.",
    icon: Code2,
    accentColor: "#10B981",
    bgTint: "bg-[#10B981]/5",
    borderTint: "border-[#10B981]/10",
    textAccent: "text-[#10B981]",
    path: "codingforge",
    statusText: "Code Engine Ready",
    metric: "48 Solved",
    x: 363,
    y: 363,
    relations: [2, 3], // InterviewForge, PrepForge
    inputModule: "LearnForge",
    outputModule: "InterviewForge",
    outcomes: [
      "Full execution sandbox & test-suite validation",
      "Real-time complexity analysis (Time & Space)",
      "Curated LeetCode patterns & logic guides"
    ]
  },
  {
    id: 2,
    title: "InterviewForge",
    description: "AI mock interview platform providing real-time voice and behavioral feedback so you can practice mock interviews confidently.",
    icon: Brain,
    accentColor: "#7928CA",
    bgTint: "bg-[#7928CA]/5",
    borderTint: "border-[#7928CA]/10",
    textAccent: "text-[#7928CA]",
    path: "interview-prep",
    statusText: "Voice Agent Loaded",
    metric: "Fluent / 88%",
    x: 250,
    y: 410,
    relations: [1, 7], // CodingForge, JobForge
    inputModule: "CodingForge",
    outputModule: "JobForge",
    outcomes: [
      "Real-time voice modulation & speed check",
      "Behavioral alignment scoring & metrics",
      "Interactive transcripts & post-mock audit dashboard"
    ]
  },
  {
    id: 3,
    title: "PrepForge",
    description: "Company-specific preparation modules and study guides tailored for logic patterns and specialized tech employer screenings.",
    icon: Target,
    accentColor: "#F59E0B",
    bgTint: "bg-[#F59E0B]/5",
    borderTint: "border-[#F59E0B]/10",
    textAccent: "text-[#D97706]",
    path: "prepforge",
    statusText: "Company Deck Synced",
    metric: "12 Decks",
    x: 137,
    y: 363,
    relations: [2, 4], // InterviewForge, LearnForge
    inputModule: "JobForge",
    outputModule: "InterviewForge",
    outcomes: [
      "Company-specific question decks (Vercel, Stripe, etc.)",
      "System design templates & behavioral checklists",
      "Pipes interview logic questions into mock agent"
    ]
  },
  {
    id: 4,
    title: "LearnForge",
    description: "AI study tracks and technology syntax guides compiled dynamically based on target roadmap requirements.",
    icon: BookOpen,
    accentColor: "#06B6D4",
    bgTint: "bg-[#06B6D4]/5",
    borderTint: "border-[#06B6D4]/10",
    textAccent: "text-[#0891B2]",
    path: "learnforge",
    statusText: "Study Paths Active",
    metric: "8 Tracks",
    x: 90,
    y: 250,
    relations: [1, 5], // CodingForge, ProjectForge
    inputModule: "CareerForge",
    outputModule: "CodingForge",
    outcomes: [
      "AI-generated study schedules & flashcards",
      "Real-time syntax checklists & roadmap tracker",
      "Dynamic recommendation engine for missing skills"
    ]
  },
  {
    id: 5,
    title: "ProjectForge",
    description: "Developer project showcase and code analysis system to package your Github repositories into recruiter-ready portfolios.",
    icon: FolderKanban,
    accentColor: "#D97706",
    bgTint: "bg-[#D97706]/5",
    borderTint: "border-[#D97706]/10",
    textAccent: "text-[#B45309]",
    path: "projectforge",
    statusText: "GitHub Repos Synced",
    metric: "4 Repos",
    x: 137,
    y: 137,
    relations: [0, 7], // ResumeForge, JobForge
    inputModule: "LearnForge",
    outputModule: "ResumeForge",
    outcomes: [
      "One-click GitHub repository import & indexing",
      "AI codebase complexity & health assessment",
      "Clean responsive portfolio generator"
    ]
  },
  {
    id: 6,
    title: "CareerForge",
    description: "AI-powered career path planner and advisor that outlines long-term engineering roadmaps and target developer positions.",
    icon: Compass,
    accentColor: "#EC4899",
    bgTint: "bg-[#EC4899]/5",
    borderTint: "border-[#EC4899]/10",
    textAccent: "text-[#DB2777]",
    path: "careerforge",
    statusText: "Advisors Online",
    metric: "Active L6",
    x: 250,
    y: 90,
    relations: [4, 0], // LearnForge, ResumeForge
    inputModule: "User Profile",
    outputModule: "LearnForge",
    outcomes: [
      "Interactive developer roadmaps (Frontend, Backend, AI)",
      "Target keyword identification & score tracking",
      "AI career mentor chat with live profile context"
    ]
  },
  {
    id: 7,
    title: "JobForge",
    description: "AI-powered job discovery and referral matching board that links your profile directly to relevant open opportunities.",
    icon: BriefcaseBusiness,
    accentColor: "#F43F5E",
    bgTint: "bg-[#F43F5E]/5",
    borderTint: "border-[#F43F5E]/10",
    textAccent: "text-[#E11D48]",
    path: "jobs",
    statusText: "Referrals Open",
    metric: "4 Matches",
    x: 363,
    y: 137,
    relations: [3, 0], // PrepForge, ResumeForge
    inputModule: "ResumeForge",
    outputModule: "PrepForge",
    outcomes: [
      "Filtered developer role discovery with direct matches",
      "Automated application tailoring & referral tracking",
      "Pipes company data straight to interview preparation"
    ]
  }
];

export default function PlatformEcosystem({ locale = "en-in" }: { locale?: string }) {
  const [activeForge, setActiveForge] = useState(0);

  const activeForgeData = forges[activeForge];
  const ActiveIcon = activeForgeData.icon;

  // Calculates curved quadratic Bezier paths curving outwards away from center (250, 250)
  const getRelationPath = (x1: number, y1: number, x2: number, y2: number) => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    
    const dx = mx - 250;
    const dy = my - 250;
    const shift = 0.22;
    const cx = mx + dx * shift;
    const cy = my + dy * shift;
    
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  };

  return (
    <section id="templates" className="w-full bg-[#fafaf9] relative overflow-hidden select-none">
      <div className="max-w-[1200px] mx-auto border-x border-[#e7e5e4] bg-white">
        
        {/* Header Block (Full-width, left-aligned) */}
        <div className="px-6 md:px-10 py-16 text-left">
          <span className="font-mono text-[14px] text-rose-500 font-semibold uppercase leading-4 block mb-3 select-none">
            #03 — AI Career Operating System
          </span>
          <h2
            className="mt-3 text-[#1c1917] font-bold leading-[1.15] text-2xl md:text-[clamp(28px,3vw,40px)] tracking-tight max-w-[640px]"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
            }}
          >
            The Interconnected Forge Flywheel
          </h2>
          <p
            className="mt-4 text-[#57534e] max-w-2xl"
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "15px",
              fontWeight: 400,
              lineHeight: "22px",
            }}
          >
            Your developer data is never locked in silos. Every action in one Forge updates your profile core, dynamically adapting your study tracks, code sandboxes, mocks, and job targeting.
          </p>
        </div>

        {/* ── Cohesive Mockup Window Box ── */}
        <div className="border-t border-[#e7e5e4] w-full bg-white overflow-hidden flex flex-col select-none">
          
          {/* OS Window Top Bar Controls */}
          <div className="h-10 bg-[#FAFAFA] border-b border-[#e7e5e4] px-4 flex items-center justify-between shrink-0 select-none">
            {/* Dots */}
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
            </div>
            {/* Title */}
            <span className="text-[10px] font-mono text-[#8F8F8F] uppercase tracking-wider font-semibold">
              Ecosystem Dashboard
            </span>
            {/* Active module tag */}
            <span
              className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded border transition-colors ${activeForgeData.bgTint} ${activeForgeData.borderTint} ${activeForgeData.textAccent}`}
            >
              {activeForgeData.title} Online
            </span>
          </div>

          {/* Internal Content (Split Left/Right) */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.28fr_1fr] bg-white divide-y lg:divide-y-0 lg:divide-x divide-[#e7e5e4]">
            
            {/* Left Column: Interactive Radial Web Graph */}
            <div className="relative p-6 flex items-center justify-center bg-[#FAFAFA] min-h-[380px] sm:min-h-[440px] lg:min-h-[480px]">
              {/* Soft grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#EBEBEB_1px,transparent_1px),linear-gradient(to_bottom,#EBEBEB_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none" />

              <svg className="relative z-10 w-full h-full max-w-[440px] aspect-square overflow-visible" viewBox="0 0 500 500">
                <defs>
                  <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={activeForgeData.accentColor} stopOpacity="0.22" />
                    <stop offset="100%" stopColor={activeForgeData.accentColor} stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Central glowing gradient backdrop */}
                <motion.circle
                  key={`glow-${activeForge}`}
                  cx="250"
                  cy="250"
                  r="75"
                  fill="url(#coreGlow)"
                  animate={{ scale: [0.95, 1.1, 0.95] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                />

                {/* Concentric orbital rings */}
                <motion.circle
                  cx="250"
                  cy="250"
                  r="95"
                  fill="none"
                  stroke="#EBEBEB"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                  style={{ transformOrigin: "250px 250px" }}
                />
                <motion.circle
                  cx="250"
                  cy="250"
                  r="125"
                  fill="none"
                  stroke="#EBEBEB"
                  strokeWidth="1"
                  strokeDasharray="3 5"
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                  style={{ transformOrigin: "250px 250px" }}
                />

                {/* Static wires to core */}
                {forges.map((f) => (
                  <line
                    key={`wire-${f.title}`}
                    x1={f.x}
                    y1={f.y}
                    x2={250}
                    y2={250}
                    stroke="#EBEBEB"
                    strokeWidth="1.2"
                  />
                ))}

                {/* Active glowing wire flow */}
                <motion.line
                  key={`active-wire-${activeForge}`}
                  x1={activeForgeData.x}
                  y1={activeForgeData.y}
                  x2={250}
                  y2={250}
                  stroke={activeForgeData.accentColor}
                  strokeWidth="1.5"
                  strokeDasharray="4 6"
                  animate={{ strokeDashoffset: [0, -20] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                />

                {/* Direct relationships wires between active node and related nodes */}
                <AnimatePresence>
                  {activeForgeData.relations.map((relIdx) => {
                    const relForge = forges[relIdx];
                    return (
                      <motion.path
                        key={`rel-path-${activeForge}-${relIdx}`}
                        d={getRelationPath(activeForgeData.x, activeForgeData.y, relForge.x, relForge.y)}
                        fill="none"
                        stroke={activeForgeData.accentColor}
                        strokeWidth="1.2"
                        strokeDasharray="3 5"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.6 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    );
                  })}
                </AnimatePresence>

                {/* Node labels inside the SVG (centered below each node) */}
                {forges.map((f, idx) => {
                  const isActive = activeForge === idx;
                  return (
                    <text
                      key={`label-${f.title}`}
                      x={f.x}
                      y={f.y + 24}
                      textAnchor="middle"
                      className="text-[8px] font-semibold pointer-events-none transition-colors duration-300 font-sans select-none"
                      fill={isActive ? f.accentColor : "#8F8F8F"}
                      style={{ fontWeight: isActive ? 700 : 500 }}
                    >
                      {f.title}
                    </text>
                  );
                })}

                {/* Periphery Node Buttons */}
                {forges.map((f, idx) => {
                  const Icon = f.icon;
                  const isActive = activeForge === idx;
                  const isRelated = activeForgeData.relations.includes(idx);
                  return (
                    <foreignObject
                      key={`node-${f.title}`}
                      x={f.x - 12}
                      y={f.y - 12}
                      width="24"
                      height="24"
                      className="overflow-visible"
                    >
                      <div
                        onMouseEnter={() => setActiveForge(idx)}
                        className={`w-6 h-6 rounded-full border bg-white flex items-center justify-center cursor-pointer transition-all duration-300 ${
                          isActive
                            ? "shadow-sm scale-110"
                            : isRelated
                            ? "border-neutral-300"
                            : "border-[#EBEBEB]"
                        }`}
                        style={{
                          borderColor: isActive ? f.accentColor : isRelated ? `${activeForgeData.accentColor}50` : "#EBEBEB",
                          boxShadow: isActive ? `0 0 12px ${f.accentColor}20` : isRelated ? `0 0 6px ${activeForgeData.accentColor}10` : "none"
                        }}
                      >
                        <Icon
                          className="w-3.5 h-3.5 transition-colors"
                          style={{ color: isActive ? f.accentColor : isRelated ? activeForgeData.accentColor : "#4D4D4D" }}
                        />
                      </div>
                    </foreignObject>
                  );
                })}

                {/* Central Profile Core Node inside SVG */}
                <foreignObject
                  x={250 - 20}
                  y={250 - 20}
                  width="40"
                  height="40"
                  className="overflow-visible pointer-events-none"
                >
                  <div
                    className="w-10 h-10 rounded-full bg-white border flex flex-col items-center justify-center shadow-md transition-all duration-500"
                    style={{
                      borderColor: `${activeForgeData.accentColor}40`,
                      boxShadow: `0 0 20px ${activeForgeData.accentColor}15`
                    }}
                  >
                    <User className="w-3.5 h-3.5 text-neutral-800" />
                    <span className="text-[5px] font-mono font-bold uppercase tracking-wider text-neutral-500 mt-0.5">
                      Core
                    </span>
                  </div>
                </foreignObject>
              </svg>
            </div>

            {/* Right Column: Console Details Inspector (No bottom card!) */}
            <div className="bg-white p-6 sm:p-8 flex flex-col justify-between text-left relative z-10">
              
              {/* Module Header and Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${activeForgeData.bgTint} ${activeForgeData.borderTint}`}
                  >
                    <ActiveIcon className="w-4.5 h-4.5" style={{ color: activeForgeData.accentColor }} />
                  </div>
                  <div>
                    <h3
                      className="text-base font-bold text-[#171717] tracking-tight leading-none"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {activeForgeData.title}
                    </h3>
                    <span
                      className={`text-[8.5px] font-bold font-mono uppercase tracking-wider ${activeForgeData.textAccent} mt-1 block`}
                    >
                      {activeForgeData.statusText} • {activeForgeData.metric}
                    </span>
                  </div>
                </div>

                <p
                  className="text-[13px] text-[#4D4D4D] leading-relaxed"
                  style={{ fontFamily: "var(--font-geist-sans)" }}
                >
                  {activeForgeData.description}
                </p>

                {/* Outcomes Checklist */}
                <div className="space-y-2 pt-1">
                  {activeForgeData.outcomes.map((outcome) => (
                    <div key={outcome} className="flex items-center gap-2.5 text-[11.5px] text-[#4D4D4D]">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${activeForgeData.accentColor}10` }}
                      >
                        <Check className="w-2.5 h-2.5" style={{ color: activeForgeData.accentColor }} />
                      </div>
                      <span className="font-medium" style={{ fontFamily: "var(--font-geist-sans)" }}>
                        {outcome}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Pipelines Flow (Console-style Integration) */}
              <div className="border-t border-[#F2F2F2] pt-5 mt-6">
                <h4 className="text-[9.5px] font-mono font-bold text-neutral-400 uppercase tracking-widest mb-3 select-none">
                  Ecosystem Data Pipelines
                </h4>
                
                <div className="space-y-3">
                  {/* Pipeline display: Input Source */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8F8F8F] font-medium" style={{ fontFamily: "var(--font-geist-sans)" }}>Pulls Context From</span>
                    <span className="font-mono text-[10px] border border-[#EBEBEB] bg-[#FAFAFA] rounded px-2 py-0.5 font-bold text-[#171717]">
                      {activeForgeData.inputModule}
                    </span>
                  </div>

                  {/* Pipeline display: Output Target */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#8F8F8F] font-medium" style={{ fontFamily: "var(--font-geist-sans)" }}>Feeds Intelligence To</span>
                    <span
                      className="font-mono text-[10px] border rounded px-2 py-0.5 font-bold text-white"
                      style={{
                        backgroundColor: activeForgeData.accentColor,
                        borderColor: activeForgeData.accentColor
                      }}
                    >
                      {activeForgeData.outputModule}
                    </span>
                  </div>
                </div>

                <div className="mt-5 text-right select-none">
                  <Link
                    href={`/${locale}/${activeForgeData.path}`}
                    className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${activeForgeData.textAccent} hover:opacity-80 transition-opacity`}
                  >
                    <span>Launch Active Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
