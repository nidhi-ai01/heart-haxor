"use client";

import { Linkedin, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full py-6 bg-white/60 backdrop-blur-md border-t border-white/40">
      <div className="flex flex-col items-center gap-4">

        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Heart Haxor
        </p>

        <div className="flex gap-6">
          <a
            href="https://www.linkedin.com/company/heart-haxor/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-indigo-600 transition"
          >
            <Linkedin size={22} />
          </a>

          <a
            href="https://www.instagram.com/hearthaxor?igsh=NjRsbmljMW8ycmMw"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-pink-500 transition"
          >
            <Instagram size={22} />
          </a>

          <a
            href="https://x.com/HeartHaxor"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-black transition"
          >
            <Twitter size={22} />
          </a>
        </div>
      </div>
    </footer>
  );
}
