"use client";

import { useState } from "react";
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
          <div className="pl-3 text-stone-550">// Debugger output:</div>
          <div className="pl-3 text-emerald-400">✓ Array sorted in 0.04ms</div>
          <div className="pl-3 text-amber-450">⚠ Warning: potential integer overflow at mid calculation</div>
          <div className="pl-3 text-stone-350">✓ Corrected mid logic to: low + (high-low)/2</div>
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
          <div className="text-[10px] font-mono font-semibold text-stone-450 uppercase tracking-wider">RECOMMENDED SYLLABUS</div>
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
  const current = agents[activeTab];

  return (
    <section id="mentorforge" className="w-full bg-[#fafaf9] relative overflow-hidden select-none">
      <div className="max-w-[1200px] mx-auto border-x border-[#e7e5e4] bg-white">
        
        {/* Header Block (Full-width, left-aligned, matching FeaturesGrid) */}
        <div className="px-6 md:px-10 py-16 text-left border-b border-[#e7e5e4]">
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

        {/* Content Layout matching the split grid style of FeaturesGrid */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] divide-y lg:divide-y-0 lg:divide-x divide-[#e7e5e4]">
          
          {/* LEFT: Sidebar tabs selector */}
          <div className="p-5 bg-[#fafaf9] space-y-2">
            <p className="text-[9.5px] font-mono font-semibold text-[#78716c] uppercase tracking-wider px-2.5 mb-2">
              Agentic Orchestrator
            </p>
            {agents.map((agent, idx) => (
              <button
                key={agent.id}
                onClick={() => setActiveTab(idx)}
                className={`w-full text-left p-3 rounded-xl border flex items-center gap-3.5 transition-all cursor-pointer ${
                  activeTab === idx
                    ? "bg-white border-[#e7e5e4] shadow-[0_2px_8px_rgba(0,0,0,0.02)] text-[#1c1917]"
                    : "bg-transparent border-transparent text-[#78716c] hover:bg-[#e7e5e4]/30 hover:text-[#1c1917]"
                }`}
              >
                <div
                  className="w-9 h-9 rounded-lg border flex items-center justify-center bg-white transition-all shrink-0"
                  style={{
                    borderColor: activeTab === idx ? agent.color : "#e7e5e4",
                    backgroundColor: activeTab === idx ? `${agent.color}0a` : "transparent"
                  }}
                >
                  {agent.id === "resume" && <FileText className="w-4.5 h-4.5" style={{ color: activeTab === idx ? agent.color : "#a8a29e" }} />}
                  {agent.id === "coding" && <Terminal className="w-4.5 h-4.5" style={{ color: activeTab === idx ? agent.color : "#a8a29e" }} />}
                  {agent.id === "interview" && <Mic className="w-4.5 h-4.5" style={{ color: activeTab === idx ? agent.color : "#a8a29e" }} />}
                  {agent.id === "knowledge" && <BookOpen className="w-4.5 h-4.5" style={{ color: activeTab === idx ? agent.color : "#a8a29e" }} />}
                  {agent.id === "job" && <Briefcase className="w-4.5 h-4.5" style={{ color: activeTab === idx ? agent.color : "#a8a29e" }} />}
                </div>
                <div className="min-w-0">
                  <h4 className="text-[12px] font-bold leading-tight truncate">
                    {agent.name}
                  </h4>
                  <p className="text-[9.5px] text-[#78716c] mt-0.5 font-mono">
                    {agent.sub}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* RIGHT: Chrome browser mockup and agent console */}
          <div className="p-6 md:p-10 bg-white flex flex-col justify-center min-h-[420px]">
            
            {/* Chrome Frame */}
            <div 
              className="w-full overflow-hidden flex flex-col border border-[#e5e5e5]"
              style={{
                background: "rgba(255,255,255,1)",
                borderRadius: "14px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              {/* Top Bar */}
              <div className="h-11 bg-[#FAFAFA] border-b border-[#e7e5e4] px-4 flex items-center justify-between select-none shrink-0">
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

              {/* Split inside browser */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] divide-y md:divide-y-0 md:divide-x divide-[#e7e5e4]">
                
                {/* Description column */}
                <div className="p-6 flex flex-col justify-between min-h-[220px]">
                  <div>
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
                    <h3 className="text-[14px] font-bold text-stone-900 mt-3 leading-tight">{current.tagline}</h3>
                    <p className="text-xs text-stone-500 mt-2 leading-relaxed">{current.desc}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-stone-100 mt-6 flex items-center justify-between text-[10px] font-mono text-stone-400">
                    <span>STATUS: ACTIVE</span>
                    <span style={{ color: current.color }}>SYNCED TO BRAIN ✓</span>
                  </div>
                </div>

                {/* Playground simulation column */}
                <div className="p-6 bg-[#fafaf9] flex flex-col justify-center min-h-[220px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.25 }}
                      className="w-full h-full"
                    >
                      {current.renderPlayground()}
                    </motion.div>
                  </AnimatePresence>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
