"use client";

import Link from "next/link";

interface FooterSectionProps {
  locale?: string;
}

const columns = (locale: string) => [
  {
    title: "Product",
    links: [
      { label: "Features", href: `/${locale}#features` },
      { label: "Templates", href: `/${locale}#templates` },
      { label: "ATS Score", href: `/${locale}#ats-score` },
      { label: "Pricing", href: `/${locale}/pricing` },
    ],
  },
  {
    title: "Forges",
    links: [
      { label: "ResumeForge", href: `/${locale}/ai-resume-builder` },
      { label: "CodingForge", href: `/${locale}/codingforge` },
      { label: "InterviewForge", href: `/${locale}/interview-prep` },
      { label: "PrepForge", href: `/${locale}/prepforge` },
      { label: "LearnForge", href: `/${locale}/learnforge` },
      { label: "ProjectForge", href: `/${locale}/projectforge` },
      { label: "CareerForge", href: `/${locale}/careerforge` },
      { label: "JobForge", href: `/${locale}/jobs` },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "https://careers.growxlabs.tech/" },
      { label: "Contact", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: `/${locale}/privacy-policy` },
      { label: "Terms of Service", href: `/${locale}/terms-of-service` },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];

export default function FooterSection({ locale = "en-in" }: FooterSectionProps) {
  const footerColumns = columns(locale);

  return (
    <footer className="w-full bg-[#fafaf9] relative overflow-hidden select-none">
      <div className="max-w-[1200px] mx-auto border-x border-t border-[#e7e5e4] bg-white text-[#1c1917] pt-10 md:pt-16 pb-6 md:pb-8 px-6 md:px-20">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start pb-12 border-b border-[#e7e5e4] mb-12 gap-8 md:gap-0">
          {/* Left: Logo Block */}
          <div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#171717] flex items-center justify-center font-bold text-sm text-white select-none shrink-0">
                RF
              </div>
              <span className="text-[18px] font-bold text-[#1c1917] ml-2.5">
                ResumeForge AI
              </span>
            </div>
            <p className="text-[13px] text-[#78716c] mt-1.5 leading-normal">
              Build resumes that get interviews.
            </p>
          </div>

          {/* Right: CTA Block */}
          <div className="flex flex-col items-start md:items-end">
            <span className="text-xl font-bold text-[#1c1917] italic" style={{ fontFamily: "var(--font-display)" }}>
              Ready to forge your career?
            </span>
            <Link href={`/${locale}/ai-resume-builder`} className="mt-3.5 block">
              <button className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl px-6 py-2.5 text-[13px] font-mono font-semibold uppercase tracking-wider transition-all duration-75 cursor-pointer active:scale-95">
                Generate Resume →
              </button>
            </Link>
          </div>
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="font-mono text-[11px] tracking-[0.15em] text-[#78716c] mb-4 uppercase font-semibold select-none">
                {column.title}
              </h4>
              <ul className="space-y-1">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="block text-[13px] text-[#57534e] hover:text-[#1c1917] py-1 transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#e7e5e4] mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0 text-center md:text-left">
          <span className="text-[12px] text-[#a8a29e]">
            © 2026 ResumeForge AI
          </span>
          <span className="text-[12px] text-[#a8a29e]">
            Made for developers, designers & job seekers. Built By GrowXlabsTech
          </span>
        </div>
      </div>
    </footer>
  );
}
