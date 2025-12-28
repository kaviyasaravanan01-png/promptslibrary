import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';
import crypto from 'crypto';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, user_id, prompt_id, amount } = body;
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) return NextResponse.json({ error: 'invalid payload' }, { status: 400 });

    const expected = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    if (expected !== razorpay_signature) return NextResponse.json({ error: 'invalid signature' }, { status: 400 });

    // insert purchase using service role
    const purchase = {
      user_id: user_id,
      prompt_id: prompt_id,
      provider: 'razorpay',
      provider_order_id: razorpay_order_id,
      provider_payment_id: razorpay_payment_id,
      amount: parseInt(amount, 10) || 0,
      currency: 'INR',
      status: 'completed'
    };

    const { error: upErr } = await supabaseAdmin.from('purchases').upsert(purchase);
    if (upErr) {
      console.error('purchase upsert err', upErr);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('verify error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 });
    }

    const generated = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated !== razorpay_signature) {
      return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
    }

    // Optionally, the client can pass notes (user_id, prompt_id). If not, webhook will run.
    const { user_id, prompt_id, amount, currency } = body;

    if (!user_id || !prompt_id) {
      // We'll still return ok — webhook will handle the upsert
      return NextResponse.json({ ok: true, warning: 'missing user_id or prompt_id; webhook will handle' });
    }

    // Insert purchase record with completed status using service role key
    await supabaseAdmin.from('purchases').upsert({
      provider: 'razorpay',
      provider_order_id: razorpay_order_id,
      provider_payment_id: razorpay_payment_id,
      user_id,
      prompt_id,
      amount: amount || 0,
      currency: currency || 'INR',
      status: 'completed',
      metadata: { verified_at: new Date().toISOString() }
    }, { onConflict: ['user_id', 'prompt_id'] });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('verify error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
