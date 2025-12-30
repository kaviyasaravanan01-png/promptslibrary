"use client";

import { useEffect, useState } from 'react';

export default function MarketplaceFilters({ onChange }: { onChange?: (filters: any) => void }) {
  const [contentType, setContentType] = useState<string>('all');
  const [categoriesTree, setCategoriesTree] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [subcategoryId, setSubcategoryId] = useState<string>('');
  const [subsubId, setSubsubId] = useState<string>('');

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => setCategoriesTree(d.categories || []));
  }, []);

  useEffect(() => {
    onChange?.({ contentType, categoryId, subcategoryId, subsubId });
  }, [contentType, categoryId, subcategoryId, subsubId, onChange]);

  // Filter categories by content type
  const filteredCategories = contentType === 'all' ? categoriesTree : categoriesTree.filter((c: any) => c.type === contentType);
  const subcategories = filteredCategories.find((c: any) => c.id === categoryId)?.subcategories || [];
  const subsubs = subcategories.find((s: any) => s.id === subcategoryId)?.subsub || [];

  const clearAll = () => {
    setCategoryId('');
    setSubcategoryId('');
    setSubsubId('');
    setContentType('all');
  };

  return (
    <aside className="w-72 p-4 bg-white/3 rounded">
      <h4 className="font-semibold mb-2">Filters</h4>
      <div className="mb-3">
        <div className="text-sm text-gray-300 mb-1">Content Type</div>
        <select value={contentType} onChange={e => { setContentType(e.target.value); setCategoryId(''); setSubcategoryId(''); setSubsubId(''); }} className="p-2 bg-black/20 rounded mb-2">
          <option value="all">All Types</option>
          <option value="prompt">Prompt</option>
          <option value="video_tutorial">Video Tutorial</option>
        </select>
        <div className="text-sm text-gray-300 mb-1 mt-2">Category</div>
        <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setSubcategoryId(''); setSubsubId(''); }} className="p-2 bg-black/20 rounded mb-2 w-full">
          <option value="">Choose category</option>
          {filteredCategories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {subcategories.length > 0 && (
          <>
            <div className="text-sm text-gray-300 mb-1 mt-2">Subcategory</div>
            <select value={subcategoryId} onChange={e => { setSubcategoryId(e.target.value); setSubsubId(''); }} className="p-2 bg-black/20 rounded mb-2 w-full">
              <option value="">Choose subcategory</option>
              {subcategories.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </>
        )}
        {subsubs.length > 0 && (
          <>
            <div className="text-sm text-gray-300 mb-1 mt-2">Sub-subcategory</div>
            <select value={subsubId} onChange={e => setSubsubId(e.target.value)} className="p-2 bg-black/20 rounded mb-2 w-full">
              <option value="">Choose sub-subcategory</option>
              {subsubs.map((ss: any) => <option key={ss.id} value={ss.id}>{ss.name}</option>)}
            </select>
          </>
        )}
      </div>
      <div className="mt-4">
        <button onClick={clearAll} className="px-3 py-1 bg-white/6 rounded" type="button">Clear</button>
      </div>
    </aside>
  );
}
