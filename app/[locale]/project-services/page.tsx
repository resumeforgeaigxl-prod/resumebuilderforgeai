export const dynamic = 'force-dynamic';
import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing-v2/Navbar';
import FooterSection from '@/components/landing-v2/FooterSection';
import { 
  Code, Cpu, FileText, Server, Smartphone, BookOpen, Layers, CheckCircle2, 
  HelpCircle, ChevronDown, Award, Users, ShieldCheck, HeartHandshake, Compass, Workflow
} from 'lucide-react';
import { Accordion } from '@/components/ui/Accordion';
import { Playfair_Display, Lora } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'] });
const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

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

  const features = [
    { title: 'Industry-Level Projects', desc: 'Get projects built with production-grade code, architecture, and documentation.', icon: <Code className="w-4.5 h-4.5" /> },
    { title: 'Expert Developers', desc: 'Work with skilled software engineers and AI/ML professionals.', icon: <Users className="w-4.5 h-4.5" /> },
    { title: 'Complete Documentation', desc: 'Receive high-quality thesis, system reports, design diagrams, and setup guides.', icon: <FileText className="w-4.5 h-4.5" /> },
    { title: 'IEEE & Research Support', desc: 'IEEE base paper selection, research gap analyses, and implementation.', icon: <Award className="w-4.5 h-4.5" /> },
    { title: 'Deployment Assistance', desc: 'Zero-configuration cloud setup on platforms like Vercel, Render, AWS, and GCP.', icon: <Server className="w-4.5 h-4.5" /> },
    { title: 'Post Delivery Support', desc: 'We provide viva preparation guides, training sessions, and continuous help.', icon: <HeartHandshake className="w-4.5 h-4.5" /> },
  ];

  const services = [
    { title: 'Major Projects', desc: 'End-to-end B.Tech/M.Tech final year projects with detailed research, execution, and documentation.', icon: <Layers className="w-5 h-5 text-[#7c3aed]" /> },
    { title: 'Minor Projects', desc: 'Focused mid-semester projects designed to master individual technology scopes.', icon: <Compass className="w-5 h-5 text-[#7c3aed]" /> },
    { title: 'Mini Projects', desc: 'Simple, fast, and high-quality lab assignments and small projects.', icon: <Award className="w-5 h-5 text-[#7c3aed]" /> },
    { title: 'AI & ML Projects', desc: 'State of the art models, datasets training, deep learning architectures, CV, and NLP solutions.', icon: <Cpu className="w-5 h-5 text-[#7c3aed]" /> },
    { title: 'Full Stack Projects', desc: 'Modern web applications developed using MERN stack, Next.js, Django, or Spring Boot.', icon: <Code className="w-5 h-5 text-[#7c3aed]" /> },
    { title: 'Mobile App Projects', desc: 'Fully responsive Android and iOS apps built with React Native or Flutter.', icon: <Smartphone className="w-5 h-5 text-[#7c3aed]" /> },
    { title: 'IEEE Projects', desc: 'Implementation of the latest IEEE transaction papers with source code validation.', icon: <FileText className="w-5 h-5 text-[#7c3aed]" /> },
    { title: 'Research Projects', desc: 'Custom project execution targeting international journals and paper submissions.', icon: <BookOpen className="w-5 h-5 text-[#7c3aed]" /> },
    { title: 'Documentation Only', desc: 'Comprehensive technical project reports, design diagrams, PPTs, and synopses.', icon: <FileText className="w-5 h-5 text-[#7c3aed]" /> },
    { title: 'Deployment Support', desc: 'Deployment of your existing source code to production servers with database sync.', icon: <Server className="w-5 h-5 text-[#7c3aed]" /> },
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
    <div className="bg-[#fafaf9] min-h-screen text-[#171717] relative overflow-x-hidden">
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
                  fill="#7c3aed" 
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
                  fill="#7c3aed" 
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
      <div className="max-w-[1200px] mx-auto px-4 md:px-0 pt-28 pb-12 space-y-16 relative z-10">
        
        {/* A4 SHEET 1: Proposal Cover & Value Proposition */}
        <article className={`${lora.className} relative overflow-hidden bg-white border border-[#E2E8F0] rounded-none p-8 md:p-16 shadow-[0_8px_30px_rgba(0,0,0,0.03)] min-h-[1130px] flex flex-col justify-between`}>
          <div>
            {/* Header Block */}
            <header className="mb-12 text-center select-none">
              <div className="border-t-2 border-b border-neutral-900 py-3 mb-8 flex justify-between items-center text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                <span>Academic Services</span>
                <span className="font-bold text-neutral-900">ResumeForge AI</span>
                <span>Ref: RF-PRJ-2026</span>
              </div>
            </header>

            {/* Hero Section */}
            <div className="text-center py-6">
              <span className="font-mono text-[11px] text-[#7c3aed] font-semibold uppercase tracking-wider block mb-4">
                # ACADEMIC EXCELLENCE
              </span>
              <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold tracking-tight text-[#171717] leading-[1.15] max-w-[700px] mx-auto`}>
                Build Your Final Year Project With Expert Guidance
              </h1>
              <p className="text-stone-500 mt-6 text-sm md:text-base max-w-[580px] mx-auto leading-relaxed">
                From idea to deployment, we help students build production-ready academic projects with documentation, reports, presentations, deployment, and ongoing support.
              </p>
              <div className="flex justify-center gap-4 mt-8">
                <Link
                  href={`/${locale}/project-services/request`}
                  className="inline-flex items-center justify-center rounded-xl bg-[#7c3aed] border border-[#6d28d9] px-6 h-11 text-white transition-all duration-75 hover:bg-[#6d28d9] active:scale-95 font-mono text-[12px] uppercase font-semibold shadow-sm"
                >
                  Request Project
                </Link>
                <a
                  href="#domains"
                  className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white px-6 h-11 text-[#171717] transition-all duration-75 hover:bg-[#F2F2F2] active:scale-95 font-mono text-[12px] uppercase font-semibold shadow-sm"
                >
                  Explore Domains
                </a>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="mt-16">

              <div className="text-center mb-10">
                <span className="font-mono text-[10px] text-[#7c3aed] font-semibold uppercase tracking-wider block mb-1">
                  Why Choose Us
                </span>
                <h2 className={`${playfair.className} text-2xl font-bold tracking-tight text-neutral-800`}>Ecosystem Highlights</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {features.map((feat) => (
                  <div 
                    key={feat.title} 
                    className="group relative border border-stone-200/80 bg-[#fafafa]/50 p-6 rounded-xl hover:bg-white hover:border-stone-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 transition-all duration-300 text-left overflow-hidden select-none"
                  >
                    {/* Top border accent line on hover */}
                    <div className="absolute top-0 left-6 right-6 h-[2px] bg-[#7c3aed]/60 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    
                    {/* Premium Layered Icon Container */}
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-stone-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] group-hover:border-[#7c3aed]/30 group-hover:shadow-[0_2px_8px_rgba(124,58,237,0.04)] transition-all duration-300 text-stone-600 group-hover:text-[#7c3aed] mb-5">
                      <div className="absolute inset-0 bg-[#7c3aed]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                      <div className="relative group-hover:scale-105 transition-transform duration-300">
                        {feat.icon}
                      </div>
                    </div>

                    {/* Content Block */}
                    <div className="space-y-2">
                      <h3 className="font-sans font-semibold text-stone-900 text-sm tracking-tight">
                        {feat.title}
                      </h3>
                      <p className="text-stone-500 text-xs leading-relaxed font-normal">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer block */}
          <footer className="border-t border-neutral-100 pt-6 mt-12 flex justify-between items-center text-[9px] font-mono tracking-wider text-neutral-400 select-none">
            <span>CONFIDENTIAL • FOR ACADEMIC INTERNAL USE</span>
            <span>PAGE 1 OF 3</span>
          </footer>
        </article>

        {/* A4 SHEET 2: Services Roster & Technical Domains */}
        <article className={`${lora.className} bg-white border border-[#E2E8F0] rounded-none p-8 md:p-16 shadow-[0_8px_30px_rgba(0,0,0,0.03)] min-h-[1130px] flex flex-col justify-between`}>
          <div>
            {/* Header Block */}
            <header className="mb-12 text-center select-none">
              <div className="border-t-2 border-b border-neutral-900 py-3 mb-8 flex justify-between items-center text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                <span>Deliverables & Technology</span>
                <span className="font-bold text-neutral-900">ResumeForge AI</span>
                <span>Ref: RF-PRJ-2026</span>
              </div>
            </header>

            {/* Services Grid */}
            <div className="text-left">
              <div className="text-center mb-10">
                <span className="font-mono text-[10px] text-[#7c3aed] font-semibold uppercase tracking-wider block mb-1">
                  Our Services
                </span>
                <h2 className={`${playfair.className} text-2xl font-bold tracking-tight text-neutral-800`}>Structured Deliverables</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((svc) => (
                  <div 
                    key={svc.title} 
                    className="group relative flex gap-5 p-6 border border-stone-200/80 bg-[#fafafa]/50 rounded-xl hover:bg-white hover:border-stone-300 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden select-none"
                  >
                    {/* Top border accent line on hover */}
                    <div className="absolute top-0 left-6 right-6 h-[2px] bg-[#7c3aed]/60 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    
                    {/* Premium Layered Icon Container */}
                    <div className="shrink-0 relative flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-stone-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] group-hover:border-[#7c3aed]/30 group-hover:shadow-[0_2px_8px_rgba(124,58,237,0.04)] transition-all duration-300 text-stone-600 group-hover:text-[#7c3aed]">
                      <div className="absolute inset-0 bg-[#7c3aed]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                      <div className="relative group-hover:scale-105 transition-transform duration-300">
                        {svc.icon}
                      </div>
                    </div>

                    {/* Content Block */}
                    <div className="space-y-1.5">
                      <h3 className="font-sans font-semibold text-stone-900 text-sm tracking-tight">
                        {svc.title}
                      </h3>
                      <p className="text-stone-500 text-xs leading-relaxed font-normal">
                        {svc.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Domains */}
            <div id="domains" className="mt-16 text-left">
              <div className="text-center mb-10">
                <span className="font-mono text-[10px] text-[#7c3aed] font-semibold uppercase tracking-wider block mb-1">
                  Technical Domains
                </span>
                <h2 className={`${playfair.className} text-2xl font-bold tracking-tight text-neutral-800`}>Technologies We Support</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                {domains.map((dom) => (
                  <div key={dom} className="border border-stone-200 bg-white px-4 py-2.5 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#7c3aed]" />
                    <span className="text-[11px] font-semibold text-stone-700">{dom}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer block */}
          <footer className="border-t border-neutral-100 pt-6 mt-12 flex justify-between items-center text-[9px] font-mono tracking-wider text-neutral-400 select-none">
            <span>CONFIDENTIAL • FOR ACADEMIC INTERNAL USE</span>
            <span>PAGE 2 OF 3</span>
          </footer>
        </article>

        {/* A4 SHEET 3: Development Timeline & FAQs */}
        <article className={`${lora.className} bg-white border border-[#E2E8F0] rounded-none p-8 md:p-16 shadow-[0_8px_30px_rgba(0,0,0,0.03)] min-h-[1130px] flex flex-col justify-between`}>
          <div>
            {/* Header Block */}
            <header className="mb-12 text-center select-none">
              <div className="border-t-2 border-b border-neutral-900 py-3 mb-8 flex justify-between items-center text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                <span>Workflow & FAQ</span>
                <span className="font-bold text-neutral-900">ResumeForge AI</span>
                <span>Ref: RF-PRJ-2026</span>
              </div>
            </header>

            {/* Process Timeline */}
            <div className="text-left">
              <div className="text-center mb-10">
                <span className="font-mono text-[10px] text-[#7c3aed] font-semibold uppercase tracking-wider block mb-1">
                  Our Process
                </span>
                <h2 className={`${playfair.className} text-2xl font-bold tracking-tight text-neutral-800`}>Workflow Execution</h2>
              </div>
              <div className="relative pl-6 border-l border-stone-200 space-y-8 max-w-[650px] mx-auto">
                {timelineSteps.map((step) => (
                  <div key={step.step} className="relative">
                    <div className="absolute -left-[35px] top-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#7c3aed] text-white text-[9px] font-bold font-mono">
                      {step.step}
                    </div>
                    <h3 className="font-sans font-bold text-xs text-[#171717]">{step.title}</h3>
                    <p className="text-stone-500 text-xs mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-16 text-left">
              <div className="text-center mb-10">
                <span className="font-mono text-[10px] text-[#7c3aed] font-semibold uppercase tracking-wider block mb-1">
                  Have Questions?
                </span>
                <h2 className={`${playfair.className} text-2xl font-bold tracking-tight text-neutral-800`}>Frequently Asked Questions</h2>
              </div>
              
              <div className="space-y-4 max-w-[650px] mx-auto">
                {faqs.map((faq, index) => (
                  <Accordion key={index} title={faq.q}>
                    <p className="text-stone-500 text-xs leading-relaxed">
                      {faq.a}
                    </p>
                  </Accordion>
                ))}
              </div>
            </div>
          </div>

          {/* Footer block */}
          <footer className="border-t border-neutral-100 pt-6 mt-12 flex justify-between items-center text-[9px] font-mono tracking-wider text-neutral-400 select-none">
            <span>CONFIDENTIAL • FOR ACADEMIC INTERNAL USE</span>
            <span>PAGE 3 OF 3</span>
          </footer>
        </article>

      </div>

      <FooterSection locale={locale} />
    </div>
  );
}
