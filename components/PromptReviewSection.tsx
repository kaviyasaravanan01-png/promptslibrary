"use client";
import { useEffect, useState } from 'react';
import ReviewStats from './ReviewStats';
import ReviewForm from './ReviewForm';
import { supabase } from '../lib/supabaseClient';

export default function PromptReviewSection({ promptId, isPremium }: { promptId: string, isPremium: boolean }) {
  const [userId, setUserId] = useState<string>('');
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id || '';
      setUserId(uid);
      if (!uid) {
        setCanReview(false);
        return;
      }
      if (!isPremium) {
        setCanReview(true);
      } else {
        // For premium, check if user purchased
        const { data: purchase } = await supabase
          .from('purchases')
          .select('id')
          .eq('prompt_id', promptId)
          .eq('user_id', uid)
          .single();
        setCanReview(!!purchase);
      }
    }
    check();
    return () => { ignore = true; };
  }, [promptId, isPremium]);

  return (
    <div className="mt-2">
      <ReviewStats promptId={promptId} />
      {canReview && userId && (
        <ReviewForm promptId={promptId} userId={userId} onReview={() => {}} />
      )}
    </div>
  );
}
