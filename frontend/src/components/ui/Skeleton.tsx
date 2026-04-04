'use client';

import React from 'react';
import clsx from 'clsx';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  count?: number;
  circle?: boolean;
}

export default function Skeleton({
  className,
  count = 1,
  circle = false,
  ...props
}: SkeletonProps) {
  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, i) => (
        <div
          key={i}
          {...props}
          className={clsx(
            'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700',
            'animate-pulse',
            circle && 'rounded-full',
            !circle && 'rounded-lg',
            'mb-4 last:mb-0',
            className
          )}
        />
      ))}
    </>
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border border-white/60 dark:border-slate-700/50">
      <Skeleton className="h-12 w-12 rounded-full mb-4" circle />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

export function SkeletonFormField() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function SkeletonAvatar() {
  return <Skeleton className="h-10 w-10 rounded-full" circle />;
}
