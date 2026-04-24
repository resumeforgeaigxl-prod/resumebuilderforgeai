export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { SEOForgePage } from '@/components/seo/SEOForgePage';

export const metadata: Metadata = {
  title: "AI Career Mentorship | ResumeForgeAI",
  description: "Get personalized AI mentorship for your tech career. Receive expert advice on career moves, skills, and industry trends.",
  keywords: "tech jobs, resume builder, coding practice, interview prep, career mentor",
  alternates: {
    canonical: 'https://resumeforgeai.in/en-in/mentorforge',
  },
};

export default function MentorForgeSEO() {
  return (
    <SEOForgePage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="AI Technical Mentorship for Everyone"
      schemaName="MentorForge"
      schemaDescription="Access high-quality AI-driven mentorship and professional guidance for every stage of your tech career."
      ctaText="Get Mentorship"
      ctaLink="/en-in/mentorforge/app"
      features={[
        "24/7 AI-driven career and technical mentorship",
        "Personalized technical career roadmap guidance",
        "Real-time advice on difficult work scenarios",
        "Skill-transfer strategies for career changes",
        "Ongoing support and motivation for learners",
        "Integrated industry trend analysis and insights"
      ]}
      content={
        <>
          <p>
            Accessing a mentor who truly understands your professional goals can be a life-changing experience. Our AI mentorship forge provides you with a dedicated, constant partner that is always available to help you navigate the many challenges of a career in technology. Whether you're stuck on a difficult technical problem, preparing for a major promotion, or facing a tough career decision, we're here to provide the clarity and support you need.
          </p>
          <p>
            We don't just provide generic advice or pre-written answers. Our AI is trained to understand the specific nuances of your individual career path and provide guidance that is tailored to your unique circumstances and experience level. We look at everything from your current skill set to your long-term ambitions, ensuring that the advice we give is both practical for today and focused on your sustainable success for tomorrow.
          </p>
          <p>
            The mentor forge also provides ongoing support for your learning and development journey. We help you stay motivated and focused on your goals, identifying the most important milestones and celebrating your technical achievements along the way. This consistent encouragement and guidance is essential for building the resilience and confidence needed to excel in a high-pressure engineering environment.
          </p>
          <p>
            Our goal is to democratize access to high-quality career guidance for every developer. By providing every user with a personalized AI mentor, we ensure that no one has to navigate the complex tech landscape alone. Our AI-powered mentorship forge is more than just a support tool; it's a way for you to build a career that is both professionally successful and personally fulfilling.
          </p>
          <p>
            We also provide scenarios and role-playing exercises for difficult workplace conversations, such as asking for a raise or handling technical disagreements with colleagues. These interactive sessions help you develop the soft skills that are just as important as technical proficiency for long-term career growth. By practicing these scenarios in a safe environment, you build the confidence to handle them effectively in real life.
          </p>
          <p>
            Finally, we believe that every tech professional deserves a mentor. Our platform is built to be fast, reliable, and incredibly supportive, giving you the same level of guidance you would expect from a seasoned industry veteran. Join our community today and start building a more successful and satisfying tech career with the support of your own AI mentor.
          </p>
        </>
      }
    />
  );
}
