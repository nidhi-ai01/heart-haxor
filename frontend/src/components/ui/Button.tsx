'use client';

import React from 'react';
import clsx from 'clsx';
import { tokens } from '@/theme/tokens';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variantClasses = {
    primary: `bg-gradient-to-r ${tokens.colors.primary.base} hover:${tokens.colors.primary.hover} ${tokens.colors.primary.dark} text-white font-semibold ${tokens.shadows.md} hover:${tokens.shadows.hover}`,
    secondary: `bg-gradient-to-r ${tokens.colors.secondary.base} hover:${tokens.colors.secondary.hover} ${tokens.colors.secondary.dark} text-white font-semibold ${tokens.shadows.md} hover:${tokens.shadows.hover}`,
    danger: `bg-gradient-to-r ${tokens.colors.danger.base} hover:${tokens.colors.danger.hover} ${tokens.colors.danger.dark} text-white font-semibold ${tokens.shadows.md} hover:${tokens.shadows.hover}`,
    success: `bg-gradient-to-r ${tokens.colors.success.base} hover:${tokens.colors.success.hover} ${tokens.colors.success.dark} text-white font-semibold ${tokens.shadows.md} hover:${tokens.shadows.hover}`,
    ghost: 'bg-transparent hover:bg-purple-100/60 dark:hover:bg-purple-900/40 text-gray-700 dark:text-gray-300 font-semibold',
    outline: 'border-2 border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-semibold',
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        'font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && 'w-full',
        loading && 'opacity-75 cursor-wait',
        className
      )}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
