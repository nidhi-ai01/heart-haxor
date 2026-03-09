"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Heart, ArrowLeft, Mail, Lock } from "lucide-react";

export default function LoginFormPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      login(email, password);
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (err) {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-blue-50 to-purple-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-950 flex items-center justify-center p-4 overflow-hidden relative transition-colors duration-300">
      {/* Decorative blurred shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 dark:bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-violet-200 dark:bg-violet-900 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />

      {/* Top-Right Branding */}
      <div className="absolute top-8 right-8 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/60 dark:border-slate-700/40 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300">
        <div className="relative w-6 h-6 flex items-center justify-center flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-300 dark:from-violet-500 to-violet-400 dark:to-purple-600 rounded-full opacity-25 blur-md" />
          <Heart className="w-5 h-5 text-violet-600 dark:text-violet-400 fill-violet-600 dark:fill-violet-400 relative z-10" />
        </div>
        <span className="text-xs font-bold tracking-wider bg-gradient-to-r from-violet-600 dark:from-violet-400 to-purple-600 dark:to-violet-300 bg-clip-text text-transparent">
          HEART HAXOR
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md animate-fadeIn">
        {/* Back button */}
        <button
          onClick={() => router.push("/login")}
          className="mb-6 flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Card container with enhanced shadow */}
        <div className="bg-white/85 dark:bg-slate-800/60 backdrop-blur-md rounded-3xl shadow-2xl dark:shadow-xl p-8 md:p-12 border border-white/60 dark:border-slate-700/50 transition-all duration-500 hover:shadow-3xl dark:hover:shadow-2xl hover:border-white/80 dark:hover:border-slate-600/50">
          {/* Logo with animation */}
          <div className="flex justify-center mb-8">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-300 dark:from-violet-500 to-violet-400 dark:to-purple-600 rounded-full opacity-30 blur-xl animate-pulse" />
              <div className="animate-float">
                <Heart className="w-12 h-12 text-violet-500 dark:text-violet-400 fill-violet-500 dark:fill-violet-400 drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 dark:from-violet-400 to-purple-600 dark:to-violet-300 bg-clip-text text-transparent mb-2 font-extrabold">
              Welcome Back 💜
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">We've missed you. Let's continue our conversation</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-3 h-5 w-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-purple-200 dark:border-slate-600 rounded-lg text-base text-gray-800 dark:text-gray-50 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-violet-500 dark:focus:border-violet-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-100 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 h-5 w-5 text-gray-500 dark:text-gray-400 pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-purple-200 dark:border-slate-600 rounded-lg text-base text-gray-800 dark:text-gray-50 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 focus:border-violet-500 dark:focus:border-violet-400 transition-all duration-200"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100/80 dark:bg-red-900/30 border border-red-300 dark:border-red-700/50 rounded-2xl p-4">
                <p className="text-red-700 dark:text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-400 dark:from-violet-500 to-purple-500 dark:to-purple-600 hover:from-violet-500 dark:hover:from-violet-600 hover:to-purple-600 dark:hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-300/50 dark:hover:shadow-purple-900/50 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6 font-semibold active:scale-95"
            >
              {loading ? "Welcome back..." : "Sign In"}
            </button>
          </form>

          {/* Footer message */}
          <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-slate-700/50 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
              💜 Always here for you
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
              Pick up where you left off
            </p>
          </div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fadeIn,
          .animate-float {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
