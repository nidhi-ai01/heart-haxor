import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import "@/styles/animations.css";
import Sidebar from "@/components/layout/Sidebar";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import ToastContainer from "@/components/Toast";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Heart Haxor",
  description: "AI companion platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${manrope.className} relative h-screen overflow-hidden antialiased`}>
        {/* Background is styled on body, this wrapper scrolls independently! */}
        <div className="h-full overflow-y-auto">
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <ProtectedLayout sidebar={<Sidebar />}>{children}</ProtectedLayout>
                <ToastContainer />
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
