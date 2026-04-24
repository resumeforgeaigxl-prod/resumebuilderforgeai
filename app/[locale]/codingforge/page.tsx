export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { SEOForgePage } from '@/components/seo/SEOForgePage';

export const metadata: Metadata = {
  title: "CodingForge – AI Coding Practice Platform | ResumeForgeAI",
  description: "Use CodingForge to practice AI coding practice platform focused on real interview problems. Part of ResumeForgeAI, an AI career platform for developers.",
  keywords: "tech jobs, resume builder, coding practice, interview prep, programming",
  alternates: {
    canonical: 'https://resumeforgeai.in/en-in/codingforge',
  },
};

export default function CodingForgeSEO({ params }: { params: { locale: string } }) {
  const { locale } = params;
  return (
    <SEOForgePage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Practice Coding with AI Insights"
      schemaName="CodingForge"
      schemaDescription="AI coding practice platform focused on real interview problems."
      ctaText="Practice Coding"
      ctaLink={`/${locale}/codingforge/app`}
      features={[
        "Interactive code editor with AI feedback",
        "Real-world technical problem sets",
        "Instant code quality and efficiency analysis",
        "Hints and solutions as you type",
        "Support for multiple popular programming languages",
        "Detailed performance tracking over time"
      ]}
      content={
        <>
          <p>
            Mastering technical skills is an iterative process that requires both time and high-quality feedback. Our interactive coding platform is built for developers who want to improve their problem-solving abilities without the confusion of generic tutorials. We provide a space where you can tackle complex challenges and receive immediate, actionable insights from our AI engine.
          </p>
          <p>
            Each session is an opportunity to learn. Our tool doesn't just check if your code runs; it analyzes the logic and structure, suggesting better ways to achieve the same result. This deep level of feedback helps you understand not just how to solve a problem, but why a particular approach is more efficient or maintainable in a real-world environment.
          </p>
          <p>
            We've designed our challenges to mirror the types of problems you'll encounter in actual engineering environments and technical interviews. From data structures and algorithms to systems logic, our collection covers the essential concepts that every developer needs to master. Each challenge also includes hints to guide you when you're stuck, ensuring that you keep moving forward without getting frustrated.
          </p>
          <p>
            By practicing in our environment, you build more than just technical proficiency. You build the confidence needed to tackle difficult problems under pressure. It's about developing the problem-solving mindset that recruiters and engineering managers are looking for. Whether you're preparing for a job interview or just want to keep your skills sharp, our AI-supported coding forge gives you the tools to excel.
          </p>
          <p>
            The editor is built to be intuitive and powerful, supporting a wide range of popular programming languages and frameworks. We also provide detailed performance tracking, so you can see exactly how your skills have evolved over time. This data-driven approach allows you to identify your strengths and focus your practice on the areas where you need the most improvement.
          </p>
          <p>
            Finally, we believe that technical practice should be as engaging as it is effective. By combining real-world problems with advanced AI feedback, we've created a platform that makes hard work both rewarding and productive. Join our community today and start building the technical skills that will drive your career forward.
          </p>
        </>
      }
    />
  );
}
