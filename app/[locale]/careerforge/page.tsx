export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { SEOForgePage } from '@/components/seo/SEOForgePage';

export const metadata: Metadata = {
  title: "AI Career Growth & Hub | ResumeForgeAI",
  description: "Navigate your tech career with AI-powered hubs and planning tools. Get personalized career growth strategies and insights.",
  keywords: "tech jobs, resume builder, coding practice, interview prep, career planning",
  alternates: {
    canonical: 'https://resumeforgeai.in/en-in/careerforge',
  },
};

export default function CareerForgeSEO() {
  return (
    <SEOForgePage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Build Your Tech Career with AI"
      schemaName="CareerForge"
      schemaDescription="Comprehensive AI career planning and growth tools designed for the modern tech professional."
      ctaText="Explore Career Hub"
      ctaLink="/en-in/careerforge/app"
      features={[
        "Personalized AI career growth strategies",
        "Salary market analysis and negotiation tips",
        "Role-based skill assessment and gap detection",
        "Integrated networking and mentor connecting",
        "Career tracking milestones and goal alerts",
        "Curated career path documents and resources"
      ]}
      content={
        <>
          <p>
            Building a long-term career in the fast-paced tech industry requires more than just technical skill; it requires a strategic vision and a clear plan for your future. Our AI-driven career forge is a central hub for all your professional development needs, providing you with the clarity and insights needed to make informed decisions about your career path at every stage.
          </p>
          <p>
            We help you understand where you are currently and where you want to go. Our AI analyzes your experience, skills, and goals, identifying the most promising opportunities for growth and providing you with a step-by-step plan to reach your full potential. Whether you're moving into management, deepening your technical expertise, or switching to a completely new field, we provide the support you need to succeed.
          </p>
          <p>
            The career hub also provides valuable market insights, from real-time salary benchmarks to the most in-demand skills in your specific region and role. This information allows you to approach reviews, negotiations, and job applications with confidence, ensuring that you're being fairly compensated for the impact you make. We also provide tips on how to build a stronger professional network and connect with leaders who can guide you.
          </p>
          <p>
            Our career forge is more than just a simple planning tool; it's a long-term partner in your professional journey. By combining deep technical insights with a focus on long-term career growth, we provide a single, powerful resource that helps you navigate the many opportunities and challenges of the modern tech landscape with ease and confidence.
          </p>
          <p>
            We also offer tools for tracking your professional milestones and setting long-term goals. This help you stay focused on the big picture even while you're busy with daily tasks. By visualizing your progress over time, you can see how far you've come and stay motivated to reach the next level of your professional success.
          </p>
          <p>
            Finally, we believe that career growth should be an empowering and rewarding experience. Our platform is built to be fast, reliable, and incredibly intuitive, giving you the same level of strategic insight that was previously only available to those with expensive career coaches. Join thousands of other successful professionals today and start building the future you deserve with our AI career forge.
          </p>
        </>
      }
    />
  );
}
