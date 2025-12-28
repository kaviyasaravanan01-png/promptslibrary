"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function FavoriteButton({ promptId }: { promptId: string }) {
  const [user, setUser] = useState<any>(null);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    let subscription: any;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);

      const res = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
      });
      subscription = res.data?.subscription;
    };

    init();
    return () => { try { subscription?.unsubscribe(); } catch (e) {} };
  }, []);

  useEffect(() => {
    if (!user) return;
    // check if favorited
    fetch(`/api/favorites?userId=${user.id}`).then(r => r.json()).then(d => {
      const favs = d.favorites || [];
      setFavorited(favs.some((f: any) => f.prompt_id === promptId));
    });
  }, [user, promptId]);

  const toggle = async () => {
    if (!user) return alert('Please sign in');
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!favorited) {
      await fetch('/api/favorites', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ promptId }) });
      setFavorited(true);
    } else {
      await fetch(`/api/favorites?promptId=${promptId}`, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } });
      setFavorited(false);
    }
  };

  return (
    <button onClick={toggle} className="px-3 py-2 bg-white/6 rounded">
      {favorited ? '★ Favorited' : '☆ Favorite'}
    </button>
  );
}
