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
    x: 690,
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
    x: 605,
    y: 374,
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
    x: 400,
    y: 425,
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
    x: 195,
    y: 374,
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
    x: 110,
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
    x: 195,
    y: 126,
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
    x: 400,
    y: 75,
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
    x: 605,
    y: 126,
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

  // Calculates curved quadratic Bezier paths between nodes
  const getRelationPath = (x1: number, y1: number, x2: number, y2: number) => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    // Bend curve slightly based on coordinates to make wires look beautiful
    const bend = y1 > 250 && y2 > 250 ? 35 : -35;
    return `M ${x1} ${y1} Q ${mx} ${my + bend} ${x2} ${y2}`;
  };

  return (
    <section id="templates" className="py-24 px-6 overflow-hidden bg-white border-t border-[#EBEBEB]">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease }}
        >
          <p
            className="uppercase text-[#8F8F8F]"
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.05em",
            }}
          >
            AI Career Operating System
          </p>
          <h2
            className="mt-3 text-[#171717]"
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "32px",
              fontWeight: 600,
              lineHeight: "40px",
              letterSpacing: "-1.28px",
            }}
          >
            The Interconnected Forge Flywheel
          </h2>
          <p
            className="mt-4 mx-auto max-w-2xl text-[#4D4D4D]"
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: "24px",
            }}
          >
            Your developer data is never locked in silos. Every action in one Forge updates your profile core, dynamically adapting your study tracks, code sandboxes, mocks, and job targeting.
          </p>
        </motion.div>

        {/* ── Main Radial Visualizer Stage ── */}
        <div className="relative w-full aspect-[8/5] max-w-[900px] mx-auto mt-16 select-none bg-white border border-[#EBEBEB] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#FAFAFA_1px,transparent_1px),linear-gradient(to_bottom,#FAFAFA_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          {/* SVG Canvas for lines and pulses */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500">
            {/* Ambient Profile Core Pulse Ring */}
            <motion.circle
              cx="400"
              cy="250"
              r="70"
              fill="none"
              stroke={`${activeForgeData.accentColor}10`}
              strokeWidth="2"
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            />

            {/* Static thin connection lines between center core and periphery nodes */}
            {forges.map((f) => (
              <line
                key={`wire-${f.title}`}
                x1={f.x}
                y1={f.y}
                x2={400}
                y2={250}
                stroke="#F2F2F2"
                strokeWidth="1.2"
              />
            ))}

            {/* Active pulsing wire from active node to center core */}
            <motion.line
              key={`active-wire-${activeForge}`}
              x1={activeForgeData.x}
              y1={activeForgeData.y}
              x2={400}
              y2={250}
              stroke={activeForgeData.accentColor}
              strokeWidth="1.5"
              strokeDasharray="4 6"
              animate={{ strokeDashoffset: [0, -20] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />

            {/* Dynamic direct relationship lines connecting active node to related nodes */}
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

            {/* Labels under the nodes */}
            {forges.map((f, idx) => {
              const isActive = activeForge === idx;
              return (
                <text
                  key={`label-${f.title}`}
                  x={f.x}
                  y={f.y + 36}
                  textAnchor="middle"
                  className={`text-[10px] font-medium pointer-events-none transition-all duration-300 font-sans select-none`}
                  fill={isActive ? f.accentColor : "#8F8F8F"}
                  style={{ fontWeight: isActive ? 700 : 500 }}
                >
                  {f.title}
                </text>
              );
            })}

            {/* Nodes Placement */}
            {forges.map((f, idx) => {
              const Icon = f.icon;
              const isActive = activeForge === idx;
              const isRelated = activeForgeData.relations.includes(idx);
              return (
                <foreignObject
                  key={`node-${f.title}`}
                  x={f.x - 18}
                  y={f.y - 18}
                  width="36"
                  height="36"
                  className="overflow-visible"
                >
                  <div
                    onMouseEnter={() => setActiveForge(idx)}
                    className={`w-9 h-9 rounded-full border bg-white flex items-center justify-center cursor-pointer transition-all duration-300 ${
                      isActive
                        ? "shadow-md scale-110"
                        : isRelated
                        ? "border-neutral-300"
                        : "border-[#EBEBEB]"
                    }`}
                    style={{
                      borderColor: isActive ? f.accentColor : isRelated ? `${activeForgeData.accentColor}50` : "#EBEBEB",
                      boxShadow: isActive ? `0 0 16px ${f.accentColor}25` : isRelated ? `0 0 8px ${activeForgeData.accentColor}10` : "none"
                    }}
                  >
                    <Icon
                      className="w-4 h-4 transition-colors"
                      style={{ color: isActive ? f.accentColor : isRelated ? activeForgeData.accentColor : "#4D4D4D" }}
                    />
                  </div>
                </foreignObject>
              );
            })}
          </svg>

          {/* Centered User Profile Node (CORE) */}
          <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] flex items-center justify-center pointer-events-none">
            <div
              className="w-18 h-18 rounded-full bg-white border flex flex-col items-center justify-center shadow-lg transition-all duration-500"
              style={{
                borderColor: `${activeForgeData.accentColor}40`,
                boxShadow: `0 0 25px ${activeForgeData.accentColor}15`
              }}
            >
              <User className="w-5 h-5 text-neutral-800" />
              <span className="text-[7.5px] font-mono font-bold uppercase tracking-wider text-neutral-500 mt-1">
                Profile
              </span>
            </div>
          </div>
        </div>

        {/* ── Console Inspector Panel (Bottom) ── */}
        <div className="mt-8 bg-white border border-[#EBEBEB] rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.01)] text-left flex flex-col md:flex-row justify-between gap-8 relative select-none">
          {/* Top colored accent line matching hovered Forge */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl transition-colors duration-500"
            style={{ backgroundColor: activeForgeData.accentColor }}
          />

          {/* Left Details Block */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              {/* Mini Icon Tag */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${activeForgeData.bgTint} ${activeForgeData.borderTint}`}
              >
                <ActiveIcon className="w-4 h-4" style={{ color: activeForgeData.accentColor }} />
              </div>
              <div>
                <h3
                  className="text-lg font-bold text-[#171717] tracking-tight leading-none"
                  style={{ fontFamily: "var(--font-geist-sans)" }}
                >
                  {activeForgeData.title}
                </h3>
                <span
                  className={`text-[9px] font-bold font-mono uppercase tracking-wider ${activeForgeData.textAccent} mt-1 block`}
                >
                  {activeForgeData.statusText} • {activeForgeData.metric}
                </span>
              </div>
            </div>

            <p
              className="text-[13.5px] text-[#4D4D4D] leading-relaxed max-w-xl"
              style={{ fontFamily: "var(--font-geist-sans)" }}
            >
              {activeForgeData.description}
            </p>

            {/* outcomes list */}
            <div className="space-y-2 pt-2">
              {activeForgeData.outcomes.map((outcome) => (
                <div key={outcome} className="flex items-center gap-2.5 text-xs text-[#4D4D4D]">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center"
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

          {/* Right Pipeline integration block */}
          <div className="w-full md:w-[280px] border-t md:border-t-0 md:border-l border-[#F2F2F2] pt-6 md:pt-0 md:pl-8 flex flex-col justify-center">
            <h4
              className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest mb-3.5"
            >
              Ecosystem Data Pipelines
            </h4>
            <div className="space-y-4">
              {/* Input Feed */}
              <div className="text-left">
                <span className="text-[9px] text-[#8F8F8F] uppercase font-bold tracking-wider">Pulls context from</span>
                <div className="flex items-center gap-2 mt-1.5 font-mono text-[10.5px] border border-[#EBEBEB] bg-[#FAFAFA] rounded-md px-2.5 py-1.5 font-semibold text-[#171717]">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                  <span>{activeForgeData.inputModule}</span>
                </div>
              </div>

              {/* Central Active Node */}
              <div className="flex justify-center select-none text-[#8F8F8F]">
                <div className="h-4 border-l border-dashed border-neutral-300" />
              </div>

              {/* Output Feed */}
              <div className="text-left">
                <span className="text-[9px] text-[#8F8F8F] uppercase font-bold tracking-wider">Feeds intelligence to</span>
                <div className="flex items-center gap-2 mt-1.5 font-mono text-[10.5px] border border-[#EBEBEB] bg-[#FAFAFA] rounded-md px-2.5 py-1.5 font-semibold text-[#171717]">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: activeForgeData.accentColor }}
                  />
                  <span>{activeForgeData.outputModule}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
