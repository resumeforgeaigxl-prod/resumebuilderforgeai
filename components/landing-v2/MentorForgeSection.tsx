"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  FileText, 
  Terminal, 
  Mic, 
  BookOpen, 
  Briefcase, 
  Sparkles,
  ArrowRight,
  Cpu
} from "lucide-react";

interface SubAgent {
  id: string;
  name: string;
  sub: string;
  icon: any;
  color: string;
  shadow: string;
  left: string;
  top: string;
  x: number;
  y: number;
}

const subAgents: SubAgent[] = [
  { 
    id: "resume", 
    name: "Resume Agent", 
    sub: "Document Synth", 
    icon: FileText, 
    color: "#3B82F6", 
    shadow: "rgba(59, 130, 246, 0.4)",
    left: "50%", 
    top: "12.5%",
    x: 200,
    y: 50
  },
  { 
    id: "coding", 
    name: "Coding Agent", 
    sub: "Code & Compiler", 
    icon: Terminal, 
    color: "#10B981", 
    shadow: "rgba(16, 185, 129, 0.4)",
    left: "82.5%", 
    top: "35%",
    x: 330,
    y: 140
  },
  { 
    id: "interview", 
    name: "Interview Agent", 
    sub: "Speech & Audio", 
    icon: Mic, 
    color: "#EC4899", 
    shadow: "rgba(236, 72, 153, 0.4)",
    left: "70%", 
    top: "77.5%",
    x: 280,
    y: 310
  },
  { 
    id: "knowledge", 
    name: "Knowledge Agent", 
    sub: "RAG Curriculum", 
    icon: BookOpen, 
    color: "#F59E0B", 
    shadow: "rgba(245, 158, 11, 0.4)",
    left: "30%", 
    top: "77.5%",
    x: 120,
    y: 310
  },
  { 
    id: "job", 
    name: "Job Agent", 
    sub: "ATS & Matching", 
    icon: Briefcase, 
    color: "#8B5CF6", 
    shadow: "rgba(139, 92, 246, 0.4)",
    left: "17.5%", 
    top: "35%",
    x: 70,
    y: 140
  }
];

export default function MentorForgeSection() {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  
  // Parallax states for 3D card tilt
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
    setRotateX(-y * 5); // Subtle 5deg max
    setRotateY(x * 5);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <section id="mentorforge" className="w-full bg-[#070709] text-white py-24 border-t border-stone-900 relative overflow-hidden select-none">
      {/* Background neon ambient gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 md:px-10">
        
        {/* Header Block */}
        <div className="text-left mb-16">
          <span className="font-mono text-[14px] text-blue-500 font-semibold uppercase leading-4 block mb-3">
            #05 — MentorForge AI
          </span>
          <h2
            className="text-white font-bold leading-[1.1] text-3xl md:text-[clamp(32px,4vw,48px)] tracking-tight max-w-[720px] font-display"
          >
            The Central Brain.{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
              A System-Wide Agentic Mesh.
            </span>
          </h2>
          <p className="text-stone-400 mt-4 text-sm md:text-base max-w-[620px] leading-relaxed">
            Instead of isolated tool modules, ResumeForgeAI runs on a unified master-subagent orchestrator. 
            It binds all educational paths, mock speech interviews, coding submissions, and ATS job matches into a single cohesive memory.
          </p>
        </div>

        {/* 3D Interactive Container Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
          
          {/* LEFT: 3D Cognitive Connection Mesh Diagram */}
          <div 
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="relative bg-stone-950/40 border border-stone-900 rounded-3xl p-6 sm:p-10 flex items-center justify-center aspect-square max-w-[500px] mx-auto w-full shadow-2xl"
            style={{
              transformStyle: "preserve-3d",
              transform: isHovered 
                ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)` 
                : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
              transition: isHovered 
                ? 'transform 0.08s ease-out, box-shadow 0.08s ease-out' 
                : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isHovered 
                ? "0 25px 50px -12px rgba(59, 130, 246, 0.15)" 
                : "0 10px 30px -15px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Interactive Glow Spotlight */}
            <div 
              className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 rounded-3xl"
              style={{
                background: isHovered 
                  ? `radial-gradient(350px circle at ${mouseX}px ${mouseY}px, rgba(99, 102, 241, 0.12), rgba(168, 85, 247, 0.03), transparent 60%)` 
                  : 'none',
              }}
            />

            {/* Connection Paths (SVG) */}
            <div className="absolute inset-0 z-0">
              <svg width="100%" height="100%" viewBox="0 0 400 400" className="w-full h-full">
                <defs>
                  <linearGradient id="glowLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#EC4899" stopOpacity="0.8" />
                  </linearGradient>
                  <filter id="svgConnectionGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {subAgents.map((agent) => {
                  const isActive = hoveredAgent === agent.id || hoveredAgent === null;
                  return (
                    <g key={agent.id}>
                      <motion.path
                        d={`M 200,200 L ${agent.x},${agent.y}`}
                        stroke="url(#glowLineGrad)"
                        strokeWidth={isActive ? 3 : 1}
                        strokeOpacity={isActive ? 0.6 : 0.15}
                        fill="none"
                        filter={isActive ? "url(#svgConnectionGlow)" : "none"}
                        transition={{ duration: 0.3 }}
                      />
                      {isActive && (
                        <motion.circle
                          r="4"
                          fill="#818CF8"
                          filter="url(#svgConnectionGlow)"
                          animate={{
                            cx: [200, agent.x],
                            cy: [200, agent.y]
                          }}
                          transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Nodes Container */}
            <div className="absolute inset-0 z-20 pointer-events-none" style={{ transformStyle: "preserve-3d" }}>
              
              {/* CENTRAL BRAIN NODE */}
              <div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{ transform: "translate(-50%, -50%) translateZ(30px)" }}
              >
                <div 
                  className="w-20 h-20 bg-indigo-950/80 border-2 border-indigo-500 rounded-full flex flex-col items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.4)] relative group cursor-pointer"
                >
                  <Brain className="w-8 h-8 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-mono font-bold text-indigo-300 uppercase tracking-widest mt-1">Brain</span>
                  <div className="absolute inset-0 rounded-full border border-indigo-400 animate-ping opacity-25 pointer-events-none" />
                </div>
              </div>

              {/* SUBAGENT NODES */}
              {subAgents.map((agent) => {
                const Icon = agent.icon;
                const isCurrentHovered = hoveredAgent === agent.id;
                const isAnyHovered = hoveredAgent !== null;
                
                return (
                  <div
                    key={agent.id}
                    className="absolute pointer-events-auto cursor-pointer"
                    style={{
                      left: agent.left,
                      top: agent.top,
                      transform: "translate(-50%, -50%) translateZ(18px)"
                    }}
                    onMouseEnter={() => setHoveredAgent(agent.id)}
                    onMouseLeave={() => setHoveredAgent(null)}
                  >
                    <div 
                      className="flex flex-col items-center p-2.5 rounded-2xl bg-stone-900/90 border transition-all duration-300"
                      style={{
                        borderColor: isCurrentHovered ? agent.color : "#1C1917",
                        boxShadow: isCurrentHovered 
                          ? `0 0 20px ${agent.shadow}` 
                          : "0 4px 12px rgba(0,0,0,0.3)",
                        opacity: isAnyHovered && !isCurrentHovered ? 0.4 : 1,
                        transform: isCurrentHovered ? "scale(1.08)" : "scale(1)"
                      }}
                    >
                      <div 
                        className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors"
                        style={{
                          borderColor: isCurrentHovered ? agent.color : "#2E2A27",
                          backgroundColor: isCurrentHovered ? `${agent.color}15` : "transparent"
                        }}
                      >
                        <Icon 
                          className="w-4 h-4" 
                          style={{ color: isCurrentHovered ? agent.color : "#A8A29E" }}
                        />
                      </div>
                      <div className="text-center mt-1.5 hidden sm:block">
                        <span className="text-[10px] font-bold block text-white">{agent.name}</span>
                        <span className="text-[8px] font-mono text-stone-500 block leading-tight mt-0.5">{agent.sub}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Cognitive Loop Details */}
          <div className="space-y-6 flex flex-col justify-center">
            
            {/* Feature 1 */}
            <div 
              className={`p-6 border rounded-2xl transition-all duration-300 ${
                hoveredAgent === 'resume' || hoveredAgent === 'job'
                  ? 'border-indigo-500/40 bg-indigo-950/10 shadow-[0_4px_20px_rgba(99,102,241,0.05)]'
                  : 'border-stone-900 bg-stone-950/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Dynamic Intent Routing</h3>
                  <p className="text-[11px] font-mono text-indigo-400 mt-0.5">Resume Agent + Job Agent</p>
                </div>
              </div>
              <p className="text-xs text-stone-400 mt-3 leading-relaxed">
                When you target a role, the orchestrator mesh delegates tasks. It directs the Job Agent to parse requirements, while coordinating with the Resume Agent to align document structure, bullet points, and ATS compliance.
              </p>
            </div>

            {/* Feature 2 */}
            <div 
              className={`p-6 border rounded-2xl transition-all duration-300 ${
                hoveredAgent === 'coding' || hoveredAgent === 'knowledge'
                  ? 'border-emerald-500/40 bg-emerald-950/10 shadow-[0_4px_20px_rgba(16,185,129,0.05)]'
                  : 'border-stone-900 bg-stone-950/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50/5 flex items-center justify-center border border-emerald-500/20">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Unified Skill Memory Matrix</h3>
                  <p className="text-[11px] font-mono text-emerald-400 mt-0.5">Coding Agent + Knowledge Agent</p>
                </div>
              </div>
              <p className="text-xs text-stone-400 mt-3 leading-relaxed">
                Tracks all code compile attempts, sandboxed tests, and curriculum benchmarks. If a user hits a block, StudyForge customizes curriculum maps while CodingForge populates focused target practice questions.
              </p>
            </div>

            {/* Feature 3 */}
            <div 
              className={`p-6 border rounded-2xl transition-all duration-300 ${
                hoveredAgent === 'interview'
                  ? 'border-pink-500/40 bg-pink-950/10 shadow-[0_4px_20px_rgba(236,72,153,0.05)]'
                  : 'border-stone-900 bg-stone-950/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-50/5 flex items-center justify-center border border-pink-500/20">
                  <Mic className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Multi-Modal Audio Speech Evaluation</h3>
                  <p className="text-[11px] font-mono text-pink-400 mt-0.5">Interview Agent</p>
                </div>
              </div>
              <p className="text-xs text-stone-400 mt-3 leading-relaxed">
                Powers real-time mock interviews with speech assessment. Evaluates voice responses for vocabulary, conceptual indexing, code logic definitions, and behavioral structure to grade developer readiness.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
