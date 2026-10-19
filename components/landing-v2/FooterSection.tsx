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

const links = (locale: string): FooterLink[] => [
  { label: "Resumes", href: `/${locale}/resumes` },
  { label: "Jobs", href: `/${locale}/jobs` },
  { label: "Omni", href: `/${locale}/omni` },
  { label: "Pricing", href: `/${locale}/pricing` },
  { label: "Blog", href: `/${locale}/blogs` },
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

        <nav className={styles.links} aria-label="Footer">
          {links(locale).map((link) => (
            <FooterAnchor key={link.label} link={link} className={styles.link} />
          ))}
        </nav>
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
