export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { SEOForgePage } from '@/components/seo/SEOForgePage';

export const metadata: Metadata = {
  title: "AI Structured Learning | ResumeForgeAI",
  description: "Learn new tech skills with AI-curated roadmaps and materials. Get organized learning paths for any field in technology.",
  keywords: "tech jobs, resume builder, coding practice, interview prep, online learning",
  alternates: {
    canonical: 'https://resumeforgeai.in/en-in/learnforge',
  },
};

export default function LearnForgeSEO() {
  return (
    <SEOForgePage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Learn New Tech Skills with AI"
      schemaName="LearnForge"
      schemaDescription="An AI-powered learning platform that creates structured educational roadmaps for developers and tech enthusiasts."
      ctaText="Start Learning"
      ctaLink="/en-in/learnforge/app"
      features={[
        "Personalized AI learning roadmaps for any career",
        "Curated high-quality technical course materials",
        "Progress tracking and automated skill assessments",
        "Interactive quizzes and coding exercises",
        "Integrated note-taking and concept summarization",
        "Step-by-step guidance for every learning milestone"
      ]}
      content={
        <>
          <p>
            The tech industry is always evolving, and keeping your skills up to date can feel like an impossible challenge without the right system. Our AI-powered learning platform is designed to take the guesswork out of education by providing you with a clear, focused path to mastery in any technical field. Whether you're learning web development, data science, or mobile app building, we tailor every roadmap to your specific goals and skill level.
          </p>
          <p>
            We curate only the best learning materials from across the web, so you don't have to waste time searching through outdated or low-quality tutorials. Our AI continuously monitors the most recent industry trends and updates to ensure that your learning path is always relevant to what employers are actually looking for right now. This means you spend your time learning the concepts that have the most direct impact on your career growth.
          </p>
          <p>
            The platform is built around the principle of interactive learning. We combine theoretical knowledge with hands-on exercises and real-world challenges, ensuring that you can apply what you learn immediately. Our AI also provides instant feedback on your progress, identifying areas where you might need more practice and adjusting your path to help you overcome any hurdles smoothly.
          </p>
          <p>
            By the time you reach your learning goals, you'll have more than just a list of concepts in your head. You'll have a portfolio of work and the deep, practical understanding needed to succeed in a demanding professional environment. Our AI-supported learning forge is the perfect long-term partner for anyone looking to build a successful and sustainable career in the technology sector.
          </p>
          <p>
            We also provide integrated tools for note-taking and summarization, allowing you to build your own personal technical library as you learn. This helps you retain information more effectively and provides a valuable resource that you can return to throughout your career. It's about building a foundation of knowledge that you can rely on as the industry continues to change.
          </p>
          <p>
            Finally, we believe that high-quality technical education should be accessible, engaging, and highly effective. Our platform is built to be fast, reliable, and incredibly supportive, giving you the same level of guidance you would expect from a professional tutor. Join thousands of other learners today and start building the skills that will drive your future success in tech.
          </p>
        </>
      }
    />
  );
}
