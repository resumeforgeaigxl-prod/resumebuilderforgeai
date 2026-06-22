export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '@/lib/seo-service';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import { format } from 'date-fns';

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

  return {
    title: `${post.title} | ResumeForgeAI`,
    description: post.seo_description,
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#171717] font-sans pb-24">
      <div className="container mx-auto px-6 py-12 max-w-[800px]">
        
        {/* Back Button */}
        <Link 
          href={`/${locale}/posts`}
          className="inline-flex items-center text-xs font-bold bg-white border border-[#EBEBEB] text-[#171717] hover:bg-neutral-50 px-3.5 h-8 rounded-sm transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] mb-12"
        >
          <ArrowLeft className="mr-1.5 w-3.5 h-3.5" /> Back to Blog
        </Link>

        {/* Article Container */}
        <article className="bg-white border border-[#EBEBEB] rounded-xl p-8 md:p-12 shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
          <header className="mb-12">
            <div className="flex items-center gap-3 text-[11px] text-[#8F8F8F] font-semibold uppercase tracking-wider font-mono mb-6">
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {post.published_at ? format(new Date(post.published_at), 'MMMM dd, yyyy') : 'Draft'}
              </span>
              <span className="text-neutral-300">•</span>
              <span className="flex items-center gap-1">
                <User size={12} /> {post.author}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#171717] mb-8 leading-tight">
              {post.title}
            </h1>

            {post.cover_image && (
              <div className="rounded-lg overflow-hidden border border-[#EBEBEB] mb-12 relative h-[250px] md:h-[400px]">
                {post.cover_image.endsWith('.mp4') ? (
                  <video 
                    src={post.cover_image}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image 
                    src={post.cover_image} 
                    alt={post.title} 
                    fill
                    priority
                    sizes="(max-width: 800px) 100vw, 800px"
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
            )}
          </header>

          {/* Light Prose Content */}
          <div className="prose prose-neutral max-w-none prose-headings:text-[#171717] prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-800 prose-strong:text-[#171717] prose-code:text-indigo-600 transition-colors">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
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

          <footer className="mt-16 pt-8 border-t border-[#EBEBEB] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8F8F8F] font-mono uppercase tracking-wider">Written by</span>
              <span className="font-bold text-sm text-[#171717]">{post.author}</span>
            </div>
            
            <div>
              <button className="inline-flex items-center text-xs font-bold bg-white border border-[#EBEBEB] text-[#171717] hover:bg-neutral-50 px-3.5 h-8 rounded-sm transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <Share2 size={13} className="mr-1.5" /> Share
              </button>
            </div>
          </footer>
        </article>
        
        {/* Newsletter Signup (Vercel/AutoSend light border box) */}
        <div className="mt-16 p-8 md:p-12 bg-white border border-[#EBEBEB] text-center rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <h2 className="text-2xl font-bold tracking-tight text-[#171717] mb-2">Stay in the Loop</h2>
          <p className="text-sm text-[#4D4D4D] mb-8 max-w-sm mx-auto">Get the latest career tips and ResumeForgeAI updates directly in your inbox.</p>
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
    </div>
  );
}
