"use client";

import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import styles from "./FinalCTA.module.css";

interface FinalCTAProps {
  locale?: string;
}

const steps = [
  {
    index: "01",
    title: "Create your resume",
    detail: "ATS-ready, built from your experience.",
    href: (locale: string) => `/${locale}/resumes`,
  },
  {
    index: "02",
    title: "See matching jobs",
    detail: "Ranked against your profile before you apply.",
    href: (locale: string) => `/${locale}/jobs`,
  },
  {
    index: "03",
    title: "Ask Omni",
    detail: "Tailor the resume and prep the interview.",
    href: (locale: string) => `/${locale}/omni`,
  },
];

export default function FinalCTA({ locale = "en-in" }: FinalCTAProps) {
  return (
    <section className={`${styles.section} rf-dark`} aria-labelledby="final-cta-title">
      <div className={styles.frame}>
        <div className={styles.stage}>
          <img src="/cta-night.jpg" alt="" />
          <div className={styles.shade} />
          <div className={styles.content}>
            <div className={styles.top}>
              <div className={styles.copy}>
                <p className={styles.eyebrow}>Get started</p>
                <h2 id="final-cta-title" className={styles.headline}>
                  Your next opportunity starts with a <em>complete career platform.</em>
                </h2>
                <p className={styles.lead}>
                  Match a role, tailor the resume, and prepare for the interview in one conversation.
                </p>
              </div>
              <div className={styles.actions}>
                <Link href={`/${locale}/signup`} className={styles.primary}>
                  Get started free
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href={`/${locale}/omni`} className={styles.secondary}>
                  Try Omni
                </Link>
              </div>
            </div>
            <ol className={styles.steps}>
              {steps.map((step) => (
                <li key={step.index}>
                  <Link href={step.href(locale)} className={styles.step}>
                    <span className={styles.stepIndex}>{step.index}</span>
                    <span className={styles.stepCopy}>
                      <span className={styles.stepTitle}>{step.title}</span>
                      <span className={styles.stepDetail}>{step.detail}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
