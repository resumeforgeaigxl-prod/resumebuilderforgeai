"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSearch,
  Wand2,
  LayoutTemplate,
  FileText,
  Target,
  Lightbulb,
  Check,
  RotateCcw,
  ArrowRight,
  Sliders,
  CheckCircle
} from "lucide-react";

/* ═══════════════════════════════════════════════
   Bento Micro-Playgrounds
   ═══════════════════════════════════════════════ */

// 1. ATS Scan Playground
function ATSScanPlayground() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const handleScan = async () => {
    setIsScanning(true);
    setScanned(false);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 120);

    await new Promise((r) => setTimeout(r, 1400));
    setIsScanning(false);
    setScanned(true);
  };

  return (
    <div className="mt-4 flex flex-col bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-4 h-[210px] justify-between relative overflow-hidden w-full">
      {/* Laser scanning beam */}
      {isScanning && (
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-purple-500 shadow-[0_0_10px_#7928CA]"
          initial={{ top: "0%" }}
          animate={{ top: "100%" }}
          transition={{ duration: 1.4, ease: "linear" }}
        />
      )}

      {!scanned ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mb-2">
            <FileSearch className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-xs text-[#171717] font-semibold">alex_rivera_resume.pdf</p>
          <p className="text-[10px] text-[#8F8F8F] mt-0.5">142 KB • Ready for scan</p>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#171717] hover:bg-[#171717]/90 text-white rounded-full text-xs font-medium transition-all"
          >
            {isScanning ? (
              <>Scanning {scanProgress}%</>
            ) : (
              <>
                Run ATS Scan <ArrowRight className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      ) : (
        <motion.div
          className="flex flex-col justify-between h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-2">
            <span className="text-xs font-semibold text-[#171717]">Scan Analysis</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              64% Match
            </span>
          </div>
          <div className="space-y-1.5 my-2">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#4D4D4D]">Missing Tech Keywords:</span>
              <span className="font-semibold text-rose-500 font-mono">3 critical</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#4D4D4D]">Formatting Score:</span>
              <span className="font-semibold text-amber-500">Warning (Serif font)</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-[#4D4D4D]">Action Verb Strength:</span>
              <span className="font-semibold text-rose-500">Weak (use lead/managed)</span>
            </div>
          </div>
          <button
            onClick={() => setScanned(false)}
            className="self-center inline-flex items-center gap-1 px-3 py-1 border border-[#EBEBEB] hover:bg-[#F2F2F2] rounded-full text-[10px] font-medium text-[#4D4D4D] transition-colors"
          >
            <RotateCcw className="w-2.5 h-2.5" /> Re-scan
          </button>
        </motion.div>
      )}
    </div>
  );
}

// 2. AI Writer Playground
function AIRewritePlayground() {
  const startText = "Led a team of developers to build the frontend website.";
  const targetText = "Orchestrated a team of 6 engineers to deliver 4 high-traffic React apps, boosting page speed by 35%.";
  const [text, setText] = useState(startText);
  const [rewritten, setRewritten] = useState(false);
  const [typing, setTyping] = useState(false);

  const handleRewrite = async () => {
    setTyping(true);
    setRewritten(true);
    setText("");
    for (let i = 0; i <= targetText.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 15));
      setText(targetText.substring(0, i));
    }
    setTyping(false);
  };

  const handleReset = () => {
    setText(startText);
    setRewritten(false);
    setTyping(false);
  };

  return (
    <div className="mt-4 flex flex-col bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-4 h-[210px] justify-between w-full">
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-[10px] font-mono text-[#8F8F8F] uppercase tracking-wide mb-1">Bullet Point</p>
        <div className={`p-2.5 rounded-lg border text-xs min-h-[72px] leading-relaxed transition-all ${
          rewritten ? "bg-purple-50/40 border-purple-100 text-purple-900" : "bg-white border-[#EBEBEB] text-[#4D4D4D]"
        }`}>
          {text}
          {typing && <span className="inline-block w-[1.5px] h-[10px] bg-purple-600 ml-0.5 animate-pulse" />}
        </div>
      </div>
      <div className="flex justify-center mt-3 shrink-0">
        {!rewritten ? (
          <button
            onClick={handleRewrite}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7928CA] hover:bg-[#7928CA]/90 text-white rounded-full text-xs font-medium transition-all shadow-sm"
          >
            <Wand2 className="w-3 h-3" /> Optimize with AI
          </button>
        ) : (
          <button
            onClick={handleReset}
            disabled={typing}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 border border-[#EBEBEB] hover:bg-[#F2F2F2] rounded-full text-xs font-medium text-[#4D4D4D] transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset Bullet
          </button>
        )}
      </div>
    </div>
  );
}

// 3. Live Templates Playground
function TemplatesPlayground() {
  const [theme, setTheme] = useState<"modern" | "executive" | "tech" | "creative">("modern");

  const themes = {
    modern: { color: "#0070F3", name: "Modern Blue" },
    executive: { color: "#171717", name: "Executive Black" },
    tech: { color: "#7928CA", name: "Technical Purple" },
    creative: { color: "#FF0080", name: "Creative Pink" },
  };

  return (
    <div className="mt-4 flex flex-col bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-4 h-[210px] justify-between w-full">
      {/* Micro Resume Preview */}
      <div className="bg-white border border-[#EBEBEB] rounded-lg p-2.5 flex flex-col flex-1 shadow-sm overflow-hidden select-none">
        {/* Accent bar color based on theme */}
        <div
          className="h-1 w-full rounded-full transition-colors duration-500 mb-2 shrink-0"
          style={{ backgroundColor: themes[theme].color }}
        />
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded-full bg-[#F2F2F2] shrink-0" />
            <div className="space-y-0.5 flex-1">
              <div className="h-1.5 bg-[#171717] w-1/2 rounded" />
              <div className="h-1 bg-[#8F8F8F] w-1/3 rounded" />
            </div>
          </div>
          <div className="border-t border-[#F2F2F2] pt-1.5 space-y-1">
            <div className="h-1 bg-[#F2F2F2] w-full rounded" />
            <div className="h-1 bg-[#F2F2F2] w-5/6 rounded" />
            <div className="h-1 bg-[#F2F2F2] w-4/5 rounded" />
          </div>
        </div>
      </div>

      {/* Swatches */}
      <div className="flex flex-col items-center gap-1.5 mt-3 shrink-0">
        <div className="flex gap-2">
          {(Object.keys(themes) as Array<keyof typeof themes>).map((key) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`w-4 h-4 rounded-full border transition-all ${
                theme === key ? "ring-2 ring-offset-2 ring-purple-500 scale-110" : "scale-100"
              }`}
              style={{ backgroundColor: themes[key].color, borderColor: "rgba(0,0,0,0.1)" }}
              title={themes[key].name}
            />
          ))}
        </div>
        <span className="text-[10px] text-[#8F8F8F] font-mono">{themes[theme].name}</span>
      </div>
    </div>
  );
}

// 4. Tone Slider Playground (Cover Letter)
function CoverLetterPlayground() {
  const [tone, setTone] = useState<"professional" | "bold" | "creative">("professional");

  const letters = {
    professional: "I am writing to express my strong interest in the Software Engineer position. With 5 years of experience in React and Node.js, I am confident in my ability...",
    bold: "Stripe is redefining online commerce. As a developer who obsesses over page load speeds and API efficiency, I want to lead your core checkout initiatives...",
    creative: "From midnight side projects to deployment pipelines, code has always been my medium. I don't just build UI; I craft user experiences that feel fluid...",
  };

  return (
    <div className="mt-4 flex flex-col bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-4 h-[210px] justify-between w-full">
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-[10px] font-mono text-[#8F8F8F] uppercase tracking-wide mb-1">Generated Letter</p>
        <div className="p-2.5 bg-white border border-[#EBEBEB] rounded-lg text-xs leading-relaxed text-[#4D4D4D] min-h-[84px] select-none">
          <AnimatePresence mode="wait">
            <motion.p
              key={tone}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {letters[tone]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Tone Toggles */}
      <div className="mt-3 shrink-0 flex items-center justify-between border border-[#EBEBEB] rounded-full p-0.5 bg-white">
        {(["professional", "bold", "creative"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTone(t)}
            className={`flex-1 text-center py-1 rounded-full text-[10px] font-semibold capitalize transition-all ${
              tone === t
                ? "bg-[#171717] text-white shadow-sm"
                : "text-[#4D4D4D] hover:bg-[#FAFAFA]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

// 5. Job Match Score Matrix
function JobMatchPlayground() {
  const [company, setCompany] = useState<"vercel" | "stripe" | "linear">("vercel");

  const data = {
    vercel: {
      score: 95,
      keywords: ["Next.js", "Server Components", "Tailwind CSS"],
      status: "Excellent Match",
      color: "#10B981"
    },
    stripe: {
      score: 72,
      keywords: ["Ruby on Rails", "PostgreSQL", "React"],
      status: "Moderate Match",
      color: "#F59E0B"
    },
    linear: {
      score: 86,
      keywords: ["TypeScript", "WebSockets", "Linear Sync"],
      status: "Strong Match",
      color: "#10B981"
    },
  };

  return (
    <div className="mt-4 flex flex-col bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-4 h-[210px] justify-between w-full">
      <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-2 shrink-0">
        <div className="flex gap-2">
          {(["vercel", "stripe", "linear"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCompany(c)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold border capitalize transition-all ${
                company === c
                  ? "bg-[#171717] border-[#171717] text-white"
                  : "bg-white border-[#EBEBEB] text-[#4D4D4D] hover:bg-[#F2F2F2]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${data[company].color}15`,
            color: data[company].color,
          }}
        >
          {data[company].status}
        </span>
      </div>

      <div className="flex items-center gap-6 my-2 flex-1">
        {/* Metric gauge circle */}
        <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
          <svg width="80" height="80" viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#EBEBEB" strokeWidth="8" />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={data[company].color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 40}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{
                strokeDashoffset:
                  2 * Math.PI * 40 - (data[company].score / 100) * (2 * Math.PI * 40),
              }}
              transition={{ duration: 0.6 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-[#171717]">{data[company].score}%</span>
            <span className="text-[8px] text-[#8F8F8F] uppercase tracking-wider font-semibold">Fit</span>
          </div>
        </div>

        {/* Required Keywords */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-[10px] text-[#8F8F8F] font-semibold mb-1">Target Keyword Scans</p>
          <div className="flex flex-wrap gap-1">
            {data[company].keywords.map((kw) => (
              <span
                key={kw}
                className="text-[9px] font-medium font-mono px-1.5 py-0.5 rounded bg-white border border-[#EBEBEB] text-[#4D4D4D]"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 6. Smart Suggestions Playground
function SuggestionsPlayground() {
  const [fixed1, setFixed1] = useState(false);
  const [fixed2, setFixed2] = useState(false);

  return (
    <div className="mt-4 flex flex-col bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-4 h-[210px] justify-between w-full">
      <div className="flex-1 flex flex-col justify-center gap-2">
        {/* Suggestion Item 1 */}
        <div className="flex items-center justify-between bg-white border border-[#EBEBEB] rounded-lg p-2 transition-all">
          <div className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
              fixed1 ? "bg-emerald-500 border-emerald-500 text-white" : "border-[#EBEBEB]"
            }`}>
              {fixed1 && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
            </div>
            <span className={`text-[11px] font-medium transition-all ${fixed1 ? "text-[#8F8F8F] line-through" : "text-[#171717]"}`}>
              Quantify bullet point in Experience 1
            </span>
          </div>
          {!fixed1 && (
            <button
              onClick={() => setFixed1(true)}
              className="text-[10px] font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-2 py-0.5 rounded"
            >
              Fix
            </button>
          )}
        </div>

        {/* Suggestion Item 2 */}
        <div className="flex items-center justify-between bg-white border border-[#EBEBEB] rounded-lg p-2 transition-all">
          <div className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
              fixed2 ? "bg-emerald-500 border-emerald-500 text-white" : "border-[#EBEBEB]"
            }`}>
              {fixed2 && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
            </div>
            <span className={`text-[11px] font-medium transition-all ${fixed2 ? "text-[#8F8F8F] line-through" : "text-[#171717]"}`}>
              Add missing "Next.js" tag to skills
            </span>
          </div>
          {!fixed2 && (
            <button
              onClick={() => setFixed2(true)}
              className="text-[10px] font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-2 py-0.5 rounded"
            >
              Fix
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 text-center border-t border-[#EBEBEB] pt-2 shrink-0 flex items-center justify-between">
        <span className="text-[10px] text-[#8F8F8F]">
          {fixed1 && fixed2 ? "All problems resolved" : "Pending issues remaining"}
        </span>
        {(fixed1 || fixed2) && (
          <button
            onClick={() => {
              setFixed1(false);
              setFixed2(false);
            }}
            className="text-[10px] font-semibold text-[#8F8F8F] hover:text-[#171717]"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FeaturesGrid (Interactive Bento Layout)
   ═══════════════════════════════════════════════ */

const ease = [0.16, 1, 0.3, 1] as const;

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease },
  },
};

const gridVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease,
    },
  },
};

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-24 px-6 relative overflow-hidden bg-[#FFFFFF]">
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <motion.div
          className="text-center"
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <p
            className="text-[#8F8F8F] uppercase tracking-widest"
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "12px",
              fontWeight: 500,
              lineHeight: "16px",
            }}
          >
            Capabilities
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
            Everything you need to land interviews
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
            A dynamic bento toolkit designed to transform your resume into a job-winning application — powered by AI, validated for ATS.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-6 gap-6 mt-16"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {/* Card 1: ATS Scanner (Double-width) */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-3 bg-white border border-[#EBEBEB] rounded-2xl p-6 transition-all duration-300 hover:border-[#171717]/15 hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center border border-purple-100">
                <FileSearch className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="mt-4 text-[18px] font-bold text-[#171717] tracking-tight">ATS Scan Playground</h3>
              <p className="mt-1.5 text-xs text-[#4D4D4D] leading-relaxed">
                Scan your mock resume files directly. Test the parser performance, catch compliance alerts, and identify formatting bugs in real time.
              </p>
            </div>
            <ATSScanPlayground />
          </motion.div>

          {/* Card 2: AI Bullet Writer (Single-width) */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-3 bg-white border border-[#EBEBEB] rounded-2xl p-6 transition-all duration-300 hover:border-[#171717]/15 hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center border border-purple-100">
                <Wand2 className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="mt-4 text-[18px] font-bold text-[#171717] tracking-tight">AI Bullet Optimizer</h3>
              <p className="mt-1.5 text-xs text-[#4D4D4D] leading-relaxed">
                Transform weak description statements. Our engine converts generic points into metric-rich, action-oriented career achievements.
              </p>
            </div>
            <AIRewritePlayground />
          </motion.div>

          {/* Card 3: Live Templates (Single-width) */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 bg-white border border-[#EBEBEB] rounded-2xl p-6 transition-all duration-300 hover:border-[#171717]/15 hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 bg-[#F2F2F2] rounded-lg flex items-center justify-center">
                <LayoutTemplate className="w-5 h-5 text-[#171717]" />
              </div>
              <h3 className="mt-4 text-[16px] font-bold text-[#171717] tracking-tight">Template Customizer</h3>
              <p className="mt-1.5 text-xs text-[#4D4D4D] leading-relaxed">
                Toggle styles and colorways. Instantly test formatting layouts designed for recruiter readability.
              </p>
            </div>
            <TemplatesPlayground />
          </motion.div>

          {/* Card 4: Cover Letter (Single-width) */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 bg-white border border-[#EBEBEB] rounded-2xl p-6 transition-all duration-300 hover:border-[#171717]/15 hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 bg-[#F2F2F2] rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#171717]" />
              </div>
              <h3 className="mt-4 text-[16px] font-bold text-[#171717] tracking-tight">Tone Match Generator</h3>
              <p className="mt-1.5 text-xs text-[#4D4D4D] leading-relaxed">
                Adjust the copy slider. Generate custom introduction statements tailored to specific job vibes.
              </p>
            </div>
            <CoverLetterPlayground />
          </motion.div>

          {/* Card 5: Job Match Score (Single-width) */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-2 bg-white border border-[#EBEBEB] rounded-2xl p-6 transition-all duration-300 hover:border-[#171717]/15 hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between"
          >
            <div>
              <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-[16px] font-bold text-[#171717] tracking-tight">Fit Matrix Simulator</h3>
              <p className="mt-1.5 text-xs text-[#4D4D4D] leading-relaxed">
                Compare job descriptions. Select targets to trigger real-time fit metrics and tech stack audits.
              </p>
            </div>
            <JobMatchPlayground />
          </motion.div>

          {/* Card 6: Smart Suggestions (Full-width row) */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-6 bg-white border border-[#EBEBEB] rounded-2xl p-6 transition-all duration-300 hover:border-[#171717]/15 hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-6 items-center justify-between"
          >
            <div className="flex-1">
              <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center border border-purple-100">
                <Lightbulb className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="mt-4 text-[18px] font-bold text-[#171717] tracking-tight">Interactive Suggestion Engine</h3>
              <p className="mt-1.5 text-xs text-[#4D4D4D] leading-relaxed max-w-xl">
                Identify sections that need immediate attention. Try clicking the "Fix" actions to simulate applying automated recommendations directly to draft records.
              </p>
            </div>
            <div className="w-full md:w-[360px] shrink-0">
              <SuggestionsPlayground />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
