import React from 'react';

const VARIANTS = {
  success: "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium bg-[var(--bg-active)] text-emerald-700 border border-[var(--border-default)]",
  warning: "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium bg-[var(--bg-active)] text-amber-700 border border-[var(--border-default)]",
  danger: "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium bg-[var(--bg-active)] text-red-600 border border-[var(--border-default)]",
  info: "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium bg-[var(--bg-active)] text-sky-700 border border-[var(--border-default)]",
  neutral: "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium bg-[var(--bg-active)] text-[var(--text-secondary)] border border-[var(--border-default)]",
  amber: "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium bg-[var(--bg-active)] text-amber-700 border border-[var(--border-default)]",
};

export default function Badge({ variant = 'neutral', children, className = '' }) {
  const variantClass = VARIANTS[variant] || VARIANTS.neutral;

  return (
    <span className={`${variantClass} ${className}`}>
      {children}
    </span>
  );
}
