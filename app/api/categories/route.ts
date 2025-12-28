import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseServer';

export async function GET() {
  try {
    // return nested categories -> subcategories -> subsubcategories
    const { data: cats, error: cErr } = await supabaseAdmin.from('categories').select('*').order('name');
    if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });

    const { data: subs } = await supabaseAdmin.from('subcategories').select('*').order('name');
    const { data: ssubs } = await supabaseAdmin.from('subsubcategories').select('*').order('name');

    const tree = (cats || []).map((c: any) => ({
      ...c,
      subcategories: (subs || []).filter((s: any) => s.category_id === c.id).map((s: any) => ({
        ...s,
        subsub: (ssubs || []).filter((ss: any) => ss.subcategory_id === s.id)
      }))
    }));

    return NextResponse.json({ categories: tree });
  } catch (err) {
    console.error('categories get err', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
