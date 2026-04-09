"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

const PUBLIC_ROUTES = ["/", "/login", "/signup"];

export default function ProtectedLayout({
  children,
  sidebar,
}: ProtectedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isLoading) {
      return;
    }

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!user && !isPublicRoute) {
      router.push("/signup");
      return;
    }

    if (user && !user.dob && pathname !== "/complete-dob" && !isPublicRoute) {
      router.replace("/complete-dob");
      return;
    }

    if (user?.dob && pathname === "/complete-dob") {
      router.replace("/role-select");
      return;
    }
  }, [isClient, isLoading, pathname, router, user]);

  if (!isClient || isLoading) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center px-4">
        <div className="app-content app-panel-strong flex w-full max-w-sm flex-col items-center gap-4 rounded-[2rem] px-8 py-10 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Preparing your workspace
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Syncing your theme and session.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const showSidebar =
    Boolean(user?.dob) && !isPublicRoute && pathname !== "/complete-dob";

  return (
    <div className="app-shell">
      {showSidebar && sidebar}
      <main
        className={`app-content min-h-screen ${
          showSidebar ? "px-4 py-4 sm:ml-72 sm:px-6 sm:py-6" : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
}
