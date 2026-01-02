import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabaseServer';

const ADMIN_EMAIL = 'kaviyasaravanan01@gmail.com';

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

    // Check if user is admin
    if (userData.user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { promptId, status } = body;

    if (!promptId || !status) {
      return NextResponse.json({ error: 'promptId and status required' }, { status: 400 });
    }

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'invalid status' }, { status: 400 });
    }

    // Update prompt status
    const { error: updateErr } = await supabaseAdmin
      .from('prompts')
      .update({ status })
      .eq('id', promptId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Prompt ${status}` });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'server error' }, { status: 500 });
  }
}
