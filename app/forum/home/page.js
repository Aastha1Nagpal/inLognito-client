"use client";

import { useEffect, useState, useCallback } from "react";
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

// ── New Post Modal ────────────────────────────────────────────────────────────

function NewPostModal({ username, isGuest, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("general");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/forum/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), category, username, isGuest }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Failed to create post");
      onCreated(data);
      onClose();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-[0_0_80px_rgba(109,40,217,0.1)]">
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

        <h2 className="text-base font-bold mb-5" style={{ fontFamily: "'Fjalla One', sans-serif" }}>New Post</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="field-label">Title</label>
            <input
              className="field-input"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 200))}
              placeholder="What's on your mind?"
              autoFocus
            />
            <p className="text-[10px] text-gray-700 mt-1 text-right">{title.length}/200</p>
          </div>

          <div>
            <label className="field-label">Category</label>
            <select
              className="field-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="general">General</option>
              <option value="tech">Tech</option>
              <option value="confessions">Confessions</option>
              <option value="random">Random</option>
            </select>
          </div>

          <div>
            <label className="field-label">Content</label>
            <textarea
              className="field-input resize-none"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 5000))}
              placeholder="Write something..."
            />
            <p className="text-[10px] text-gray-700 mt-1 text-right">{content.length}/5000</p>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2.5 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="btn-primary flex-1"
            >
              {loading ? "Posting..." : "Post Anonymously"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────

function PostCard({ post, onClick }) {
  const cat = CATEGORY_STYLES[post.category] || CATEGORY_STYLES.general;
  const preview = post.content.length > 150 ? post.content.slice(0, 150) + "…" : post.content;

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col gap-3 bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.07] hover:border-violet-500/25 rounded-2xl p-5 cursor-pointer transition-all duration-200"
    >
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-semibold uppercase tracking-widest border rounded-full px-2.5 py-0.5 ${cat.color}`}>
          {cat.label}
        </span>
      </div>

      <div>
        <h3 className="text-base font-bold text-white leading-snug mb-1.5">{post.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{preview}</p>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
        <span className="flex items-center gap-1">
          <span>👤</span>
          <span className={post.isGuest ? "text-gray-500" : "text-violet-400"}>{post.username}</span>
          {post.isGuest && (
            <span className="text-[9px] border border-gray-700 text-gray-600 rounded px-1 py-px">Guest</span>
          )}
        </span>
        <span className="flex items-center gap-1"><span>⬆</span>{post.upvotes}</span>
        <span className="flex items-center gap-1"><span>💬</span>{post.commentCount}</span>
        <span className="flex items-center gap-1 ml-auto"><span>🕐</span>{timeAgo(post.createdAt)}</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const CATEGORIES = ["all", "general", "tech", "confessions", "random"];

export default function ForumHomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const username = localStorage.getItem("forum_username");
    const isGuest = localStorage.getItem("forum_isGuest") === "true";
    const token = localStorage.getItem("forum_token");
    if (!username) return router.replace("/forum/auth");
    setUser({ username, isGuest, token });
  }, [router]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (category !== "all") params.set("category", category);
      const res = await fetch(`${API_URL}/api/forum/posts?${params}`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [category, sort]);

  useEffect(() => {
    if (user) fetchPosts();
  }, [user, fetchPosts]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <style>{`
        .field-label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; margin-bottom: 6px; }
        .field-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 14px; font-size: 14px; color: white; outline: none; transition: border-color 0.15s; }
        .field-input:focus { border-color: rgba(139,92,246,0.5); }
        .field-input::placeholder { color: #4b5563; }
        .btn-primary { background: linear-gradient(to bottom, #7c3aed, #6d28d9); color: white; font-size: 14px; font-weight: 600; padding: 9px 16px; border-radius: 10px; border: none; cursor: pointer; transition: opacity 0.15s; }
        .btn-primary:hover:not(:disabled) { opacity: 0.85; }
        .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; }
        .btn-ghost { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #9ca3af; border-radius: 10px; cursor: pointer; padding: 9px 16px; font-size: 14px; transition: color 0.15s, border-color 0.15s; }
        .btn-ghost:hover { color: white; border-color: rgba(255,255,255,0.2); }
        select option { background: #111; }
      `}</style>

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-violet-600/8 rounded-full blur-[140px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-3.5 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl gap-4">
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => router.push("/")}
            className="text-gray-500 hover:text-white text-sm transition-colors"
          >
            ← Home
          </button>
          <div className="w-px h-4 bg-white/10" />
          <span className="text-base font-bold" style={{ fontFamily: "'Fjalla One', sans-serif" }}>
            in<span className="text-transparent bg-clip-text bg-gradient-to-b from-violet-400 to-violet-600">L</span>ognito
            <span className="text-gray-500 font-normal text-sm ml-1">Forums</span>
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
            <span>You are:</span>
            <span className={user.isGuest ? "text-gray-400" : "text-violet-400"}>{user.username}</span>
            <span className={`text-[10px] border rounded px-1.5 py-px ${user.isGuest ? "border-gray-700 text-gray-600" : "border-violet-700/50 text-violet-500"}`}>
              {user.isGuest ? "Guest" : "Member"}
            </span>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary text-sm">
            + New Post
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                  category === c
                    ? "bg-white text-black border-white font-semibold"
                    : "border-white/10 text-gray-500 hover:text-white hover:border-white/20"
                }`}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1">
            {["latest", "top"].map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`text-xs px-3 py-1.5 rounded-lg transition-colors capitalize ${
                  sort === s ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
                }`}
              >
                {s === "latest" ? "Latest" : "Top Voted"}
              </button>
            ))}
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-gray-500 text-sm mb-1">No posts yet</p>
            <p className="text-gray-700 text-xs mb-5">Be the first to post something</p>
            <button onClick={() => setShowModal(true)} className="btn-primary text-sm">
              + New Post
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onClick={() => router.push(`/forum/post/${post._id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <NewPostModal
          username={user.username}
          isGuest={user.isGuest}
          onClose={() => setShowModal(false)}
          onCreated={(post) => setPosts((prev) => [post, ...prev])}
        />
      )}
    </div>
  );
}
