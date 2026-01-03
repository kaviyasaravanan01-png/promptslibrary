"use client";

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface ReportModalProps {
  promptId: string;
  promptTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or Scam', icon: '🚫' },
  { value: 'inappropriate', label: 'Inappropriate Content', icon: '⚠️' },
  { value: 'copyrighted', label: 'Copyright Violation', icon: '©️' },
  { value: 'broken', label: 'Broken or Non-functional', icon: '🔗' },
  { value: 'misleading', label: 'Misleading Information', icon: '❓' },
  { value: 'other', label: 'Other', icon: '📝' },
];

export default function ReportModal({ promptId, promptTitle, isOpen, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please select a reason');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setError('Please sign in to report');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          promptId,
          reason,
          description: description || null,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Failed to submit report');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setReason('');
        setDescription('');
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error submitting report');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-md w-full border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Report Prompt</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Reporting: <span className="text-white font-medium">{promptTitle}</span>
        </p>

        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✓</div>
            <p className="text-green-400 font-medium">Report submitted successfully!</p>
            <p className="text-sm text-gray-400 mt-2">Thank you for helping us maintain quality.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Reason for Report *</label>
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <label
                    key={r.value}
                    className="flex items-center p-3 rounded border border-white/10 cursor-pointer hover:bg-white/5 transition"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={(e) => setReason(e.target.value)}
                      className="mr-3"
                    />
                    <span className="mr-2">{r.icon}</span>
                    <span className="text-sm">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Additional Details</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain why you're reporting this prompt (optional)"
                className="w-full p-2 bg-black/20 rounded border border-white/10 text-white text-sm resize-none"
                rows={3}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-600/30 rounded text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded transition font-medium"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
