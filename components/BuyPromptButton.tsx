"use client";

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

declare global {
  interface Window { Razorpay: any }
}

export default function BuyPromptButton({ promptId, amount }: { promptId: string; amount: number }) {
  const [loading, setLoading] = useState(false);

  const loadRazorpay = () => {
    if ((window as any).Razorpay) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(null);
      s.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.body.appendChild(s);
    });
  };

  const handleBuy = async () => {
    setLoading(true);
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) {
      alert('Please sign in');
      setLoading(false);
      return;
    }

    // Create order on server
    const res = await fetch('/api/payment/create-order', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify({ promptId, amount }) });
    const data = await res.json();
    if (!data.orderId) {
      alert('Could not create order');
      setLoading(false);
      return;
    }

    await loadRazorpay();

    const options = {
      key: data.keyId,
      amount: amount,
      order_id: data.orderId,
      handler: async function (response: any) {
        // Verify payment server-side
        const user = (await supabase.auth.getUser()).data.user;
        const verifyRes = await fetch('/api/payment/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ razorpay_payment_id: response.razorpay_payment_id, razorpay_order_id: response.razorpay_order_id, razorpay_signature: response.razorpay_signature, user_id: user?.id, prompt_id: promptId, amount }) });
        const verifyJson = await verifyRes.json();
        if (!verifyRes.ok) {
          alert('Payment verification failed: ' + (verifyJson.error || verifyJson.message || 'unknown'));
          return;
        }
        alert('Payment complete — prompt unlocked. Refresh to view.');
      },
      prefill: {},
      notes: { prompt_id: promptId }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
    setLoading(false);
  };

  return (
    <button onClick={handleBuy} disabled={loading} className="px-4 py-2 bg-cyan-500 text-black rounded">
      {loading ? 'Processing...' : `Buy for ₹${(amount/100).toFixed(2)}`}
    </button>
  );
}
