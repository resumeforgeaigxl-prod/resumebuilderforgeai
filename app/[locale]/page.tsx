import { Metadata } from 'next';
import LandingPage from "@/components/LandingPage";
import { BASE_URL } from "@/lib/constants";
import { getBlogPosts } from "@/lib/seo-service";

type LocaleHomeProps = {
  params: {
    locale: string;
  };
};

export async function generateMetadata({
  params,
}: LocaleHomeProps): Promise<Metadata> {
  const canonicalPath = `/${params.locale}`;

  return {
    metadataBase: new URL(BASE_URL),
    title: "ResumeForgeAI",
    description:
      "AI-powered platform to build resumes, practice coding, prepare for interviews, and discover tech jobs.",
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: "ResumeForgeAI",
      description:
        "AI-powered platform to build resumes, practice coding, prepare for interviews, and discover tech jobs.",
      url: `${BASE_URL}${canonicalPath}`,
      siteName: "ResumeForgeAI",
      type: "website",
      images: [
        {
          url: `${BASE_URL}/dashboard-preview.png`,
          width: 1440,
          height: 900,
          alt: "ResumeForgeAI dashboard preview",
        },
      ],
    },
  };
}

export default async function LocaleHome({ params }: LocaleHomeProps) {
  // Fetch posts server-side for the "What's New" section
  const posts = await getBlogPosts(params.locale.split('-')[0]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ResumeForgeAI",
    "alternateName": "Resume Forge AI",
    "description": "An AI career platform for developers designed as a Forge Ecosystem.",
    "applicationCategory": "Career & Job Search",
    "operatingSystem": "Web",
    "url": BASE_URL,
    "hasPart": [
      { "@type": "SoftwareApplication", "name": "ResumeForge", "description": "AI-powered resume builder" },
      { "@type": "SoftwareApplication", "name": "CodingForge", "description": "AI coding practice platform" },
      { "@type": "SoftwareApplication", "name": "InterviewForge", "description": "AI mock interview platform" },
      { "@type": "SoftwareApplication", "name": "PrepForge", "description": "TCS NQT and company-specific preparation platform" },
      { "@type": "SoftwareApplication", "name": "JobForge", "description": "AI-powered job discovery platform" },
      { "@type": "SoftwareApplication", "name": "ProjectForge", "description": "Developer project showcase system" }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage locale={params.locale} posts={posts} />
    </>
  );
}
