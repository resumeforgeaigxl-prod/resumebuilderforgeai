export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import Link from 'next/link';
import { getKnowledgeCategories } from '@/lib/seo-service';
import { ChevronRight, BookOpen, GraduationCap, Code } from 'lucide-react';
import { FeatureGate } from '@/components/pricing/FeatureGate';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Knowledge Base | ResumeForgeAI",
    description: "Explore structured knowledge on programming, data structures, algorithms, and system design to excel in your tech career.",
    openGraph: {
      title: "Knowledge Base | ResumeForgeAI",
      description: "Explore structured knowledge on programming, data structures, algorithms, and system design.",
      images: ['/og-image.png'],
    },
  };
}

export default async function KnowledgeHome({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const categories = await getKnowledgeCategories();

  return (
    <FeatureGate task="knowledge">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
          Expand Your Knowledge
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Deep dive into technical topics with our structured guides.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <Link 
            key={category.id} 
            href={`/${locale}/knowledge/${category.slug}`}
            className="glass-card p-8 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               {/* Icon placeholder or dynamic based on slug */}
               <BookOpen size={64} />
            </div>
            
            <h2 className="text-2xl font-bold mb-4 group-hover:text-white transition-colors">
              {category.name}
            </h2>
            <p className="text-muted-foreground mb-6 line-clamp-3">
              {category.description || "Master the fundamentals and advanced concepts."}
            </p>
            
            <div className="flex items-center text-sm font-medium text-white/70 group-hover:text-white mt-auto">
              Explore Topics <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full py-20 text-center glass-card">
            <GraduationCap className="mx-auto mb-4 text-muted-foreground" size={48} />
            <p className="text-xl text-muted-foreground">Coming soon! We are building the knowledge base.</p>
          </div>
        )}
      </div>

      {/* Structured Content Grid for SEO if needed */}
      <div className="mt-24 space-y-16">
         <section>
            <h2 className="text-3xl font-bold mb-8 text-gradient flex items-center gap-3">
              <Code className="text-indigo-400" /> Technical Guides
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 glass-card">
                  <h3 className="text-xl font-bold mb-3">Interview Preparation</h3>
                  <p className="text-muted-foreground">Comprehensive guides covering most asked coding questions and system design patterns.</p>
               </div>
               <div className="p-6 glass-card">
                  <h3 className="text-xl font-bold mb-3">Core Fundamentals</h3>
                  <p className="text-muted-foreground">Strengthen your basics in OS, DBMS, Computer Networks and OOPs concepts.</p>
               </div>
            </div>
         </section>
      </div>
    </div>
    </FeatureGate>
  );
}
