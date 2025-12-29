// Force dynamic rendering and Node.js runtime for logging
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseServer';

export async function GET(req: Request) {
  try {
    console.log('[API/search] Received request');
    const url = new URL(req.url);
    const q = url.searchParams.get('q') || '';
    const page = parseInt(url.searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(url.searchParams.get('limit') || '24', 10) || 24;
    const offset = (page - 1) * limit;

    console.log('[API/search] Incoming search', { q, page, limit, offset });
    const { data, error } = await supabaseAdmin.rpc('search_prompts', { p_query: q, p_limit: limit, p_offset: offset });
    if (error) {
      console.error('[API/search] search_prompts RPC error', error, { q, limit, offset });
      return NextResponse.json({ error: error.message || 'search error', debug: { q, limit, offset } }, { status: 500 });
    }
    if (!data) {
      console.error('[API/search] search_prompts: no data returned', { q, limit, offset });
      return NextResponse.json({ ok: false, results: [], debug: { q, limit, offset } });
    }
    console.log('[API/search] search_prompts results', { q, count: data.length, data });
    return NextResponse.json({ ok: true, results: data });
  } catch (err: any) {
    console.error('[API/search] search error', err);
    return NextResponse.json({ error: err?.message || 'server error' }, { status: 500 });
  }
}
