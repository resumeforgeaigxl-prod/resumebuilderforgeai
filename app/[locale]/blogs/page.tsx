export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPosts } from '@/lib/seo-service';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import FooterSection from '@/components/landing-v2/FooterSection';
import { Playfair_Display, Lora } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'] });
const lora = Lora({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

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
    <div className={`${lora.className} min-h-screen bg-[#F5F5F3] text-[#171717] pb-0`}>
      <div className="container mx-auto px-6 py-20 max-w-[1200px]">
        
        {/* Header Block in Vercel/AutoSend style */}
        <div className="mb-16">
          <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-widest text-[11px] font-mono uppercase mb-4">
            Blog & Updates
          </div>
          <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold tracking-tighter text-[#171717] mb-4`}>
            Platform News & Engineering
          </h1>
          <p className="text-[#4D4D4D] text-lg max-w-xl">
            Stay up to date with product releases, career preparation strategies, and engineering updates from ResumeForgeAI.
          </p>
        </div>

        {/* AutoSend Bordered Grid / List Pattern */}
        <div className="border border-[#E2E8F0] bg-white divide-y divide-[#E2E8F0] rounded-none overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          {posts.map((post) => (
            <article key={post.id} className="flex flex-col md:flex-row group hover:bg-neutral-50/50 transition-colors">
              {post.cover_image && (
                <div className="w-full md:w-[320px] aspect-square relative shrink-0 overflow-hidden border-b md:border-b-0 md:border-r border-[#E2E8F0]">
                  <Image 
                    src={post.cover_image} 
                    alt={post.title} 
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-[11px] text-[#8F8F8F] font-semibold uppercase tracking-wider font-mono mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {format(new Date(post.published_at), 'MMM dd, yyyy')}
                    </span>
                    <span className="text-neutral-300">•</span>
                    <span className="flex items-center gap-1">
                      <User size={12} /> {post.author}
                    </span>
                  </div>
                  
                  <h2 className={`${playfair.className} text-xl md:text-2xl font-bold tracking-tight text-[#171717] mb-3 group-hover:text-indigo-600 transition-colors`}>
                    {post.title}
                  </h2>
                  <p className="text-sm text-[#4D4D4D] leading-relaxed mb-6 line-clamp-2">
                    {post.seo_description}
                  </p>
                </div>
                
                <div>
                  <Link 
                    href={`/${locale}/blogs/${post.slug}`}
                    className="inline-flex items-center text-xs font-bold bg-white border border-[#EBEBEB] text-[#171717] hover:bg-neutral-50 px-3.5 h-8 rounded-sm transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  >
                    Read Article <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
          ))}

          {posts.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-sm text-[#8F8F8F] uppercase tracking-wider font-mono font-semibold">New updates coming soon!</p>
            </div>
          )}
        </div>

      </div>
      <FooterSection locale={locale} />
    </div>
  );
}
