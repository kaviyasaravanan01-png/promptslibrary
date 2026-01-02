"use client";
import { supabase } from '../../lib/supabaseClient';
import SearchBar from '../../components/SearchBar';
import MarketplaceFilters from '../../components/MarketplaceFilters';
import PromptGridWithFilter from '../../components/PromptGridWithFilter';
import PopularTags from '../../components/PopularTags';
import { useEffect, useState } from 'react';

interface Props { searchParams?: { q?: string; tag?: string; contentType?: string; is_featured?: string } }



export default function MarketplacePage({ searchParams }: Props) {
  const q = (searchParams?.q || '').trim();
  const tag = (searchParams?.tag || '').trim();
  const contentType = (searchParams?.contentType || 'prompt').trim();
  const isFeatured = searchParams?.is_featured === 'true';
  const limit = 24;
  const page = 1;
  const [results, setResults] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({ contentType, isFeatured });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      let baseUrl:any='http://localhost:3000';
      const params = new URLSearchParams();
      params.set('q', q);
      if (tag) params.set('tag', tag);
      params.set('limit', String(limit));
      params.set('page', String(page));
      if (filters.contentType && filters.contentType !== 'all') params.set('contentType', filters.contentType);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.subcategoryId) params.set('subId', filters.subcategoryId);
      if (filters.subsubId) params.set('subsubId', filters.subsubId);
      if (filters.resultOutputType) params.set('resultOutputType', filters.resultOutputType);
      if (filters.isFeatured) params.set('isFeatured', 'true');
      const apiUrl = `${baseUrl}/api/search?${params.toString()}`;
      try {
        const res = await fetch(apiUrl, { cache: 'no-store' });
        const json = await res.json();
        setResults(json.results || []);
      } catch {
        setResults([]);
      }
      setLoading(false);
    };
    fetchResults();
  }, [q, tag, limit, page, filters]);

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-black/30 to-black/10 p-6 rounded mb-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-gray-400 mb-4">Advanced search and filters. Try keywords or paste a prompt for semantic matching.</p>
          <SearchBar initial={q} />
          <PopularTags />
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <MarketplaceFilters onChange={setFilters} initialContentType={contentType} />
        </div>
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">{loading ? 'Loading...' : `${results.length} results`}</div>
            <div className="flex gap-2">
              <select className="p-2 bg-black/20 rounded">
                <option>Sort: Relevance</option>
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>

          <PromptGridWithFilter prompts={results} />
        </div>
      </main>
    </div>
  );
}
