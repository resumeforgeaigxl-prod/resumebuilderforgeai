"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FileSearch, Wand2, ArrowRight } from "lucide-react";

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

/* ═══════════════════════════════════════════════
   Carousel Slide Components (Presentation Style)
   ═══════════════════════════════════════════════ */

// Slide 1: Handcrafted landscape and overlay resume
function Slide1() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Centerpiece Floating Resume */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-[240px] h-[330px] bg-white rounded-xl border border-[#EBEBEB] p-4 text-left flex flex-col font-sans select-none shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:scale-[1.02] transition-transform duration-300"
      >
        {/* Top accent bar */}
        <div className="h-0.5 bg-[#7928CA] w-full mb-3 shrink-0" />
        
        {/* Header */}
        <div className="mb-2 shrink-0">
          <div className="font-bold text-[9px] text-[#171717] tracking-tight">ALEX RIVERA</div>
          <div className="text-[#7928CA] font-medium text-[5px] mt-0.5">Staff Software Engineer</div>
          <div className="text-[#8F8F8F] text-[4px] mt-0.5">Vercel • Next.js Core Team</div>
        </div>

        {/* Experience block */}
        <div className="space-y-2 flex-1 min-h-0 overflow-hidden mt-1">
          <div>
            <div className="font-semibold text-[#171717] border-b border-[#EBEBEB] pb-0.5 mb-1.5 text-[4.5px] tracking-wider">EXPERIENCE</div>
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between font-medium text-[#171717] text-[4px]">
                  <span>Staff Software Engineer</span>
                  <span className="text-[#8F8F8F] font-normal text-[3.5px]">2022 - Pres</span>
                </div>
                <ul className="list-disc pl-2.5 mt-0.5 space-y-0.5 text-[#8F8F8F] text-[3.5px] leading-[4.5px]">
                  <li>Architected Next.js App Router compiler upgrades.</li>
                  <li>Reduced cold-start latency by 24% globally.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Skills block */}
          <div className="mt-2">
            <div className="font-semibold text-[#171717] border-b border-[#EBEBEB] pb-0.5 mb-1 text-[4.5px] tracking-wider">TECHNICAL SKILLS</div>
            <div className="flex flex-wrap gap-0.5 mt-1">
              {["TypeScript", "React", "Next.js", "Go", "Docker"].map((skill) => (
                <span key={skill} className="text-[3.5px] font-medium text-[#4D4D4D] bg-[#FAFAFA] border border-[#EBEBEB] px-1 py-0.2 rounded-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Embedded Mini ATS Score Tag */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-1 z-10 shadow-sm">
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[6.5px] font-bold text-emerald-700">92 Score Passed</span>
        </div>
      </motion.div>
    </div>
  );
}

// Slide 2: ATS audit scorecard dashboard with background resume
function Slide2() {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const filled = 0.92 * circumference;

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 bg-transparent overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#EBEBEB_1px,transparent_1px),linear-gradient(to_bottom,#EBEBEB_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />

      {/* Blurred Resume Card in Background */}
      <div className="absolute left-[30px] top-[90px] w-[180px] h-[250px] bg-white/40 border border-[#EBEBEB] rounded-lg p-2.5 shadow-sm opacity-20 blur-[1px] -rotate-6 flex flex-col text-left">
        <div className="h-0.5 bg-neutral-300 w-full mb-1.5 shrink-0" />
        <div className="h-2 bg-neutral-200 w-2/3 rounded-sm mb-2" />
        <div className="space-y-1.5 flex-1 overflow-hidden">
          <div className="h-1 bg-neutral-200 w-full rounded-sm" />
          <div className="h-1 bg-neutral-200 w-5/6 rounded-sm" />
          <div className="h-1 bg-neutral-200 w-11/12 rounded-sm" />
        </div>
      </div>

      {/* Foreground ATS compliance scorecard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-[380px] h-[340px] bg-white border border-[#EBEBEB] rounded-2xl p-6 shadow-2xl flex flex-col justify-between"
      >
        <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-3 select-none">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <FileSearch className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#171717] tracking-tight">ATS Compliance Scan</h4>
              <p className="text-[10px] text-[#8F8F8F]">Target role matching index</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            Ready to Apply
          </span>
        </div>

        <div className="flex items-center gap-6 my-4">
          {/* Progress circle */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg width="96" height="96" viewBox="0 0 100 100" className="-rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#EBEBEB" strokeWidth="7" />
              <motion.circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10B981"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - filled }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
              <span className="text-xl font-bold text-[#171717]">92%</span>
              <span className="text-[8px] text-[#8F8F8F] uppercase tracking-wider font-semibold">Match</span>
            </div>
          </div>

          {/* Audit Details */}
          <div className="flex-1 flex flex-col justify-center gap-3">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-medium text-[#4D4D4D]">
                <span>Missing Tech Keywords</span>
                <span className="text-rose-500 font-mono">0 critical</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#EBEBEB] overflow-hidden">
                <div className="h-full bg-[#10B981] w-[95%]" />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#4D4D4D]">Formatting Score</span>
              <span className="font-semibold text-emerald-600">Excellent (Clear fonts)</span>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#4D4D4D]">Action Verb Strength</span>
              <span className="font-semibold text-emerald-600">Strong (14 active verbs)</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#EBEBEB] pt-3 flex items-center justify-between select-none">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[9px] text-[#8F8F8F]">Last audited 2 minutes ago</span>
          </div>
          <span className="text-[9px] text-[#8F8F8F] font-mono">Optimized for Vercel</span>
        </div>
      </motion.div>
    </div>
  );
}

// Slide 3: AI Rewrite suggestions panel
function Slide3() {
  const startText = "Wrote backend APIs and managed database queries.";
  const targetText = "Designed scalable Node.js microservices handling 20k req/sec, optimizing database query response times by 40%.";

  const [text, setText] = useState("");
  const [rewritten, setRewritten] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const runRewrite = async () => {
      while (isMounted) {
        setText(startText);
        setRewritten(false);
        setTyping(false);

        await new Promise((resolve) => setTimeout(resolve, 1500));
        if (!isMounted) break;

        setTyping(true);
        setRewritten(true);
        setText("");

        for (let i = 0; i <= targetText.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 20));
          if (!isMounted) break;
          setText(targetText.substring(0, i));
        }

        if (!isMounted) break;
        setTyping(false);

        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    };

    runRewrite();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 bg-transparent overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#EBEBEB_1px,transparent_1px),linear-gradient(to_bottom,#EBEBEB_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />

      {/* Blurred Resume Card in Background */}
      <div className="absolute right-[40px] top-[100px] w-[180px] h-[250px] bg-white/40 border border-[#EBEBEB] rounded-lg p-2.5 shadow-sm opacity-20 blur-[1px] rotate-6 flex flex-col text-left">
        <div className="h-0.5 bg-neutral-300 w-full mb-1.5 shrink-0" />
        <div className="h-2 bg-neutral-200 w-2/3 rounded-sm mb-2" />
        <div className="space-y-1.5 flex-1 overflow-hidden">
          <div className="h-1 bg-neutral-200 w-full rounded-sm" />
          <div className="h-1 bg-neutral-200 w-5/6 rounded-sm" />
          <div className="h-1 bg-neutral-200 w-11/12 rounded-sm" />
        </div>
      </div>

      {/* Foreground AI Suggestions Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-[400px] h-[340px] bg-white border border-[#EBEBEB] rounded-2xl p-6 shadow-2xl flex flex-col justify-between"
      >
        <div className="flex items-center gap-2 border-b border-[#EBEBEB] pb-3 select-none">
          <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
            <Wand2 className="w-4.5 h-4.5 text-purple-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#171717] tracking-tight">AI Bullet Optimizer</h4>
            <p className="text-[10px] text-[#8F8F8F]">Real-time statement rewriting</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center my-3">
          <p className="text-[8px] font-mono text-[#8F8F8F] uppercase tracking-wide mb-1.5 select-none">Experience Optimizer</p>
          <div className={`p-3 rounded-lg border text-xs min-h-[90px] leading-relaxed transition-all ${
            rewritten ? "bg-purple-50/40 border-purple-100 text-purple-900" : "bg-white border-[#EBEBEB] text-[#4D4D4D]"
          }`}>
            {text}
            {typing && <span className="inline-block w-[1.5px] h-[10px] bg-purple-600 ml-0.5 animate-pulse" />}
          </div>
        </div>

        <div className="border-t border-[#EBEBEB] pt-3 flex flex-col gap-2 select-none">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-505 flex items-center justify-center bg-emerald-500 text-white text-[8px] font-bold">✓</div>
            <span className="text-[10px] text-[#4D4D4D] font-medium">Quantified achievements (40% response time)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-505 flex items-center justify-center bg-emerald-500 text-white text-[8px] font-bold">✓</div>
            <span className="text-[10px] text-[#4D4D4D] font-medium">Used strong action verb (Designed)</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Slide 4: Multiple styled resume designs
function Slide4() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-8 bg-transparent overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#EBEBEB_1px,transparent_1px),linear-gradient(to_bottom,#EBEBEB_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />

      {/* Fan of Overlapping Resume Templates */}
      <div className="relative w-full h-[360px] flex items-center justify-center select-none">
        
        {/* Left Template (Modern Blue) */}
        <motion.div
          initial={{ opacity: 0, x: -60, rotate: -10 }}
          animate={{ opacity: 0.95, x: -110, rotate: -8 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute w-[180px] h-[250px] bg-white border border-[#EBEBEB] rounded-lg p-3.5 shadow-lg flex flex-col origin-bottom overflow-hidden animate-float-slow text-left"
        >
          <div className="h-1 bg-[#0070F3] w-full rounded-t -mt-3.5 -mx-3.5 mb-2.5 shrink-0" />
          <div className="flex gap-2 text-left">
            <div className="w-[32px] border-r border-[#F2F2F2] pr-1.5 flex flex-col gap-1 shrink-0">
              <div className="w-4.5 h-4.5 rounded-full bg-[#0070F3]/10 text-[#0070F3] font-bold text-[6px] flex items-center justify-center">SA</div>
              <div className="h-1 bg-[#F2F2F2] w-full rounded-sm" />
              <div className="h-1 bg-[#F2F2F2] w-full rounded-sm" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div>
                <div className="text-[7px] font-bold text-[#171717] leading-none">Sarah Anderson</div>
                <div className="text-[4.5px] text-[#0070F3] font-medium mt-0.5">Product Designer</div>
              </div>
              <div className="space-y-0.5 mt-2">
                <div className="h-[2px] bg-[#F2F2F2] w-full rounded-sm" />
                <div className="h-[2px] bg-[#F2F2F2] w-5/6 rounded-sm" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Template (Technical Purple) */}
        <motion.div
          initial={{ opacity: 0, x: 60, rotate: 10 }}
          animate={{ opacity: 0.95, x: 110, rotate: 8 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute w-[180px] h-[250px] bg-white border border-[#EBEBEB] rounded-lg p-3.5 shadow-lg flex flex-col origin-bottom overflow-hidden animate-float-slow text-left font-mono"
        >
          <div className="h-1 bg-[#7928CA] w-full rounded-t -mt-3.5 -mx-3.5 mb-2.5 shrink-0" />
          <div className="flex gap-2">
            <div className="w-[30px] border-r border-[#F2F2F2] pr-1 flex flex-col gap-1 shrink-0">
              <div className="text-[4px] font-bold text-[#7928CA] uppercase">Skills</div>
              <div className="h-[2px] bg-[#F2F2F2] w-full rounded-sm" />
              <div className="h-[2px] bg-[#F2F2F2] w-full rounded-sm" />
            </div>
            <div className="flex-1 space-y-1.5">
              <div>
                <div className="text-[6.5px] font-bold text-[#171717] leading-none">&lt;Alex /&gt;</div>
                <div className="text-[4px] text-[#7928CA] font-medium mt-0.5">&gt; Developer</div>
              </div>
              <div className="space-y-0.5">
                <div className="h-[2px] bg-[#F2F2F2] w-full rounded-sm" />
                <div className="h-[2px] bg-[#F2F2F2] w-full rounded-sm" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Center Template (Executive Black - FOCAL POINT) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute w-[200px] h-[280px] bg-white border border-[#171717]/10 rounded-xl p-4 shadow-2xl flex flex-col justify-between z-10 overflow-hidden animate-float-gentle text-center font-serif"
        >
          <div className="space-y-1">
            <div className="text-[9px] font-bold text-[#171717] uppercase tracking-wide">David Chen</div>
            <div className="text-[4.5px] text-[#8F8F8F] uppercase tracking-widest -mt-0.5">Chief Operating Officer</div>
            <div className="h-[0.5px] bg-[#171717] w-full mt-1.5" />
          </div>
          <div className="flex-1 text-left mt-2.5 space-y-2 overflow-hidden">
            <div className="space-y-1">
              <div className="text-[5.5px] font-bold text-[#171717] uppercase tracking-wider">Professional Experience</div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[4px] font-semibold text-[#4D4D4D]">
                  <span>COO @ Global Solutions</span>
                  <span className="text-[#8F8F8F]">2018 - Pres</span>
                </div>
                <div className="h-[2px] bg-[#F2F2F2] w-full rounded-sm" />
                <div className="h-[2px] bg-[#F2F2F2] w-11/12 rounded-sm" />
              </div>
            </div>
          </div>
          <div className="text-center border-t border-[#EBEBEB] pt-2 mt-2 shrink-0">
            <span className="text-[6.5px] text-[#8F8F8F] uppercase tracking-wider font-mono font-bold">Executive Style</span>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Product Preview Presentation Slider Component
   ═══════════════════════════════════════════════ */

function ProductPreviewSlider() {
  const [activeSlide, setActiveSlide] = useState(0);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  const slides = [
    { id: 0, label: "Interactive Visual", component: <Slide1 /> },
    { id: 1, label: "ATS Scan Audit", component: <Slide2 /> },
    { id: 2, label: "AI Bullet Optimizer", component: <Slide3 /> },
    { id: 3, label: "Resume Templates", component: <Slide4 /> },
  ];

  const resetTimer = () => {
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }
    autoRotateRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 4);
    }, 5000);
  };

  useEffect(() => {
    resetTimer();
    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, []);

  const handleSlideSelect = (id: number) => {
    setActiveSlide(id);
    resetTimer();
  };

  return (
    <div className="hidden lg:flex flex-col items-center shrink-0 origin-right lg:scale-[0.88] xl:scale-[0.95] 2xl:scale-100 transition-transform duration-300">
      {/* Main Widescreen Visual Container (720px width, 480px height - 3:2 ratio) */}
      <div className="w-[720px] h-[480px] border border-[#EBEBEB] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] relative bg-[#FAFAFA]">
        {/* Background Pixel Art (common for all slides) */}
        <img
          src="/hero-landscape.png"
          alt="Pixel Art Mountain Forest Landscape"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        {/* Ambient dark overlay */}
        <div className="absolute inset-0 bg-slate-950/15 pointer-events-none z-10" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full h-full relative z-20"
          >
            {slides[activeSlide].component}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Indicators Below Visual Showcase */}
      <div className="flex gap-4 mt-6 w-[720px]">
        {slides.map((slide) => {
          const isActive = activeSlide === slide.id;
          return (
            <button
              key={slide.id}
              onClick={() => handleSlideSelect(slide.id)}
              className="flex-1 flex flex-col text-left group select-none"
            >
              <span className={`text-[11px] font-semibold transition-colors duration-200 ${
                isActive ? "text-[#171717]" : "text-[#8F8F8F] group-hover:text-[#4D4D4D]"
              }`}>
                {slide.label}
              </span>
              <div className="h-[3px] bg-[#EBEBEB] w-full rounded-full overflow-hidden mt-1.5 relative">
                {isActive && (
                  <motion.div
                    key={activeSlide} // resets when active slide changes
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="absolute left-0 top-0 bottom-0 bg-[#171717] rounded-full"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
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

      {/* ── Content (Wider container max-w-[1340px] to fit 720px column nicely) ── */}
      <div className="relative z-10 mx-auto flex max-w-[1340px] items-center justify-between gap-12 px-6">
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
            Connected Developer Career Platform
          </motion.p>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="mb-5 text-[32px] md:text-[48px] text-[#171717]"
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.05em",
            }}
          >
            Forge your career.
            <br />
            From resume to offer.
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
            ResumeForge AI connects all the tools you need—resume optimization, 
            portfolio showcases, coding practice, and mock interviews—in one unified ecosystem.
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

        {/* ── Right column: product preview slider (720px container) ── */}
        <ProductPreviewSlider />
      </div>
    </section>
  );
}
