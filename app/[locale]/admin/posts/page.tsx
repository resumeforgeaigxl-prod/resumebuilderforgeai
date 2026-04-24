'use client'
export const dynamic = 'force-dynamic';
;

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  author: string;
  status: string;
  published_at?: string;
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // await fetch('/api/admin/posts/list');
    } catch (err) {
      console.error(err);
    }
  };

  // Re-thinking: I'll convert the whole page to a Client Component for easiest state management of deletions.
  // I need to fetch the posts.
  
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
          const res = await fetch('/api/admin/posts-list'); // Need this API
          const data = await res.json();
          if (data.posts) setPosts(data.posts);
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/posts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== id));
      } else {
        alert('Failed to delete post');
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Error deleting post');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Posts</h1>
          <p className="text-muted-foreground mt-1 text-sm">Create and update platform update posts.</p>
        </div>
        <Link href="/admin/posts/new" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all">
          <Plus size={20} /> New Post
        </Link>
      </div>

      <div className="glass-card overflow-hidden border border-white/5 bg-[#0f111a]/50 backdrop-blur-xl rounded-3xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 uppercase font-black tracking-widest text-[10px] text-slate-500">
              <th className="p-6">Post Details</th>
              <th className="p-6">Author</th>
              <th className="p-6">Status</th>
              <th className="p-6">Date</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
                <tr>
                    <td colSpan={5} className="p-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={32} />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading platform records...</span>
                    </td>
                </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center text-muted-foreground uppercase text-xs font-bold tracking-widest">
                  <FileText size={48} className="mx-auto mb-4 opacity-10" />
                  No records found.
                </td>
              </tr>
            ) : posts.map((post) => (
              <tr key={post.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                <td className="p-6">
                  <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{post.title}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1 opacity-60">/{post.slug}</div>
                </td>
                <td className="p-6">
                    <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-medium">{post.author}</span>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    post.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="p-6 text-[11px] text-slate-400 font-medium">
                  {post.published_at ? format(new Date(post.published_at), 'MMM dd, yyyy') : 'Drafted'}
                </td>
                <td className="p-6 text-right space-x-1">
                  <Link href={`/posts/${post.slug}`} target="_blank" className="p-2.5 hover:bg-white/5 rounded-xl inline-block text-slate-400 hover:text-white transition-all">
                    <Eye size={18} />
                  </Link>
                  <Link href={`/admin/posts/edit/${post.id}`} className="p-2.5 hover:bg-blue-500/10 text-blue-400 rounded-xl inline-block transition-all">
                    <Edit size={18} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="p-2.5 hover:bg-red-500/10 text-red-400 rounded-xl transition-all disabled:opacity-50"
                  >
                    {deletingId === post.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

