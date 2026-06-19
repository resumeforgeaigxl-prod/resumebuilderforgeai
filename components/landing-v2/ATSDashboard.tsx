"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Check, AlertTriangle, HelpCircle } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

interface Metric {
  title: string;
  value: string;
  percent: number;
  status: "tags" | "success" | "text" | "warning";
  statusText?: string;
  tags?: { name: string; missing?: boolean }[];
}

interface RoleData {
  company: string;
  role: string;
  logo: string;
  score: number;
  scoreStatus: "Excellent" | "Good" | "Needs Review";
  scoreColor: string;
  scoreBg: string;
  metrics: Metric[];
}

const rolesData: RoleData[] = [
  {
    company: "Vercel",
    role: "Staff Engineer",
    logo: "▲",
    score: 92,
    scoreStatus: "Excellent",
    scoreColor: "#10B981", // Emerald
    scoreBg: "#ECFDF5",
    metrics: [
      {
        title: "Target Keyword Match",
        value: "95% found",
        percent: 95,
        status: "tags",
        tags: [
          { name: "Next.js" },
          { name: "React" },
          { name: "TypeScript" },
          { name: "Tailwind CSS" },
        ],
      },
      {
        title: "Formatting Issues",
        value: "0 critical issues",
        percent: 100,
        status: "success",
        statusText: "Optimized single-page template",
      },
      {
        title: "Action Verb Strength",
        value: "14 verbs matched",
        percent: 90,
        status: "success",
        statusText: "Strong leadership verb utilization",
      },
      {
        title: "Recruiter Readability",
        value: "Clear hierarchy",
        percent: 95,
        status: "text",
        statusText: "Clean margins and font scale",
      },
    ],
  },
  {
    company: "Stripe",
    role: "Senior Developer",
    logo: "💳",
    score: 76,
    scoreStatus: "Good",
    scoreColor: "#0284C7", // Sky blue
    scoreBg: "#F0F9FF",
    metrics: [
      {
        title: "Target Keyword Match",
        value: "65% found",
        percent: 65,
        status: "tags",
        tags: [
          { name: "Ruby on Rails", missing: true },
          { name: "PostgreSQL" },
          { name: "Redis" },
          { name: "Kafka", missing: true },
        ],
      },
      {
        title: "Formatting Issues",
        value: "1 warning",
        percent: 85,
        status: "warning",
        statusText: "Font size is slightly below 10pt",
      },
      {
        title: "Action Verb Strength",
        value: "8 verbs matched",
        percent: 70,
        status: "text",
        statusText: "Add more financial scaling metrics",
      },
      {
        title: "Recruiter Readability",
        value: "Sufficiently clean",
        percent: 80,
        status: "success",
        statusText: "Consistent margins and layouts",
      },
    ],
  },
  {
    company: "Airbnb",
    role: "Fullstack Engineer",
    logo: "🏡",
    score: 58,
    scoreStatus: "Needs Review",
    scoreColor: "#EF4444", // Rose/Red
    scoreBg: "#FEF2F2",
    metrics: [
      {
        title: "Target Keyword Match",
        value: "40% found",
        percent: 40,
        status: "tags",
        tags: [
          { name: "React Native", missing: true },
          { name: "GraphQL", missing: true },
          { name: "Jest" },
          { name: "Node.js", missing: true },
        ],
      },
      {
        title: "Formatting Issues",
        value: "3 errors",
        percent: 50,
        status: "warning",
        statusText: "Multi-column tables break ATS parsers",
      },
      {
        title: "Action Verb Strength",
        value: "3 weak verbs",
        percent: 45,
        status: "warning",
        statusText: "Avoid vague words like 'worked on'",
      },
      {
        title: "Recruiter Readability",
        value: "Sub-optimal layout",
        percent: 60,
        status: "text",
        statusText: "Typography scale lacks distinction",
      },
    ],
  },
];

function CircularProgress({ score, status, color, bgColor }: {
  score: number;
  status: string;
  color: string;
  bgColor: string;
}) {
  const size = 160;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#EBEBEB"
            strokeWidth={strokeWidth}
          />
          {/* Fill */}
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
            transition={{ duration: 0.6, ease }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            style={{
              fontSize: "48px",
              fontWeight: 600,
              color: "#171717",
              lineHeight: "48px",
              letterSpacing: "-2.4px",
            }}
          >
            {score}
          </span>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 400,
              color: "#8F8F8F",
            }}
          >
            /100
          </span>
        </div>
      </div>
      <p
        className="mt-4"
        style={{
          fontSize: "14px",
          fontWeight: 500,
          color: "#4D4D4D",
        }}
      >
        ATS Match Score
      </p>
      <motion.span
        key={status}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-300"
        style={{
          backgroundColor: bgColor,
          color: color,
        }}
      >
        {status}
      </motion.span>
    </div>
  );
}

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="mt-3 h-1.5 rounded-full bg-[#EBEBEB] overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.6, ease }}
      />
    </div>
  );
}

function MetricCard({ metric, index, color }: {
  metric: Metric;
  index: number;
  color: string;
}) {
  return (
    <motion.div
      className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-5 flex flex-col justify-between"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease, delay: index * 0.06 }}
    >
      <div>
        <p
          className="uppercase tracking-wide"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#8F8F8F",
          }}
        >
          {metric.title}
        </p>
        <p
          className="mt-1"
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#171717",
            lineHeight: "28px",
            letterSpacing: "-0.4px",
          }}
        >
          {metric.value}
        </p>
      </div>

      <div>
        <ProgressBar percent={metric.percent} color={color} />
        <div className="mt-3 flex items-center min-h-[20px]">
          {metric.status === "tags" && metric.tags && (
            <div className="flex flex-wrap gap-1.5">
              {metric.tags.map((tag) => (
                <span
                  key={tag.name}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                    tag.missing
                      ? "bg-rose-50 border-rose-100 text-rose-600 line-through"
                      : "bg-[#F2F2F2] border-transparent text-[#4D4D4D]"
                  }`}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          {metric.status === "success" && (
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" strokeWidth={3} />
              <span className="text-xs text-emerald-700 font-medium">{metric.statusText}</span>
            </div>
          )}
          {metric.status === "warning" && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" strokeWidth={2.5} />
              <span className="text-xs text-rose-600 font-medium">{metric.statusText}</span>
            </div>
          )}
          {metric.status === "text" && (
            <span className="text-xs text-[#4D4D4D] font-medium">{metric.statusText}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ATSDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const currentRole = rolesData[activeTab];

  return (
    <section id="ats-score" className="py-24 px-6 bg-[#FFFFFF]">
      <div className="max-w-[1200px] mx-auto">
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
            ATS Intelligence
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
            Know your resume score before recruiters do
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
            Test your resume compliance against real target role benchmarks. Change target roles in the sandbox below to see live score scans.
          </p>
        </motion.div>

        {/* Dashboard Mockup Container */}
        <motion.div
          className="mt-16 bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
        >
          {/* Chrome Top Bar */}
          <div className="h-12 bg-[#FAFAFA] border-b border-[#EBEBEB] px-5 flex items-center justify-between select-none">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-[#7928CA]" />
              <span className="text-xs font-mono text-[#8F8F8F]">
                resumeforge.ai/ats-live-simulator
              </span>
            </div>
            <div className="w-[60px]" />
          </div>

          {/* Core App Shell Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_2.5fr] divide-y lg:divide-y-0 lg:divide-x divide-[#EBEBEB]">
            
            {/* COLUMN 1: Role Sidebar */}
            <div className="p-4 bg-[#FAFAFA] space-y-2 flex flex-col justify-start">
              <p className="text-[10px] font-mono font-semibold text-[#8F8F8F] uppercase tracking-wider px-2.5 mb-2">
                Target Roles
              </p>
              {rolesData.map((role, idx) => (
                <button
                  key={role.company}
                  onClick={() => setActiveTab(idx)}
                  className={`w-full text-left p-2.5 rounded-xl border flex items-center gap-3 transition-all ${
                    activeTab === idx
                      ? "bg-white border-[#EBEBEB] shadow-sm text-[#171717]"
                      : "bg-transparent border-transparent text-[#4D4D4D] hover:bg-[#F2F2F2]"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-sm transition-all ${
                    activeTab === idx ? "bg-[#171717] border-[#171717] text-white" : "bg-white border-[#EBEBEB] text-[#4D4D4D]"
                  }`}>
                    {role.logo}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">{role.company}</h4>
                    <p className="text-[10px] text-[#8F8F8F] mt-0.5">{role.role}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* COLUMN 2: ATS Circle Gauge */}
            <div className="p-8 flex items-center justify-center bg-white min-h-[260px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <CircularProgress
                    score={currentRole.score}
                    status={currentRole.scoreStatus}
                    color={currentRole.scoreColor}
                    bgColor={currentRole.scoreBg}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* COLUMN 3: Metrics Dashboard */}
            <div className="p-8 bg-white min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {currentRole.metrics.map((metric, index) => (
                    <MetricCard
                      key={metric.title}
                      metric={metric}
                      index={index}
                      color={currentRole.scoreColor}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
