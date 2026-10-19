export const dynamic = 'force-dynamic';
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing-v2/Navbar';
import FooterSection from '@/components/landing-v2/FooterSection';
import ProjectFeatureStage from '@/components/landing-v2/ProjectFeatureStage';
import { 
  Code, Cpu, FileText, Server, Smartphone, BookOpen, Layers, CheckCircle2, 
  Award, Compass
} from '@/components/icons';
import { Accordion } from '@/components/ui/Accordion';

export default async function ProjectServicesLandingPage({ params }: { params: { locale: string } }) {
  const { locale } = params;

  // Generate deterministic pixel data for decorative repeating grid patterns using a Bayer Ordered Dither Matrix
  const bayerMatrix = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ];

  const pixelSpacing = 6;
  const gridWidth = 240;
  const gridHeight = 120;
  const cols = Math.floor(gridWidth / pixelSpacing);
  const rows = Math.floor(gridHeight / pixelSpacing);

  const leftPixels: { x: number; y: number; opacity: number }[] = [];
  const rightPixels: { x: number; y: number; opacity: number }[] = [];

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      // Calculate vertical sine wave horizontal shift
      const waveShift = Math.sin(r * 0.3) * 6;
      const adjustedCol = c - waveShift;
      
      // Calculate normalized progress (0 = outer edge, 1 = inner edge)
      const progress = Math.max(0, Math.min(1, adjustedCol / cols));
      
      // Map progress to 0-16 for dither matrix comparison
      let bayerValue = 0;
      if (progress < 0.10) {
        bayerValue = 16; // 100% filled outer boundary
      } else if (progress > 0.85) {
        bayerValue = 0; // 100% transparent inner boundary
      } else {
        const normalizedProgress = (progress - 0.10) / (0.85 - 0.10);
        bayerValue = Math.floor(16 * (1 - normalizedProgress));
      }

      // Check if pixel should be rendered using Bayer dither grid comparison
      const matrixVal = bayerMatrix[r % 4][c % 4];
      
      if (bayerValue > matrixVal) {
        // Opacity transition: thicker at the edge (up to 45%), liter towards center (down to 4%)
        const maxOpacity = Math.max(0.12, 0.45 - (progress * 0.35));
        const minOpacity = Math.max(0.04, 0.18 - (progress * 0.14));
        
        // Add subtle deterministic variance to individual pixel opacity
        const opacityRand = ((c * 17 + r * 31) % 100) / 100;
        const opacity = minOpacity + opacityRand * (maxOpacity - minOpacity);

        leftPixels.push({
          x: c * pixelSpacing,
          y: r * pixelSpacing,
          opacity,
        });

        rightPixels.push({
          x: gridWidth - (c * pixelSpacing) - 4,
          y: r * pixelSpacing,
          opacity,
        });
      }
    }
  }

  const services = [
    { title: 'Major Projects', desc: 'End-to-end B.Tech/M.Tech final year projects with detailed research, execution, and documentation.', icon: <Layers className="w-5 h-5 text-[#d7e4f0]" /> },
    { title: 'Minor Projects', desc: 'Focused mid-semester projects designed to master individual technology scopes.', icon: <Compass className="w-5 h-5 text-[#d7e4f0]" /> },
    { title: 'Mini Projects', desc: 'Simple, fast, and high-quality lab assignments and small projects.', icon: <Award className="w-5 h-5 text-[#d7e4f0]" /> },
    { title: 'AI & ML Projects', desc: 'State of the art models, datasets training, deep learning architectures, CV, and NLP solutions.', icon: <Cpu className="w-5 h-5 text-[#d7e4f0]" /> },
    { title: 'Full Stack Projects', desc: 'Modern web applications developed using MERN stack, Next.js, Django, or Spring Boot.', icon: <Code className="w-5 h-5 text-[#d7e4f0]" /> },
    { title: 'Mobile App Projects', desc: 'Fully responsive Android and iOS apps built with React Native or Flutter.', icon: <Smartphone className="w-5 h-5 text-[#d7e4f0]" /> },
    { title: 'IEEE Projects', desc: 'Implementation of the latest IEEE transaction papers with source code validation.', icon: <FileText className="w-5 h-5 text-[#d7e4f0]" /> },
    { title: 'Research Projects', desc: 'Custom project execution targeting international journals and paper submissions.', icon: <BookOpen className="w-5 h-5 text-[#d7e4f0]" /> },
    { title: 'Documentation Only', desc: 'Comprehensive technical project reports, design diagrams, PPTs, and synopses.', icon: <FileText className="w-5 h-5 text-[#d7e4f0]" /> },
    { title: 'Deployment Support', desc: 'Deployment of your existing source code to production servers with database sync.', icon: <Server className="w-5 h-5 text-[#d7e4f0]" /> },
  ];

  const domains = [
    'Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Data Science',
    'Computer Vision', 'NLP', 'Full Stack Development', 'Web Development',
    'Mobile Development', 'Cloud Computing', 'Cyber Security', 'Blockchain',
    'IoT', 'Embedded Systems'
  ];

  const timelineSteps = [
    { step: 1, title: 'Submit Requirements', desc: 'Fill out the wizard form with your project details and college guidelines.' },
    { step: 2, title: 'Requirement Review', desc: 'Our technical architects analyze your scope, tech stack, and abstract.' },
    { step: 3, title: 'Quotation', desc: 'Get transparent pricing structure and deliverables breakdown.' },
    { step: 4, title: 'Development', desc: 'Our developers implement clean source code adhering to standards.' },
    { step: 5, title: 'Testing', desc: 'Rigorous validation including unit tests and output accuracy checks.' },
    { step: 6, title: 'Delivery', desc: 'Get source code, reports, installation guide, and live demo.' },
    { step: 7, title: 'Support & Viva Prep', desc: 'We provide one-on-one setup guidance, viva prep questions, and final training.' },
  ];

  const faqs = [
    { q: 'How long does development take?', a: 'Mini/Minor projects usually take 3 to 7 days, whereas Major/IEEE research projects take between 2 to 4 weeks depending on the complexity of requirements.' },
    { q: 'What technologies are supported?', a: 'We support all major stacks including Python (AI/ML/Deep Learning), JavaScript/TypeScript (Next.js, React, Node.js), Java, Android/Flutter, Cloud (AWS/GCP), and IoT/Embedded platforms.' },
    { q: 'Is documentation included?', a: 'Yes! Depending on your requirement selection, we can include complete SRS documentation, project report PDFs, presentation slides, and installation guides.' },
    { q: 'Can team projects be developed?', a: 'Absolutely. We support group project registration and can divide deliverables and project descriptions to reflect individual contributions in team reports.' },
    { q: 'Is deployment included?', a: 'Yes, if you select the deployment package, we host the project live on a staging URL so your guides and examiners can view it active.' },
    { q: 'Will source code be provided?', a: 'Yes, full clean source code with extensive code commenting and zero proprietary locks will be handed over to you upon delivery.' },
  ];

  return (
    <div className="bg-[#050505] min-h-screen text-[#f4f5f7] relative overflow-x-hidden">
      {/* Left Side Viewport Pixel Grid (scrolls with page) */}
      <div className="absolute left-0 top-0 bottom-0 w-[240px] pointer-events-none z-0 hidden xl:block overflow-hidden">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="left-pixel-pattern" width="240" height="120" patternUnits="userSpaceOnUse">
              {leftPixels.map((p, i) => (
                <rect 
                  key={i} 
                  x={p.x} 
                  y={p.y} 
                  width="4" 
                  height="4" 
                  fill="#d7e4f0" 
                  fillOpacity={p.opacity} 
                />
              ))}
            </pattern>
            <linearGradient id="left-gradient-mask" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="30%" stopColor="white" stopOpacity="0.9" />
              <stop offset="75%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id="left-svg-mask">
              <rect width="240" height="100%" fill="url(#left-gradient-mask)" />
            </mask>
          </defs>
          <rect width="240" height="100%" fill="url(#left-pixel-pattern)" mask="url(#left-svg-mask)" />
        </svg>
      </div>

      {/* Right Side Viewport Pixel Grid (scrolls with page) */}
      <div className="absolute right-0 top-0 bottom-0 w-[240px] pointer-events-none z-0 hidden xl:block overflow-hidden">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="right-pixel-pattern" width="240" height="120" patternUnits="userSpaceOnUse">
              {rightPixels.map((p, i) => (
                <rect 
                  key={i} 
                  x={p.x} 
                  y={p.y} 
                  width="4" 
                  height="4" 
                  fill="#d7e4f0" 
                  fillOpacity={p.opacity} 
                />
              ))}
            </pattern>
            <linearGradient id="right-gradient-mask" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="30%" stopColor="white" stopOpacity="0.9" />
              <stop offset="75%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id="right-svg-mask">
              <rect width="240" height="100%" fill="url(#right-gradient-mask)" />
            </mask>
          </defs>
          <rect width="240" height="100%" fill="url(#right-pixel-pattern)" mask="url(#right-svg-mask)" />
        </svg>
      </div>

      <Navbar locale={locale} />

      {/* Main Content: Stacked A4 Sheets */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-0 pt-8 pb-12 space-y-0 relative z-10">
        
        {/* A4 SHEET 1: Proposal Cover & Value Proposition */}
        <article className="relative overflow-hidden bg-[#0c0d10] border border-[#2a2c33] rounded-none p-8 md:p-16 flex flex-col justify-between">
          <div>
            <header className="mb-12 text-center select-none">
              <div className="border-t border-b border-[#2a2c33] py-3 mb-8 flex justify-between items-center text-[10px] font-mono tracking-widest text-[#8b909a] uppercase">
                <span>Academic Services</span>
                <span className="font-semibold text-[#f4f5f7]">ResumeForge AI</span>
                <span>Ref: RF-PRJ-2026</span>
              </div>
            </header>

            <div className="text-center py-6">
              <span className="font-mono text-[11px] text-[#8b909a] font-semibold uppercase tracking-wider block mb-4">
                Academic projects
              </span>
              <h1 className="text-4xl md:text-5xl font-normal tracking-[-0.03em] text-[#f4f5f7] leading-[1.1] max-w-[700px] mx-auto" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
                Build your final year project with a clear brief.
              </h1>
              <p className="text-[#b4b8c2] mt-6 text-sm md:text-base max-w-[560px] mx-auto leading-relaxed">
                From the idea to a live build. The work includes the code, the report, the slides, and help when the viva comes.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <Link
                  href={`/${locale}/project-services/request`}
                  className="inline-flex items-center justify-center rounded-full bg-[#f4f5f7] px-6 h-11 text-[#0c0d10] font-mono text-[12px] uppercase font-semibold"
                >
                  Request project
                </Link>
                <a
                  href="#domains"
                  className="inline-flex items-center justify-center rounded-full border border-[#3a3d46] px-6 h-11 text-[#f4f5f7] font-mono text-[12px] uppercase font-semibold"
                >
                  Explore domains
                </a>
              </div>
            </div>

            <div className="mt-16">
              <ProjectFeatureStage />
            </div>
          </div>

          <footer className="border-t border-[#2a2c33] pt-6 mt-12 flex justify-between items-center text-[10px] font-mono tracking-wider text-[#8b909a] select-none">
            <span>Academic services</span>
            <span>01</span>
          </footer>
        </article>

        {/* A4 SHEET 2: Services Roster & Technical Domains */}
        <article className="bg-[#0c0d10] border border-t-0 border-[#2a2c33] rounded-none p-8 md:p-16 flex flex-col justify-between">
          <div>
            <header className="mb-12 text-center select-none">
              <div className="border-t border-b border-[#2a2c33] py-3 mb-8 flex justify-between items-center text-[10px] font-mono tracking-widest text-[#8b909a] uppercase">
                <span>Deliverables</span>
                <span className="font-semibold text-[#f4f5f7]">ResumeForge AI</span>
                <span>Ref: RF-PRJ-2026</span>
              </div>
            </header>

            <div className="text-left">
              <div className="text-center mb-10">
                <span className="font-mono text-[10px] text-[#8b909a] font-semibold uppercase tracking-wider block mb-2">
                  Services
                </span>
                <h2 className="text-3xl font-normal tracking-[-0.03em] text-[#f4f5f7]" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>What we build.</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((svc) => (
                  <div
                    key={svc.title}
                    className="flex gap-4 p-6 border border-[#2a2c33] bg-[#16171b] rounded-2xl"
                  >
                    <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border border-[#2a2c33] bg-[#0c0d10]">
                      {svc.icon}
                    </div>
                    <div>
                      <h3 className="font-sans font-medium text-[#f4f5f7] text-sm tracking-tight">
                        {svc.title}
                      </h3>
                      <p className="mt-1.5 text-[#8b909a] text-[13px] leading-relaxed">
                        {svc.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id="domains" className="mt-16 text-left">
              <div className="text-center mb-10">
                <span className="font-mono text-[10px] text-[#8b909a] font-semibold uppercase tracking-wider block mb-2">
                  Domains
                </span>
                <h2 className="text-3xl font-normal tracking-[-0.03em] text-[#f4f5f7]" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>Where the work sits.</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {domains.map((dom) => (
                  <div key={dom} className="border border-[#2a2c33] bg-[#16171b] px-4 py-3 rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#d7e4f0] shrink-0" />
                    <span className="text-[13px] text-[#f4f5f7]">{dom}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <footer className="border-t border-[#2a2c33] pt-6 mt-12 flex justify-between items-center text-[10px] font-mono tracking-wider text-[#8b909a] select-none">
            <span>Deliverables</span>
            <span>02</span>
          </footer>
        </article>

        {/* A4 SHEET 3: Development Timeline & FAQs */}
        <article className="bg-[#0c0d10] border border-t-0 border-[#2a2c33] rounded-none p-8 md:p-16 flex flex-col justify-between">
          <div>
            <header className="mb-12 text-center select-none">
              <div className="border-t border-b border-[#2a2c33] py-3 mb-8 flex justify-between items-center text-[10px] font-mono tracking-widest text-[#8b909a] uppercase">
                <span>How it runs</span>
                <span className="font-semibold text-[#f4f5f7]">ResumeForge AI</span>
                <span>Ref: RF-PRJ-2026</span>
              </div>
            </header>

            <div className="text-left">
              <div className="mb-8">
                <span className="font-mono text-[10px] text-[#8b909a] font-semibold uppercase tracking-wider block mb-2">
                  Process
                </span>
                <h2 className="text-4xl font-normal tracking-[-0.03em] text-[#f4f5f7]" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>Seven steps, then the file.</h2>
              </div>
              <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)]">
                <ol className="border-y border-[#2a2c33]">
                  {timelineSteps.map((step) => (
                    <li key={step.step} className="grid grid-cols-[56px_1fr] gap-4 border-b border-[#2a2c33] py-5 last:border-b-0">
                      <span className="text-[32px] leading-none text-[#d7e4f0]" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
                        {String(step.step).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="font-sans text-base font-medium text-[#f4f5f7]">{step.title}</h3>
                        <p className="mt-1 text-[14px] leading-relaxed text-[#b4b8c2]">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="grid gap-3">
                  <img src="/project-brief.jpg" alt="" className="aspect-[4/3] w-full rounded-2xl border border-[#2a2c33] object-cover" />
                  <img src="/project-build.jpg" alt="" className="aspect-[4/3] w-full rounded-2xl border border-[#2a2c33] object-cover" />
                  <img src="/project-deliver.jpg" alt="" className="aspect-[3/4] w-full rounded-2xl border border-[#2a2c33] object-cover object-center" />
                </div>
              </div>
            </div>

            <div className="mt-16 text-left">
              <div className="text-center mb-10">
                <span className="font-mono text-[10px] text-[#8b909a] font-semibold uppercase tracking-wider block mb-2">
                  Questions
                </span>
                <h2 className="text-3xl font-normal tracking-[-0.03em] text-[#f4f5f7]" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>Before you send the brief.</h2>
              </div>
              
              <div className="space-y-3 max-w-[640px] mx-auto">
                {faqs.map((faq, index) => (
                  <Accordion key={index} title={faq.q} tone="dark">
                    <p className="text-[#b4b8c2] text-[13px] leading-relaxed">
                      {faq.a}
                    </p>
                  </Accordion>
                ))}
              </div>
            </div>
          </div>

          <footer className="border-t border-[#2a2c33] pt-6 mt-12 flex justify-between items-center text-[10px] font-mono tracking-wider text-[#8b909a] select-none">
            <span>Process</span>
            <span>03</span>
          </footer>
        </article>

      </div>

      <FooterSection locale={locale} />
    </div>
  );
}
