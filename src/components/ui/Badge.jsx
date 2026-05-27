import React from 'react';

const CONFIG = {
  success: {
    container: "inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700",
    dot: "w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"
  },
  warning: {
    container: "inline-flex items-center gap-1.5 text-xs font-medium text-amber-700",
    dot: "w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"
  },
  amber: {
    container: "inline-flex items-center gap-1.5 text-xs font-medium text-amber-700",
    dot: "w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"
  },
  danger: {
    container: "inline-flex items-center gap-1.5 text-xs font-medium text-red-600",
    dot: "w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0"
  },
  info: {
    container: "inline-flex items-center gap-1.5 text-xs font-medium text-sky-700",
    dot: "w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0"
  },
  neutral: {
    container: "inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]",
    dot: "w-1.5 h-1.5 rounded-full bg-[var(--border-strong)] flex-shrink-0"
  }
};

export default function Badge({ variant = 'neutral', children, className = '' }) {
  const config = CONFIG[variant] || CONFIG.neutral;

  return (
    <span className={`${config.container} ${className}`}>
      <span className={config.dot} />
      {children}
    </span>
  );
}
