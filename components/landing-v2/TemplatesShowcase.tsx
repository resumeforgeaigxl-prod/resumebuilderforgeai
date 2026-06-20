"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const categories = [
  { id: "all", label: "All Templates" },
  { id: "engineering", label: "Engineering" },
  { id: "management", label: "Management" },
  { id: "minimalist", label: "Minimalist" },
] as const;

const templates = [
  {
    name: "Modern",
    description: "Clean layout with accent colors",
    accent: "#0070F3",
    variant: "modern" as const,
    atsScore: "98%",
    tags: ["Popular", "Creative", "Color Accent"],
    categories: ["all", "minimalist"],
  },
  {
    name: "Executive",
    description: "Traditional format for leadership roles",
    accent: "#171717",
    variant: "executive" as const,
    atsScore: "97%",
    tags: ["Formal", "Management", "Serif Layout"],
    categories: ["all", "management"],
  },
  {
    name: "Minimal",
    description: "Simple, typography-focused design",
    accent: "#8F8F8F",
    variant: "minimal" as const,
    atsScore: "99%",
    tags: ["Clean Space", "Academic", "Ultra Minimal"],
    categories: ["all", "minimalist"],
  },
  {
    name: "Technical",
    description: "Optimized for engineering roles",
    accent: "#7928CA",
    variant: "technical" as const,
    atsScore: "96%",
    tags: ["Developer", "Two Column", "Tech Skills Highlight"],
    categories: ["all", "engineering"],
  },
];

/* ═══════════════════════════════════════════════
   High-Typography Mini Resume Previews (HTML/CSS)
   ═══════════════════════════════════════════════ */

function ModernPreview() {
  return (
    <div className="w-full h-full text-left flex flex-col font-sans select-none" style={{ fontSize: "5px", lineHeight: "7px" }}>
      {/* Top accent bar */}
      <div className="h-1 bg-[#0070F3] w-full mb-2 shrink-0" />
      {/* Name and title */}
      <div className="mb-2.5 shrink-0">
        <div className="font-bold text-[8px] text-[#171717] tracking-tight">SARAH J. ANDERSON</div>
        <div className="text-[#0070F3] font-medium text-[4.5px] mt-0.5">Lead Digital Product Designer</div>
        <div className="text-[#8F8F8F] text-[3.5px] mt-0.5">San Francisco, CA • contact@sarahanderson.design • +1 (415) 555-0199</div>
      </div>
      {/* Two columns */}
      <div className="flex gap-2.5 flex-1 min-h-0 overflow-hidden">
        {/* Left Column (Wider) */}
        <div className="flex-1 space-y-2.5 overflow-hidden">
          {/* Profile Summary */}
          <div>
            <div className="font-semibold text-[#171717] border-b border-[#EBEBEB] pb-0.5 mb-1 text-[4.5px] tracking-wider">PROFILE</div>
            <p className="text-[#8F8F8F] text-[3.5px] leading-[5px]">
              Innovative Senior Product Designer with 6+ years of experience crafting conversion-focused SaaS dashboards, design systems, and mobile interfaces. Specialist in React-integrated layouts.
            </p>
          </div>
          {/* Experience */}
          <div className="space-y-2">
            <div className="font-semibold text-[#171717] border-b border-[#EBEBEB] pb-0.5 mb-1 text-[4.5px] tracking-wider">EXPERIENCE</div>
            <div className="space-y-1.5">
              <div>
                <div className="flex justify-between font-medium text-[#171717]">
                  <span>Lead Product Designer</span>
                  <span className="text-[#8F8F8F] font-normal">2022 - Present</span>
                </div>
                <div className="text-[#0070F3] text-[3.5px] font-medium">Stripe • Checkout Team</div>
                <ul className="list-disc pl-2.5 mt-0.5 space-y-0.5 text-[#8F8F8F] text-[3.2px] leading-[4.5px]">
                  <li>Led design for Stripe Checkout dashboard, improving conversion rate by 14%.</li>
                  <li>Developed Stripe's React-based layout system, saving 80 dev hours weekly.</li>
                </ul>
              </div>
              <div>
                <div className="flex justify-between font-medium text-[#171717]">
                  <span>Senior UI/UX Designer</span>
                  <span className="text-[#8F8F8F] font-normal">2019 - 2022</span>
                </div>
                <div className="text-[#0070F3] text-[3.5px] font-medium">Figma • Community Team</div>
                <ul className="list-disc pl-2.5 mt-0.5 space-y-0.5 text-[#8F8F8F] text-[3.2px] leading-[4.5px]">
                  <li>Designed Figma Community features, driving 5M+ resource downloads.</li>
                  <li>Co-created layout features, improving UI workflow speeds by 24%.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* Right Column (Narrower) */}
        <div className="w-[60px] space-y-2.5 shrink-0 border-l border-[#EBEBEB] pl-2 overflow-hidden">
          {/* Skills */}
          <div>
            <div className="font-semibold text-[#171717] border-b border-[#EBEBEB] pb-0.5 mb-1 text-[4.5px] tracking-wider">EXPERTISE</div>
            <div className="space-y-0.5 text-[#4D4D4D] text-[3.5px]">
              <div>• Figma & Design Systems</div>
              <div>• UI/UX & Web Prototyping</div>
              <div>• React, HTML5 & Tailwind CSS</div>
              <div>• User Testing & Research</div>
              <div>• Wireframing & User Flows</div>
            </div>
          </div>
          {/* Education */}
          <div>
            <div className="font-semibold text-[#171717] border-b border-[#EBEBEB] pb-0.5 mb-1 text-[4.5px] tracking-wider">EDUCATION</div>
            <div className="text-[#171717] font-medium">B.F.A. in Interaction Design</div>
            <div className="text-[#8F8F8F] text-[3.5px]">California College of the Arts</div>
            <div className="text-[#8F8F8F] text-[3.2px] mt-0.5">GPA: 3.9/4.0</div>
          </div>
          {/* Certifications */}
          <div>
            <div className="font-semibold text-[#171717] border-b border-[#EBEBEB] pb-0.5 mb-1 text-[4.5px] tracking-wider">CREDENTIALS</div>
            <div className="text-[#171717] font-medium">Nielsen Norman UX Cert</div>
            <div className="text-[#8F8F8F] text-[3.5px]">Credential ID: 1043-NNG</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExecutivePreview() {
  return (
    <div className="w-full h-full text-left flex flex-col font-serif select-none" style={{ fontSize: "5px", lineHeight: "7px" }}>
      {/* Centered Header */}
      <div className="text-center mb-2.5 shrink-0">
        <div className="font-bold text-[9px] text-[#171717] tracking-wide">DAVID W. CHEN</div>
        <div className="text-[#4D4D4D] text-[4.5px] mt-0.5 italic">Chief Operating Officer</div>
        <div className="text-[#8F8F8F] text-[3.5px] mt-0.5">New York, NY | david.chen@corporate.com | (555) 019-2834 | linkedin.com/in/davidwchen</div>
        <div className="h-[0.5px] bg-[#171717] w-full mt-2" />
      </div>
      {/* Sections */}
      <div className="space-y-2.5 flex-1 min-h-0 overflow-hidden">
        {/* Executive Profile */}
        <div>
          <div className="font-bold text-[#171717] text-[4.5px] tracking-wider mb-0.5">EXECUTIVE PROFILE</div>
          <p className="text-[#4D4D4D] leading-[5px] text-[3.5px] text-justify">
            Distinguished Executive COO with 15+ years of operational leadership scaling global tech enterprises. Expert in optimizing multi-million dollar budgets, establishing high-velocity engineering organizations, and executing cross-border mergers.
          </p>
        </div>
        {/* Experience */}
        <div className="space-y-2">
          <div className="font-bold text-[#171717] text-[4.5px] tracking-wider mb-1">PROFESSIONAL EXPERIENCE</div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between font-bold text-[#171717]">
                <span>GLOBAL SOLUTIONS, INC. • New York, NY</span>
                <span>2018 - Present</span>
              </div>
              <div className="text-[#4D4D4D] italic text-[3.5px] font-medium">Chief Operating Officer</div>
              <ul className="list-disc pl-2.5 mt-0.5 space-y-0.5 text-[#4D4D4D] text-[3.2px] leading-[4.5px]">
                <li>Directing global operations, managing $85M budget, and overseeing 450+ staff members.</li>
                <li>Led organizational restructuring, reducing operational overhead by 18% while boosting output.</li>
                <li>Scaled engineering organization from 40 to 180+ developers, accelerating feature shipping.</li>
              </ul>
            </div>
            <div>
              <div className="flex justify-between font-bold text-[#171717]">
                <span>SCALEUP SYSTEMS, INC. • San Francisco, CA</span>
                <span>2014 - 2018</span>
              </div>
              <div className="text-[#4D4D4D] italic text-[3.5px] font-medium">VP of Product Operations</div>
              <ul className="list-disc pl-2.5 mt-0.5 space-y-0.5 text-[#4D4D4D] text-[3.2px] leading-[4.5px]">
                <li>Optimized supply chains and cloud infrastructure, cutting SaaS hosting costs by 22%.</li>
                <li>Designed internal tooling that optimized customer onboarding times from 14 days to 4 hours.</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Education & Credentials */}
        <div className="flex gap-4 border-t border-[#EBEBEB] pt-2">
          <div className="flex-1">
            <div className="font-bold text-[#171717] text-[4.5px] tracking-wider mb-0.5">EDUCATION</div>
            <div className="text-[#171717] font-bold">Harvard Business School</div>
            <div className="text-[#4D4D4D] text-[3.5px]">MBA in General Management</div>
          </div>
          <div className="flex-1">
            <div className="font-bold text-[#171717] text-[4.5px] tracking-wider mb-0.5">BOARD MEMBERSHIPS</div>
            <div className="text-[#171717] font-bold">TechAlliance Global Board</div>
            <div className="text-[#4D4D4D] text-[3.5px]">Strategic Advisory Member</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MinimalPreview() {
  return (
    <div className="w-full h-full text-left flex flex-col font-sans select-none" style={{ fontSize: "5px", lineHeight: "7px" }}>
      {/* Minimal Header */}
      <div className="mb-3.5 shrink-0">
        <div className="font-light text-[10px] text-[#171717] tracking-tight">SARAH L. JENKINS</div>
        <div className="text-[#8F8F8F] text-[4px] mt-0.5 font-semibold tracking-widest uppercase">Lead Visual Designer</div>
        <div className="text-[#8F8F8F] text-[3.5px] mt-0.5">jenkins@email.com • New York, NY • +1 (212) 555-0187</div>
      </div>
      {/* Space-divided content */}
      <div className="space-y-3 flex-1 min-h-0 overflow-hidden">
        {/* Profile */}
        <div>
          <div className="text-[#8F8F8F] text-[4px] uppercase tracking-widest font-semibold mb-1">Introduction</div>
          <p className="text-[#4D4D4D] text-[3.5px] leading-[5px]">
            Minimalist-focused art director and visual designer. Over 6 years of experience crafting elegant brand systems, typography-driven layouts, and websites for modern media companies.
          </p>
        </div>
        {/* Work Experience */}
        <div>
          <div className="text-[#8F8F8F] text-[4px] uppercase tracking-widest font-semibold mb-1">Work Experience</div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between font-medium text-[#171717]">
                <span>Senior Visual Designer</span>
                <span>2020 - Present</span>
              </div>
              <div className="text-[#8F8F8F] text-[3.5px]">Squarespace • Brand Design</div>
              <p className="text-[#4D4D4D] mt-0.5 text-[3.2px] leading-[4.5px]">Created next-generation templates, improving customer retention by 8%. Maintained typography-focused brand systems across marketing websites.</p>
            </div>
            <div>
              <div className="flex justify-between font-medium text-[#171717]">
                <span>Visual Designer</span>
                <span>2017 - 2020</span>
              </div>
              <div className="text-[#8F8F8F] text-[3.5px]">Medium • Editorial Team</div>
              <p className="text-[#4D4D4D] mt-0.5 text-[3.2px] leading-[4.5px]">Redesigned reader experience, growing average read time by 15%. Crafted bespoke cover art and illustrations for publication articles.</p>
            </div>
          </div>
        </div>
        {/* Selected Projects */}
        <div>
          <div className="text-[#8F8F8F] text-[4px] uppercase tracking-widest font-semibold mb-1">Selected Projects</div>
          <div className="grid grid-cols-2 gap-2 text-[3.5px] text-[#4D4D4D]">
            <div>
              <div className="font-semibold text-[#171717]">Brand Identity for Arc</div>
              <div className="text-[#8F8F8F] text-[3.2px]">Complete brand system & color spec (2023)</div>
            </div>
            <div>
              <div className="font-semibold text-[#171717]">Linear Design System</div>
              <div className="text-[#8F8F8F] text-[3.2px]">Refining layout spacing & grids (2022)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TechnicalPreview() {
  return (
    <div className="w-full h-full text-left flex flex-col font-mono select-none" style={{ fontSize: "4.5px", lineHeight: "6px" }}>
      {/* Code-style Header */}
      <div className="mb-2 border-b border-[#EBEBEB] pb-2 shrink-0">
        <div className="font-bold text-[7px] text-[#171717]">&lt;AlexRivera /&gt;</div>
        <div className="text-[#7928CA] text-[3.5px] mt-0.5">const title = "Staff Engineer";</div>
        <div className="text-[#8F8F8F] text-[3.5px] mt-0.5">
          const contact = &#123; github: "alexrivera", mail: "alex@rivera.dev", phone: "+14155550188" &#125;;
        </div>
      </div>
      {/* Layout */}
      <div className="flex gap-2 flex-1 min-h-0 overflow-hidden">
        {/* Left Column (Sidebar) */}
        <div className="w-[60px] space-y-2 border-r border-[#EBEBEB] pr-1.5 shrink-0 overflow-hidden">
          <div>
            <div className="font-bold text-[#171717] text-[4px] mb-0.5">let skills = [</div>
            <div className="space-y-0.5 text-[#7928CA] pl-1 text-[3.5px]">
              <div>"TypeScript",</div>
              <div>"React / Next.js",</div>
              <div>"Node.js / Go",</div>
              <div>"Kubernetes",</div>
              <div>"AWS / GCP",</div>
              <div>"PostgreSQL",</div>
            </div>
            <div className="font-bold text-[#171717] text-[4px] mt-0.5">];</div>
          </div>
          <div>
            <div className="font-bold text-[#171717] text-[4px] mb-0.5">let tools = [</div>
            <div className="space-y-0.5 text-[#7928CA] pl-1 text-[3.5px]">
              <div>"Docker",</div>
              <div>"GraphQL",</div>
              <div>"Git",</div>
            </div>
            <div className="font-bold text-[#171717] text-[4px] mt-0.5">];</div>
          </div>
        </div>
        {/* Right Column */}
        <div className="flex-1 space-y-2 pl-1.5 overflow-hidden">
          <div>
            <div className="font-bold text-[#171717] text-[4.5px] mb-0.5">class Experience extends Developer &#123;</div>
            <div className="space-y-1.5 pl-1.5">
              <div>
                <div className="text-[#171717] font-medium flex justify-between">
                  <span>Staff Software Engineer</span>
                  <span className="text-[#8F8F8F] font-normal">2022 - Now</span>
                </div>
                <div className="text-[#7928CA] text-[3.5px]">Vercel • Next.js Core Team</div>
                <p className="text-[#4D4D4D] leading-[4.5px] text-[3.2px] mt-0.5">
                  - Designed routing performance modules. Decreased cold-start latency by 24%.
                </p>
              </div>
              <div>
                <div className="text-[#171717] font-medium flex justify-between">
                  <span>Senior Developer</span>
                  <span className="text-[#8F8F8F] font-normal">2020 - 2022</span>
                </div>
                <div className="text-[#7928CA] text-[3.5px]">Linear • Sync Team</div>
                <p className="text-[#4D4D4D] leading-[4.5px] text-[3.2px] mt-0.5">
                  - Built high-performance shortcut engine. Refactored WebSocket sync layer.
                </p>
              </div>
            </div>
            <div className="font-bold text-[#171717] text-[4.5px] mt-0.5">&#125;</div>
          </div>
          <div className="border-t border-[#EBEBEB] pt-1">
            <div className="font-bold text-[#171717] text-[4px] mb-0.5">const projects = &#123;</div>
            <div className="pl-1.5 text-[#7928CA] text-[3.5px]">
              <div>nextThemes: "12k stars",</div>
              <div>turboGrep: "Fast search engine",</div>
            </div>
            <div className="font-bold text-[#171717] text-[4px] mt-0.5">&#125;;</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Showcase Preview Card Component
   ═══════════════════════════════════════════════ */

function TemplatePreview({ variant, name }: { variant: string; name: string }) {
  const [hovered, setHovered] = useState(false);

  const renderPreview = () => {
    switch (variant) {
      case "modern":
        return <ModernPreview />;
      case "executive":
        return <ExecutivePreview />;
      case "minimal":
        return <MinimalPreview />;
      case "technical":
        return <TechnicalPreview />;
      default:
        return <ModernPreview />;
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center justify-center h-[340px] bg-[#F7F7F8] overflow-hidden rounded-xl border border-[#EBEBEB] transition-colors duration-300 group-hover:border-[#171717]/10"
      style={{
        backgroundImage: "radial-gradient(#EBEBEB 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    >
      {/* The Floating Resume Sheet */}
      <div
        className="w-[210px] h-[297px] bg-white rounded-[2px] p-3.5 transition-all duration-500 ease-[0.16,1,0.3,1] origin-center"
        style={{
          boxShadow: hovered
            ? "0 30px 60px -15px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.04)"
            : "0 10px 30px -10px rgba(0,0,0,0.08), 0 1px 1px rgba(0,0,0,0.01), 0 0 0 1px rgba(0,0,0,0.03)",
          transform: hovered
            ? "perspective(1000px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateY(-10px) scale(1.02)"
            : "perspective(1000px) rotateX(8deg) rotateY(-8deg) rotateZ(0.5deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {renderPreview()}
      </div>

      {/* Premium Glassmorphic Hover Overlay */}
      <div className="absolute inset-0 bg-[#171717]/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2.5 z-10">
        <button className="px-5 h-9 rounded-full bg-[#171717] text-white text-xs font-medium transition-all duration-300 translate-y-3 group-hover:translate-y-0 shadow-[0_8px_16px_rgba(0,0,0,0.12)] hover:bg-[#2e2e2e] flex items-center gap-1.5">
          Use Template
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6h8M6 2l4 4-4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button className="px-5 h-9 rounded-full bg-white/90 border border-white/20 text-[#171717] text-xs font-medium transition-all duration-300 translate-y-3 group-hover:translate-y-0 backdrop-blur-md hover:bg-white">
          Preview Template
        </button>
      </div>
    </div>
  );
}

export default function TemplatesShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredTemplates = templates.filter((t) =>
    t.categories.includes(selectedCategory)
  );

  return (
    <section id="templates" className="py-24 px-6 overflow-hidden bg-[#FAFAFA]">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease }}
        >
          <p
            className="uppercase text-[#8F8F8F]"
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.05em",
            }}
          >
            Templates
          </p>
          <h2
            className="mt-3 text-[#171717]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "32px",
              fontWeight: 400,
              fontStyle: "italic",
              lineHeight: "40px",
              letterSpacing: "-0.01em",
            }}
          >
            Professional templates for every role
          </h2>
        </motion.div>

        {/* Category Switcher Tabs */}
        <div className="flex justify-center mt-10">
          <div className="flex p-1 bg-[#F2F2F2] rounded-full max-w-fit relative z-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative px-4 py-1.5 text-xs font-medium rounded-full transition-colors duration-200 select-none ${
                  selectedCategory === cat.id
                    ? "text-white"
                    : "text-[#4D4D4D] hover:text-[#171717]"
                }`}
              >
                {selectedCategory === cat.id && (
                  <motion.div
                    layoutId="active-cat-bg"
                    className="absolute inset-0 bg-[#171717] rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid Container */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 pb-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.name}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="w-full group"
              >
                <div className="bg-white border border-[#EBEBEB] rounded-2xl p-2 pb-6 transition-all duration-500 hover:border-[#171717]/30 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1.5">
                  <TemplatePreview
                    variant={template.variant}
                    name={template.name}
                  />
                  <div className="p-4 pt-5 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#171717",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {template.name}
                      </h3>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border"
                        style={{
                          backgroundColor: "#F2F2F2",
                          color: "#171717",
                          borderColor: "#EBEBEB",
                        }}
                      >
                        ATS {template.atsScore}
                      </span>
                    </div>
                    <p
                      className="mt-1.5"
                      style={{
                        fontSize: "13px",
                        fontWeight: 400,
                        color: "#8F8F8F",
                        lineHeight: "18px",
                        fontFamily: "var(--font-geist-sans)",
                      }}
                    >
                      {template.description}
                    </p>

                    <div className="mt-4 pt-4 border-t border-[#F2F2F2] flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium text-[#4D4D4D] bg-[#FAFAFA] border border-[#EBEBEB] px-2 py-0.5 rounded-md font-sans"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
