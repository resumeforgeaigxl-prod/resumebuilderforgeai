export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { SEOForgePage } from '@/components/seo/SEOForgePage';

export const metadata: Metadata = {
  title: "Company Specific Interview Prep | ResumeForgeAI",
  description: "Prepare for interviews at top tech companies like Google, Meta, and Amazon. Get company-specific questions and cultural insights.",
  keywords: "tech jobs, resume builder, coding practice, interview prep, company preparation",
  alternates: {
    canonical: 'https://resumeforgeai.in/en-in/company-prep',
  },
};

export default function CompanyPrepSEO() {
  return (
    <SEOForgePage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Prepare for Top Tech Companies"
      schemaName="CompanyPrep"
      schemaDescription="Comprehensive AI-powered interview preparation tailored for specific top-tier global tech companies."
      ctaText="Start Prep"
      ctaLink="/en-in/(dashboard)/company-prep-interview"
      features={[
        "Company-specific interview question banks",
        "Targeted cultural and values preparation",
        "Role-based technical challenge simulations",
        "Insights into company-specific hiring processes",
        "Real-time AI feedback on your practice rounds",
        "Integrated success stories and candidate tips"
      ]}
      content={
        <>
          <p>
            Interviewing at a top-tier tech company requires more than just technical proficiency; it requires a deep understanding of that company's unique culture, values, and specific evaluation criteria. Our company-specific interview preparation forge provides you with the targeted information and realistic practice needed to stand out and succeed in the most competitive hiring processes in the global tech market.
          </p>
          <p>
            We go beyond just providing a basic list of common interview questions. Our AI analyzes the actual hiring patterns and core values of leading companies like Google, Meta, Amazon, and Microsoft, providing you with a deep understanding of what they are truly looking for in a successful candidate. This means you can approach every interview round with a message that is perfectly aligned with the company's specific needs and expectations.
          </p>
          <p>
            Each session is an opportunity to practice in a realistic environment that closely mirrors the real company interview rounds. From technical coding challenges and system design discussions to behavioral interviews centered on corporate leadership principles, we provide the realism and immediate feedback needed to build your confidence and refine your performance to a world-class level.
          </p>
          <p>
            Our goal is to give every candidate a fair and equal chance to succeed at their dream company. By providing access to high-quality, targeted information and practice, we ensure that you are fully prepared for every challenge that comes your way, regardless of your background. Our AI-powered company prep forge is the final, essential piece of the puzzle in your journey to a career at a top-tier tech firm.
          </p>
          <p>
            We also provide insights into the specific technical stacks and engineering practices of each company. This helps you tailor your technical answers and showcase your familiarity with the tools and methods they use every day. It's about demonstrating that you're not just a great engineer, but a great engineer for *their* specific team.
          </p>
          <p>
            Finally, we believe that high-stakes interview preparation should be as efficient as it is effective. Our platform is built to be fast, reliable, and incredibly focused, giving you the same level of preparation that was previously only available through extensive manual research. Start your company-specific prep today and walk into your next interview with the confidence of a top candidate.
          </p>
        </>
      }
    />
  );
}
