import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

const ADMIN_EMAIL = 'anandanathurelangovan94@gmail.com';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'missing auth' }, { status: 401 });
    const jwt = authHeader.split(' ')[1];
    const { data: userData, error } = await supabaseAdmin.auth.getUser(jwt);
    if (error || !userData.user) return NextResponse.json({ error: 'invalid token' }, { status: 401 });

    const body = await req.json();
    // allow owner or admin to update
    const { data: existing } = await supabaseAdmin.from('prompts').select('*').eq('id', id).single();
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const isOwner = existing.created_by === userData.user.id;
    const isAdmin = userData.user.email === ADMIN_EMAIL;
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const updates = { ...body, updated_at: new Date().toISOString() };
    const { data, error: updErr } = await supabaseAdmin.from('prompts').update(updates).eq('id', id).select('*').single();
    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
    return NextResponse.json({ ok: true, prompt: data });
  } catch (err) {
    console.error('update prompt err', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'missing auth' }, { status: 401 });
    const jwt = authHeader.split(' ')[1];
    const { data: userData, error } = await supabaseAdmin.auth.getUser(jwt);
    if (error || !userData.user) return NextResponse.json({ error: 'invalid token' }, { status: 401 });

    const { data: existing } = await supabaseAdmin.from('prompts').select('*').eq('id', id).single();
    if (!existing) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const isOwner = existing.created_by === userData.user.id;
    const isAdmin = userData.user.email === ADMIN_EMAIL;
    if (!isOwner && !isAdmin) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const { error: delErr } = await supabaseAdmin.from('prompts').delete().eq('id', id);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('delete prompt err', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const { data, error } = await supabaseAdmin.from('prompts').select('*').eq('id', id).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ prompt: data });
  } catch (err) {
    console.error('get prompt err', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
