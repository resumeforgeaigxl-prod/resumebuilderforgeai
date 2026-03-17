import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Plus, FolderTree, BookOpen, ChevronRight, PlayCircle } from 'lucide-react';

export default async function AdminKnowledge() {
  const supabase = createAdminClient();
  
  const { data: categories } = await supabase
    .from('knowledge_categories')
    .select('*, knowledge_topics(count)')
    .order('name');

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base Manager</h1>
          <p className="text-muted-foreground mt-1">Organize categories and topics for the public knowledge section.</p>
        </div>
        <div className="flex gap-4">
           <Link href="/admin/knowledge-runner" className="btn-secondary">
             <PlayCircle size={20} className="text-indigo-400" /> Run Knowledge Runner
           </Link>
           <Link href="/admin/knowledge/categories/new" className="btn-primary">
             <Plus size={20} /> New Category
           </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <FolderTree size={20} className="text-indigo-400" /> Categories
          </h2>
          <div className="space-y-4">
            {categories?.map((cat) => (
              <div key={cat.id} className="glass-card p-6 flex items-center justify-between hover:border-white/20 transition-all cursor-pointer group">
                <div>
                   <h3 className="text-lg font-bold">{cat.name}</h3>
                   <p className="text-sm text-muted-foreground">{cat.knowledge_topics?.[0]?.count || 0} Topics published</p>
                </div>
                <div className="flex items-center gap-4">
                   <button className="text-sm text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                   <ChevronRight className="text-muted-foreground" />
                </div>
              </div>
            ))}
            {(!categories || categories.length === 0) && (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-xl">
                 <p className="text-muted-foreground">No categories yet.</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold flex items-center gap-2">
               <BookOpen size={20} className="text-emerald-400" /> Recent Topics
             </h2>
             <Link href="/admin/knowledge/topics/new" className="text-sm text-indigo-400 hover:underline">View All Topics</Link>
          </div>
          
          <div className="glass-card overflow-hidden">
             {/* Simple list of recent topics */}
             <div className="p-4 text-center text-muted-foreground py-12">
                <p>Use the Knowledge Runner to generate content for your topics.</p>
                <Link href="/admin/knowledge-runner" className="inline-block mt-4 btn-secondary text-sm">
                   Open Knowledge Runner
                </Link>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
}
