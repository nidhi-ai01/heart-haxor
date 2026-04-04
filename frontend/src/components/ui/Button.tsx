"use client";

import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const sizeClasses = {
  sm: "h-10 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-6 text-base",
};

const variantClasses = {
  primary:
    "bg-slate-900 text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)] hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100",
  secondary:
    "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_14px_30px_rgba(37,99,235,0.24)] hover:from-blue-700 hover:to-cyan-600",
  danger:
    "bg-rose-600 text-white shadow-[0_14px_30px_rgba(225,29,72,0.24)] hover:bg-rose-700",
  success:
    "bg-emerald-600 text-white shadow-[0_14px_30px_rgba(5,150,105,0.24)] hover:bg-emerald-700",
  ghost:
    "bg-transparent text-slate-700 hover:bg-white/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white",
  outline:
    "border border-slate-200 bg-white/70 text-slate-800 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10",
};

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-60",
        "hover:-translate-y-0.5 active:translate-y-0",
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        className
      )}
    >
      {loading ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
            <path
              d="M22 12a10 10 0 0 0-10-10"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
