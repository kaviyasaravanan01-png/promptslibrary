"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function CommentItem({ comment, onReply, currentUserId, onDelete }: { comment: any; onReply: (parentId: string) => void; currentUserId?: string | null; onDelete: (id: string) => void }) {
  return (
    <li className="p-3 bg-white/3 rounded">
      <div className="flex items-start gap-3">
        {comment.user?.avatar_url ? (
          <img src={comment.user.avatar_url} className="w-10 h-10 rounded-full" alt={comment.user.full_name} />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center">{(comment.user?.full_name || '?')[0]}</div>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">{comment.user?.full_name || 'Anonymous'}</div>
            <div>
              {currentUserId && comment.user?.id === currentUserId && (
                <button onClick={() => onDelete(comment.id)} className="text-xs text-red-400 mr-3">Delete</button>
              )}
              <button onClick={() => onReply(comment.id)} className="text-xs text-cyan-300">Reply</button>
            </div>
          </div>
          <div className="text-sm text-gray-200 mt-1">{comment.content}</div>
          <div className="text-xs text-gray-400 mt-2">{new Date(comment.created_at).toLocaleString()}</div>

          {comment.replies && comment.replies.length > 0 && (
            <ul className="mt-3 space-y-2 ml-8">
              {comment.replies.map((r: any) => (
                <CommentItem key={r.id} comment={r} onReply={onReply} currentUserId={currentUserId} onDelete={onDelete} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}

export default function CommentList({ slug }: { slug: string }) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchComments = async () => {
    const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`);
    const d = await res.json();
    setComments(d.comments || []);
  };

  useEffect(() => { fetchComments(); }, [slug]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setCurrentUserId(data.session?.user?.id || null);
    })();
  }, []);

  const post = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) return alert('Please sign in');

    const body: any = { slug, content: text };
    if (replyTo) body.parentId = replyTo;
    await fetch('/api/comments', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    setText('');
    setReplyTo(null);
    fetchComments();
  };

  const startReply = (parentId: string) => {
    setReplyTo(parentId);
    const el = document.getElementById('comment-input');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (commentId: string) => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    if (!token) return alert('Please sign in');
    const res = await fetch(`/api/comments?commentId=${commentId}`, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } });
    const d = await res.json();
    if (d.ok) fetchComments(); else alert(d.error || 'Failed to delete');
  };

  return (
    <div className="mt-6">
      <h4 className="text-lg">Comments</h4>
      <div className="mt-2" id="comment-input">
        {replyTo && <div className="text-xs text-gray-300 mb-2">Replying to comment {replyTo} — <button className="text-xs text-red-400" onClick={() => setReplyTo(null)}>Cancel</button></div>}
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full p-2 bg-white/5 rounded" placeholder={replyTo ? 'Write a reply' : 'Write a comment'} />
        <button onClick={post} className="mt-2 px-3 py-2 bg-white/6 rounded">Post</button>
      </div>

      <ul className="mt-4 space-y-3">
        {comments.map(c => (
          <CommentItem key={c.id} comment={c} onReply={startReply} currentUserId={currentUserId} onDelete={handleDelete} />
        ))}
      </ul>
    </div>
  );
}
