"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  Search,
  Sparkles,
  CheckCircle2,
  FileDown,
  Check,
  Terminal,
  FileText
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

interface Step {
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    title: "Upload Resume",
    description: "Drop your existing resume or start from scratch. We support PDF, DOCX, and plain text formats.",
  },
  {
    title: "AI Analysis",
    description: "Our AI engine parses your experience, scans for keywords, and flags formatting improvements.",
  },
  {
    title: "Content Enhancement",
    description: "Get AI-generated suggestions to transform weak sentences into high-impact, metrics-driven bullet achievements.",
  },
  {
    title: "ATS Optimization",
    description: "Automatically match core skills and keywords to pass applicant tracking systems used by top companies.",
  },
  {
    title: "Export PDF",
    description: "Download your polished, recruiter-ready resume as a professional PDF and matching cover letter.",
  },
];

/* ═══════════════════════════════════════════════
   Step Micro-Simulation Components
   ═══════════════════════════════════════════════ */

// 1. Upload Resume Simulation
function UploadSim() {
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    setProgress(0);
    setComplete(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-white relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#FAFAFA_1px,transparent_1px),linear-gradient(to_bottom,#FAFAFA_1px,transparent_1px)] bg-[size:16px_16px] opacity-50 pointer-events-none" />
      
      {!complete ? (
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-3"
          >
            <UploadCloud className="w-6 h-6 text-[#7928CA]" />
          </motion.div>
          <span className="text-xs font-semibold text-[#171717]">uploading_cv.pdf</span>
          <span className="text-[10px] text-neutral-400 mt-1">{progress}% uploaded</span>
          
          <div className="w-40 h-1.5 bg-[#EBEBEB] rounded-full overflow-hidden mt-3">
            <div className="h-full bg-[#7928CA] transition-all duration-100" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3 text-emerald-600 font-bold">
            ✓
          </div>
          <span className="text-xs font-bold text-[#171717]">Upload Completed</span>
          <span className="text-[10px] text-emerald-600 font-medium mt-1">Parsed 1,482 words successfully</span>
        </motion.div>
      )}
    </div>
  );
}

// 2. AI Analysis Simulation
function AnalysisSim() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#FAFAFA_1px,transparent_1px),linear-gradient(to_bottom,#FAFAFA_1px,transparent_1px)] bg-[size:16px_16px] opacity-50 pointer-events-none" />

      {/* Mock Document Canvas */}
      <div className="relative z-10 w-[200px] h-[190px] border border-[#EBEBEB] bg-white rounded-lg p-3 shadow-sm flex flex-col gap-2.5 overflow-hidden">
        {/* Glowing laser scan line */}
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-purple-500 shadow-[0_0_10px_#7928CA]"
          animate={{ top: ["5%", "95%", "5%"] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
        />

        {/* Top header lines */}
        <div className="space-y-1 mt-1">
          <div className="h-2 bg-neutral-200 w-1/3 rounded-sm" />
          <div className="h-1 bg-neutral-100 w-1/2 rounded-sm" />
        </div>
        <div className="h-[0.5px] bg-[#EBEBEB] w-full" />

        {/* Body placeholder blocks with some colored tags */}
        <div className="space-y-2 flex-1">
          <div className="space-y-1">
            <div className="h-1 bg-neutral-200 w-1/4 rounded-sm" />
            <div className="h-1 bg-neutral-100 w-full rounded-sm" />
            <div className="h-1 bg-neutral-100 w-5/6 rounded-sm" />
          </div>
          <div className="space-y-1">
            <div className="h-1 bg-neutral-200 w-1/5 rounded-sm" />
            <div className="h-1 bg-neutral-100 w-full rounded-sm" />
          </div>
        </div>

        {/* Floating results badge */}
        <div className="flex items-center justify-between border-t border-[#EBEBEB] pt-2 text-[8px] font-mono text-neutral-400">
          <span className="flex items-center gap-1">
            <Search className="w-2.5 h-2.5 text-purple-600" />
            Scanning experience...
          </span>
          <span className="text-[#171717] font-bold">14 keywords matched</span>
        </div>
      </div>
    </div>
  );
}

// 3. Content Enhancement Simulation
function EnhanceSim() {
  const weakText = "Wrote backend database API commands.";
  const enhancedText = "Designed scalable Node.js APIs handling 20k req/sec, optimizing Postgres DB queries by 40%.";

  const [text, setText] = useState("");
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let active = true;

    const runSeq = async () => {
      while (active) {
        setText(weakText);
        setIsEnhanced(false);
        setTyping(false);

        await new Promise((r) => setTimeout(r, 1200));
        if (!active) break;

        setTyping(true);
        setIsEnhanced(true);
        setText("");

        for (let i = 0; i <= enhancedText.length; i++) {
          await new Promise((r) => setTimeout(r, 15));
          if (!active) break;
          setText(enhancedText.substring(0, i));
        }
        if (!active) break;
        setTyping(false);

        await new Promise((r) => setTimeout(r, 2600));
      }
    };

    runSeq();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 text-left select-none bg-white relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#FAFAFA_1px,transparent_1px),linear-gradient(to_bottom,#FAFAFA_1px,transparent_1px)] bg-[size:16px_16px] opacity-50 pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col justify-center gap-2">
        <span className="text-[8.5px] font-mono text-neutral-400 uppercase tracking-widest font-semibold">
          AI Bullet Refactoring
        </span>

        <div className="space-y-3">
          {/* Before weak statement */}
          {!isEnhanced ? (
            <div className="border border-rose-100 bg-rose-50/10 text-rose-950 p-3 rounded-lg text-xs leading-relaxed">
              <span className="text-[8px] font-bold text-rose-500 block mb-0.5">Original (Weak)</span>
              {text}
            </div>
          ) : (
            /* After enhanced statement */
            <div className="border border-emerald-100 bg-emerald-50/10 text-emerald-950 p-3 rounded-lg text-xs leading-relaxed min-h-[68px]">
              <span className="text-[8px] font-bold text-emerald-600 block mb-0.5">AI Optimized (Quantified)</span>
              {text}
              {typing && <span className="inline-block w-[1.5px] h-[10px] bg-purple-600 ml-0.5 animate-pulse" />}
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 border-t border-[#F2F2F2] pt-3 flex items-center gap-2 text-[9px] text-[#8F8F8F] font-mono">
        <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
        <span>Injecting metric impact statements</span>
      </div>
    </div>
  );
}

// 4. ATS Optimization Simulation
function AtsSim() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    setScore(0);
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 2;
        if (current >= 92) {
          clearInterval(interval);
          setScore(92);
        } else {
          setScore(current);
        }
      }, 15);
      return () => clearInterval(interval);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-white relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#FAFAFA_1px,transparent_1px),linear-gradient(to_bottom,#FAFAFA_1px,transparent_1px)] bg-[size:16px_16px] opacity-50 pointer-events-none" />

      {/* Speedometer visual */}
      <div className="relative z-10 w-24 h-24 flex items-center justify-center shrink-0">
        <svg width="96" height="96" viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#EBEBEB" strokeWidth="6" />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#10B981"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 40}
            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 40 - (score / 100) * (2 * Math.PI * 40) }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className="text-xl font-bold text-[#171717]">{score}%</span>
          <span className="text-[7px] text-[#8F8F8F] uppercase tracking-wider font-semibold mt-0.5">Match</span>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: score >= 90 ? 1 : 0, y: score >= 90 ? 0 : 5 }}
        className="relative z-10 mt-4 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-1.5 shadow-sm"
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-[9px] font-bold text-emerald-700 font-mono">Passed ATS Target Threshold</span>
      </motion.div>
    </div>
  );
}

// 5. Export PDF Simulation
function ExportSim() {
  const [downloading, setDownloading] = useState(false);
  const [saved, setSaved] = useState(false);

  const startDownload = async () => {
    setDownloading(true);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 1200));
    setDownloading(false);
    setSaved(true);
  };

  useEffect(() => {
    startDownload();
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center select-none bg-white relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#FAFAFA_1px,transparent_1px),linear-gradient(to_bottom,#FAFAFA_1px,transparent_1px)] bg-[size:16px_16px] opacity-50 pointer-events-none" />

      {/* Floating Document */}
      <motion.div
        animate={saved ? { y: [0, -5, 0] } : {}}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="relative z-10 w-12 h-14 border border-[#EBEBEB] bg-white rounded flex flex-col justify-between p-1.5 shadow-sm mb-4"
      >
        <FileText className="w-5 h-5 text-neutral-400 self-center mt-1" />
        <div className="h-1 bg-neutral-200 w-full rounded-sm" />
      </motion.div>

      {/* Download Trigger Button */}
      <button
        onClick={startDownload}
        disabled={downloading}
        className="relative z-10 px-4 h-8 bg-[#171717] hover:bg-[#171717]/90 text-white rounded-full text-[10.5px] font-semibold flex items-center gap-1.5 shadow-sm transition-all"
      >
        {downloading ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Compiling PDF...</span>
          </>
        ) : saved ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" strokeWidth={3} />
            <span>Document Saved!</span>
          </>
        ) : (
          <>
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Resume</span>
          </>
        )}
      </button>
    </div>
  );
}

// Render selector function for step simulations
function renderSimulation(stepIndex: number) {
  switch (stepIndex) {
    case 0:
      return <UploadSim />;
    case 1:
      return <AnalysisSim />;
    case 2:
      return <EnhanceSim />;
    case 3:
      return <AtsSim />;
    case 4:
      return <ExportSim />;
    default:
      return <UploadSim />;
  }
}

/* ═══════════════════════════════════════════════
   Main WorkflowTimeline Component
   ═══════════════════════════════════════════════ */

export default function WorkflowTimeline() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="workflow" className="w-full bg-[#fafaf9] relative overflow-hidden select-none">
      <div className="max-w-[1200px] mx-auto border-x border-[#e7e5e4] bg-white">
        
        {/* Header Block (Full-width, matching Capabilities) */}
        <div className="px-6 md:px-10 py-16 text-left">
          <span className="font-mono text-[14px] text-rose-500 font-semibold uppercase leading-4 block mb-3 select-none">
            #02 — How It Works
          </span>
          <h2
            className="mt-3 text-[#1c1917] font-bold leading-[1.15] text-2xl md:text-[clamp(28px,3vw,40px)] tracking-tight max-w-[640px]"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
            }}
          >
            How ResumeForge Works
          </h2>
        </div>

        {/* Split Tour Layout Container */}
        <div className="border-t border-[#e7e5e4] grid grid-cols-1 lg:grid-cols-[50%_50%] items-stretch divide-y lg:divide-y-0 lg:divide-x divide-[#e7e5e4]">
          
          {/* Left Column: Progress Timeline Stepper */}
          <div className="flex flex-col bg-[#fafaf9] p-6 md:p-10">
            <div className="relative flex-1 flex flex-col select-none">
              {/* Vertical progress connection line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-[#F2F2F2] pointer-events-none" />

              {/* Glowing active line overlay */}
              <div
                className="hidden lg:block absolute left-[19px] w-[2px] bg-[#7928CA] transition-all duration-500 pointer-events-none"
                style={{
                  top: `${activeStep * 84 + 16}px`,
                  height: activeStep === 4 ? "0px" : "84px"
                }}
              />

              <div className="flex flex-col gap-6">
                {steps.map((step, idx) => {
                  const isActive = activeStep === idx;
                  return (
                    <div
                      key={step.title}
                      onMouseEnter={() => setActiveStep(idx)}
                      className="flex flex-col text-left cursor-pointer group"
                    >
                      <div className="flex items-start gap-5">
                        {/* Step Circle Indicator */}
                        <div
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold font-sans text-sm z-10 shrink-0 transition-all duration-300 ${
                            isActive
                              ? "bg-white border-[#7928CA] text-[#7928CA] shadow-sm scale-105"
                              : "bg-[#FAFAFA] border-[#EBEBEB] text-[#8F8F8F]"
                          }`}
                        >
                          {idx + 1}
                        </div>

                        {/* Text details */}
                        <div className="pt-2 flex-1">
                          <h3
                            className={`text-base font-bold tracking-tight transition-colors duration-300 ${
                              isActive ? "text-[#171717]" : "text-[#8F8F8F] group-hover:text-[#4D4D4D]"
                            }`}
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {step.title}
                          </h3>
                          <p
                            className={`mt-1.5 text-[13px] leading-relaxed transition-colors duration-300 max-w-lg ${
                              isActive ? "text-[#4D4D4D]" : "text-neutral-400"
                            }`}
                            style={{ fontFamily: "var(--font-geist-sans)" }}
                          >
                            {step.description}
                          </p>

                          {/* Mobile nested visual simulation */}
                          {isActive && (
                            <div className="mt-4 lg:hidden w-full h-[200px] border border-[#EBEBEB] rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-sm">
                              {renderSimulation(idx)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Mock Window Visual Simulator (Desktop only) */}
          <div className="hidden lg:flex flex-col justify-center items-center bg-white p-6 md:p-10 relative min-h-[400px] overflow-hidden">
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

            <div className="relative z-10 w-[440px] border border-[#EBEBEB] rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col h-[340px]">
              
              {/* Window Header */}
              <div className="h-10 bg-[#FAFAFA] border-b border-[#EBEBEB] px-4 flex items-center justify-between select-none">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                </div>
                <span className="text-[10px] font-mono text-[#8F8F8F] uppercase tracking-wider font-semibold">
                  Sandbox Tour
                </span>
                <span className="text-[9px] font-mono text-[#8F8F8F] uppercase font-bold">
                  Step {activeStep + 1} of 5
                </span>
              </div>

              {/* Active Simulation */}
              <div className="flex-1 bg-white">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="w-full h-full"
                  >
                    {renderSimulation(activeStep)}
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
