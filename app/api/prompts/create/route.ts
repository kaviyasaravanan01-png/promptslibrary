import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

const ADMIN_EMAIL = 'anandanathurelangovan94@gmail.com';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'missing auth' }, { status: 401 });
    const jwt = authHeader.split(' ')[1];
    const { data: userData, error } = await supabaseAdmin.auth.getUser(jwt);
    if (error || !userData.user) return NextResponse.json({ error: 'invalid token' }, { status: 401 });

    console.log('[prompts/create] invoked by', userData.user.id, userData.user.email);

    const body = await req.json();
    const { title, description, model, prompt_text, result_urls, slug, categories } = body;
    if (!title || !slug) return NextResponse.json({ error: 'title and slug required' }, { status: 400 });

    // validate result_urls: array of { type: 'image'|'video'|'audio'|'scenario', url }
    if (!Array.isArray(result_urls) || result_urls.length < 1 || result_urls.length > 5) {
      return NextResponse.json({ error: 'result_urls must be array with 1..5 items' }, { status: 400 });
    }
    const allowed = ['image','video','audio','scenario'];
    const videoCount = result_urls.filter((r: any) => r.type === 'video').length;
    const imageCount = result_urls.filter((r: any) => r.type === 'image').length;
    if (videoCount > 1) return NextResponse.json({ error: 'only one video allowed' }, { status: 400 });
    if (imageCount < 1) return NextResponse.json({ error: 'at least one image required' }, { status: 400 });
    for (const r of result_urls) {
      if (!r.url || !allowed.includes(r.type)) return NextResponse.json({ error: 'invalid result_urls format' }, { status: 400 });
    }

    // validate categories: array up to 3 items with category_id and subcategory_id (subsub optional)
    if (!Array.isArray(categories) || categories.length < 1 || categories.length > 3) {
      return NextResponse.json({ error: 'categories must be array with 1..3 items' }, { status: 400 });
    }

    const isAdmin = userData.user.email === ADMIN_EMAIL;
    const status = isAdmin ? 'approved' : 'pending';

    const prompt = {
      title,
      slug,
      description: description || null,
      model: model || null,
      prompt_text: prompt_text || null,
      result_urls: result_urls || null,
      is_premium: false,
      price: 0,
      created_by: userData.user.id,
      status
    };

    const { data, error: insertErr } = await supabaseAdmin.from('prompts').insert(prompt).select('*').single();
    if (insertErr) {
      console.error('[prompts/create] insert error:', insertErr);
      // Provide a clearer hint if this is an RLS issue
      if (insertErr.message && insertErr.message.toLowerCase().includes('row-level security')) {
        return NextResponse.json({ error: 'row-level security prevented insert. Ensure SUPABASE_SERVICE_ROLE_KEY is set for server, or create an insert policy allowing created_by = auth.uid()' }, { status: 403 });
      }
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // Link prompt to categories
    for (const c of categories) {
      const catId = c.category_id;
      const subId = c.subcategory_id;
      const ssId = c.subsub_id || null;
      await supabaseAdmin.from('prompt_categories').upsert({ prompt_id: data.id, category_id: catId, subcategory_id: subId, subsub_id: ssId });
    }

    return NextResponse.json({ ok: true, prompt: data });
  } catch (err) {
    console.error('create prompt error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
