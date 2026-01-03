import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'missing auth' }, { status: 401 });
    }

    const jwt = authHeader.split(' ')[1];
    const { data: userData, error } = await supabaseAdmin.auth.getUser(jwt);
    if (error || !userData.user) {
      return NextResponse.json({ error: 'invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const { promptId, reason, description } = body;

    if (!promptId || !reason) {
      return NextResponse.json({ error: 'promptId and reason required' }, { status: 400 });
    }

    const validReasons = ['spam', 'inappropriate', 'copyrighted', 'broken', 'misleading', 'other'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: 'invalid reason' }, { status: 400 });
    }

    // Check if user already reported this prompt
    const { data: existing } = await supabaseAdmin
      .from('reports')
      .select('id')
      .eq('prompt_id', promptId)
      .eq('user_id', userData.user.id)
      .eq('status', 'open')
      .single();

    if (existing) {
      return NextResponse.json({ error: 'You have already reported this prompt' }, { status: 400 });
    }

    // Create report
    const { data, error: insertErr } = await supabaseAdmin
      .from('reports')
      .insert({
        prompt_id: promptId,
        user_id: userData.user.id,
        reason,
        description: description || null,
        created_by_email: userData.user.email,
      })
      .select('*')
      .single();

    if (insertErr) {
      console.error('[reports/create] error:', insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, report: data });
  } catch (err: any) {
    console.error('create report error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'missing auth' }, { status: 401 });
    }

    const jwt = authHeader.split(' ')[1];
    const { data: userData, error } = await supabaseAdmin.auth.getUser(jwt);
    if (error || !userData.user) {
      return NextResponse.json({ error: 'invalid token' }, { status: 401 });
    }

    // Get user's own reports
    const { data, error: fetchErr } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reports: data || [] });
  } catch (err: any) {
    console.error('fetch reports error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
