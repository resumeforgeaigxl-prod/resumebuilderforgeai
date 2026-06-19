"use client";

import { Zap, Target, Layout, BrainCircuit, MessageSquareWarning, Briefcase, Shield, Wand2} from 'lucide-react';
import { Card } from "@/components/ui/Card";

interface FeatureGridProps {
  t: (key: string) => string;
}

export default function FeatureGrid({ t }: FeatureGridProps) {
  const features = [
    { icon: <Wand2 className="text-indigo-400" />, title: t('ai_builder'), desc: t('ai_builder_desc') },
    { icon: <Zap className="text-blue-400" />, title: t('ats_analyzer'), desc: t('ats_analyzer_desc') },
    { icon: <Target className="text-emerald-400" />, title: t('jd_matching'), desc: t('jd_matching_desc') },
    { icon: <Layout className="text-pink-400" />, title: t('portfolio_gen'), desc: t('portfolio_gen_desc') },
    { icon: <BrainCircuit className="text-orange-400" />, title: t('interview_prep_title'), desc: t('interview_prep_desc') },
    { icon: <MessageSquareWarning className="text-cyan-400" />, title: "AI Coach", desc: "Real-time career mentorship powered by multi-modal AI agents." },
    { icon: <Briefcase className="text-yellow-400" />, title: "Intelligence Jobs", desc: "Discover high-signal opportunities synced with your skill profile." },
    { icon: <Shield className="text-purple-400" />, title: "Secure Vault", desc: "Enterprise-level data protection and decentralized profile ownership." }
  ];

  return (
    <section id="features" className="py-32 px-6 bg-[#030308]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Ecosystem Capabilities.</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            Every tool in the Forge is precision-engineered to give you an unfair advantage in the market.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <Card key={i} className="p-8 group hover:bg-white/[0.03] border-white/5 transition-all flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/[0.05] transition-all">
                <div className="w-8 h-8">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
