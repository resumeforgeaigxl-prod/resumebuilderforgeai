'use client'
export const dynamic = 'force-dynamic';
;

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, FileText, Loader2, Upload, X, Send, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

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

  // Broadcast States
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastEmails, setBroadcastEmails] = useState<string[]>([]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);
  const [broadcastFileName, setBroadcastFileName] = useState<string | null>(null);

  // Excel File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBroadcastFileName(file.name);
    setBroadcastResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const ab = evt.target?.result;
        if (!ab) return;

        const wb = XLSX.read(ab, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert to 2D array of rows
        const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
        
        const sheetEmails: string[] = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        rows.forEach((row) => {
          if (Array.isArray(row)) {
            row.forEach((cell) => {
              if (typeof cell === 'string') {
                const trimmed = cell.trim();
                if (emailRegex.test(trimmed) && !sheetEmails.includes(trimmed)) {
                  sheetEmails.push(trimmed);
                }
              }
            });
          }
        });

        setBroadcastEmails(sheetEmails);
      } catch (err) {
        console.error('Failed to parse Excel file:', err);
        alert('Failed to parse spreadsheet file.');
        setBroadcastFileName(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Trigger Newsletter Broadcast
  const triggerBroadcast = async () => {
    if (broadcastEmails.length === 0) return;
    setIsBroadcasting(true);
    setBroadcastResult(null);

    try {
      const res = await fetch('/api/admin/broadcast-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: broadcastEmails })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBroadcastResult(`Successfully sent email batch to ${data.count} subscribers! Article: "${data.postTitle}"`);
        setBroadcastEmails([]);
      } else {
        alert('Broadcast failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error broadcasting:', err);
      alert('Failed to broadcast newsletter.');
    } finally {
      setIsBroadcasting(false);
    }
  };

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
        <div className="flex gap-3">
          <button 
            onClick={() => setShowBroadcastModal(true)}
            className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold flex items-center gap-2 border border-neutral-800 transition-all text-sm"
          >
            <Send size={16} /> Broadcast Newsletter
          </button>
          <Link href="/admin/posts/new" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-[#171717] rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all text-sm">
            <Plus size={20} /> New Post
          </Link>
        </div>
      </div>

      <div className="glass-card overflow-hidden border border-[#EBEBEB] bg-[#0f111a]/50 backdrop-blur-xl rounded-3xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-[#EBEBEB] uppercase font-black tracking-widest text-[10px] text-[#8F8F8F]">
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
                        <span className="text-xs font-bold uppercase tracking-widest text-[#8F8F8F]">Loading platform records...</span>
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
              <tr key={post.id} className="border-b border-[#EBEBEB] hover:bg-white/[0.02] transition-colors group">
                <td className="p-6">
                  <div className="font-bold text-[#171717] group-hover:text-blue-600 transition-colors">{post.title}</div>
                  <div className="text-[10px] text-[#8F8F8F] font-mono mt-1 opacity-60">/{post.slug}</div>
                </td>
                <td className="p-6">
                    <span className="px-3 py-1 bg-white rounded-lg text-xs font-medium">{post.author}</span>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    post.status === 'published' ? 'bg-emerald-50 text-emerald-600 border border-emerald-500/20' : 'bg-amber-50 text-amber-600 border border-yellow-500/20'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="p-6 text-[11px] text-[#8F8F8F] font-medium">
                  {post.published_at ? format(new Date(post.published_at), 'MMM dd, yyyy') : 'Drafted'}
                </td>
                <td className="p-6 text-right space-x-1">
                  <Link href={`/posts/${post.slug}`} target="_blank" className="p-2.5 hover:bg-white rounded-xl inline-block text-[#8F8F8F] hover:text-[#171717] transition-all">
                    <Eye size={18} />
                  </Link>
                  <Link href={`/admin/posts/edit/${post.id}`} className="p-2.5 hover:bg-blue-50 text-blue-600 rounded-xl inline-block transition-all">
                    <Edit size={18} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="p-2.5 hover:bg-red-50 text-red-600 rounded-xl transition-all disabled:opacity-50"
                  >
                    {deletingId === post.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Broadcast Newsletter Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-[#EBEBEB] w-full max-w-lg p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => {
                setShowBroadcastModal(false);
                setBroadcastEmails([]);
                setBroadcastFileName(null);
                setBroadcastResult(null);
              }}
              className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Email Newsletter Broadcast</h2>
            <p className="text-sm text-neutral-500 mb-6 font-medium">Upload your subscribers `.xlsx` spreadsheet to send the most recent published blog post.</p>

            {!broadcastFileName ? (
              <div className="border-2 border-dashed border-[#E2E8F0] hover:border-blue-500 rounded-2xl p-10 text-center transition-colors cursor-pointer relative group">
                <input 
                  type="file" 
                  accept=".xlsx" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload size={36} className="mx-auto text-neutral-400 group-hover:text-blue-500 transition-colors mb-3" />
                <p className="text-sm font-bold text-neutral-700">Drag or click to upload Excel sheet</p>
                <p className="text-xs text-neutral-400 mt-1">Accepts .xlsx spreadsheets</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-neutral-50 border border-[#E2E8F0] rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-600" size={24} />
                    <div>
                      <div className="text-sm font-bold text-neutral-800 truncate max-w-[200px]">{broadcastFileName}</div>
                      <div className="text-xs text-neutral-500 mt-0.5 font-medium">{broadcastEmails.length} valid subscribers parsed</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setBroadcastFileName(null);
                      setBroadcastEmails([]);
                      setBroadcastResult(null);
                    }}
                    className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
                  >
                    Remove
                  </button>
                </div>

                {broadcastEmails.length > 0 && (
                  <div className="text-xs text-neutral-600 bg-amber-50 border border-amber-200/50 rounded-xl p-4 flex gap-2.5 font-medium">
                    <span className="font-bold text-amber-700">Note:</span>
                    <span>This batch will deliver the latest published article from your blogs database to the **first 50 email addresses** extracted from this sheet.</span>
                  </div>
                )}

                {broadcastResult && (
                  <div className="text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 flex items-start gap-2.5 font-medium">
                    <CheckCircle size={20} className="shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Broadcast Dispatch Complete!</div>
                      <div className="text-xs opacity-90 mt-1 font-medium">{broadcastResult}</div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    onClick={() => {
                      setShowBroadcastModal(false);
                      setBroadcastEmails([]);
                      setBroadcastFileName(null);
                      setBroadcastResult(null);
                    }}
                    className="px-5 py-2.5 border border-[#E2E8F0] hover:bg-neutral-50 text-neutral-700 font-bold rounded-xl text-sm transition-colors"
                    disabled={isBroadcasting}
                  >
                    Close
                  </button>
                  <button
                    onClick={triggerBroadcast}
                    disabled={broadcastEmails.length === 0 || isBroadcasting}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                  >
                    {isBroadcasting ? (
                      <>
                        <Loader2 className="animate-spin" size={16} /> Broadcasting...
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Send Batch
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

