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
    <div className="relative w-full h-full flex items-end justify-center md:block">
      {/* Centerpiece Floating Resume */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative md:absolute md:bottom-8 md:right-[10%] mt-4 md:mt-0 mx-auto md:mx-0 z-10 w-[240px] h-[330px] p-4 text-left flex flex-col font-sans select-none hover:scale-[1.02] transition-transform duration-300 overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
        }}
      >
        {/* Top accent bar */}
        <div className="h-0.5 bg-[#7928CA] w-full mb-3 shrink-0" />
        
        {/* Header */}
        <div className="mb-2 shrink-0">
          <div className="font-bold text-[9px] text-white tracking-tight" style={{ fontWeight: 700 }}>ALEX RIVERA</div>
          <div className="text-white/60 font-medium text-[5px] mt-0.5">Staff Software Engineer</div>
          <div className="text-white/60 text-[4px] mt-0.5">Vercel • Next.js Core Team</div>
        </div>

        {/* Experience block */}
        <div className="space-y-2 flex-1 min-h-0 overflow-hidden mt-1">
          <div>
            <div className="font-semibold text-white border-b pb-0.5 mb-1.5 text-[4.5px] tracking-wider" style={{ fontWeight: 700, borderColor: 'rgba(255,255,255,0.15)' }}>EXPERIENCE</div>
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between font-medium text-white/90 text-[4px]">
                  <span>Staff Software Engineer</span>
                  <span className="text-white/60 font-normal text-[3.5px]">2022 - Pres</span>
                </div>
                <ul className="list-disc pl-2.5 mt-0.5 space-y-0.5 text-white/80 text-[3.5px] leading-[4.5px]">
                  <li>Architected Next.js App Router compiler upgrades.</li>
                  <li>Reduced cold-start latency by 24% globally.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Skills block */}
          <div className="mt-2">
            <div className="font-semibold text-white border-b pb-0.5 mb-1 text-[4.5px] tracking-wider" style={{ fontWeight: 700, borderColor: 'rgba(255,255,255,0.15)' }}>TECHNICAL SKILLS</div>
            <div className="flex flex-wrap gap-0.5 mt-1">
              {["TypeScript", "React", "Next.js", "Go", "Docker"].map((skill) => (
                <span 
                  key={skill} 
                  className="text-[3.5px] font-medium text-white/90 px-1 py-0.2 rounded-sm"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Frosted bottom label */}
        <div 
          className="w-full text-center shrink-0"
          style={{
            background: 'rgba(255,255,255,0.1)',
            borderTop: '1px solid rgba(255,255,255,0.15)',
            padding: '6px 12px',
            fontSize: '10px',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.5)',
            margin: 'auto -16px -16px -16px',
            width: 'calc(100% + 32px)',
            borderBottomLeftRadius: '20px',
            borderBottomRightRadius: '20px'
          }}
        >
          ATS SCORE: 94
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
    <div className="relative w-full h-full flex items-end justify-center md:block bg-transparent md:overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#EBEBEB_1px,transparent_1px),linear-gradient(to_bottom,#EBEBEB_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />

      {/* Blurred Resume Card in Background */}
      <div className="hidden md:flex absolute left-[30px] top-[90px] w-[180px] h-[250px] bg-white/40 border border-[#EBEBEB] rounded-lg p-2.5 shadow-sm opacity-20 blur-[1px] -rotate-6 flex-col text-left">
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
        className="relative md:absolute md:bottom-8 md:right-[10%] mt-4 md:mt-0 mx-auto md:mx-0 z-10 w-full max-w-[310px] sm:max-w-[380px] h-[340px] p-6 flex flex-col justify-between"
        style={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
        }}
      >
        <div 
          className="flex items-center justify-between border-b pb-3 select-none"
          style={{ borderColor: 'rgba(255,255,255,0.15)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
              <FileSearch className="w-4.5 h-4.5 text-white/90" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight" style={{ fontWeight: 700 }}>ATS Compliance Scan</h4>
              <p className="text-[10px] text-white/60">Target role matching index</p>
            </div>
          </div>
          <span 
            className="font-bold text-[10px]"
            style={{
              background: 'rgba(34,197,94,0.2)',
              border: '1px solid rgba(34,197,94,0.4)',
              color: '#86efac',
              borderRadius: '999px',
              padding: '2px 10px',
              fontSize: '11px'
            }}
          >
            Ready to Apply
          </span>
        </div>

        <div className="flex items-center gap-6 my-4">
          {/* Progress circle */}
          <div 
            className="relative w-24 h-24 shrink-0 flex items-center justify-center"
            style={{ filter: 'drop-shadow(0 0 8px rgba(34,197,94,0.4))' }}
          >
            <svg width="96" height="96" viewBox="0 0 100 100" className="-rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="7" />
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
              <span className="text-xl font-bold text-white">92%</span>
              <span className="text-[8px] text-white/60 uppercase tracking-wider font-semibold">Match</span>
            </div>
          </div>

          {/* Audit Details */}
          <div className="flex-1 flex flex-col justify-center gap-3">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-medium text-white/85">
                <span>Missing Tech Keywords</span>
                <span className="font-mono" style={{ color: '#86efac' }}>0 critical</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-[#10B981] w-[95%]" />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/85">Formatting Score</span>
              <span className="font-semibold" style={{ color: '#86efac' }}>Excellent (Clear fonts)</span>
            </div>

            <div className="flex items-center justify-between text-[10px]">
              <span className="text-white/85">Action Verb Strength</span>
              <span className="font-semibold" style={{ color: '#86efac' }}>Strong (14 active verbs)</span>
            </div>
          </div>
        </div>

        <div 
          className="border-t pt-3 flex items-center justify-between select-none"
          style={{ borderColor: 'rgba(255,255,255,0.15)' }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span 
              className="select-none"
              style={{
                color: 'rgba(255,255,255,0.35)',
                fontSize: '11px',
                fontFamily: 'monospace'
              }}
            >
              Last audited 2 minutes ago
            </span>
          </div>
          <span className="text-[9px] text-white/40 font-mono">Optimized for Vercel</span>
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
    <div className="relative w-full h-full flex items-end justify-center md:block bg-transparent md:overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#EBEBEB_1px,transparent_1px),linear-gradient(to_bottom,#EBEBEB_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />

      {/* Blurred Resume Card in Background */}
      <div className="hidden md:flex absolute right-[40px] top-[100px] w-[180px] h-[250px] bg-white/40 border border-[#EBEBEB] rounded-lg p-2.5 shadow-sm opacity-20 blur-[1px] rotate-6 flex-col text-left">
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
        className="relative md:absolute md:bottom-8 md:right-[10%] mt-4 md:mt-0 mx-auto md:mx-0 z-10 w-full max-w-[310px] sm:max-w-[400px] h-[340px] p-6 flex flex-col justify-between"
        style={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
        }}
      >
        <div 
          className="flex items-center gap-2 border-b pb-3 select-none"
          style={{ borderColor: 'rgba(255,255,255,0.15)' }}
        >
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
            <Wand2 className="w-4.5 h-4.5 text-purple-300" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight" style={{ fontWeight: 700 }}>AI Bullet Optimizer</h4>
            <p className="text-[10px] text-white/60">Real-time statement rewriting</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center my-3">
          <p 
            className="mb-1.5 select-none"
            style={{
              color: 'rgba(167,139,250,0.8)',
              fontFamily: 'monospace',
              fontSize: '10px',
              letterSpacing: '0.15em'
            }}
          >
            EXPERIENCE OPTIMIZER
          </p>
          <div 
            className="text-xs min-h-[90px] leading-relaxed transition-all"
            style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              color: '#c4b5fd',
              padding: '12px'
            }}
          >
            {rewritten && text.startsWith("Designed") ? (
              <span>
                <span style={{ color: '#c4b5fd', fontWeight: 600 }}>Designed</span>
                {text.substring(8)}
              </span>
            ) : (
              text
            )}
            {typing && <span className="inline-block w-[1.5px] h-[10px] bg-purple-400 ml-0.5 animate-pulse" />}
          </div>
        </div>

        <div 
          className="border-t pt-3 flex flex-col gap-2 select-none"
          style={{ borderColor: 'rgba(255,255,255,0.15)' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-505 flex items-center justify-center bg-emerald-500 text-white text-[8px] font-bold">✓</div>
            <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Quantified achievements (40% response time)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-505 flex items-center justify-center bg-emerald-500 text-white text-[8px] font-bold">✓</div>
            <span className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Used strong action verb (Designed)</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Slide 4: Multiple styled resume designs
function Slide4() {
  return (
    <div className="relative w-full h-full flex items-end justify-center md:block bg-transparent md:overflow-hidden">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#EBEBEB_1px,transparent_1px),linear-gradient(to_bottom,#EBEBEB_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />

      {/* Fan of Overlapping Resume Templates */}
      <div className="relative md:absolute md:bottom-8 md:right-[10%] mt-4 md:mt-0 mx-auto md:mx-0 z-10 w-full max-w-[310px] sm:w-[360px] h-[280px] md:h-[360px] flex items-center justify-center select-none scale-[0.8] md:scale-100 origin-center md:origin-bottom-right transition-transform duration-300">
        
        {/* Left Template (Modern Blue) */}
        <motion.div
          initial={{ opacity: 0, x: -60, rotate: -10 }}
          animate={{ opacity: 0.95, x: -110, rotate: -8 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute w-[180px] h-[250px] rounded-lg p-3.5 flex flex-col origin-bottom overflow-hidden animate-float-slow text-left"
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="h-1 bg-[#0070F3] w-full rounded-t -mt-3.5 -mx-3.5 mb-2.5 shrink-0" />
          <div className="flex gap-2 text-left">
            <div 
              className="w-[32px] border-r pr-1.5 flex flex-col gap-1 shrink-0"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <div 
                className="w-4.5 h-4.5 rounded-full text-white font-bold text-[6px] flex items-center justify-center"
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
              >
                SA
              </div>
              <div className="h-1 w-full rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <div className="h-1 w-full rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
            </div>
            <div className="flex-1 space-y-1.5">
              <div>
                <div className="text-[7px] leading-none" style={{ color: 'white', fontWeight: 700 }}>Sarah Anderson</div>
                <div className="text-[4.5px] mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Product Designer</div>
              </div>
              <div className="space-y-1 mt-2">
                <div className="h-[2px] w-full rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
                <div className="h-[2px] w-5/6 rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
                <div className="h-[2px] w-4/5 rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
                <div className="h-[2px] w-2/3 rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>
            </div>
          </div>
          <div 
            className="w-full text-center shrink-0"
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              padding: '6px 12px',
              fontSize: '10px',
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.5)',
              margin: 'auto -14px -14px -14px',
              width: 'calc(100% + 28px)'
            }}
          >
            ATS SCORE: 94
          </div>
        </motion.div>

        {/* Right Template (Technical Purple) */}
        <motion.div
          initial={{ opacity: 0, x: 60, rotate: 10 }}
          animate={{ opacity: 0.95, x: 110, rotate: 8 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute w-[180px] h-[250px] rounded-lg p-3.5 flex flex-col origin-bottom overflow-hidden animate-float-slow text-left font-mono"
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="h-1 bg-[#7928CA] w-full rounded-t -mt-3.5 -mx-3.5 mb-2.5 shrink-0" />
          <div className="flex gap-2">
            <div 
              className="w-[30px] border-r pr-1 flex flex-col gap-1 shrink-0"
              style={{ borderColor: 'rgba(255,255,255,0.15)' }}
            >
              <div className="text-[4px] uppercase" style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>Skills</div>
              <div className="h-[2px] w-full rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
              <div className="h-[2px] w-full rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
            </div>
            <div className="flex-1 space-y-1.5">
              <div>
                <div className="text-[6.5px] leading-none" style={{ color: 'white', fontWeight: 700 }}>&lt;Alex /&gt;</div>
                <div className="text-[4.5px] mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>&gt; Developer</div>
              </div>
              <div className="space-y-1">
                <div className="h-[2px] w-full rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
                <div className="h-[2px] w-full rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
                <div className="h-[2px] w-5/6 rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
                <div className="h-[2px] w-2/3 rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>
            </div>
          </div>
          <div 
            className="w-full text-center shrink-0"
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              padding: '6px 12px',
              fontSize: '10px',
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.5)',
              margin: 'auto -14px -14px -14px',
              width: 'calc(100% + 28px)'
            }}
          >
            TECH FORMAT
          </div>
        </motion.div>

        {/* Center Template (Executive Black - FOCAL POINT) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="absolute w-[200px] h-[280px] z-10 overflow-hidden animate-float-gentle text-center font-serif"
          style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="space-y-1 p-4 pb-0">
            <div className="text-[9px] uppercase tracking-wide" style={{ color: 'white', fontWeight: 700 }}>David Chen</div>
            <div className="text-[4.5px] uppercase tracking-widest -mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>Chief Operating Officer</div>
            <div className="h-[0.5px] w-full mt-1.5" style={{ background: 'rgba(255,255,255,0.15)' }} />
          </div>
          <div className="flex-1 text-left mt-2.5 px-4 space-y-2 overflow-hidden">
            <div className="space-y-1">
              <div className="text-[5.5px] uppercase tracking-wider" style={{ color: 'white', fontWeight: 700 }}>Professional Experience</div>
              <div className="space-y-1">
                <div className="flex justify-between text-[4px] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  <span>COO @ Global Solutions</span>
                  <span className="text-white/40">2018 - Pres</span>
                </div>
                <div className="h-[2px] w-full rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
                <div className="h-[2px] w-11/12 rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
                <div className="h-[2px] w-4/5 rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
                <div className="h-[2px] w-3/4 rounded-sm" style={{ background: 'rgba(255,255,255,0.15)' }} />
              </div>
            </div>
          </div>
          <div 
            className="w-full text-center shrink-0"
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              padding: '6px 12px',
              fontSize: '10px',
              fontFamily: 'monospace',
              letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.5)',
              margin: 'auto -16px -16px -16px',
              width: 'calc(100% + 32px)'
            }}
          >
            EXECUTIVE STYLE
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
    <div className="w-full flex flex-col items-center">
      {/* Main Widescreen Visual Container */}
      <div className="relative w-full max-w-[960px] mx-auto h-[400px] sm:h-[420px] md:h-[480px]">
        {/* Image Panel */}
        <div className="absolute inset-0 rounded-t-[16px] overflow-hidden border border-[#e5e5e5] border-b-0 shadow-[0_20px_60px_rgba(0,0,0,0.06)] bg-[#FAFAFA]">
          <img
            src="/hero-landscape.png"
            alt="Pixel Art Mountain Forest Landscape"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/15 pointer-events-none z-10" />
        </div>

        {/* Slides overlay */}
        <div className="absolute inset-0 z-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full h-full relative"
            >
              {slides[activeSlide].component}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Tab Bar (Interactive Visual / ATS Scan Audit / etc.) */}
      <div 
        className="w-full max-w-[960px] mx-auto border border-[#e5e5e5] rounded-b-[16px] bg-[#ffffff] px-4 py-3 md:px-6 md:py-5 grid grid-cols-2 md:flex gap-3 md:gap-6 items-center"
        style={{ borderTop: 'none' }}
      >
        {slides.map((slide) => {
          const isActive = activeSlide === slide.id;
          return (
            <button
              key={slide.id}
              onClick={() => handleSlideSelect(slide.id)}
              className="flex-1 flex flex-col text-left group select-none cursor-pointer"
            >
              <span className={`text-[10px] md:text-[11px] font-semibold transition-colors duration-200 whitespace-nowrap overflow-hidden text-ellipsis ${
                isActive ? "text-[#171717]" : "text-[#8F8F8F] group-hover:text-[#4D4D4D]"
              }`}>
                {slide.label}
              </span>
              <div className="h-[3px] bg-[#EBEBEB] w-full rounded-full overflow-hidden mt-1.5 relative">
                {isActive && (
                  <motion.div
                    key={activeSlide}
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
    <section className="w-full bg-[#fafaf9] relative overflow-hidden select-none">
      <div className="max-w-[1200px] mx-auto border-x border-[#e7e5e4] bg-white pt-20 pb-0 flex flex-col items-center relative">
        {/* ── Mesh gradient overlay ── */}
        <div
          className="rf-mesh-gradient pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
        />

      {/* ── Top: text block ── */}
      <motion.div
        className="relative z-10 w-full max-w-[720px] mx-auto text-center px-6 flex flex-col items-center"
        variants={textContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        {/* Eyebrow */}
        <motion.p
          variants={fadeUp}
          className="mb-4 text-[#8F8F8F] uppercase tracking-widest text-center"
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
          className="mb-5 text-[32px] md:text-[clamp(40px,6vw,72px)] text-[#171717] text-center max-w-[640px] mx-auto"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontStyle: "italic",
            letterSpacing: "-0.02em",
            lineHeight: 1.08,
          }}
        >
          Forge your career. From resume to offer.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={fadeUp}
          className="mx-auto mb-8 max-w-[520px] text-[#6b7280] text-center"
          style={{
            fontFamily: "var(--font-geist-sans)",
            fontSize: "16px",
            fontWeight: 400,
            lineHeight: "1.6",
          }}
        >
          ResumeForge AI connects all the tools you need: resume optimization, 
          portfolio showcases, coding practice, and mock interviews in one unified ecosystem.
        </motion.p>

        {/* CTA row */}
        <motion.div variants={fadeUp} className="flex justify-center gap-3 mb-14">
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

      {/* ── 3-Column Bordered Feature Summary Grid (AutoSend Pattern) ── */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative z-10 w-full max-w-[960px] mx-auto px-6 md:px-0 mb-14"
      >
        <div className="border border-stone-200 bg-white/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-[0_2px_2px_rgba(0,0,0,0.02),0_8px_16px_-4px_rgba(0,0,0,0.04)] select-none">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {/* Cell 1: ATS Scanner */}
            <div className="flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-stone-200">
              <div className="px-6 py-6 text-left">
                <span className="font-mono text-[11px] text-[#7c3aed] font-semibold uppercase tracking-wider block mb-2">
                  #01 — ATS Scanner
                </span>
                <h4 className="font-sans text-sm font-bold text-stone-800 tracking-tight mb-1">
                  ATS Scanner
                </h4>
                <p className="text-xs text-stone-500 leading-normal">
                  AI-powered resume auditing that catches formatting issues ATS systems flag.
                </p>
              </div>
              <div className="border-t border-stone-200 px-6 py-3 bg-stone-50/50">
                <Link
                  href={`/${locale}/ai-resume-builder`}
                  className="font-mono text-[10px] tracking-wider text-[#7c3aed] font-bold hover:text-[#6d28d9] transition-colors"
                >
                  TRY IT →
                </Link>
              </div>
            </div>
            {/* Cell 2: Bullet Optimizer */}
            <div className="flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-stone-200">
              <div className="px-6 py-6 text-left">
                <span className="font-mono text-[11px] text-[#7c3aed] font-semibold uppercase tracking-wider block mb-2">
                  #02 — Bullet Optimizer
                </span>
                <h4 className="font-sans text-sm font-bold text-stone-800 tracking-tight mb-1">
                  Bullet Optimizer
                </h4>
                <p className="text-xs text-stone-500 leading-normal">
                  Transform plain duties into high-impact, metrics-driven achievements.
                </p>
              </div>
              <div className="border-t border-stone-200 px-6 py-3 bg-stone-50/50">
                <Link
                  href={`/${locale}/ai-resume-builder`}
                  className="font-mono text-[10px] tracking-wider text-[#7c3aed] font-bold hover:text-[#6d28d9] transition-colors"
                >
                  TRY IT →
                </Link>
              </div>
            </div>
            {/* Cell 3: Job Matcher */}
            <div className="flex flex-col justify-between">
              <div className="px-6 py-6 text-left">
                <span className="font-mono text-[11px] text-[#7c3aed] font-semibold uppercase tracking-wider block mb-2">
                  #03 — Job Matcher
                </span>
                <h4 className="font-sans text-sm font-bold text-stone-800 tracking-tight mb-1">
                  Job Matcher
                </h4>
                <p className="text-xs text-stone-500 leading-normal">
                  Match your resume to any job description with intelligent gap analysis.
                </p>
              </div>
              <div className="border-t border-stone-200 px-6 py-3 bg-stone-50/50">
                <Link
                  href={`/${locale}/ai-resume-builder`}
                  className="font-mono text-[10px] tracking-wider text-[#7c3aed] font-bold hover:text-[#6d28d9] transition-colors"
                >
                  TRY IT →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Bottom: Image + Tabs block ── */}
      <div className="relative z-10 w-full px-6 md:px-0 mt-4 md:mt-0">
        <ProductPreviewSlider />
      </div>
      </div>
    </section>
  );
}
