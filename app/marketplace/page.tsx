import { supabase } from '../../lib/supabaseClient';
import SearchBar from '../../components/SearchBar';
import MarketplaceFilters from '../../components/MarketplaceFilters';
import PromptGridWithFilter from '../../components/PromptGridWithFilter';

interface Props { searchParams?: { q?: string } }

export default async function MarketplacePage({ searchParams }: Props) {
  const q = (searchParams?.q || '').trim();
  const limit = 24;
  const page = 1;
  let results: any[] = [];
  // Dynamically determine base URL for API calls
  // let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  let baseUrl:any='https://promptslibrary-nine.vercel.app';
  // if (typeof window !== 'undefined') {
  //   if (window.location.hostname === 'localhost') {
  //     baseUrl = 'http://localhost:3000';
  //   } else {
  //     baseUrl = 'https://promptslibrary-nine.vercel.app';
  //   }
  // }
  console.log('[MarketplacePage] baseUrl:', baseUrl);
  const apiUrl = `${baseUrl}/api/search?q=${encodeURIComponent(q)}&limit=${limit}&page=${page}`;
  try {
    console.log('[MarketplacePage] fetching', apiUrl);
    const res = await fetch(apiUrl, { cache: 'no-store' });
    const json = await res.json();
    console.log('[MarketplacePage] fetched results', json);
    results = json.results || [];
  } catch {
    results = [];
  }

  return (
    <div className="min-h-screen">
      <header className="bg-gradient-to-r from-black/30 to-black/10 p-6 rounded mb-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-gray-400 mb-4">Advanced search and filters. Try keywords or paste a prompt for semantic matching.</p>
          <SearchBar initial={q} />
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <MarketplaceFilters />
        </div>
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">{results.length} results</div>
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
