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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link 
        href={`/${locale}/posts`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors mb-12"
      >
        <ArrowLeft className="mr-2 w-4 h-4" /> Back to Blog
      </Link>

      <article className="glass-card p-0 overflow-hidden border-none shadow-none bg-transparent">
        <header className="mb-12">
           <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                 <Calendar size={16} /> {post.published_at ? format(new Date(post.published_at), 'MMMM dd, yyyy') : 'Draft'}
              </span>
              <span className="flex items-center gap-1">
                 <User size={16} /> {post.author}
              </span>
           </div>
           
           <h1 className="text-4xl md:text-6xl font-bold mb-8 text-gradient">
              {post.title}
           </h1>

           {post.cover_image && (
             <div className="rounded-2xl overflow-hidden glass-card mb-12 border-white/10 relative h-[500px]">
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
                    className="w-full h-full object-cover" 
                  />
                )}
             </div>
           )}
        </header>

        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-gradient prose-headings:font-bold prose-img:rounded-xl prose-a:text-indigo-400 hover:prose-a:text-indigo-300 transition-colors">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
                const { node: _node, ref: _ref, ...cleanProps } = props as any;

                return match ? (
                  <div className="my-6 rounded-xl overflow-hidden glass-card">
                    <SyntaxHighlighter
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      style={vscDarkPlus as any}
                      language={match[1]}
                      PreTag="div"
                      {...cleanProps}
                      customStyle={{ margin: 0, background: 'transparent', padding: '1.5rem' }}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-sm" {...cleanProps}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        <footer className="mt-20 pt-12 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <span className="text-muted-foreground italic">Written by</span>
              <span className="font-bold text-lg">{post.author}</span>
           </div>
           
           <div className="flex gap-4">
              <button className="btn-secondary">
                 <Share2 size={16} className="mr-2" /> Share
              </button>
           </div>
        </footer>
      </article>
      
      {/* Newsletter Signup (Optional, but good for SEO/Retention) */}
      <div className="mt-24 p-12 glass-card text-center bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
         <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
         <p className="text-muted-foreground mb-8 max-w-md mx-auto">Get the latest career tips and ResumeForgeAI updates directly in your inbox.</p>
         <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input type="email" placeholder="Enter your email" className="input-field flex-1 h-12" />
            <button className="btn-primary h-12">Subscribe</button>
         </div>
      </div>
    </div>
  );
}
