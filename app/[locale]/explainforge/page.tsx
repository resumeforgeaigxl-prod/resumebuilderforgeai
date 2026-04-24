export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { SEOForgePage } from '@/components/seo/SEOForgePage';

export const metadata: Metadata = {
  title: "AI Code Explanations | ResumeForgeAI",
  description: "Understand complex code with AI. Get clear, simple explanations for any snippet or repository instantly.",
  keywords: "tech jobs, resume builder, coding practice, interview prep, ai code assistant",
  alternates: {
    canonical: 'https://resumeforgeai.in/en-in/explainforge',
  },
};

export default function ExplainForgeSEO({ params }: { params: { locale: string } }) {
  const { locale } = params;
  return (
    <SEOForgePage
      title={metadata.title as string}
      description={metadata.description as string}
      h1="Understand Any Code with AI"
      schemaName="ExplainForge"
      schemaDescription="Get clear, logic-driven explanations for any code snippet or public repository in seconds."
      ctaText="Explain My Code"
      ctaLink={`/${locale}/explainforge/app`}
      features={[
        "Instant AI line-by-line code explanations",
        "Simplification of complex logic and architecture",
        "Support for any programming language or framework",
        "Visual breakdown of code flow and relationships",
        "Interactive Q&A for specific code sections",
        "Integrated suggestions for better code readability"
      ]}
      content={
        <>
          <p>
            Reading and understanding someone else's code can be one of the most challenging and time-consuming parts of a developer's day. Our AI-driven code explanation engine is designed to simplify this process by providing clear, plain-language breakdowns of even the most complex logic. Whether you're trying to understand a legacy system, review a colleague's pull request, or learn a new library, we help you get to the core of how the code works instantly.
          </p>
          <p>
            We go beyond just telling you what each individual line does. Our system analyzes the relationships between different parts of the code, explaining the overall flow and architecture in a way that is easy to follow and retain. You can ask specific questions about a section of code or get a high-level summary of an entire file, allowing you to choose the level of detail that fits your immediate needs and technical background.
          </p>
          <p>
            This tool is particularly valuable for developers who are transitioning to new programming languages or working on large, cross-functional teams. By taking the guesswork out of code comprehension, we allow you to focus on the more creative and strategic aspects of your professional work. Our goal is to make technical communication easier, faster, and more effective for every member of the modern development team.
          </p>
          <p>
            The platform is built to handle any code you throw at it, from simple logic snippets to large, interwoven repositories. Our AI-powered code forge is more than just an explanation tool; it's a way for you to build a deeper and more intuitive understanding of the many languages and patterns that drive the modern tech world. It's about empowering you to work with any codebase with confidence and clarity.
          </p>
          <p>
            We also provide suggestions for improving the readability and efficiency of the code you're analyzing. This "reverse-learning" approach helps you identify common pitfalls and learn better ways to structure your own work. It's like having a senior developer by your side, ready to explain and improve code at any time of the day or night.
          </p>
          <p>
            Finally, we believe that technical understanding should be accessible to everyone, regardless of their level of experience. Our platform is built to be fast, reliable, and incredibly supportive, giving you the same level of insight that was previously only available through hours of manual research. Join thousands of other developers today and start simplifying your technical workflow with our AI explain forge.
          </p>
        </>
      }
    />
  );
}
