"use client";

import React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "elevated" | "flat" | "outlined";
  hoverable?: boolean;
  children: React.ReactNode;
}

export default function Card({
  variant = "elevated",
  hoverable = false,
  className,
  children,
  ...props
}: CardProps) {
  const variantClasses = {
    elevated:
      "app-panel rounded-[2rem] border border-white/45 bg-white/72 shadow-[0_24px_70px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-[rgba(8,17,31,0.74)]",
    flat:
      "rounded-[1.75rem] border border-slate-200/70 bg-white/65 backdrop-blur-xl dark:border-white/10 dark:bg-white/5",
    outlined:
      "rounded-[1.75rem] border border-slate-200/80 bg-transparent backdrop-blur-sm dark:border-white/10",
  };

  return (
    <div
      {...props}
      className={clsx(
        "p-6 md:p-8 transition-all duration-300 ease-in-out",
        variantClasses[variant],
        hoverable && "hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      {...props}
      className={clsx("mb-5 border-b border-slate-200/70 pb-5 dark:border-white/10", className)}
    >
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      {...props}
      className={clsx("mt-5 border-t border-slate-200/70 pt-5 dark:border-white/10", className)}
    >
      {children}
    </div>
  );
}
