"use client";

import Link from "next/link";
import Image from "next/image";

export default function Header() {
  return (
    <header className="border-b border-white/10 bg-gradient-to-br from-[#0B1220] via-[#0F1A35] to-[#0A0F1F] px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Heart Haxor Logo"
            width={120}
            height={60}
            priority
            className="h-auto w-auto"
          />
        </Link>
      </div>
    </header>
  );
}
