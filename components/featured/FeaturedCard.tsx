"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface FeaturedCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  model: string;
  result_urls: Array<{ url: string; type: string }>;
  is_premium: boolean;
  price: number;
  content_type: string;
  tags?: string[];
}

export default function FeaturedCard({
  slug,
  title,
  model,
  result_urls,
  is_premium,
  price,
  content_type,
  tags = [],
}: FeaturedCardProps) {
  const [imageError, setImageError] = useState(false);

  // Get thumbnail from result_urls
  const thumbnail = result_urls?.[0]?.url || '/placeholder-prompt.png';

  // Get AI model badge label
  const getModelBadge = () => {
    const modelLower = (model || '').toLowerCase();
    if (modelLower.includes('midjourney') || modelLower.includes('mj')) return 'Midjourney';
    if (modelLower.includes('gpt') || modelLower.includes('chatgpt')) return 'ChatGPT';
    if (modelLower.includes('gemini')) return 'Gemini';
    if (modelLower.includes('veo')) return 'Veo';
    if (modelLower.includes('claude')) return 'Claude';
    if (modelLower.includes('dall')) return 'DALL-E';
    return model || 'AI';
  };

  // Get badge color based on model
  const getBadgeColor = () => {
    const modelLower = (model || '').toLowerCase();
    if (modelLower.includes('midjourney')) return 'bg-purple-600';
    if (modelLower.includes('gpt')) return 'bg-green-600';
    if (modelLower.includes('gemini')) return 'bg-blue-600';
    if (modelLower.includes('veo')) return 'bg-orange-600';
    if (modelLower.includes('claude')) return 'bg-amber-600';
    return 'bg-pink-600';
  };

  return (
    <Link
      href={`/prompt/${slug}`}
      className="group flex-shrink-0 w-64 rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-pink-500/50 transition-all duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
    >
      {/* Image Container */}
      <div className="relative w-full h-48 bg-black/20 overflow-hidden">
        {!imageError ? (
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            sizes="(max-width: 768px) 256px, 256px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* AI Model Badge */}
        <div className={`absolute top-2 left-2 ${getBadgeColor()} px-2 py-1 rounded text-xs font-semibold text-white shadow-lg`}>
          {getModelBadge()}
        </div>

        {/* Content Type Badge */}
        {content_type === 'video_tutorial' && (
          <div className="absolute top-2 right-2 bg-blue-600 px-2 py-1 rounded text-xs font-semibold text-white shadow-lg flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            Video
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-sm font-semibold text-white line-clamp-2 mb-2 group-hover:text-pink-300 transition-colors">
          {title}
        </h3>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-300"
              >
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-400">
                +{tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            {is_premium ? (
              <span className="text-lg font-bold text-white">₹{price}</span>
            ) : (
              <span className="text-lg font-bold text-green-400">Free</span>
            )}
          </div>

          {/* Arrow Icon - Visible on Hover */}
          <div className="opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300">
            <svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
