"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import { Heart, MessageCircle } from "lucide-react";

export default function ChatIntro() {
  const router = useRouter();
  const { showSuccess } = useToast();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn");
    if (!logged) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    if (storedName) setName(storedName);
  }, []);

  const startChat = () => {
    setIsLoading(true);
    const role = localStorage.getItem("role") || "friend";
    showSuccess("Opening your companion...");
    setTimeout(() => {
      router.push(`/chat/${role}`);
    }, 600);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-950 p-4 transition-colors duration-300">
      {/* Decorative glow elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float opacity-30"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float opacity-30" style={{ animationDelay: "2s" }}></div>

      <Card className="w-full max-w-md animate-page-slide-in relative z-10">
        {/* Heart Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full blur-xl opacity-50 animate-soft-glow"></div>
            <Heart className="relative w-12 h-12 text-purple-600 dark:text-purple-400 fill-current drop-shadow-lg" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs tracking-widest text-purple-600 dark:text-purple-400 uppercase mb-2 font-semibold">
            Welcome back 💜
          </p>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Hey {name || "buddy"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            I'm <span className="font-semibold text-indigo-600 dark:text-indigo-400">Heart Haxor</span>
          </p>
        </div>

        {/* Status indicator */}
        <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-medium mx-auto mb-6 border border-emerald-200 dark:border-emerald-800/50 w-full justify-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Heart Haxor is here for you
        </div>

        {/* Tagline */}
        <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed mb-8">
          Talk to me about anything…<br />
          I'll listen, understand, and stay.
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={startChat}
            variant="primary"
            fullWidth
            size="lg"
            loading={isLoading}
            className="flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            {isLoading ? "Opening..." : "Start Talking"}
          </Button>

          <Button
            onClick={startChat}
            variant="outline"
            fullWidth
            size="lg"
            disabled={isLoading}
            className="flex items-center justify-center gap-2"
          >
            <span>💬</span>
            Open Chat
          </Button>
        </div>

        {/* Footer message */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700/50 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Your conversations are private and meaningful
          </p>
        </div>
      </Card>
    </main>
  );
}
