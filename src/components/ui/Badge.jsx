import React from 'react';

const BASE_CONTAINER = "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold";
const BASE_DOT = "w-1.5 h-1.5 rounded-full flex-shrink-0";

const CONFIG = {
  success: {
    style:    { background: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-border)' },
    dotStyle: { background: 'var(--success-text)', boxShadow: '0 0 4px var(--success-border)' }
  },
  warning: {
    style:    { background: 'var(--warning-bg)', color: 'var(--warning-text)', border: '1px solid var(--warning-border)' },
    dotStyle: { background: 'var(--warning-text)', boxShadow: '0 0 4px var(--warning-border)' }
  },
  amber: {
    style:    { background: 'var(--warning-bg)', color: 'var(--warning-text)', border: '1px solid var(--warning-border)' },
    dotStyle: { background: 'var(--warning-text)', boxShadow: '0 0 4px var(--warning-border)' }
  },
  danger: {
    style:    { background: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)' },
    dotStyle: { background: 'var(--danger-text)', boxShadow: '0 0 4px var(--danger-border)' }
  },
  info: {
    style:    { background: 'var(--info-bg)', color: 'var(--info-text)', border: '1px solid var(--info-border)' },
    dotStyle: { background: 'var(--info-text)', boxShadow: '0 0 4px var(--info-border)' }
  },
  neutral: {
    style:    { background: 'var(--bg-sunken)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' },
    dotStyle: { background: 'var(--text-muted)' }
  },
};

export default function Badge({ variant = 'neutral', children, className = '' }) {
  const cfg = CONFIG[variant] || CONFIG.neutral;

  return (
    <span className={`${BASE_CONTAINER} ${className}`} style={cfg.style}>
      <span className={BASE_DOT} style={cfg.dotStyle} />
      {children}
    </span>
  );
}
