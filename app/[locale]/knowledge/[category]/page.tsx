import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getKnowledgeCategoryBySlug, getKnowledgeTopicsByCategory } from '@/lib/seo-service';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export async function generateMetadata({ params }: { params: { locale: string, category: string } }): Promise<Metadata> {
  const category = await getKnowledgeCategoryBySlug(params.category);
  if (!category) return {};

  return {
    title: `${category.name} | ResumeForgeAI Knowledge`,
    description: `Master ${category.name} with our comprehensive guides, examples, and interview prep content.`,
    openGraph: {
      title: category.name,
      description: category.description,
    }
  };
}

export default async function CategoryPage({ params }: { params: { locale: string, category: string } }) {
  const { locale, category: categorySlug } = params;
  
  const category = await getKnowledgeCategoryBySlug(categorySlug);
  if (!category) notFound();

  const topics = await getKnowledgeTopicsByCategory(category.id);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Link 
        href={`/${locale}/knowledge`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors mb-8"
      >
        <ArrowLeft className="mr-2 w-4 h-4" /> Back to Knowledge Base
      </Link>

      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
          {category.name}
        </h1>
        <p className="text-xl text-muted-foreground">
          {category.description || `Browse topics in ${category.name}.`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic) => (
          <Link 
            key={topic.id} 
            href={`/${locale}/knowledge/${categorySlug}/${topic.slug}`}
            className="p-6 glass-card group flex items-center justify-between"
          >
            <div>
              <h3 className="text-xl font-bold group-hover:text-white transition-colors">
                {topic.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {topic.description || "In-depth guide and interview preparation."}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-white transition-all transform group-hover:translate-x-1" />
          </Link>
        ))}

        {topics.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-xl">
             <p className="text-muted-foreground">More topics coming soon for {category.name}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
