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

    const user = userData.user;
    // Extract common metadata fields (Supabase stores OAuth metadata in user.user_metadata)
    const metadata: any = user.user_metadata || {};
    const fullName = metadata.full_name || metadata.name || user.email?.split('@')[0] || null;
    const avatar = metadata.avatar_url || metadata.picture || metadata.avatar || null;

    const profile = {
      id: user.id,
      full_name: fullName,
      avatar_url: avatar
    };

    await supabaseAdmin.from('profiles').upsert(profile);

    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    console.error('profile upsert error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
