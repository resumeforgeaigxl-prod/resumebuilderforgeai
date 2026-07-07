"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Terminal, 
  Mic, 
  BookOpen, 
  Briefcase, 
  Cpu 
} from "lucide-react";

interface AgentItem {
  id: string;
  name: string;
  sub: string;
  badge: string;
  tagline: string;
  desc: string;
  color: string;
  renderPlayground: () => React.ReactNode;
}

const agents: AgentItem[] = [
  {
    id: "resume",
    name: "Resume Agent",
    sub: "Document Synth",
    badge: "Resume Agent",
    tagline: "AI-driven real-time resume compilation & structure audits.",
    desc: "Instantly compiles developer experience and audits structural compliance against target roles to maximize ATS readiness.",
    color: "#3b82f6",
    renderPlayground: () => (
      <div className="flex flex-col h-full justify-between">
        <div className="border border-[#e7e5e4] rounded-xl p-4 bg-white space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-stone-400">RESUME_BUILDER_AGENT</span>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[10px]">ACTIVE</span>
          </div>
          <div className="space-y-1.5">
            <div className="text-[11px] text-stone-500 font-mono">▸ Initializing document synthesis...</div>
            <div className="text-[11px] text-stone-500 font-mono">▸ Injecting ATS schema descriptors...</div>
            <div className="text-[11px] text-emerald-600 font-mono">✓ Successfully optimized experience section (+24% score)</div>
          </div>
        </div>
        <div className="flex gap-2.5 mt-4">
          <div className="flex-1 border border-[#e7e5e4] rounded-lg p-3 text-center bg-white">
            <div className="text-[9px] font-mono text-stone-400">PDF COMPLIANCE</div>
            <div className="font-bold text-base text-stone-900 mt-0.5">100%</div>
          </div>
          <div className="flex-1 border border-[#e7e5e4] rounded-lg p-3 text-center bg-white">
            <div className="text-[9px] font-mono text-stone-400">ATS MATCH SCORE</div>
            <div className="font-bold text-base text-emerald-600 mt-0.5">96/100</div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "coding",
    name: "Coding Agent",
    sub: "Code & Compiler",
    badge: "Coding Agent",
    tagline: "Execution compilation sandboxes & real-time tutorial audits.",
    desc: "Watches code submissions, identifies syntax bugs, compiles target runs, and provides interactive line-by-line coding corrections.",
    color: "#10b981",
    renderPlayground: () => (
      <div className="flex flex-col h-full justify-between font-mono text-[10.5px]">
        <div className="border border-[#e7e5e4] rounded-xl p-3 bg-stone-950 text-stone-300 space-y-1.5 overflow-hidden flex-1 select-none">
          <div className="text-stone-500 border-b border-stone-800 pb-1.5 mb-1.5 flex justify-between">
            <span>coding_sandbox.go</span>
            <span className="text-emerald-500 font-bold">RUNNING</span>
          </div>
          <div><span className="text-purple-400">func</span> <span className="text-blue-400">binarySearch</span>(arr []<span className="text-green-400">int</span>, target <span className="text-green-400">int</span>) <span className="text-green-400">int</span> &#123;</div>
          <div className="pl-3 text-stone-400">// Debugger output:</div>
          <div className="pl-3 text-emerald-400">✓ Array sorted in 0.04ms</div>
          <div className="pl-3 text-amber-500">⚠ Warning: potential integer overflow at mid calculation</div>
          <div className="pl-3 text-stone-300">✓ Corrected mid logic to: low + (high-low)/2</div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs font-sans">
          <span className="text-stone-500 font-semibold">Test cases passed:</span>
          <span className="font-bold text-stone-900">12 / 12</span>
        </div>
      </div>
    )
  },
  {
    id: "interview",
    name: "Interview Agent",
    sub: "Speech & Audio",
    badge: "Interview Agent",
    tagline: "Multimodal speech evaluation & real-time audio transcriptions.",
    desc: "Analyzes conversational response audio, extracts transcription indices, evaluates vocabulary confidence, and gives real-time rating assessments.",
    color: "#ec4899",
    renderPlayground: () => (
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-center gap-3 border border-[#e7e5e4] rounded-xl p-3 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
            <Mic className="w-4 h-4 text-pink-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono text-stone-400">SPEECH WAVEFORM</div>
            <div className="flex gap-0.5 items-center h-4 mt-1">
              {[1, 3, 2, 4, 3, 5, 2, 6, 4, 2, 3, 5, 3, 1, 2].map((h, i) => (
                <div key={i} className="bg-pink-500 w-1 rounded-full transition-all" style={{ height: `${h * 15}%` }} />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2 mt-3 text-xs">
          <div className="flex justify-between">
            <span className="text-stone-500">Vocabulary richness:</span>
            <span className="font-bold text-stone-900">High</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Pronunciation accuracy:</span>
            <span className="font-bold text-stone-900">94%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Confidence index:</span>
            <span className="font-bold text-emerald-600">Excellent</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "knowledge",
    name: "Knowledge Agent",
    sub: "RAG Curriculum",
    badge: "Knowledge Agent",
    tagline: "Dynamic study curriculum & conceptual RAG query indices.",
    desc: "Indexes reference documents, matches concept levels, and populates step-by-step roadmap syllabuses for any technical gap.",
    color: "#f59e0b",
    renderPlayground: () => (
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-2">
          <div className="text-[10px] font-mono font-semibold text-stone-400 uppercase tracking-wider">RECOMMENDED SYLLABUS</div>
          {[
            { title: "Database Indexing Foundations", desc: "B-Trees & Hash Indexing models", done: true },
            { title: "Query Performance Tuning", desc: "Explain Analyze execution plans", done: true },
            { title: "Connection Pooling", desc: "PgBouncer & sizing metrics", done: false }
          ].map((item, i) => (
            <div key={i} className="flex gap-2.5 items-start p-2 border border-[#e7e5e4] rounded-lg bg-white shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
              <span className={`text-xs ${item.done ? "text-emerald-500 font-bold" : "text-amber-500"}`}>
                {item.done ? "✓" : "○"}
              </span>
              <div>
                <div className="text-[11px] font-bold text-stone-900 leading-tight">{item.title}</div>
                <div className="text-[9.5px] text-stone-500 mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: "job",
    name: "Job Agent",
    sub: "ATS & Matching",
    badge: "Job Agent",
    tagline: "Real-time market analytics & target position match recommendations.",
    desc: "Scrapes technical job openings, cross-references candidate experience proficiency, and scores job alignment indices automatically.",
    color: "#8b5cf6",
    renderPlayground: () => (
      <div className="flex flex-col h-full justify-between">
        <div className="space-y-2">
          {[
            { company: "Vercel", role: "Frontend Developer", score: 92 },
            { company: "Stripe", role: "Full Stack Engineer", score: 78 }
          ].map((job, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 border border-[#e7e5e4] rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
              <div>
                <div className="text-[11px] font-bold text-stone-900">{job.role}</div>
                <div className="text-[9.5px] text-stone-500 mt-0.5">{job.company}</div>
              </div>
              <div className={`text-[11px] font-mono font-black ${job.score >= 85 ? "text-emerald-600" : "text-amber-600"}`}>
                {job.score}% Match
              </div>
            </div>
          ))}
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-2.5 text-[10px] text-purple-700 font-medium flex gap-1.5 mt-3">
          <span>ℹ</span>
          <span>2 positions are highly competitive based on your current resume score.</span>
        </div>
      </div>
    )
  }
];

export default function MentorForgeSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [mobileActiveView, setMobileActiveView] = useState<'capabilities' | 'console'>('capabilities');
  const current = agents[activeTab];

  // 3D Interactive Parallax States
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;
    
    setMouseX(xPx);
    setMouseY(yPx);
    
    const x = xPx / rect.width - 0.5;
    const y = yPx / rect.height - 0.5;
    const maxRotate = 6;
    setRotateX(-y * maxRotate);
    setRotateY(x * maxRotate);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <section id="mentorforge" className="w-full bg-[#fafaf9] relative overflow-hidden select-none">
      <div className="max-w-[1200px] mx-auto border-x border-[#e7e5e4] bg-white">
        
        {/* Header Block (Full-width inside section, matching FeaturesGrid and ATSDashboard) */}
        <div className="px-6 md:px-10 py-16 text-left">
          <span className="font-mono text-[14px] text-rose-500 font-semibold uppercase leading-4 block mb-3 select-none">
            #05 — MentorForge AI
          </span>
          <h2
            className="text-[#1c1917] font-bold leading-[1.15] text-2xl md:text-[clamp(28px,3vw,40px)] tracking-tight max-w-[640px]"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
            }}
          >
            The Central Brain. A system-wide cognitive mesh.
          </h2>
          <p className="text-sm md:text-base text-stone-500 mt-3 max-w-[560px] leading-relaxed">
            Rather than isolated assistants, ResumeForgeAI runs a unified Master-Subagent orchestrator. 
            It binds all educational paths, coding submissions, mock tests, and job matching databases in a self-improving loop.
          </p>
        </div>

        {/* Mockup Window Container with Landscape Background (FeaturesGrid/ATSDashboard Style) */}
        <div className="px-6 md:px-10 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease }}
            className="relative flex items-center justify-center p-3 sm:p-6 md:p-10 w-full overflow-hidden rounded-2xl"
          >
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

            {/* Mockup Window Frame (Glassmorphic 3D Parallax Card) */}
            <div 
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="relative z-10 w-full max-w-[1040px] overflow-hidden flex flex-col border border-white/10"
              style={{
                background: "rgba(255,255,255,0.96)",
                borderRadius: "16px",
                transformStyle: "preserve-3d",
                transform: isHovered 
                  ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)` 
                  : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
                transition: isHovered 
                  ? 'transform 0.1s ease-out, box-shadow 0.1s ease-out' 
                  : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isHovered 
                  ? "0 35px 70px rgba(0,0,0,0.28), 0 12px 24px rgba(0,0,0,0.16)" 
                  : "0 8px 40px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              {/* Radial gradient shine matching the mouse coordinates */}
              <div 
                className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
                style={{
                  background: isHovered 
                    ? `radial-gradient(500px circle at ${mouseX}px ${mouseY}px, rgba(59, 130, 246, 0.12), rgba(168, 85, 247, 0.04), transparent 60%)` 
                    : 'none',
                  mixBlendMode: 'screen',
                }}
              />

              {/* Chrome Top Bar */}
              <div 
                className="h-11 bg-[#FAFAFA] border-b border-[#e7e5e4] px-5 flex items-center justify-between select-none shrink-0"
                style={{ transform: "translateZ(8px)" }}
              >
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#8F8F8F]" />
                  <span className="text-[11px] font-mono text-[#8F8F8F]">Agentic Workspace — {current.badge}</span>
                </div>
                <div className="w-[60px]" />
              </div>

              {/* Mobile/Tablet Horizontal Agent Selector */}
              <div className="lg:hidden p-3 bg-[#fafaf9] border-b border-[#e7e5e4] overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex gap-2 w-full shrink-0 select-none">
                {agents.map((agent, idx) => {
                  const isActive = activeTab === idx;
                  return (
                    <button
                      key={agent.id}
                      onClick={() => setActiveTab(idx)}
                      className={`flex-none px-3.5 py-2 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer text-xs font-semibold ${
                        isActive
                          ? "bg-white border-[#e7e5e4] shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-[#1c1917]"
                          : "bg-transparent border-transparent text-[#78716c] hover:bg-[#e7e5e4]/30 hover:text-[#1c1917]"
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-md border flex items-center justify-center bg-white transition-all shrink-0"
                        style={{
                          borderColor: isActive ? agent.color : "#e7e5e4",
                          backgroundColor: isActive ? `${agent.color}0a` : "transparent"
                        }}
                      >
                        {agent.id === "resume" && <FileText className="w-3 h-3" style={{ color: isActive ? agent.color : "#a8a29e" }} />}
                        {agent.id === "coding" && <Terminal className="w-3 h-3" style={{ color: isActive ? agent.color : "#a8a29e" }} />}
                        {agent.id === "interview" && <Mic className="w-3 h-3" style={{ color: isActive ? agent.color : "#a8a29e" }} />}
                        {agent.id === "knowledge" && <BookOpen className="w-3 h-3" style={{ color: isActive ? agent.color : "#a8a29e" }} />}
                        {agent.id === "job" && <Briefcase className="w-3 h-3" style={{ color: isActive ? agent.color : "#a8a29e" }} />}
                      </div>
                      <span className="truncate">{agent.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mobile Sub-Tab Toggle (Capabilities vs Console) */}
              <div className="lg:hidden flex border-b border-[#e7e5e4] bg-[#fafaf9] p-1.5 gap-1 shrink-0">
                <button
                  onClick={() => setMobileActiveView('capabilities')}
                  className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mobileActiveView === 'capabilities'
                      ? "bg-white border border-[#e7e5e4] text-[#1c1917] shadow-sm"
                      : "text-[#78716c] hover:text-[#1c1917]"
                  }`}
                >
                  Capabilities
                </button>
                <button
                  onClick={() => setMobileActiveView('console')}
                  className={`flex-1 py-2 text-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mobileActiveView === 'console'
                      ? "bg-white border border-[#e7e5e4] text-[#1c1917] shadow-sm"
                      : "text-[#78716c] hover:text-[#1c1917]"
                  }`}
                >
                  Live Console
                </button>
              </div>

              {/* Split inside browser frame - 3 Columns */}
              <div 
                className="grid grid-cols-1 lg:grid-cols-[240px_1fr_1.1fr] divide-y lg:divide-y-0 lg:divide-x divide-[#e7e5e4] bg-white flex-1 overflow-hidden"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* COL 1: Subagents list (styled exactly like ATSDashboard targets selector) */}
                <div 
                  className="hidden lg:block p-4 bg-[#fafaf9]"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div style={{ transform: "translateZ(12px)" }} className="space-y-1.5">
                    <p className="text-[9px] font-mono font-semibold text-[#78716c] uppercase tracking-wider px-2.5 mb-2">
                      Agentic Orchestrator
                    </p>
                    {agents.map((agent, idx) => {
                      const isActive = activeTab === idx;
                      return (
                        <button
                          key={agent.id}
                          onClick={() => setActiveTab(idx)}
                          className={`w-full text-left p-2.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                            isActive
                              ? "bg-white border-[#e7e5e4] shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-[#1c1917]"
                              : "bg-transparent border-transparent text-[#78716c] hover:bg-[#e7e5e4]/30 hover:text-[#1c1917]"
                          }`}
                        >
                          <div
                            className="w-8 h-8 rounded-lg border flex items-center justify-center bg-white transition-all shrink-0"
                            style={{
                              borderColor: isActive ? agent.color : "#e7e5e4",
                              backgroundColor: isActive ? `${agent.color}0a` : "transparent"
                            }}
                          >
                            {agent.id === "resume" && <FileText className="w-3.5 h-3.5" style={{ color: isActive ? agent.color : "#a8a29e" }} />}
                            {agent.id === "coding" && <Terminal className="w-3.5 h-3.5" style={{ color: isActive ? agent.color : "#a8a29e" }} />}
                            {agent.id === "interview" && <Mic className="w-3.5 h-3.5" style={{ color: isActive ? agent.color : "#a8a29e" }} />}
                            {agent.id === "knowledge" && <BookOpen className="w-3.5 h-3.5" style={{ color: isActive ? agent.color : "#a8a29e" }} />}
                            {agent.id === "job" && <Briefcase className="w-3.5 h-3.5" style={{ color: isActive ? agent.color : "#a8a29e" }} />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-[11px] font-bold leading-tight truncate">
                              {agent.name}
                            </h4>
                            <p className="text-[9.5px] text-[#78716c] mt-0.5 font-mono">
                              {agent.sub}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* COL 2: Agent Info */}
                <div 
                  className={`p-6 flex flex-col justify-between min-h-[240px] bg-white lg:flex ${mobileActiveView === 'capabilities' ? 'flex' : 'hidden'}`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div style={{ transform: "translateZ(20px)" }}>
                    <span 
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium border font-mono"
                      style={{ 
                        borderColor: `${current.color}30`, 
                        backgroundColor: `${current.color}0a`,
                        color: current.color 
                      }}
                    >
                      {current.badge}
                    </span>
                    <h3 className="text-[14px] font-bold text-stone-900 mt-4 leading-snug">{current.tagline}</h3>
                    <p className="text-xs text-stone-500 mt-3 leading-relaxed">{current.desc}</p>
                  </div>
                  
                  <div 
                    className="pt-4 border-t border-stone-100 mt-6 flex items-center justify-between text-[10px] font-mono text-stone-400"
                    style={{ transform: "translateZ(12px)" }}
                  >
                    <span>STATUS: ACTIVE</span>
                    <span style={{ color: current.color }}>SYNCED TO BRAIN ✓</span>
                  </div>
                </div>

                {/* COL 3: Playground simulation */}
                <div 
                  className={`p-6 bg-[#fafaf9] flex flex-col justify-center min-h-[240px] lg:flex ${mobileActiveView === 'console' ? 'flex' : 'hidden'}`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25 }}
                      className="w-full h-full"
                      style={{ transform: "translateZ(24px)" }}
                    >
                      {current.renderPlayground()}
                    </motion.div>
                  </AnimatePresence>
                </div>

              </div>

            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
