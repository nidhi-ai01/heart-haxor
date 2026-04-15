"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  LogOut,
  User,
  HeartHandshake,
  Sparkles,
  MessageSquareText,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";

import { useEffect, useState } from "react";

const links = [
  { href: "/role-select", label: "Role Setup", icon: Sparkles },
  { href: "/characters", label: "Characters", icon: Home, requiresRole: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [hasRole, setHasRole] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setHasRole(!!localStorage.getItem("role") || !!localStorage.getItem("selectedRole"));
    };
    handleStorageChange();
    window.addEventListener("storage", handleStorageChange);
    // Simple interval to catch local storage changes in the same window, since storage event fires across windows
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);
  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside className="fixed left-4 top-4 z-40 hidden h-[calc(100vh-2rem)] w-64 overflow-hidden rounded-[2rem] border border-white/45 bg-[rgba(255,255,255,0.72)] shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl sm:block dark:border-white/10 dark:bg-[rgba(8,17,31,0.74)]">
      <div className="flex h-full flex-col p-5">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-500 to-amber-400 shadow-lg shadow-blue-500/25">
            <HeartHandshake className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">
              Heart Haxor
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Companion Console
            </p>
          </div>
        </Link>

        <div className="mb-5 rounded-[1.5rem] border border-blue-100/80 bg-gradient-to-br from-blue-600 to-cyan-500 p-4 text-white shadow-lg shadow-blue-500/25 dark:border-white/10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
            Active theme
          </p>
          <h2 className="mt-2 text-xl font-bold">Calm, polished, human</h2>
          <p className="mt-2 text-sm text-blue-50/85">
            Every page now shares the same premium visual language.
          </p>
        </div>

        <div className="space-y-2">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Navigation
          </p>
          {links.map((link) => {
            if (link.requiresRole && !hasRole) return null;

            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]",
                  isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900"
                    : "text-slate-700 hover:bg-white/75 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                )}
              >
                <Icon
                  className={clsx(
                    "h-4 w-4 transition-transform duration-200",
                    isActive ? "" : "group-hover:scale-110"
                  )}
                />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto space-y-4">
          {user && (
            <div className="rounded-[1.5rem] border border-slate-200/70 bg-white/75 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                    {user.name || "Heart Haxor user"}
                  </p>
                  <p className="truncate text-xs text-slate-600 dark:text-slate-400">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] hover:bg-rose-100 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
