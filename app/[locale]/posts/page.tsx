export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPosts } from '@/lib/seo-service';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog & Updates | ResumeForgeAI",
    description: "Stay updated with the latest features, career tips, and platform updates from ResumeForgeAI.",
  };
}

export default async function BlogHome({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const posts = await getBlogPosts(locale.split('-')[0]); // Use lang part for db filter

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
          Blog & Platform Updates
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Insights, updates, and career advice to help you land your dream job.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article key={post.id} className="glass-card overflow-hidden flex flex-col group">
            {post.cover_image && (
              <div className="aspect-video overflow-hidden relative">
                <Image 
                  src={post.cover_image} 
                  alt={post.title} 
                  fill
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> {format(new Date(post.published_at), 'MMM dd, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <User size={14} /> {post.author}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold mb-4 group-hover:text-white transition-colors">
                {post.title}
              </h2>
              <p className="text-muted-foreground mb-6 line-clamp-3">
                {post.seo_description}
              </p>
              
              <Link 
                href={`/${locale}/posts/${post.slug}`}
                className="mt-auto inline-flex items-center text-sm font-semibold text-white/80 hover:text-white transition-colors"
              >
                Read Article <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <div className="col-span-full py-24 text-center glass-card">
            <p className="text-xl text-muted-foreground">New updates coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
