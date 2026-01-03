import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const contentType = url.searchParams.get('contentType') || 'prompt';
    const limitParam = parseInt(url.searchParams.get('limit') || '15', 10);
    const daysParam = parseInt(url.searchParams.get('days') || '14', 10);
    const limit = Number.isFinite(limitParam) ? limitParam : 15;
    const recentDays = Number.isFinite(daysParam) ? daysParam : 14;

    const { data, error } = await supabaseAdmin.rpc('get_trending_content', {
      p_content_type: contentType,
      p_limit: limit,
      p_recent_days: recentDays,
    });

    if (error) {
      console.error('trending rpc error', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data || [] });
  } catch (err: any) {
    console.error('trending GET error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
