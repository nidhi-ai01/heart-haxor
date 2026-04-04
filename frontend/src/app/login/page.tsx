"use client";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Card from "@/components/ui/Card";
import Skeleton, { SkeletonFormField } from "@/components/ui/Skeleton";
import { Mail, Lock, ChevronRight } from "lucide-react";
import { auth, googleProvider, getFirebaseAuthErrorMessage } from "@/lib/firebase";

export default function Login() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogleProfile, error, clearError, isLoading: contextLoading } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");

  const postLoginRoute = (hasDob: boolean) => {
    if (hasDob) {
      router.push("/role-select");
    } else {
      router.push("/complete-dob");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setEmailError("");
      clearError();

      if (!email || !password) {
        const message = "Please fill in all fields";
        setEmailError(message);
        showError(message);
        return;
      }

      const user = await loginWithEmail(email, password);
      showSuccess("Logged in successfully.");
      postLoginRoute(Boolean(user.dob));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Login failed. Please try again.";
      setEmailError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      clearError();
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const googleEmail = fbUser.email;
      if (!googleEmail) {
        showError("This Google account has no email. Use another account or email login.");
        return;
      }
      const displayName = fbUser.displayName?.trim() || googleEmail.split("@")[0] || "User";
      const user = await loginWithGoogleProfile(googleEmail, displayName);
      showSuccess("Signed in with Google.");
      postLoginRoute(Boolean(user.dob));
    } catch (err: unknown) {
      showError(getFirebaseAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (contextLoading) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-xl">
          <div className="grid gap-6 md:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-3">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full rounded-[1.5rem]" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <SkeletonFormField />
              <SkeletonFormField />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="app-shell flex min-h-screen items-center justify-center p-4">
      <div className="app-content w-full max-w-5xl">
        <Card className="overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <section className="hidden rounded-[1.75rem] bg-slate-950 p-8 text-white md:block">
              <p className="app-eyebrow text-blue-200">Sign in</p>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight">
                Return to your safe companion space.
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Access your private conversations, personalized companions, and a calm space designed for reflection and
                support.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  "🔒 Private & secure conversations",
                  "🧠 Designed for emotional safety",
                  "💬 Your data stays under your control",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col justify-center">
              <div className="mb-8 md:hidden">
                <p className="app-eyebrow text-blue-600 dark:text-blue-300">Sign in</p>
                <h2 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  Return to your safe companion space
                </h2>
              </div>

              <div className="mb-8 hidden md:block">
                <p className="app-eyebrow">Welcome back</p>
                <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  Sign in to continue
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Use your email or Google. Passwords are never stored on this device.
                </p>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-5">
                <Input
                  type="email"
                  label="Email address"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  error={emailError || error || undefined}
                  leftIcon={<Mail className="h-4 w-4" />}
                  required
                  autoComplete="email"
                />

                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setEmailError("");
                  }}
                  error={emailError || error || undefined}
                  leftIcon={<Lock className="h-4 w-4" />}
                  required
                  autoComplete="current-password"
                />

                <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
                  {loading ? "Signing in" : "Continue"}
                  {!loading && <ChevronRight className="h-4 w-4" />}
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wide">
                  <span className="bg-white px-3 text-slate-500 dark:bg-slate-900 dark:text-slate-400">Or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                fullWidth
                size="lg"
                loading={loading}
                onClick={handleGoogle}
                className="border-slate-200 dark:border-white/10"
              >
                Continue with Google
              </Button>

              <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-500">
                No judgment. No pressure. Not a crisis service—for emotional companionship only.
              </p>

              <p className="mt-8 text-sm text-slate-600 dark:text-slate-400">
                Need an account?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/signup")}
                  className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                >
                  Create one
                </button>
              </p>
            </section>
          </div>
        </Card>
      </div>
    </main>
  );
}
