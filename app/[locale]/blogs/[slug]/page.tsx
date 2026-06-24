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
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { Playfair_Display, Lora } from 'next/font/google';
import FooterSection from '@/components/landing-v2/FooterSection';

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

export async function generateMetadata({ params }: { params: { locale: string, slug: string } }): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug, params.locale.split('-')[0]) as BlogPost | null;
  if (!post) return {};

  const baseUrl = 'https://resumeforgeai.in';
  const canonicalUrl = `${baseUrl}/${params.locale}/blogs/${params.slug}`;

  // Region-locale mapping for multilingual SEO alternates
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

  return {
    title: `${post.title} | ResumeForgeAI`,
    description: post.seo_description,
    alternates: {
      canonical: canonicalUrl,
      languages,
    },
    openGraph: {
      title: post.title,
      description: post.seo_description,
      type: 'article',
      images: [post.cover_image || '/og-blog.png'],
      authors: [post.author],
      publishedTime: post.published_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.seo_description,
      images: [post.cover_image || '/og-blog.png'],
    }
  };
}

export default async function BlogPostPage({ params }: { params: { locale: string, slug: string } }) {
  const { locale, slug } = params;
  const post = await getBlogPostBySlug(slug, locale.split('-')[0]) as BlogPost | null;
  
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.seo_description,
    "image": post.cover_image ? `https://resumeforgeai.in${post.cover_image}` : 'https://resumeforgeai.in/og-blog.png',
    "datePublished": post.published_at,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "ResumeForgeAI",
      "logo": {
        "@type": "ImageObject",
        "url": "https://resumeforgeai.in/favicon.ico"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://resumeforgeai.in/${locale}/blogs/${slug}`
    }
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

        {/* A4 Sheet Article Container */}
        <article className={`${lora.className} bg-white border border-[#E2E8F0] rounded-none p-6 md:p-16 shadow-[0_8px_30px_rgba(0,0,0,0.03)] overflow-hidden min-h-[1130px] flex flex-col justify-between`}>
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

          <footer className="mt-16 pt-8 border-t border-neutral-200 flex items-center justify-between font-mono text-xs text-neutral-500">
            <div className="flex items-center gap-2">
              <span>Published by</span>
              <span className="font-bold text-neutral-900 uppercase tracking-wider">{post.author}</span>
            </div>
            
            <div>
              <button className="inline-flex items-center text-[11px] font-bold bg-white border border-[#EBEBEB] text-[#171717] hover:bg-neutral-50 px-3.5 h-8 rounded-sm transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <Share2 size={12} className="mr-1.5" /> Share Issue
              </button>
            </div>
          </footer>
        </article>
      </div>
        
      {/* Newsletter Signup (Vercel/AutoSend light border box matching the footer width) */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-20 mb-16">
        <div className="p-8 md:p-12 bg-white border border-[#EBEBEB] text-center rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          <h2 className={`${playfair.className} text-2xl font-bold tracking-tight text-[#171717] mb-2`}>Stay in the Loop</h2>
          <p className="text-sm text-[#4D4D4D] mb-6 max-w-sm mx-auto">Get the latest career tips and ResumeForgeAI updates directly in your inbox.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 h-9 px-3 bg-white border border-[#EBEBEB] text-[#171717] placeholder-[#8F8F8F] rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
            />
            <button className="bg-[#171717] text-white hover:bg-neutral-800 text-xs font-semibold px-4 h-9 rounded-sm transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <FooterSection locale={locale} />
    </div>
  );
}
