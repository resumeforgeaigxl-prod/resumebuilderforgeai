import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default async function AdminPosts() {
  const supabase = createAdminClient();
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Posts</h1>
          <p className="text-muted-foreground mt-1">Create and update platform update posts.</p>
        </div>
        <Link href="/admin/posts/new" className="btn-primary">
          <Plus size={20} /> New Post
        </Link>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="p-4 font-semibold">Title</th>
              <th className="p-4 font-semibold">Author</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Published At</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts?.map((post) => (
              <tr key={post.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="p-4">
                  <div className="font-medium">{post.title}</div>
                  <div className="text-xs text-muted-foreground font-mono">{post.slug}</div>
                </td>
                <td className="p-4 text-sm">{post.author}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    post.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {post.published_at ? format(new Date(post.published_at), 'MMM dd, yyyy') : '-'}
                </td>
                <td className="p-4 text-right space-x-2">
                  <Link href={`/posts/${post.slug}`} target="_blank" className="p-2 hover:bg-white/10 rounded-lg inline-block">
                    <Eye size={18} />
                  </Link>
                  <button className="p-2 hover:bg-indigo-500/20 text-indigo-400 rounded-lg">
                    <Edit size={18} />
                  </button>
                  <button className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {(!posts || posts.length === 0) && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-muted-foreground">
                  <FileText size={48} className="mx-auto mb-4 opacity-20" />
                  No posts found. Create your first one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
