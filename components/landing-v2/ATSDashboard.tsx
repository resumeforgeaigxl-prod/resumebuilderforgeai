"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Search,
  Check,
  AlertTriangle,
  ArrowUp,
  TrendingUp,
  Zap,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

/* ─── Data: What users actually see when they use the ATS tool ─── */

interface KeywordItem {
  keyword: string;
  found: boolean;
}

interface Improvement {
  before: string;
  after: string;
  impact: string;
}

interface RoleTarget {
  role: string;
  company: string;
  score: number;
  scoreLabel: string;
  accentColor: string;
  accentBg: string;
  keywords: KeywordItem[];
  improvements: Improvement[];
  stats: {
    keywordsMatched: string;
    formatScore: string;
    impactScore: string;
    readability: string;
  };
}

const roleTargets: RoleTarget[] = [
  {
    role: "Frontend Engineer",
    company: "Vercel",
    score: 92,
    scoreLabel: "Strong Match",
    accentColor: "#10B981",
    accentBg: "#ECFDF5",
    keywords: [
      { keyword: "React", found: true },
      { keyword: "Next.js", found: true },
      { keyword: "TypeScript", found: true },
      { keyword: "CSS-in-JS", found: true },
      { keyword: "Performance", found: true },
      { keyword: "Accessibility", found: false },
      { keyword: "Web Vitals", found: false },
    ],
    improvements: [
      {
        before: "Built web applications using React",
        after: "Architected 3 production Next.js apps serving 50K+ monthly users with 95+ Lighthouse scores",
        impact: "+38% impact",
      },
      {
        before: "Worked on frontend performance",
        after: "Reduced LCP from 4.2s to 1.1s by implementing code-splitting and edge caching strategies",
        impact: "+45% impact",
      },
    ],
    stats: {
      keywordsMatched: "5 of 7",
      formatScore: "98%",
      impactScore: "High",
      readability: "Grade 11",
    },
  },
  {
    role: "Full Stack Developer",
    company: "Stripe",
    score: 78,
    scoreLabel: "Good — Needs Work",
    accentColor: "#F59E0B",
    accentBg: "#FFFBEB",
    keywords: [
      { keyword: "Node.js", found: true },
      { keyword: "PostgreSQL", found: true },
      { keyword: "REST APIs", found: true },
      { keyword: "GraphQL", found: false },
      { keyword: "CI/CD", found: true },
      { keyword: "Microservices", found: false },
      { keyword: "Payment Systems", found: false },
    ],
    improvements: [
      {
        before: "Developed backend APIs for the application",
        after: "Designed RESTful API layer handling 12K req/min with 99.9% uptime across 3 microservices",
        impact: "+42% impact",
      },
      {
        before: "Used databases for storing data",
        after: "Optimized PostgreSQL query performance by 60% through indexing and connection pooling strategies",
        impact: "+51% impact",
      },
    ],
    stats: {
      keywordsMatched: "4 of 7",
      formatScore: "95%",
      impactScore: "Medium",
      readability: "Grade 10",
    },
  },
  {
    role: "Software Engineer II",
    company: "Google",
    score: 85,
    scoreLabel: "Competitive",
    accentColor: "#0070F3",
    accentBg: "#EFF6FF",
    keywords: [
      { keyword: "Data Structures", found: true },
      { keyword: "System Design", found: true },
      { keyword: "Python", found: true },
      { keyword: "Distributed Systems", found: false },
      { keyword: "Testing", found: true },
      { keyword: "Scalability", found: true },
      { keyword: "ML/AI", found: false },
    ],
    improvements: [
      {
        before: "Wrote unit tests for the codebase",
        after: "Achieved 94% test coverage across 3 services using pytest, reducing production incidents by 40%",
        impact: "+36% impact",
      },
      {
        before: "Designed system architecture",
        after: "Led system design of event-driven pipeline processing 2M+ daily events with <200ms p99 latency",
        impact: "+48% impact",
      },
    ],
    stats: {
      keywordsMatched: "5 of 7",
      formatScore: "100%",
      impactScore: "High",
      readability: "Grade 12",
    },
  },
];

/* ─── Circular Score Gauge ─── */

function ScoreGauge({
  score,
  label,
  color,
  bg,
}: {
  score: number;
  label: string;
  color: string;
  bg: string;
}) {
  const size = 140;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e7e5e4"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.7, ease }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: "#1c1917",
              lineHeight: "36px",
              letterSpacing: "-1.5px",
            }}
          >
            {score}
          </span>
          <span
            style={{ fontSize: "11px", fontWeight: 400, color: "#78716c" }}
          >
            /100
          </span>
        </div>
      </div>
      <p
        className="mt-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#78716c]"
      >
        ATS Match Score
      </p>
      <motion.span
        key={label}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border border-[#e7e5e4] bg-white text-stone-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        {label}
      </motion.span>
    </div>
  );
}

/* ─── Main Component ─── */

export default function ATSDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [showImprove, setShowImprove] = useState(false);
  const current = roleTargets[activeTab];

  // 3D Interactive Parallax States
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;
    
    setMouseX(xPx);
    setMouseY(yPx);
    
    const x = xPx / rect.width - 0.5;
    const y = yPx / rect.height - 0.5;
    const maxRotate = 6;
    setRotateX(-y * maxRotate);
    setRotateY(x * maxRotate);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  // Reset improvement view when switching tabs
  useEffect(() => {
    setShowImprove(false);
  }, [activeTab]);

  return (
    <section id="ats-score" className="w-full bg-[#fafaf9] relative overflow-hidden select-none">
      <div className="max-w-[1200px] mx-auto border-x border-[#e7e5e4] bg-white">
        
        {/* Header Block (Full-width, left-aligned) */}
        <div className="px-6 md:px-10 py-16 text-left">
          <span className="font-mono text-[14px] text-rose-500 font-semibold uppercase leading-4 block mb-3 select-none">
            #04 — ATS Intelligence
          </span>
          <h2
            className="text-[#1c1917] font-bold leading-[1.15] text-2xl md:text-[clamp(28px,3vw,40px)] tracking-tight max-w-[640px]"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
            }}
          >
            Target a role. See your real match score.
          </h2>
          <p className="text-sm md:text-base text-stone-500 mt-3 max-w-[560px] leading-relaxed">
            Paste any job description and instantly see how your resume stacks
            up — missing keywords, weak bullet points, and exactly what to fix
            to beat the filter.
          </p>
        </div>

        {/* Mockup Window Container with Landscape Background (FeatureGrid Style) */}
        <div className="px-6 md:px-10 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease }}
            className="relative flex items-center justify-center p-3 sm:p-6 md:p-10 w-full overflow-hidden rounded-2xl"
          >
            {/* Landscape Background Layer */}
            <div
              className="absolute inset-0 bg-cover bg-center pointer-events-none"
              style={{
                backgroundImage: "url('/hero-landscape.png')",
                zIndex: 0,
              }}
            />
            {/* Dark overlay for contrast */}
            <div className="absolute inset-0 bg-slate-950/20 z-0 pointer-events-none" />

            {/* Mockup Window Frame (Glassmorphic 3D Parallax Card) */}
            <div 
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative z-10 w-full max-w-[1040px] overflow-hidden flex flex-col border border-white/10"
              style={{
                background: "rgba(255,255,255,0.96)",
                borderRadius: "16px",
                transformStyle: "preserve-3d",
                transform: isHovered 
                  ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)` 
                  : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
                transition: isHovered 
                  ? 'transform 0.1s ease-out, box-shadow 0.1s ease-out' 
                  : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isHovered 
                  ? "0 35px 70px rgba(0,0,0,0.28), 0 12px 24px rgba(0,0,0,0.16)" 
                  : "0 8px 40px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              {/* Radial gradient shine matching the mouse coordinates */}
              <div 
                className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
                style={{
                  background: isHovered 
                    ? `radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(59, 130, 246, 0.12), rgba(168, 85, 247, 0.04), transparent 60%)` 
                    : 'none',
                  mixBlendMode: 'screen',
                }}
              />

              {/* Chrome Top Bar */}
              <div 
                className="h-11 bg-[#FAFAFA] border-b border-[#e7e5e4] px-5 flex items-center justify-between select-none shrink-0"
                style={{ transform: "translateZ(8px)" }}
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#8F8F8F]" />
                  <span className="text-[11px] font-mono text-[#8F8F8F]">ATS Score Analyzer</span>
                </div>
                <div className="w-[60px]" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[210px_1fr_2.2fr] divide-y lg:divide-y-0 lg:divide-x divide-[#e7e5e4]" style={{ transformStyle: "preserve-3d" }}>
                {/* COL 1: Role Targets */}
                <div 
                  className="p-4 bg-[#fafaf9]"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div style={{ transform: "translateZ(12px)" }} className="space-y-2">
                    <p className="text-[9.5px] font-mono font-semibold text-[#78716c] uppercase tracking-wider px-2.5 mb-2">
                      Target Roles
                    </p>
                    {roleTargets.map((role, idx) => (
                      <button
                        key={role.role}
                        onClick={() => setActiveTab(idx)}
                        className={`w-full text-left p-2.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                          activeTab === idx
                            ? "bg-white border-[#e7e5e4] shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-[#1c1917]"
                            : "bg-transparent border-transparent text-[#78716c] hover:bg-[#e7e5e4]/30 hover:text-[#1c1917]"
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-lg border flex items-center justify-center bg-white transition-all"
                          style={{
                            borderColor:
                              activeTab === idx
                                ? role.accentColor
                                : "#e7e5e4",
                          }}
                        >
                          <Target
                            className="w-3.5 h-3.5 transition-colors"
                            style={{
                              color:
                                activeTab === idx
                                  ? role.accentColor
                                  : "#a8a29e",
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[11px] font-bold leading-tight truncate">
                            {role.role}
                          </h4>
                          <p className="text-[9.5px] text-[#78716c] mt-0.5">
                            {role.company}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* COL 2: Score + Quick Stats */}
                <div 
                  className="p-6 flex flex-col items-center justify-center bg-white min-h-[280px]"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div style={{ transform: "translateZ(28px)" }} className="flex flex-col items-center justify-center gap-5 w-full">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.35, ease }}
                        className="flex flex-col items-center"
                      >
                        <ScoreGauge
                          score={current.score}
                          label={current.scoreLabel}
                          color={current.accentColor}
                          bg={current.accentBg}
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Quick stat cards */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`stats-${activeTab}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 gap-2.5 w-full max-w-[220px]"
                      >
                        {[
                          {
                            label: "Keywords",
                            value: current.stats.keywordsMatched,
                            icon: Search,
                          },
                          {
                            label: "Format",
                            value: current.stats.formatScore,
                            icon: Check,
                          },
                          {
                            label: "Impact",
                            value: current.stats.impactScore,
                            icon: TrendingUp,
                          },
                          {
                            label: "Readability",
                            value: current.stats.readability,
                            icon: Zap,
                          },
                        ].map((stat) => {
                          const Icon = stat.icon;
                          return (
                            <div
                              key={stat.label}
                              className="bg-white border border-[#e7e5e4] rounded-xl px-3 py-2.5 text-center shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                            >
                              <p className="text-[8.5px] font-mono font-semibold text-[#78716c] uppercase tracking-wider flex items-center justify-center gap-1">
                                <Icon className="w-2.5 h-2.5" />
                                {stat.label}
                              </p>
                              <p className="text-sm font-bold text-[#1c1917] mt-0.5 leading-tight">
                                {stat.value}
                              </p>
                            </div>
                          );
                        })}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* COL 3: Keywords + Improvements */}
                <div 
                  className="p-6 bg-white min-h-[300px] flex flex-col"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div style={{ transform: "translateZ(20px)" }} className="flex flex-col flex-1">
                    {/* Toggle tabs */}
                    <div className="flex items-center gap-1 mb-5 border border-[#e7e5e4] rounded-lg p-0.5 self-start bg-transparent">
                      <button
                        onClick={() => setShowImprove(false)}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          !showImprove
                            ? "bg-white border border-[#e7e5e4] text-[#1c1917] shadow-sm"
                            : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Search className="w-3 h-3" />
                          Keyword Analysis
                        </span>
                      </button>
                      <button
                        onClick={() => setShowImprove(true)}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          showImprove
                            ? "bg-white border border-[#e7e5e4] text-[#1c1917] shadow-sm"
                            : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          AI Improvements
                        </span>
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {!showImprove ? (
                        /* ── Keyword Gap Analysis ── */
                        <motion.div
                          key={`kw-${activeTab}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ duration: 0.3, ease }}
                          className="flex-1"
                        >
                          <p className="text-[10px] font-mono font-semibold text-stone-500 uppercase tracking-wider mb-3">
                            Job Description Keywords
                          </p>
                          <div className="flex flex-wrap gap-2 mb-5">
                            {current.keywords.map((kw) => (
                              <span
                                key={kw.keyword}
                                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white border border-[#e7e5e4] text-stone-700 transition-all hover:border-stone-400"
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    kw.found ? "bg-emerald-500" : "bg-orange-500"
                                  }`}
                                />
                                {kw.keyword}
                              </span>
                            ))}
                          </div>

                          {/* Summary */}
                          <div className="bg-white border border-[#e7e5e4] rounded-xl p-4 space-y-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-medium text-stone-600">
                                Keywords found in your resume
                              </span>
                              <span
                                className="text-[12px] font-bold"
                                style={{ color: current.accentColor }}
                              >
                                {current.keywords.filter((k) => k.found).length} of{" "}
                                {current.keywords.length}
                              </span>
                            </div>
                            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor: current.accentColor,
                                }}
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${
                                    (current.keywords.filter((k) => k.found)
                                      .length /
                                      current.keywords.length) *
                                    100
                                  }%`,
                                }}
                                transition={{ duration: 0.6, ease }}
                              />
                            </div>
                            {current.keywords.filter((k) => !k.found).length >
                              0 && (
                              <p className="text-[10.5px] text-stone-500 flex items-center gap-1.5 pt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                Add{" "}
                                <span className="font-semibold text-stone-800">
                                  {current.keywords
                                    .filter((k) => !k.found)
                                    .map((k) => k.keyword)
                                    .join(", ")}
                                </span>{" "}
                                to improve your match
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ) : (
                        /* ── AI Bullet Improvements ── */
                        <motion.div
                          key={`imp-${activeTab}`}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.3, ease }}
                          className="flex-1 space-y-4"
                        >
                          <p className="text-[10px] font-mono font-semibold text-stone-500 uppercase tracking-wider mb-1">
                            Before → After Improvements
                          </p>
                          {current.improvements.map((imp, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.4,
                                ease,
                                delay: idx * 0.1,
                              }}
                              className="bg-white border border-[#e7e5e4] rounded-xl p-4 space-y-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                            >
                              {/* Before */}
                              <div>
                                <p className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider mb-1">
                                  Before
                                </p>
                                <p className="text-[12px] text-stone-500 leading-relaxed line-through decoration-stone-200">
                                  {imp.before}
                                </p>
                              </div>
                              {/* After */}
                              <div>
                                <p className="text-[9px] font-mono font-bold text-emerald-600 uppercase tracking-wider mb-1">
                                  After
                                </p>
                                <p className="text-[12px] text-stone-900 leading-relaxed font-medium">
                                  {imp.after}
                                </p>
                              </div>
                              {/* Impact badge */}
                              <div className="flex items-center gap-1.5">
                                <ArrowUp
                                  className="w-3 h-3 text-emerald-600"
                                  strokeWidth={3}
                                />
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  {imp.impact}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
