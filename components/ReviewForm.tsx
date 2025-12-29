"use client";
import { useState } from 'react';

export default function ReviewForm({ promptId, userId, onReview }: { promptId: string, userId: string, onReview?: () => void }) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId, rating, review_text: review, userId })
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to submit review');
      setSuccess(true);
      setReview('');
      setRating(0);
      if (onReview) onReview();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-black/10 rounded">
      <div className="flex items-center gap-2 mb-2">
        {[1,2,3,4,5].map(i => (
          <button type="button" key={i} onClick={() => setRating(i)} aria-label={`Rate ${i}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill={rating >= i ? '#facc15' : '#e5e7eb'}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          </button>
        ))}
        <span className="ml-2 text-sm text-yellow-400 font-bold">{rating > 0 ? rating : ''}</span>
      </div>
      <textarea
        className="w-full p-2 rounded bg-black/20 border border-gray-700 text-white mb-2"
        placeholder="Write your review..."
        value={review}
        onChange={e => setReview(e.target.value)}
        rows={2}
        required
      />
      <button type="submit" className="bg-pink-600 px-4 py-2 rounded text-white" disabled={loading || rating === 0}>
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
      {error && <div className="text-red-400 text-xs mt-2">{error}</div>}
      {success && <div className="text-green-400 text-xs mt-2">Review submitted!</div>}
    </form>
  );
}
