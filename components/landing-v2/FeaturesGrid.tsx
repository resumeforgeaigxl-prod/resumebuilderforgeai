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
  ArrowRight
} from "lucide-react";

/* ═══════════════════════════════════════════════
   Dedicated UI Demos (AutoSend Style)
   ═══════════════════════════════════════════════ */

// 1. ATS Resume Scanner Demo
interface ATSScanDemoProps {
  subOpt: number;
}

function ATSScanDemo({ subOpt }: ATSScanDemoProps) {
  const files = [
    { name: "alex_rivera_resume.pdf", score: 68, status: "Review Needed", missing: ["Next.js", "CI/CD", "Docker"] },
    { name: "marketing_draft.docx", score: 45, status: "Weak Match", missing: ["SEO", "Copywriting", "GA4"] },
    { name: "technical_cv_v2.pdf", score: 92, status: "Excellent Match", missing: [] }
  ];

  const file = files[subOpt] || files[0];
  const [isScanning, setIsScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    setIsScanning(false);
    setScanned(false);
    setScanProgress(0);
  }, [subOpt]);

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
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden text-left">
      {isScanning && (
        <motion.div
          className="absolute left-0 right-0 h-[2px] bg-purple-500 shadow-[0_0_10px_#7928CA] z-20"
          initial={{ top: "0%" }}
          animate={{ top: "100%" }}
          transition={{ duration: 1.4, ease: "linear" }}
        />
      )}

      {!scanned ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center select-none py-2">
          <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mb-1.5">
            <FileSearch className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-[11px] text-[#171717] font-semibold">{file.name}</p>
          <p className="text-[9px] text-[#8F8F8F]">142 KB • Ready to audit</p>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-[#171717] hover:bg-[#171717]/90 text-white rounded-full text-[9px] font-medium transition-all"
          >
            {isScanning ? `Auditing ${scanProgress}%` : "Scan Resume"}
          </button>
        </div>
      ) : (
        <motion.div
          className="flex flex-col justify-between h-full py-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-1.5">
            <span className="text-[10px] font-bold text-[#171717]">Compliance Audit</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
              file.score >= 85 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}>
              {file.score}% Match ({file.status})
            </span>
          </div>

          <div className="space-y-1.5 my-2">
            <div className="flex items-center gap-1.5 text-[9.5px]">
              <span className={file.score >= 85 ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                {file.score >= 85 ? "✓" : "⚠"}
              </span>
              <span className="text-[#4D4D4D]">
                {file.score >= 85 ? "Full keyword match" : `Missing keywords: ${file.missing.join(", ")}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[9.5px]">
              <span className="text-emerald-500 font-bold">✓</span>
              <span className="text-[#4D4D4D]">Scannable structure & layout</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9.5px]">
              <span className="text-emerald-500 font-bold">✓</span>
              <span className="text-[#4D4D4D]">PDF file-type compliance</span>
            </div>
          </div>

          <button
            onClick={() => setScanned(false)}
            className="self-center inline-flex items-center gap-1 px-2.5 py-1 border border-[#EBEBEB] hover:bg-[#F2F2F2] rounded-full text-[9px] font-semibold text-[#4D4D4D] transition-colors"
          >
            <RotateCcw className="w-2.5 h-2.5" /> Re-scan
          </button>
        </motion.div>
      )}
    </div>
  );
}

// 2. Improve Resume Bullet Points Demo
interface ImproveBulletsDemoProps {
  subOpt: number;
}

function ImproveBulletsDemo({ subOpt }: ImproveBulletsDemoProps) {
  const data = [
    {
      start: "Led a team of developers to build the frontend website.",
      target: "Orchestrated a team of 6 engineers to deliver 4 high-traffic React apps, boosting page speed by 35%."
    },
    {
      start: "Wrote backend APIs and managed database queries.",
      target: "Designed scalable Node.js microservices handling 20k req/sec, optimizing database query response times by 40%."
    },
    {
      start: "Gathered customer requirements and wrote product specs.",
      target: "Launched 3 core feature verticals by aligning cross-functional teams, driving a 15% increase in user retention."
    },
    {
      start: "Analyzed company data and created SQL reports.",
      target: "Built ETL pipelines processing 50M+ rows daily, uncovering insights that saved $45K in annual infrastructure costs."
    },
    {
      start: "Set up CI/CD pipelines and deployment processes.",
      target: "Automated AWS deployments via Terraform and GitHub Actions, reducing release cycle time from 3 days to 12 minutes."
    }
  ];

  const bullet = data[subOpt] || data[0];
  const [text, setText] = useState("");
  const [rewritten, setRewritten] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    setText(bullet.start);
    setRewritten(false);
    setTyping(false);
  }, [subOpt]);

  const handleRewrite = async () => {
    setTyping(true);
    setRewritten(true);
    setText("");
    const targetText = bullet.target;
    for (let i = 0; i <= targetText.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 15));
      setText(targetText.substring(0, i));
    }
    setTyping(false);
  };

  const handleReset = () => {
    setText(bullet.start);
    setRewritten(false);
    setTyping(false);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between text-left">
      <div className="flex-1 flex flex-col justify-center gap-1.5">
        {!rewritten ? (
          <div className="space-y-1">
            <span className="text-[8px] font-mono text-rose-500 uppercase font-semibold">Original (Weak)</span>
            <div className="p-2 border border-rose-100 bg-rose-50/20 text-rose-950 rounded-lg text-[10.5px] leading-relaxed">
              {text}
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <span className="text-[8px] font-mono text-emerald-500 uppercase font-semibold">AI Optimized (Strong & Quantified)</span>
            <div className="p-2 border border-emerald-100 bg-emerald-50/20 text-emerald-950 rounded-lg text-[10.5px] leading-relaxed min-h-[60px]">
              {text}
              {typing && <span className="inline-block w-[1.5px] h-[10px] bg-purple-600 ml-0.5 animate-pulse" />}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center shrink-0 mt-2">
        {!rewritten ? (
          <button
            onClick={handleRewrite}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#7928CA] hover:bg-[#7928CA]/90 text-white rounded-full text-[9px] font-medium transition-all"
          >
            <Wand2 className="w-3 h-3" /> Improve with AI
          </button>
        ) : (
          <button
            onClick={handleReset}
            disabled={typing}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#EBEBEB] hover:bg-[#F2F2F2] rounded-full text-[9px] font-medium text-[#4D4D4D] transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset Bullet
          </button>
        )}
      </div>
    </div>
  );
}

// 3. Resume Template Designer Demo
interface TemplatesPlaygroundProps {
  templateName: "Modern" | "Executive" | "Technical" | "Creative" | "Minimal";
}

function TemplatesPlayground({ templateName }: TemplatesPlaygroundProps) {
  const themes = {
    Modern: { color: "#0070F3", name: "Modern Blue" },
    Executive: { color: "#171717", name: "Executive Black" },
    Technical: { color: "#7928CA", name: "Technical Purple" },
    Creative: { color: "#FF0080", name: "Creative Pink" },
    Minimal: { color: "#8F8F8F", name: "Minimal Gray" },
  };

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="bg-white border border-[#EBEBEB] rounded-lg p-3 flex flex-col flex-1 shadow-sm overflow-hidden select-none relative">
        {templateName === "Modern" && (
          <div className="h-full flex flex-col justify-between">
            <div className="h-1 bg-[#0070F3] w-full rounded-t -mt-3 -mx-3 mb-2 shrink-0" />
            <div className="flex-1 flex gap-3 mt-1 overflow-hidden text-left">
              <div className="w-[45px] pr-2 flex flex-col gap-1.5" style={{ borderRight: "1px solid #F2F2F2" }}>
                <div className="w-7 h-7 rounded-full bg-[#0070F3]/10 text-[#0070F3] font-bold text-[9px] flex items-center justify-center">AR</div>
                <div className="space-y-0.5 mt-1">
                  <div className="h-[3px] bg-[#0070F3]/30 w-full rounded-sm" />
                  <div className="h-1 bg-[#FAFAFA] border border-[#EBEBEB] w-full rounded-sm" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <div className="text-[9px] font-bold text-[#171717] leading-none">Alex Rivera</div>
                  <div className="text-[6px] text-[#0070F3] font-medium mt-0.5">Staff Software Engineer</div>
                </div>
                <div className="space-y-1 mt-2">
                  <div className="h-[3px] bg-[#171717] w-1/3 rounded-sm" />
                  <div className="space-y-0.5">
                    <div className="h-[2px] bg-[#F2F2F2] w-full rounded-sm" />
                    <div className="h-[2px] bg-[#F2F2F2] w-5/6 rounded-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {templateName === "Executive" && (
          <div className="h-full flex flex-col justify-between font-serif text-center">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-[#171717] uppercase tracking-wide">Alex Rivera</div>
              <div className="text-[5px] text-[#8F8F8F] uppercase tracking-widest -mt-0.5">Staff Software Engineer</div>
              <div className="h-[0.5px] bg-[#171717] w-full mt-1.5" />
            </div>
            <div className="flex-1 text-left mt-2 space-y-2 overflow-hidden">
              <div className="space-y-1">
                <div className="text-[6px] font-bold text-[#171717] uppercase tracking-wider">Professional Experience</div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[4.5px] font-semibold text-[#4D4D4D]">
                    <span>Lead Engineer @ Stripe</span>
                    <span className="text-[#8F8F8F]">2022 - Pres</span>
                  </div>
                  <div className="h-[2px] bg-[#F2F2F2] w-full rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        )}

        {templateName === "Technical" && (
          <div className="h-full flex flex-col justify-between text-left font-mono">
            <div className="flex-1 flex gap-3 overflow-hidden">
              <div className="w-[50px] pr-2 flex flex-col gap-1" style={{ borderRight: "1px solid #F2F2F2" }}>
                <div className="text-[5px] font-bold text-[#7928CA] uppercase">Skills</div>
                {["React", "TS", "Next.js", "Go"].map((skill) => (
                  <span key={skill} className="text-[4px] font-medium text-[#4D4D4D] bg-[#FAFAFA] border border-[#EBEBEB] px-1 py-0.2 rounded-sm text-center">
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <div className="text-[8px] font-bold text-[#171717]">alex_rivera.ts</div>
                  <div className="text-[5px] text-[#7928CA] font-medium mt-0.5">&gt; Staff Software Engineer</div>
                </div>
                <div className="space-y-1">
                  <div className="h-[0.5px] bg-[#EBEBEB] w-full" />
                  <div className="space-y-0.5">
                    <div className="h-[2px] bg-[#F2F2F2] w-full rounded-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {templateName === "Creative" && (
          <div className="h-full flex flex-col justify-between text-left">
            <div className="flex-1 flex gap-3 overflow-hidden">
              <div className="w-[36px] bg-[#FF0080]/5 rounded-md flex flex-col items-center justify-center p-2 border border-[#FF0080]/10">
                <span className="text-[14px] font-black text-[#FF0080]">R</span>
                <span className="text-[4px] text-[#FF0080] font-bold uppercase mt-1">Creative</span>
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <div className="text-[9px] font-black text-[#171717] tracking-tight">ALEX RIVERA</div>
                  <div className="text-[5.5px] text-[#FF0080] font-semibold mt-0.5">Staff Software Engineer</div>
                </div>
                <div className="space-y-1">
                  <div className="h-[2px] bg-[#F2F2F2] w-full rounded-sm" />
                  <div className="h-[2px] bg-[#F2F2F2] w-11/12 rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        )}

        {templateName === "Minimal" && (
          <div className="h-full flex flex-col justify-between text-left font-sans">
            <div className="space-y-1">
              <div className="text-[9px] font-medium text-[#171717]">Alex Rivera</div>
              <div className="text-[5.5px] text-[#8F8F8F] -mt-0.5">Staff Software Engineer</div>
              <div className="h-[0.5px] bg-[#F2F2F2] w-full mt-1.5" />
            </div>
            <div className="flex-1 space-y-1.5 mt-2 overflow-hidden">
              <div className="space-y-0.5">
                <div className="h-[2px] bg-[#FAFAFA] border border-[#F2F2F2] w-full rounded-sm" />
                <div className="h-[2px] bg-[#FAFAFA] border border-[#F2F2F2] w-5/6 rounded-sm" />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="text-center mt-2 select-none">
        <span className="text-[9px] text-[#8F8F8F] font-mono uppercase tracking-wider font-semibold">
          Active Layout: {themes[templateName].name}
        </span>
      </div>
    </div>
  );
}

// 4. Tailor Resume For Any Job Demo
interface TailorResumeDemoProps {
  subOpt: number;
}

function TailorResumeDemo({ subOpt }: TailorResumeDemoProps) {
  const jobs = [
    {
      role: "Next.js Core Developer",
      desc: "Requires deep knowledge of Next.js Server Components, React rendering lifecycles, and TypeScript compiler optimization.",
      summary: "Staff Engineer with 5+ years of experience specializing in Next.js App Router performance and TypeScript compiler configurations."
    },
    {
      role: "Stripe Billing Lead",
      desc: "Looking for an engineer to lead billing initiatives. Heavy emphasis on Ruby/Rails, SQL optimizations, and payment gateways.",
      summary: "Fullstack Leader with a proven track record scaling Stripe payment pipelines and optimizing database transactions."
    },
    {
      role: "Linear Sync Engineer",
      desc: "Architect local-first synchronization layers. Requires real-time WebSocket protocol engineering and strict TypeScript typing.",
      summary: "Systems Engineer specialized in local-first sync layers, WebSocket architecture, and real-time state synchronization."
    }
  ];

  const job = jobs[subOpt] || jobs[0];

  return (
    <div className="w-full h-full flex flex-col justify-between text-left select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-hidden my-1">
        {/* Left Column: Job Spec */}
        <div className="flex flex-col border border-[#EBEBEB] bg-[#FAFAFA] rounded-lg p-2.5 overflow-hidden">
          <span className="text-[7.5px] font-mono text-purple-600 uppercase font-semibold">Target Job Role</span>
          <h5 className="text-[9.5px] font-bold text-[#171717] mt-0.5 truncate">{job.role}</h5>
          <p className="text-[8.5px] text-[#8F8F8F] leading-normal mt-1 flex-1 overflow-y-auto">
            {job.desc}
          </p>
        </div>
        {/* Right Column: AI Response */}
        <div className="flex flex-col border border-[#EBEBEB] bg-white rounded-lg p-2.5 overflow-hidden">
          <span className="text-[7.5px] font-mono text-emerald-600 uppercase font-semibold">AI Tailored Summary</span>
          <div className="text-[8.5px] text-[#4D4D4D] leading-normal mt-1.5 flex-1 overflow-y-auto bg-emerald-50/10 border border-emerald-100/50 p-1.5 rounded">
            {job.summary}
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. Match Resume To Job Description Demo
interface MatchResumeDemoProps {
  subOpt: number;
}

function MatchResumeDemo({ subOpt }: MatchResumeDemoProps) {
  const data = {
    Vercel: {
      score: 95,
      keywords: ["Next.js", "Server Components", "Tailwind CSS"],
      status: "Excellent Match",
      color: "#10B981"
    },
    Stripe: {
      score: 72,
      keywords: ["Ruby on Rails", "PostgreSQL", "React"],
      status: "Moderate Match",
      color: "#F59E0B"
    },
    Linear: {
      score: 86,
      keywords: ["TypeScript", "WebSockets", "Linear Sync"],
      status: "Strong Match",
      color: "#10B981"
    },
  };

  const companies = ["Vercel", "Stripe", "Linear"] as const;
  const company = companies[subOpt] || companies[0];
  const info = data[company];

  return (
    <div className="w-full h-full flex flex-col justify-between text-left select-none">
      <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-1.5 shrink-0">
        <span className="text-[10.5px] font-bold text-[#171717]">{company} Compatibility Audit</span>
        <span
          className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${info.color}15`,
            color: info.color,
          }}
        >
          {info.status}
        </span>
      </div>

      <div className="flex items-center gap-5 flex-1 my-2">
        {/* Metric circle */}
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <svg width="64" height="64" viewBox="0 0 100 100" className="-rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#EBEBEB" strokeWidth="8" />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={info.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 40}
              initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
              animate={{
                strokeDashoffset:
                  2 * Math.PI * 40 - (info.score / 100) * (2 * Math.PI * 40),
              }}
              transition={{ duration: 0.6 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-[#171717]">{info.score}%</span>
            <span className="text-[6.5px] text-[#8F8F8F] uppercase tracking-wider font-semibold">Match</span>
          </div>
        </div>

        {/* Required Keywords */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-[9px] text-[#8F8F8F] font-semibold mb-1">Target Keyword Match Status</p>
          <div className="flex flex-wrap gap-1">
            {info.keywords.map((kw) => (
              <span
                key={kw}
                className="text-[8.5px] font-medium font-mono px-1.5 py-0.5 rounded bg-white border border-[#EBEBEB] text-[#4D4D4D]"
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

// 6. AI Resume Suggestions Demo
interface SuggestionsDemoProps {
  filterType: number;
}

function SuggestionsDemo({ filterType }: SuggestionsDemoProps) {
  const [fixed1, setFixed1] = useState(false);
  const [fixed2, setFixed2] = useState(false);

  const filters = ["All Issues", "Experience", "Skills"] as const;
  const activeFilter = filters[filterType] || filters[0];

  const items = [
    {
      id: 1,
      text: "Quantify bullet point in Experience 1",
      category: "Experience",
      fixed: fixed1,
      setFixed: setFixed1,
    },
    {
      id: 2,
      text: "Add missing \"Next.js\" tag to skills",
      category: "Skills",
      fixed: fixed2,
      setFixed: setFixed2,
    },
  ];

  const filteredItems = items.filter(
    (item) => activeFilter === "All Issues" || item.category === activeFilter
  );

  return (
    <div className="w-full h-full flex flex-col justify-between text-left">
      <div className="flex-1 flex flex-col justify-center gap-2">
        {filteredItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between bg-white border border-[#EBEBEB] rounded-lg p-2.5 transition-all shadow-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                item.fixed ? "bg-emerald-500 border-emerald-500 text-white animate-scale-pop" : "border-[#EBEBEB]"
              }`}>
                {item.fixed && <Check className="w-2.5 h-2.5" strokeWidth={3} />}
              </div>
              <span className={`text-[10px] font-medium transition-all ${item.fixed ? "text-[#8F8F8F] line-through" : "text-[#171717]"}`}>
                {item.text}
              </span>
            </div>
            {!item.fixed && (
              <button
                onClick={() => item.setFixed(true)}
                className="text-[9px] font-bold text-purple-600 hover:text-purple-700 bg-purple-50 px-2 py-0.5 rounded select-none"
              >
                Fix
              </button>
            )}
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="text-center text-[10px] text-[#8F8F8F] py-4 select-none">
            No suggestions left in this category
          </div>
        )}
      </div>

      <div className="mt-2 text-center border-t border-[#EBEBEB] pt-2 shrink-0 flex items-center justify-between select-none">
        <span className="text-[9px] text-[#8F8F8F]">
          {fixed1 && fixed2 ? "All suggestions resolved" : "Suggestions pending"}
        </span>
        {(fixed1 || fixed2) && (
          <button
            onClick={() => {
              setFixed1(false);
              setFixed2(false);
            }}
            className="text-[9px] font-semibold text-[#8F8F8F] hover:text-[#171717]"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FeaturesGrid (Split Layout Workspace Showcase)
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

export default function FeaturesGrid() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeSubOption, setActiveSubOption] = useState(0);

  useEffect(() => {
    setActiveSubOption(0);
  }, [activeTab]);

  const features = [
    {
      id: 0,
      title: "ATS Resume Scanner",
      description: "Scan your resume against job criteria to identify formatting issues and missing keywords.",
      icon: FileSearch,
      sidebarOptions: ["alex_resume.pdf", "marketing_draft.docx", "technical_cv_v2.pdf"],
      renderPlayground: (subOpt: number) => <ATSScanDemo subOpt={subOpt} />,
      badge: "ATS Scanner",
      bgClass: "bg-purple-50 border-purple-100 text-purple-600"
    },
    {
      id: 1,
      title: "Improve Resume Bullet Points",
      description: "Rewrite plain duties into high-impact, metrics-driven bullet achievements.",
      icon: Wand2,
      sidebarOptions: ["Frontend", "Backend", "Product", "Data", "DevOps"],
      renderPlayground: (subOpt: number) => <ImproveBulletsDemo subOpt={subOpt} />,
      badge: "AI Bullet Optimizer",
      bgClass: "bg-purple-50 border-purple-100 text-purple-600"
    },
    {
      id: 2,
      title: "Resume Template Designer",
      description: "Instantly toggle between professional layouts built for recruiter readability.",
      icon: LayoutTemplate,
      sidebarOptions: ["Modern", "Executive", "Technical", "Creative", "Minimal"],
      renderPlayground: (subOpt: number) => {
        const templates = ["Modern", "Executive", "Technical", "Creative", "Minimal"] as const;
        return <TemplatesPlayground templateName={templates[subOpt]} />;
      },
      badge: "Template Designer",
      bgClass: "bg-[#F2F2F2] border-transparent text-[#171717]"
    },
    {
      id: 3,
      title: "Tailor Resume For Any Job",
      description: "Generate customized resume summaries and cover letters for specific job posts.",
      icon: FileText,
      sidebarOptions: ["Vercel", "Stripe", "Linear"],
      renderPlayground: (subOpt: number) => <TailorResumeDemo subOpt={subOpt} />,
      badge: "Role Adaptor",
      bgClass: "bg-[#F2F2F2] border-transparent text-[#171717]"
    },
    {
      id: 4,
      title: "Match Resume To Job Description",
      description: "Get a comprehensive compatibility score and skill gap analysis for any tech role.",
      icon: Target,
      sidebarOptions: ["Vercel", "Stripe", "Linear"],
      renderPlayground: (subOpt: number) => <MatchResumeDemo subOpt={subOpt} />,
      badge: "Job Match Matrix",
      bgClass: "bg-emerald-50 border-emerald-100 text-emerald-600"
    },
    {
      id: 5,
      title: "AI Resume Suggestions",
      description: "Receive real-time, actionable resume fixes with one-click automated updates.",
      icon: Lightbulb,
      sidebarOptions: ["All Issues", "Experience", "Skills"],
      renderPlayground: (subOpt: number) => <SuggestionsDemo filterType={subOpt} />,
      badge: "Suggestions Feed",
      bgClass: "bg-purple-50 border-purple-100 text-purple-600"
    }
  ];

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
            A dynamic workspace designed to transform your resume into a job-winning application — powered by AI, validated for ATS.
          </p>
        </motion.div>

        {/* Split Interactive Workspace Layout (AutoSend Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.38fr] border border-[#EBEBEB] rounded-2xl overflow-hidden mt-16 shadow-[0_8px_32px_rgba(0,0,0,0.02)] bg-white">
          {/* Left Column: Interactive Tab Buttons */}
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible scrollbar-none bg-[#FAFAFA] border-b lg:border-b-0 lg:border-r border-[#EBEBEB] shrink-0 snap-x">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveTab(idx)}
                  className={`relative flex items-start text-left p-6 transition-all hover:bg-neutral-100/30 border-r lg:border-r-0 lg:border-b border-[#EBEBEB] last:border-r-0 lg:last:border-b-0 shrink-0 snap-start w-[280px] lg:w-full select-none ${
                    isActive ? "bg-white" : "bg-transparent"
                  }`}
                >
                  {/* Left purple active indicator line */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#7928CA]" />
                  )}
                  
                  <div className={`w-8 h-8 rounded border border-[#EBEBEB] bg-white flex items-center justify-center shrink-0 mt-0.5 ${isActive ? "text-[#7928CA]" : "text-[#4D4D4D]"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-bold text-[#171717] tracking-tight">{feature.title}</h4>
                    <p className="text-[11px] text-[#8F8F8F] leading-relaxed mt-1 hidden lg:block">
                      {feature.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Preview Canvas with Floating Mockup */}
          <div className="relative flex items-center justify-center p-8 bg-[#FAFAFA] min-h-[420px] lg:min-h-[480px]">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#EBEBEB_1px,transparent_1px),linear-gradient(to_bottom,#EBEBEB_1px,transparent_1px)] bg-[size:20px_20px] opacity-40" />

            {/* Floating Mock Window Frame */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-[580px] h-[360px] bg-white border border-[#EBEBEB] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col"
            >
              {/* Mock Window Top Bar */}
              <div className="h-9 bg-[#FAFAFA]/90 border-b border-[#EBEBEB] px-4 flex items-center justify-between shrink-0 select-none">
                {/* Window control dots */}
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                </div>
                {/* Window title */}
                <span className="text-[10px] font-mono text-[#8F8F8F] uppercase tracking-wider font-semibold">
                  {features[activeTab].badge}
                </span>
                <div className="w-12" /> {/* spacer */}
              </div>

              {/* Mock Window Split Content */}
              <div className="flex-1 flex overflow-hidden bg-white">
                {/* Internal Left Sidebar */}
                <div className="w-[140px] bg-[#FAFAFA] border-r border-[#EBEBEB] flex flex-col shrink-0 py-2 overflow-y-auto select-none">
                  {features[activeTab].sidebarOptions.map((opt, idx) => {
                    const isActive = activeSubOption === idx;
                    return (
                      <button
                        key={opt}
                        onClick={() => setActiveSubOption(idx)}
                        className={`text-left px-3.5 py-1.5 text-[11px] font-medium transition-all truncate ${
                          isActive 
                            ? "bg-[#171717]/5 text-[#171717] font-semibold border-l-2 border-[#7928CA]" 
                            : "text-[#8F8F8F] hover:text-[#4D4D4D] border-l-2 border-transparent"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Internal Right Playground Content */}
                <div className="flex-1 bg-white p-5 overflow-y-auto flex items-center justify-center">
                  {features[activeTab].renderPlayground(activeSubOption)}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
