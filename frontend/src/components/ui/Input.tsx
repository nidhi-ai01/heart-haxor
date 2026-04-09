"use client";

import React from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  helpText?: string;
}

export default function Input({
  label,
  error,
  success = false,
  leftIcon,
  rightIcon,
  helpText,
  className,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          {...props}
          className={clsx(
            "w-full rounded-2xl border bg-white/80 px-4 py-3.5 text-sm text-slate-900 outline-none backdrop-blur-xl",
            "placeholder:text-slate-400 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500",
            "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:focus:border-blue-400",
            leftIcon && "pl-12",
            rightIcon && "pr-12",
            error && "border-rose-300 focus:border-rose-400 focus:ring-rose-500/10 dark:border-rose-500/30",
            success &&
              !error &&
              "border-emerald-300 focus:border-emerald-400 focus:ring-emerald-500/10 dark:border-emerald-500/30",
            "disabled:cursor-not-allowed disabled:opacity-60",
            className
          )}
        />

        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}
      {helpText && !error && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{helpText}</p>
      )}
    </div>
  );
}
