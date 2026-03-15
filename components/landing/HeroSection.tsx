"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Database, Code, Brain, Map, Search, Globe, Rocket } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HeroSectionProps {
  t: (key: string) => string;
  locale: string;
}

export default function HeroSection({ locale }: HeroSectionProps) {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none opacity-40" />
      <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md mb-10 shadow-xl"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] font-black text-indigo-200 tracking-[0.2em] uppercase">
            Platform Ecosystem v2.0
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9] max-w-5xl"
        >
          <span className="text-white">Forge Your</span> <br />
          <span className="text-gradient">Career With AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-slate-400 mb-12 max-w-3xl leading-relaxed font-medium"
        >
          Build ATS-optimized resumes, practice coding, prepare for interviews, follow career roadmaps, and discover job opportunities inside one AI-powered ecosystem.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-20"
        >
          <Button asChild size="lg" className="bg-white text-black hover:bg-white/90 px-10 h-14 rounded-xl text-lg group">
            <Link href={`/${locale}/signup`}>
              Start Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild size="lg" className="bg-white/5 border border-white/10 text-white hover:bg-white/10 px-10 h-14 rounded-xl text-lg">
            <Link href="#ecosystem">
              Explore Platform
            </Link>
          </Button>
        </motion.div>

        {/* Ecosystem Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl relative aspect-[16/9] flex items-center justify-center"
        >
           {/* Decorative Orb */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
                <div className="w-[600px] h-[600px] bg-indigo-500/5 blur-[100px] rounded-full animate-pulse" />
           </div>

           {/* Central Hub */}
           <div className="relative z-20 w-32 h-32 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl flex items-center justify-center shadow-2xl group hover:border-indigo-500/50 transition-colors duration-500">
                <Rocket className="w-12 h-12 text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
                
                {/* Connecting Lines (CSS based) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] -z-10">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                        <div 
                            key={angle}
                            className="absolute top-1/2 left-1/2 w-[300px] h-px bg-gradient-to-r from-indigo-500/40 to-transparent origin-left transition-opacity duration-1000"
                            style={{ transform: `rotate(${angle}deg)` }}
                        />
                    ))}
                </div>

                {/* Satellite Modules */}
                <ModuleNode icon={<Database className="w-5 h-5" />} label="Resume" angle={0} />
                <ModuleNode icon={<Code className="w-5 h-5" />} label="Coding" angle={45} />
                <ModuleNode icon={<Brain className="w-5 h-5" />} label="Interview" angle={90} />
                <ModuleNode icon={<Globe className="w-5 h-5" />} label="Portfolio" angle={135} />
                <ModuleNode icon={<Map className="w-5 h-5" />} label="Roadmap" angle={180} />
                <ModuleNode icon={<Search className="w-5 h-5" />} label="Jobs" angle={225} />
                <ModuleNode icon={<Rocket className="w-5 h-5" />} label="Project" angle={270} />
                <ModuleNode icon={<Sparkles className="w-5 h-5" />} label="AI Forge" angle={315} />
           </div>
        </motion.div>
      </div>
    </section>
  );
}

function ModuleNode({ icon, label, angle }: { icon: React.ReactNode, label: string, angle: number }) {
    const distance = 240;
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 + angle / 400 }}
            className="absolute flex flex-col items-center gap-2"
            style={{ 
                left: `calc(50% + ${x}px)`, 
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)'
            }}
        >
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl text-indigo-400 shadow-xl hover:bg-white/[0.08] hover:border-indigo-500/30 transition-all group-hover:scale-110">
                {icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{label}</span>
        </motion.div>
    );
}
