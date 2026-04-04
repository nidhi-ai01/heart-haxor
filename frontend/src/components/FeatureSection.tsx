"use client";

import { motion } from "framer-motion";
import { BrainCircuit, MessageSquare, Mic, Sparkles } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Real-time AI conversations",
    description: "Responsive, natural back-and-forth when you need someone to listen.",
  },
  {
    icon: Sparkles,
    title: "Personality-driven companions",
    description: "Choose a tone and style that fits you—not a one-size chatbot.",
  },
  {
    icon: BrainCircuit,
    title: "Memory-based contextual responses",
    description: "Carry context across messages so you don’t repeat yourself.",
  },
  {
    icon: Mic,
    title: "Voice interaction",
    description: "Speak when typing feels like too much.",
  },
];

export default function FeatureSection() {
  return (
    <section
      className="relative border-t border-white/5 px-4 py-16 sm:px-6 sm:py-20 lg:px-10"
      aria-labelledby="features-heading"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.35 }}
          className="max-w-2xl"
        >
          <h2 id="features-heading" className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            What you can do with Heart Haxor
          </h2>
          <p className="mt-3 text-base leading-relaxed text-slate-500">
            Everything you need for calmer check-ins—without crowding the first screen.
          </p>
        </motion.div>

        <ul className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:gap-5">
          {features.map(({ icon: Icon, title, description }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-lg shadow-purple-500/5 backdrop-blur-xl"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/12 text-violet-200/95">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-100">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
