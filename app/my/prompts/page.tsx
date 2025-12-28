"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import PromptCard from '../../../components/PromptCard';
import CreatePromptForm from '../../../components/CreatePromptForm';

export default function MyPromptsPage() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let sub: any;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      const res = supabase.auth.onAuthStateChange((event, session) => setUser(session?.user || null));
      sub = res.data?.subscription;
    };
    init();
    return () => { try { sub?.unsubscribe(); } catch (e) {} };
  }, []);

  const fetchMy = async (uid: string) => {
    setLoading(true);
    const res = await fetch(`/api/prompts/my?userId=${uid}`);
    const json = await res.json();
    setItems(json.prompts || []);
    setLoading(false);
  };

  useEffect(() => { if (user) fetchMy(user.id); else { setItems([]); setLoading(false);} }, [user]);

  const handleSaved = (p: any) => fetchMy(user.id);

  const remove = async (id: string) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return alert('Please sign in');
    const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (json.error) return alert(json.error);
    fetchMy(user.id);
  };

  return (
    <div>
      <header className="mb-4">
        <h2 className="text-2xl font-semibold">My Prompts</h2>
        <p className="text-gray-400">Create, edit or delete your prompts while pending.</p>
      </header>

      <div className="mb-6">
        <CreatePromptForm onSaved={handleSaved} />
      </div>

      {loading && <div className="text-gray-400">Loading...</div>}
      {!loading && items.length === 0 && <div className="text-gray-400">No prompts yet.</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {items.map((p: any) => (
          <div key={p.id} className="relative">
            <PromptCard prompt={p} />
            <div className="mt-2 flex gap-2">
              <button onClick={() => window.location.assign(`/prompt/${p.slug}`)} className="px-3 py-1 bg-white/6 rounded">Open</button>
              <button onClick={() => remove(p.id)} className="px-3 py-1 bg-red-600 rounded">Delete</button>
            </div>
            {p.status === 'pending' && <div className="absolute left-3 bottom-3 text-sm text-yellow-300">Pending review</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
