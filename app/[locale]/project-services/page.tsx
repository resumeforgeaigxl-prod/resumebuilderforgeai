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

export default async function ProjectServicesLandingPage({ params }: { params: { locale: string } }) {
  const { locale } = params;

  const features = [
    { title: 'Industry-Level Projects', desc: 'Get projects built with production-grade code, architecture, and documentation.', icon: <Code className="w-5 h-5" /> },
    { title: 'Expert Developers', desc: 'Work with skilled software engineers and AI/ML professionals.', icon: <Users className="w-5 h-5" /> },
    { title: 'Complete Documentation', desc: 'Receive high-quality thesis, system reports, design diagrams, and setup guides.', icon: <FileText className="w-5 h-5" /> },
    { title: 'IEEE & Research Support', desc: 'IEEE base paper selection, research gap analyses, and implementation.', icon: <Award className="w-5 h-5" /> },
    { title: 'Deployment Assistance', desc: 'Zero-configuration cloud setup on platforms like Vercel, Render, AWS, and GCP.', icon: <Server className="w-5 h-5" /> },
    { title: 'Post Delivery Support', desc: 'We provide viva preparation guides, training sessions, and continuous help.', icon: <HeartHandshake className="w-5 h-5" /> },
  ];

  const services = [
    { title: 'Major Projects', desc: 'End-to-end B.Tech/M.Tech final year projects with detailed research, execution, and documentation.', icon: <Layers className="w-6 h-6 text-[#7c3aed]" /> },
    { title: 'Minor Projects', desc: 'Focused mid-semester projects designed to master individual technology scopes.', icon: <Compass className="w-6 h-6 text-[#7c3aed]" /> },
    { title: 'Mini Projects', desc: 'Simple, fast, and high-quality lab assignments and small projects.', icon: <Award className="w-6 h-6 text-[#7c3aed]" /> },
    { title: 'AI & ML Projects', desc: 'State of the art models, datasets training, deep learning architectures, CV, and NLP solutions.', icon: <Cpu className="w-6 h-6 text-[#7c3aed]" /> },
    { title: 'Full Stack Projects', desc: 'Modern web applications developed using MERN stack, Next.js, Django, or Spring Boot.', icon: <Code className="w-6 h-6 text-[#7c3aed]" /> },
    { title: 'Mobile App Projects', desc: 'Fully responsive Android and iOS apps built with React Native or Flutter.', icon: <Smartphone className="w-6 h-6 text-[#7c3aed]" /> },
    { title: 'IEEE Projects', desc: 'Implementation of the latest IEEE transaction papers with source code validation.', icon: <FileText className="w-6 h-6 text-[#7c3aed]" /> },
    { title: 'Research Projects', desc: 'Custom project execution targeting international journals and paper submissions.', icon: <BookOpen className="w-6 h-6 text-[#7c3aed]" /> },
    { title: 'Documentation Only', desc: 'Comprehensive technical project reports, design diagrams, PPTs, and synopses.', icon: <FileText className="w-6 h-6 text-[#7c3aed]" /> },
    { title: 'Deployment Support', desc: 'Deployment of your existing source code to production servers with database sync.', icon: <Server className="w-6 h-6 text-[#7c3aed]" /> },
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
    <div className="bg-[#fafaf9] min-h-screen text-[#171717]">
      <Navbar locale={locale} />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 border-b border-[#e7e5e4] bg-white">
        <div className="mx-auto max-w-[1200px] text-center">
          <span className="font-mono text-[11px] text-[#7c3aed] font-semibold uppercase tracking-wider block mb-4">
            # academic excellence
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#171717] max-w-[850px] mx-auto leading-[1.1]">
            Build Your Final Year Project With Expert Guidance
          </h1>
          <p className="text-stone-500 mt-6 text-base md:text-lg max-w-[650px] mx-auto leading-relaxed">
            From idea to deployment, we help students build production-ready academic projects with documentation, reports, presentations, deployment, and ongoing support.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Link
              href={`/${locale}/project-services/request`}
              className="inline-flex items-center justify-center rounded-xl bg-[#7c3aed] border border-[#6d28d9] px-6 h-11 text-white transition-all duration-75 hover:bg-[#6d28d9] active:scale-95 font-mono text-[13px] uppercase font-semibold"
            >
              Request Project
            </Link>
            <a
              href="#domains"
              className="inline-flex items-center justify-center rounded-xl border border-[#EBEBEB] bg-white px-6 h-11 text-[#171717] transition-all duration-75 hover:bg-[#F2F2F2] active:scale-95 font-mono text-[13px] uppercase font-semibold"
            >
              Explore Domains
            </a>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-6 border-b border-[#e7e5e4] mx-auto max-w-[1200px]">
        <div className="text-center mb-16">
          <span className="font-mono text-[11px] text-[#7c3aed] font-semibold uppercase tracking-wider block mb-2">
            Why Choose Us
          </span>
          <h2 className="text-3xl font-bold tracking-tight">Ecosystem Highlights</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat) => (
            <div key={feat.title} className="border border-stone-200 bg-white p-6 rounded-xl hover:shadow-sm transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7c3aed]/10 text-[#7c3aed] mb-4">
                {feat.icon}
              </div>
              <h3 className="font-sans font-bold text-[#171717] text-base mb-2">{feat.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-6 border-b border-[#e7e5e4] bg-white">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center mb-16">
            <span className="font-mono text-[11px] text-[#7c3aed] font-semibold uppercase tracking-wider block mb-2">
              Our Services
            </span>
            <h2 className="text-3xl font-bold tracking-tight">Structured Deliverables</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((svc) => (
              <div key={svc.title} className="flex gap-4 p-6 border border-stone-200 rounded-xl hover:shadow-sm transition-all bg-[#fafaf9]">
                <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-stone-200">
                  {svc.icon}
                </div>
                <div>
                  <h3 className="font-sans font-bold text-[#171717] text-base mb-1">{svc.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{svc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Domains */}
      <section id="domains" className="py-20 px-6 border-b border-[#e7e5e4] mx-auto max-w-[1200px]">
        <div className="text-center mb-16">
          <span className="font-mono text-[11px] text-[#7c3aed] font-semibold uppercase tracking-wider block mb-2">
            Technical Domains
          </span>
          <h2 className="text-3xl font-bold tracking-tight">Technologies We Support</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {domains.map((dom) => (
            <div key={dom} className="border border-stone-200 bg-white px-4 py-3 rounded-lg flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#7c3aed]" />
              <span className="text-sm font-semibold text-stone-700">{dom}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-20 px-6 border-b border-[#e7e5e4] bg-white">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center mb-16">
            <span className="font-mono text-[11px] text-[#7c3aed] font-semibold uppercase tracking-wider block mb-2 text-center">
              Our Process
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-center">Workflow Execution</h2>
          </div>
          <div className="relative pl-6 border-l-2 border-[#e7e5e4] space-y-12 max-w-[700px] mx-auto">
            {timelineSteps.map((step) => (
              <div key={step.step} className="relative">
                <div className="absolute -left-[37px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#7c3aed] text-white text-[11px] font-bold font-mono">
                  {step.step}
                </div>
                <h3 className="font-sans font-bold text-base text-[#171717]">{step.title}</h3>
                <p className="text-stone-500 text-sm mt-1 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 px-6 mx-auto max-w-[800px]">
        <div className="text-center mb-16">
          <span className="font-mono text-[11px] text-[#7c3aed] font-semibold uppercase tracking-wider block mb-2">
            Have Questions?
          </span>
          <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-4 text-left">
          {faqs.map((faq, index) => (
            <Accordion key={index} title={faq.q}>
              <p className="text-stone-500 text-sm leading-relaxed">
                {faq.a}
              </p>
            </Accordion>
          ))}
        </div>
      </section>

      <FooterSection locale={locale} />
    </div>
  );
}
