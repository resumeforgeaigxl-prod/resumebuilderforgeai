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
  return <LandingPage locale={params.locale} posts={posts} />;
}
