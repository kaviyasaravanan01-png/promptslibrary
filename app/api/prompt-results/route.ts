import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const promptId = url.searchParams.get('promptId');

    if (!promptId) {
      return NextResponse.json({ error: 'promptId required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('prompt_results')
      .select('*')
      .eq('prompt_id', promptId)
      .order('display_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ results: data || [] });
  } catch (err: any) {
    console.error('prompt results GET error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'missing auth' }, { status: 401 });
    }

    const jwt = authHeader.split(' ')[1];
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(jwt);
    if (authError || !userData.user) {
      return NextResponse.json({ error: 'invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { promptId, name, type, prompt, url, is_public_link, display_order } = body;

    if (!promptId || !name || !type || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user owns the prompt
    const { data: prompt_data, error: promptError } = await supabaseAdmin
      .from('prompts')
      .select('id, created_by')
      .eq('id', promptId)
      .single();

    if (promptError || !prompt_data || prompt_data.created_by !== userData.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('prompt_results')
      .insert({
        prompt_id: promptId,
        name,
        type,
        prompt_description: prompt,
        url,
        is_public_link: is_public_link || false,
        display_order: display_order || 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ result: data });
  } catch (err: any) {
    console.error('prompt results POST error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'missing auth' }, { status: 401 });
    }

    const jwt = authHeader.split(' ')[1];
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(jwt);
    if (authError || !userData.user) {
      return NextResponse.json({ error: 'invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { resultId, name, type, prompt, url, is_public_link, display_order } = body;

    if (!resultId) {
      return NextResponse.json({ error: 'resultId required' }, { status: 400 });
    }

    // Verify user owns the result
    const { data: result_data } = await supabaseAdmin
      .from('prompt_results')
      .select('id, prompt_id')
      .eq('id', resultId)
      .single();

    if (!result_data) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }

    const { data: prompt_data } = await supabaseAdmin
      .from('prompts')
      .select('id, created_by')
      .eq('id', result_data.prompt_id)
      .single();

    if (!prompt_data || prompt_data.created_by !== userData.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updateObj: any = { updated_at: new Date().toISOString() };
    if (name !== undefined) updateObj.name = name;
    if (type !== undefined) updateObj.type = type;
    if (prompt !== undefined) updateObj.prompt_description = prompt;
    if (url !== undefined) updateObj.url = url;
    if (is_public_link !== undefined) updateObj.is_public_link = is_public_link;
    if (display_order !== undefined) updateObj.display_order = display_order;

    const { data, error } = await supabaseAdmin
      .from('prompt_results')
      .update(updateObj)
      .eq('id', resultId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ result: data });
  } catch (err: any) {
    console.error('prompt results PATCH error', err);
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
    const { data: userData, error: authError } = await supabaseAdmin.auth.getUser(jwt);
    if (authError || !userData.user) {
      return NextResponse.json({ error: 'invalid token' }, { status: 401 });
    }

    const url = new URL(req.url);
    const resultId = url.searchParams.get('resultId');

    if (!resultId) {
      return NextResponse.json({ error: 'resultId required' }, { status: 400 });
    }

    // Verify user owns the result
    const { data: result_data } = await supabaseAdmin
      .from('prompt_results')
      .select('id, prompt_id')
      .eq('id', resultId)
      .single();

    if (!result_data) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }

    const { data: prompt_data } = await supabaseAdmin
      .from('prompts')
      .select('id, created_by')
      .eq('id', result_data.prompt_id)
      .single();

    if (!prompt_data || prompt_data.created_by !== userData.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('prompt_results')
      .delete()
      .eq('id', resultId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('prompt results DELETE error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
