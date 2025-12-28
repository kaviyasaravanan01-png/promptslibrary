import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';
import Razorpay from 'razorpay';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.warn('Razorpay keys not set in env');
}

const razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ error: 'missing auth' }, { status: 401 });
    const jwt = authHeader.split(' ')[1];
    const { data: userData, error: uErr } = await supabaseAdmin.auth.getUser(jwt);
    if (uErr || !userData.user) return NextResponse.json({ error: 'invalid token' }, { status: 401 });

    const body = await req.json();
    const { promptId, amount, currency = 'INR', receipt } = body;
    if (!promptId || !amount) return NextResponse.json({ error: 'promptId and amount required' }, { status: 400 });

    const { data: prompt, error: pErr } = await supabaseAdmin.from('prompts').select('id,is_premium,price,title').eq('id', promptId).single();
    if (pErr || !prompt) return NextResponse.json({ error: 'prompt not found' }, { status: 404 });
    if (!prompt.is_premium) return NextResponse.json({ error: 'prompt is not premium' }, { status: 400 });

    const options: any = {
      amount: Number(amount),
      currency,
      receipt: receipt || `prompt_${promptId}_${userData.user.id}_${Date.now()}`,
      notes: { prompt_id: promptId, user_id: userData.user.id },
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options as any);

    return NextResponse.json({ ok: true, orderId: order.id, keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '' });
  } catch (err: any) {
    console.error('create-order error', err);
    return NextResponse.json({ error: err?.message || 'server error' }, { status: 500 });
  }
}
