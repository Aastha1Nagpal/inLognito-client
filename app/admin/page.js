"use client";

import { useEffect, useState } from "react";

const API_URL = "http://localhost:4000";
const ADMIN_PASSWORD = "inlognito_admin_2024";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDay(iso) {
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function parseUA(ua = "") {
  if (!ua) return "Unknown";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return ua.slice(0, 40);
}

// ── Password Gate ─────────────────────────────────────────────────────────────

function PasswordGate({ onUnlock }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (value === ADMIN_PASSWORD) { onUnlock(); }
    else { setError(true); setValue(""); }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold mb-1">Admin Access</h1>
        <p className="text-xs text-gray-500 mb-6">Enter the admin password to continue.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            placeholder="Password"
            autoFocus
            className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-violet-600 transition-colors"
          />
          {error && <p className="text-xs text-red-400">Incorrect password.</p>}
          <button type="submit" className="bg-linear-to-b from-violet-500 to-violet-700 hover:from-violet-400 hover:to-violet-600 transition-all text-white text-sm font-semibold py-2.5 rounded-lg">
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Room Chat Modal ───────────────────────────────────────────────────────────

function RoomChatModal({ roomName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/admin/rooms/${roomName}/messages`)
      .then((r) => r.json())
      .then((data) => { setMessages(data); setLoading(false); });
  }, [roomName]);

  const filtered = messages.filter((m) => {
    const q = search.toLowerCase();
    return m.username.toLowerCase().includes(q) || m.message.toLowerCase().includes(q);
  });

  const userMessages = messages.filter((m) => !m.isSystem);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="font-bold text-base"><span className="text-violet-400">#</span>{roomName}</h2>
            <p className="text-xs text-gray-600">{userMessages.length} messages total</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-sm transition-colors">✕ Close</button>
        </div>

        <div className="px-5 py-3 border-b border-white/10">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by username or keyword..."
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-violet-600 transition-colors"
          />
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-3 space-y-1.5">
          {loading ? (
            <p className="text-gray-600 text-sm animate-pulse py-4">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-700 text-xs italic py-4">No messages found.</p>
          ) : (
            filtered.map((m) =>
              m.isSystem ? (
                <p key={m._id} className="text-xs text-gray-600 italic text-center py-0.5">{m.message}</p>
              ) : (
                <p key={m._id} className="text-sm text-gray-300">
                  <span className="text-gray-600 text-xs mr-2">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-violet-400 font-medium mr-1">{m.username}:</span>
                  {m.message}
                </p>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ── Session Detail Modal ──────────────────────────────────────────────────────

function SessionModal({ session, onClose }) {
  const isOnline = !session.leftAt;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="font-bold text-base">Session Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-sm transition-colors">✕ Close</button>
        </div>
        <div className="px-5 py-4 space-y-3 text-sm">
          <Row label="Username" value={<span className="text-violet-400">{session.username}</span>} />
          <Row label="Status" value={isOnline
            ? <span className="text-green-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" /> Online</span>
            : <span className="text-gray-500">Offline</span>}
          />
          <Row label="Session ID" value={<span className="text-gray-500 text-xs font-mono break-all">{session.sessionId}</span>} />
          <Row label="IP Address" value={session.ipAddress} />
          <Row label="Browser" value={parseUA(session.userAgent)} />
          <Row label="Joined At" value={formatDate(session.joinedAt)} />
          <Row label="Left At" value={formatDate(session.leftAt)} />
          <Row label="Messages Sent" value={session.messageCount} />
          <div className="pt-1">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Rooms Visited</p>
            {session.roomsVisited.length === 0 ? (
              <p className="text-gray-600 text-xs italic">None</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {session.roomsVisited.map((r) => (
                  <span key={r} className="text-xs bg-violet-900/30 text-violet-400 border border-violet-700/30 px-2 py-0.5 rounded">#{r}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-gray-500 text-xs uppercase tracking-widest shrink-0">{label}</span>
      <span className="text-gray-200 text-right">{value}</span>
    </div>
  );
}

// ── Messages Tab ──────────────────────────────────────────────────────────────

function MessagesTab({ messages }) {
  const [search, setSearch] = useState("");
  const filtered = messages.filter((m) => m.roomName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Filter by room name..."
        className="w-full max-w-xs bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-violet-600 transition-colors"
      />
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#111111] text-gray-500 text-xs uppercase tracking-widest">
            <tr>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3 whitespace-nowrap">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-600 italic text-xs">No messages found.</td></tr>
            ) : filtered.map((m) => (
              <tr key={m._id} className="border-t border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-violet-400 font-medium whitespace-nowrap">#{m.roomName}</td>
                <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{m.isSystem ? <span className="text-gray-600 italic">system</span> : m.username}</td>
                <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{m.message}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">{formatDate(m.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-600">{filtered.length} message{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
}

// ── Rooms Tab ─────────────────────────────────────────────────────────────────

function RoomsTab({ rooms, onDelete }) {
  const [chatRoom, setChatRoom] = useState(null);

  return (
    <>
      {chatRoom && <RoomChatModal roomName={chatRoom} onClose={() => setChatRoom(null)} />}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#111111] text-gray-500 text-xs uppercase tracking-widest">
            <tr>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Topic</th>
              <th className="px-4 py-3">Created By</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-600 italic text-xs">No rooms found.</td></tr>
            ) : rooms.map((room) => (
              <tr key={room._id} className="border-t border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 font-medium whitespace-nowrap">
                  <span className="text-violet-400">#</span>{room.name}
                  {room.isDefault && (
                    <span className="ml-2 text-[10px] bg-violet-900/40 text-violet-400 border border-violet-700/40 rounded px-1.5 py-0.5">default</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{room.topic}</td>
                <td className="px-4 py-3 text-gray-500">{room.createdBy || <span className="text-gray-700 italic">system</span>}</td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">{formatDate(room.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChatRoom(room.name)}
                      className="text-xs text-violet-400 hover:text-violet-300 border border-violet-700/30 hover:border-violet-500/50 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                    >
                      View Chats
                    </button>
                    {!room.isDefault && (
                      <button
                        onClick={() => onDelete(room.name)}
                        className="text-xs text-red-400 hover:text-red-300 border border-red-400/20 hover:border-red-400/40 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── Stats Tab ─────────────────────────────────────────────────────────────────

function StatsTab({ messages, rooms }) {
  const userMessages = messages.filter((m) => !m.isSystem);

  const roomCounts = userMessages.reduce((acc, m) => {
    acc[m.roomName] = (acc[m.roomName] || 0) + 1;
    return acc;
  }, {});

  const mostActive = Object.entries(roomCounts).sort((a, b) => b[1] - a[1])[0];

  const dayCounts = userMessages.reduce((acc, m) => {
    const day = formatDay(m.timestamp);
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  const dayEntries = Object.entries(dayCounts).sort((a, b) => new Date(b[0]) - new Date(a[0]));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-5">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Messages</p>
        <p className="text-3xl font-bold text-white">{userMessages.length}</p>
        <p className="text-xs text-gray-600 mt-1">{messages.length - userMessages.length} system messages</p>
      </div>
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-5">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Rooms</p>
        <p className="text-3xl font-bold text-white">{rooms.length}</p>
        <p className="text-xs text-gray-600 mt-1">{rooms.filter((r) => r.isDefault).length} default rooms</p>
      </div>
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-5">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Most Active Room</p>
        {mostActive ? (
          <>
            <p className="text-2xl font-bold text-violet-400">#{mostActive[0]}</p>
            <p className="text-xs text-gray-600 mt-1">{mostActive[1]} messages</p>
          </>
        ) : (
          <p className="text-gray-600 text-sm italic">No data yet</p>
        )}
      </div>
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-5">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Messages Per Day</p>
        {dayEntries.length === 0 ? (
          <p className="text-gray-600 text-sm italic">No data yet</p>
        ) : (
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
            {dayEntries.map(([day, count]) => (
              <div key={day} className="flex justify-between items-center text-sm">
                <span className="text-gray-400">{day}</span>
                <span className="text-violet-400 font-semibold">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sessions Tab ──────────────────────────────────────────────────────────────

function SessionsTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/sessions`)
      .then((r) => r.json())
      .then((data) => { setSessions(data); setLoading(false); });
  }, []);

  return (
    <>
      {selected && <SessionModal session={selected} onClose={() => setSelected(null)} />}

      {loading ? (
        <p className="text-gray-600 text-sm animate-pulse">Loading sessions...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#111111] text-gray-500 text-xs uppercase tracking-widest">
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Browser</th>
                <th className="px-4 py-3">Joined At</th>
                <th className="px-4 py-3">Left At</th>
                <th className="px-4 py-3">Rooms</th>
                <th className="px-4 py-3">Msgs</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-600 italic text-xs">No sessions yet.</td></tr>
              ) : sessions.map((s) => {
                const isOnline = !s.leftAt;
                return (
                  <tr
                    key={s._id}
                    onClick={() => setSelected(s)}
                    className="border-t border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />}
                        <span className={isOnline ? "text-green-300" : "text-gray-300"}>{s.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.ipAddress}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{parseUA(s.userAgent)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">{formatDate(s.joinedAt)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">{formatDate(s.leftAt)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{s.roomsVisited.join(", ") || "—"}</td>
                    <td className="px-4 py-3 text-violet-400 font-semibold">{s.messageCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard() {
  const [tab, setTab] = useState("messages");
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/admin/messages`).then((r) => r.json()),
      fetch(`${API_URL}/api/rooms`).then((r) => r.json()),
    ]).then(([msgs, rms]) => {
      setMessages(msgs);
      setRooms(rms);
      setLoading(false);
    });
  }, []);

  async function handleDelete(roomName) {
    if (!confirm(`Delete #${roomName} and all its messages?`)) return;
    const res = await fetch(`${API_URL}/api/admin/rooms/${roomName}`, { method: "DELETE" });
    if (res.ok) {
      setRooms((prev) => prev.filter((r) => r.name !== roomName));
      setMessages((prev) => prev.filter((m) => m.roomName !== roomName));
    }
  }

  const tabs = ["messages", "rooms", "stats", "sessions"];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0a0a0a]" style={{ fontFamily: "'Fjalla One', sans-serif" }}>
        <h1 className="text-lg font-bold" style={{ fontFamily: "'Fjalla One', sans-serif" }}>
          in<span className="text-transparent bg-clip-text bg-linear-to-b from-violet-400 to-violet-700">L</span>ognito
          <span className="text-gray-500 font-normal text-sm ml-2">/ admin</span>
        </h1>
        <a href="/lobby" className="text-xs text-gray-500 hover:text-white transition-colors">← Back to app</a>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-1 mb-8 bg-[#0f0f0f] border border-white/10 rounded-xl p-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t ? "bg-violet-700 text-white" : "text-gray-500 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading && tab !== "sessions" ? (
          <p className="text-gray-600 text-sm animate-pulse">Loading data...</p>
        ) : (
          <>
            {tab === "messages"  && <MessagesTab messages={messages} />}
            {tab === "rooms"     && <RoomsTab rooms={rooms} onDelete={handleDelete} />}
            {tab === "stats"     && <StatsTab messages={messages} rooms={rooms} />}
            {tab === "sessions"  && <SessionsTab />}
          </>
        )}
      </main>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  return unlocked ? <Dashboard /> : <PasswordGate onUnlock={() => setUnlocked(true)} />;
}
