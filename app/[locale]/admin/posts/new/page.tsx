'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    author: 'Admin',
    content: '',
    seo_description: '',
    cover_image: '',
    status: 'draft',
    locale: 'en'
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'title' && !formData.slug) {
      setFormData(prev => ({
        ...prev,
        title: value,
        slug: generateSlug(value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      if (result.success) {
        router.push('/admin/posts');
        router.refresh();
      } else {
        alert(result.error || 'Failed to create post');
      }
    } catch (err) {
      console.error(err);
      alert('Internal error. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/posts" 
          className="p-2 hover:bg-white/10 rounded-xl transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Post</h1>
          <p className="text-muted-foreground mt-1">Share platform updates with the community.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-widest">Post Title</label>
              <input
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="E.g., Welcome to ResumeForgeAI 2.0"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-widest">URL Slug</label>
              <input
                required
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="welcome-to-v2"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-widest">Content (Markdown)</label>
              <textarea
                required
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={15}
                placeholder="Write your platform update here..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-widest">Author</label>
              <input
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-widest">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-widest">SEO Description</label>
              <textarea
                name="seo_description"
                value={formData.seo_description}
                onChange={handleChange}
                rows={3}
                placeholder="Brief summary for Google..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-widest">Cover Image or Video</label>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    name="cover_image"
                    value={formData.cover_image}
                    onChange={handleChange}
                    placeholder="https://... or upload below"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-xs"
                  />
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="media-upload"
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
                    onClick={() => document.getElementById('media-upload')?.click()}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase py-2 rounded-lg transition-all"
                  >
                    Upload Image/Video
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 transition-all font-black uppercase tracking-widest"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {formData.status === 'published' ? 'Publish Now' : 'Save Draft'}
            </button>
          </div>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
            <h4 className="text-yellow-500 text-xs font-bold uppercase mb-1">Markdown Tip</h4>
            <p className="text-[10px] text-yellow-500/70 leading-relaxed uppercase font-black">
              Use # for headers, * for lists, and [text](link) for URLs.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
