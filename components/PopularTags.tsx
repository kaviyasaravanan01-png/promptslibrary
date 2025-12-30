"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PopularTags() {
  const [tags, setTags] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchTags() {
      try {
        const res = await fetch('/api/tags/popular');
        const json = await res.json();
        setTags(json.tags || []);
      } catch (err) {
        console.error('Failed to fetch popular tags', err);
      }
    }
    fetchTags();
  }, []);

  const handleTagClick = (tag: string) => {
    router.push(`/marketplace?tag=${encodeURIComponent(tag)}`);
  };

  if (tags.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-2">Popular Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className="bg-gray-700 hover:bg-gray-600 text-sm text-gray-200 px-3 py-1 rounded-full transition"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
