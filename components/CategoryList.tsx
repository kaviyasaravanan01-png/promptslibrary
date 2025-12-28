import { supabase } from '../lib/supabaseClient';

export default async function CategoryList({ promptId }: { promptId: string }) {
  // fetch mappings
  const { data: mappings } = await supabase.from('prompt_categories').select('category_id, subcategory_id, subsub_id').eq('prompt_id', promptId);
  if (!mappings || mappings.length === 0) return <div className="text-sm text-gray-400">No categories</div>;

  const categoryIds = Array.from(new Set(mappings.map((m: any) => m.category_id).filter(Boolean)));
  const subIds = Array.from(new Set(mappings.map((m: any) => m.subcategory_id).filter(Boolean)));
  const subsubIds = Array.from(new Set(mappings.map((m: any) => m.subsub_id).filter(Boolean)));

  const { data: cats } = categoryIds.length ? await supabase.from('categories').select('id,name,slug').in('id', categoryIds) : { data: [] };
  const { data: subs } = subIds.length ? await supabase.from('subcategories').select('id,name,slug,category_id').in('id', subIds) : { data: [] };
  const { data: ssubs } = subsubIds.length ? await supabase.from('subsubcategories').select('id,name,slug,subcategory_id').in('id', subsubIds) : { data: [] };

  const rows = mappings.map((m: any) => {
    return {
      category: (cats || []).find((c: any) => c.id === m.category_id) || null,
      subcategory: (subs || []).find((s: any) => s.id === m.subcategory_id) || null,
      subsub: (ssubs || []).find((ss: any) => ss.id === m.subsub_id) || null,
    };
  });

  return (
    <div className="mt-2 space-y-2 text-sm text-gray-200">
      {rows.map((r: any, i: number) => (
        <div key={i} className="p-2 bg-white/3 rounded">
          <div><strong>Category:</strong> {r.category?.name || '-'}</div>
          <div><strong>Subcategory:</strong> {r.subcategory?.name || '-'}</div>
          <div><strong>Sub-sub:</strong> {r.subsub?.name || '-'}</div>
        </div>
      ))}
    </div>
  );
}
