"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FileSearch,
  Wand2,
  LayoutTemplate,
  FileText,
  Target,
  Lightbulb,
  Check,
  RotateCcw
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
    { name: "alex_rivera_resume.pdf", score: 68, status: "Review Needed", missing: ["Next.js", "CI/CD", "Docker"], size: "142 KB", pages: "2", words: "1,482", atsReady: "✓ Yes" },
    { name: "marketing_draft.docx", score: 45, status: "Weak Match", missing: ["SEO", "Copywriting", "GA4"], size: "98 KB", pages: "1", words: "740", atsReady: "✗ No" },
    { name: "technical_cv_v2.pdf", score: 92, status: "Excellent Match", missing: [], size: "115 KB", pages: "2", words: "1,120", atsReady: "✓ Yes" }
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
    clearInterval(interval);
    setIsScanning(false);
    setScanned(true);
  };

  return (
    <div className="w-full h-full flex flex-col justify-center relative overflow-hidden select-none">
      {isScanning && (
        <motion.div
          className="absolute left-0 right-0 h-[2.5px] bg-[#7c3aed] shadow-[0_0_10px_#7c3aed] z-20"
          initial={{ top: "0%" }}
          animate={{ top: "100%" }}
          transition={{ duration: 1.4, ease: "linear" }}
        />
      )}

      {!scanned ? (
        <div className="flex flex-col items-center justify-center text-center py-1">
          {/* File Icon: purple, 36px */}
          <div className="w-12 h-12 rounded-lg bg-[#f3f0ff] flex items-center justify-center mb-3 shrink-0">
            <FileSearch className="w-9 h-9 text-[#7c3aed]" />
          </div>
          <p className="text-[13px] text-[#0f0f0f] font-semibold truncate max-w-full">{file.name}</p>
          <p className="text-[11px] text-[#9ca3af] mt-1">{file.size} · Ready to audit</p>

          {/* Stats Row */}
          <div className="flex gap-2 mt-4 w-full max-w-[320px] mx-auto shrink-0">
            <div className="flex-1 border border-[#e5e5e5] rounded-lg p-2.5 text-center bg-white">
              <div className="font-mono text-[9px] text-[#9ca3af]">PAGES</div>
              <div className="font-bold text-[18px] text-black mt-0.5">{file.pages}</div>
            </div>
            <div className="flex-1 border border-[#e5e5e5] rounded-lg p-2.5 text-center bg-white">
              <div className="font-mono text-[9px] text-[#9ca3af]">WORDS</div>
              <div className="font-bold text-[18px] text-black mt-0.5">{file.words}</div>
            </div>
            <div className="flex-1 border border-[#e5e5e5] rounded-lg p-2.5 text-center bg-white">
              <div className="font-mono text-[9px] text-[#9ca3af]">ATS READY</div>
              <div className={`font-bold mt-1 text-[13px] ${file.atsReady.includes("Yes") ? "text-[#059669]" : "text-rose-600"}`}>
                {file.atsReady}
              </div>
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={isScanning}
            className="mt-4 px-5 py-2 bg-[#0f0f0f] hover:bg-[#7c3aed] text-white rounded-lg text-[13px] font-semibold transition-all duration-200 cursor-pointer shrink-0"
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
          <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-2 shrink-0">
            <span className="text-xs font-bold text-[#0f0f0f]">Compliance Audit</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              file.score >= 85 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}>
              {file.score}% Match
            </span>
          </div>

          <div className="space-y-2 my-3 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className={file.score >= 85 ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                {file.score >= 85 ? "✓" : "⚠"}
              </span>
              <span className="text-[#6b7280] truncate max-w-full">
                {file.score >= 85 ? "Full keyword match" : `Missing: ${file.missing.join(", ")}`}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-emerald-500 font-bold">✓</span>
              <span className="text-[#6b7280]">Scannable structure & layout</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-emerald-500 font-bold">✓</span>
              <span className="text-[#6b7280]">PDF file-type compliance</span>
            </div>
          </div>

          <button
            onClick={() => setScanned(false)}
            className="self-center inline-flex items-center gap-1 px-3 py-1.5 border border-[#EBEBEB] hover:bg-[#F2F2F2] rounded-full text-[10px] font-semibold text-[#6b7280] transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3 h-3" /> Re-scan
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
      target: "Orchestrated a team of 6 engineers to deliver 4 high-traffic React apps, boosting page speed by 35%.",
      actionVerb: "Orchestrated"
    },
    {
      start: "Wrote backend APIs and managed database queries.",
      target: "Engineered REST APIs handling 20k req/sec, reducing p99 latency by 40%.",
      actionVerb: "Engineered"
    },
    {
      start: "Gathered customer requirements and wrote product specs.",
      target: "Launched 3 core feature verticals by aligning cross-functional teams, driving a 15% increase in user retention.",
      actionVerb: "Launched"
    },
    {
      start: "Analyzed company data and created SQL reports.",
      target: "Built ETL pipelines processing 50M+ rows daily, uncovering insights that saved $45K in annual infrastructure costs.",
      actionVerb: "Built"
    },
    {
      start: "Set up CI/CD pipelines and deployment processes.",
      target: "Automated AWS deployments via Terraform and GitHub Actions, reducing release cycle time from 3 days to 12 minutes.",
      actionVerb: "Automated"
    }
  ];

  const bullet = data[subOpt] || data[0];

  return (
    <div className="w-full h-full flex flex-col justify-start text-left overflow-y-auto select-none">
      {/* Before block */}
      <div className="mb-2 shrink-0">
        <div className="font-mono text-[9px] text-[#f43f5e] font-semibold mb-1.5 uppercase tracking-wider">BEFORE</div>
        <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-lg p-3 text-[12px] text-[#6b7280] leading-relaxed">
          {bullet.start}
        </div>
      </div>

      {/* Arrow down */}
      <div className="text-center text-[#9ca3af] my-1 text-[16px] leading-none shrink-0">
        ↓
      </div>

      {/* After block */}
      <div className="mb-3 shrink-0">
        <div className="font-mono text-[9px] text-emerald-600 font-semibold mb-1.5 uppercase tracking-wider">AFTER · AI OPTIMIZED</div>
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-3 text-[12px] text-[#0f0f0f] font-medium leading-relaxed">
          {bullet.target}
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-1 shrink-0">
        <div className="flex items-center gap-1.5 text-[11px] text-[#059669] font-medium">
          <span>✓</span>
          <span>Quantified achievement added</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#059669] font-medium">
          <span>✓</span>
          <span>Strong action verb ({bullet.actionVerb})</span>
        </div>
      </div>
    </div>
  );
}

// 3. Resume Template Designer Demo
interface TemplatesPlaygroundProps {
  activeIdx: number;
  onChange?: (val: number) => void;
}

function TemplatesPlayground({ activeIdx, onChange }: TemplatesPlaygroundProps) {
  const templates = [
    { id: 0, label: "Classic" },
    { id: 1, label: "Modern" },
    { id: 2, label: "Sidebar" },
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center select-none shrink-0">
      <div className="flex justify-center gap-3">
        {templates.map((tpl) => {
          const isActive = activeIdx % 3 === tpl.id;
          
          return (
            <div
              key={tpl.id}
              onClick={() => onChange && onChange(tpl.id)}
              className="flex flex-col items-center cursor-pointer"
            >
              {/* Thumbnail card */}
              <div
                className="relative bg-white overflow-hidden flex flex-col justify-between transition-all"
                style={{
                  width: "90px",
                  height: "120px",
                  borderRadius: "6px",
                  border: isActive ? "2px solid #7c3aed" : "1px solid #e5e5e5",
                  boxShadow: isActive ? "0 0 0 3px rgba(124,58,237,0.15)" : "none",
                }}
              >
                {/* Template Content */}
                {tpl.id === 0 && (
                  <div className="w-full h-full flex flex-col p-1.5 gap-2 text-left">
                    <div className="h-1.5 w-full bg-[#7c3aed] rounded-sm shrink-0" />
                    <div className="space-y-1 flex-1 mt-0.5">
                      <div className="h-1 bg-gray-200 w-2/3 rounded-sm" />
                      <div className="h-0.5 bg-gray-100 w-full rounded-sm" />
                      <div className="h-0.5 bg-gray-100 w-5/6 rounded-sm" />
                      <div className="h-0.5 bg-gray-100 w-4/5 rounded-sm" />
                    </div>
                  </div>
                )}

                {tpl.id === 1 && (
                  <div className="w-full h-full flex flex-col p-1.5 gap-2 text-left">
                    <div className="h-1.5 w-full bg-[#0f0f0f] rounded-sm shrink-0" />
                    <div className="space-y-1 flex-1 mt-0.5">
                      <div className="h-1 bg-gray-200 w-1/2 rounded-sm" />
                      <div className="h-0.5 bg-gray-100 w-full rounded-sm" />
                      <div className="h-0.5 bg-gray-100 w-full rounded-sm" />
                    </div>
                  </div>
                )}

                {tpl.id === 2 && (
                  <div className="w-full h-full flex gap-1 p-1 text-left">
                    <div className="w-5 bg-[#f3f0ff] rounded-sm shrink-0 flex flex-col items-center py-1 gap-1">
                      <div className="w-3 h-3 rounded-full bg-[#7c3aed]/20" />
                      <div className="w-3 h-0.5 bg-[#7c3aed]/30 rounded-sm" />
                    </div>
                    <div className="flex-1 space-y-1 mt-0.5">
                      <div className="h-1 bg-gray-200 w-2/3 rounded-sm" />
                      <div className="h-0.5 bg-gray-100 w-full rounded-sm" />
                      <div className="h-0.5 bg-gray-100 w-5/6 rounded-sm" />
                    </div>
                  </div>
                )}
              </div>

              {/* Label */}
              <span
                className="font-mono text-[9px] mt-2 transition-colors"
                style={{
                  color: isActive ? "#7c3aed" : "#9ca3af",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {tpl.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="text-[12px] text-[#6b7280] mt-3.5 font-medium shrink-0">
        12 ATS-optimized templates
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
      company: "Vercel",
      text: "Senior Frontend Engineer at Vercel: Experience with Next.js, React Server Components, and Web Vitals optimization.",
      match: 87,
      chips: ["+ Add: System Design", "+ Add: Web Vitals"]
    },
    {
      company: "Stripe",
      text: "Backend Lead at Stripe: Build robust financial pipelines, APIs, and microservices using Ruby and Go.",
      match: 75,
      chips: ["+ Add: PostgreSQL", "+ Add: Ruby on Rails"]
    },
    {
      company: "Linear",
      text: "Product Engineer at Linear: Build fast, local-first web applications using React, WebSockets, and SQLite.",
      match: 90,
      chips: ["+ Add: SQLite", "+ Add: WebSockets"]
    }
  ];

  const job = jobs[subOpt] || jobs[0];

  return (
    <div className="w-full h-full flex flex-col justify-start text-left overflow-y-auto select-none">
      <div className="mb-3 shrink-0">
        <div className="font-mono text-[9px] text-gray-400 font-semibold mb-2 uppercase tracking-wider">JOB DESCRIPTION</div>
        <div className="bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg p-3 text-[12px] text-[#374151] h-[80px] overflow-hidden leading-relaxed">
          {job.text}
        </div>
      </div>

      <div className="mb-3 shrink-0">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[12px] text-[#6b7280] font-medium">Resume Match</span>
          <span className="font-bold text-[#7c3aed] text-[14px]">{job.match}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden">
          <div className="h-full bg-[#7c3aed] rounded-full" style={{ width: `${job.match}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-1 shrink-0">
        {job.chips.map((chip) => (
          <span
            key={chip}
            className="bg-[#faf5ff] border border-[#e9d5ff] text-[#7c3aed] rounded-full px-3 py-1 text-[11px] font-medium"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

// 5. Match Resume To Job Description Demo
interface MatchResumeDemoProps {
  subOpt: number;
}

function MatchResumeDemo({ subOpt }: MatchResumeDemoProps) {
  const jobs = [
    {
      company: "Vercel",
      text: "Senior Frontend Engineer at Vercel: Experience with Next.js, React Server Components, and Web Vitals optimization.",
      match: 92,
      chips: ["+ Add: System Design", "+ Add: Web Vitals"]
    },
    {
      company: "Stripe",
      text: "Backend Lead at Stripe: Build robust financial pipelines, APIs, and microservices using Ruby and Go.",
      match: 92,
      chips: ["+ Add: PostgreSQL", "+ Add: Ruby on Rails"]
    },
    {
      company: "Linear",
      text: "Product Engineer at Linear: Build fast, local-first web applications using React, WebSockets, and SQLite.",
      match: 92,
      chips: ["+ Add: SQLite", "+ Add: WebSockets"]
    }
  ];

  const job = jobs[subOpt] || jobs[0];

  return (
    <div className="w-full h-full flex flex-col justify-start text-left overflow-y-auto select-none">
      <div className="mb-3 shrink-0">
        <div className="font-mono text-[9px] text-gray-400 font-semibold mb-2 uppercase tracking-wider">JOB DESCRIPTION</div>
        <div className="bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg p-3 text-[12px] text-[#374151] h-[80px] overflow-hidden leading-relaxed">
          {job.text}
        </div>
      </div>

      <div className="mb-3 shrink-0">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[12px] text-[#6b7280] font-medium">Resume Match</span>
          <span className="font-bold text-[#059669] text-[14px]">{job.match}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden">
          <div className="h-full bg-[#059669] rounded-full" style={{ width: `${job.match}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-1 shrink-0">
        {job.chips.map((chip) => (
          <span
            key={chip}
            className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#059669] rounded-full px-3 py-1 text-[11px] font-medium"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

// 6. AI Resume Suggestions Demo
interface SuggestionsDemoProps {
  filterType: number;
}

function SuggestionsDemo({ filterType }: SuggestionsDemoProps) {
  return (
    <div className="w-full h-full flex flex-col justify-start text-left overflow-y-auto select-none">
      {/* Card 1 */}
      {(filterType === 0 || filterType === 1) && (
        <div
          className="bg-[#faf9ff] p-[10px_14px] mb-2 shrink-0"
          style={{
            borderLeft: "3px solid #7c3aed",
            borderRadius: "0 8px 8px 0",
          }}
        >
          <div className="text-[12px] font-bold text-[#0f0f0f]">💡 Add metrics to bullet #3</div>
          <div className="text-[11px] text-[#6b7280] mt-0.5">Quantify your impact: &apos;...reducing load time by 40%&apos;</div>
        </div>
      )}

      {/* Card 2 */}
      {(filterType === 0 || filterType === 2) && (
        <div
          className="bg-[#faf9ff] p-[10px_14px] mb-2 shrink-0"
          style={{
            borderLeft: "3px solid #7c3aed",
            borderRadius: "0 8px 8px 0",
          }}
        >
          <div className="text-[12px] font-bold text-[#0f0f0f]">⚡ Missing keyword: TypeScript</div>
          <div className="text-[11px] text-[#6b7280] mt-0.5">Add TypeScript to skills section for this role</div>
        </div>
      )}

      {/* Card 3 */}
      {filterType === 0 && (
        <div
          className="bg-[#faf9ff] p-[10px_14px] mb-2 shrink-0"
          style={{
            borderLeft: "3px solid #059669",
            borderRadius: "0 8px 8px 0",
          }}
        >
          <div className="text-[12px] font-bold text-[#059669]">✓ Strong action verbs detected</div>
          <div className="text-[11px] text-[#6b7280] mt-0.5">14 of 15 bullets start with action verbs</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   FeaturesGrid (Capabilities Redesign Section)
   ═══════════════════════════════════════════════ */

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
      renderPlayground: (subOpt: number, setSubOpt?: (val: number) => void) => <ATSScanDemo subOpt={subOpt} />,
      badge: "ATS SCANNER"
    },
    {
      id: 1,
      title: "Improve Resume Bullet Points",
      description: "Rewrite plain duties into high-impact, metrics-driven bullet achievements.",
      icon: Wand2,
      sidebarOptions: ["Frontend", "Backend", "Product", "Data", "DevOps"],
      renderPlayground: (subOpt: number, setSubOpt?: (val: number) => void) => <ImproveBulletsDemo subOpt={subOpt} />,
      badge: "BULLET OPTIMIZER"
    },
    {
      id: 2,
      title: "Resume Template Designer",
      description: "Instantly toggle between professional layouts built for recruiter readability.",
      icon: LayoutTemplate,
      sidebarOptions: ["Modern", "Executive", "Technical", "Creative", "Minimal"],
      renderPlayground: (subOpt: number, setSubOpt?: (val: number) => void) => (
        <TemplatesPlayground activeIdx={subOpt} onChange={setSubOpt} />
      ),
      badge: "TEMPLATE DESIGNER"
    },
    {
      id: 3,
      title: "Tailor Resume For Any Job",
      description: "Generate customized resume summaries and cover letters for specific job posts.",
      icon: FileText,
      sidebarOptions: ["Vercel", "Stripe", "Linear"],
      renderPlayground: (subOpt: number, setSubOpt?: (val: number) => void) => <TailorResumeDemo subOpt={subOpt} />,
      badge: "ROLE ADAPTOR"
    },
    {
      id: 4,
      title: "Match Resume To Job Description",
      description: "Get a comprehensive compatibility score and skill gap analysis for any tech role.",
      icon: Target,
      sidebarOptions: ["Vercel", "Stripe", "Linear"],
      renderPlayground: (subOpt: number, setSubOpt?: (val: number) => void) => <MatchResumeDemo subOpt={subOpt} />,
      badge: "JOB MATCH MATRIX"
    },
    {
      id: 5,
      title: "AI Resume Suggestions",
      description: "Receive real-time, actionable resume fixes with one-click automated updates.",
      icon: Lightbulb,
      sidebarOptions: ["All Issues", "Experience", "Skills"],
      renderPlayground: (subOpt: number, setSubOpt?: (val: number) => void) => <SuggestionsDemo filterType={subOpt} />,
      badge: "SUGGESTIONS FEED"
    }
  ];

  return (
    <section id="features" className="w-full bg-[#fafaf9] relative overflow-hidden select-none">
      <div className="max-w-[1200px] mx-auto border-x border-[#e7e5e4] bg-white">
        
        {/* Header Block (Full-width inside section, matching AutoSend) */}
        <div className="px-6 md:px-10 py-16 text-left">
          <span className="font-mono text-[14px] text-rose-500 font-semibold uppercase leading-4 block mb-3 select-none">
            #01 — Capabilities
          </span>
          <h2 className="text-[#1c1917] font-bold leading-[1.15] text-2xl md:text-[clamp(28px,3vw,40px)] tracking-tight max-w-[640px]">
            Everything you need to land interviews
          </h2>
          <p className="text-sm md:text-base text-stone-500 mt-3 max-w-[560px] leading-relaxed">
            A dynamic workspace designed to transform your resume into a job winning application powered by AI and validated for ATS.
          </p>
        </div>

        {/* Two-Column Integrated Block with split layout */}
        <div className="border-t border-[#e7e5e4] grid grid-cols-1 lg:grid-cols-[40%_60%] items-stretch">
          
          {/* Left Column (40% width) - Stacked divided tabs list */}
          <div className="flex flex-col bg-[#fafaf9] divide-y divide-[#e7e5e4] border-b lg:border-b-0 lg:border-r border-[#e7e5e4]">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const isActive = activeTab === idx;
              return (
                <div
                  key={feature.id}
                  onClick={() => setActiveTab(idx)}
                  className={`cursor-pointer flex items-start gap-4 p-5 md:p-6 transition-all select-none relative ${
                    isActive ? "bg-white" : "bg-[#fafaf9] hover:bg-[#f5f5f4]"
                  }`}
                >
                  {/* Animated progress bar on active tab (AutoSend pattern) */}
                  <div className="absolute left-0 inset-y-0 w-[3px] overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 w-full"
                      style={{
                        background: isActive
                          ? "linear-gradient(to bottom, #7c3aed 0%, #a78bfa 100%)"
                          : "transparent",
                      }}
                      initial={false}
                      animate={{
                        y: isActive ? "0%" : "100%",
                      }}
                      transition={{
                        duration: isActive ? 5 : 0.2,
                        ease: "linear",
                      }}
                    />
                  </div>
                  <div 
                    className="shrink-0 mt-0.5 transition-colors"
                    style={{
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isActive ? '#7c3aed' : '#78716c'
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span 
                      className="text-sm font-semibold tracking-tight"
                      style={{ color: isActive ? "#1c1917" : "#44403c" }}
                    >
                      {feature.title}
                    </span>
                    <p 
                      className="text-xs mt-1 leading-normal"
                      style={{ color: isActive ? "#57534e" : "#78716c" }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column (60% width) - Centered Browser Chrome Mockup with Landscape Background */}
          <div className="relative flex items-center justify-center p-5 md:p-6 w-full h-full min-h-[400px] lg:min-h-[460px] overflow-hidden">
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

            {/* Mockup Window Frame (Glassmorphic) */}
            <div 
              className="relative z-10 w-full max-w-[580px] h-[360px] overflow-hidden flex flex-col border border-white/10"
              style={{
                background: "rgba(255,255,255,0.96)",
                borderRadius: "12px",
                boxShadow: "0 8px 40px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.15)",
                margin: "24px 20px",
              }}
            >
              
              {/* Top Bar */}
              <div className="h-11 bg-[#f0eff0] border-b border-[#e5e5e5] flex items-center px-4 gap-3 select-none shrink-0">
                {/* Window control dots */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                </div>
                {/* Center Panel Label */}
                <div className="flex-1 text-center md:text-left">
                  <span className="font-mono text-[11px] tracking-widest text-gray-400 font-semibold uppercase">
                    {features[activeTab].badge}
                  </span>
                </div>
              </div>

              {/* Split content area */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar inside browser frame - Hidden on mobile (<768px) */}
                <div 
                  className="hidden md:flex bg-[#fafafa] border-r border-[#eeeeee] flex-col shrink-0 py-2 select-none"
                  style={{
                    width: activeTab === 0 ? "35%" : "120px"
                  }}
                >
                  {features[activeTab].sidebarOptions.map((opt, idx) => {
                    const isActive = activeSubOption === idx;
                    let displayLabel = opt;
                    if (activeTab === 0) {
                      displayLabel = opt.length > 15 ? opt.substring(0, 12) + "..." : opt;
                    } else if (opt === "marketing_draft.docx") {
                      displayLabel = "marketing_draft.do...";
                    }
                    return (
                      <button
                        key={opt}
                        onClick={() => setActiveSubOption(idx)}
                        className={`text-left transition-all truncate border-l-2 cursor-pointer`}
                        style={{
                          padding: activeTab === 0 ? "10px 14px" : "8px 14px",
                          fontSize: "12px",
                          fontFamily: "monospace",
                          borderLeftWidth: activeTab === 0 ? "0px" : "2px",
                          backgroundColor: activeTab === 0 && isActive ? "#f3f0ff" : (isActive && activeTab !== 0 ? "#ffffff" : "transparent"),
                          color: isActive ? "#7c3aed" : "#9ca3af",
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {displayLabel}
                      </button>
                    );
                  })}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-white p-5 overflow-y-auto flex flex-col justify-center">
                  
                  {/* Mobile Sub-Options Selector (Visible only on <768px) */}
                  <div className="flex md:hidden gap-1.5 overflow-x-auto pb-3 mb-3 select-none scrollbar-none shrink-0 border-b border-[#eeeeee] w-full">
                    {features[activeTab].sidebarOptions.map((opt, idx) => {
                      const isActive = activeSubOption === idx;
                      const displayLabel = opt === "marketing_draft.docx" ? "marketing_draft.do..." : opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => setActiveSubOption(idx)}
                          className={`px-3 py-1 text-[10px] font-semibold rounded-full border transition-all cursor-pointer whitespace-nowrap ${
                            isActive 
                              ? "bg-[#f3f0ff] border-[#c084fc] text-[#7c3aed]" 
                              : "bg-white border-[#EBEBEB] text-gray-400 hover:text-gray-600"
                          }`}
                        >
                          {displayLabel}
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25 }}
                      className="w-full h-full"
                    >
                      {features[activeTab].renderPlayground(activeSubOption, setActiveSubOption)}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom CTA Row (inside bordered block, matching AutoSend pattern) */}
        <div
          className="flex justify-center border-t border-[#e7e5e4] py-4 bg-[#fafaf9]"
        >
          <Link
            href="#"
            className="font-mono text-[11px] tracking-[0.15em] text-[#7c3aed] font-semibold hover:text-[#6d28d9] transition-colors"
          >
            EXPLORE ALL FEATURES →
          </Link>
        </div>
      </div>
    </section>
  );
}
