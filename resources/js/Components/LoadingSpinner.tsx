import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'white' | 'primary' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate';
  className?: string;
}

export default function LoadingSpinner({
  size = 'sm',
  color = 'white',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3 border-[1.5px]',
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-3',
  };

  const colorClasses = {
    white: 'border-white/30 border-t-white',
    primary: 'border-orange-500/30 border-t-orange-600 dark:border-orange-400/30 dark:border-t-orange-400',
    emerald: 'border-emerald-500/30 border-t-emerald-600 dark:border-emerald-400/30 dark:border-t-emerald-400',
    amber: 'border-amber-500/30 border-t-amber-600 dark:border-amber-400/30 dark:border-t-amber-400',
    rose: 'border-rose-500/30 border-t-rose-600 dark:border-rose-400/30 dark:border-t-rose-400',
    indigo: 'border-indigo-500/30 border-t-indigo-600 dark:border-indigo-400/30 dark:border-t-indigo-400',
    slate: 'border-slate-400/30 border-t-slate-700 dark:border-slate-600/30 dark:border-t-slate-200',
  };

  return (
    <span
      className={`inline-block shrink-0 rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading..."
    />
  );
}
