"use client";

import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';
import { useEffect, useState } from 'react';

async function upsertProfileWithToken(token: string | undefined) {
  if (!token) return;
  try {
    await fetch('/api/profile/upsert', { method: 'POST', headers: { authorization: `Bearer ${token}` } });
  } catch (err) {
    console.error('profile upsert failed', err);
  }
}

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const handleSignIn = async () => {
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, queryParams: { access_type: 'offline' } } });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  useEffect(() => {
    let subscription: any;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);

      const res = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
        const token = session?.access_token;
        if (session && token) upsertProfileWithToken(token);
      });

      subscription = res.data?.subscription;
    };

    init();

    return () => {
      try { subscription?.unsubscribe(); } catch (e) { }
    };
  }, []);

  if (!user) {
    return (
      <div>
        <button onClick={handleSignIn} className="px-3 py-2 bg-white/6 rounded">
          Sign in with Google
        </button>
      </div>
    );
  }

  const displayName = user.user_metadata?.full_name || user.email;
  const avatar = user.user_metadata?.avatar_url || user.user_metadata?.avatar;

  return (
    <div className="flex items-center gap-3">
      {avatar ? <img src={avatar} alt="avatar" className="w-8 h-8 rounded-full" /> : <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">{(displayName || '?')[0]}</div>}
      <div className="text-sm text-gray-200">{displayName}</div>
      <button onClick={handleSignOut} className="ml-2 px-3 py-2 bg-white/6 rounded">Sign out</button>
    </div>
  );
}
