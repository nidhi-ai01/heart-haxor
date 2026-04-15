"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import { HeartHandshake, MessageCircle, ChevronRight } from "lucide-react";

export default function ChatIntro() {
  const router = useRouter();
  const { showSuccess } = useToast();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);



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
    }, 400);
  };

  return (
    <main className="flex min-h-[calc(100vh-2rem)] items-center justify-center">
      <Card className="w-full max-w-3xl overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[1.75rem] bg-slate-950 p-8 text-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-white/10">
              <HeartHandshake className="h-7 w-7" />
            </div>
            <p className="app-eyebrow mt-6 text-blue-200">Chat lobby</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight">
              Your conversation space is ready.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Open a calm, focused chat view with the same professional theme used across setup,
              discovery, and every interaction.
            </p>
          </section>

          <section className="flex flex-col justify-center">
            <p className="app-eyebrow">Welcome back</p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              Hey {name || "there"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
              Jump back into your selected companion and continue where you left off.
            </p>

            <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Everything now shares one theme
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Cleaner hierarchy, consistent card styling, and more polished navigation.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              <Button onClick={startChat} fullWidth size="lg" loading={isLoading}>
                <MessageCircle className="h-4 w-4" />
                {isLoading ? "Opening chat" : "Start talking"}
              </Button>
              <Button onClick={() => router.push("/characters", { scroll: false })} variant="outline" fullWidth size="lg">
                Browse characters
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        </div>
      </Card>
    </main>
  );
}
