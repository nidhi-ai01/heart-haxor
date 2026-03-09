"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export default function ProtectedLayout({ children, sidebar }: ProtectedLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isLoading) return;

    // Public routes that don't require authentication
    const publicRoutes = ["/login", "/signup", "/login-form"];
    const isPublicRoute = publicRoutes.includes(pathname);

    // If not authenticated (no JWT token in localStorage, checked by AuthContext)
    if (!user && !isPublicRoute) {
      // Only redirect to login if trying to access protected route
      // Don't redirect on every state change - let history work naturally
      router.push("/login");
      return;
    }

    // If on login page but already authenticated, redirect home (only once)
    if (user && (pathname === "/login" || pathname === "/signup" || pathname === "/login-form")) {
      router.push("/");
      return;
    }
  }, [user, isLoading, pathname, router, isClient]);

  // Show loading state while checking authentication
  if (isLoading || !isClient) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-blue-50 to-purple-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  // Show sidebar only if user is fully authenticated AND not on public routes
  const publicRoutes = ["/login", "/signup", "/login-form"];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthenticated = user && !isPublicRoute;

  return (
    <>
      {isAuthenticated && sidebar}
      <main className={`${isAuthenticated ? "p-4 sm:ml-64 min-h-screen" : "h-screen w-screen"}`}>
        {children}
      </main>
    </>
  );
}
