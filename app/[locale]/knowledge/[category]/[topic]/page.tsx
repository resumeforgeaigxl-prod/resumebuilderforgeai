import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getKnowledgeTopicBySlug } from '@/lib/seo-service';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ArrowLeft, BookOpen, Code, HelpCircle, Link as LinkIcon, Share2 } from 'lucide-react';

export async function generateMetadata({ params }: { params: { locale: string, category: string, topic: string } }): Promise<Metadata> {
  const data = await getKnowledgeTopicBySlug(params.category, params.topic);
  if (!data) return {};

  const topicName = data.name;
  const description = data.meta_description || `Learn ${topicName} with examples, explanations, and interview questions on ResumeForgeAI.`;

  return {
    title: `${topicName} Guide | ResumeForgeAI`,
    description,
    openGraph: {
      title: `${topicName} Guide | ResumeForgeAI`,
      description,
      type: 'article',
      images: ['/og-knowledge.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${topicName} Guide | ResumeForgeAI`,
      description,
    }
  };
}

export default async function TopicPage({ params }: { params: { locale: string, category: string, topic: string } }) {
  const { locale, category: categorySlug, topic: topicSlug } = params;
  
  const topic = await getKnowledgeTopicBySlug(categorySlug, topicSlug);
  if (!topic) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${locale}/knowledge`} className="hover:text-white transition-colors">Knowledge</Link>
        <span>/</span>
        <Link href={`/${locale}/knowledge/${categorySlug}`} className="hover:text-white transition-colors capitalize">{categorySlug.replace('-', ' ')}</Link>
        <span>/</span>
        <span className="text-white font-medium">{topic.name}</span>
      </nav>

      <article>
        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
            {topic.name}
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            {topic.description}
          </p>
        </header>

        {/* Dynamic Content from Lessons */}
        <div className="space-y-16">
          {topic.knowledge_lessons?.map((lesson: any) => (
            <section key={lesson.id} className="scroll-mt-20">
              <h2 className="text-3xl font-bold mb-6 border-b border-white/10 pb-2 flex items-center gap-3">
                <BookOpen className="text-indigo-400" /> {lesson.title}
              </h2>
              
              <div className="prose prose-invert max-w-none mb-8">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {lesson.content}
                </ReactMarkdown>
              </div>

              {/* Examples for this lesson */}
              {lesson.knowledge_examples?.length > 0 && (
                <div className="space-y-6 my-8">
                  {lesson.knowledge_examples.map((ex: any) => (
                    <div key={ex.id} className="glass-card overflow-hidden">
                      <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between">
                         <span className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                           <Code size={14} /> Example: {ex.description}
                         </span>
                         <span className="text-xs font-mono uppercase opacity-50">{ex.language}</span>
                      </div>
                      <div className="p-0">
                        <SyntaxHighlighter 
                          language={ex.language || 'typescript'} 
                          style={vscDarkPlus}
                          customStyle={{ margin: 0, background: 'transparent', padding: '1.5rem' }}
                        >
                          {ex.code_snippet}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Questions for this lesson */}
              {lesson.knowledge_questions?.length > 0 && (
                <div className="my-12">
                   <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <HelpCircle className="text-emerald-400" /> Interview Prep: {lesson.title}
                   </h3>
                   <div className="grid gap-4">
                      {lesson.knowledge_questions.map((q: any) => (
                        <div key={q.id} className="p-6 glass-card border-l-4 border-emerald-500/50">
                           <p className="font-bold text-lg mb-3">Q: {q.question}</p>
                           <div className="text-muted-foreground bg-white/5 p-4 rounded-lg">
                              <p className="font-medium text-white/90 mb-1 italic">Suggested Answer:</p>
                              {q.answer}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Footer info: Related Topics */}
        <footer className="mt-20 pt-12 border-t border-white/10">
           <div className="grid md:grid-cols-2 gap-8">
              <div>
                 <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <LinkIcon size={20} className="text-indigo-400" /> Related Topics
                 </h4>
                 <div className="flex flex-wrap gap-2">
                    {Array.isArray(topic.related_topics) && topic.related_topics.map((t: string) => (
                      <Link 
                        key={t}
                        href={`/${locale}/knowledge/${categorySlug}/${t.toLowerCase().replace(/ /g, '-')}`}
                        className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm hover:bg-white/10 transition-colors"
                      >
                        {t}
                      </Link>
                    ))}
                    {(!topic.related_topics || topic.related_topics.length === 0) && (
                      <p className="text-muted-foreground text-sm italic">Explore more topics in the category.</p>
                    )}
                 </div>
              </div>
              <div className="flex flex-col items-end justify-center">
                 <button className="btn-secondary group">
                    <Share2 className="w-4 h-4 mr-2" /> Share this Guide
                 </button>
              </div>
           </div>
        </footer>
      </article>
    </div>
  );
}
