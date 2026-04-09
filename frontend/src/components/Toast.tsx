"use client";

import React, { useEffect } from "react";
import clsx from "clsx";
import { useToast, type Toast, type ToastType } from "@/context/ToastContext";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

const toastStyles: Record<
  ToastType,
  { icon: React.ReactNode; tone: string; panel: string }
> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />,
    tone: "text-emerald-800 dark:text-emerald-200",
    panel: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10",
  },
  error: {
    icon: <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-300" />,
    tone: "text-rose-800 dark:text-rose-200",
    panel: "border-rose-200 bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/10",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-300" />,
    tone: "text-amber-800 dark:text-amber-200",
    panel: "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10",
  },
  info: {
    icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-300" />,
    tone: "text-blue-800 dark:text-blue-200",
    panel: "border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10",
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    if (!toast.duration) return;
    const timer = setTimeout(() => onRemove(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const style = toastStyles[toast.type];

  return (
    <div
      className={clsx(
        "flex items-start gap-3 rounded-[1.5rem] border px-4 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.1)] backdrop-blur-xl",
        "animate-[slideIn_0.24s_ease-out]",
        style.panel
      )}
    >
      <div className="mt-0.5">{style.icon}</div>
      <div className="flex-1">
        <p className={clsx("text-sm font-semibold", style.tone)}>{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="rounded-full p-1 text-slate-500 hover:bg-white/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100"
        aria-label="Dismiss toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-md flex-col gap-3 sm:right-6 sm:top-6 sm:w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
