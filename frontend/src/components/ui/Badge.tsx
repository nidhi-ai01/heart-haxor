'use client';

import React from 'react';
import clsx from 'clsx';

type BadgeVariant = 'friend' | 'mentor' | 'partner' | 'success' | 'warning' | 'error';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  friend: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700/50',
  mentor: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50',
  partner: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-700/50',
  success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/50',
  warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50',
  error: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700/50',
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs font-semibold',
  md: 'px-3 py-1.5 text-sm font-semibold',
  lg: 'px-4 py-2 text-base font-semibold',
};

export default function Badge({
  variant = 'success',
  size = 'md',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={clsx(
        'inline-block rounded-full transition-all duration-300',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
}
