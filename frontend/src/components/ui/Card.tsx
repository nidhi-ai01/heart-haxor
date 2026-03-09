'use client';

import React from 'react';
import clsx from 'clsx';
import { tokens } from '@/theme/tokens';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'flat' | 'outlined';
  hoverable?: boolean;
  children: React.ReactNode;
}

export default function Card({
  variant = 'elevated',
  hoverable = true,
  className,
  children,
  ...props
}: CardProps) {
  const variantClasses = {
    elevated: `bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/60 dark:border-slate-700/50 ${tokens.shadows.lg}`,
    flat: 'bg-white/50 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/30',
    outlined: 'bg-transparent border-2 border-purple-300 dark:border-purple-700/50',
  };

  return (
    <div
      {...props}
      className={clsx(
        'rounded-2xl p-6 transition-all duration-300',
        variantClasses[variant],
        hoverable && `hover:${tokens.shadows.hover} hover:scale-105`,
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
    <div {...props} className={clsx('mb-4 pb-4 border-b border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div {...props} className={clsx('mt-4 pt-4 border-t border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  );
}
