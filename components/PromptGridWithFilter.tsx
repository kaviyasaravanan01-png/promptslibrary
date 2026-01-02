"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import PromptCard from './PromptCard';
import Link from 'next/link';

type CatSel = { category_id?: string; subcategory_id?: string; subsub_id?: string };

export default function PromptGridWithFilter({ prompts, initialContentType }: { prompts: any[], initialContentType?: string }) {
  const [user, setUser] = useState<any>(null);
  const [displayed, setDisplayed] = useState<any[]>(Array.isArray(prompts) ? prompts : []);
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [loading, setLoading] = useState(false);
  // Remove local filter UI and logic; PromptGridWithFilter is now a pure display component
  useEffect(() => {
    if (!onlyFavs) {
      setDisplayed(Array.isArray(prompts) ? prompts : []);
    }
  }, [prompts, onlyFavs]);
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

  useEffect(() => {
    if (!onlyFavs) return;
    const fetchFavs = async () => {
      if (!user) {
        alert('Please sign in to see your favorites');
        setOnlyFavs(false);
        return;
      }
      setLoading(true);
      const res = await fetch(`/api/favorites?userId=${user.id}`);
      const data = await res.json();
      const favs = data.favorites || [];
      const items = favs.map((f: any) => f.prompts || f.prompt || null).filter(Boolean);
      setDisplayed(items);
      setLoading(false);
    };
    fetchFavs();
  }, [onlyFavs, user]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={onlyFavs} onChange={(e) => setOnlyFavs(e.target.checked)} className="accent-pink-500" />
            <span>My Favorites</span>
          </label>
          <Link href="/favorites" className="ml-4 text-sm text-gray-300">Open Favorites Page</Link>
        </div>
        <div>
          {user?.email === 'kaviyasaravanan01@gmail.com' && (
            <Link href="/admin/review" className="ml-4 text-sm text-red-400 px-2 py-1 border rounded">Admin Review</Link>
          )}
        </div>
        {loading && <div className="text-sm text-gray-400">Loading...</div>}
      </div>

      {displayed.length === 0 ? (
        <div className="text-center text-gray-400 py-12 text-lg">No results found. Try a different search or filter.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((p: any) => (
            <PromptCard key={p.id} prompt={p} />
          ))}
        </div>
      )}
    </div>
  );
}
