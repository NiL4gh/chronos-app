import React from 'react';

const CONFIG = {
  success: {
    container: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60",
    dot: "w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 shadow-[0_0_4px_rgba(16,185,129,0.4)]"
  },
  warning: {
    container: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60",
    dot: "w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 shadow-[0_0_4px_rgba(245,158,11,0.4)]"
  },
  amber: {
    container: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60",
    dot: "w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 shadow-[0_0_4px_rgba(245,158,11,0.4)]"
  },
  danger: {
    container: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200/60",
    dot: "w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 shadow-[0_0_4px_rgba(239,68,68,0.4)]"
  },
  info: {
    container: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200/60",
    dot: "w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0 shadow-[0_0_4px_rgba(14,165,233,0.4)]"
  },
  neutral: {
    container: "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-sunken)] border border-[var(--border-default)]",
    dot: "w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] flex-shrink-0"
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
