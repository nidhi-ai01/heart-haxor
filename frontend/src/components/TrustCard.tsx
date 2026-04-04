"use client";

import { motion } from "framer-motion";
import { Brain, Lock } from "lucide-react";

const trustSignals = [
  {
    icon: Lock,
    title: "End-to-end encrypted chat",
  },
  {
    icon: Brain,
    title: "AI for emotional support—not a replacement for professionals",
  },
];

export default function TrustCard() {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-xl shadow-purple-500/10 backdrop-blur-xl sm:p-7"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-16 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-sky-500/10 blur-3xl"
        aria-hidden
      />

      <p className="relative text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
        Trust
      </p>

      <ul className="relative mt-5 space-y-4" aria-label="Trust signals">
        {trustSignals.map(({ icon: Icon, title }) => (
          <li key={title} className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/12 text-sky-200/95">
              <Icon className="h-[1.15rem] w-[1.15rem]" aria-hidden />
            </div>
            <p className="pt-1.5 text-sm leading-snug text-slate-200">{title}</p>
          </li>
        ))}
      </ul>

      <p className="relative mt-6 border-t border-white/10 pt-5 text-sm leading-relaxed text-slate-500">
        Trusted by thousands for safe conversations
      </p>
    </motion.article>
  );
}
