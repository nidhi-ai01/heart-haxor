import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@/styles/animations.css";
import Sidebar from "@/components/layout/Sidebar";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import ToastContainer from "@/components/Toast";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Heart Haxor",
  description: "AI Companion Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.className} bg-gradient-to-br from-amber-50 via-blue-50 to-purple-100 dark:from-slate-900 dark:via-purple-950 dark:to-slate-950 text-gray-900 dark:text-gray-100 h-screen w-screen overflow-x-hidden transition-colors duration-300`}
      >
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {/* 🔥 TEMPORARILY REMOVE PROTECTION */}
              {children}
              <ToastContainer />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
