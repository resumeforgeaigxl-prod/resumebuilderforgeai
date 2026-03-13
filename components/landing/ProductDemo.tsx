"use client";

import { Zap } from "lucide-react";

export default function ProductDemo() {
  return (
    <section className="py-32 px-6 border-t border-white/5 relative overflow-hidden">
        {/* Glow behind section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-indigo-500/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 relative z-10">
                <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Experience Phase 3 Automation.</h2>
                <p className="text-slate-400 font-medium">Watch how the Forge handles complex career workflows in seconds.</p>
            </div>
            
            <div className="relative max-w-5xl mx-auto rounded-[2rem] overflow-hidden glass-card border-white/10 aspect-[16/10] shadow-[0_0_100px_rgba(99,102,241,0.1)] group">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-6">
                        <button className="w-24 h-24 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group/play relative">
                            <div className="absolute inset-0 rounded-full bg-white animate-ping opacity-20" />
                            <Zap className="w-10 h-10 fill-current" />
                        </button>
                        <span className="text-white text-xs font-black tracking-[0.3em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">Launch Ecosystem Tour</span>
                    </div>
                </div>
                
                {/* Fallback pattern for video placeholder */}
                <div className="absolute inset-0 -z-10 grid grid-cols-12 grid-rows-6 opacity-10">
                    {Array.from({ length: 72 }).map((_, i) => (
                        <div key={i} className="border-[0.5px] border-white/20" />
                    ))}
                </div>
            </div>

            <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto text-center border-t border-white/5 pt-12">
                {[
                    { label: "Generation Speed", val: "< 2s" },
                    { label: "Accuracy Rate", val: "99.9%" },
                    { label: "Model Latency", val: "120ms" },
                    { label: "Success Quotient", val: "4.8x" }
                ].map((stat, i) => (
                    <div key={i}>
                        <div className="text-2xl font-black text-white mb-1 tracking-tight">{stat.val}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{stat.label}</div>
                    </div>
                ))}
            </div>
        </div>
    </section>
  );
}
