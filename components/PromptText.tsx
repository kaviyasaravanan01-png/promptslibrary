"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import BuyPromptButton from './BuyPromptButton';
import CopyAndOpenButtons from './CopyAndOpenButtons';

export default function PromptText({ slug, promptId, isPremium, price, model }: { slug: string; promptId: string; isPremium: boolean; price: number; model?: string }) {
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState<string | null>(null);
  const [locked, setLocked] = useState(isPremium);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const headers: any = {};
      if (token) headers.authorization = `Bearer ${token}`;
      const res = await fetch(`/api/prompts/unlock?slug=${encodeURIComponent(slug)}`, { headers });
      if (res.ok) {
        const d = await res.json();
        if (mounted) {
          if (d.prompt_text) {
            setText(d.prompt_text);
            setLocked(false);
          } else {
            setText(null);
            setLocked(true);
          }
        }
      } else {
        setText(null);
        setLocked(true);
      }
      setLoading(false);
    };

    load();
    return () => { mounted = false; };
  }, [slug, isPremium]);

  if (loading) return <div className="mt-4 text-gray-400">Loading prompt...</div>;

  if (locked) {
    return (
      <div className="mt-4">
        <div className="p-4 bg-white/3 rounded-lg">
          <div className="text-sm text-gray-300 blur-sm select-none">Premium prompt — unlock to view the text</div>
          <div className="mt-3">
              <BuyPromptButton promptId={promptId} amount={price} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-white/6 rounded-lg">
      <pre className="whitespace-pre-wrap text-sm text-gray-100">{text}</pre>
      <div className="mt-3">
        <CopyAndOpenButtons slug={slug} model={model} text={text} />
      </div>
    </div>
  );
}
