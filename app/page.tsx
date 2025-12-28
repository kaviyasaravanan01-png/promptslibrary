import { supabase } from '../lib/supabaseClient';
import PromptGridWithFilter from '../components/PromptGridWithFilter';

export default async function Home() {
  const { data: prompts } = await supabase.from('prompts').select('id,slug,title,description,model,result_urls,is_premium,price').eq('status','approved').order('created_at', { ascending: false }).limit(24);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-semibold">Prompt Library</h1>
        <p className="text-gray-300">Browse curated AI prompts. Unlock premium prompts for a small fee.</p>
      </header>

      <section>
        {/* client-side grid with favorites toggle */}
        <PromptGridWithFilter prompts={prompts || []} />
      </section>
    </div>
  );
}
