import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

const ADMIN_EMAIL = 'kaviyasaravanan01@gmail.com';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'missing auth' }, { status: 401 });
    const jwt = authHeader.split(' ')[1];
    const { data: userData, error } = await supabaseAdmin.auth.getUser(jwt);
    if (error || !userData?.user) return NextResponse.json({ error: 'invalid token' }, { status: 401 });
    if (userData.user.email !== ADMIN_EMAIL) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const { data, error: qErr } = await supabaseAdmin
      .from('purchases')
      .select(`id,user_id,prompt_id,amount,currency,status,provider,provider_order_id,provider_payment_id,created_at, profiles:user_id(id,full_name,email), prompts:prompt_id(id,title,slug)`)
      .order('created_at', { ascending: false });

    if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });
    return NextResponse.json({ purchases: data });
  } catch (err) {
    console.error('admin purchases err', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
