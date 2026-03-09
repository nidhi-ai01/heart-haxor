"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { Linkedin, Instagram, Twitter, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 🎥 Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/bg.mp4" type="video/mp4" />
      </video>

      {/* Enhanced Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/40 backdrop-blur-sm"></div>

      {/* Decorative Glow Elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float opacity-30"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float opacity-30" style={{ animationDelay: "2s" }}></div>

      {/* 💜 Main Content */}
      <div className="relative z-10 text-center max-w-2xl px-6 text-white animate-page-slide-in">
        {/* Logo */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full blur-xl opacity-50 animate-soft-glow"></div>
            <Image
              src="/logo.png"
              alt="Heart Haxor"
              width={130}
              height={130}
              priority
              className="relative drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Headline with Gradient */}
        <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-violet-200 via-purple-200 to-pink-200 bg-clip-text text-transparent animate-gradient-shift">
          Meet someone who's always there.
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl mb-12 leading-relaxed text-gray-200 max-w-xl mx-auto">
          Heart Haxor isn't just an app. It's your safe space.
          A companion for your thoughts, emotions,
          late-night overthinking, wins, and growth.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Button
            onClick={() => router.push("/signup")}
            variant="primary"
            size="lg"
            className="group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Create your companion
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>

          <button
            onClick={() => router.push("/login")}
            className="px-12 py-4 rounded-full border-2 border-white text-white text-lg font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
          >
            Log in
          </button>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-8 text-gray-300">
          <a
            href="https://www.linkedin.com/company/heart-haxor/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white hover:scale-125 transition-all duration-300 hover:bg-white/10 p-3 rounded-full"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-6 h-6" />
          </a>
          <a
            href="https://www.instagram.com/hearthaxor?igsh=NjRsbmljMW8ycmMw"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white hover:scale-125 transition-all duration-300 hover:bg-white/10 p-3 rounded-full"
            aria-label="Instagram"
          >
            <Instagram className="w-6 h-6" />
          </a>
          <a
            href="https://x.com/HeartHaxor"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white hover:scale-125 transition-all duration-300 hover:bg-white/10 p-3 rounded-full"
            aria-label="Twitter"
          >
            <Twitter className="w-6 h-6" />
          </a>
        </div>
      </div>
    </main>
  );
}
