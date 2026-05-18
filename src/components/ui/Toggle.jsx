import React from 'react';

const SIZES = {
  sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 'translate-x-4' },
  md: { track: 'w-11 h-6', thumb: 'w-4 h-4', translate: 'translate-x-5' },
  lg: { track: 'w-14 h-7', thumb: 'w-5 h-5', translate: 'translate-x-7' },
};

export default function Toggle({
  checked = false,
  onChange,
  label,
  description,
  size = 'md',
  disabled = false,
}) {
  const s = SIZES[size] || SIZES.md;

  return (
    <label className={`flex items-start gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={[
          s.track,
          'relative rounded-full shrink-0 mt-0.5',
          'transition-all duration-200',
          'focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:ring-offset-1',
          checked
            ? 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
            : 'bg-white/10 border border-[var(--border-default)]',
        ].join(' ')}
      >
        <span
          className={[
            s.thumb,
            'absolute top-1/2 -translate-y-1/2 left-1 rounded-full transition-transform duration-200',
            checked ? `${s.translate} bg-neutral-950` : 'bg-[var(--text-muted)]',
          ].join(' ')}
        />
      </button>

      {(label || description) && (
        <div>
          {label && (
            <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">{label}</p>
          )}
          {description && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-snug">{description}</p>
          )}
        </div>
      )}
    </label>
  );
}
