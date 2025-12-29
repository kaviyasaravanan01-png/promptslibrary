"use client";

import { useEffect, useState } from 'react';

export default function MarketplaceFilters({ onChange }: { onChange?: (filters: any) => void }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    onChange?.({ categories: selectedCategories });
  }, [selectedCategories, onChange]);

  // For demo, fetch categories client-side
  const [cats, setCats] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCats(d.categories || []));
  }, []);

  const toggleCat = (id: string) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <aside className="w-72 p-4 bg-white/3 rounded">
      <h4 className="font-semibold mb-2">Filters</h4>
      <div className="mb-3">
        <div className="text-sm text-gray-300 mb-1">Categories</div>
        <div className="flex flex-col gap-1 max-h-40 overflow-auto">
          {cats.map(c => (
            <label key={c.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selectedCategories.includes(c.id)} onChange={() => toggleCat(c.id)} />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <button onClick={() => { setSelectedCategories([]); }} className="px-3 py-1 bg-white/6 rounded">Clear</button>
      </div>
    </aside>
  );
}
