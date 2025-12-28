"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';

export default function AdminPurchasesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    let sub: any;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
      const res = await supabase.auth.onAuthStateChange((event, session) => setUser(session?.user || null));
      sub = res?.data?.subscription || null;
    };
    init();
    return () => { try { sub?.unsubscribe?.(); } catch (e) {} };
  }, []);

  useEffect(() => {
    const fetchPurchases = async () => {
      setLoading(true);
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) { setRows([]); setLoading(false); return; }
      const res = await fetch('/api/admin/purchases', { headers: { authorization: `Bearer ${token}` } });
      const json = await res.json();
      setRows(json.purchases || []);
      setLoading(false);
    };
    fetchPurchases();
  }, [user]);

  if (!user) return <div className="text-gray-400">Sign in as admin to view purchases</div>;

  return (
    <div>
      <header className="mb-4">
        <h2 className="text-2xl font-semibold">Admin — Purchases</h2>
      </header>

      {loading && <div className="text-gray-400">Loading...</div>}

      <div className="mt-4">
        <table className="w-full text-sm table-auto">
          <thead className="text-left text-gray-300">
            <tr>
              <th className="p-2">Date</th>
              <th className="p-2">User</th>
              <th className="p-2">Prompt</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Provider</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t border-white/5">
                <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="p-2">{r.profiles?.email || r.user_id}</td>
                <td className="p-2"><Link href={`/prompt/${r.prompts?.slug}`}>{r.prompts?.title || r.prompt_id}</Link></td>
                <td className="p-2">{r.amount} {r.currency}</td>
                <td className="p-2">{r.provider}</td>
                <td className="p-2">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
