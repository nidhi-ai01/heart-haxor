"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import TrustCard from "@/components/TrustCard";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export default function HeroSection() {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden px-4 pb-10 pt-10 sm:px-6 sm:pb-14 sm:pt-12 lg:px-10 lg:pb-16 lg:pt-14">
      <div
        className="pointer-events-none absolute left-1/4 top-1/4 h-56 w-56 -translate-x-1/2 rounded-full bg-violet-600/12 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-sky-600/10 blur-[100px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,380px)] lg:gap-14 xl:gap-16">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col"
          >
            <motion.h1
              variants={item}
              className="max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-slate-50 sm:text-5xl"
            >
              Emotional support that feels calm, clear, and respectful.
            </motion.h1>

            <motion.p variants={item} className="mt-5 max-w-xl text-lg font-medium text-slate-200 sm:text-xl">
              Talk freely. No judgment. Just understanding.
            </motion.p>

            <motion.p variants={item} className="mt-4 max-w-xl text-base leading-relaxed text-slate-400">
              Your private space to reflect, vent, and connect—powered by AI designed for emotional safety.
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                onClick={() => router.push("/signup", { scroll: false })}
                size="lg"
                variant="primary"
                className="min-w-[12.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
              >
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                onClick={() => router.push("/login", { scroll: false })}
                variant="outline"
                size="lg"
                className="min-w-[10.5rem] border-white/12 bg-transparent text-slate-200 hover:bg-white/[0.06]"
              >
                Log in
              </Button>
            </motion.div>

            <motion.div variants={item} className="mt-6 space-y-2 text-sm leading-relaxed text-slate-500">
              <p>No judgment. No pressure. Just support.</p>
              <p>Not a crisis service. For emotional companionship only.</p>
            </motion.div>

            <motion.div variants={item} className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/12">
                  <Lock className="h-5 w-5 text-sky-200/95" aria-hidden />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-100">Private &amp; secure conversations</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                    Your conversations stay encrypted and under your control. We do not store sensitive personal data
                    without consent.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className="w-full lg:sticky lg:top-24 lg:justify-self-end">
            <TrustCard />
          </div>
        </div>
      </div>
    </div>
  );
}
