import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabaseServer';
import crypto from 'crypto';

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const expected = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(raw).digest('hex');
    if (expected !== signature) {
      console.warn('razorpay webhook signature mismatch');
      return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(raw);
    const ev = payload.event;

    // handle payment captured
    if (ev === 'payment.captured' || ev === 'order.paid') {
      const payment = payload.payload?.payment?.entity || payload.payload?.order?.entity || null;
      if (payment) {
        const order_id = payment.order_id || payment.id;
        const payment_id = payment.id || null;
        const notes = payment.notes || {};
        const prompt_id = notes.prompt_id || notes.promptId || null;
        const user_id = notes.user_id || notes.userId || null;
        const amount = payment.amount || payment.amount_paid || 0;

        if (user_id && prompt_id) {
          const purchase = {
            user_id,
            prompt_id,
            provider: 'razorpay',
            provider_order_id: order_id,
            provider_payment_id: payment_id,
            amount: parseInt(String(amount), 10) || 0,
            currency: payment.currency || 'INR',
            status: 'completed',
            metadata: payload
          };
          const { error } = await supabaseAdmin.from('purchases').upsert(purchase);
          if (error) console.error('webhook purchase upsert error', error);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('webhook error', err);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('Supabase service role key not set');
}

const supabaseAdmin = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '');

export async function POST(req: Request) {
  const bodyText = await req.text();
  const signature = req.headers.get('x-razorpay-signature') || '';

  // Verify signature
  const expected = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET || '').update(bodyText).digest('hex');
  if (signature !== expected) {
    console.warn('Invalid razorpay signature', signature, expected);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const payload = JSON.parse(bodyText);
    // Example: payload.event = 'payment.captured' or 'order.paid'
    const event = payload.event;

    if (event === 'payment.captured' || event === 'payment.authorized') {
      const payment = payload.payload.payment.entity;
      // Retrieve receipt or metadata to map to user/prompt
      const notes = payment.notes || {};
      const userId = notes.user_id;
      const promptId = notes.prompt_id;
      const amount = payment.amount;
      const currency = payment.currency;

      // Upsert purchase record using supabase service role
      await supabaseAdmin.from('purchases').upsert({
        provider: 'razorpay',
        provider_order_id: payment.order_id,
        provider_payment_id: payment.id,
        user_id: userId,
        prompt_id: promptId,
        amount: amount,
        currency: currency,
        status: 'completed',
        metadata: payment
      }, { onConflict: ['user_id', 'prompt_id'] });

      return NextResponse.json({ ok: true });
    }

    // For other events, acknowledge
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('webhook error', err);
    return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
  }
}
