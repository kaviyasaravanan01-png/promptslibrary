import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

const ADMIN_EMAIL = 'kaviyasaravanan01@gmail.com';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'missing auth' }, { status: 401 });
    const jwt = authHeader.split(' ')[1];
    const { data: userData, error } = await supabaseAdmin.auth.getUser(jwt);
    if (error || !userData.user) return NextResponse.json({ error: 'invalid token' }, { status: 401 });

    console.log('[prompts/create] invoked by', userData.user.id, userData.user.email);

    const body = await req.json();
    const { title, description, model, prompt_text, prompt_template, result_urls, results, slug, categories, requirements, instructions, seo_title, seo_description, content_type, result_output_type, video_tutorial_categories, tags } = body;
    if (!title || !slug) return NextResponse.json({ error: 'title and slug required' }, { status: 400 });

    // Support both old (result_urls) and new (results) format
    const resultsArray = results || result_urls || [];
    
    // Validate results: array of { name, type, prompt_description, url, is_public_link, display_order }
    if (!Array.isArray(resultsArray) || resultsArray.length < 1 || resultsArray.length > 10) {
      return NextResponse.json({ error: 'results must be array with 1..10 items' }, { status: 400 });
    }
    
    const allowed = ['image', 'result_video', 'tutorial_video', 'video_link'];
    for (const r of resultsArray) {
      // For new format: check name, prompt_description, type, url
      if (r.name && r.prompt_description !== undefined) {
        if (!r.url || !allowed.includes(r.type)) {
          return NextResponse.json({ error: 'invalid result format: name, type, url, and prompt_description required' }, { status: 400 });
        }
      } else if (!r.url) {
        // Old format fallback
        return NextResponse.json({ error: 'invalid result format' }, { status: 400 });
      }
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
      prompt_template: prompt_template || null,
      result_urls: resultsArray || null,
      requirements: Array.isArray(requirements) ? requirements : null,
      instructions: Array.isArray(instructions) ? instructions : null,
      seo_title: seo_title || null,
      seo_description: seo_description || null,
      is_premium: false,
      price: 0,
      created_by: userData.user.id,
      status,
      content_type: content_type || 'prompt',
      result_output_type: content_type === 'video_tutorial' ? 'video' : (result_output_type || 'image'),
      video_tutorial_categories: content_type === 'video_tutorial' ? (Array.isArray(video_tutorial_categories) ? video_tutorial_categories : null) : null,
      tags: Array.isArray(tags) ? tags : []
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

    // Store results in prompt_results table if using new format
    if (results && Array.isArray(results) && results.length > 0) {
      const resultsToInsert = results.map((r: any, index: number) => ({
        prompt_id: data.id,
        name: r.name || `Result ${index + 1}`,
        type: r.type,
        prompt_description: r.prompt_description || '',
        url: r.url,
        is_public_link: r.is_public_link || false,
        display_order: r.display_order || index
      }));
      
      const { error: resultsErr } = await supabaseAdmin.from('prompt_results').insert(resultsToInsert);
      if (resultsErr) {
        console.error('[prompts/create] error storing results:', resultsErr);
        // Note: We successfully created the prompt, but failed to store results
        // This is logged but doesn't fail the whole operation
      }
    }

    return NextResponse.json({ ok: true, prompt: data });
  } catch (err) {
    console.error('create prompt error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
