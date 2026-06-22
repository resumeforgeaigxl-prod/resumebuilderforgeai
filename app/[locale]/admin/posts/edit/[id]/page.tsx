'use client'
export const dynamic = 'force-dynamic';
;

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    slug: '',
    author: '',
    content: '',
    seo_description: '',
    cover_image: '',
    status: 'draft',
    locale: 'en'
  });

  useEffect(() => {
    const loadPost = async () => {
      try {
        const res = await fetch('/api/admin/posts-list');
        const data = await res.json();
        if (data.success) {
          const post = data.posts.find((p: { id: string } & Record<string, unknown>) => p.id === id);
          if (post) {
            setFormData({
              id: post.id,
              title: post.title,
              slug: post.slug,
              author: post.author,
              content: post.content,
              seo_description: post.seo_description || '',
              cover_image: post.cover_image || '',
              status: post.status,
              locale: post.locale || 'en'
            });
          } else {
            alert('Post not found');
            router.push('/admin/posts');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/admin/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      if (result.success) {
        router.push('/admin/posts');
        router.refresh();
      } else {
        alert(result.error || 'Failed to update post');
      }
    } catch (err) {
      console.error(err);
      alert('Internal error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center">
        <Loader2 className="animate-spin mx-auto text-blue-500 mb-4" size={48} />
        <p className="text-sm font-black uppercase text-[#8F8F8F] tracking-widest">Retrieving Platform Record...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/posts" 
          className="p-2 hover:bg-neutral-100 rounded-xl transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Post</h1>
          <p className="text-muted-foreground mt-1 font-mono text-xs opacity-60">ID: {id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-[#8F8F8F] mb-2 tracking-widest">Post Title</label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-[#8F8F8F] mb-2 tracking-widest">URL Slug</label>
              <input
                required
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-[#8F8F8F] mb-2 tracking-widest">Content (Markdown)</label>
              <textarea
                required
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={15}
                className="w-full bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-[#8F8F8F] mb-2 tracking-widest">Author</label>
              <input
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-[#8F8F8F] mb-2 tracking-widest">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-black border border-[#EBEBEB] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-[#8F8F8F] mb-2 tracking-widest">SEO Description</label>
              <textarea
                name="seo_description"
                value={formData.seo_description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief summary for Google..."
                className="w-full bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-[#8F8F8F] mb-2 tracking-widest">Cover Image or Video</label>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    name="cover_image"
                    value={formData.cover_image}
                    onChange={handleChange}
                    placeholder="https://... or upload below"
                    className="w-full bg-white border border-[#EBEBEB] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 pl-10 text-xs"
                  />
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8F8F]" size={18} />
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="edit-media-upload"
                    className="hidden"
                    accept="image/*,video/mp4"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      const uploadButton = e.target.nextElementSibling as HTMLButtonElement;
                      const originalText = uploadButton.innerText;
                      uploadButton.disabled = true;
                      uploadButton.innerText = 'Uploading...';

                      try {
                        const uploadFormData = new FormData();
                        uploadFormData.append('file', file);
                        
                        const res = await fetch('/api/admin/blog-upload', {
                          method: 'POST',
                          body: uploadFormData
                        });
                        
                        const result = await res.json();
                        if (result.success) {
                          setFormData(prev => ({ ...prev, cover_image: result.url }));
                        } else {
                          alert(result.error || 'Upload failed');
                        }
                      } catch (err) {
                        console.error(err);
                        alert('Upload failed');
                      } finally {
                        uploadButton.disabled = false;
                        uploadButton.innerText = originalText;
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('edit-media-upload')?.click()}
                    className="flex-1 bg-white hover:bg-neutral-100 border border-[#EBEBEB] text-[#171717] text-[10px] font-bold uppercase py-2 rounded-lg transition-all"
                  >
                    Upload New Media
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-[#171717] font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 transition-all"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Update Post
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
