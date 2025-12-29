"use client";
import { useEffect, useState } from 'react';

export default function ReviewStats({ promptId }: { promptId: string }) {
  const [stats, setStats] = useState<{ avg_rating: number, review_count: number } | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  useEffect(() => {
    let ignore = false;
    async function fetchStats() {
      try {
        const res = await fetch(`/api/reviews?promptId=${promptId}`);
        const json = await res.json();
        if (!ignore) {
          setStats(json.stats);
          setReviews(json.reviews || []);
        }
      } catch {}
    }
    fetchStats();
    return () => { ignore = true; };
  }, [promptId]);

  return (
    <div className="mb-4">
      {stats && (
        <div className="flex items-center gap-2 mb-1">
          <span className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(i => (
              <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill={stats.avg_rating >= i ? '#facc15' : '#e5e7eb'}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            ))}
          </span>
          <span className="text-sm text-yellow-400 font-bold">{Number(stats.avg_rating).toFixed(1)}</span>
          <span className="text-xs text-gray-400">{stats.review_count > 0 ? `${stats.review_count.toLocaleString()}+ reviews` : 'No reviews'}</span>
        </div>
      )}
      <div>
        {reviews.map((r, i) => {
          const date = r.created_at ? new Date(r.created_at) : null;
          return (
            <div key={r.id || i} className="text-xs text-gray-300 border-b border-white/10 py-1 flex items-center gap-2">
              <span className="font-bold text-yellow-400">{r.rating}★</span> {r.review_text}
              {date && (
                <span className="text-gray-500 ml-2">{date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
