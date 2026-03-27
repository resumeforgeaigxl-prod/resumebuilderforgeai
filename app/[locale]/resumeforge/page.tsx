import { Metadata } from 'next';
import { SEOForgePage } from '@/components/seo/SEOForgePage';

export const metadata: Metadata = {
  title: "ResumeForge – AI Resume Builder Platform | ResumeForgeAI",
  description: "Use ResumeForge to build ATS-optimized resumes. Part of ResumeForgeAI, an AI career platform for developers.",
  keywords: "tech jobs, resume builder, coding practice, interview prep, ats optimization",
  alternates: {
    canonical: 'https://resumeforgeai.in/en-in/resumeforge',
  },
};

export default function ResumeForgeSEO() {
  return (
    <SEOForgePage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Professional AI Resume Builder"
      schemaName="ResumeForge"
      schemaDescription="AI-powered resume builder specializing in ATS-optimized developer resumes."
      ctaText="Build My Resume"
      ctaLink="/en-in/resume"
      features={[
        "ATS-optimized professional templates",
        "AI-powered achievement bullet points",
        "Instant PDF downloads in multiple styles",
        "Tailored suggestions for specific job roles",
        "Real-time preview and layout customization",
        "Keyword matching for better visibility"
      ]}
      content={
        <>
          <p>
            Landing a job in the current market requires more than just a list of your previous roles. It requires a strategic showcase of your achievements that resonates with both human recruiters and automated filtering systems. Our AI resume builder takes the guesswork out of resume writing by providing a structured, guided experience that focuses on what matters most: your professional impact.
          </p>
          <p>
            We understand that every professional path is unique. That's why we don't just give you a static template. Our tool analyzes your input and suggests improvements that elevate your language, highlighting key skills that employers are looking for. Whether you are transitioning careers or climbing the ladder, we provide the clarity and design needed to make a strong first impression.
          </p>
          <p>
            The technical aspects of resume writing, like margin sizes and font choices, are handled automatically. This allows you to focus on the story of your career. Each template is rigorously tested to ensure it remains readable by major Applicant Tracking Systems (ATS), giving you the peace of mind that your application will actually be seen by a real person. We focus on clean, modern design that is easy to navigate and professional in appearance.
          </p>
          <p>
            In addition to building your resume, you can easily create multiple versions for different applications. This targeted approach is proven to be more effective than a generic one-size-fits-all document. With our intuitive interface, you can make updates on the go and keep your professional profile up to date with just a few clicks. It's about giving you the tools to manage your career with the same precision that you bring to your work.
          </p>
          <p>
            A common challenge for developers is quantifying their achievements. Our engine helps you translate your technical work into high-impact bullet points that demonstrate value to a business. We focus on results-oriented language that speaks to both engineering leaders and hiring managers. This dual-focus ensures that your technical proficiency is recognized alongside your ability to deliver meaningful results.
          </p>
          <p>
            Finally, we believe that high-quality design should be accessible to everyone. Our platform is built to be fast, reliable, and easy to use, regardless of your level of experience with design tools. By combining sophisticated AI tech with human-centered product principles, we've created a builder that truly works for the modern tech professional. Start building your future today with a resume that reflects the best version of your professional self.
          </p>
        </>
      }
    />
  );
}
