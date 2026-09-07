export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '@/lib/seo-service';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Calendar, User, ArrowLeft, Share2 } from '@/components/icons';
import { format } from 'date-fns';
import { Playfair_Display, Lora } from 'next/font/google';
import FooterSection from '@/components/landing-v2/FooterSection';
import BlogShareButton from '@/components/blog/BlogShareButton';
import BlogNewsletterSignup from '@/components/blog/BlogNewsletterSignup';
import GrowXLabsInArticleAd from '@/components/ads/GrowXLabsInArticleAd';
import GrowXLabsSidebarAd from '@/components/ads/GrowXLabsSidebarAd';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'] });
const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

interface BlogPost {
  title: string;
  content: string;
  author: string;
  published_at: string;
  cover_image?: string;
  seo_description?: string;
}

// Extract FAQ items from markdown content for AEO (Answer Engine Optimization)
function extractFaqsFromContent(content: string) {
  const faqs: Array<{ question: string; answer: string }> = [];
  const faqSectionMatch = content.match(/##\s*(?:[0-9]+\.\s*)?Frequently Asked Questions[^\n]*\n([\s\S]*?)(?:\n##\s|$)/i);
  if (faqSectionMatch && faqSectionMatch[1]) {
    const faqBody = faqSectionMatch[1];
    const qMatches = Array.from(faqBody.matchAll(/###\s*([^\n?]+\??)\n+([\s\S]*?)(?=(?:\n###|\s*$))/g));
    for (const match of qMatches) {
      const question = match[1].trim();
      const rawAnswer = match[2].trim();
      const cleanAnswer = rawAnswer
        .replace(/<[^>]*>/g, '')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\n+/g, ' ');
      if (question && cleanAnswer) {
        faqs.push({ question, answer: cleanAnswer });
      }
    }
  }
  return faqs;
}

export async function generateMetadata({ params }: { params: { locale: string, slug: string } }): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug, params.locale.split('-')[0]) as BlogPost | null;
  if (!post) return {};

  const baseUrl = 'https://resumeforgeai.in';
  const canonicalUrl = `${baseUrl}/${params.locale}/blogs/${params.slug}`;

  // Region-locale mapping for multilingual Geo-SEO alternates
  const languages: Record<string, string> = {
    'x-default': `${baseUrl}/en-in/blogs/${params.slug}`,
    'en-in': `${baseUrl}/en-in/blogs/${params.slug}`,
    'en-us': `${baseUrl}/en-us/blogs/${params.slug}`,
    'en-eu': `${baseUrl}/en-eu/blogs/${params.slug}`,
    'hi-in': `${baseUrl}/hi-in/blogs/${params.slug}`,
    'te-in': `${baseUrl}/te-in/blogs/${params.slug}`,
    'ta-in': `${baseUrl}/ta-in/blogs/${params.slug}`,
    'ml-in': `${baseUrl}/ml-in/blogs/${params.slug}`,
    'es-us': `${baseUrl}/es-us/blogs/${params.slug}`,
    'es-eu': `${baseUrl}/es-eu/blogs/${params.slug}`,
    'fr-eu': `${baseUrl}/fr-eu/blogs/${params.slug}`,
    'de-eu': `${baseUrl}/de-eu/blogs/${params.slug}`,
  };

  const region = params.locale.split('-')[1]?.toUpperCase() || 'IN';
  const geoPlacename = region === 'IN' ? 'India' : region === 'US' ? 'United States' : 'Europe';

  // Dynamic Keyword Extraction for SEO / AEO / GEO
  const defaultKeywords = [
    'ResumeForge AI', 'AI Career Platform', 'AI Resume Builder', 'ATS Resume Optimization'
  ];

  const slugKeywordsMap: Record<string, string[]> = {
    'gpt-6-astra-openai-agentic-frontier': [
      'GPT-6 Astra', 'OpenAI GPT-6', 'GPT-6 release date', 'GPT-6 architecture',
      'autonomous AI agents', 'native computer use', 'SWE-bench verified',
      'OpenAI preparedness framework critical', 'test-time compute scaling',
      'system-2 reasoning', 'AI cybersecurity model', 'agentic workflow automation',
      'future of software engineering', 'AI career impact 2026', 'autonomous coding agents'
    ],
    'cursor-origin-github-ai-code-hosting': [
      'Cursor Origin', 'Cursor AI', 'GitHub competitor', 'AI code hosting',
      'agentic Git repository', 'developer tooling', 'AI pair programming'
    ],
    'skyroot-india-first-private-rocket-research': [
      'Skyroot Aerospace', 'Vikram-1', 'India private space tech', 'ISRO private partnership',
      'aerospace engineering careers', 'Indian spacetech startups'
    ]
  };

  const keywords = [...(slugKeywordsMap[params.slug] || [post.title]), ...defaultKeywords];
  const ogImageUrl = post.cover_image?.startsWith('http') 
    ? post.cover_image 
    : `${baseUrl}${post.cover_image || '/og-blog.png'}`;

  return {
    title: `${post.title} | ResumeForgeAI`,
    description: post.seo_description,
    keywords: keywords,
    authors: [{ name: post.author, url: `${baseUrl}/${params.locale}/blogs` }],
    creator: post.author,
    publisher: 'ResumeForgeAI',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: post.title,
      description: post.seo_description,
      url: canonicalUrl,
      siteName: 'ResumeForgeAI',
      locale: params.locale.replace('-', '_'),
      type: 'article',
      publishedTime: post.published_at,
      authors: [post.author],
      tags: keywords,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 1200,
          alt: post.title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.seo_description,
      creator: '@ResumeForgeAI',
      images: [ogImageUrl],
    },
    other: {
      'geo.region': region,
      'geo.placename': geoPlacename,
      'news_keywords': keywords.slice(0, 10).join(', '),
      'article:published_time': post.published_at,
      'article:author': post.author,
      'article:section': 'Technology',
      'article:tag': keywords.join(', '),
    }
  };
}

export default async function BlogPostPage({ params }: { params: { locale: string, slug: string } }) {
  const { locale, slug } = params;
  const post = await getBlogPostBySlug(slug, locale.split('-')[0]) as BlogPost | null;
  
  if (!post) notFound();

  const baseUrl = 'https://resumeforgeai.in';
  const pageUrl = `${baseUrl}/${locale}/blogs/${slug}`;
  const coverUrl = post.cover_image?.startsWith('http') 
    ? post.cover_image 
    : `${baseUrl}${post.cover_image || '/og-blog.png'}`;

  // Extract FAQs for AEO (Answer Engine Optimization)
  const faqs = extractFaqsFromContent(post.content || '');

  // High-authority entity anchors for GEO (Generative Engine Optimization)
  const entityKeywordsMap: Record<string, Array<{ name: string; sameAs?: string }>> = {
    'gpt-6-astra-openai-agentic-frontier': [
      { name: 'OpenAI', sameAs: 'https://en.wikipedia.org/wiki/OpenAI' },
      { name: 'GPT-6 Astra' },
      { name: 'Autonomous Agent', sameAs: 'https://en.wikipedia.org/wiki/Intelligent_agent' },
      { name: 'Artificial Intelligence', sameAs: 'https://en.wikipedia.org/wiki/Artificial_intelligence' },
      { name: 'Computer Security', sameAs: 'https://en.wikipedia.org/wiki/Computer_security' },
      { name: 'Software Engineering', sameAs: 'https://en.wikipedia.org/wiki/Software_engineering' }
    ]
  };

  const entities = entityKeywordsMap[slug] || [
    { name: 'Artificial Intelligence' },
    { name: 'Career Development' },
    { name: 'ResumeForgeAI' }
  ];

  // Comprehensive JSON-LD @graph powering SEO, AEO, and GEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": baseUrl,
        "name": "ResumeForgeAI",
        "description": "Next-Gen AI Career Operating System & Resume Builder"
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${baseUrl}/${locale}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": `${baseUrl}/${locale}/blogs`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": post.title,
            "item": pageUrl
          }
        ]
      },
      {
        "@type": "TechArticle",
        "@id": `${pageUrl}#article`,
        "headline": post.title,
        "description": post.seo_description,
        "image": [coverUrl],
        "datePublished": post.published_at,
        "dateModified": post.published_at,
        "inLanguage": locale,
        "author": {
          "@type": "Person",
          "name": post.author,
          "url": `${baseUrl}/${locale}/blogs`
        },
        "publisher": {
          "@type": "Organization",
          "name": "ResumeForgeAI",
          "url": baseUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/favicon.ico`
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": pageUrl
        },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": ["h1", ".prose > p:first-of-type"]
        },
        "about": entities.map(e => ({
          "@type": "Thing",
          "name": e.name,
          ...(e.sameAs ? { "sameAs": e.sameAs } : {})
        })),
        "mentions": [
          { "@type": "Thing", "name": "SWE-bench" },
          { "@type": "Thing", "name": "Computer Use" },
          { "@type": "Thing", "name": "Test-Time Compute" }
        ]
      },
      ...(faqs.length > 0 ? [
        {
          "@type": "FAQPage",
          "@id": `${pageUrl}#faq`,
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        }
      ] : [])
    ]
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] text-[#171717] font-sans pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-[1200px] mx-auto px-6 md:px-20 pt-28 pb-12">
        
        {/* Back Button */}
        <Link 
          href={`/${locale}/blogs`}
          className="inline-flex items-center text-xs font-bold bg-white border border-[#EBEBEB] text-[#171717] hover:bg-neutral-50 px-3.5 h-8 rounded-sm transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] mb-8"
        >
          <ArrowLeft className="mr-1.5 w-3.5 h-3.5" /> Back to Blog
        </Link>

        {/* Article Container with Desktop Sidebar */}
        <div className="flex flex-col xl:flex-row gap-8 items-start">
          <article className={`${lora.className} bg-white border border-[#E2E8F0] rounded-none p-6 md:p-16 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden min-h-[1130px] flex flex-col justify-between flex-1 w-full`}>
          <div>
            {/* Newsletter-style Header Block */}
            <header className="mb-10 text-center">
              <div className="border-t-2 border-b border-neutral-900 py-2.5 mb-8 flex justify-between items-center text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                <span>Volume 1 • Issue 1</span>
                <span className="font-bold text-neutral-900">ResumeForge AI Newsletter</span>
                <span>{post.published_at ? format(new Date(post.published_at), 'MMMM dd, yyyy') : 'Draft'}</span>
              </div>
              
              <h1 className={`${playfair.className} text-3xl md:text-[40px] font-bold tracking-tight text-[#171717] mb-6 leading-[1.2] text-left md:text-center`}>
                {post.title}
              </h1>
              
              <div className="flex items-center justify-center gap-4 text-xs text-neutral-500 font-mono mb-8 border-b border-neutral-200 pb-6">
                <span>By <strong className="text-neutral-900 uppercase tracking-wider">{post.author}</strong></span>
                <span>•</span>
                <span>5 min read</span>
              </div>

              {post.cover_image && (
                <div className="rounded-none overflow-hidden border border-neutral-200 shadow-md mb-10 mx-auto max-w-[800px] bg-neutral-50 flex items-center justify-center">
                  {post.cover_image.endsWith('.mp4') ? (
                    <video 
                      src={post.cover_image}
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls
                      className="w-full h-auto"
                    />
                  ) : (
                    <img 
                      src={post.cover_image} 
                      alt={post.title} 
                      className="w-full h-auto object-contain" 
                    />
                  )}
                </div>
              )}
            </header>

            {/* Newsletter Editorial Content */}
            <div className="prose prose-neutral max-w-none prose-headings:text-[#171717] prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-strong:text-[#171717] prose-code:text-indigo-600 transition-colors">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({children}) => <h1 className={`${playfair.className} text-2xl md:text-3xl font-bold tracking-tight text-[#171717] mt-10 mb-4 pb-2 border-b border-neutral-100`}>{children}</h1>,
                  h2: ({children}) => <h2 className={`${playfair.className} text-xl md:text-2xl font-bold tracking-tight text-[#171717] mt-8 mb-4`}>{children}</h2>,
                  h3: ({children}) => <h3 className={`${playfair.className} text-lg md:text-xl font-bold tracking-tight text-[#171717] mt-6 mb-3`}>{children}</h3>,
                  p: ({children}) => <p className="leading-relaxed text-[#2d2d2d] mb-6 text-[15px] md:text-[16px] text-justify">{children}</p>,
                  li: ({children}) => <li className="leading-relaxed text-[#2d2d2d] mb-2 text-[15px] md:text-[16px]">{children}</li>,
                  mark: ({children}) => <mark className="bg-[#fef08a] text-[#171717] px-1 py-0.5 font-semibold rounded-none">{children}</mark>,
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
                    const { node: _node, ref: _ref, ...cleanProps } = props as any;

                    return match ? (
                      <div className="my-6 rounded-md overflow-hidden border border-[#EBEBEB] bg-[#FAFAFA]">
                        <SyntaxHighlighter
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          style={vscDarkPlus as any}
                          language={match[1]}
                          PreTag="div"
                          {...cleanProps}
                          customStyle={{ margin: 0, background: 'transparent', padding: '1.25rem' }}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className="bg-neutral-50 px-1.5 py-0.5 rounded text-indigo-600 font-mono text-sm border border-[#EBEBEB]" {...cleanProps}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* GrowXLabs In-Article Native Sponsor Ad */}
          <GrowXLabsInArticleAd campaignKey="ai_engineering" />

          <footer className="mt-16 pt-8 border-t border-neutral-200 flex items-center justify-between font-mono text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <span>Published by</span>
              <span className="font-bold text-neutral-900 uppercase tracking-wider">{post.author}</span>
            </div>
            
            <div>
              <BlogShareButton 
                title={post.title} 
                description={post.seo_description} 
                url={`https://resumeforgeai.in/${locale}/blogs/${slug}`} 
              />
            </div>
          </footer>
        </article>

        {/* Sticky Desktop GrowXLabs Sidebar Ad */}
        <aside className="hidden xl:block shrink-0">
          <GrowXLabsSidebarAd />
        </aside>
      </div>
    </div>
        
      {/* Newsletter Signup */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-20 mb-16">
        <BlogNewsletterSignup />
      </div>

      <FooterSection locale={locale} />
    </div>
  );
}
