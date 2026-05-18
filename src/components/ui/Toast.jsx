import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X, Info } from 'lucide-react';

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-300',
    ringClass: 'bg-emerald-400/10 border-emerald-400/20',
    barClass: 'bg-emerald-400',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-yellow-300',
    ringClass: 'bg-yellow-400/10 border-yellow-400/20',
    barClass: 'bg-yellow-400',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-300',
    ringClass: 'bg-blue-400/10 border-blue-400/20',
    barClass: 'bg-blue-400',
  },
};

export default function Toast({ visible, title, message, variant = 'success', onDismiss }) {
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
        className="pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3.5 min-w-[300px] max-w-sm animate-slide-up"
        style={{
          background: 'rgba(42, 34, 26, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-interactive)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.40), 0 0 24px rgba(245,158,11,0.08)',
        }}
      >
        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${v.ringClass}`}>
          <Icon size={11} className={v.iconClass} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
          {message && <p className="text-xs mt-0.5 text-[var(--text-muted)]">{message}</p>}
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 mt-0.5 transition-colors duration-150 hover:text-[var(--text-primary)]"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl overflow-hidden">
          <div
            className={`h-full ${v.barClass} opacity-40`}
            style={{ animation: 'shrink-bar 4s linear forwards' }}
          />
        </div>
      </div>
    </div>
  );
}
