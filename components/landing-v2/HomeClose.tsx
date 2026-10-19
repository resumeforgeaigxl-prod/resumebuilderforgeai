"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "@/components/icons";
import styles from "./HomeClose.module.css";

const reviews: { name: string; photo: string; topic: string; quote: string; wide?: boolean }[] = [
  {
    name: "Ananya Iyer",
    photo: "/reviews/1.jpg",
    topic: "Resume",
    quote: "It stayed one page. I sent that file and left the spacing alone.",
    wide: true,
  },
  {
    name: "Arjun Mehta",
    photo: "/reviews/2.jpg",
    topic: "Jobs",
    quote: "The roles were already sorted against my resume, so I knew which ones to open.",
  },
  {
    name: "Meera Krishnan",
    photo: "/reviews/3.jpg",
    topic: "Interview",
    quote: "The practice questions were about my resume. That was the useful part.",
    wide: true,
  },
  {
    name: "James Calder",
    photo: "/reviews/4.jpg",
    topic: "Resume",
    quote: "The PDF was the file I sent. I did not rebuild the layout.",
  },
  {
    name: "Rohan Deshmukh",
    photo: "/reviews/5.jpg",
    topic: "Jobs",
    quote: "I could see the fit before I opened the posting.",
    wide: true,
  },
  {
    name: "Elena Marsh",
    photo: "/reviews/6.jpg",
    topic: "Interview",
    quote: "The questions followed my resume, not a generic list.",
  },
];

function cardPose(index: number, progress: number) {
  const delta = index - progress;
  const x = delta * 520;
  const tilt = delta < 0 ? Math.min(54, -delta * 40) : 0;
  return {
    transform: `translate3d(calc(-50% + ${x}px), -50%, 0) rotateX(${tilt}deg)`,
    zIndex: Math.round(40 - Math.abs(delta) * 8),
    opacity: Math.abs(delta) > 2.35 ? 0 : 1,
  };
}

const faqs = [
  {
    q: "Is there a free plan?",
    a: "Yes. You can write a resume, run a basic ATS check, and download the PDF. Paid plans take our mark off the file and open jobs, interviews, and practice.",
  },
  {
    q: "What does the ATS check do?",
    a: "It reads the resume the way a screen does, then shows the lines to change before you send it.",
  },
  {
    q: "Can I tailor a resume to one role?",
    a: "Yes. Your experience stays. The lines follow that posting. Omni can do this in the same conversation.",
  },
  {
    q: "What is Omni?",
    a: "One conversation to match a role, tailor the resume, and prepare for the interview.",
  },
  {
    q: "How long do paid plans last?",
    a: "Daily is one day. Weekly is seven days. Monthly is a month. Professional is the monthly plan with more room, and a person can review the resume.",
  },
  {
    q: "Do interviews live in a separate tool?",
    a: "No. Interview prep sits next to the resume and the jobs, in the same account.",
  },
];

export function ReviewsSection() {
  const track = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 801px) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const allowed = media.matches;
      setMotion(allowed);
      if (!allowed || !track.current) return;
      const rect = track.current.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const next = Math.max(0, Math.min(1, -rect.top / travel)) * (reviews.length - 1);
      setProgress(next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    media.addEventListener("change", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", schedule);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <section ref={track} className={`${styles.reviews} rf-dark`} aria-labelledby="reviews-title">
      <div className={styles.reelSticky}>
        <header className={styles.reviewHeading}>
          <div>
            <p className={styles.eyebrow}>Community notes</p>
            <h2 id="reviews-title" className={styles.headline}>In their own words.</h2>
          </div>
          <p className={styles.reviewIntro}>Scroll through the notes.</p>
        </header>
        <div className={styles.stage}>
          {reviews.map((review, index) => (
            <article
              key={`${review.topic}-${index}`}
              className={review.wide ? styles.wideCard : styles.squareCard}
              style={motion ? cardPose(index, progress) : undefined}
            >
              <div className={styles.cardCopy}>
                <p className={styles.cardName}>{review.name}</p>
                <p className={styles.cardTopic}>{review.topic}</p>
                <blockquote>“{review.quote}”</blockquote>
              </div>
              <img className={styles.portrait} src={review.photo} alt="" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  const [open, setOpen] = useState(0);

  return (
    <section className={`${styles.faqs} rf-dark`} aria-labelledby="faq-title">
      <div className={styles.faqLayout}>
      <div className={`${styles.frame} ${styles.faqHead}`}>
        <p className={styles.eyebrow}>FAQs</p>
        <h2 id="faq-title" className={styles.headline}>
          Questions, answered.
        </h2>
        <p className={styles.faqIntro}>A few things to know before you get started.</p>
      </div>
      <div className={styles.list}>
        {faqs.map((faq, index) => {
          const isOpen = open === index;
          return (
            <div key={faq.q} className={styles.item} data-open={isOpen}>
              <div className={styles.inner}>
                <h3 className={styles.questionHeading}>
                <button
                  type="button"
                  className={styles.question}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                  onClick={() => setOpen(isOpen ? -1 : index)}
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={isOpen ? styles.chevronOpen : styles.chevron} aria-hidden="true" />
                </button>
                </h3>
                <div id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} hidden={!isOpen}>
                  <p className={styles.answer}>{faq.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </section>
  );
}
