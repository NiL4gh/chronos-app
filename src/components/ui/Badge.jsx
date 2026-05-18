import React from 'react';

const VARIANTS = {
  success: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  warning: 'bg-yellow-400/10 text-yellow-300 border-yellow-400/20',
  danger:  'bg-red-400/10 text-red-300 border-red-400/20',
  info:    'bg-blue-400/10 text-blue-300 border-blue-400/20',
  neutral: 'bg-white/5 border-white/10',
  accent:  'bg-amber-400/10 text-amber-300 border-amber-400/20',
};

export default function Badge({ variant = 'neutral', children, className = '' }) {
  const variantClass = VARIANTS[variant] || VARIANTS.neutral;
  const textClass = variant === 'neutral' ? 'text-[var(--text-muted)]' : '';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border ${variantClass} ${textClass} ${className}`}
    >
      {children}
    </span>
  );
}
