"use client";

import Image from 'next/image';
import Link from 'next/link';
import { memo, useMemo, useState } from 'react';
import TrendingBadge from './TrendingBadge';

export interface TrendingItem {
  id: string;
  slug: string;
  title: string;
  description?: string;
  model?: string;
  result_urls?: Array<{ url: string; type?: string }> | any;
  is_premium?: boolean;
  price?: number;
  content_type: string;
  tags?: string[];
  avg_rating?: number;
  review_count?: number;
  favorite_count?: number;
  comment_count?: number;
  recent_activity?: number;
}

interface TrendingCardProps {
  item: TrendingItem;
  index: number;
}

function TrendingCardBase({ item, index }: TrendingCardProps) {
  const [imageError, setImageError] = useState(false);

  const thumb = useMemo(() => {
    if (!item.result_urls) return '/placeholder-prompt.png';
    const arr = Array.isArray(item.result_urls) ? item.result_urls : item.result_urls?.urls || [];
    return arr?.[0]?.url || '/placeholder-prompt.png';
  }, [item.result_urls]);

  const topSignals = useMemo(() => {
    const signals: Array<{ label: string; value: number; tone?: 'pink' | 'blue' | 'amber' | 'gray' }> = [];
    if (item.favorite_count) signals.push({ label: '❤', value: item.favorite_count, tone: 'pink' });
    if (item.comment_count) signals.push({ label: '💬', value: item.comment_count, tone: 'blue' });
    if (item.review_count) signals.push({ label: '📝', value: item.review_count, tone: 'gray' });
    if (item.avg_rating && item.avg_rating > 0) signals.push({ label: '★', value: Number(item.avg_rating.toFixed(1)), tone: 'amber' });
    const sorted = signals.sort((a, b) => Number(b.value) - Number(a.value));
    return sorted.slice(0, 2);
  }, [item.favorite_count, item.comment_count, item.review_count, item.avg_rating]);

  const modelLabel = useMemo(() => {
    const m = (item.model || '').toLowerCase();
    if (m.includes('midjourney') || m.includes('mj')) return 'Midjourney';
    if (m.includes('gpt')) return 'ChatGPT';
    if (m.includes('gemini')) return 'Gemini';
    if (m.includes('veo')) return 'Veo';
    if (m.includes('claude')) return 'Claude';
    return item.model || 'AI';
  }, [item.model]);

  const modelTone = useMemo(() => {
    const m = (item.model || '').toLowerCase();
    if (m.includes('midjourney')) return 'bg-purple-600';
    if (m.includes('gpt')) return 'bg-green-600';
    if (m.includes('gemini')) return 'bg-blue-600';
    if (m.includes('veo')) return 'bg-orange-600';
    if (m.includes('claude')) return 'bg-amber-600';
    return 'bg-pink-600';
  }, [item.model]);

  return (
    <Link
      href={`/prompt/${item.slug}`}
      className="group relative block rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-pink-500/40 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
    >
      {/* Ranking */}
      <div className="absolute top-2 left-2 z-20 px-2 py-1 rounded-full bg-black/60 text-xs font-semibold text-white border border-white/20">
        #{index + 1}
      </div>

      {/* Rating badge */}
      {item.avg_rating && item.avg_rating > 0 && (
        <div className="absolute top-2 right-2 z-20">
          <TrendingBadge label="★" value={item.avg_rating.toFixed(1)} tone="amber" />
        </div>
      )}

      {/* Image */}
      <div className="relative w-full h-40 bg-black/30 overflow-hidden">
        {!imageError ? (
          <Image
            src={thumb}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 240px"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Model badge */}
        <div className={`absolute bottom-2 left-2 px-2 py-1 rounded text-[11px] font-semibold text-white ${modelTone} shadow-lg`}>
          {modelLabel}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-pink-300 transition-colors">
          {item.title}
        </h3>

        {/* Signals */}
        {topSignals.length > 0 && (
          <div className="flex items-center gap-2">
            {topSignals.map((sig, idx) => (
              <TrendingBadge key={idx} label={sig.label} value={String(sig.value)} tone={sig.tone} />
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mt-auto">
          <div className="text-xs text-gray-400">Trending score</div>
          {item.is_premium ? (
            <span className="text-sm font-bold text-white">₹{item.price ?? 0}</span>
          ) : (
            <span className="text-sm font-bold text-green-400">Free</span>
          )}
        </div>
      </div>
    </Link>
  );
}

const TrendingCard = memo(TrendingCardBase);
export default TrendingCard;
