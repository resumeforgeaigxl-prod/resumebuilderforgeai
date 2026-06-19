"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

function CircularProgress() {
  const size = 160;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const score = 92;
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
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#171717"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
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
            92
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
        Resume Score
      </p>
      <span
        className="mt-2 inline-flex items-center px-3 py-1 rounded-full"
        style={{
          backgroundColor: "#ECFDF5",
          color: "#065F46",
          fontSize: "12px",
          fontWeight: 500,
        }}
      >
        Excellent
      </span>
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="mt-3 h-1.5 rounded-full bg-[#EBEBEB] overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-[#171717]"
        initial={{ width: 0 }}
        whileInView={{ width: `${percent}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease, delay: 0.3 }}
      />
    </div>
  );
}

const metrics = [
  {
    title: "Missing Keywords",
    value: "3 found",
    percent: 85,
    status: "tags" as const,
    tags: ["TypeScript", "CI/CD", "Agile"],
  },
  {
    title: "Formatting Issues",
    value: "1 minor",
    percent: 95,
    status: "success" as const,
    statusText: "Mostly clean",
  },
  {
    title: "Content Strength",
    value: "88/100",
    percent: 88,
    status: "text" as const,
    statusText: "12 strong bullets detected",
  },
  {
    title: "Recruiter Readability",
    value: "94/100",
    percent: 94,
    status: "success" as const,
    statusText: "Clear and scannable",
  },
];

function MetricCard({
  metric,
  index,
}: {
  metric: (typeof metrics)[number];
  index: number;
}) {
  return (
    <motion.div
      className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-5"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease, delay: 0.2 + index * 0.08 }}
    >
      <p
        className="uppercase"
        style={{
          fontSize: "12px",
          fontWeight: 500,
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
      <ProgressBar percent={metric.percent} />
      <div className="mt-3">
        {metric.status === "tags" && metric.tags && (
          <div className="flex flex-wrap gap-1.5">
            {metric.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded bg-[#F2F2F2]"
                style={{
                  fontSize: "12px",
                  color: "#4D4D4D",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {metric.status === "success" && (
          <div className="flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className="flex-shrink-0"
            >
              <path
                d="M11.667 3.5L5.25 9.917 2.333 7"
                stroke="#065F46"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ fontSize: "12px", color: "#065F46" }}>
              {metric.statusText}
            </span>
          </div>
        )}
        {metric.status === "text" && (
          <span style={{ fontSize: "12px", color: "#4D4D4D" }}>
            {metric.statusText}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function ATSDashboard() {
  return (
    <section id="ats-score" className="py-24 px-6">
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
            className="uppercase text-[#8F8F8F]"
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.05em",
            }}
          >
            ATS Intelligence
          </p>
          <h2
            className="mt-3"
            style={{
              fontSize: "32px",
              fontWeight: 600,
              lineHeight: "40px",
              letterSpacing: "-1.28px",
              color: "#171717",
            }}
          >
            Know your resume score before recruiters do
          </h2>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          className="mt-16 bg-white border border-[#EBEBEB] rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
        >
          {/* Window chrome top bar */}
          <div className="h-12 bg-[#FAFAFA] border-b border-[#EBEBEB] px-5 flex items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#FF5F57]" />
              <div className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
              <div className="w-2 h-2 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex items-center gap-4 mx-auto">
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#171717" }}>
                Overview
              </span>
              <span style={{ fontSize: "12px", fontWeight: 400, color: "#8F8F8F" }}>
                Keywords
              </span>
              <span style={{ fontSize: "12px", fontWeight: 400, color: "#8F8F8F" }}>
                Format
              </span>
            </div>
            {/* Spacer for centering */}
            <div className="w-[52px]" />
          </div>

          {/* Main content */}
          <div className="p-8 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
            {/* Left — Score */}
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease, delay: 0.15 }}
            >
              <CircularProgress />
            </motion.div>

            {/* Right — Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.map((metric, index) => (
                <MetricCard key={metric.title} metric={metric} index={index} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
