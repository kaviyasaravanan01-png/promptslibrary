"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({ initial = '' }: { initial?: string }) {
  const [q, setQ] = useState(initial);
  const router = useRouter();

  const onSubmit = (e: any) => {
    e.preventDefault();
    const encoded = encodeURIComponent(q || '');
    router.push(`/marketplace?q=${encoded}`);
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-2xl mx-auto flex items-center gap-2">
      <input
        aria-label="Search prompts"
        className="flex-1 p-3 rounded-l-lg border border-gray-700 bg-black/40 placeholder-gray-400 text-white focus:outline-none"
        placeholder="Search prompts by keyword or paste prompts for semantic search..."
        value={q}
        onChange={e => setQ(e.target.value)}
      />
      <button className="px-4 py-3 bg-pink-600 rounded-r-lg text-white">Search</button>
    </form>
  );
}
