import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  const authHeader = req.headers.get('authorization');

  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  // fetch prompt row
  const { data: prompt } = await supabaseAdmin.from('prompts').select('id,is_premium,prompt_text,price').eq('slug', slug).single();
  if (!prompt) return NextResponse.json({ error: 'not found' }, { status: 404 });

  if (!prompt.is_premium) {
    return NextResponse.json({ prompt_text: prompt.prompt_text });
  }

  // if premium, require Authorization header with bearer token to identify user
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ locked: true }, { status: 401 });
  }

  const jwt = authHeader.split(' ')[1];
  // verify session and extract user id via Supabase Admin auth
  const { data: userData, error } = await supabaseAdmin.auth.getUser(jwt);
  if (error || !userData?.user) {
    return NextResponse.json({ locked: true }, { status: 401 });
  }

  const userId = userData.user.id;

  // check purchases
  const { data: purchase } = await supabaseAdmin.from('purchases').select('*').eq('user_id', userId).eq('prompt_id', prompt.id).eq('status', 'completed').single();

  if (purchase) {
    return NextResponse.json({ prompt_text: prompt.prompt_text });
  }

  return NextResponse.json({ locked: true }, { status: 402 });
}
