
import Link from 'next/link';
import FavoriteIndicator from './FavoriteIndicator';
import { useEffect, useState } from 'react';

export default function PromptCard({ prompt }: { prompt: any }) {
  const [reviewStats, setReviewStats] = useState<{ avg_rating: number, review_count: number } | null>(null);
  useEffect(() => {
    let ignore = false;
    async function fetchStats() {
      try {
        const res = await fetch(`/api/reviews?promptId=${prompt.id}`);
        const json = await res.json();
        if (!ignore) setReviewStats(json.stats);
      } catch {}
    }
    fetchStats();
    return () => { ignore = true; };
  }, [prompt.id]);
  const appLabel = (() => {
    const m = (prompt.model || '').toLowerCase();
    if (m.includes('gpt') || m.includes('chatgpt')) return 'ChatGPT';
    if (m.includes('gemini')) return 'Gemini';
    if (m.includes('midjourney') || m.includes('mj')) return 'MidJourney';
    return prompt.model || 'App';
  })();

  const thumb = prompt.result_urls?.[0]?.url || '';
  console.log('PromptCard render', prompt.trusted);
  return (
    <Link href={`/prompt/${prompt.slug}`} className="block p-4 bg-white/6 rounded-xl backdrop-blur-sm border border-white/6 hover:scale-[1.01] transition relative">
      <div className="h-40 w-full bg-black/20 rounded overflow-hidden mb-3 flex items-center justify-center relative">
        {thumb ? <img src={thumb} alt={prompt.title} className="object-cover w-full h-full" /> : <div className="text-sm text-gray-400">No preview</div>}
        <FavoriteIndicator promptId={prompt.id} />
        {prompt.trusted && (
          <span
            className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
            title="Tested and trusted by PromptVault"
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l7 4v6c0 5.25-3.5 10-7 10s-7-4.75-7-10V6l7-4zm-2 11l-3-3 1.41-1.41L10 10.17l5.59-5.59L17 6l-7 7z"/></svg>
            Trusted
          </span>
        )}
      </div>
      <h3 className="text-lg font-medium flex items-center gap-2">
        {prompt.title}
      </h3>
      <p className="text-sm text-gray-300 mt-1">{prompt.description}</p>
      <div className="mt-2 flex items-center gap-2">
        {reviewStats && (
          <>
            <span className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={reviewStats.avg_rating >= i ? '#facc15' : '#e5e7eb'}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              ))}
            </span>
            <span className="text-xs text-yellow-400 font-bold">{Number(reviewStats.avg_rating).toFixed(1)}</span>
            <span className="text-xs text-gray-400">{reviewStats.review_count > 0 ? `${reviewStats.review_count.toLocaleString()}+ reviews` : 'No reviews'}</span>
          </>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-gray-400">{appLabel}</div>
        <div className="text-xs text-gray-300">{prompt.is_premium ? `₹${(prompt.price/100).toFixed(2)}` : 'Free'}</div>
      </div>
    </Link>
  );
}

