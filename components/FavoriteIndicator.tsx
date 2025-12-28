"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function FavoriteIndicator({ promptId }: { promptId: string }) {
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    let mounted = true;
    const cacheKey = '__fav_cache';
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) return setIsFav(false);

      // simple global cache to avoid many requests
      // @ts-ignore
      if (window[cacheKey]) {
        // cached as array of prompt ids
        // @ts-ignore
        setIsFav(window[cacheKey].includes(promptId));
        return;
      }

      const res = await fetch(`/api/favorites?userId=${user.id}`);
      const json = await res.json();
      const favs = (json.favorites || []).map((f: any) => f.prompt_id || (f.prompts && f.prompts.id));
      // @ts-ignore
      window[cacheKey] = favs;
      if (!mounted) return;
      setIsFav(favs.includes(promptId));
    };
    run();
    return () => { mounted = false; };
  }, [promptId]);

  if (!isFav) return null;

  return (
    <div className="absolute right-3 top-3 text-yellow-400 text-lg drop-shadow-sm">★</div>
  );
}
