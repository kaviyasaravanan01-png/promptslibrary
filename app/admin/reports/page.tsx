"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';

const ADMIN_EMAIL = 'kaviyasaravanan01@gmail.com';

interface Report {
  id: string;
  prompt_id: string;
  user_id: string;
  reason: string;
  description: string;
  status: string;
  admin_notes: string;
  created_at: string;
  resolved_at: string;
  created_by_email: string;
  prompt: {
    id: string;
    title: string;
    slug: string;
    content_type: string;
  };
  user: {
    id: string;
    email: string;
  };
}

const REASON_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  spam: { label: 'Spam', color: 'bg-orange-900/20 border-orange-600/30', icon: '🚫' },
  inappropriate: { label: 'Inappropriate', color: 'bg-red-900/20 border-red-600/30', icon: '⚠️' },
  copyrighted: { label: 'Copyright', color: 'bg-purple-900/20 border-purple-600/30', icon: '©️' },
  broken: { label: 'Broken', color: 'bg-yellow-900/20 border-yellow-600/30', icon: '🔗' },
  misleading: { label: 'Misleading', color: 'bg-blue-900/20 border-blue-600/30', icon: '❓' },
  other: { label: 'Other', color: 'bg-gray-900/20 border-gray-600/30', icon: '📝' },
};

export default function AdminReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('open');
  const [filterReason, setFilterReason] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    let subscription: any;
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data.session?.user || null;
      setUser(currentUser);
      const res = await supabase.auth.onAuthStateChange((event, session) => setUser(session?.user || null));
      subscription = res?.data?.subscription || null;

      if (currentUser && currentUser.email === ADMIN_EMAIL) {
        fetchReports();
      } else {
        setLoading(false);
      }
    };
    init();
    return () => {
      try {
        subscription?.unsubscribe?.();
      } catch (e) {}
    };
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    try {
      const url = `/api/admin/reports?status=${filterStatus !== 'all' ? filterStatus : 'open'}&reason=${filterReason !== 'all' ? filterReason : ''}`;
      const res = await fetch(url, {
        headers: { authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setReports(json.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reportId: string, newStatus: 'resolved' | 'dismissed') => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportId,
          status: newStatus,
          adminNotes: adminNotes || null,
        }),
      });

      const json = await res.json();
      if (json.ok) {
        fetchReports();
        setReviewingId(null);
        setAdminNotes('');
      } else {
        alert(json.error || 'Failed to update report');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report');
    }
  };

  if (user?.email !== ADMIN_EMAIL) {
    return <div className="text-center py-12 text-gray-400">Access denied. Admin only.</div>;
  }

  const filteredReports = reports.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterReason !== 'all' && r.reason !== filterReason) return false;
    return true;
  });

  const stats = {
    open: reports.filter((r) => r.status === 'open').length,
    reviewing: reports.filter((r) => r.status === 'reviewing').length,
    resolved: reports.filter((r) => r.status === 'resolved').length,
    dismissed: reports.filter((r) => r.status === 'dismissed').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Report Dashboard</h1>
        <p className="text-gray-400">Review and manage user reports for problematic prompts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 cursor-pointer hover:bg-red-900/30 transition" onClick={() => { setFilterStatus('open'); fetchReports(); }}>
          <div className="text-2xl font-bold">{stats.open}</div>
          <div className="text-sm text-gray-400">Open</div>
        </div>
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 cursor-pointer hover:bg-yellow-900/30 transition" onClick={() => { setFilterStatus('reviewing'); fetchReports(); }}>
          <div className="text-2xl font-bold">{stats.reviewing}</div>
          <div className="text-sm text-gray-400">Reviewing</div>
        </div>
        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 cursor-pointer hover:bg-green-900/30 transition" onClick={() => { setFilterStatus('resolved'); fetchReports(); }}>
          <div className="text-2xl font-bold">{stats.resolved}</div>
          <div className="text-sm text-gray-400">Resolved</div>
        </div>
        <div className="bg-gray-900/20 border border-gray-600/30 rounded-lg p-4 cursor-pointer hover:bg-gray-900/30 transition" onClick={() => { setFilterStatus('dismissed'); fetchReports(); }}>
          <div className="text-2xl font-bold">{stats.dismissed}</div>
          <div className="text-sm text-gray-400">Dismissed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/5 rounded-lg p-4 mb-6 flex gap-4 items-center flex-wrap">
        <div>
          <label className="text-sm text-gray-300 mr-2">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              fetchReports();
            }}
            className="px-3 py-2 bg-black/20 rounded text-white text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-300 mr-2">Reason:</label>
          <select
            value={filterReason}
            onChange={(e) => {
              setFilterReason(e.target.value);
              fetchReports();
            }}
            className="px-3 py-2 bg-black/20 rounded text-white text-sm"
          >
            <option value="all">All Reasons</option>
            <option value="spam">Spam</option>
            <option value="inappropriate">Inappropriate</option>
            <option value="copyrighted">Copyright</option>
            <option value="broken">Broken</option>
            <option value="misleading">Misleading</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button
          onClick={fetchReports}
          className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No reports found</div>
        ) : (
          filteredReports.map((report) => {
            const reasonInfo = REASON_LABELS[report.reason] || REASON_LABELS.other;
            const isExpanded = expandedId === report.id;
            const isReviewing = reviewingId === report.id;

            return (
              <div
                key={report.id}
                className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/7 transition"
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer flex items-start justify-between"
                  onClick={() => setExpandedId(isExpanded ? null : report.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-sm font-semibold px-3 py-1 rounded border ${reasonInfo.color}`}>
                        {reasonInfo.icon} {reasonInfo.label}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        report.status === 'open' ? 'bg-red-600/30 text-red-300' :
                        report.status === 'reviewing' ? 'bg-yellow-600/30 text-yellow-300' :
                        report.status === 'resolved' ? 'bg-green-600/30 text-green-300' :
                        'bg-gray-600/30 text-gray-300'
                      }`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mb-1">
                      <Link href={`/prompt/${report.prompt.slug}`} className="hover:text-pink-400 transition">
                        {report.prompt.title}
                      </Link>
                    </h3>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>Reported by: {report.created_by_email}</p>
                      <p>Created: {new Date(report.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-white/10 p-4 space-y-4" onClick={e => e.stopPropagation()}>
                    {report.description && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Report Description</h4>
                        <p className="text-sm text-gray-300 bg-black/30 p-3 rounded">{report.description}</p>
                      </div>
                    )}

                    {report.admin_notes && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Admin Notes</h4>
                        <p className="text-sm text-gray-300 bg-black/30 p-3 rounded">{report.admin_notes}</p>
                      </div>
                    )}

                    {isReviewing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Admin Notes (Optional)</label>
                          <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Document your decision..."
                            className="w-full p-2 bg-black/20 rounded border border-white/10 text-white text-sm"
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolve(report.id, 'resolved')}
                            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition font-medium text-sm"
                          >
                            ✓ Take Action
                          </button>
                          <button
                            onClick={() => handleResolve(report.id, 'dismissed')}
                            className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition font-medium text-sm"
                          >
                            ✕ Dismiss
                          </button>
                          <button
                            onClick={() => {
                              setReviewingId(null);
                              setAdminNotes('');
                            }}
                            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition font-medium text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 pt-2">
                        {report.status === 'open' && (
                          <button
                            onClick={() => {
                              setReviewingId(report.id);
                              setAdminNotes('');
                            }}
                            className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded transition font-medium text-sm"
                          >
                            Start Review
                          </button>
                        )}
                        <Link
                          href={`/prompt/${report.prompt.slug}`}
                          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition font-medium text-sm text-center"
                        >
                          View Prompt
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
