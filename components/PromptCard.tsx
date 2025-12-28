import Link from 'next/link';
import FavoriteIndicator from './FavoriteIndicator';

export default function PromptCard({ prompt }: { prompt: any }) {
  const appLabel = (() => {
    const m = (prompt.model || '').toLowerCase();
    if (m.includes('gpt') || m.includes('chatgpt')) return 'ChatGPT';
    if (m.includes('gemini')) return 'Gemini';
    if (m.includes('midjourney') || m.includes('mj')) return 'MidJourney';
    return prompt.model || 'App';
  })();

  const thumb = prompt.result_urls?.[0]?.url || '';

  return (
    <Link href={`/prompt/${prompt.slug}`} className="block p-4 bg-white/6 rounded-xl backdrop-blur-sm border border-white/6 hover:scale-[1.01] transition relative">
      <div className="h-40 w-full bg-black/20 rounded overflow-hidden mb-3 flex items-center justify-center relative">
        {thumb ? <img src={thumb} alt={prompt.title} className="object-cover w-full h-full" /> : <div className="text-sm text-gray-400">No preview</div>}
        <FavoriteIndicator promptId={prompt.id} />
      </div>
      <h3 className="text-lg font-medium">{prompt.title}</h3>
      <p className="text-sm text-gray-300 mt-1">{prompt.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-gray-400">{appLabel}</div>
        <div className="text-xs text-gray-300">{prompt.is_premium ? `₹${(prompt.price/100).toFixed(2)}` : 'Free'}</div>
      </div>
    </Link>
  );
}

