import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '../../../lib/supabaseClient';
import BuyPromptButton from '../../../components/BuyPromptButton';
import FavoriteButton from '../../../components/FavoriteButton';
import CommentList from '../../../components/CommentList';
import PromptReviewSection from '../../../components/PromptReviewSection';
import PromptText from '../../../components/PromptText';
import CopyAndOpenButtons from '../../../components/CopyAndOpenButtons';
import MediaGallery from '../../../components/MediaGallery';
import CategoryList from '../../../components/CategoryList';

type CatDisplay = { category?: any; subcategory?: any; subsub?: any };

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  const { data } = await supabase.from('prompts').select('seo_title,seo_description,title,description').eq('slug', slug).single();
  if (!data) return { title: 'Prompt' };
  return {
    title: data.seo_title || data.title,
    description: data.seo_description || data.description
  } as Metadata;
}

export default async function PromptPage({ params }: Props) {
  const slug = params.slug;

  const { data, error } = await supabase
    .from('prompts')
    .select('id,slug,title,description,model,result_urls,is_premium,price,created_by,status,requirements,instructions,seo_title,seo_description,trusted,tags')
    .eq('slug', slug)
    .single();

  if (error || !data) return notFound();

  if (data.status && data.status !== 'approved') {
    // If you have a delete button for pending prompts, keep it here. For approved, do not render delete.
    return (
      <div>
        <h2 className="text-xl font-semibold">Prompt pending review</h2>
        <p className="text-gray-400">This prompt is not yet approved for public listing.</p>
        {/* Place delete button here if needed for pending prompts only */}
      </div>
    );
  }
  // For approved prompts, do NOT render delete button anywhere in the page.

console.log('data', data);
  return (
    <div>
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold">{data.title}</h1>
          </div>
          <p className="text-gray-300 mt-2">{data.description}</p>
          {data.trusted && (
            <div className="mt-2">
              <span
                className="bg-green-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1 cursor-pointer"
                title="Tested and trusted by PromptVault"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l7 4v6c0 5.25-3.5 10-7 10s-7-4.75-7-10V6l7-4zm-2 11l-3-3 1.41-1.41L10 10.17l5.59-5.59L17 6l-7 7z"/></svg>
                Trusted
              </span>
            </div>
          )}
          {/* Review stats below title/desc */}
          <PromptReviewSection promptId={data.id} isPremium={data.is_premium} />
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
            <PromptText slug={data.slug} promptId={data.id} isPremium={data.is_premium} price={data.price} model={data.model} />
            {Array.isArray(data.requirements) && data.requirements.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold">Requirements</h3>
                <ul className="list-disc list-inside text-sm text-gray-300">
                  {data.requirements.map((r: string, i: number) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}
            {Array.isArray(data.instructions) && data.instructions.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold">Instructions</h3>
                <ol className="list-decimal list-inside text-sm text-gray-300">
                  {data.instructions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                </ol>
              </div>
            )}
            <div className="mt-4">
              <h3 className="text-sm font-semibold">Categories</h3>
              <CategoryList promptId={data.id} />
            </div>
            {Array.isArray(data.tags) && data.tags.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="bg-gray-700 text-sm text-gray-200 px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <CommentList slug={slug} />
    </div>
  );
}
