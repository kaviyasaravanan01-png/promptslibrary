import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseServer';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const { data, error } = await supabaseAdmin.from('favorites').select('prompt_id, prompts(id,slug,title,description,model,result_urls,is_premium,price)').eq('user_id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ favorites: data });
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'missing auth' }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];
    const { data: userData, error } = await supabaseAdmin.auth.getUser(jwt);
    if (error || !userData.user) return NextResponse.json({ error: 'invalid token' }, { status: 401 });

    const userId = userData.user.id;
    const body = await req.json();
    const { promptId } = body;
    if (!promptId) return NextResponse.json({ error: 'promptId required' }, { status: 400 });

    const { data, error: upsertErr } = await supabaseAdmin.from('favorites').upsert({ user_id: userId, prompt_id: promptId });
    if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, favorite: data });
  } catch (err) {
    console.error('favorites post error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'missing auth' }, { status: 401 });
    }
    const jwt = authHeader.split(' ')[1];
    const { data: userData, error } = await supabaseAdmin.auth.getUser(jwt);
    if (error || !userData.user) return NextResponse.json({ error: 'invalid token' }, { status: 401 });

    const userId = userData.user.id;
    const url = new URL(req.url);
    const promptId = url.searchParams.get('promptId');
    if (!promptId) return NextResponse.json({ error: 'promptId required' }, { status: 400 });

    const { error: delErr } = await supabaseAdmin.from('favorites').delete().match({ user_id: userId, prompt_id: promptId });
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('favorites delete error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
