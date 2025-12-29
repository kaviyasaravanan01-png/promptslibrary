import { supabase } from '../lib/supabaseClient';
import PromptGridWithFilter from '../components/PromptGridWithFilter';
import SearchBar from '../components/SearchBar';
import Link from 'next/link';

export default async function Home() {
  const { data: prompts } = await supabase.from('prompts').select('id,slug,title,description,model,result_urls,is_premium,price,requirements,instructions,trusted').eq('status','approved').order('created_at', { ascending: false }).limit(24);

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
        </div>
      </header>

      <section>
        <PromptGridWithFilter prompts={prompts || []} />
      </section>
    </div>
  );
}
