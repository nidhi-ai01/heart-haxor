'use client';

import React from 'react';
import clsx from 'clsx';
import { tokens } from '@/theme/tokens';

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
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          {...props}
          className={clsx(
            'w-full px-4 py-3 rounded-xl border-2 transition-all duration-300',
            'bg-white dark:bg-slate-800',
            'text-gray-900 dark:text-gray-100',
            'placeholder-gray-500 dark:placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-violet-400/50 dark:focus:ring-violet-500/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon && 'pl-12',
            rightIcon && 'pr-12',
            error
              ? 'border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-600'
              : success
              ? 'border-emerald-300 dark:border-emerald-700 focus:border-emerald-500'
              : 'border-gray-300 dark:border-gray-600 focus:border-violet-400',
            tokens.transitions.normal,
            className
          )}
        />

        {rightIcon && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18.101 12.93a1 1 0 00-1.414-1.414L10 14.586l-6.687-6.687a1 1 0 00-1.414 1.414l8.1 8.1a1 1 0 001.414 0l9.1-9.1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {success && !error && (
        <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Valid
        </p>
      )}

      {helpText && !error && (
        <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">{helpText}</p>
      )}
    </div>
  );
}
