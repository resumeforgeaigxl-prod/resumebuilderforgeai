"use client";

import Link from "next/link";
import styles from "./FooterSection.module.css";

interface FooterSectionProps {
  locale?: string;
  promo?: boolean;
}

type FooterLink = {
  label: string;
  href: string;
};

const columns = (locale: string): { title: string; links: FooterLink[]; wide?: boolean }[] => [
  {
    title: "Product",
    links: [
      { label: "Resume Builder", href: `/${locale}/ai-resume-builder` },
      { label: "Templates", href: `/${locale}/resumes` },
      { label: "ATS Score", href: `/${locale}/ats-live` },
      { label: "Pricing", href: `/${locale}/pricing` },
      { label: "Omni", href: `/${locale}/omni` },
    ],
  },
  {
    title: "Forges",
    wide: true,
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
      { label: "Documentation", href: `/${locale}/docs` },
      { label: "Blog", href: `/${locale}/blogs` },
      { label: "Project Services", href: `/${locale}/project-services` },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Careers", href: "https://careers.growxlabs.tech/" },
      { label: "Support", href: "mailto:support@resumeforgeai.in" },
      { label: "GrowXLabs", href: "https://growxlabs.tech" },
    ],
  },
];

const legal = (locale: string): FooterLink[] => [
  { label: "Privacy", href: `/${locale}/privacy-policy` },
  { label: "Terms", href: `/${locale}/terms-of-service` },
  { label: "Cookies", href: `/${locale}/cookie-policy` },
];

function FooterAnchor({ link, className }: { link: FooterLink; className: string }) {
  const newTab = link.href.startsWith("http");
  return (
    <Link
      href={link.href}
      className={className}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
    >
      {link.label}
    </Link>
  );
}

export default function FooterSection({ locale = "en-in", promo = true }: FooterSectionProps) {
  const footerColumns = columns(locale);

  return (
    <footer className={`${styles.footer} rf-dark`}>
      <div className={styles.frame}>
        {promo && (
          <div className={styles.promo}>
            <p className={styles.promoText}>Ready to forge your career?</p>
            <Link href={`/${locale}/resumes`} className={styles.promoAction}>
              Generate resume
            </Link>
          </div>
        )}

        <div className={styles.main}>
          <div className={styles.brand}>
            <Link href={`/${locale}`} className={styles.logo}>
              <span className={styles.mark} aria-hidden="true">RF</span>
              <span className={styles.wordmark}>ResumeForge AI</span>
            </Link>
            <p className={styles.tagline}>Build resumes that get interviews.</p>
            <p className={styles.blurb}>
              Resumes, job matches, and interview prep in one place.
            </p>
          </div>

          <nav className={styles.columns} aria-label="Footer">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className={styles.heading}>{column.title}</h2>
                <ul className={column.wide ? styles.wideList : styles.list}>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <FooterAnchor link={link} className={styles.link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </div>
      <p className={styles.giant}>RESUMEFORGEAI</p>
      <div className={styles.base}>
        <div className={styles.bottom}>
          <p className={styles.copy}>© 2026 ResumeForge AI</p>
          <ul className={styles.legal}>
            {legal(locale).map((link) => (
              <li key={link.label}>
                <FooterAnchor link={link} className={styles.legalLink} />
              </li>
            ))}
          </ul>
          <p className={styles.credit}>
            Built by{" "}
            <a href="https://growxlabs.tech" target="_blank" rel="noopener noreferrer">
              GrowXLabs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
