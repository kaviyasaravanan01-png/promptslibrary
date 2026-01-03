"use client";

import { useState } from 'react';
import Image from 'next/image';
import VideoPlayer from './VideoPlayer';

interface Result {
  id?: string;
  name: string;
  type: 'image' | 'result_video' | 'tutorial_video' | 'video_link';
  prompt_description: string;
  url: string;
  is_public_link?: boolean;
}

export default function MediaGalleryWithPrompts({ items }: { items: Result[] }) {
  const [idx, setIdx] = useState(0);
  if (!items || items.length === 0) return null;

  const active = items[idx];

  return (
    <div className="w-full">
      <div className="bg-[#0b0b0b] rounded-lg overflow-hidden">
        {active.type === 'image' ? (
          <img 
            src={active.url} 
            alt={active.name} 
            className="w-full h-[480px] object-contain bg-black"
          />
        ) : (
          <VideoPlayer 
            url={active.url} 
            name={active.name}
            isPublicLink={active.is_public_link}
          />
        )}
      </div>

      {/* Result Name and Description */}
      <div className="mt-4 p-4 bg-white/5 rounded-lg">
        <h3 className="text-lg font-semibold">{active.name}</h3>
        {active.prompt_description && (
          <p className="mt-2 text-sm text-gray-300 whitespace-pre-wrap">
            {active.prompt_description}
          </p>
        )}
      </div>

      {/* Thumbnails */}
      {items.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {items.map((it, i) => (
            <button 
              key={i} 
              onClick={() => setIdx(i)} 
              className={`flex-shrink-0 border ${i === idx ? 'border-pink-500' : 'border-transparent'} rounded overflow-hidden hover:opacity-80 transition-opacity`}
              title={it.name}
            >
              {it.type === 'image' ? (
                <img 
                  src={it.url} 
                  alt={it.name}
                  className="w-28 h-20 object-cover" 
                />
              ) : (
                <div className="w-28 h-20 bg-black flex items-center justify-center">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="text-gray-500">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
