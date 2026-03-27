import { Metadata } from 'next';
import { SEOForgePage } from '@/components/seo/SEOForgePage';

export const metadata: Metadata = {
  title: "ProjectForge – Developer Project Showcase Platform | ResumeForgeAI",
  description: "Use ProjectForge to showcase projects. Part of ResumeForgeAI, an AI career platform for developers.",
  keywords: "tech jobs, resume builder, coding practice, interview prep, programming",
  alternates: {
    canonical: 'https://resumeforgeai.in/en-in/projectforge',
  },
};

export default function ProjectForgeSEO({ params }: { params: { locale: string } }) {
  const { locale } = params;
  return (
    <SEOForgePage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Showcase Your Skills with ProjectForge"
      schemaName="ProjectForge"
      schemaDescription="Developer project showcase platform."
      ctaText="Go to ProjectForge"
      ctaLink={`/${locale}/projectforge/app`}
      features={[
        "Step-by-step AI guided project builds",
        "Curated project ideas for any skill level",
        "Integrated architecture and design guidance",
        "Automated code review and suggestions",
        "Project completion badges and certifications",
        "Easy export to GitHub and portfolios"
      ]}
      content={
        <>
          <p>
            A strong portfolio is the best way to prove your skills to potential employers in a competitive market. Our AI-guided projects forge provides you with the structure and support needed to build impressive, full-scale technical projects from scratch. Whether you're building a new web application or a complex data pipeline, we guide you through every stage of the design and development process.
          </p>
          <p>
            We don't just give you a simple tutorial; we provide an interactive experience where you are the lead developer. Our AI assistant helps you with architecture decisions, debugging complex issues, and ensuring that your code follows modern best practices. This hands-on approach ensures that by the end of the project, you have a deep understanding of not just how things work, but why they are built that way.
          </p>
          <p>
            Each project is carefully curated to reflect real-world scenarios and the latest industry trends. From building a decentralized application to creating an AI-powered data dashboard, our collection covers a wide range of disciplines and skill levels. We also help you document your work, so you can easily include it in your resume and discuss it confidently during technical interviews.
          </p>
          <p>
            By the time you complete a project, you'll have more than just a working piece of software. You'll have the confidence that comes from seeing a complex idea through to completion. Our AI-supported project forge is more than just a learning tool; it's a way for you to build a career-changing professional profile that clearly demonstrates your ability to build and deploy real-world systems.
          </p>
          <p>
            We also focus on the "extra mile" sections of project work, such as testing, deployment, and documentation. These are the areas that often separate junior from senior developers. By guiding you through these phases, we help you showcase a level of professional maturity that is highly valued by engineering teams at top companies.
          </p>
          <p>
            Finally, we believe that project building should be an accessible and rewarding experience. Our platform is built to be fast, reliable, and incredibly supportive, giving you the same level of guidance you would expect from a personal technical lead. Join our community today and start building the projects that will define the next chapter of your tech career.
          </p>
        </>
      }
    />
  );
}
