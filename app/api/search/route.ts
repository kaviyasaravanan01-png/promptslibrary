// Force dynamic rendering and Node.js runtime for logging
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    const tag = url.searchParams.get('tag') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(url.searchParams.get('limit') || '24', 10) || 24;
    const offset = (page - 1) * limit;
    const contentType = url.searchParams.get('contentType');
    const categoryId = url.searchParams.get('categoryId');
    const subcategoryId = url.searchParams.get('subId');
    const subsubId = url.searchParams.get('subsubId');

    let query = supabaseAdmin
      .from('prompts')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,tags.cs.{${q}}`);
    }
    if (tag) {
      query = query.contains('tags', [tag]);
    }
    if (contentType && contentType !== 'all') query = query.eq('content_type', contentType);
    if (categoryId) query = query.eq('category_id', categoryId);
    if (subcategoryId) query = query.eq('subcategory_id', subcategoryId);
    if (subsubId) query = query.eq('subsub_id', subsubId);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, results: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'server error' }, { status: 500 });
  }
}
