"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import { Calendar, ChevronRight } from "lucide-react";

export default function CompleteDobPage() {
  const router = useRouter();
  const { user, completeDob, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
    } else if (user.dob) {
      router.replace("/role-select");
    }
  }, [user, isLoading, router]);
  const { showSuccess, showError } = useToast();
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!dob) {
      setError("Please enter your date of birth.");
      return;
    }

    const d = new Date(dob);
    const y = new Date().getFullYear() - d.getFullYear();
    const m = new Date().getMonth() - d.getMonth();
    const day = new Date().getDate() - d.getDate();
    const age = m < 0 || (m === 0 && day < 0) ? y - 1 : y;
    if (age < 13) {
      setError("You must be at least 13 years old.");
      return;
    }
    if (age > 120) {
      setError("Please enter a valid date of birth.");
      return;
    }

    try {
      setSubmitting(true);
      await completeDob(dob);
      showSuccess("You’re all set.");
      router.replace("/role-select");
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : "Could not save date of birth.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !user || user.dob) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center p-4">
        <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
      </main>
    );
  }

  return (
    <main className="app-shell flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8">
        <p className="app-eyebrow">One more step</p>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Add your date of birth
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          We use this only to unlock the right companion modes. We won’t ask again.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Input
            type="date"
            label="Date of Birth"
            value={dob}
            onChange={(e) => {
              setDob(e.target.value);
              setError("");
            }}
            error={error || undefined}
            leftIcon={<Calendar className="h-4 w-4" />}
            required
          />
          <Button type="submit" fullWidth size="lg" loading={submitting}>
            Continue
            {!submitting && <ChevronRight className="h-4 w-4" />}
          </Button>
        </form>
      </Card>
    </main>
  );
}
