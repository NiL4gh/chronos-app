import React from 'react';

const VARIANTS = {
  success: { background: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-border)' },
  warning: { background: 'var(--warning-bg)', color: 'var(--warning-text)', border: '1px solid var(--warning-border)' },
  danger: { background: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)' },
  info: { background: 'var(--info-bg)', color: 'var(--info-text)', border: '1px solid var(--info-border)' },
  neutral: { background: 'var(--bg-sunken)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' },
  amber: { background: 'var(--accent-subtle)', color: 'var(--accent-text)', border: '1px solid var(--accent-border)' },
};

export default function Badge({ variant = 'neutral', children, className = '' }) {
  const style = VARIANTS[variant] || VARIANTS.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
