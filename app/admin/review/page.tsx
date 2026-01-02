"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';

const ADMIN_EMAIL = 'kaviyasaravanan01@gmail.com';

interface Prompt {
  id: string;
  slug: string;
  title: string;
  description: string;
  model: string;
  status: string;
  is_featured: boolean;
  is_premium: boolean;
  price: number;
  content_type: string;
  created_at: string;
}

export default function AdminReviewPage() {
  const [user, setUser] = useState<any>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterContentType, setFilterContentType] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    let subscription: any;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user || null;
      setUser(currentUser);
      const res = await supabase.auth.onAuthStateChange((event, session) => setUser(session?.user || null));
      subscription = res?.data?.subscription || null;

      // Fetch all prompts if admin
      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        fetchAllPrompts();
      } else {
        setLoading(false);
      }
    };
    init();
    return () => { try { subscription?.unsubscribe?.(); } catch (e) {} };
  }, []);

  const fetchAllPrompts = async () => {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    try {
      const res = await fetch('/api/admin/prompts/all', {
        headers: { authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setPrompts(json.prompts || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePromptStatus = async (promptId: string, newStatus: string) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/prompts/update-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ promptId, status: newStatus }),
      });

      const json = await res.json();
      if (json.error) {
        alert(json.error);
      } else {
        alert(`Prompt ${newStatus} successfully!`);
        fetchAllPrompts();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const toggleFeatured = async (promptId: string, currentFeatured: boolean) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/prompts/update-featured`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ promptId, isFeatured: !currentFeatured }),
      });

      const json = await res.json();
      if (json.error) {
        alert(json.error);
      } else {
        fetchAllPrompts();
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
      alert('Failed to update featured status');
    }
  };

  const startEdit = (prompt: Prompt) => {
    setEditingId(prompt.id);
    setEditForm({
      title: prompt.title,
      description: prompt.description,
      model: prompt.model,
      price: prompt.price,
    });
  };

  const saveEdit = async (promptId: string) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/prompts/update-details`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ promptId, ...editForm }),
      });

      const json = await res.json();
      if (json.error) {
        alert(json.error);
      } else {
        alert('Prompt updated successfully!');
        setEditingId(null);
        fetchAllPrompts();
      }
    } catch (error) {
      console.error('Error updating prompt:', error);
      alert('Failed to update prompt');
    }
  };

  const deletePrompt = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      return;
    }

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    try {
      const res = await fetch(`/api/prompts/${promptId}`, {
        method: 'DELETE',
        headers: { authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (json.error) {
        alert(json.error);
      } else {
        alert('Prompt deleted successfully!');
        fetchAllPrompts();
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('Failed to delete prompt');
    }
  };

  const filteredPrompts = prompts.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterContentType !== 'all' && p.content_type !== filterContentType) return false;
    return true;
  });

  if (user?.email !== ADMIN_EMAIL) return <div className="text-gray-400">Not authorized</div>;

  if (user?.email !== ADMIN_EMAIL) return <div className="text-center py-12 text-gray-400">Access denied. Admin only.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Review Dashboard</h1>
        <p className="text-gray-400">Manage all prompts: approve, reject, modify, or feature</p>
      </div>

      {/* Filters */}
      <div className="bg-white/5 rounded-lg p-4 mb-6 flex gap-4 items-center flex-wrap">
        <div>
          <label className="text-sm text-gray-300 mr-2">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-black/20 rounded"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-300 mr-2">Content Type:</label>
          <select
            value={filterContentType}
            onChange={(e) => setFilterContentType(e.target.value)}
            className="px-3 py-2 bg-black/20 rounded"
          >
            <option value="all">All Types</option>
            <option value="prompt">Prompt</option>
            <option value="video_tutorial">Video Tutorial</option>
          </select>
        </div>

        <button
          onClick={fetchAllPrompts}
          className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
          <div className="text-2xl font-bold">{prompts.filter((p) => p.status === 'pending').length}</div>
          <div className="text-sm text-gray-400">Pending Review</div>
        </div>
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
          <div className="text-2xl font-bold">{prompts.filter((p) => p.status === 'approved').length}</div>
          <div className="text-sm text-gray-400">Approved</div>
        </div>
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
          <div className="text-2xl font-bold">{prompts.filter((p) => p.status === 'rejected').length}</div>
          <div className="text-sm text-gray-400">Rejected</div>
        </div>
        <div className="bg-purple-900/20 border border-purple-600/30 rounded-lg p-4">
          <div className="text-2xl font-bold">{prompts.filter((p) => p.is_featured).length}</div>
          <div className="text-sm text-gray-400">Featured</div>
        </div>
      </div>

      {/* Prompts Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading prompts...</div>
      ) : (
        <div className="bg-white/5 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Featured</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Premium</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPrompts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No prompts found
                    </td>
                  </tr>
                ) : (
                  filteredPrompts.map((prompt) => (
                    <tr key={prompt.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4 max-w-md">
                        {editingId === prompt.id ? (
                          <div>
                            <input
                              type="text"
                              value={editForm.title}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                              className="w-full px-2 py-1 bg-black/20 rounded mb-2"
                            />
                            <textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              className="w-full px-2 py-1 bg-black/20 rounded text-xs"
                              rows={2}
                            />
                          </div>
                        ) : (
                          <div>
                            <Link
                              href={`/prompt/${prompt.slug}`}
                              className="font-semibold hover:text-pink-400 transition-colors"
                              target="_blank"
                            >
                              {prompt.title}
                            </Link>
                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {prompt.description}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            prompt.content_type === 'video_tutorial'
                              ? 'bg-blue-900 text-blue-200'
                              : 'bg-purple-900 text-purple-200'
                          }`}
                        >
                          {prompt.content_type === 'video_tutorial' ? 'Video' : 'Prompt'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            prompt.status === 'approved'
                              ? 'bg-green-900 text-green-200'
                              : prompt.status === 'pending'
                              ? 'bg-yellow-900 text-yellow-200'
                              : 'bg-red-900 text-red-200'
                          }`}
                        >
                          {prompt.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleFeatured(prompt.id, prompt.is_featured)}
                          className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                            prompt.is_featured
                              ? 'bg-pink-600 text-white hover:bg-pink-700'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {prompt.is_featured ? '★ Featured' : '☆ Feature'}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm">
                          {prompt.is_premium ? `₹${prompt.price}` : 'Free'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {editingId === prompt.id ? (
                            <>
                              <button
                                onClick={() => saveEdit(prompt.id)}
                                className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-xs"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              {prompt.status !== 'approved' && (
                                <button
                                  onClick={() => updatePromptStatus(prompt.id, 'approved')}
                                  className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                                >
                                  Approve
                                </button>
                              )}
                              {prompt.status !== 'rejected' && (
                                <button
                                  onClick={() => updatePromptStatus(prompt.id, 'rejected')}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                                >
                                  Reject
                                </button>
                              )}
                              <button
                                onClick={() => startEdit(prompt)}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deletePrompt(prompt.id)}
                                className="px-2 py-1 bg-gray-700 hover:bg-gray-800 rounded text-xs"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Stats */}
      <div className="mt-6 text-sm text-gray-400 text-center">
        Showing {filteredPrompts.length} of {prompts.length} prompts
      </div>
    </div>
  );
}
