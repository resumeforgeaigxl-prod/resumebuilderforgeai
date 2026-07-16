"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, FileText, Layout, Zap } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  locale?: string;
}

export default function Navbar({ locale = "en-in" }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 10);
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const staticLinks = [
    { label: "Project Services", href: `/${locale}/project-services` },
    { label: "Blog", href: `/${locale}/blogs` },
    { label: "Pricing", href: `/${locale}/pricing` },
  ];

  const mobileLinks = [
    { label: "Resume Builder", href: `/${locale}/resumes` },
    { label: "Resume Templates", href: `/${locale}#templates` },
    { label: "ATS Scanner", href: `/${locale}#ats-score` },
    { label: "Project Services", href: `/${locale}/project-services` },
    { label: "Blog", href: `/${locale}/blogs` },
    { label: "Pricing", href: `/${locale}/pricing` },
  ];

  const dropdownItems = [
    {
      id: 0,
      label: "Resume Builder",
      desc: "ATS-optimized resume generation",
      href: `/${locale}/resumes`,
      icon: FileText,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      id: 1,
      label: "Resume Templates",
      desc: "Browse curated design systems",
      href: `/${locale}#templates`,
      icon: Layout,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      id: 2,
      label: "ATS Scanner",
      desc: "Calibrate and check score instantly",
      href: `/${locale}#ats-score`,
      icon: Zap,
      color: "text-pink-600 bg-pink-50 border-pink-100",
    }
  ];

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 w-full bg-[#fafaf9]"
    >
      <nav
        className={`mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 border-x border-[#e7e5e4] transition-all duration-300 ${
          scrolled
            ? "bg-[#FAFAFA]/80 backdrop-blur-md border-b border-[#e7e5e4]"
            : "bg-[#FAFAFA] border-b border-transparent"
        }`}
      >
        {/* ── Logo ── */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2.5 select-none"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171717]">
            <span
              className="text-white"
              style={{
                fontFamily: "var(--font-geist-sans)",
                fontSize: "12px",
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              RF
            </span>
          </div>
          <span
            className="text-[#171717]"
            style={{
              fontFamily: "var(--font-geist-sans)",
              fontSize: "14px",
              fontWeight: 600,
              lineHeight: "20px",
              letterSpacing: "-0.02em",
            }}
          >
            ResumeForge AI
          </span>
        </Link>

        {/* ── Center links (desktop dropdown + static links) ── */}
        <ul className="hidden md:flex items-center gap-8 text-[#171717]">
          <li 
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              className="flex items-center gap-1 text-[#4D4D4D] transition-colors duration-200 hover:text-[#171717] font-mono text-[13px] uppercase font-semibold tracking-[0.04em] h-16 focus:outline-none"
            >
              Resume <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#171717] transition-transform duration-200" />
            </button>
            
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-14 left-1/2 -translate-x-1/2 w-[620px] bg-white border border-[#EBEBEB] rounded-2xl shadow-xl z-50 text-left overflow-hidden grid grid-cols-12"
                >
                  {/* Left Column - Options Stack */}
                  <div className="col-span-6 flex flex-col divide-y divide-[#EBEBEB] border-b border-[#EBEBEB]">
                    {dropdownItems.map((item) => {
                      const Icon = item.icon;
                      const isSelected = activeTab === item.id;
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          onMouseEnter={() => setActiveTab(item.id)}
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-start gap-4 p-5 transition-all duration-200 ${
                            isSelected ? "bg-stone-50" : "bg-white hover:bg-stone-50/50"
                          }`}
                        >
                          <div className={`p-2.5 rounded-lg border ${item.color} shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[12px] font-sans font-bold uppercase tracking-wider text-[#171717]">
                              {item.label}
                            </span>
                            <span className="block text-[10px] font-sans text-stone-400 font-medium mt-1 leading-normal">
                              {item.desc}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Right Column - Premium Visual Preview Panel with Custom Background */}
                  <div 
                    className="col-span-6 border-l border-[#EBEBEB] p-5 flex flex-col justify-start select-none relative overflow-hidden h-full min-h-[220px] bg-cover bg-center"
                    style={{ backgroundImage: "url('/resume_forge_pixel_bg.png')" }}
                  >
                    {/* Window Controls with Frosted Glass Header */}
                    <div className="flex items-center gap-1.5 pb-3 mb-3 border-b border-stone-200/50 w-full shrink-0 bg-white/70 backdrop-blur-md -mx-5 -mt-5 px-5 py-3 rounded-tr-2xl">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                      <span className="text-[9px] font-mono text-stone-500 ml-2 font-bold">resume_workspace.app</span>
                    </div>

                    <div className="flex-1 w-full flex flex-col justify-center">
                      <AnimatePresence mode="wait">
                        {activeTab === 0 && (
                          <motion.div
                            key="builder"
                            initial={{ opacity: 0, scale: 0.96, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: -5 }}
                            transition={{ duration: 0.12 }}
                            className="w-full flex flex-col justify-center"
                          >
                            <div className="bg-white border border-[#EBEBEB] rounded-xl p-3 shadow-sm w-full space-y-3">
                              <div className="flex justify-between items-center bg-stone-50 border border-stone-100 p-2 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                  <span className="text-[10px] font-sans font-bold text-[#171717]">Full Stack Engineer Resume</span>
                                </div>
                                <span className="text-[8px] font-mono text-stone-400 uppercase">92% Match</span>
                              </div>
                              
                              <div className="space-y-2 p-1">
                                <div className="flex justify-between text-[9px] font-sans text-stone-500 font-bold border-b border-stone-100 pb-1">
                                  <span>WORK EXPERIENCE</span>
                                  <span className="text-[8px] font-mono text-emerald-600 uppercase font-extrabold bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded">ATS Calibrated</span>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[9px] font-sans text-[#171717] font-semibold">
                                    <span>Senior Engineer — ResumeForge</span>
                                    <span className="text-stone-400 font-normal">2024 - Pres.</span>
                                  </div>
                                  <p className="text-[8px] font-sans text-stone-400 leading-normal">
                                    • Spearheaded AI parser reducing latency by 35% with Next.js structures.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === 1 && (
                          <motion.div
                            key="templates"
                            initial={{ opacity: 0, scale: 0.96, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: -5 }}
                            transition={{ duration: 0.12 }}
                            className="w-full flex flex-col justify-center"
                          >
                            <div className="space-y-2.5 text-left w-full">
                              <span className="text-[9px] font-mono font-bold text-stone-600 uppercase tracking-wider block bg-white/40 backdrop-blur-sm py-0.5 px-1.5 rounded w-max border border-stone-200/20">Active Style Guides</span>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { name: "Minimalist Grid", desc: "For Tech & Product Roles", active: true },
                                  { name: "Serif Editorial", desc: "For Creative & Media", active: false },
                                  { name: "Sleek Executive", desc: "For Finance & Leaders", active: false },
                                  { name: "Developer Mono", desc: "For Backend Engineers", active: false }
                                ].map((tpl) => (
                                  <div 
                                    key={tpl.name}
                                    className={`p-2.5 rounded-lg border text-left transition-colors duration-150 shadow-sm ${
                                      tpl.active 
                                        ? "border-blue-500 bg-white text-[#171717]" 
                                        : "border-stone-200 bg-white/95 text-stone-400"
                                    }`}
                                  >
                                    <div className="text-[9px] font-sans font-bold">{tpl.name}</div>
                                    <div className="text-[8px] font-sans text-stone-400 font-medium mt-0.5">{tpl.desc}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {activeTab === 2 && (
                          <motion.div
                            key="scanner"
                            initial={{ opacity: 0, scale: 0.96, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: -5 }}
                            transition={{ duration: 0.12 }}
                            className="w-full flex flex-col justify-center"
                          >
                            <div className="bg-white border border-[#EBEBEB] rounded-xl p-3 shadow-sm w-full space-y-3">
                              <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                                <span className="text-[9px] font-mono font-bold text-stone-400 uppercase">ATS Compatibility Report</span>
                                <span className="text-[8px] font-bold text-pink-600 bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-full">Feasibility OK</span>
                              </div>
                              <div className="flex gap-4 items-center">
                                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                                  <svg width="48" height="48" viewBox="0 0 48 48" className="-rotate-90">
                                    <circle cx="24" cy="24" r="20" fill="none" stroke="#F2F2F2" strokeWidth="3" />
                                    <circle cx="24" cy="24" r="20" fill="none" stroke="#ec4899" strokeWidth="3" strokeDasharray="125" strokeDashoffset="18" />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[12px] font-mono font-black text-[#171717]">94%</span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-[10px] font-sans font-black text-emerald-600 flex items-center gap-1">
                                    ✓ Perfect Keyword Density
                                  </div>
                                  <p className="text-[8px] font-sans text-stone-400 leading-normal">
                                    Your profile successfully matched 18 out of 20 critical target job description keywords.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>

          {staticLinks.map(({ label, href }) => (
            <li key={label}>
              <Link
                href={href}
                className="text-[#4D4D4D] transition-colors duration-200 hover:text-[#171717] font-mono text-[13px] uppercase font-semibold tracking-[0.04em]"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* ── Right actions (desktop) ── */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href={`/${locale}/signup`}
            className="inline-flex items-center justify-center rounded-xl border border-[#EBEBEB] bg-white px-3 h-9 text-[#171717] transition-all duration-75 hover:bg-[#F2F2F2] active:scale-95 font-mono text-[13px] uppercase font-semibold"
            style={{
              fontFamily: "monospace",
              letterSpacing: "0.04em",
              lineHeight: "20px",
            }}
          >
            Sign In
          </Link>
          <Link
            href={`/${locale}/resumes`}
            className="inline-flex items-center justify-center rounded-xl bg-[#7c3aed] border border-[#6d28d9] px-5 h-10 text-white transition-all duration-75 hover:bg-[#6d28d9] active:scale-95 font-mono text-[13px] uppercase font-semibold"
            style={{
              fontFamily: "monospace",
              letterSpacing: "0.04em",
              lineHeight: "20px",
            }}
          >
            Generate Resume
          </Link>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden inline-flex items-center justify-center rounded-[6px] border border-[#EBEBEB] bg-white h-9 w-9 text-[#171717] transition-colors duration-200 hover:bg-[#F2F2F2]"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </button>
      </nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden border-b border-[#EBEBEB] bg-[#FAFAFA]"
          >
            <div className="mx-auto max-w-[1200px] px-6 py-6 flex flex-col gap-4">
              {mobileLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="text-[#4D4D4D] transition-colors duration-200 hover:text-[#171717] font-mono py-1 text-[13px] uppercase font-semibold tracking-[0.04em]"
                >
                  {label}
                </Link>
              ))}

              <div className="flex flex-col gap-3 pt-4 border-t border-[#EBEBEB]">
                <Link
                  href={`/${locale}/signup`}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-[#EBEBEB] bg-white px-3 h-9 text-[#171717] transition-all duration-75 hover:bg-[#F2F2F2] active:scale-95 font-mono text-[13px] uppercase font-semibold"
                  style={{
                    fontFamily: "monospace",
                    letterSpacing: "0.04em",
                    lineHeight: "20px",
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href={`/${locale}/resumes`}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl bg-[#7c3aed] border border-[#6d28d9] px-5 h-10 text-white transition-all duration-75 hover:bg-[#6d28d9] active:scale-95 font-mono text-[13px] uppercase font-semibold"
                  style={{
                    fontFamily: "monospace",
                    letterSpacing: "0.04em",
                    lineHeight: "20px",
                  }}
                >
                  Generate Resume
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
