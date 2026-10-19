"use client";

import { useState, type ReactNode } from "react";
import { Award, Code, FileText, HeartHandshake, Server, Users } from "@/components/icons";

const items = [
  {
    title: "Industry-Level Projects",
    desc: "Production-grade code, architecture, and documentation.",
    icon: Code,
  },
  {
    title: "Expert Developers",
    desc: "Software engineers and AI/ML people on the work.",
    icon: Users,
  },
  {
    title: "Complete Documentation",
    desc: "The thesis, the report, the diagrams, and the setup guide.",
    icon: FileText,
  },
  {
    title: "IEEE & Research Support",
    desc: "A base paper, the gap, and the implementation.",
    icon: Award,
  },
  {
    title: "Deployment Assistance",
    desc: "The build, live, on Vercel, Render, AWS, or GCP.",
    icon: Server,
  },
  {
    title: "Post Delivery Support",
    desc: "Viva preparation, a walkthrough, and help after handover.",
    icon: HeartHandshake,
  },
];

function WindowFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#2a2c33] bg-[#101114] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-2 border-b border-[#2a2c33] px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-[#3a3d46]" />
        <span className="h-2 w-2 rounded-full bg-[#3a3d46]" />
        <span className="h-2 w-2 rounded-full bg-[#3a3d46]" />
        <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[#8b909a]">{title}</span>
      </div>
      <div className="min-h-[460px] p-6 md:p-8">{children}</div>
    </div>
  );
}

function Row({ kicker, label, note }: { kicker: string; label: string; note: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#2a2c33] py-3.5 last:border-b-0">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#8b909a]">{kicker}</p>
        <p className="mt-1 text-sm text-[#f4f5f7]">{label}</p>
      </div>
      <p className="text-[13px] text-[#d7e4f0]">{note}</p>
    </div>
  );
}

function Panel({ index }: { index: number }) {
  if (index === 0) {
    return (
      <WindowFrame title="project.app">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8b909a]">Architecture</p>
        <p className="mt-2 text-2xl text-[#f4f5f7]" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          One system, four layers.
        </p>
        <div className="mt-8">
          <Row kicker="01" label="The brief" note="Scope" />
          <Row kicker="02" label="The system" note="Design" />
          <Row kicker="03" label="The code" note="Build" />
          <Row kicker="04" label="The file" note="Hand over" />
        </div>
      </WindowFrame>
    );
  }

  if (index === 1) {
    return (
      <WindowFrame title="roster">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8b909a]">Who is on it</p>
        <div className="mt-6 space-y-3">
          {[
            ["Engineer", "The build"],
            ["Researcher", "The paper"],
            ["Writer", "The report"],
          ].map(([role, work]) => (
            <div key={role} className="flex items-center gap-4 rounded-xl border border-[#2a2c33] bg-[#0c0d10] px-4 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#3a3d46] text-[#d7e4f0]" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
                {role.slice(0, 1)}
              </span>
              <span>
                <span className="block text-sm text-[#f4f5f7]">{role}</span>
                <span className="block text-[13px] text-[#8b909a]">{work}</span>
              </span>
            </div>
          ))}
        </div>
      </WindowFrame>
    );
  }

  if (index === 2) {
    return (
      <WindowFrame title="report.pdf">
        <p className="text-2xl text-[#f4f5f7]" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          Final year report
        </p>
        <p className="mt-2 text-[13px] text-[#8b909a]">The pages that go with the code.</p>
        <div className="mt-8 space-y-2">
          {["Abstract", "System design", "Diagrams", "Setup guide", "References"].map((line, i) => (
            <div key={line} className="flex items-center gap-3 rounded-lg bg-[#0c0d10] px-3 py-2.5">
              <span className="w-5 font-mono text-[11px] text-[#d7e4f0]">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-sm text-[#f4f5f7]">{line}</span>
            </div>
          ))}
        </div>
      </WindowFrame>
    );
  }

  if (index === 3) {
    return (
      <WindowFrame title="paper">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#d7e4f0]">Base paper</p>
        <p className="mt-3 text-2xl leading-tight text-[#f4f5f7]" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          Read the paper. Then build the gap.
        </p>
        <div className="mt-8 grid gap-3">
          {[
            ["Select", "The IEEE paper that fits the brief"],
            ["Gap", "What the paper does not cover"],
            ["Build", "The implementation on top of it"],
          ].map(([name, line]) => (
            <div key={name} className="rounded-xl border border-[#2a2c33] px-4 py-3">
              <p className="text-sm text-[#f4f5f7]">{name}</p>
              <p className="mt-1 text-[13px] text-[#8b909a]">{line}</p>
            </div>
          ))}
        </div>
      </WindowFrame>
    );
  }

  if (index === 4) {
    return (
      <WindowFrame title="deploy">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] text-[#8b909a]">project.resumeforge.app</p>
          <span className="rounded-full border border-[#d7e4f0]/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#d7e4f0]">
            Live
          </span>
        </div>
        <div className="mt-6 rounded-xl border border-[#2a2c33] bg-[#0c0d10] p-4 font-mono text-[13px] leading-7 text-[#b4b8c2]">
          <p><span className="text-[#8b909a]">build</span>  passed</p>
          <p><span className="text-[#8b909a]">host</span>   Vercel</p>
          <p><span className="text-[#8b909a]">url</span>    ready for the examiner</p>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2">
          {["Vercel", "Render", "AWS"].map((host) => (
            <div key={host} className="rounded-lg border border-[#2a2c33] py-3 text-center text-[12px] text-[#f4f5f7]">
              {host}
            </div>
          ))}
        </div>
      </WindowFrame>
    );
  }

  return (
    <WindowFrame title="after handover">
      <p className="text-2xl text-[#f4f5f7]" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
        After the file is yours.
      </p>
      <div className="mt-8 space-y-3">
        {[
          ["Walkthrough", "We sit with the code once"],
          ["Viva", "The questions, written out"],
          ["Handover", "You can run it without us"],
        ].map(([name, line], i) => (
          <div key={name} className="flex gap-4 rounded-xl border border-[#2a2c33] px-4 py-4">
            <span className="text-[#d7e4f0]" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>
              <span className="block text-sm text-[#f4f5f7]">{name}</span>
              <span className="mt-1 block text-[13px] text-[#8b909a]">{line}</span>
            </span>
          </div>
        ))}
      </div>
    </WindowFrame>
  );
}

export default function ProjectFeatureStage() {
  const [active, setActive] = useState(0);

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#d7e4f0]">
          #01 — What you get
        </p>
        <h2
          className="mt-4 max-w-[14ch] text-4xl font-normal leading-[1.05] tracking-[-0.03em] text-[#f4f5f7] md:text-5xl"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          The work, written down.
        </h2>
        <div className="mt-10 border-t border-[#2a2c33]" role="tablist" aria-label="What you get">
          {items.map((item, index) => {
            const selected = index === active;
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(index)}
                className="flex w-full gap-4 border-b border-[#2a2c33] py-5 text-left"
              >
                <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${selected ? "text-[#d7e4f0]" : "text-[#8b909a]"}`} />
                <span>
                  <span className={`block text-[13px] font-semibold uppercase tracking-[0.06em] ${selected ? "text-[#f4f5f7]" : "text-[#b4b8c2]"}`}>
                    {item.title}
                  </span>
                  <span className="mt-1.5 block text-[14px] leading-6 text-[#8b909a]">{item.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="lg:sticky lg:top-24">
        <Panel index={active} />
      </div>
    </div>
  );
}
