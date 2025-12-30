"use client";

import { supabase } from "../lib/supabaseClient";

const appUrlMap: Record<string, { label: string; url: string }> = {
  'gpt-4': { label: 'Open in ChatGPT', url: 'https://chat.openai.com/' },
  'gpt-4o': { label: 'Open in ChatGPT', url: 'https://chat.openai.com/' },
  'chatgpt': { label: 'Open in ChatGPT', url: 'https://chat.openai.com/' },
  'gemini': { label: 'Open in Gemini', url: 'https://gemini.google.com/app' },
  'midjourney': { label: 'Open in MidJourney', url: 'https://www.midjourney.com/app/' }
};

export default function CopyAndOpenButtons({ slug, model, text }: { slug: string; model?: string; text?: string | null }) {
  const fetchPromptText = async () => {
    if (text) return text;
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    const headers: any = { 'content-type': 'application/json' };
    if (token) headers.authorization = `Bearer ${token}`;
    const url = `/api/prompts/unlock?slug=${encodeURIComponent(slug)}`;
    const res = await fetch(url, { headers });
    const d = await res.json();
    return d.prompt_text;
  };

  const handleCopy = async () => {
    const t = await fetchPromptText();
    if (!t) return alert('Prompt locked or not available');
    await navigator.clipboard.writeText(t);
    alert('Prompt copied to clipboard');
  };

  const handleOpen = async () => {
    const t = await fetchPromptText();
    if (!t) return alert('Prompt locked or not available');
    await navigator.clipboard.writeText(t);
    const modelLower = model?.toLowerCase() || '';
    
    // Find best match: check both directions (model contains key OR key contains model)
    let target = 'chatgpt'; // default fallback
    for (const key of Object.keys(appUrlMap)) {
      if (modelLower.includes(key) || key.includes(modelLower)) {
        target = key;
        break;
      }
    }
    
    const url = appUrlMap[target].url;
    try {
      // Try prefill via query param (best-effort). Many apps ignore this, but clipboard contains the prompt as fallback.
      const prefillUrl = `${url}?prompt=${encodeURIComponent(t)}`;
      window.open(prefillUrl, '_blank');
      // Show helpful message for apps that don't support URL prefill
      if (target === 'gemini') {
        alert('Prompt copied to clipboard! Paste it (Ctrl+V) into the Gemini app.');
      }
    } catch (e) {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="flex gap-3">
      <button onClick={handleCopy} className="px-3 py-2 bg-white/6 rounded">Copy Prompt</button>
      <button onClick={handleOpen} className="px-3 py-2 bg-cyan-500 text-black rounded">Open in App</button>
    </div>
  );
}
