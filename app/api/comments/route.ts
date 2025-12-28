import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseServer';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

  // fetch prompt id by slug
  const { data: prompt, error: pErr } = await supabaseAdmin.from('prompts').select('id').eq('slug', slug).single();
  if (pErr || !prompt) return NextResponse.json({ error: 'prompt not found' }, { status: 404 });

  // select comments with author profile
  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('id,content,user_id,created_at,parent_id, profiles(full_name, avatar_url)')
    .eq('prompt_id', prompt.id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // build nested comment tree (roots have parent_id = null)
  const nodes: Record<string, any> = {};
  const roots: any[] = [];

  for (const row of data || []) {
    const node = {
      id: row.id,
      content: row.content,
      user: { id: row.user_id, full_name: row.profiles?.full_name || null, avatar_url: row.profiles?.avatar_url || null },
      parentId: row.parent_id || null,
      created_at: row.created_at,
      replies: []
    };
    nodes[node.id] = node;
  }

  for (const id in nodes) {
    const node = nodes[id];
    if (node.parentId && nodes[node.parentId]) {
      nodes[node.parentId].replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return NextResponse.json({ comments: roots });
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
    const { slug, content, parentId } = body;
    if (!slug || !content) return NextResponse.json({ error: 'slug and content required' }, { status: 400 });

    const { data: prompt } = await supabaseAdmin.from('prompts').select('id').eq('slug', slug).single();
    if (!prompt) return NextResponse.json({ error: 'prompt not found' }, { status: 404 });

    const insertPayload: any = { prompt_id: prompt.id, user_id: userId, content };
    if (parentId) insertPayload.parent_id = parentId;

    const { data: inserted, error: insertErr } = await supabaseAdmin.from('comments').insert(insertPayload).select();
    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, comment: inserted?.[0] });
  } catch (err) {
    console.error('comments post error', err);
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
    const commentId = url.searchParams.get('commentId');
    if (!commentId) return NextResponse.json({ error: 'commentId required' }, { status: 400 });

    // ensure owner
    const { data: comment } = await supabaseAdmin.from('comments').select('user_id').eq('id', commentId).single();
    if (!comment) return NextResponse.json({ error: 'not found' }, { status: 404 });
    if (comment.user_id !== userId) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const { error: delErr } = await supabaseAdmin.from('comments').delete().eq('id', commentId);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('comments delete error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
