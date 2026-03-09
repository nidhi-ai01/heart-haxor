'use client';

import React, { useEffect } from 'react';
import clsx from 'clsx';
import { useToast, type Toast, type ToastType } from '@/context/ToastContext';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const toastStyles: Record<ToastType, { bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800/50',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800/50',
    icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800/50',
    icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800/50',
    icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
  },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  const style = toastStyles[toast.type];

  return (
    <div
      className={clsx(
        'flex gap-3 items-start p-4 rounded-lg border',
        'animate-fadeIn transition-all duration-300',
        style.bg,
        style.border,
        'shadow-lg shadow-purple-300/20 dark:shadow-purple-900/20'
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
      <div className="flex-1">
        <p
          className={clsx(
            'text-sm font-medium',
            toast.type === 'success' && 'text-emerald-700 dark:text-emerald-300',
            toast.type === 'error' && 'text-red-700 dark:text-red-300',
            toast.type === 'warning' && 'text-amber-700 dark:text-amber-300',
            toast.type === 'info' && 'text-blue-700 dark:text-blue-300'
          )}
        >
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        aria-label="Dismiss toast"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-auto max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
