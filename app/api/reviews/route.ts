import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseServer';

// GET: /api/reviews?promptId=...
export async function GET(req: Request) {
  const url = new URL(req.url);
  const promptId = url.searchParams.get('promptId');
  if (!promptId) return NextResponse.json({ error: 'Missing promptId' }, { status: 400 });
  // Get average rating and review count
  const { data, error } = await supabaseAdmin.rpc('get_prompt_review_stats', { p_prompt_id: promptId });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Get recent reviews (limit 5)
  const { data: reviews, error: err2 } = await supabaseAdmin
    .from('reviews')
    .select('id, user_id, rating, review_text, created_at')
    .eq('prompt_id', promptId)
    .order('created_at', { ascending: false })
    .limit(5);
  return NextResponse.json({ stats: data?.[0] || { avg_rating: 0, review_count: 0 }, reviews: reviews || [] });
}

// POST: /api/reviews (body: { promptId, rating, review_text, userId })
export async function POST(req: Request) {
  const body = await req.json();
  const { promptId, rating, review_text, userId } = body;
  if (!promptId || !rating || !userId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  // Check if prompt is premium
  const { data: prompt, error: promptErr } = await supabaseAdmin
    .from('prompts')
    .select('is_premium')
    .eq('id', promptId)
    .single();
  if (promptErr || !prompt) return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
  if (prompt.is_premium) {
    // For premium, check if user purchased
    const { data: purchase } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('prompt_id', promptId)
      .eq('user_id', userId)
      .single();
    if (!purchase) return NextResponse.json({ error: 'Only paid users can review' }, { status: 403 });
  }
  // Upsert review (one per user per prompt)
  const { data: reviewData, error } = await supabaseAdmin
    .from('reviews')
    .upsert({ prompt_id: promptId, user_id: userId, rating, review_text, updated_at: new Date() }, { onConflict: 'prompt_id,user_id' })
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, review: reviewData?.[0] });
}
