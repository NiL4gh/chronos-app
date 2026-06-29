import React from 'react';
import { Cpu, PenLine } from 'lucide-react';

export default function TrackingSourceBadge({ source = 'manual' }) {
  if (source === 'auto') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide"
        style={{ background: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--success-border)' }}
      >
        <Cpu size={10} />
        Auto
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide"
      style={{ background: 'var(--bg-sunken)', color: 'var(--text-secondary)', border: '1px solid var(--border-strong)' }}
    >
      <PenLine size={10} />
      Manual
    </span>
  );
}
