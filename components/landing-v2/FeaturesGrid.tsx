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
   Bento Micro-Playgrounds (Refactored to be Sidebar-Driven)
   ═══════════════════════════════════════════════ */

// 1. ATS Scan Playground
interface ATSScanPlaygroundProps {
  fileName: string;
}

function ATSScanPlayground({ fileName }: ATSScanPlaygroundProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    setIsScanning(false);
    setScanned(false);
    setScanProgress(0);
  }, [fileName]);

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
    <div className="relative w-full h-[200px] flex flex-col justify-between overflow-hidden">
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
        <div className="flex flex-col items-center justify-center flex-1 text-center select-none">
          <div className="w-9 h-9 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mb-2">
            <FileSearch className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xs text-[#171717] font-semibold">{fileName}</p>
          <p className="text-[10px] text-[#8F8F8F] mt-0.5">142 KB • Ready for scan</p>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#171717] hover:bg-[#171717]/90 text-white rounded-full text-[10px] font-medium transition-all"
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
          <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-1.5">
            <span className="text-[11px] font-semibold text-[#171717]">Scan Analysis</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              64% Match
            </span>
          </div>
          <div className="space-y-1.5 my-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-[#4D4D4D]">Missing Tech Keywords:</span>
              <span className="font-semibold text-rose-500 font-mono">3 critical</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-[#4D4D4D]">Formatting Score:</span>
              <span className="font-semibold text-amber-500">Warning (Serif font)</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-[#4D4D4D]">Action Verb Strength:</span>
              <span className="font-semibold text-rose-500">Weak (use lead/managed)</span>
            </div>
          </div>
          <button
            onClick={() => setScanned(false)}
            className="self-center inline-flex items-center gap-1 px-3 py-1 border border-[#EBEBEB] hover:bg-[#F2F2F2] rounded-full text-[9px] font-medium text-[#4D4D4D] transition-colors mt-1"
          >
            <RotateCcw className="w-2.5 h-2.5" /> Re-scan
          </button>
        </motion.div>
      )}
    </div>
  );
}

// 2. AI Writer Playground
interface AIRewritePlaygroundProps {
  roleType: "Frontend" | "Backend" | "Product" | "Data" | "DevOps";
}

function AIRewritePlayground({ roleType }: AIRewritePlaygroundProps) {
  const data = {
    Frontend: {
      start: "Led a team of developers to build the frontend website.",
      target: "Orchestrated a team of 6 engineers to deliver 4 high-traffic React apps, boosting page speed by 35%."
    },
    Backend: {
      start: "Wrote backend APIs and managed database queries.",
      target: "Designed scalable Node.js microservices handling 20k req/sec, optimizing database query response times by 40%."
    },
    Product: {
      start: "Gathered customer requirements and wrote product specs.",
      target: "Launched 3 core feature verticals by aligning cross-functional teams, driving a 15% increase in user retention."
    },
    Data: {
      start: "Analyzed company data and created SQL reports.",
      target: "Built ETL pipelines processing 50M+ rows daily, uncovering insights that saved $45K in annual infrastructure costs."
    },
    DevOps: {
      start: "Set up CI/CD pipelines and deployment processes.",
      target: "Automated AWS deployments via Terraform and GitHub Actions, reducing release cycle time from 3 days to 12 minutes."
    }
  };

  const [text, setText] = useState("");
  const [rewritten, setRewritten] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    setText(data[roleType].start);
    setRewritten(false);
    setTyping(false);
  }, [roleType]);

  const handleRewrite = async () => {
    setTyping(true);
    setRewritten(true);
    setText("");
    const targetText = data[roleType].target;
    for (let i = 0; i <= targetText.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 15));
      setText(targetText.substring(0, i));
    }
    setTyping(false);
  };

  const handleReset = () => {
    setText(data[roleType].start);
    setRewritten(false);
    setTyping(false);
  };

  return (
    <div className="w-full h-[200px] flex flex-col justify-between">
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-[9px] font-mono text-[#8F8F8F] uppercase tracking-wide mb-1 select-none">Bullet Point</p>
        <div className={`p-2.5 rounded-lg border text-[11px] min-h-[75px] leading-relaxed transition-all ${
          rewritten ? "bg-purple-50/40 border-purple-100 text-purple-900" : "bg-white border-[#EBEBEB] text-[#4D4D4D]"
        }`}>
          {text}
          {typing && <span className="inline-block w-[1.5px] h-[10px] bg-purple-600 ml-0.5 animate-pulse" />}
        </div>
      </div>
      <div className="flex justify-center mt-2 shrink-0">
        {!rewritten ? (
          <button
            onClick={handleRewrite}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7928CA] hover:bg-[#7928CA]/90 text-white rounded-full text-[10px] font-medium transition-all shadow-sm"
          >
            <Wand2 className="w-3 h-3" /> Optimize with AI
          </button>
        ) : (
          <button
            onClick={handleReset}
            disabled={typing}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 border border-[#EBEBEB] hover:bg-[#F2F2F2] rounded-full text-[10px] font-medium text-[#4D4D4D] transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset Bullet
          </button>
        )}
      </div>
    </div>
  );
}

// 3. Live Templates Playground
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
    <div className="w-full h-[200px] flex flex-col justify-between">
      {/* Micro Resume Preview */}
      <div className="bg-white border border-[#EBEBEB] rounded-lg p-3 flex flex-col flex-1 shadow-sm overflow-hidden select-none relative">
        
        {/* Render different template design dynamically based on templateName */}
        {templateName === "Modern" && (
          <div className="h-full flex flex-col justify-between">
            {/* Top Blue Accent */}
            <div className="h-1 bg-[#0070F3] w-full rounded-t -mt-3 -mx-3 mb-2 shrink-0" />
            <div className="flex-1 flex gap-3 mt-1 overflow-hidden text-left">
              {/* Left Column (Sidebar) */}
              <div className="w-[45px] pr-2 flex flex-col gap-1.5" style={{ borderRight: "1px solid #F2F2F2" }}>
                <div className="w-7 h-7 rounded-full bg-[#0070F3]/10 text-[#0070F3] font-bold text-[9px] flex items-center justify-center">AR</div>
                <div className="space-y-0.5 mt-1">
                  <div className="h-[3px] bg-[#0070F3]/30 w-full rounded-sm" />
                  <div className="h-1 bg-[#FAFAFA] border border-[#EBEBEB] w-full rounded-sm" />
                  <div className="h-1 bg-[#FAFAFA] border border-[#EBEBEB] w-full rounded-sm" />
                </div>
              </div>
              {/* Right Column (Content) */}
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
                    <div className="h-[2px] bg-[#F2F2F2] w-4/5 rounded-sm" />
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
                    <span className="text-[#8F8F8F]">2022 - Present</span>
                  </div>
                  <div className="h-[2px] bg-[#F2F2F2] w-full rounded-sm" />
                  <div className="h-[2px] bg-[#F2F2F2] w-11/12 rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        )}

        {templateName === "Technical" && (
          <div className="h-full flex flex-col justify-between text-left font-mono">
            <div className="flex-1 flex gap-3 overflow-hidden">
              {/* Left Column (Skills) */}
              <div className="w-[50px] pr-2 flex flex-col gap-1" style={{ borderRight: "1px solid #F2F2F2" }}>
                <div className="text-[5px] font-bold text-[#7928CA] uppercase">Skills</div>
                {["React", "TS", "Next.js", "Go"].map((skill) => (
                  <span key={skill} className="text-[4px] font-medium text-[#4D4D4D] bg-[#FAFAFA] border border-[#EBEBEB] px-1 py-0.2 rounded-sm text-center">
                    {skill}
                  </span>
                ))}
              </div>
              {/* Right Column (Content) */}
              <div className="flex-1 space-y-2">
                <div>
                  <div className="text-[8px] font-bold text-[#171717]">alex_rivera.ts</div>
                  <div className="text-[5px] text-[#7928CA] font-medium mt-0.5">&gt; Staff Software Engineer</div>
                </div>
                <div className="space-y-1">
                  <div className="h-[0.5px] bg-[#EBEBEB] w-full" />
                  <div className="space-y-0.5">
                    <div className="h-[2px] bg-[#F2F2F2] w-full rounded-sm" />
                    <div className="h-[2px] bg-[#F2F2F2] w-5/6 rounded-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {templateName === "Creative" && (
          <div className="h-full flex flex-col justify-between text-left">
            <div className="flex-1 flex gap-3 overflow-hidden">
              {/* Left Column: Bold initial mark */}
              <div className="w-[36px] bg-[#FF0080]/5 rounded-md flex flex-col items-center justify-center p-2 border border-[#FF0080]/10">
                <span className="text-[14px] font-black text-[#FF0080]">R</span>
                <span className="text-[4px] text-[#FF0080] font-bold uppercase mt-1">Creative</span>
              </div>
              {/* Right Column (Content) */}
              <div className="flex-1 space-y-2">
                <div>
                  <div className="text-[9px] font-black text-[#171717] tracking-tight">ALEX RIVERA</div>
                  <div className="text-[5.5px] text-[#FF0080] font-semibold mt-0.5">Staff Software Engineer</div>
                </div>
                <div className="space-y-1">
                  <div className="h-[2px] bg-[#F2F2F2] w-full rounded-sm" />
                  <div className="h-[2px] bg-[#F2F2F2] w-11/12 rounded-sm" />
                  <div className="h-[2px] bg-[#F2F2F2] w-4/5 rounded-sm" />
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
                <div className="h-[2.5px] bg-[#EBEBEB] w-1/4 rounded-sm" />
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

// 4. Tone Slider Playground (Cover Letter)
interface CoverLetterPlaygroundProps {
  tone: "Professional" | "Bold" | "Creative";
}

function CoverLetterPlayground({ tone }: CoverLetterPlaygroundProps) {
  const letters = {
    Professional: "I am writing to express my strong interest in the Software Engineer position. With 5 years of experience in React and Node.js, I am confident in my ability...",
    Bold: "Stripe is redefining online commerce. As a developer who obsesses over page load speeds and API efficiency, I want to lead your core checkout initiatives...",
    Creative: "From midnight side projects to deployment pipelines, code has always been my medium. I don't just build UI; I craft user experiences that feel fluid...",
  };

  return (
    <div className="w-full h-[200px] flex flex-col justify-center">
      <p className="text-[9px] font-mono text-[#8F8F8F] uppercase tracking-wide mb-1 select-none">Generated Letter</p>
      <div className="p-3 bg-white border border-[#EBEBEB] rounded-lg text-[11px] leading-relaxed text-[#4D4D4D] min-h-[95px] select-none">
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
  );
}

// 5. Job Match Score Matrix
interface JobMatchPlaygroundProps {
  company: "Vercel" | "Stripe" | "Linear";
}

function JobMatchPlayground({ company }: JobMatchPlaygroundProps) {
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

  return (
    <div className="w-full h-[200px] flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-1.5 shrink-0 select-none">
        <span className="text-[11px] font-bold text-[#171717]">{company} Fit Audit</span>
        <span
          className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: `${data[company].color}15`,
            color: data[company].color,
          }}
        >
          {data[company].status}
        </span>
      </div>

      <div className="flex items-center gap-6 flex-1 my-2">
        {/* Metric gauge circle */}
        <div className="relative w-18 h-18 flex-shrink-0 flex items-center justify-center">
          <svg width="72" height="72" viewBox="0 0 100 100" className="-rotate-90">
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
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="text-base font-bold text-[#171717]">{data[company].score}%</span>
            <span className="text-[7px] text-[#8F8F8F] uppercase tracking-wider font-semibold">Fit</span>
          </div>
        </div>

        {/* Required Keywords */}
        <div className="flex-1 flex flex-col justify-center">
          <p className="text-[9px] text-[#8F8F8F] font-semibold mb-1 select-none">Target Keyword Scans</p>
          <div className="flex flex-wrap gap-1">
            {data[company].keywords.map((kw) => (
              <span
                key={kw}
                className="text-[9px] font-medium font-mono px-1.5 py-0.5 rounded bg-white border border-[#EBEBEB] text-[#4D4D4D] select-none"
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
interface SuggestionsPlaygroundProps {
  filter: "All Issues" | "Experience" | "Skills";
}

function SuggestionsPlayground({ filter }: SuggestionsPlaygroundProps) {
  const [fixed1, setFixed1] = useState(false);
  const [fixed2, setFixed2] = useState(false);

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
    (item) => filter === "All Issues" || item.category === filter
  );

  return (
    <div className="w-full h-[200px] flex flex-col justify-between">
      <div className="flex-1 flex flex-col justify-center gap-2">
        {filteredItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between bg-white border border-[#EBEBEB] rounded-lg p-2.5 transition-all shadow-sm">
            <div className="flex items-center gap-2">
              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                item.fixed ? "bg-emerald-500 border-emerald-500 text-white" : "border-[#EBEBEB]"
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
            No issues found in this category
          </div>
        )}
      </div>

      <div className="mt-2 text-center border-t border-[#EBEBEB] pt-2 shrink-0 flex items-center justify-between select-none">
        <span className="text-[9px] text-[#8F8F8F]">
          {fixed1 && fixed2 ? "All problems resolved" : "Pending issues remaining"}
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
   FeaturesGrid (Interactive Workspace Layout)
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

  // Reset sub-option when main tab changes
  useEffect(() => {
    setActiveSubOption(0);
  }, [activeTab]);

  const features = [
    {
      id: 0,
      title: "ATS Scan Playground",
      description: "Scan your mock resume files directly. Test the parser performance, catch compliance alerts, and identify formatting bugs in real time.",
      icon: FileSearch,
      sidebarOptions: ["Resume.pdf", "Resume.docx", "Portfolio.pdf", "Draft.txt"],
      renderPlayground: (subOpt: number) => {
        const fileNames = ["Resume.pdf", "Resume.docx", "Portfolio.pdf", "Draft.txt"];
        return <ATSScanPlayground fileName={fileNames[subOpt]} />;
      },
      badge: "ATS Analyzer",
      bgClass: "bg-purple-50 border-purple-100 text-purple-600"
    },
    {
      id: 1,
      title: "AI Bullet Optimizer",
      description: "Transform weak description statements. Our engine converts generic points into metric-rich, action-oriented career achievements.",
      icon: Wand2,
      sidebarOptions: ["Frontend", "Backend", "Product", "Data", "DevOps"],
      renderPlayground: (subOpt: number) => {
        const roles = ["Frontend", "Backend", "Product", "Data", "DevOps"] as const;
        return <AIRewritePlayground roleType={roles[subOpt]} />;
      },
      badge: "AI Resume Writer",
      bgClass: "bg-purple-50 border-purple-100 text-purple-600"
    },
    {
      id: 2,
      title: "Template Customizer",
      description: "Toggle styles and colorways. Instantly test formatting layouts designed for recruiter readability.",
      icon: LayoutTemplate,
      sidebarOptions: ["Modern", "Executive", "Technical", "Creative", "Minimal"],
      renderPlayground: (subOpt: number) => {
        const templates = ["Modern", "Executive", "Technical", "Creative", "Minimal"] as const;
        return <TemplatesPlayground templateName={templates[subOpt]} />;
      },
      badge: "Resume Templates",
      bgClass: "bg-[#F2F2F2] border-transparent text-[#171717]"
    },
    {
      id: 3,
      title: "Tone Match Generator",
      description: "Adjust the copy slider. Generate custom introduction statements tailored to specific job vibes.",
      icon: FileText,
      sidebarOptions: ["Professional", "Bold", "Creative"],
      renderPlayground: (subOpt: number) => {
        const tones = ["Professional", "Bold", "Creative"] as const;
        return <CoverLetterPlayground tone={tones[subOpt]} />;
      },
      badge: "Cover Letter Generator",
      bgClass: "bg-[#F2F2F2] border-transparent text-[#171717]"
    },
    {
      id: 4,
      title: "Fit Matrix Simulator",
      description: "Compare job descriptions. Select targets to trigger real-time fit metrics and tech stack audits.",
      icon: Target,
      sidebarOptions: ["Vercel", "Stripe", "Linear"],
      renderPlayground: (subOpt: number) => {
        const companies = ["Vercel", "Stripe", "Linear"] as const;
        return <JobMatchPlayground company={companies[subOpt]} />;
      },
      badge: "Job Match Score",
      bgClass: "bg-emerald-50 border-emerald-100 text-emerald-600"
    },
    {
      id: 5,
      title: "Smart Suggestions Engine",
      description: "Identify sections that need immediate attention. Try clicking \"Fix\" to simulate applying automated recommendations.",
      icon: Lightbulb,
      sidebarOptions: ["All Issues", "Experience", "Skills"],
      renderPlayground: (subOpt: number) => {
        const filters = ["All Issues", "Experience", "Skills"] as const;
        return <SuggestionsPlayground filter={filters[subOpt]} />;
      },
      badge: "Smart Suggestions",
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

        {/* Split Interactive Workspace Layout (Autosend Style) */}
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
                    isActive ? "bg-white lg:bg-white" : "bg-transparent"
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
            {/* Background Mountain layer */}
            <img
              src="/hero-landscape.png"
              alt="Feature Background"
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            {/* Dark blur overlay to highlight mockup */}
            <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] pointer-events-none" />

            {/* Floating Mock Window Frame */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-[85%] max-w-[450px] bg-white/95 backdrop-blur-md border border-[#EBEBEB] rounded-xl shadow-2xl overflow-hidden flex flex-col h-[280px]"
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
              <div className="flex-1 flex overflow-hidden">
                {/* Internal Left Sidebar */}
                <div className="w-[100px] bg-[#FAFAFA] border-r border-[#EBEBEB] flex flex-col shrink-0 py-2 overflow-y-auto select-none">
                  {features[activeTab].sidebarOptions.map((opt, idx) => {
                    const isActive = activeSubOption === idx;
                    return (
                      <button
                        key={opt}
                        onClick={() => setActiveSubOption(idx)}
                        className={`text-left px-3.5 py-1.5 text-[11px] font-medium transition-all ${
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
                <div className="flex-1 bg-white/80 p-5 overflow-y-auto flex items-center justify-center">
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
