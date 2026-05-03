"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const CATEGORY_STYLES = {
  general:     { label: "General",     color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  tech:        { label: "Tech",        color: "bg-green-500/20 text-green-400 border-green-500/30" },
  confessions: { label: "Confessions", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  random:      { label: "Random",      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Comment ───────────────────────────────────────────────────────────────────

function Comment({ comment }) {
  const [upvotes, setUpvotes] = useState(comment.upvotes);
  const [downvotes, setDownvotes] = useState(comment.downvotes);

  async function vote(type) {
    try {
      const res = await fetch(`${API_URL}/api/forum/comments/${comment._id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (res.ok) {
        setUpvotes(data.upvotes);
        setDownvotes(data.downvotes);
      }
    } catch {}
  }

  return (
    <div className="flex flex-col gap-2.5 py-4 border-b border-white/[0.06] last:border-0">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className={comment.isGuest ? "text-gray-400" : "text-violet-400"}>{comment.username}</span>
        {comment.isGuest && (
          <span className="text-[9px] border border-gray-700 text-gray-600 rounded px-1 py-px">Guest</span>
        )}
        <span className="text-gray-700">·</span>
        <span>{timeAgo(comment.createdAt)}</span>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => vote("up")}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors px-2.5 py-1 rounded-lg hover:bg-green-500/10"
        >
          ⬆ {upvotes}
        </button>
        <button
          onClick={() => vote("down")}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors px-2.5 py-1 rounded-lg hover:bg-red-500/10"
        >
          ⬇ {downvotes}
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PostPage({ params }) {
  const { postId } = use(params);
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const username = localStorage.getItem("forum_username");
    const isGuest = localStorage.getItem("forum_isGuest") === "true";
    const token = localStorage.getItem("forum_token");
    if (!username) return router.replace("/forum/auth");
    setUser({ username, isGuest, token });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`${API_URL}/api/forum/posts/${postId}`).then((r) => r.json()),
      fetch(`${API_URL}/api/forum/posts/${postId}/comments`).then((r) => r.json()),
    ]).then(([postData, commentData]) => {
      if (postData.error) return setNotFound(true);
      setPost(postData);
      setUpvotes(postData.upvotes);
      setDownvotes(postData.downvotes);
      setComments(Array.isArray(commentData) ? commentData : []);
    }).catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [user, postId]);

  async function vote(type) {
    try {
      const res = await fetch(`${API_URL}/api/forum/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (res.ok) {
        setUpvotes(data.upvotes);
        setDownvotes(data.downvotes);
      }
    } catch {}
  }

  async function handleDelete() {
    if (!confirm("Delete this post and all its comments?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/forum/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.ok) router.push("/forum/home");
    } catch {}
    finally { setDeleting(false); }
  }

  async function handleComment(e) {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/forum/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text, username: user.username, isGuest: user.isGuest }),
      });
      const data = await res.json();
      if (res.ok) {
        setComments((prev) => [...prev, data]);
        setCommentText("");
      }
    } catch {}
    finally { setSubmitting(false); }
  }

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <p className="text-gray-600 text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-sm">Post not found.</p>
        <button onClick={() => router.push("/forum/home")} className="text-violet-400 text-sm hover:underline">
          ← Back to Forum
        </button>
      </div>
    );
  }

  const cat = CATEGORY_STYLES[post.category] || CATEGORY_STYLES.general;
  const isOwner = !user.isGuest && user.username === post.username;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <style>{`
        .field-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 14px; font-size: 14px; color: white; outline: none; transition: border-color 0.15s; resize: none; }
        .field-input:focus { border-color: rgba(139,92,246,0.5); }
        .field-input::placeholder { color: #4b5563; }
        .btn-primary { background: linear-gradient(to bottom, #7c3aed, #6d28d9); color: white; font-size: 14px; font-weight: 600; padding: 9px 20px; border-radius: 10px; border: none; cursor: pointer; transition: opacity 0.15s; }
        .btn-primary:hover:not(:disabled) { opacity: 0.85; }
        .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }
      `}</style>

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-violet-600/8 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">

        {/* Back link */}
        <button
          onClick={() => router.push("/forum/home")}
          className="text-gray-500 hover:text-white text-sm transition-colors mb-6 inline-block"
        >
          ← Back to Forum
        </button>

        {/* Post */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-[10px] font-semibold uppercase tracking-widest border rounded-full px-2.5 py-0.5 ${cat.color}`}>
              {cat.label}
            </span>
          </div>

          <h1 className="text-xl font-bold text-white leading-snug mb-3" style={{ fontFamily: "'Fjalla One', sans-serif" }}>
            {post.title}
          </h1>

          <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
            <span>Posted by</span>
            <span className={post.isGuest ? "text-gray-400" : "text-violet-400"}>{post.username}</span>
            {post.isGuest && (
              <span className="text-[9px] border border-gray-700 text-gray-600 rounded px-1 py-px">Guest</span>
            )}
            <span className="text-gray-700">·</span>
            <span>{timeAgo(post.createdAt)}</span>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap mb-6">{post.content}</p>

          {/* Vote row */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => vote("up")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-400 transition-colors px-3 py-1.5 rounded-xl hover:bg-green-500/10 border border-white/[0.06]"
            >
              ⬆ <span>{upvotes}</span>
            </button>
            <button
              onClick={() => vote("down")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-xl hover:bg-red-500/10 border border-white/[0.06]"
            >
              ⬇ <span>{downvotes}</span>
            </button>

            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="ml-auto text-xs text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-40"
              >
                {deleting ? "Deleting..." : "Delete Post"}
              </button>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-5">
            {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
          </h2>

          {/* Comment box */}
          <form onSubmit={handleComment} className="flex flex-col gap-3 mb-6">
            <textarea
              className="field-input"
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value.slice(0, 2000))}
              placeholder="Share your thoughts anonymously..."
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-700">{commentText.length}/2000</span>
              <button type="submit" disabled={submitting || !commentText.trim()} className="btn-primary text-sm">
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>

          {/* Comments list */}
          {comments.length === 0 ? (
            <p className="text-xs text-gray-600 italic text-center py-4">No comments yet. Be the first.</p>
          ) : (
            <div>
              {comments.map((c) => (
                <Comment key={c._id} comment={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
