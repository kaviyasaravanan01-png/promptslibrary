import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const { data, error } = await supabaseAdmin.from('prompts').select('*').eq('created_by', userId).order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ prompts: data });
  } catch (err) {
    console.error('my prompts err', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
