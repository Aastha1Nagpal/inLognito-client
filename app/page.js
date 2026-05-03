"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-700/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-emerald-700/8 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-3xl">

        {/* Logo + name */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-5">
            <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl scale-125" />
            <div className="relative w-20 h-20 rounded-full ring-2 ring-violet-500/30 ring-offset-2 ring-offset-[#050505] overflow-hidden">
              <Image src="/logo.png" alt="inLognito" fill unoptimized className="object-cover rounded-full" />
            </div>
          </div>

          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight mb-3"
            style={{ fontFamily: "'Fjalla One', sans-serif" }}
          >
            in<span className="text-transparent bg-clip-text bg-linear-to-b from-violet-300 to-violet-600">L</span>ognito
          </h1>
          <p className="text-gray-600 text-sm tracking-wide">Anonymous. No login. No identity.</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">

          {/* Live Chat */}
          <div
            onClick={() => router.push("/lobby")}
            className="group relative flex flex-col bg-white/[0.03] border border-white/10 rounded-2xl p-7 cursor-pointer transition-all duration-300 hover:border-violet-500/40 hover:shadow-[0_0_40px_rgba(139,92,246,0.12)] hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-br from-violet-600/5 to-transparent" />

            <h2 className="text-xl font-bold text-white mb-2">Live Chat</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Jump into anonymous rooms. No login needed.
            </p>

            <button className="mt-auto w-full bg-violet-600 hover:bg-violet-500 transition-colors text-white text-sm font-semibold py-2.5 rounded-xl">
              Enter Chat
            </button>
          </div>

          {/* Forums */}
          <div
            onClick={() => router.push("/forum/auth")}
            className="group relative flex flex-col bg-white/[0.03] border border-white/10 rounded-2xl p-7 cursor-pointer transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_40px_rgba(16,185,129,0.08)] hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-br from-emerald-600/5 to-transparent" />

            <h2 className="text-xl font-bold text-white mb-2">Forums</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Post anonymously. Discuss freely.
            </p>

            <button className="mt-auto w-full bg-emerald-700 hover:bg-emerald-600 transition-colors text-white text-sm font-semibold py-2.5 rounded-xl">
              Enter Forums
            </button>
          </div>

        </div>

        {/* Footer */}
        <p className="mt-10 text-xs text-gray-700 tracking-wide">You are always anonymous here</p>
      </div>

    </div>
  );
}
