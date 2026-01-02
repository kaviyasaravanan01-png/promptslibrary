import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabaseServer';

const ADMIN_EMAIL = 'kaviyasaravanan01@gmail.com';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'missing auth' }, { status: 401 });
    const jwt = authHeader.split(' ')[1];
    const { data: userData, error } = await supabaseAdmin.auth.getUser(jwt);
    if (error || !userData.user) return NextResponse.json({ error: 'invalid token' }, { status: 401 });
    if (userData.user.email !== ADMIN_EMAIL) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const { data, error: updErr } = await supabaseAdmin.from('prompts').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', id).select('*').single();
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
    return NextResponse.json({ ok: true, prompt: data });
  } catch (err) {
    console.error('approve err', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
