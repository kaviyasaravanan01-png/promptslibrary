import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabaseServer';

const ADMIN_EMAIL = 'kaviyasaravanan01@gmail.com';

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

    // Check admin
    if (userData.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status') || 'open';
    const reason = url.searchParams.get('reason');

    let query = supabaseAdmin
      .from('reports')
      .select(`
        *,
        prompt:prompt_id (id, title, slug, content_type),
        user:user_id (id, email)
      `)
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    if (reason) {
      query = query.eq('reason', reason);
    }

    const { data, error: fetchErr } = await query;

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, reports: data || [] });
  } catch (err: any) {
    console.error('fetch admin reports error', err);
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
    const { data: userData, error } = await supabaseAdmin.auth.getUser(jwt);
    if (error || !userData.user) {
      return NextResponse.json({ error: 'invalid token' }, { status: 401 });
    }

    // Check admin
    if (userData.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { reportId, status, adminNotes } = body;

    if (!reportId || !status) {
      return NextResponse.json({ error: 'reportId and status required' }, { status: 400 });
    }

    const validStatuses = ['open', 'reviewing', 'resolved', 'dismissed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'invalid status' }, { status: 400 });
    }

    // Update report
    const { data, error: updateErr } = await supabaseAdmin
      .from('reports')
      .update({
        status,
        admin_notes: adminNotes || null,
        resolved_at: status === 'resolved' || status === 'dismissed' ? new Date().toISOString() : null,
        resolved_by: status === 'resolved' || status === 'dismissed' ? userData.user.id : null,
      })
      .eq('id', reportId)
      .select('*')
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, report: data });
  } catch (err: any) {
    console.error('update report error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
