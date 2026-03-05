'use client';

export default function TestimonialsSection() {
    return (
        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
            <h2 className="text-3xl font-bold text-white mb-12">Developers love us. ATS bots don&apos;t.</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
                {[
                    { name: "Sarah J.", role: "Frontend Dev", company: "Hired at Startup", body: "I spent hours writing my resume. RFAI parsed it, fixed my weak verbs automatically, and generated a clean PDF. Landed interviews within a week." },
                    { name: "Michael R.", role: "Data Scientist", company: "Hired at FAANG", body: "The JD matcher is insane. I just pasted the job descriptions, and it highlighted exactly what I was missing. The mock test also asked me SQL questions that actually came up." },
                    { name: "Priya M.", role: "Software Engineer", company: "Recent Grad", body: "The web portfolio feature is chef's kiss. Sent the custom URL instead of a boring PDF attached to emails. Looks incredibly professional." }
                ].map((t, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex text-yellow-500 mb-4 text-sm">★★★★★</div>
                        <p className="text-slate-300 text-sm mb-6 leading-relaxed">&quot;{t.body}&quot;</p>
                        <div>
                            <p className="font-bold text-white text-sm">{t.name}</p>
                            <p className="text-xs text-slate-500">{t.role} · {t.company}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
