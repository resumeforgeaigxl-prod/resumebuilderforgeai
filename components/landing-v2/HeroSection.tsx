"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/* ═══════════════════════════════════════════════
   Animation helpers
   ═══════════════════════════════════════════════ */

const ease = [0.16, 1, 0.3, 1] as const;

const textContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease },
  },
};

const cardContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.5 },
  },
};

const cardFadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease },
  },
};

/* ═══════════════════════════════════════════════
   Sub-components: Hero Preview Cards
   ═══════════════════════════════════════════════ */

const cardShadow =
  "0 2px 2px rgba(0,0,0,0.04), 0 8px 16px -4px rgba(0,0,0,0.06)";

function ResumeDocument3D() {
  return (
    <div className="relative w-[280px] h-[396px] select-none" style={{ transformStyle: "preserve-3d" }}>
      {/* Page 3 (lowest, back) */}
      <div
        className="absolute inset-0 bg-white border border-[#EBEBEB] rounded-sm"
        style={{
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          transform: "translateZ(-16px) rotateX(10deg) rotateY(-10deg) rotateZ(1.5deg) translate(-12px, -12px)",
          opacity: 0.35,
        }}
      />
      {/* Page 2 (middle) */}
      <div
        className="absolute inset-0 bg-white border border-[#EBEBEB] rounded-sm"
        style={{
          boxShadow: "0 8px 20px rgba(0,0,0,0.04)",
          transform: "translateZ(-8px) rotateX(10deg) rotateY(-10deg) rotateZ(1.5deg) translate(-6px, -6px)",
          opacity: 0.65,
        }}
      />
      {/* Page 1 (front) */}
      <div
        className="absolute inset-0 bg-white border border-[#EBEBEB] rounded-sm p-4 text-left flex flex-col font-sans overflow-hidden"
        style={{
          boxShadow: "0 20px 45px -12px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.02)",
          transform: "translateZ(0px) rotateX(10deg) rotateY(-10deg) rotateZ(0.5deg)",
        }}
      >
        {/* Top accent line */}
        <div className="h-1 bg-[#7928CA] w-full mb-3 shrink-0" />
        {/* Header */}
        <div className="mb-3 shrink-0">
          <div className="font-bold text-[8px] text-[#171717] tracking-tight">ALEX RIVERA</div>
          <div className="text-[#7928CA] font-medium text-[4.5px] mt-0.5">Staff Software Engineer</div>
          <div className="text-[#8F8F8F] text-[3.5px] mt-0.5">San Francisco, CA • alex@rivera.dev • github.com/alexrivera</div>
        </div>
        {/* Experience */}
        <div className="space-y-3 flex-1 min-h-0 overflow-hidden">
          <div>
            <div className="font-semibold text-[#171717] border-b border-[#EBEBEB] pb-0.5 mb-1.5 text-[4.5px] tracking-wider">EXPERIENCE</div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between font-medium text-[#171717] text-[4px]">
                  <span>Staff Software Engineer</span>
                  <span className="text-[#8F8F8F] font-normal">2022 - Present</span>
                </div>
                <div className="text-[#7928CA] text-[3.5px] font-medium">Vercel • Next.js Core Team</div>
                <ul className="list-disc pl-2.5 mt-0.5 space-y-0.5 text-[#8F8F8F] text-[3.2px] leading-[4.5px]">
                  <li>Architected Next.js routing and server component performance updates.</li>
                  <li>Reduced serverless cold-start latency by 24% globally across Edge Network.</li>
                </ul>
              </div>
              <div>
                <div className="flex justify-between font-medium text-[#171717] text-[4px]">
                  <span>Senior Developer</span>
                  <span className="text-[#8F8F8F] font-normal">2020 - 2022</span>
                </div>
                <div className="text-[#7928CA] text-[3.5px] font-medium">Linear • Core Sync Team</div>
                <ul className="list-disc pl-2.5 mt-0.5 space-y-0.5 text-[#8F8F8F] text-[3.2px] leading-[4.5px]">
                  <li>Designed high-performance shortcut engine and WebSocket synchronization.</li>
                </ul>
              </div>
            </div>
          </div>
          {/* Skills */}
          <div>
            <div className="font-semibold text-[#171717] border-b border-[#EBEBEB] pb-0.5 mb-1.5 text-[4.5px] tracking-wider">TECHNICAL SKILLS</div>
            <div className="flex flex-wrap gap-1">
              {["TypeScript", "React", "Next.js", "Node.js", "Go", "Kubernetes", "GraphQL", "Docker"].map((skill) => (
                <span key={skill} className="text-[3.2px] font-medium text-[#4D4D4D] bg-[#FAFAFA] border border-[#EBEBEB] px-1.5 py-0.5 rounded-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ATSScoreCard() {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const score = 92;
  const filled = (score / 100) * circumference;

  return (
    <div
      className="group bg-white border border-[#EBEBEB] hover:border-[#171717]/15 rounded-xl p-4 w-[140px] h-[140px] flex flex-col items-center justify-center shadow-[0_2px_2px_rgba(0,0,0,0.04),0_8px_16px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_16px_32px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-default"
    >
      <svg width="80" height="80" viewBox="0 0 100 100" className="mb-1">
        {/* Track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#EBEBEB"
          strokeWidth="7"
        />
        {/* Filled */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#171717"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform="rotate(-90 50 50)"
        />
        <text
          x="50"
          y="48"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#171717"
          className="transition-transform duration-300 origin-center group-hover:scale-[1.05]"
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: "22px",
            fontWeight: 600,
          }}
        >
          {score}
        </text>
        <text
          x="50"
          y="64"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#8F8F8F"
          className="transition-transform duration-300 origin-center group-hover:scale-[1.02]"
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: "10px",
            fontWeight: 400,
          }}
        >
          /100
        </text>
      </svg>
      <p
        className="text-[#8F8F8F]"
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontSize: "11px",
          fontWeight: 400,
        }}
      >
        ATS Score
      </p>
    </div>
  );
}

function AISuggestionsCard() {
  const suggestions = [
    "Add quantified achievements",
    "Include action verbs",
    "Optimize keywords",
  ];

  return (
    <div
      className="group bg-white border border-[#EBEBEB] hover:border-[#171717]/15 rounded-xl p-4 w-[200px] h-[130px] flex flex-col shadow-[0_2px_2px_rgba(0,0,0,0.04),0_8px_16px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_16px_32px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-default"
    >
      <p
        className="text-[#171717] mb-2.5"
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: "20px",
        }}
      >
        AI Suggestions
      </p>
      <div className="flex flex-col gap-2">
        {suggestions.map((text) => (
          <div key={text} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 transition-transform duration-300 group-hover:scale-125" />
            <span
              className="text-[#4D4D4D]"
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "12px",
                fontWeight: 400,
                lineHeight: "16px",
              }}
            >
              {text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillMatchCard() {
  const skills = [
    { name: "React", value: 85 },
    { name: "Node.js", value: 72 },
    { name: "TypeScript", value: 90 },
  ];

  return (
    <div
      className="group bg-white border border-[#EBEBEB] hover:border-[#171717]/15 rounded-xl p-4 w-[160px] h-[144px] flex flex-col shadow-[0_2px_2px_rgba(0,0,0,0.04),0_8px_16px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_16px_32px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-default"
    >
      <p
        className="text-[#171717] mb-2.5"
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontSize: "14px",
          fontWeight: 600,
          lineHeight: "20px",
        }}
      >
        Skill Match
      </p>
      <div className="flex flex-col gap-2">
        {skills.map(({ name, value }) => (
          <div key={name}>
            <div className="flex items-center justify-between mb-0.5">
              <span
                className="text-[#4D4D4D] transition-colors duration-200 group-hover:text-[#171717]"
                style={{
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "11px",
                  fontWeight: 400,
                }}
              >
                {name}
              </span>
              <span
                className="text-[#8F8F8F] transition-colors duration-200 group-hover:text-[#4D4D4D]"
                style={{
                  fontFamily: "var(--font-geist-sans)",
                  fontSize: "10px",
                  fontWeight: 400,
                }}
              >
                {value}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#EBEBEB] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#171717] transition-all duration-300 origin-left group-hover:scale-y-[1.25]"
                style={{ width: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Product Preview Composite
   ═══════════════════════════════════════════════ */

function ProductPreview() {
  return (
    <motion.div
      className="relative w-[480px] h-[450px] hidden lg:block origin-right lg:scale-75 xl:scale-90 2xl:scale-100 transition-transform shrink-0"
      variants={cardContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* Visual Connector Lines linking cards to centerpiece */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" fill="none">
        {/* ATS Score Card connector -> Resume Header */}
        <motion.path
          d="M 380 80 Q 320 60 280 90"
          stroke="rgba(23, 23, 23, 0.12)"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeInOut" }}
        />
        {/* AI Suggestions Card connector -> Experience Section */}
        <motion.path
          d="M 210 360 Q 160 330 140 240"
          stroke="rgba(23, 23, 23, 0.12)"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.2, ease: "easeInOut" }}
        />
        {/* Skill Match Card connector -> Skills Section */}
        <motion.path
          d="M 310 360 Q 285 385 260 365"
          stroke="rgba(23, 23, 23, 0.12)"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1, ease: "easeInOut" }}
        />
      </svg>

      {/* Resume Stack Document — centerpiece (occupies 70%+ of vertical visual area) */}
      <motion.div
        variants={cardFadeUp}
        className="absolute top-[30px] left-[100px] z-10"
      >
        <div className="animate-float-gentle" style={{ animationDelay: "0s" }}>
          <ResumeDocument3D />
        </div>
      </motion.div>

      {/* ATS Score Card — top-right */}
      <motion.div
        variants={cardFadeUp}
        className="absolute top-[10px] right-[10px] z-30"
      >
        <div className="animate-float-gentle" style={{ animationDelay: "0.8s" }}>
          <ATSScoreCard />
        </div>
      </motion.div>

      {/* AI Suggestions Card — bottom-left */}
      <motion.div
        variants={cardFadeUp}
        className="absolute bottom-[30px] left-[10px] z-30"
      >
        <div className="animate-float-gentle" style={{ animationDelay: "1.2s" }}>
          <AISuggestionsCard />
        </div>
      </motion.div>

      {/* Skill Match — bottom-right */}
      <motion.div
        variants={cardFadeUp}
        className="absolute bottom-[20px] right-[15px] z-30"
      >
        <div className="animate-float-gentle" style={{ animationDelay: "0.6s" }}>
          <SkillMatchCard />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   HeroSection
   ═══════════════════════════════════════════════ */

interface HeroSectionProps {
  locale?: string;
}

export default function HeroSection({ locale = "en-in" }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-24 pb-32">
      {/* ── Mesh gradient overlay ── */}
      <div
        className="rf-mesh-gradient pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      />

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto flex max-w-[1200px] items-center justify-between gap-16 px-6">
        {/* ── Left column: text ── */}
        <motion.div
          className="flex max-w-xl flex-col"
          variants={textContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          {/* Eyebrow */}
          <motion.p
            variants={fadeUp}
            className="mb-4 text-[#8F8F8F] uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: "16px",
            }}
          >
            AI Resume Operating System
          </motion.p>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="mb-5 text-[32px] md:text-[48px] text-[#171717]"
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontWeight: 600,
              lineHeight: 1,
              letterSpacing: "-0.05em",
            }}
          >
            Create resumes that
            <br />
            get interviews.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="mb-8 max-w-lg text-[#4D4D4D]"
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "16px",
              fontWeight: 400,
              lineHeight: "24px",
            }}
          >
            ResumeForge AI analyzes your experience, optimizes for ATS systems,
            and generates professional resumes tailored for every role.
          </motion.p>

          {/* CTA row */}
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
            <Link
              href={`/${locale}/ai-resume-builder`}
              className="inline-flex items-center justify-center rounded-full bg-[#171717] px-6 h-11 text-white transition-opacity duration-200 hover:opacity-85"
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "20px",
              }}
            >
              Generate Resume
            </Link>
            <a
              href="#workflow"
              className="inline-flex items-center justify-center rounded-full border border-[#EBEBEB] bg-white px-6 h-11 text-[#171717] transition-colors duration-200 hover:bg-[#F2F2F2]"
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "16px",
                fontWeight: 500,
                lineHeight: "20px",
              }}
            >
              Watch Demo
            </a>
          </motion.div>
        </motion.div>

        {/* ── Right column: product preview ── */}
        <ProductPreview />
      </div>
    </section>
  );
}
