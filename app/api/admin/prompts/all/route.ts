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

    // Check if user is admin
    if (userData.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    // Fetch all prompts (all statuses)
    const { data, error: qErr } = await supabaseAdmin
      .from('prompts')
      .select('id, slug, title, description, model, status, is_featured, is_premium, price, content_type, created_at, created_by')
      .order('created_at', { ascending: false });

    if (qErr) {
      return NextResponse.json({ error: qErr.message }, { status: 500 });
    }

    return NextResponse.json({ prompts: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'server error' }, { status: 500 });
  }
}
