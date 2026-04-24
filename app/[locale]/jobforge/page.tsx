export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { SEOForgePage } from '@/components/seo/SEOForgePage';

export const metadata: Metadata = {
  title: "JobForge – AI Job Discovery Platform | ResumeForgeAI",
  description: "Use JobForge to find tech jobs. Part of ResumeForgeAI, an AI career platform for developers.",
  keywords: "tech jobs, resume builder, coding practice, interview prep, job search ai",
  alternates: {
    canonical: 'https://resumeforgeai.in/en-in/jobforge',
  },
};

export default function JobForgeSEO() {
  return (
    <SEOForgePage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Find Your Next Tech Role"
      schemaName="JobForge"
      schemaDescription="AI-powered job search platform."
      ctaText="Find Jobs"
      ctaLink="/en-in/jobs"
      features={[
        "AI-powered job matching based on your profile",
        "Filtered tech roles from global companies",
        "One-click application status tracking",
        "Skill-gap analysis for each role",
        "Curated lists of developer and engineer jobs",
        "Smart keyword identification for specific roles"
      ]}
      content={
        <>
          <p>
            In the ever-changing landscape of technology, finding a job that truly fits your unique skill set can feel like looking for a needle in a haystack. Our AI job search tool simplifies this process by continuously analyzing and matching your expertise with thousands of active listings from leading tech companies and startups around the world.
          </p>
          <p>
            What sets us apart is our deep understanding of technical roles. We don't just look for keywords; we understand the relationship between different technologies and how they apply to specific engineering positions. This means you spend less time scrolling through irrelevant listings and more time focusing on roles where you are actually a strong candidate.
          </p>
          <p>
            We also provide insights into why a job is a good fit for you. By highlighting the alignment between your resume and the job requirements, we give you a clear understanding of your strengths and where you might need to highlight certain skills. This transparency helps you approach recruiters with more confidence and a clearer message about your value.
          </p>
          <p>
            The platform is designed to keep your job search organized and efficient. You can track your applications, save interesting roles for later, and get notified about new opportunities that match your specific criteria. Whether you're looking for your first role or are an experienced engineer, our system provides the clarity you need to move forward.
          </p>
          <p>
            One common issue with traditional job boards is their generic focus. We've built our platform from the ground up for developers and tech professionals, focusing on the specific categories and cultures that drive modern engineering. From deep backend roles to front-end design, we help you find the space that matches your technical passion.
          </p>
          <p>
            Finally, we believe that job discovery should be as fast and reliable as the systems you build. Our engine is built to be intuitive, allowing you to discover and apply for roles with just a few clicks. It's about giving you the same precision in your job search that you bring to your daily work. Start your journey today and discover the many opportunities that fit your professional profile.
          </p>
        </>
      }
    />
  );
}
