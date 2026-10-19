"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, FileText } from "@/components/icons";
import styles from "./CareerSteps.module.css";

const steps = [
  { label: "Build your foundation", title: "Your experience.\nA clearer story.", detail: "Bring your experience together in a resume that is easy to read, simple to edit, and ready to send.", action: "Create your resume", route: "resumes", note: "01 — THE RESUME" },
  { label: "Find your direction", title: "Less searching.\nBetter matches.", detail: "See how your experience fits a role. Find the gaps, focus your search, and tailor your resume to the opportunity.", action: "Explore matching jobs", route: "jobs", note: "02 — THE OPPORTUNITY" },
  { label: "Start the conversation", title: "Walk in with\nsomething to say.", detail: "Turn your resume and the job description into focused preparation. Work through your answers with Omni before the real conversation.", action: "Prepare with Omni", route: "omni", note: "03 — THE CONVERSATION" },
];

export default function CareerSteps({ locale }: { locale: string }) {
  const track = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 901px) and (min-height: 580px) and (prefers-reduced-motion: no-preference)");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!media.matches || !track.current) return;
      const rect = track.current.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / travel));
      setActive(Math.min(2, Math.floor(progress * 3)));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const mode = () => { setPinned(media.matches); schedule(); };
    mode();
    media.addEventListener("change", mode);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", mode);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  const selectStep = (index: number) => {
    if (!pinned || !track.current) { setActive(index); return; }
    const rect = track.current.getBoundingClientRect();
    const travel = rect.height - window.innerHeight;
    window.scrollTo({ top: window.scrollY + rect.top + travel * ((index + 0.15) / 3), behavior: "smooth" });
  };

  return (
    <section ref={track} className={`${styles.track} rf-dark`} aria-labelledby="career-steps-title">
      <div className={styles.sticky}>
        <div className={styles.frame}>
          <header className={styles.header}>
            <div><p className={styles.eyebrow}>A little momentum goes a long way</p><h2 id="career-steps-title">One journey. Three steps.</h2></div>
            <span className={styles.scrollHint}>{pinned ? "Scroll to explore" : "Choose a step"} <span aria-hidden="true">↓</span></span>
          </header>
          <div className={styles.stage}>
            <div className={styles.copy}>
              <p className={styles.eyebrow}>{steps[active].note}</p>
              <h3>{steps[active].title}</h3>
              <p className={styles.description}>{steps[active].detail}</p>
              <Link className={styles.action} href={`/${locale}/${steps[active].route}`}>{steps[active].action}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
            </div>
            <div className={styles.visual}>
              <div className={styles.windowBar}><span>RESUMEFORGE / WORKSPACE</span><span>EXAMPLE PREVIEW</span></div>
              <div key={active} className={styles.preview}>
                {active === 0 ? <div className={styles.paper}>
                  <div className={styles.paperTop}><FileText className="h-5 w-5" aria-hidden="true" /><span>YOUR NEXT CHAPTER</span></div>
                  <h4>Alex Morgan</h4><p>Frontend engineer · Builder · Problem solver</p>
                  <h5>PROFILE</h5><p>Thoughtful interfaces. Accessible experiences. Work that makes a difference.</p>
                  <h5>EXPERIENCE</h5><strong>Frontend Engineer</strong><p>Built accessible interfaces and helped a small team ship with confidence.</p>
                  <div className={styles.tags}><span>React</span><span>TypeScript</span><span>UI systems</span></div>
                  <div className={styles.paperFoot}><Check className="h-4 w-4" aria-hidden="true" /> A clear story, ready to share.</div>
                </div> : active === 1 ? <div className={styles.jobs}>
                  <p className={styles.previewLabel}>YOUR NEXT MOVE</p><h4>A shortlist with purpose.</h4>
                  {['Frontend Engineer', 'Product Engineer', 'UI Engineer'].map((role, i) => <div className={styles.job} key={role}><span className={styles.jobInitial}>{['F', 'P', 'U'][i]}</span><div><strong>{role}</strong><p>{['Product team · Remote', 'Early-stage team · Hybrid', 'Design systems · Remote'][i]}</p></div><span className={styles.match}>{['Strong fit', 'Good fit', 'Good fit'][i]}</span></div>)}
                  <p className={styles.previewNote}>Your experience gives the search a starting point.</p>
                </div> : <div className={styles.jobs}>
                  <p className={styles.previewLabel}>JOBS</p><h4>Roles matched to the resume.</h4>
                  {[["Frontend Engineer", "Northwind · Remote", "Strong fit", "F"], ["Product Engineer", "Harbor · Hybrid", "Good fit", "P"], ["UI Engineer", "Lumen · Remote", "Good fit", "U"]].map(([role, place, fit, initial]) => <div className={styles.job} key={role}><span className={styles.jobInitial}>{initial}</span><div><strong>{role}</strong><p>{place}</p></div><span className={styles.match}>{fit}</span></div>)}
                  <p className={styles.previewNote}>Ranked against your experience before you apply.</p>
                </div>}
              </div>
            </div>
          </div>
          <nav className={styles.stepNav} aria-label="Career journey steps">
            {steps.map((step, index) => <button key={step.label} type="button" onClick={() => selectStep(index)} aria-current={active === index ? "step" : undefined} className={active === index ? styles.selected : undefined}><span>0{index + 1}</span><span>{step.label}</span><ArrowRight className="h-4 w-4" aria-hidden="true" /></button>)}
          </nav>
        </div>
      </div>
    </section>
  );
}
