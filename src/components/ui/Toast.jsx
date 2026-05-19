import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, X, Info } from 'lucide-react';

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-500',
    borderLeft: '3px solid #10b981', // emerald-500
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-400',
    borderLeft: '3px solid #fbbf24', // amber-400
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-500',
    borderLeft: '3px solid #3b82f6', // blue-500
  },
};

export default function Toast({ visible, title, message, variant = 'success', onDismiss }) {
  const [hoverClose, setHoverClose] = useState(false);
  
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onDismiss?.(), 4000);
    return () => clearTimeout(t);
  }, [visible, title, message, onDismiss]);

  if (!visible) return null;

  const v = VARIANTS[variant] || VARIANTS.success;
  const Icon = v.icon;

  return (
    <div className="fixed bottom-6 right-6 z-[100] pointer-events-none">
      <div
        className="pointer-events-auto flex items-start gap-3 rounded-xl px-4 py-3.5 min-w-[300px] max-w-sm animate-fade-in"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderLeft: v.borderLeft,
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div className="mt-0.5 shrink-0">
          <Icon size={16} className={v.iconClass} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</p>
          {message && <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{message}</p>}
        </div>
        <button
          onClick={onDismiss}
          onMouseEnter={() => setHoverClose(true)}
          onMouseLeave={() => setHoverClose(false)}
          className="shrink-0 mt-0.5 transition-colors duration-150"
          style={{ color: hoverClose ? 'var(--text-primary)' : 'var(--text-muted)' }}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
