"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Lightbulb, Briefcase, Award, User, Check } from "lucide-react";


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
   Sub-components: Hero Preview Cards (Reactive & Animated)
   ═══════════════════════════════════════════════ */

const cardShadow =
  "0 2px 2px rgba(0,0,0,0.04), 0 8px 16px -4px rgba(0,0,0,0.06)";

// Centerpiece: Target Pixel Art Landscape
function PixelArtLandscape() {
  return (
    <div className="relative w-[600px] h-[300px] rounded-2xl overflow-hidden border border-[#EBEBEB] shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
      {/* Background Mountain Layer */}
      <img
        src="/hero-landscape.png"
        alt="Pixel Art Mountain Forest Landscape"
        className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
      />
      {/* Soft Ambient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
    </div>
  );
}

// Focal Point: Embedded Realistic Resume
function EmbeddedResumeCard() {
  return (
    <div
      className="relative w-[210px] h-[296px] bg-white rounded-xl border border-[#EBEBEB] p-3 text-left flex flex-col font-sans select-none shadow-[0_20px_50px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.02)]"
      style={{ transform: "rotateX(6deg) rotateY(-8deg) rotateZ(0.5deg)" }}
    >
      {/* Top accent bar */}
      <div className="h-0.5 bg-[#7928CA] w-full mb-2 shrink-0" />
      
      {/* Header */}
      <div className="mb-2 shrink-0">
        <div className="font-bold text-[7px] text-[#171717] tracking-tight">ALEX RIVERA</div>
        <div className="text-[#7928CA] font-medium text-[4px] mt-0.5">Staff Software Engineer</div>
        <div className="text-[#8F8F8F] text-[3px] mt-0.5">Vercel • Next.js Core Team</div>
      </div>

      {/* Experience block */}
      <div className="space-y-2 flex-1 min-h-0 overflow-hidden">
        <div>
          <div className="font-semibold text-[#171717] border-b border-[#EBEBEB] pb-0.5 mb-1 text-[3.5px] tracking-wider">EXPERIENCE</div>
          <div className="space-y-1">
            <div>
              <div className="flex justify-between font-medium text-[#171717] text-[3px]">
                <span>Staff Software Engineer</span>
                <span className="text-[#8F8F8F] font-normal">2022 - Pres</span>
              </div>
              <ul className="list-disc pl-1.5 mt-0.5 space-y-0.5 text-[#8F8F8F] text-[2.6px] leading-[3.5px]">
                <li>Architected Next.js App Router compiler upgrades.</li>
                <li>Reduced cold-start latency by 24% globally.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Skills block */}
        <div>
          <div className="font-semibold text-[#171717] border-b border-[#EBEBEB] pb-0.5 mb-1 text-[3.5px] tracking-wider">TECHNICAL SKILLS</div>
          <div className="flex flex-wrap gap-0.5">
            {["TypeScript", "React", "Next.js", "Go", "Docker"].map((skill) => (
              <span key={skill} className="text-[2.6px] font-medium text-[#4D4D4D] bg-[#FAFAFA] border border-[#EBEBEB] px-1 py-0.2 rounded-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Embedded Mini ATS Score Tag */}
      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-1">
        <div className="w-1 h-1 rounded-full bg-emerald-500" />
        <span className="text-[6px] font-bold text-emerald-700">92 Score Passed</span>
      </div>
    </div>
  );
}

interface ATSScoreCardProps {
  score: number;
}

function ATSScoreCard({ score }: ATSScoreCardProps) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  return (
    <div
      className="group bg-white/80 backdrop-blur-md border border-white/20 hover:border-[#171717]/15 rounded-xl p-3 w-[120px] h-[120px] flex flex-col items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-default"
    >
      <svg width="70" height="70" viewBox="0 0 100 100" className="mb-0.5">
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
          stroke={score >= 85 ? "#10B981" : "#F59E0B"}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          transform="rotate(-90 50 50)"
          className="transition-all duration-300"
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
        className="text-[#8F8F8F] transition-colors duration-200 group-hover:text-[#4D4D4D]"
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontSize: "11px",
          fontWeight: 500,
        }}
      >
        ATS Score
      </p>
    </div>
  );
}

interface SuggestionItem {
  id: number;
  text: string;
  done: boolean;
}

interface AISuggestionsCardProps {
  suggestions: SuggestionItem[];
}

function AISuggestionsCard({ suggestions }: AISuggestionsCardProps) {
  return (
    <div
      className="group bg-white/85 backdrop-blur-md border border-white/20 hover:border-[#171717]/15 rounded-xl p-3.5 w-[180px] h-[120px] flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-default"
    >
      <div className="flex items-center gap-1.5 mb-2.5">
        <Lightbulb className="w-4 h-4 text-[#7928CA]" />
        <p
          className="text-[#171717]"
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: "13px",
            fontWeight: 600,
            lineHeight: "20px",
          }}
        >
          AI Suggestions
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {suggestions.map(({ id, text, done }) => (
          <div key={id} className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border transition-all duration-300 ${
              done 
                ? "bg-emerald-500 border-emerald-500 text-white" 
                : "border-[#EBEBEB] bg-[#FAFAFA]"
            }`}>
              {done ? (
                <Check className="w-2.5 h-2.5" strokeWidth={3} />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-[#8F8F8F]" />
              )}
            </div>
            <span
              className={`transition-all duration-300 ${done ? "text-[#8F8F8F] line-through" : "text-[#4D4D4D]"}`}
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "11px",
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

interface SkillItem {
  name: string;
  value: number;
}

interface SkillMatchCardProps {
  skills: SkillItem[];
}

function SkillMatchCard({ skills }: SkillMatchCardProps) {
  return (
    <div
      className="group bg-white/80 backdrop-blur-md border border-white/20 hover:border-[#171717]/15 rounded-xl p-3.5 w-[150px] h-[130px] flex flex-col shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-default"
    >
      <p
        className="text-[#171717] mb-2.5"
        style={{
          fontFamily: "var(--font-geist-sans)",
          fontSize: "13px",
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
                className="h-full rounded-full bg-[#171717] transition-all duration-500 origin-left"
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
   Product Preview Composite (Live AI Editor Shell)
   ═══════════════════════════════════════════════ */

function ProductPreview() {
  const startText = "I wrote JavaScript code for the client-side of the application.";
  const targetText = "Architected Next.js routing and server component performance, boosting speed by 35%.";

  const [text, setText] = useState(startText);
  const [isTyping, setIsTyping] = useState(false);
  const [atsScore, setAtsScore] = useState(68);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([
    { id: 1, text: "Quantify achievements", done: false },
    { id: 2, text: "Include action verbs", done: true },
    { id: 3, text: "Optimize keywords", done: true },
  ]);
  const [skills, setSkills] = useState<SkillItem[]>([
    { name: "React", value: 85 },
    { name: "TypeScript", value: 55 },
  ]);

  useEffect(() => {
    let isMounted = true;

    const runAnimationLoop = async () => {
      while (isMounted) {
        // Reset to initial state
        if (!isMounted) break;
        setText(startText);
        setAtsScore(68);
        setSuggestions([
          { id: 1, text: "Quantify achievements", done: false },
          { id: 2, text: "Include action verbs", done: true },
          { id: 3, text: "Optimize keywords", done: true },
        ]);
        setSkills([
          { name: "React", value: 85 },
          { name: "TypeScript", value: 55 },
        ]);
        setIsTyping(false);

        // 1. Idle for 3 seconds
        await new Promise((resolve) => setTimeout(resolve, 3000));
        if (!isMounted) break;

        // 2. Start Typing Rewrite
        setIsTyping(true);
        setText("");
        for (let i = 0; i <= targetText.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 20));
          if (!isMounted) break;
          setText(targetText.substring(0, i));
        }

        if (!isMounted) break;
        setIsTyping(false);

        // 3. Short pause after rewrite
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (!isMounted) break;

        // 4. Animate ATS Score up from 68 to 92
        for (let score = 68; score <= 92; score++) {
          await new Promise((resolve) => setTimeout(resolve, 25));
          if (!isMounted) break;
          setAtsScore(score);
        }

        if (!isMounted) break;

        // 5. Expand TypeScript Skill bar and Check off Suggestions
        setSkills([
          { name: "React", value: 85 },
          { name: "TypeScript", value: 90 },
        ]);
        setSuggestions([
          { id: 1, text: "Quantify achievements", done: true },
          { id: 2, text: "Include action verbs", done: true },
          { id: 3, text: "Optimize keywords", done: true },
        ]);

        // 6. Hold optimized state for 4 seconds
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    };

    runAnimationLoop();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <motion.div
      className="relative w-[620px] h-[380px] hidden lg:block origin-right lg:scale-90 xl:scale-95 2xl:scale-100 transition-transform shrink-0"
      variants={cardContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {/* 1. Main Background Layer: Landscape Centerpiece */}
      <div className="absolute top-[25px] left-[10px] z-0">
        <PixelArtLandscape />
      </div>

      {/* 2. Centerpiece Focal Point: Embedded floating resume (floating 3D layer) */}
      <motion.div
        variants={cardFadeUp}
        className="absolute top-[27px] left-[205px] z-20"
      >
        <div className="animate-float-gentle" style={{ animationDelay: "0s" }}>
          <EmbeddedResumeCard />
        </div>
      </motion.div>

      {/* 3. Glassmorphic Ambient widgets arranged around resume */}
      {/* ATS Score Card — top-right */}
      <motion.div
        variants={cardFadeUp}
        className="absolute top-[10px] right-[20px] z-30"
      >
        <div className="animate-float-gentle" style={{ animationDelay: "0.8s" }}>
          <ATSScoreCard score={atsScore} />
        </div>
      </motion.div>

      {/* AI Suggestions Card — bottom-left */}
      <motion.div
        variants={cardFadeUp}
        className="absolute bottom-[10px] left-[-15px] z-30"
      >
        <div className="animate-float-gentle" style={{ animationDelay: "1.2s" }}>
          <AISuggestionsCard suggestions={suggestions} />
        </div>
      </motion.div>

      {/* Skill Match — bottom-right */}
      <motion.div
        variants={cardFadeUp}
        className="absolute bottom-[15px] right-[-10px] z-30"
      >
        <div className="animate-float-gentle" style={{ animationDelay: "0.6s" }}>
          <SkillMatchCard skills={skills} />
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
