"use client";

import Link from "next/link";
import { HeartHandshake } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-white/10 bg-gradient-to-br from-[#0B1220] via-[#0F1A35] to-[#0A0F1F] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-amber-400 shadow-lg shadow-blue-500/25">
            <HeartHandshake className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
              Heart Haxor
            </p>
            <p className="text-sm text-slate-400">
              Companion Console
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
