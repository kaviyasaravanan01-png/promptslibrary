import { notFound } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import BuyPromptButton from '../../../components/BuyPromptButton';
import FavoriteButton from '../../../components/FavoriteButton';
import CommentList from '../../../components/CommentList';
import PromptText from '../../../components/PromptText';
import CopyAndOpenButtons from '../../../components/CopyAndOpenButtons';
import MediaGallery from '../../../components/MediaGallery';
import CategoryList from '../../../components/CategoryList';

type CatDisplay = { category?: any; subcategory?: any; subsub?: any };

interface Props {
  params: { slug: string };
}

export default async function PromptPage({ params }: Props) {
  const slug = params.slug;

  const { data, error } = await supabase
    .from('prompts')
    .select('id,slug,title,description,model,result_urls,is_premium,price,created_by,status')
    .eq('slug', slug)
    .single();

  if (error || !data) return notFound();

  if (data.status && data.status !== 'approved') {
    return (
      <div>
        <h2 className="text-xl font-semibold">Prompt pending review</h2>
        <p className="text-gray-400">This prompt is not yet approved for public listing.</p>
      </div>
    );
  }

  return (
    <div>
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{data.title}</h1>
          <p className="text-gray-300 mt-2">{data.description}</p>
        </div>
        <div className="space-y-2 text-right">
          <FavoriteButton promptId={data.id} />
          {data.is_premium ? <BuyPromptButton promptId={data.id} amount={data.price} /> : <div className="px-4 py-2 bg-green-500 text-black rounded">Free</div>}
        </div>
      </header>

      <section className="mt-6 p-4 bg-white/5 rounded-lg">
        <p className="text-sm text-gray-400">Model: {data.model}</p>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="text-sm text-gray-400 mb-2">Preview results below.</div>
            <MediaGallery items={(data.result_urls || []) as any} />
          </div>
          <div>
            <PromptText slug={data.slug} promptId={data.id} isPremium={data.is_premium} price={data.price} />
            <div className="mt-4">
              <h3 className="text-sm font-semibold">Categories</h3>
              <CategoryList promptId={data.id} />
            </div>
          </div>
        </div>
      </section>

      <CommentList slug={slug} />
    </div>
  );
}
