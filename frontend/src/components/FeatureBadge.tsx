"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";
import type { LucideIcon } from "lucide-react";

type FeatureBadgeProps = {
  icon: LucideIcon;
  label: string;
  className?: string;
};

export default function FeatureBadge({ icon: Icon, label, className }: FeatureBadgeProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={clsx(
        "flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-slate-200 shadow-sm backdrop-blur-md",
        "hover:border-white/15 hover:bg-white/[0.09]",
        className
      )}
    >
      <Icon className="h-4 w-4 text-sky-300/90" aria-hidden />
      <span>{label}</span>
    </motion.div>
  );
}
