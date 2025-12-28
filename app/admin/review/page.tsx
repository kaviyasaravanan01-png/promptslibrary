"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import PromptCard from '../../../components/PromptCard';

const ADMIN_EMAIL = 'anandanathurelangovan94@gmail.com';

export default function AdminReviewPage() {
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: any;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      const res = await supabase.auth.onAuthStateChange((event, session) => setUser(session?.user || null));
      subscription = res?.data?.subscription || null;
    };
    init();
    return () => { try { subscription?.unsubscribe?.(); } catch (e) {} };
  }, []);

  const fetchPending = async (token?: string) => {
    setLoading(true);
    const headers: any = {};
    if (token) headers.authorization = `Bearer ${token}`;
    const res = await fetch('/api/prompts/pending', { headers });
    const json = await res.json();
    setItems(json.prompts || []);
    setLoading(false);
  };

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!data.session) { setItems([]); setLoading(false); return; }
      if (data.session.user.email !== ADMIN_EMAIL) { setItems([]); setLoading(false); return; }
      fetchPending(token);
    };
    run();
  }, [user]);

  const approve = async (id: string) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return alert('not signed in');
    const res = await fetch(`/api/prompts/${id}/approve`, { method: 'POST', headers: { authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (json.error) return alert(json.error);
    fetchPending(token);
  };

  const remove = async (id: string) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return alert('not signed in');
    const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } });
    const json = await res.json();
    if (json.error) return alert(json.error);
    fetchPending(token);
  };

  if (user?.email !== ADMIN_EMAIL) return <div className="text-gray-400">Not authorized</div>;

  return (
    <div>
      <header className="mb-4">
        <h2 className="text-2xl font-semibold">Admin — Review Pending Prompts</h2>
      </header>

      {loading && <div className="text-gray-400">Loading...</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {items.map((p: any) => (
          <div key={p.id} className="relative">
            <PromptCard prompt={p} />
            <div className="mt-2 flex gap-2">
              <button onClick={() => approve(p.id)} className="px-3 py-1 bg-green-600 rounded">Approve</button>
              <button onClick={() => remove(p.id)} className="px-3 py-1 bg-red-600 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
