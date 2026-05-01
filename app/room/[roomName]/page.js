"use client";

import { use, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:4000";
const MAX_LENGTH = 500;

export default function RoomPage({ params }) {
  const { roomName } = use(params);
  const router = useRouter();

  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [banner, setBanner] = useState("");
  const [bannerVisible, setBannerVisible] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["polling", "websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("assigned_username", (name) => {
      setUsername(name);
      setBanner(`You joined as ${name}`);
      setBannerVisible(true);
      setTimeout(() => setBannerVisible(false), 3000);

      socket.emit("join_room", roomName);
      socket.emit("get_history", roomName);
    });

    socket.on("room_history", ({ messages: history }) => {
      setMessages(history);
    });

    socket.on("receive_message", (msg) => {
      if (msg.roomName !== roomName) return;
      setMessages((prev) => [...prev, { type: "message", ...msg }]);
    });

    socket.on("system_message", (msg) => {
      if (msg.roomName !== roomName) return;
      setMessages((prev) => [...prev, { type: "system", message: msg.message }]);
    });

    socket.on("user_count", (count) => setOnlineCount(count));

    return () => {
      socket.emit("leave_room", roomName);
      socket.disconnect();
    };
  }, [roomName]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    const text = input.trim();
    if (!text || !socketRef.current) return;
    socketRef.current.emit("send_message", { roomName, message: text });
    setInput("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") sendMessage();
  }

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black gap-4">
        <Image src="/logo.png" alt="inLognito" width={72} height={72} unoptimized />
        <p className="text-gray-500 text-sm tracking-widest uppercase animate-pulse">Connecting...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans">

      {/* Join banner */}
      <div
        className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-violet-900/80 text-violet-200 text-xs rounded-full border border-violet-700/50 transition-all duration-700"
        style={{ opacity: bannerVisible ? 1 : 0, pointerEvents: "none" }}
      >
        {banner}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/10 bg-[#0a0a0a]" style={{ fontFamily: "'Fjalla One', sans-serif" }}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/lobby")}
            className="text-gray-500 hover:text-white text-sm transition-colors"
          >
            ← Back
          </button>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="inLognito" width={28} height={28} unoptimized />
            <span className="text-base font-bold">
              <span className="text-violet-500">#</span>{roomName}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <span className="text-sm text-gray-500">
            <span className="inline-block w-2 h-2 rounded-full bg-violet-500 mr-2 mb-0.5" />
            {onlineCount} online
          </span>
          {username && (
            <span className="text-xs text-gray-600">
              You are: <span className="text-violet-400">{username}</span>
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex justify-center mt-10">
            <span className="text-xs text-gray-700 italic">No messages yet. Say something.</span>
          </div>
        )}

        {messages.map((entry, i) => {
          if (entry.type === "system") {
            return (
              <div key={i} className="flex justify-center">
                <span className="text-xs text-gray-600 italic">{entry.message}</span>
              </div>
            );
          }

          const isOwn = entry.username === username;

          return (
            <div key={i} className={`flex flex-col gap-0.5 max-w-xs md:max-w-sm ${isOwn ? "ml-auto items-end" : "items-start"}`}>
              {!isOwn && (
                <span className="text-xs font-semibold text-violet-400 px-1">{entry.username}</span>
              )}
              <div
                className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  isOwn
                    ? "bg-violet-800/70 text-white rounded-br-sm"
                    : "bg-[#1a1a1a] text-gray-100 rounded-bl-sm"
                }`}
                style={{ fontFamily: "'Amarna', sans-serif" }}
              >
                {entry.message}
              </div>
              <span className="text-[10px] text-gray-600 px-1">{entry.timestamp}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center gap-3 bg-[#111111] border border-white/10 rounded-xl px-4 py-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, MAX_LENGTH))}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${roomName}...`}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
          />
          {input.length > MAX_LENGTH * 0.8 && (
            <span className={`text-[10px] ${input.length >= MAX_LENGTH ? "text-red-400" : "text-gray-500"}`}>
              {MAX_LENGTH - input.length}
            </span>
          )}
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="bg-linear-to-b from-violet-500 to-violet-700 hover:from-violet-400 hover:to-violet-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white text-sm font-semibold px-4 py-1.5 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>

    </div>
  );
}
