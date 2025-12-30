"use client";
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import PromptGridWithFilter from '../components/PromptGridWithFilter';
import SearchBar from '../components/SearchBar';
import MarketplaceFilters from '../components/MarketplaceFilters';
import PopularTags from '../components/PopularTags';
import Link from 'next/link';

export default function Home() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      let query = supabase
        .from('prompts')
        .select('id,slug,title,description,model,result_urls,is_premium,price,requirements,instructions,trusted,content_type,category_id,subcategory_id,subsub_id,tags')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(24);
      if (filters.contentType && filters.contentType !== 'all') query = query.eq('content_type', filters.contentType);
      if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
      if (filters.subcategoryId) query = query.eq('subcategory_id', filters.subcategoryId);
      if (filters.subsubId) query = query.eq('subsub_id', filters.subsubId);
      const { data } = await query;
      setPrompts(data || []);
      setLoading(false);
    };
    fetchPrompts();
  }, [filters]);

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-semibold">Prompt Library</h1>
            <p className="text-gray-300">Browse curated AI prompts. Unlock premium prompts for a small fee.</p>
          </div>
          <div className="flex gap-3 items-center">
            <Link href="/marketplace" className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded shadow">Go to Marketplace</Link>
          </div>
        </div>
        <div className="mt-6">
          <SearchBar />
          <PopularTags />
        </div>
      </header>
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <MarketplaceFilters onChange={setFilters} />
        </div>
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">{loading ? 'Loading...' : `${prompts.length} results`}</div>
          </div>
          <PromptGridWithFilter prompts={prompts} />
        </div>
      </main>
    </div>
  );
}
