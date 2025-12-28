"use client";

import { useState } from 'react';

export default function MediaGallery({ items }: { items: Array<{ url: string; type?: string }> }) {
  const [idx, setIdx] = useState(0);
  if (!items || items.length === 0) return null;

  const active = items[idx];

  return (
    <div className="w-full">
      <div className="bg-[#0b0b0b] rounded-lg overflow-hidden">
        {active.type === 'video' ? (
          <video controls className="w-full h-[480px] object-contain bg-black">
            <source src={active.url} />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img src={active.url} alt={`result-${idx}`} className="w-full h-[480px] object-contain" />
        )}
      </div>

      {items.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {items.map((it, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`flex-shrink-0 border ${i===idx? 'border-pink-500': 'border-transparent'} rounded`}>
              {it.type === 'video' ? (
                <video className="w-28 h-20 object-cover" muted>
                  <source src={it.url} />
                </video>
              ) : (
                <img src={it.url} className="w-28 h-20 object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
