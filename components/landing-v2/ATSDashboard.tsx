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
  const size = 150;
  const strokeWidth = 7;
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
            stroke="#EBEBEB"
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
              fontSize: "40px",
              fontWeight: 600,
              color: "#171717",
              lineHeight: "40px",
              letterSpacing: "-2px",
            }}
          >
            {score}
          </span>
          <span
            style={{ fontSize: "12px", fontWeight: 400, color: "#8F8F8F" }}
          >
            /100
          </span>
        </div>
      </div>
      <p
        className="mt-3"
        style={{ fontSize: "13px", fontWeight: 500, color: "#4D4D4D" }}
      >
        ATS Match Score
      </p>
      <motion.span
        key={label}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
        style={{ backgroundColor: bg, color }}
      >
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

  // Reset improvement view when switching tabs
  useEffect(() => {
    setShowImprove(false);
  }, [activeTab]);

  return (
    <section
      id="ats-score"
      className="py-24 px-6 bg-white border-t border-[#EBEBEB]"
    >
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease }}
        >
          <p
            className="uppercase text-[#8F8F8F] tracking-widest"
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: "16px",
            }}
          >
            #04 — ATS Intelligence
          </p>
          <h2
            className="mt-3 text-[#171717]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "32px",
              fontWeight: 400,
              fontStyle: "italic",
              lineHeight: "40px",
              letterSpacing: "-0.01em",
            }}
          >
            Target a role. See your real match score.
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
            Paste any job description and instantly see how your resume stacks
            up — missing keywords, weak bullet points, and exactly what to fix
            to beat the filter.
          </p>
        </motion.div>

        {/* Dashboard Mockup */}
        <motion.div
          className="mt-16 bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.025)]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
        >
          {/* Chrome Top Bar */}
          <div className="h-11 bg-[#FAFAFA] border-b border-[#EBEBEB] px-5 flex items-center justify-between select-none">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] border border-[#E0443E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] border border-[#DEA123]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] border border-[#1AAB29]" />
            </div>
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#8F8F8F]" />
              <span className="text-[11px] font-mono text-[#8F8F8F]">
                ATS Score Analyzer
              </span>
            </div>
            <div className="w-[60px]" />
          </div>

          {/* App Shell: 3 columns */}
          <div className="grid grid-cols-1 lg:grid-cols-[210px_1fr_2.2fr] divide-y lg:divide-y-0 lg:divide-x divide-[#EBEBEB]">
            {/* COL 1: Role Targets */}
            <div className="p-4 bg-[#FAFAFA] space-y-2">
              <p className="text-[9.5px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider px-2.5 mb-2">
                Target Roles
              </p>
              {roleTargets.map((role, idx) => (
                <button
                  key={role.role}
                  onClick={() => setActiveTab(idx)}
                  className={`w-full text-left p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                    activeTab === idx
                      ? "bg-white border-[#EBEBEB] shadow-sm text-[#171717]"
                      : "bg-transparent border-transparent text-[#4D4D4D] hover:bg-[#F2F2F2]"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg border flex items-center justify-center bg-white transition-all"
                    style={{
                      borderColor:
                        activeTab === idx
                          ? role.accentColor
                          : "#EBEBEB",
                    }}
                  >
                    <Target
                      className="w-3.5 h-3.5 transition-colors"
                      style={{
                        color:
                          activeTab === idx
                            ? role.accentColor
                            : "#8F8F8F",
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold leading-tight truncate">
                      {role.role}
                    </h4>
                    <p className="text-[9.5px] text-[#8F8F8F] mt-0.5">
                      {role.company}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* COL 2: Score + Quick Stats */}
            <div className="p-6 flex flex-col items-center justify-center bg-white min-h-[280px] gap-5">
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
                        className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg px-3 py-2.5 text-center"
                      >
                        <p className="text-[8.5px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider flex items-center justify-center gap-1">
                          <Icon className="w-2.5 h-2.5" />
                          {stat.label}
                        </p>
                        <p className="text-sm font-bold text-[#171717] mt-0.5 leading-tight">
                          {stat.value}
                        </p>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* COL 3: Keywords + Improvements */}
            <div className="p-6 bg-white min-h-[300px] flex flex-col">
              {/* Toggle tabs */}
              <div className="flex items-center gap-1 mb-5 bg-[#F5F5F5] rounded-lg p-0.5 self-start">
                <button
                  onClick={() => setShowImprove(false)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                    !showImprove
                      ? "bg-white shadow-sm text-[#171717]"
                      : "text-[#8F8F8F] hover:text-[#4D4D4D]"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Search className="w-3 h-3" />
                    Keyword Analysis
                  </span>
                </button>
                <button
                  onClick={() => setShowImprove(true)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all ${
                    showImprove
                      ? "bg-white shadow-sm text-[#171717]"
                      : "text-[#8F8F8F] hover:text-[#4D4D4D]"
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
                    <p className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider mb-3">
                      Job Description Keywords
                    </p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {current.keywords.map((kw) => (
                        <span
                          key={kw.keyword}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                            kw.found
                              ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]"
                              : "bg-[#FFF7ED] border-[#FED7AA] text-[#9A3412]"
                          }`}
                        >
                          {kw.found ? (
                            <Check
                              className="w-3 h-3 text-emerald-600"
                              strokeWidth={3}
                            />
                          ) : (
                            <AlertTriangle
                              className="w-3 h-3 text-orange-500"
                              strokeWidth={2.5}
                            />
                          )}
                          {kw.keyword}
                        </span>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-[#4D4D4D]">
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
                      <div className="h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden">
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
                        <p className="text-[10.5px] text-[#8F8F8F] flex items-center gap-1.5 pt-0.5">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          Add{" "}
                          <span className="font-semibold text-[#171717]">
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
                    <p className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider mb-1">
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
                        className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-4 space-y-3"
                      >
                        {/* Before */}
                        <div>
                          <p className="text-[9px] font-mono font-bold text-[#D4D4D4] uppercase tracking-wider mb-1">
                            Before
                          </p>
                          <p className="text-[12px] text-[#8F8F8F] leading-relaxed line-through decoration-[#D4D4D4]">
                            {imp.before}
                          </p>
                        </div>
                        {/* After */}
                        <div>
                          <p className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1">
                            After
                          </p>
                          <p className="text-[12px] text-[#171717] leading-relaxed font-medium">
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
        </motion.div>
      </div>
    </section>
  );
}
