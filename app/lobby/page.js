"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function Lobby() {
  const [rooms, setRooms] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchRooms();
    fetchCounts();
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchRooms() {
    try {
      const res = await fetch(`${API_URL}/api/rooms`);
      const data = await res.json();
      setRooms(data);
    } catch {}
    finally { setLoading(false); }
  }

  async function fetchCounts() {
    try {
      const res = await fetch(`${API_URL}/api/rooms/counts`);
      const data = await res.json();
      setCounts(data);
    } catch {}
  }

  async function handleCreateRoom(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: roomName, topic }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setShowModal(false);
      setRoomName("");
      setTopic("");
      fetchRooms();
    } catch {
      setError("Failed to create room. Is the server running?");
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    setShowModal(false);
    setRoomName("");
    setTopic("");
    setError("");
  }

  const totalOnline = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-x-hidden">

      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-700/8 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-3.5 border-b border-white/[0.06] bg-black/40 backdrop-blur-xl"
        style={{ fontFamily: "'Fjalla One', sans-serif" }}
      >
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="inLognito" width={32} height={32} unoptimized className="rounded-full" />
          <span className="text-lg tracking-wide">
            in<span className="text-transparent bg-clip-text bg-linear-to-b from-violet-400 to-violet-600">L</span>ognito
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center pt-16 pb-12 px-4">
        {/* Logo with ring */}
        <div className="relative mb-7">
          <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl scale-125" />
          <div className="relative w-24 h-24 rounded-full ring-2 ring-violet-500/30 ring-offset-2 ring-offset-[#050505] overflow-hidden">
            <Image src="/logo.png" alt="inLognito" fill unoptimized className="object-cover rounded-full" />
          </div>
        </div>

        <h1
          className="text-5xl md:text-7xl font-bold tracking-tight mb-4 leading-none"
          style={{ fontFamily: "'Fjalla One', sans-serif" }}
        >
          in<span className="text-transparent bg-clip-text bg-linear-to-b from-violet-300 to-violet-600">L</span>ognito
        </h1>

        <p className="text-gray-500 text-xs tracking-[0.3em] uppercase mb-3">Anonymous · Fearless · Free</p>

        <p className="text-gray-600 text-sm max-w-xs">
          No sign-up. No history. Pick a room and start talking.
        </p>

        {/* Online count pill */}
        {totalOnline > 0 && (
          <div className="mt-5 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-400">{totalOnline} {totalOnline === 1 ? "person" : "people"} chatting now</span>
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Rooms */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10 pb-24">

        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-sm font-semibold text-white">Rooms</h2>
            <p className="text-xs text-gray-600 mt-0.5">
              {loading ? "Loading..." : `${rooms.length} room${rooms.length !== 1 ? "s" : ""} available`}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            + New room
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-white/3 animate-pulse" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <span className="text-gray-600 text-2xl">#</span>
            </div>
            <p className="text-gray-500 text-sm mb-1">No rooms yet</p>
            <p className="text-gray-700 text-xs mb-5">Be the first to create one</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Create a room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rooms.map((room) => {
              const online = counts[room.name] || 0;
              return (
                <div
                  key={room._id}
                  onClick={() => router.push(`/room/${room.name}`)}
                  className="group relative flex flex-col justify-between bg-white/3 hover:bg-white/5 border border-white/[0.07] hover:border-violet-500/30 rounded-2xl p-5 cursor-pointer transition-all duration-200"
                >
                  {/* Top accent line on hover */}
                  <div className="absolute top-0 left-6 right-6 h-px bg-linear-to-r from-transparent via-violet-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full" />

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-bold text-white">
                        <span className="text-violet-500/80"># </span>{room.name}
                      </h3>
                      {room.isDefault && (
                        <span className="text-[9px] uppercase tracking-widest text-violet-500/60 border border-violet-500/20 rounded-full px-2 py-0.5">
                          default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{room.topic}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs">
                      <span className={`w-1.5 h-1.5 rounded-full transition-colors ${online > 0 ? "bg-green-500" : "bg-gray-700"}`} />
                      <span className={online > 0 ? "text-gray-400" : "text-gray-700"}>
                        {online > 0 ? `${online} online` : "empty"}
                      </span>
                    </span>
                    <span className="text-[11px] font-semibold text-violet-500/60 group-hover:text-violet-400 transition-colors">
                      Enter →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create Room Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="relative bg-[#0c0c0c] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-[0_0_80px_rgba(109,40,217,0.12)]">
            {/* Top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-linear-to-r from-transparent via-violet-500/50 to-transparent" />

            <h2 className="text-base font-bold mb-0.5">Create a Room</h2>
            <p className="text-xs text-gray-600 mb-5">Spaces become hyphens. Names are lowercase.</p>

            <form onSubmit={handleCreateRoom} className="flex flex-col gap-3.5">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 block">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. late-night"
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 block">Topic</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What's this room about?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 text-sm text-gray-500 hover:text-white border border-white/10 hover:border-white/20 py-2.5 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !roomName.trim() || !topic.trim()}
                  className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white text-sm font-semibold py-2.5 rounded-xl"
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
