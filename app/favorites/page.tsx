"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import PromptCard from '../../components/PromptCard';

export default function FavoritesPage() {
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

  useEffect(() => {
    const fetchFavs = async () => {
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const res = await fetch(`/api/favorites?userId=${user.id}`);
      const data = await res.json();
      const favs = data.favorites || [];
      const items = favs.map((f: any) => f.prompts || f.prompt || null).filter(Boolean);
      setItems(items);
      setLoading(false);
    };
    fetchFavs();
  }, [user]);

  return (
    <div>
      <header className="mb-6">
        <h2 className="text-2xl font-semibold">My Favorites</h2>
        <p className="text-gray-400 text-sm">Prompts you bookmarked</p>
      </header>

      {loading && <div className="text-gray-400">Loading...</div>}
      {!loading && items.length === 0 && <div className="text-gray-400">No favorites yet.</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {items.map((p: any) => <PromptCard key={p.id} prompt={p} />)}
      </div>
    </div>
  );
}
