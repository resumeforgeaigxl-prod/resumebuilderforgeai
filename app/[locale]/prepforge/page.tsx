import { Metadata } from 'next';
import { SEOForgePage } from '@/components/seo/SEOForgePage';

export const metadata: Metadata = {
  title: "PrepForge – TCS NQT Preparation Platform | ResumeForgeAI",
  description: "Use PrepForge to prepare for TCS NQT with logic patterns. Part of ResumeForgeAI, an AI career platform for developers.",
  keywords: "TCS NQT, TCS NQT preparation, coding practice, aptitude, reasoning, pattern-based learning",
  alternates: {
    canonical: 'https://resumeforgeai.in/en-in/prepforge',
  },
};

export default function PrepForgeSEO({ params }: { params: { locale: string } }) {
  const { locale } = params;
  return (
    <SEOForgePage
      title="PrepForge: Master TCS NQT Patterns"
      description="Prepare for TCS NQT using our specialized pattern-based learning system for Aptitude, Reasoning, and Coding."
      h1="Bridge the Gap to Your Dream Tech Career"
      schemaName="PrepForge"
      schemaDescription="TCS NQT preparation platform focused on logic patterns."
      ctaText="Start Preparing"
      ctaLink={`/${locale}/prepforge/app`}
      features={[
        "Pattern-based Aptitude & Reasoning modules",
        "Real TCS NQT coding problem sets",
        "Step-by-step logic walkthroughs",
        "Interactive code solutions with line-by-line explanation",
        "Variations for each problem to master the core logic",
        "Tailored for beginners and advanced learners"
      ]}
      content={
        <>
          <p>
            TCS NQT is one of the most competitive entry-level hiring assessments in the tech industry. To succeed, students need more than just a list of questions—they need to understand the underlying logic patterns that repeat across different problem sets. PrepForge is designed specifically to help you master these patterns.
          </p>
          <p>
            Our "Pattern-Based Learning" approach moves away from rote memorization. Instead of learning 100 different problems, we teach you the 10 core patterns that solve them all. Whether it's mathematical logic (Prime, Factorial, Armstrong) or data manipulation (Array Search, String Reversal), we break down each problem into its atomic parts.
          </p>
          <p>
            In the Aptitude and Reasoning sections, we focus on the shortcuts and logical frameworks that TCS frequently tests. We provide mental models that help you solve complex quantitative problems in seconds, ensuring you manage your time effectively during the actual exam.
          </p>
          <p>
            The Coding section is where PrepForge truly shines. For every problem, we don't just give you the source code; we provide a deep dive into the "Approach," a "Line-by-Line Explanation" of the logic, and "Variations" to test if you've truly understood the concept. This ensures that even if TCS changes the numbers or the story, you'll still know exactly how to write the solution.
          </p>
          <p>
            Consistency and clarity are our priorities. The PrepForge UI is built with a clean, dark-themed interface that reduces eye strain and keeps you focused on what matters: the logic. Join thousands of students who have already used PrepForge to secure their spot at TCS. Start your journey today and build a foundation that lasts throughout your engineering career.
          </p>
        </>
      }
    />
  );
}
