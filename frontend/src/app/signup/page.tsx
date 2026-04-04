"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordInput from "@/components/ui/PasswordInput";
import Card from "@/components/ui/Card";
import { Mail, Lock, User, Calendar, ChevronRight } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const { registerUser, error, clearError } = useAuth();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = "Name is required";
    if (!dob) errors.dob = "Date of birth is required";

    if (!email) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Invalid email format";

    if (!password) errors.password = "Password is required";
    else if (password.length < 8) errors.password = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(password)) errors.password = "Password must contain an uppercase letter";
    else if (!/[a-z]/.test(password)) errors.password = "Password must contain a lowercase letter";
    else if (!/[0-9]/.test(password)) errors.password = "Password must contain a number";

    if (dob) {
      const d = new Date(dob);
      const y = new Date().getFullYear() - d.getFullYear();
      const m = new Date().getMonth() - d.getMonth();
      const day = new Date().getDate() - d.getDate();
      const age = m < 0 || (m === 0 && day < 0) ? y - 1 : y;
      if (age < 13) errors.dob = "You must be at least 13 years old";
      if (age > 120) errors.dob = "Please enter a valid date of birth";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!validateForm()) {
        showError("Please fix the highlighted fields.");
        return;
      }

      setLoading(true);
      clearError();

      await registerUser(name, email, password, dob);

      showSuccess("Account created successfully. Please sign in.");
      setTimeout(() => router.push("/login"), 900);
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell flex min-h-screen items-center justify-center p-4">
      <div className="app-content w-full max-w-5xl">
        <Card className="overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <section className="hidden rounded-[1.75rem] bg-gradient-to-br from-blue-600 via-cyan-500 to-amber-400 p-8 text-slate-950 md:block">
              <p className="app-eyebrow text-slate-900/70">Create account</p>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight">
                Start your personal AI companion journey
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-900/75">
                Create your account to access a safe, private, and intelligent space where you can talk freely and
                be understood.
              </p>

              <div className="mt-8 grid gap-3">
                {[
                  "🔒 Your conversations stay private",
                  "🧠 AI built for emotional support",
                  "💬 Personalized companion experience",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-black/10 bg-white/35 px-4 py-3 text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col justify-center">
              <div className="mb-8 md:hidden">
                <p className="app-eyebrow text-blue-600 dark:text-blue-300">Create account</p>
                <h2 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  Start your personal AI companion journey
                </h2>
              </div>

              <div className="mb-8 hidden md:block">
                <p className="app-eyebrow">Start here</p>
                <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  Create your Heart Haxor account
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  We use your date of birth only to tailor companion modes. Your password is secured with JWT sessions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  type="text"
                  label="Full name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                  }}
                  error={formErrors.name || error || undefined}
                  leftIcon={<User className="h-4 w-4" />}
                  required
                  autoComplete="name"
                />

                <Input
                  type="date"
                  label="Date of Birth"
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                    if (formErrors.dob) setFormErrors({ ...formErrors, dob: "" });
                  }}
                  error={formErrors.dob}
                  leftIcon={<Calendar className="h-4 w-4" />}
                  required
                />

                <Input
                  type="email"
                  label="Email address"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) setFormErrors({ ...formErrors, email: "" });
                  }}
                  error={formErrors.email || error || undefined}
                  leftIcon={<Mail className="h-4 w-4" />}
                  required
                  autoComplete="email"
                />

                <PasswordInput
                  label="Password"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors({ ...formErrors, password: "" });
                  }}
                  error={formErrors.password}
                  leftIcon={<Lock className="h-4 w-4" />}
                  helpText="At least 8 characters with uppercase, lowercase, and a number."
                  required
                  autoComplete="new-password"
                />

                <Button type="submit" fullWidth size="lg" loading={loading}>
                  {loading ? "Creating account" : "Create account"}
                  {!loading && <ChevronRight className="h-4 w-4" />}
                </Button>
              </form>

              <p className="mt-8 text-sm text-slate-600 dark:text-slate-400">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                >
                  Sign in
                </button>
              </p>
            </section>
          </div>
        </Card>
      </div>
    </main>
  );
}
