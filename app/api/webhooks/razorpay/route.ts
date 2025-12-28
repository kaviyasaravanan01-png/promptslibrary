import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '../../../../lib/supabaseServer';

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

    if (ev === 'payment.captured' || ev === 'order.paid' || ev === 'payment.authorized') {
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
            metadata: payment
          };
          const { error } = await supabaseAdmin.from('purchases').upsert(purchase, { onConflict: ['user_id', 'prompt_id'] });
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
