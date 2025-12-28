import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get('categoryId');
    const subId = url.searchParams.get('subId');
    const subsubId = url.searchParams.get('subsubId');

    if (!categoryId) return NextResponse.json({ error: 'categoryId required' }, { status: 400 });

    let q = supabaseAdmin.from('prompt_categories').select('prompt_id, prompts(id,slug,title,description,model,result_urls,is_premium,price)').eq('category_id', categoryId);
    if (subId) q = q.eq('subcategory_id', subId);
    if (subsubId) q = q.eq('subsub_id', subsubId);

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const prompts = (data || []).map((r: any) => r.prompts).filter(Boolean);
    return NextResponse.json({ prompts });
  } catch (err) {
    console.error('by-category err', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
