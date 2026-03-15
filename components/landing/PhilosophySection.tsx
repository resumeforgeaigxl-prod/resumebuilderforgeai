"use client";



export default function PhilosophySection() {
  return (
    <section className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">Why ResumeForgeAI Exists</h2>
            <div className="space-y-6 text-lg text-slate-400 leading-relaxed">
              <p>
                Most career platforms focus on a single step such as resume building, coding practice, or job listings.
              </p>
              <p>
                ResumeForgeAI connects the entire journey from learning skills to preparing for interviews and discovering opportunities.
              </p>
              <p className="text-white font-bold">
                Everything works together inside one ecosystem.
              </p>
            </div>
          </div>
          
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full" />
             <div className="relative aspect-square rounded-3xl border border-white/10 bg-[#0c0c14] p-12 flex flex-col justify-center items-center text-center">
                 <div className="text-6xl mb-6">🤝</div>
                 <h3 className="text-2xl font-bold mb-4">Unified Journey</h3>
                 <p className="text-slate-500">We believe your resume should talk to your jobs, and your jobs should talk to your interview prep.</p>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
