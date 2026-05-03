"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function fetchRandomUsername() {
  try {
    const res = await fetch(`${API_URL}/api/auth/guest`, { method: "POST" });
    const data = await res.json();
    return data.username;
  } catch {
    return "GuestUser_" + Math.floor(1000 + Math.random() * 9000);
  }
}

function ErrorMsg({ children }) {
  return (
    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">{children}</p>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] uppercase tracking-widest text-gray-500 font-medium">{label}</label>
      {children}
    </div>
  );
}

// ── Sign Up ───────────────────────────────────────────────────────────────────

function SignUpTab() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  function handleUsernameChange(e) {
    const val = e.target.value;
    setUsername(val);
    setAvailability(null);
    clearTimeout(debounceRef.current);
    if (!val.trim()) return;
    setAvailability("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/check-username/${encodeURIComponent(val.trim())}`);
        const data = await res.json();
        setAvailability(data.available ? "available" : "taken");
      } catch {
        setAvailability(null);
      }
    }, 500);
  }

  async function handleGenerate() {
    setAvailability("checking");
    const name = await fetchRandomUsername();
    setUsername(name);
    try {
      const res = await fetch(`${API_URL}/api/auth/check-username/${encodeURIComponent(name)}`);
      const data = await res.json();
      setAvailability(data.available ? "available" : "taken");
    } catch {
      setAvailability(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords do not match");
    if (availability === "taken") return setError("Username is already taken");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Registration failed");
      localStorage.setItem("forum_token", data.token);
      localStorage.setItem("forum_username", data.username);
      localStorage.setItem("forum_isGuest", "false");
      router.push("/forum/home");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="Username">
        <div className="flex gap-2">
          <input
            className="auth-input flex-1"
            value={username}
            onChange={handleUsernameChange}
            placeholder="SilentFox_4291"
            autoComplete="off"
          />
          <button type="button" onClick={handleGenerate} className="auth-btn-ghost px-4 text-xs whitespace-nowrap">
            ✦ Random
          </button>
        </div>
        <div className="h-4">
          {availability === "checking"  && <p className="text-[11px] text-gray-500">Checking...</p>}
          {availability === "available" && <p className="text-[11px] text-emerald-400">✓ Available</p>}
          {availability === "taken"     && <p className="text-[11px] text-red-400">✗ Already taken</p>}
        </div>
      </Field>

      <Field label="Password">
        <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </Field>

      <Field label="Confirm Password">
        <input className="auth-input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
      </Field>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <button type="submit" disabled={loading || !username.trim() || !password || !confirm} className="auth-btn-primary">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating...
          </span>
        ) : "Create Account"}
      </button>
    </form>
  );
}

// ── Log In ────────────────────────────────────────────────────────────────────

function LogInTab() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Login failed");
      localStorage.setItem("forum_token", data.token);
      localStorage.setItem("forum_username", data.username);
      localStorage.setItem("forum_isGuest", "false");
      router.push("/forum/home");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Field label="Username">
        <input className="auth-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your username" />
      </Field>

      <Field label="Password">
        <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </Field>

      {error && <ErrorMsg>{error}</ErrorMsg>}

      <button type="submit" disabled={loading || !username.trim() || !password} className="auth-btn-primary">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Logging in...
          </span>
        ) : "Log In"}
      </button>
    </form>
  );
}

// ── Guest ─────────────────────────────────────────────────────────────────────

function GuestTab() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetchRandomUsername().then(setUsername);
  }, []);

  async function handleRegenerate() {
    setUsername("");
    const name = await fetchRandomUsername();
    setUsername(name);
  }

  function handleContinue() {
    if (!username) return;
    localStorage.setItem("forum_username", username);
    localStorage.setItem("forum_isGuest", "true");
    localStorage.removeItem("forum_token");
    router.push("/forum/home");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl bg-violet-500/5 border border-violet-500/15 p-4 text-center">
        <p className="text-[11px] uppercase tracking-widest text-violet-400/70 mb-2">Your anonymous identity</p>
        <p className="text-xl font-bold text-violet-300 tracking-wide min-h-7">
          {username || <span className="text-gray-600 text-base font-normal animate-pulse">Generating...</span>}
        </p>
      </div>

      <Field label="Or type your own">
        <div className="flex gap-2">
          <input
            className="auth-input flex-1"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Custom guest name"
          />
          <button type="button" onClick={handleRegenerate} className="auth-btn-ghost px-4 text-xs whitespace-nowrap">
            ✦ New
          </button>
        </div>
      </Field>

      <p className="text-xs text-gray-600 text-center -mt-2">Temporary — not linked to any account</p>

      <button onClick={handleContinue} disabled={!username} className="auth-btn-primary">
        Enter as Guest
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "signup", label: "Sign Up" },
  { id: "login",  label: "Log In"  },
  { id: "guest",  label: "Guest"   },
];

export default function ForumAuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState("signup");

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <style>{`
        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          padding: 11px 16px;
          font-size: 14px;
          color: white;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .auth-input:focus {
          border-color: rgba(139,92,246,0.6);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.1);
        }
        .auth-input::placeholder { color: #374151; }
        .auth-btn-primary {
          width: 100%;
          background: linear-gradient(135deg, #7c3aed, #6d28d9);
          color: white;
          font-size: 14px;
          font-weight: 600;
          padding: 12px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 24px rgba(109,40,217,0.35);
          transition: box-shadow 0.2s, opacity 0.2s, transform 0.1s;
        }
        .auth-btn-primary:hover:not(:disabled) {
          box-shadow: 0 6px 30px rgba(109,40,217,0.5);
          transform: translateY(-1px);
        }
        .auth-btn-primary:active:not(:disabled) { transform: translateY(0); }
        .auth-btn-primary:disabled { opacity: 0.25; cursor: not-allowed; box-shadow: none; }
        .auth-btn-ghost {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          color: #9ca3af;
          border-radius: 14px;
          cursor: pointer;
          padding: 11px 14px;
          font-size: 12px;
          transition: color 0.15s, border-color 0.15s, background 0.15s;
          white-space: nowrap;
        }
        .auth-btn-ghost:hover { color: white; border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.07); }
        .tab-fade { animation: tabFade 0.2s cubic-bezier(0.4,0,0.2,1) both; }
        @keyframes tabFade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-violet-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-indigo-700/8 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 flex items-center gap-4 px-6 py-3.5 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl" style={{ fontFamily: "'Fjalla One', sans-serif" }}>
        <button onClick={() => router.push("/")} className="text-gray-500 hover:text-white text-sm transition-colors">
          ← Back
        </button>
        <div className="w-px h-4 bg-white/10" />
        <span className="text-lg tracking-wide">
          in<span className="text-transparent bg-clip-text bg-gradient-to-b from-violet-400 to-violet-600">L</span>ognito
          <span className="text-gray-500 font-normal text-sm ml-1">/ forum</span>
        </span>
      </header>

      {/* Centered card */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-57px)] px-4 py-12">
        <div className="w-full max-w-sm">

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Fjalla One', sans-serif" }}>
              Join the conversation
            </h2>
            <p className="text-sm text-gray-600">Anonymous by default. Always.</p>
          </div>

          {/* Card */}
          <div className="relative rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-[0_0_60px_rgba(109,40,217,0.08)] overflow-hidden">

            {/* Top glow line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

            {/* Tab bar */}
            <div className="flex border-b border-white/[0.06]">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="relative flex-1 py-3.5 text-sm font-medium transition-colors duration-200"
                  style={{ color: tab === t.id ? "white" : "#6b7280" }}
                >
                  {t.label}
                  {tab === t.id && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-violet-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6">
              <div key={tab} className="tab-fade">
                {tab === "signup" && <SignUpTab />}
                {tab === "login"  && <LogInTab />}
                {tab === "guest"  && <GuestTab />}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
