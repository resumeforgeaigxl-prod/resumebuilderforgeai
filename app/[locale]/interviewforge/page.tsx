import { Metadata } from 'next';
import { SEOForgePage } from '@/components/seo/SEOForgePage';

export const metadata: Metadata = {
  title: "AI Mock Interviews | ResumeForgeAI",
  description: "Prepare for your dream job with AI-powered mock interviews. Get realistic practice and personalized feedback on your performance.",
  keywords: "tech jobs, resume builder, coding practice, interview prep, mock interview",
  alternates: {
    canonical: 'https://resumeforgeai.in/en-in/interviewforge',
  },
};

export default function InterviewForgeSEO() {
  return (
    <SEOForgePage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Master Your Interviews with AI"
      schemaName="InterviewForge"
      schemaDescription="Prepare for behavioral and technical interviews with a realistic AI interviewer that gives instant feedback."
      ctaText="Start Practice"
      ctaLink="/en-in/mock-interview"
      features={[
        "Realistic conversational AI interviewer",
        "Technical and behavioral interview paths",
        "Detailed feedback on your answers",
        "Confidence and body language analysis",
        "Customizable question difficulty levels",
        "Personalized improvement tips after each session"
      ]}
      content={
        <>
          <p>
            Interviewing is a skill that can be developed with the right kind of practice. Our AI-driven interview forge allows you to simulate high-pressure scenarios from the comfort of your own home. By interacting with a realistic, conversational AI, you can refine your answers and learn how to present your experience more effectively to potential employers.
          </p>
          <p>
            We cover a wide range of interview types, from preliminary behavioral screenings to deep technical rounds. Our AI doesn't just follow a script; it responds to your answers, asking follow-up questions that challenge you to think on your feet. This dynamic approach prepares you for the unpredictability of real interviews, ensuring that you're never caught off guard in a high-stakes meeting.
          </p>
          <p>
            After each session, you receive a comprehensive report that highlights what you did well and where you can improve. We look at everything from the content of your answers to the tone and flow of your speech. Our goal is to provide you with the clarity needed to turn a stressful experience into a confident performance that leaves a lasting impression on your hiring manager.
          </p>
          <p>
            Continuous improvement is at the heart of our platform. You can revisit past sessions to track your progress and see how your skills have evolved over time. With our realistic practice environment, you'll be ready to walk into any interview knowing exactly how to showcase your value to potential employers and communicate your achievements with clarity and impact.
          </p>
          <p>
            In addition to verbal practice, we provide tips and strategies for handling common and difficult interview questions. We help you build a structured approach to answering, from the STAR method for behavioral questions to technical problem-solving frameworks. This comprehensive support ensures that you are prepared for every aspect of the hiring process.
          </p>
          <p>
            Finally, we believe that high-quality interview preparation should be accessible to everyone. Our platform is built to be fast, reliable, and incredibly effective, giving you the same level of support that was previously only available through expensive career coaching. Join our community today and start mastering the skills that will land you your next world-class tech role.
          </p>
        </>
      }
    />
  );
}
