"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Layout, Wand2} from 'lucide-react';

export default function PlatformOverview() {
  const forges = [
    { title: "ResumeForge", desc: "AI-powered, ATS-optimized document generation." },
    { title: "CodingForge", desc: "Full IDE integration with real-time AI guidance." },
    { title: "InterviewForge", desc: "Realistic AI-driven behavioral & technical prep." },
    { title: "ProjectForge", desc: "Portfolio-ready project generation and hosting." }
  ];

  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
            <Layout className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Unified Ecosystem</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tighter leading-tight">
            One Platform. <br />
            <span className="text-gradient">Total Career Control.</span>
          </h2>
          <p className="text-slate-400 text-lg mb-12 leading-relaxed font-medium">
            ResumeForgeAI isn&apos;t just a tool; it&apos;s a modular intelligence system designed to 
            evolve with your career, from intern to executive.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {forges.map((forge, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group">
                <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <div>
                  <h4 className="font-bold text-white mb-1">{forge.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{forge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-10 bg-indigo-500/20 blur-[100px] rounded-3xl opacity-30 pointer-events-none" />
          <div className="relative glass-card aspect-square max-w-md mx-auto p-12 flex flex-col justify-center border-white/10 shadow-2xl">
            <div className="space-y-10">
               <div className="flex justify-between items-end border-b border-white/5 pb-6">
                  <div className="space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Global Authority</span>
                    <h5 className="text-white font-bold flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-amber-500" />
                        Verified Success
                    </h5>
                  </div>
                  <span className="text-6xl font-black text-white italic">#1</span>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between text-xs text-white font-bold uppercase tracking-wider">
                    <span>ATS Precision</span>
                    <span className="text-indigo-400">98%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '98%' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                    />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                    <div className="text-3xl font-black text-white mb-1">2.4k+</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black leading-tight">Offers Secured</div>
                  </div>
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                    <div className="text-3xl font-black text-white mb-1">92%</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black leading-tight">Interview Rate</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
